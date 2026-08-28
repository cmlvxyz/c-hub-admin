import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';

const app = express();
const PORT = 3014;

app.use(express.json());

// ============ DATA STORE ============
export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  subCategory: string;
  brand: string;
  price: number;
  costPrice: number;
  stock: number;
  reservedStock: number;
  lowStockThreshold: number;
  reorderPoint: number;
  reorderQty: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Discontinued';
  image: string;
  sizes: string[];
  colors: string[];
  channelSync: {
    web: boolean;
    shopee: boolean;
    lazada: boolean;
    tiktok: boolean;
  };
  supplier: {
    name: string;
    contact: string;
    leadTimeDays: number;
  };
  salesVelocity7d: number;
  updatedAt: string;
}

export type OrderStatus =
  | 'To Pay'
  | 'To Ship'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'To Review'
  | 'Completed'
  | 'Cancelled'
  | 'Refunded';

export type PaymentMethod =
  | 'GCash'
  | 'Maya'
  | 'Credit/Debit Card (Visa/Mastercard)'
  | 'Cash on Delivery (COD)'
  | 'BPI/BDO Bank Transfer'
  | 'Billease BNPL'
  | 'ShopeePay';

export interface OrderItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number;
  costPrice: number;
  qty: number;
  image: string;
  size?: string;
  color?: string;
  subCategory?: string;
}

export interface CustomerDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  tier: 'VIP' | 'Platinum' | 'Gold' | 'Standard';
  totalOrders: number;
  totalSpent: number;
}

export interface Order {
  orderId: string;
  orderNumber: string;
  date: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  discountCode: string;
  tax: number;
  total: number;
  costTotal: number;
  payment: {
    method: PaymentMethod;
    status: 'Paid' | 'Pending' | 'Authorized' | 'Failed' | 'Refunded';
    transactionId: string;
    paidAt?: string;
    fee: number;
  };
  status: OrderStatus;
  fulfillment: {
    carrier: 'J&T Express' | 'Ninja Van' | 'Lalamove' | 'Flash Express' | 'DHL Express' | 'Store Courier';
    trackingNumber: string;
    estimatedDelivery: string;
    shippedAt?: string;
    deliveredAt?: string;
    timeline: Array<{
      status: string;
      time: string;
      location: string;
      note: string;
      completed: boolean;
    }>;
  };
  channel: 'Online Store' | 'TikTok Shop' | 'Shopee' | 'Lazada' | 'In-Store POS';
  review?: {
    rating: number;
    comment: string;
    date: string;
  };
  notes?: string;
  tags?: string[];
  updatedAt: string;
}

// ============ FILE STORAGE ============
const ORDERS_FILE = path.join(process.cwd(), 'orders.json');
const PRODUCTS_FILE = path.join(process.cwd(), 'products.json');

// ✅ Load products from file or use default
function loadProductsFromFile(): Product[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load products from file:', error);
  }
  return getDefaultProducts();
}

// ✅ Save products to file
function saveProductsToFile(productsData: Product[]) {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(productsData, null, 2));
    console.log(`💾 Saved ${productsData.length} products to file`);
  } catch (error) {
    console.error('Failed to save products to file:', error);
  }
}

// ✅ Load orders from file
function loadOrdersFromFile(): Order[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load orders from file:', error);
  }
  return [];
}

// ✅ Save orders to file
function saveOrdersToFile(ordersData: Order[]) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(ordersData, null, 2));
    console.log(`💾 Saved ${ordersData.length} orders to file`);
  } catch (error) {
    console.error('Failed to save orders to file:', error);
  }
}

