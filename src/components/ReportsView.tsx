import React, { useState, useMemo } from 'react';
import {
  FileBarChart2,
  Download,
  Printer,
  Calendar,
  Users,
  Package,
  TrendingUp,
  DollarSign,
  PieChart as PieIcon,
  Trophy,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Order, Product } from '../types';
import { formatPHP, exportToCSV } from '../utils';

interface ReportsViewProps {
  orders: Order[];
  products: Product[];
}

type DatePreset = 'today' | '7d' | '30d' | '90d' | 'ytd' | 'custom' | 'all';

const PRESETS: { id: DatePreset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: '90d', label: '90D' },
  { id: 'ytd', label: 'YTD' },
  { id: 'all', label: 'All time' }
];

const CHANNELS = ['Online Store', 'TikTok Shop', 'Shopee', 'Lazada'];

const PIE_COLORS = ['#4f46e5', '#0ea5e9', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6', '#64748b'];
const TREND_BAR = '#4f46e5';
const PROFIT_BAR = '#10b981';

// Order date bilang Date object (ISO updatedAt > humanized date).
const orderDate = (o: Order): Date => {
  const raw = o.updatedAt || o.date;
  const d = raw ? new Date(raw) : new Date(NaN);
  if (!isNaN(d.getTime())) return d;
  // "Aug 31, 2026" fallback
  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? new Date(0) : parsed;
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const isCanceled = (o: Order) => o.status === 'Cancelled';

const fmtDate = (d: Date) =>
  d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

export const ReportsView: React.FC<ReportsViewProps> = ({ orders, products }) => {
  const [datePreset, setDatePreset] = useState<DatePreset>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [channelFilter, setChannelFilter] = useState('all');
  const [groupBy, setGroupBy] = useState<'channel' | 'gateway' | 'category' | 'status'>('channel');

  // ---- Range computation (naaayon sa preset o custom date) ----
  const range = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    let start: Date | null = null;
    let end: Date | null = null;

    if (datePreset === 'custom' && (customFrom || customTo)) {
      if (customFrom) start = startOfDay(new Date(customFrom));
      if (customTo) end = startOfDay(new Date(customTo));
    } else {
      switch (datePreset) {
        case 'today':
          start = startOfDay(now);
          break;
        case '7d':
          start = startOfDay(new Date(now.getTime() - 6 * 86400000));
          break;
        case '30d':
          start = startOfDay(new Date(now.getTime() - 29 * 86400000));
          break;
        case '90d':
          start = startOfDay(new Date(now.getTime() - 89 * 86400000));
          break;
        case 'ytd':
          start = new Date(year, 0, 1);
          break;
        case 'all':
        default:
          start = null;
      }
    }
    return { start, end: end ? startOfDay(end) : startOfDay(now) };
  }, [datePreset, customFrom, customTo]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (isCanceled(o)) return false;
      if (channelFilter !== 'all' && o.channel !== channelFilter) return false;
      const d = orderDate(o);
      if (!range.start) return true;
      if (d < range.start) return false;
      const endLimit = range.end ? new Date(range.end.getTime() + 86399999) : new Date();
      return d <= endLimit;
    });
  }, [orders, channelFilter, range]);

  // ---- KPIs ----
  const totals = useMemo(() => {
    let gross = 0, cost = 0, profit = 0, discounts = 0, shipping = 0, fees = 0;
    filteredOrders.forEach(o => {
      gross += o.total;
      cost += o.costTotal;
      profit += o.total - o.costTotal;
      discounts += o.discount || 0;
      shipping += o.shipping || 0;
      fees += o.payment?.fee || 0;
    });
    const margin = gross > 0 ? (profit / gross) * 100 : 0;
    const aov = filteredOrders.length > 0 ? gross / filteredOrders.length : 0;
    return { gross, cost, profit, discounts, shipping, fees, margin, aov, count: filteredOrders.length };
  }, [filteredOrders]);

  // ---- Daily trend (kung > 45 araw ang window, i-group by linggo) ----
  const trendData = useMemo(() => {
    const map = new Map<string, { label: string; revenue: number; orders: number; profit: number; _k: string }>();
    const weekly = !range.start || (range.end.getTime() - range.start.getTime()) / 86400000 > 45;

    filteredOrders.forEach(o => {
      const d = orderDate(o);
      let key: string;
      if (weekly) {
        const yearStart = new Date(d.getFullYear(), 0, 1);
        const weekIndex = Math.floor((d.getTime() - yearStart.getTime()) / 604800000);
        const weekStart = new Date(yearStart.getFullYear(), 0, 1 + weekIndex * 7);
        key = weekStart.toISOString().slice(0, 10);
      } else {
        key = d.toISOString().slice(0, 10);
      }
      const base: { label: string; revenue: number; orders: number; profit: number; _k: string } =
        map.get(key) || { label: fmtDate(d), revenue: 0, orders: 0, profit: 0, _k: key };
      base.revenue += o.total;
      base.orders += 1;
      base.profit += o.total - o.costTotal;
      base.label = weekly ? `Wk ${fmtDate(new Date(key))}` : fmtDate(new Date(key));
      map.set(key, base);
    });

    return Array.from(map.values()).sort((a, b) => (a._k < b._k ? -1 : 1));
  }, [filteredOrders, range]);

  // ---- Breakdown (dimension) ----
  const breakdown = useMemo(() => {
    const map: Record<string, { name: string; grossSales: number; cost: number; profit: number; ordersCount: number; discounts: number; shipping: number; fees: number }> = {};
    filteredOrders.forEach(order => {
      let key = 'Other';
      if (groupBy === 'channel') key = order.channel || 'Other';
      else if (groupBy === 'gateway') key = order.payment?.method || 'Other';
      else if (groupBy === 'status') key = order.status;
      else if (groupBy === 'category') key = order.items[0]?.subCategory || 'General';

      const row = map[key] || { name: key, grossSales: 0, cost: 0, profit: 0, ordersCount: 0, discounts: 0, shipping: 0, fees: 0 };
      row.grossSales += order.total;
      row.cost += order.costTotal;
      row.profit += order.total - order.costTotal;
      row.ordersCount += 1;
      row.discounts += order.discount || 0;
      row.shipping += order.shipping || 0;
      row.fees += order.payment?.fee || 0;
      map[key] = row;
    });
    return Object.values(map).sort((a, b) => b.grossSales - a.grossSales);
  }, [filteredOrders, groupBy]);

  // ---- Channel share (donut) ----
  const channelShare = useMemo(() => {
    const map = new Map<string, number>();
    filteredOrders.forEach(o => map.set(o.channel || 'Other', (map.get(o.channel || 'Other') || 0) + o.total));
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredOrders]);

  // ---- Top products ----
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; sku: string; qty: number; revenue: number; profit: number; orders: number }>();
    filteredOrders.forEach(o => {
      o.items.forEach(it => {
        const row = map.get(it.productId || it.sku) || { name: it.name, sku: it.sku, qty: 0, revenue: 0, profit: 0, orders: 0 };
        row.qty += it.qty || 1;
        row.revenue += (it.price || 0) * (it.qty || 1);
        row.profit += ((it.price || 0) - (it.costPrice || 0)) * (it.qty || 1);
        row.orders += 1;
        map.set(it.productId || it.sku, row);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
  }, [filteredOrders]);

  // ---- Top customers ----
  const topCustomers = useMemo(() => {
    const map = new Map<string, { name: string; email: string; orders: number; spent: number }>();
    filteredOrders.forEach(o => {
      const email = o.customer?.email || 'unknown';
      const row = map.get(email) || { name: o.customer?.name || email, email, orders: 0, spent: 0 };
      row.orders += 1;
      row.spent += o.total;
      map.set(email, row);
    });
    return Array.from(map.values()).sort((a, b) => b.spent - a.spent).slice(0, 6);
  }, [filteredOrders]);

  const rangeLabel = useMemo(() => {
    if (!range.start) return 'All time';
    const q = Math.floor(new Date().getMonth() / 3) + 1;
    const base = datePreset === '90d' ? `Q${q}` : datePreset === 'ytd' ? 'YTD' : datePreset === 'today' ? 'Today' : datePreset === 'custom' ? 'Custom' : 'Last ' + datePreset.replace('d', ' days');
    return `${base} · ${fmtDate(range.start)} – ${fmtDate(range.end)}`;
  }, [range, datePreset]);

  // ---- Exports ----
  const handleExportCSV = () => {
    const rows = breakdown.map(r => ({
      Dimension: r.name,
      'Orders Count': r.ordersCount,
      'Gross Sales (PHP)': r.grossSales,
      'COGS Cost (PHP)': r.cost,
      'Gross Profit (PHP)': r.profit,
      'Profit Margin %': r.grossSales > 0 ? ((r.profit / r.grossSales) * 100).toFixed(1) : 0,
      'Discounts (PHP)': r.discounts,
      'Shipping (PHP)': r.shipping,
      'Gateway Fees (PHP)': r.fees
    }));
    exportToCSV(`CHUB_Report_${groupBy}_${new Date().toISOString().split('T')[0]}`, rows);
  };

  const handleExportProductsCSV = () => {
    const rows = topProducts.map(r => ({
      SKU: r.sku,
      Product: r.name,
      'Units Sold': r.qty,
      'Revenue (PHP)': Math.round(r.revenue),
      'Gross Profit (PHP)': Math.round(r.profit),
      Orders: r.orders
    }));
    exportToCSV(`CHUB_TopProducts_${new Date().toISOString().split('T')[0]}`, rows);
  };

  const handleExportJSON = () => {
    const payload = {
      report: groupBy,
      range: rangeLabel,
      generatedAt: new Date().toISOString(),
      kpis: totals,
      breakdown,
      trend: trendData,
      channelShare,
      topProducts,
      topCustomers
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const a = document.createElement('a');
    a.setAttribute('href', dataStr);
    a.setAttribute('download', `CHUB_Analytics_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const maxProductRevenue = topProducts[0]?.revenue || 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileBarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Reports &amp; Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            {rangeLabel} · {totals.count} orders analyzed
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleExportCSV} className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Export CSV
          </button>
          <button onClick={handleExportProductsCSV} className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Top Products CSV
          </button>
          <button onClick={handleExportJSON} className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Export JSON
          </button>
          <button onClick={() => window.print()} className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5">
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
        </div>
      </div>

      {/* Controls Panel */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 text-xs">
          {/* Date presets */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Time Period</label>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {PRESETS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setDatePreset(p.id)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    datePreset === p.id ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom range */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Custom Range</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={customFrom}
                onChange={e => { setCustomFrom(e.target.value); setDatePreset('custom'); }}
                className="flex-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-slate-400">→</span>
              <input
                type="date"
                value={customTo}
                onChange={e => { setCustomTo(e.target.value); setDatePreset('custom'); }}
                className="flex-1 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {(customFrom || customTo) && (
                <button
                  onClick={() => { setCustomFrom(''); setCustomTo(''); setDatePreset('30d'); }}
                  className="px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-400 hover:text-red-500 bg-slate-100 dark:bg-slate-800 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Channel filter */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Sales Channel</label>
            <select
              value={channelFilter}
              onChange={e => setChannelFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All channels</option>
              {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Group dimension */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Group Breakdown By</label>
            <select
              value={groupBy}
              onChange={e => setGroupBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="channel">Sales Channel</option>
              <option value="gateway">Payment Gateway</option>
              <option value="status">Fulfillment Status</option>
              <option value="category">Product Sub-Category</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5 text-xs">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-semibold"><DollarSign className="w-3 h-3" /> Gross Sales</div>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{formatPHP(totals.gross)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{totals.count} orders</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 uppercase font-semibold"><TrendingUp className="w-3 h-3" /> Net Profit</div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{formatPHP(totals.profit)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">{totals.margin.toFixed(1)}% margin</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-semibold">Avg Order Value</div>
          <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">{formatPHP(totals.aov)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">per order</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase font-semibold">COGS Cost</div>
          <p className="text-xl font-bold text-slate-700 dark:text-slate-300 mt-1">{formatPHP(totals.cost)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Discounts {formatPHP(totals.discounts)}</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1.5 text-[10px] text-red-500 uppercase font-semibold"><PieIcon className="w-3 h-3" /> Gateway Fees</div>
          <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{formatPHP(totals.fees)}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Shipping {formatPHP(totals.shipping)}</p>
        </div>
      </div>

      {/* Revenue Trend */}
      {trendData.length > 0 && (
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Revenue Trend {trendData.length > 40 ? '(weekly)' : '(daily)'}
          </h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={TREND_BAR} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={TREND_BAR} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={10} tickMargin={6} />
                <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={v => `₱${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                <Tooltip
                  formatter={(val: any, name: any) => (name === 'orders' ? [String(val), 'Orders'] : [`₱${Number(val).toLocaleString()}`, name === 'profit' ? 'Profit' : 'Revenue'])}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke={TREND_BAR} fill="url(#revGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="profit" name="Profit" stroke={PROFIT_BAR} fill="transparent" strokeWidth={2} strokeDasharray="5 4" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Breakdown + Channel share */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm xl:col-span-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
            Breakdown by {groupBy.toUpperCase()}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" fontSize={10} tickFormatter={v => `₱${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                <Tooltip
                  formatter={(val: any, name: any) => [`₱${Number(val).toLocaleString()}`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="grossSales" name="Gross Sales" fill={TREND_BAR} radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Gross Profit" fill={PROFIT_BAR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm xl:col-span-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
            <PieIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Channel Revenue Share
          </h3>
          {channelShare.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={200} className="max-w-[220px]">
                <PieChart>
                  <Pie data={channelShare} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                    {channelShare.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(val: any) => [`₱${Number(val).toLocaleString()}`, '']} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-2">
                {channelShare.map((c, i) => {
                  const pct = totals.gross > 0 ? ((c.value / totals.gross) * 100).toFixed(1) : '0';
                  return (
                    <div key={c.name} className="flex items-center gap-2 text-xs">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="flex-1 font-semibold text-slate-700 dark:text-slate-300">{c.name}</span>
                      <span className="font-mono text-slate-500">{formatPHP(c.value)}</span>
                      <span className="w-10 text-right font-bold text-indigo-600 dark:text-indigo-400">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-8 text-center">No channel data in this range.</p>
          )}
        </div>
      </div>

      {/* Top Products + Top Customers */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            Top Products
          </h3>
          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map(p => (
                <div key={p.sku + p.name} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-[10px] font-mono text-indigo-600 dark:text-indigo-400 shrink-0">
                    {(p.sku || 'SKU').split('-')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{p.name}</p>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{formatPHP(p.revenue)}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(p.revenue / maxProductRevenue) * 100}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">{p.qty} sold</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-8 text-center">No product sales in this range.</p>
          )}
        </div>

        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Top Customers
          </h3>
          {topCustomers.length > 0 ? (
            <div className="space-y-3">
              {topCustomers.map(c => (
                <div key={c.email} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                    {(c.name || c.email).slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{c.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{c.email} · {c.orders} order{c.orders > 1 ? 's' : ''}</p>
                  </div>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{formatPHP(c.spent)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-8 text-center">No customer transactions in this range.</p>
          )}
        </div>
      </div>

      {/* Detailed Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Dimension</th>
                <th className="px-4 py-3.5">Orders</th>
                <th className="px-4 py-3.5">Gross Sales</th>
                <th className="px-4 py-3.5">COGS Cost</th>
                <th className="px-4 py-3.5">Gross Profit</th>
                <th className="px-4 py-3.5">Margin %</th>
                <th className="px-4 py-3.5">Discounts</th>
                <th className="px-4 py-3.5">Shipping</th>
                <th className="px-4 py-3.5 text-right">Gateway Fees</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {breakdown.map((row, idx) => {
                const margin = row.grossSales > 0 ? ((row.profit / row.grossSales) * 100).toFixed(1) : '0';
                return (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">{row.name}</td>
                    <td className="px-4 py-4 font-mono font-medium">{row.ordersCount}</td>
                    <td className="px-4 py-4 font-bold">{formatPHP(row.grossSales)}</td>
                    <td className="px-4 py-4 text-slate-500">{formatPHP(row.cost)}</td>
                    <td className="px-4 py-4 font-semibold text-emerald-600 dark:text-emerald-400">{formatPHP(row.profit)}</td>
                    <td className="px-4 py-4 font-mono">{margin}%</td>
                    <td className="px-4 py-4 text-slate-500">-{formatPHP(row.discounts)}</td>
                    <td className="px-4 py-4 text-slate-500">{formatPHP(row.shipping)}</td>
                    <td className="px-4 py-4 text-right text-red-600 font-mono">-{formatPHP(row.fees)}</td>
                  </tr>
                );
              })}
              {breakdown.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                    <Filter className="w-6 h-6 mx-auto mb-2 opacity-40" />
                    No orders match the current filters. Adjust the time period or channel.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};