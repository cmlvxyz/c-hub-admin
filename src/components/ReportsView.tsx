import React, { useState, useMemo } from 'react';
import {
  FileBarChart2,
  Download,
  Printer,
  Calendar,
  Filter,
  Check,
  BarChart3,
  TrendingUp,
  DollarSign,
  Layers,
  Sparkles,
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
  Legend
} from 'recharts';
import { Order, Product } from '../types';
import { formatPHP, exportToCSV } from '../utils';

interface ReportsViewProps {
  orders: Order[];
  products: Product[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({ orders, products }) => {
  const [datePreset, setDatePreset] = useState<'today' | '7d' | '30d' | 'quarter' | 'ytd'>('7d');
  const [groupBy, setGroupBy] = useState<'channel' | 'gateway' | 'category' | 'status'>('channel');

  // Filter orders based on preset
  const validOrders = orders.filter(o => o.status !== 'Cancelled');

  // Compute Group By aggregated metrics
  const reportData = useMemo(() => {
    const map: Record<
      string,
      {
        name: string;
        grossSales: number;
        cost: number;
        profit: number;
        ordersCount: number;
        discounts: number;
        shipping: number;
        fees: number;
      }
    > = {};

    validOrders.forEach(order => {
      let key = 'Other';
      if (groupBy === 'channel') key = order.channel;
      else if (groupBy === 'gateway') key = order.payment.method;
      else if (groupBy === 'status') key = order.status;
      else if (groupBy === 'category') key = order.items[0]?.subCategory || 'General';

      if (!map[key]) {
        map[key] = {
          name: key,
          grossSales: 0,
          cost: 0,
          profit: 0,
          ordersCount: 0,
          discounts: 0,
          shipping: 0,
          fees: 0
        };
      }

      map[key].grossSales += order.total;
      map[key].cost += order.costTotal;
      map[key].profit += order.total - order.costTotal;
      map[key].ordersCount += 1;
      map[key].discounts += order.discount;
      map[key].shipping += order.shipping;
      map[key].fees += order.payment.fee || 0;
    });

    return Object.values(map);
  }, [validOrders, groupBy]);

  const totalGross = reportData.reduce((s, r) => s + r.grossSales, 0);
  const totalCost = reportData.reduce((s, r) => s + r.cost, 0);
  const totalProfit = reportData.reduce((s, r) => s + r.profit, 0);
  const totalDiscounts = reportData.reduce((s, r) => s + r.discounts, 0);
  const totalFees = reportData.reduce((s, r) => s + r.fees, 0);

  const handleExportCSV = () => {
    const rows = reportData.map(r => ({
      Dimension: r.name,
      'Orders Count': r.ordersCount,
      'Gross Sales (PHP)': r.grossSales,
      'COGS Cost (PHP)': r.cost,
      'Gross Profit (PHP)': r.profit,
      'Discounts (PHP)': r.discounts,
      'Shipping (PHP)': r.shipping,
      'Gateway Fees (PHP)': r.fees
    }));
    exportToCSV(`CHUB_Custom_Report_${groupBy}_${new Date().toISOString().split('T')[0]}`, rows);
  };

  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `CHUB_Report_${groupBy}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <FileBarChart2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Customizable Enterprise Reporting</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generate custom financial audits, omnichannel breakdowns, and exportable reconciliation reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Controls Panel */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Date Presets */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              Time Period
            </label>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              {(
                [
                  { id: 'today', label: 'Today' },
                  { id: '7d', label: '7D' },
                  { id: '30d', label: '30D' },
                  { id: 'quarter', label: 'Q3' },
                  { id: 'ytd', label: 'YTD' }
                ] as const
              ).map(p => (
                <button
                  key={p.id}
                  onClick={() => setDatePreset(p.id)}
                  className={`flex-1 py-1 text-xs font-semibold rounded-md transition-all ${
                    datePreset === p.id
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Group By Dimension */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
              Group Dimension By
            </label>
            <select
              value={groupBy}
              onChange={e => setGroupBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="channel">Sales Channel (Web, TikTok, Shopee, Lazada)</option>
              <option value="gateway">Payment Method / Gateway</option>
              <option value="status">Fulfillment Status</option>
              <option value="category">Product Sub-Category</option>
            </select>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Gross Sales</span>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {formatPHP(totalGross)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Cost (COGS)</span>
          <p className="text-xl font-bold text-slate-700 dark:text-slate-300 mt-1">
            {formatPHP(totalCost)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-emerald-500 uppercase font-semibold">Net Profit</span>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatPHP(totalProfit)}
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Processor Fees</span>
          <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">
            {formatPHP(totalFees)}
          </p>
        </div>
      </div>

      {/* Visual Chart Breakdown */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
          Visual Breakdown by {groupBy.toUpperCase()}
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={reportData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={v => `₱${v / 1000}k`} />
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
              <Legend />
              <Bar dataKey="grossSales" name="Gross Sales" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="profit" name="Gross Profit" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cost" name="COGS Cost" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Report Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Dimension Name</th>
                <th className="px-4 py-3.5">Orders</th>
                <th className="px-4 py-3.5">Gross Sales</th>
                <th className="px-4 py-3.5">COGS Cost</th>
                <th className="px-4 py-3.5">Gross Profit</th>
                <th className="px-4 py-3.5">Profit Margin %</th>
                <th className="px-4 py-3.5 text-right">Gateway Fees</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {reportData.map((row, idx) => {
                const margin = row.grossSales > 0 ? ((row.profit / row.grossSales) * 100).toFixed(1) : '0';
                return (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-4 font-semibold text-slate-900 dark:text-white">
                      {row.name}
                    </td>
                    <td className="px-4 py-4 font-mono font-medium">{row.ordersCount}</td>
                    <td className="px-4 py-4 font-bold">{formatPHP(row.grossSales)}</td>
                    <td className="px-4 py-4 text-slate-500">{formatPHP(row.cost)}</td>
                    <td className="px-4 py-4 font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatPHP(row.profit)}
                    </td>
                    <td className="px-4 py-4 font-mono">{margin}%</td>
                    <td className="px-4 py-4 text-right text-red-600 font-mono">
                      -{formatPHP(row.fees)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