// ✅ Default products
function getDefaultProducts(): Product[] {
  return [
    {
      id: 'prod-001',
      sku: 'CHUB-HD-001',
      barcode: '480651234001',
      name: 'C-HUB Signature Heavyweight Hoodie',
      category: 'Apparel',
      subCategory: 'Hoodies & Sweats',
      brand: 'C-HUB Originals',
      price: 1850,
      costPrice: 920,
      stock: 45,
      reservedStock: 2,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: 'In Stock',
      image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80',
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      colors: ['Onyx Black', 'Heather Ash', 'Forest Green'],
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: 'Metro Garments Corp.', contact: 'supply@metrogarments.ph', leadTimeDays: 5 },
      salesVelocity7d: 14,
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-002',
      sku: 'CHUB-CG-002',
      barcode: '480651234002',
      name: 'C-HUB Tactical Utility Cargo Pants',
      category: 'Apparel',
      subCategory: 'Bottoms',
      brand: 'C-HUB Street',
      price: 1650,
      costPrice: 780,
      stock: 28,
      reservedStock: 4,
      lowStockThreshold: 8,
      reorderPoint: 12,
      reorderQty: 40,
      status: 'In Stock',
      image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=500&auto=format&fit=crop&q=80',
      sizes: ['28', '30', '32', '34', '36'],
      colors: ['Khaki Slate', 'Midnight Black', 'Military Olive'],
      channelSync: { web: true, shopee: true, lazada: true, tiktok: false },
      supplier: { name: 'Apex Textile Works', contact: 'sales@apextextile.ph', leadTimeDays: 7 },
      salesVelocity7d: 18,
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-003',
      sku: 'CHUB-TEE-003',
      barcode: '480651234003',
      name: 'C-HUB Acid Wash Boxy Oversized Tee',
      category: 'Apparel',
      subCategory: 'T-Shirts',
      brand: 'C-HUB Originals',
      price: 850,
      costPrice: 380,
      stock: 32,
      reservedStock: 1,
      lowStockThreshold: 12,
      reorderPoint: 20,
      reorderQty: 80,
      status: 'In Stock',
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80',
      sizes: ['M', 'L', 'XL'],
      colors: ['Vintage Charcoal', 'Washed Mocha', 'Bleached Stone'],
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: 'Metro Garments Corp.', contact: 'supply@metrogarments.ph', leadTimeDays: 5 },
      salesVelocity7d: 22,
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-004',
      sku: 'CHUB-SNK-004',
      barcode: '480651234004',
      name: 'C-HUB Alpha Pro Retro Sneaker',
      category: 'Footwear',
      subCategory: 'Sneakers',
      brand: 'C-HUB Kicks',
      price: 3450,
      costPrice: 1750,
      stock: 16,
      reservedStock: 3,
      lowStockThreshold: 6,
      reorderPoint: 10,
      reorderQty: 30,
      status: 'In Stock',
      image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500&auto=format&fit=crop&q=80',
      sizes: ['US 8', 'US 9', 'US 10', 'US 11'],
      colors: ['Cloud White / Crimson', 'Panda Monocrome'],
      channelSync: { web: true, shopee: false, lazada: true, tiktok: true },
      supplier: { name: 'Kicks Craft Footwear', contact: 'orders@kickscraft.com', leadTimeDays: 10 },
      salesVelocity7d: 9,
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prod-005',
      sku: 'CHUB-BAG-005',
      barcode: '480651234005',
      name: 'C-HUB Modular Cordura Crossbody Bag',
      category: 'Accessories',
      subCategory: 'Bags & Packs',
      brand: 'C-HUB Gear',
      price: 1150,
      costPrice: 480,
      stock: 45,
      reservedStock: 2,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: 'In Stock',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80',
      sizes: ['One Size'],
      colors: ['Stealth Black', 'Coyote Tan'],
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: 'Urban Pack Industries', contact: 'b2b@urbanpack.ph', leadTimeDays: 4 },
      salesVelocity7d: 12,
      updatedAt: new Date().toISOString()
    }
  ];
}

// ============ INIT DATA ============
let products: Product[] = loadProductsFromFile();
let orders: Order[] = loadOrdersFromFile();

// ✅ Function to enrich order items with product images
function enrichOrdersWithProductImages(ordersData: Order[]): Order[] {
  return ordersData.map(order => ({
    ...order,
    items: order.items.map(item => {
      // Hanapin ang product sa products array gamit ang productId
      const product = products.find(p => p.id === item.productId);
      if (product && product.image) {
        return { ...item, image: product.image };
      }
      // Kung walang productId, subukan gamit ang SKU
      if (!product) {
        const productBySku = products.find(p => p.sku === item.sku);
        if (productBySku && productBySku.image) {
          return { ...item, image: productBySku.image };
        }
      }
      return item;
    })
  }));
}

// ============ SSE SETUP ============
interface SSEClient {
  id: number;
  res: express.Response;
}
let sseClients: SSEClient[] = [];

function broadcastSSE(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(payload);
    } catch {
      // client disconnected
    }
  });
}

// ============ API ROUTES ============

