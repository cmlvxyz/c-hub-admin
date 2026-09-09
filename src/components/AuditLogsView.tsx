import React, { useMemo, useState } from 'react';
import {
  ScrollText,
  Search,
  RefreshCw,
  X,
  Package,
  ShoppingBag,
  Users,
  TicketPercent,
  Star,
  Boxes,
  ArrowLeftRight,
  ShieldCheck,
  LogIn,
  FileClock,
  FileX
} from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogsViewProps {
  logs?: AuditLog[];
  onRefresh?: () => void;
}

const fmtTime = (ts: string) => {
  try {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return ts;
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  } catch {
    return ts;
  }
};

const actionMeta = (action: string): { label: string; cls: string; Icon: React.ElementType } => {
  const map: Record<string, { label: string; cls: string; Icon: React.ElementType }> = {
    'order.create': { label: 'Order Created', cls: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300', Icon: ShoppingBag },
    'order.update': { label: 'Order Updated', cls: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300', Icon: ShoppingBag },
    'order.delete': { label: 'Order Deleted', cls: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300', Icon: ShoppingBag },
    'refund.decision': { label: 'Refund Decision', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', Icon: ArrowLeftRight },
    'return.decision': { label: 'Return Decision', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300', Icon: ArrowLeftRight },
    'product.create': { label: 'Product Added', cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300', Icon: Package },
    'product.update': { label: 'Product Updated', cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300', Icon: Package },
    'product.delete': { label: 'Product Deleted', cls: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300', Icon: Package },
    'inventory.adjust': { label: 'Stock Adjusted', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300', Icon: Boxes },
    'voucher.create': { label: 'Voucher Created', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300', Icon: TicketPercent },
    'voucher.update': { label: 'Voucher Updated', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300', Icon: TicketPercent },
    'voucher.delete': { label: 'Voucher Deleted', cls: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300', Icon: TicketPercent },
    'review.moderate': { label: 'Review Moderated', cls: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300', Icon: Star },
    'review.delete': { label: 'Review Removed', cls: 'bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300', Icon: Star },
    'admin.create': { label: 'Admin Created', cls: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300', Icon: Users },
    'admin.update': { label: 'Admin Updated', cls: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300', Icon: Users },
    'admin.delete': { label: 'Admin Deleted', cls: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300', Icon: Users },
    login: { label: 'Admin Login', cls: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300', Icon: LogIn }
  };
  return map[action] || { label: action || 'Action', cls: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', Icon: FileClock };
};

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ logs = [], onRefresh }) => {
  const [q, setQ] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(60);
  const [refreshing, setRefreshing] = useState(false);

  const actions = useMemo(() => {
    const s = new Set<string>();
    logs.forEach(l => l && l.action && s.add(l.action));
    return Array.from(s).sort();
  }, [logs]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return logs
      .filter(l => {
        if (actionFilter !== 'all' && l.action !== actionFilter) return false;
        if (term) {
          const hay = `${l.adminEmail} ${l.adminName || ''} ${l.target || ''} ${l.summary || ''} ${l.details || ''}`.toLowerCase();
          if (!hay.includes(term)) return false;
        }
        return true;
      })
      .sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
  }, [logs, q, actionFilter]);

  const handleRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setRefreshing(false), 400);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center">
            <ScrollText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Audit Trail</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Every admin action, logged for accountability
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
            {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
          </span>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2.5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder="Search admin, target, summary…"
            className="w-full pl-9 pr-9 py-2.5 rounded-2xl border text-sm bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow placeholder-slate-400"
          />
          {q && (
            <button
              onClick={() => setQ('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <select
          value={actionFilter}
          onChange={e => setActionFilter(e.target.value)}
          className="px-3 py-2.5 rounded-2xl border text-sm bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
        >
          <option value="all">All actions</option>
          {actions.map(a => (
            <option key={a} value={a}>
              {actionMeta(a).label}
            </option>
          ))}
        </select>

        {(q || actionFilter !== 'all') && (
          <button
            onClick={() => {
              setQ('');
              setActionFilter('all');
            }}
            className="px-3 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-red-500 hover:border-red-300 dark:hover:border-red-800 transition-colors flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Table / List */}
      <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900">
                <th className="px-4 py-3 font-bold">When</th>
                <th className="px-4 py-3 font-bold">Admin</th>
                <th className="px-4 py-3 font-bold">Action</th>
                <th className="px-4 py-3 font-bold">Target</th>
                <th className="px-4 py-3 font-bold">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, visibleCount).map(log => {
                const meta = actionMeta(log.action);
                const Icon = meta.Icon;
                return (
                  <tr
                    key={log.id}
                    className="border-b border-slate-50 dark:border-slate-800/60 last:border-0 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-500 dark:text-slate-400 align-top pt-4">
                      {fmtTime(log.timestamp)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                            {log.adminName || log.adminEmail}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{log.adminEmail}</p>
                          {log.adminRole && (
                            <span className="text-[9px] px-1.5 py-px mt-0.5 inline-block rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-300 capitalize">
                              {log.adminRole.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold ${meta.cls}`}>
                        <Icon className="w-3 h-3" />
                        {meta.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-300 break-all">{log.target || '—'}</span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        {log.summary || '—'}
                        {log.details && (
                          <span className="block text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 break-all">{JSON.stringify(log.details)}</span>
                        )}
                      </p>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <FileX className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No audit entries found</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        {logs.length === 0 ? 'Admin actions will appear here as they happen.' : 'Try adjusting your search or filters.'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > visibleCount && (
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <button
              onClick={() => setVisibleCount(v => v + 60)}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Show more ({filtered.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};