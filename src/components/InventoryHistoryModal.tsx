import React, { useEffect, useState } from 'react';
import { X, History, Loader2, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { adminFetch } from '../service/adminApi';

export interface InventoryLogEntry {
  id: string;
  productId: string;
  sku: string;
  name: string;
  previousQty: number;
  newQty: number;
  adjustment: number;
  reason: string;
  user: string;
  timestamp: string;
}

interface InventoryHistoryModalProps {
  apiBase: string;
  isOpen: boolean;
  onClose: () => void;
}

const formatTime = (iso: string) => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit'
    });
  } catch {
    return iso;
  }
};

export const InventoryHistoryModal: React.FC<InventoryHistoryModalProps> = ({ apiBase, isOpen, onClose }) => {
  const [logs, setLogs] = useState<InventoryLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await adminFetch(`${apiBase}/api/inventory/history?limit=500`);
        if (!res.ok) throw new Error('Failed to load history');
        const data = await res.json();
        if (!cancelled) setLogs(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || 'Failed to load inventory history.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [apiBase, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-800/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900 dark:text-white">
                Inventory Change History
              </h3>
              <p className="text-[11px] text-stone-500">Real-time stock movement audit trail</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {loading && (
            <div className="flex items-center justify-center py-16 text-stone-400">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading history...
            </div>
          )}

          {!loading && error && (
            <p className="text-center py-10 text-sm text-red-500">{error}</p>
          )}

          {!loading && !error && logs.length === 0 && (
            <p className="text-center py-10 text-sm text-stone-400">
              No inventory changes recorded yet.
            </p>
          )}

          {!loading && !error && logs.length > 0 && (
            <ul className="space-y-2">
              {logs.map(log => (
                <li
                  key={log.id}
                  className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700/60 flex items-start gap-3"
                >
                  <div
                    className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                      log.adjustment >= 0
                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                    }`}
                  >
                    {log.adjustment >= 0
                      ? <ArrowUpRight className="w-4 h-4" />
                      : <ArrowDownRight className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-stone-900 dark:text-white truncate">
                        {log.name || 'Product'}
                      </p>
                      <span
                        className={`text-[11px] font-black font-mono shrink-0 ${
                          log.adjustment >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {log.adjustment >= 0 ? `+${log.adjustment}` : log.adjustment}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                      SKU: {log.sku || 'N/A'} • {log.previousQty} → {log.newQty} units
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1">{log.reason}</p>
                    <p className="text-[10px] text-stone-400 mt-0.5">
                      {formatTime(log.timestamp)} • by {log.user || 'system'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