// ✅ SYNC ORDERS FROM CLIENT
app.post('/api/orders/sync', (req, res) => {
  try {
    const { orders: clientOrders } = req.body;
    if (Array.isArray(clientOrders)) {
      // I-enrich ang orders ng product images
      const enrichedOrders = enrichOrdersWithProductImages(clientOrders);
      
      // I-merge ang orders
      const existingIds = new Set(orders.map(o => o.orderId));
      
      enrichedOrders.forEach((clientOrder: Order) => {
        if (!existingIds.has(clientOrder.orderId)) {
          orders.push(clientOrder);
          existingIds.add(clientOrder.orderId);
        } else {
          const index = orders.findIndex(o => o.orderId === clientOrder.orderId);
          if (index !== -1) {
            orders[index] = { ...orders[index], ...clientOrder };
          }
        }
      });
      
      // ✅ I-save sa file
      saveOrdersToFile(orders);
      
      console.log(`🔄 Synced ${orders.length} total orders from client`);
      broadcastSSE('order_sync', { count: orders.length });
      res.json({ success: true, count: orders.length });
    } else {
      res.status(400).json({ error: 'Invalid orders data' });
    }
  } catch (error) {
    console.error('Failed to sync orders:', error);
    res.status(500).json({ error: 'Failed to sync orders' });
  }
});

// Orders
app.get('/api/orders', (req, res) => {
  // ✅ I-enrich ang orders ng product images bago i-send
  const enrichedOrders = enrichOrdersWithProductImages(orders);
  res.json(enrichedOrders);
});

app.post('/api/orders', (req, res) => {
  const newOrder: Order = {
    ...req.body,
    orderId: req.body.orderId || `CHUB-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    orderNumber: `${Math.floor(8900 + orders.length + 1)}`,
    date: req.body.date || new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
    updatedAt: new Date().toISOString()
  };

  // ✅ I-enrich ang items ng product images
  const enrichedItems = newOrder.items.map(item => {
    const product = products.find(p => p.id === item.productId);
    if (product && product.image) {
      return { ...item, image: product.image };
    }
    return item;
  });
  newOrder.items = enrichedItems;

  const exists = orders.some(o => o.orderId === newOrder.orderId);
  if (!exists) {
    orders.unshift(newOrder);
    saveOrdersToFile(orders);
    broadcastSSE('new_order', newOrder);
    broadcastSSE('inventory_sync', products);
    console.log(`📦 New order added: ${newOrder.orderId}`);
  }

  res.status(201).json({ success: true, order: newOrder });
});

app.patch('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const index = orders.findIndex(o => o.orderId === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  orders[index] = {
    ...orders[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  // ✅ I-enrich ang items ng product images
  orders[index].items = orders[index].items.map(item => {
    const product = products.find(p => p.id === item.productId);
    if (product && product.image) {
      return { ...item, image: product.image };
    }
    return item;
  });

  saveOrdersToFile(orders);
  broadcastSSE('order_update', { 
    orderId: id, 
    status: orders[index].status, 
    order: orders[index] 
  });
  
  res.json({ success: true, order: orders[index] });
});

app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const index = orders.findIndex(o => o.orderId === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const deletedOrder = orders[index];
  orders.splice(index, 1);
  saveOrdersToFile(orders);
  broadcastSSE('order_deleted', { orderId: id });
  console.log(`🗑️ Order deleted: ${id}`);
  
  res.json({ success: true, order: deletedOrder });
});

// Products
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const newProduct: Product = {
    ...req.body,
    id: req.body.id || `prod-${Date.now()}`,
    updatedAt: new Date().toISOString()
  };
  products.push(newProduct);
  saveProductsToFile(products);
  broadcastSSE('inventory_sync', products);
  res.status(201).json({ success: true, product: newProduct });
});

app.patch('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products[index] = {
    ...products[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  saveProductsToFile(products);
  broadcastSSE('inventory_sync', products);
  res.json({ success: true, product: products[index] });
});

// ... rest of the endpoints (alerts, gateways, reviews, analytics, purchase-orders) remain the same ...

// ============ SSE ENDPOINT ============
app.get('/api/orders/stream/public', (req, res) => {
  console.log('🔌 SSE client connected');
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient: SSEClient = { id: clientId, res };
  sseClients.push(newClient);

  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', clientsCount: sseClients.length })}\n\n`);

  console.log(`📡 SSE clients: ${sseClients.length}`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
    console.log(`🔌 SSE client disconnected. Clients: ${sseClients.length}`);
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    orders: orders.length,
    products: products.length
  });
});

// ============ START SERVER ============
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 C-HUB Enterprise Admin Server running on http://localhost:${PORT}`);
    console.log(`   🔌 SSE: http://localhost:${PORT}/api/orders/stream/public`);
    console.log(`   📦 Orders sync endpoint: POST /api/orders/sync`);
  });
}

startServer();