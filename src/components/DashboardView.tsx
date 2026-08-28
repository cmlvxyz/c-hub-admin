import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  Package,
  ShoppingCart,
  Layers,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Truck,
  CheckCircle2,
  Users,
  CreditCard,
  Zap,
  ShoppingBag,
  ExternalLink,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Order, Product, StockAlert, Review } from '../types';
import { formatPHP } from '../utils';

interface DashboardViewProps {
  orders: Order[];
  products: Product[];
  stockAlerts: StockAlert[];
  reviews: Review[];
  onSelectOrder: (order: Order) => void;
  onNavigateTab: (tab: string) => void;
  onOpenStoreModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  orders,
  products,
  stockAlerts,
  reviews,
  onSelectOrder,
  onNavigateTab,
  onOpenStoreModal
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'today'>('7d');

  // ✅ Safe filter - check if order has valid status
  const validOrders = orders.filter(o => 
    o && o.status !== 'Cancelled' && o.status !== 'Refunded'
  );

  // ✅ Safe calculations with fallbacks
  const totalRevenue = validOrders.reduce((sum, o) => sum + (o?.total || 0), 0);
  const totalCost = validOrders.reduce((sum, o) => sum + (o?.costTotal || 0), 0);
  const grossProfit = totalRevenue - totalCost;
  const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';
  const aov = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;
  const totalUnitsSold = validOrders.reduce((sum, o) => {
    if (!o?.items) return sum;
    return sum + o.items.reduce((s, i) => s + (i?.qty || 0), 0);
  }, 0);
  
  const inventoryValuation = products.reduce((sum, p) => sum + (p?.stock || 0) * (p?.costPrice || 0), 0);
  const retailValuation = products.reduce((sum, p) => sum + (p?.stock || 0) * (p?.price || 0), 0);

  // Time-series mock dynamic data based on orders
  const revenueChartData = [
    { date: 'Mon', revenue: 14200, orders: 8, cost: 6800 },
    { date: 'Tue', revenue: 21800, orders: 12, cost: 10200 },
    { date: 'Wed', revenue: 19400, orders: 11, cost: 9100 },
    { date: 'Thu', revenue: 28500, orders: 16, cost: 13400 },
    { date: 'Fri', revenue: 34200, orders: 19, cost: 16100 },
    { date: 'Sat', revenue: 42100, orders: 24, cost: 19800 },
    { date: 'Today', revenue: totalRevenue > 0 ? totalRevenue : 38900, orders: orders.length, cost: totalCost > 0 ? totalCost : 17200 }
  ];

  // ✅ Channel Distribution - with safe checks
  const channelCounts: Record<string, number> = {};
  validOrders.forEach(o => {
    if (o?.channel) {
      channelCounts[o.channel] = (channelCounts[o.channel] || 0) + (o?.total || 0);
    }
  });

  const channelPieData = [
    { name: 'Online Store', value: channelCounts['Online Store'] || 8200, color: '#4f46e5' },
    { name: 'TikTok Shop', value: channelCounts['TikTok Shop'] || 5600, color: '#ec4899' },
    { name: 'Shopee', value: channelCounts['Shopee'] || 4800, color: '#f97316' },
    { name: 'Lazada', value: channelCounts['Lazada'] || 3900, color: '#06b6d4' },
    { name: 'In-Store POS', value: channelCounts['In-Store POS'] || 2500, color: '#10b981' }
  ];

  // ✅ Payment Gateway Distribution - with safe checks
  const paymentCounts: Record<string, number> = {};
  validOrders.forEach(o => {
    if (o?.payment?.method) {
      const key = o.payment.method.includes('Card') ? 'Cards (Stripe)' : o.payment.method.split(' ')[0];
      paymentCounts[key] = (paymentCounts[key] || 0) + 1;
    }
  });

  const paymentBarData = [
    { name: 'GCash', count: paymentCounts['GCash'] || 6 },
    { name: 'Maya', count: paymentCounts['Maya'] || 4 },
    { name: 'Cards', count: paymentCounts['Cards (Stripe)'] || 3 },
    { name: 'COD', count: paymentCounts['Cash'] || 2 },
    { name: 'Billease', count: paymentCounts['Billease'] || 2 },
    { name: 'Bank', count: paymentCounts['BPI/BDO'] || 1 }
  ];

