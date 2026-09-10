import 'dotenv/config';
import express from 'express';
import { createClient } from '@libsql/client';
import cors from 'cors';
import crypto from 'crypto';

const app = express();
app.use(cors());
app.use(express.json());

const turso = createClient({
  url: process.env.DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// SSE client registry + broadcast (used to push order deletes to open tabs)
const sseClients = [];
function broadcast(event, data) {
  sseClients.forEach((client) => {
    try {
      client.res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    } catch (e) {
      console.error('SSE broadcast error:', e?.message || e);
    }
  });
}

// ────────────────────────────────────────────────────────────────────────
// Row mappers — identical to c-hub-store/server/db.ts (shared schema).
// The deploy must return PARSED JSON columns, otherwise the admin UI
// crashes with "(order.items || []).map is not a function".
// ────────────────────────────────────────────────────────────────────────
function safeParse(value, fallback) {
  if (value == null || value === '') return fallback;
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return fallback;
  }
}

function mapOrderRow(r) {
  return {
    orderId: r.order_id,
    orderNumber: r.order_number || '',
    date: r.date || '',
    status: r.status || 'Pending',
    customer: safeParse(r.customer, null),
    items: safeParse(r.items, []),
    subtotal: Number(r.subtotal) || 0,
    shipping: Number(r.shipping) || 0,
    discount: Number(r.discount) || 0,
    discountCode: r.discount_code || '',
    total: Number(r.total) || 0,
    payment: r.payment || 'Cash on Delivery',
    paymentInfo: safeParse(r.payment_info, null),
    fulfillment: safeParse(r.fulfillment, null),
    refund: safeParse(r.refund, null),
    returnRequest: safeParse(r.return_request, null),
    returnRef: safeParse(r.return_ref, null),
    statusHistory: safeParse(r.status_history, []),
    stockRestored: r.stock_restored === 1,
    notes: r.notes || null,
    tags: safeParse(r.tags, null),
    channel: r.channel || 'Online Store',
    createdAt: r.created_at || null,
    updatedAt: r.updated_at || null,
  };
}

// ────────────────────────────────────────────────────────────────────────
// Lightweight HS256 session token (no extra deps). The admin backend does
// not enforce auth (demo), but the frontend requires a token so its 5s
// auto-poll and fetch authorization work.
// ────────────────────────────────────────────────────────────────────────
function signSessionToken(payload) {
  const secret = process.env.JWT_SECRET || 'admin-demo-session-secret';
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const body = Buffer.from(
    JSON.stringify({ ...payload, iat: now, exp: now + 2 * 60 * 60 })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await turso.execute('SELECT 1');
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// Orders (mapped: JSON columns parsed for the admin UI)
app.get('/api/orders', async (req, res) => {
  try {
    const result = await turso.execute('SELECT * FROM orders');
    res.json(result.rows.map(mapOrderRow));
  } catch (error) {
    console.error('Orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Order detail (mapped)
app.get('/api/orders/:id', async (req, res) => {
  try {
    const result = await turso.execute({
      sql: 'SELECT * FROM orders WHERE order_id = ?',
      args: [req.params.id],
    });
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json(mapOrderRow(result.rows[0]));
  } catch (error) {
    console.error('Order detail error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Order status update (mapped)
app.patch('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body || {};
    if (!status || typeof status !== 'string') {
      return res.status(400).json({ error: 'A valid status is required.' });
    }
    const existing = await turso.execute({
      sql: 'SELECT * FROM orders WHERE order_id = ?',
      args: [id],
    });
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    let history = safeParse(existing.rows[0].status_history, []);
    if (!Array.isArray(history)) history = [];
    history.push({
      status,
      note: note || null,
      by: 'admin',
      at: new Date().toISOString(),
    });
    const now = new Date().toISOString();
    await turso.execute({
      sql: 'UPDATE orders SET status = ?, status_history = ?, updated_at = ? WHERE order_id = ?',
      args: [status, JSON.stringify(history), now, id],
    });
    const after = await turso.execute({
      sql: 'SELECT * FROM orders WHERE order_id = ?',
      args: [id],
    });
    res.json(mapOrderRow(after.rows[0]));
  } catch (error) {
    console.error('Order update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Order permanent delete
app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await turso.execute({
      sql: 'SELECT order_id FROM orders WHERE order_id = ?',
      args: [id],
    });
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    await turso.execute({ sql: 'DELETE FROM orders WHERE order_id = ?', args: [id] });
    broadcast('order-deleted', { orderId: id });
    res.json({ success: true, deleted: id });
  } catch (error) {
    console.error('Order delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Auth bootstrap — returns a session token so the admin frontend's
// auto-poll and authorized fetches function correctly.
app.post('/api/auth/admin/bootstrap', async (req, res) => {
  try {
    const email = process.env.ADMIN_EMAIL || 'admin@chubph.com';
    const name = 'C-HUB Admin';
    const token = signSessionToken({ role: 'super_admin', user: { name, email } });
    res.json({
      success: true,
      token,
      role: 'super_admin',
      user: { name, email, role: 'super_admin' },
      message: 'Bootstrap successful',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default app;

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3007;
  app.listen(PORT, () => {
    console.log(`Admin backend running on port ${PORT}`);
  });
}

// SSE: Real-time orders stream
app.get('/api/orders/stream/public', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const client = { id: Date.now(), res };
  sseClients.push(client);

  // Send initial connection message
  res.write('event: connected\ndata: {"event":"connected","message":"SSE stream established"}\n\n');

  // Keep connection alive
  const interval = setInterval(() => {
    res.write(': ping\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(interval);
    const idx = sseClients.findIndex((c) => c.id === client.id);
    if (idx !== -1) sseClients.splice(idx, 1);
    res.end();
  });
});