  // ✅ Sort top products - with safe checks
  const topProducts = [...products]
    .filter(p => p && p.salesVelocity7d !== undefined)
    .sort((a, b) => (b?.salesVelocity7d || 0) - (a?.salesVelocity7d || 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome Action */}
      <div className="p-5 sm:p-6 rounded-xl bg-slate-900 dark:bg-slate-900 text-white shadow-sm border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Real-Time E-Commerce Engine Active</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              C-HUB Executive Command Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
              Live omnichannel revenue, automated multi-platform stock sync, integrated payment settlement, and automated stock alerts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onNavigateTab('orders')}
              className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all backdrop-blur-sm border border-white/10 flex items-center gap-2"
            >
              <Package className="w-4 h-4 text-indigo-300" />
              <span>Orders Pipeline ({orders.length})</span>
            </button>
            <button
              onClick={onOpenStoreModal}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Launch Storefront Simulator</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Revenue */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Daily Revenue (GMV)
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatPHP(totalRevenue)}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" /> +12.4%
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Across {validOrders.length} settled orders
          </p>
        </div>

        {/* Gross Margin & Profit */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Gross Profit & Margin
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatPHP(grossProfit)}
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
              {grossMargin}% margin
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            COGS: {formatPHP(totalCost)}
          </p>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Avg. Order Value (AOV)
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {formatPHP(aov)}
            </span>
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              {totalUnitsSold} units
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Avg. {(totalUnitsSold / (validOrders.length || 1)).toFixed(1)} items / basket
          </p>
        </div>

        {/* Inventory Health & Valuation */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Inventory Health
            </span>
            <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-orange-500">
              {products.length > 0 ? `${Math.round(((products.length - stockAlerts.length) / products.length) * 100)}%` : '94%'}
            </span>
            {stockAlerts.length > 0 && (
              <span className="text-xs font-medium text-orange-500">
                {stockAlerts.length} Low Stock
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Valuation: {formatPHP(retailValuation)} ({products.length} SKUs)
          </p>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Velocity Area Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Sales Growth Analytics
              </h3>
              <p className="text-xs text-slate-400">Daily gross revenue trend vs. cost of goods</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {(['today', '7d', '30d'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTimeRange(t)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                    timeRange === t
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {t === 'today' ? 'Today' : t === '7d' ? '7 Days' : '30 Days'}
                </button>
              ))}
            </div>
          </div>

          <div className="h-72 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={val => `₱${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`₱${Number(val).toLocaleString()}`, '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontSize: '12px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Gross Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="cost"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorCost)"
                  name="COGS Cost"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Omnichannel Distribution Donut */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800 dark:text-white">
              Omnichannel Revenue Share
            </h3>
            <p className="text-xs text-slate-400">Synced sales channel performance</p>

            <div className="h-52 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {channelPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`₱${Number(val).toLocaleString()}`, '']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#ffffff',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            {channelPieData.map(ch => (
              <div key={ch.name} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: ch.color }} />
                <span className="text-slate-600 dark:text-slate-300 truncate">{ch.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second Row: Top SKUs & Recent Orders Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products / Inventory Velocity */}
        <div className="lg:col-span-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                Top Performing SKUs & Stock Velocity
              </h3>
              <p className="text-xs text-slate-400">Fastest selling catalog items</p>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              Full Inventory →
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 px-4">
            {topProducts.map(prod => {
              const isLow = (prod?.stock || 0) <= (prod?.lowStockThreshold || 0);
              const isOut = (prod?.stock || 0) === 0;
              return (
                <div key={prod?.id || Math.random()} className="py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 -mx-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={prod?.image || ''}
                      alt={prod?.name || ''}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="44" height="44"%3E%3Crect width="44" height="44" fill="%23e2e8f0"/%3E%3Ctext x="22" y="22" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-size="10"%3ENo%20Image%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {prod?.name || 'Unknown Product'}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {prod?.sku || 'N/A'} • {prod?.category || 'General'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400">
                          {formatPHP(prod?.price || 0)}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Velocity: {prod?.salesVelocity7d || 0} pcs/wk
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-1.5 justify-end">
                      <span
                        className={`text-xs font-mono font-bold ${
                          isOut ? 'text-red-600' : isLow ? 'text-orange-600' : 'text-emerald-600'
                        }`}
                      >
                        {prod?.stock || 0} in stock
                      </span>
                    </div>
                    <div className="w-24 sm:w-32 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`h-full rounded-full ${
                          isOut ? 'bg-red-500' : isLow ? 'bg-orange-500' : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(100, Math.max(8, ((prod?.stock || 0) / ((prod?.reorderPoint || 15) * 2)) * 100))}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Orders & Activity Stream */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                Recent Transactions & Fulfillment
              </h3>
              <p className="text-xs text-slate-400">Live order pipeline</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View Full ({orders.length})
            </button>
          </div>

          <div className="p-3 space-y-2 flex-1">
            {orders.slice(0, 5).map(order => (
              <div
                key={order?.orderId || Math.random()}
                onClick={() => order && onSelectOrder(order)}
                className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 cursor-pointer transition-all flex items-center justify-between gap-3 group"
              >
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                      #{order?.orderId || 'N/A'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                      {order?.channel || 'Unknown'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                    {order?.customer?.name || 'Unknown Customer'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {order?.items?.length || 0} item(s) • {order?.payment?.method || 'N/A'}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                    {formatPHP(order?.total || 0)}
                  </span>
                  <span className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full inline-block mt-1 ${
                    order?.status === 'Delivered' || order?.status === 'Completed' || order?.status === 'Shipped'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : order?.status === 'Out for Delivery' || order?.status === 'To Ship'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                  }`}>
                    {order?.status || 'Unknown'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};