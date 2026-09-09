import React, { useState } from 'react';
import {
  Ticket,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Power,
  Percent,
  Banknote
} from 'lucide-react';
import { Voucher } from '../types';
import { formatPHP } from '../utils';

interface VouchersViewProps {
  vouchers: Voucher[];
  onCreateVoucher: (payload: Partial<Voucher>) => Promise<boolean>;
  onUpdateVoucher: (code: string, payload: Partial<Voucher>) => Promise<boolean>;
  onToggleVoucher: (code: string, active: boolean) => Promise<boolean>;
  onDeleteVoucher: (code: string) => Promise<boolean>;
}

interface VoucherForm {
  code: string;
  type: 'percent' | 'fixed';
  value: string;
  minSubtotal: string;
  maxDiscount: string;
  usageLimit: string;
  perUserLimit: string;
  expiresAt: string;
  active: boolean;
  description: string;
}

const EMPTY_FORM: VoucherForm = {
  code: '',
  type: 'percent',
  value: '',
  minSubtotal: '0',
  maxDiscount: '0',
  usageLimit: '0',
  perUserLimit: '0',
  expiresAt: '',
  active: true,
  description: '',
};

const toLocalInput = (iso: string | null): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const toISO = (localInput: string): string | null => {
  if (!localInput) return null;
  const d = new Date(localInput);
  return isNaN(d.getTime()) ? null : d.toISOString();
};

export const VouchersView: React.FC<VouchersViewProps> = ({
  vouchers,
  onCreateVoucher,
  onUpdateVoucher,
  onToggleVoucher,
  onDeleteVoucher,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Voucher | null>(null);
  const [form, setForm] = useState<VoucherForm>(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const filtered = vouchers.filter(v => {
    const q = search.trim().toLowerCase();
    const matchQ = !q || String(v.code).toLowerCase().includes(q) || String(v.description || '').toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? v.active : !v.active);
    return matchQ && matchStatus;
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (v: Voucher) => {
    setEditing(v);
    setForm({
      code: v.code,
      type: v.type,
      value: String(v.value),
      minSubtotal: String(v.minSubtotal),
      maxDiscount: String(v.maxDiscount),
      usageLimit: String(v.usageLimit),
      perUserLimit: String(v.perUserLimit),
      expiresAt: toLocalInput(v.expiresAt),
      active: v.active,
      description: v.description || '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const setField = (key: keyof VoucherForm, value: string | boolean) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');
    const value = Number(form.value);
    if (!form.code.trim()) {
      setFormError('Voucher code is required.');
      setSaving(false);
      return;
    }
    if (!value || value <= 0) {
      setFormError('Discount value must be greater than 0.');
      setSaving(false);
      return;
    }
    const payload: Partial<Voucher> = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value,
      minSubtotal: Math.max(0, Number(form.minSubtotal) || 0),
      maxDiscount: Math.max(0, Number(form.maxDiscount) || 0),
      usageLimit: Math.max(0, Math.floor(Number(form.usageLimit) || 0)),
      perUserLimit: Math.max(0, Math.floor(Number(form.perUserLimit) || 0)),
      expiresAt: toISO(form.expiresAt),
      active: form.active,
      description: form.description.trim(),
    };

    let done = false;
    if (editing) {
      done = await onUpdateVoucher(editing.code, payload);
    } else {
      done = await onCreateVoucher(payload);
    }
    setSaving(false);
    if (done) {
      setModalOpen(false);
    }
  };

  const usageText = (v: Voucher): string => {
    if (!v.usageLimit) return `${v.usedCount} used / unlimited`;
    return `${v.usedCount} / ${v.usageLimit} used`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-indigo-500" /> Voucher Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create and manage promo codes. Discounts are validated and computed server-side at checkout.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/25 transition-all"
        >
          <Plus className="w-4 h-4" /> New Voucher
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by code or description..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as any)}
          className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3 font-bold">Code</th>
                <th className="px-4 py-3 font-bold">Discount</th>
                <th className="px-4 py-3 font-bold">Min.</th>
                <th className="px-4 py-3 font-bold">Usage</th>
                <th className="px-4 py-3 font-bold">Expiry</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400 text-sm">
                    No vouchers found. Create one to start offering promos.
                  </td>
                </tr>
              )}
              {filtered.map(v => (
                <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3">
                    <div className="font-mono font-extrabold text-slate-900 dark:text-white">{v.code}</div>
                    {v.description && (
                      <div className="text-[10px] text-slate-400 mt-0.5 max-w-[180px] truncate">{v.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold">
                      {v.type === 'percent' ? (
                        <><Percent className="w-3 h-3" />{v.value}% off</>
                      ) : (
                        <><Banknote className="w-3 h-3" />{formatPHP(v.value)} off</>
                      )}
                    </span>
                    {v.maxDiscount > 0 && (
                      <div className="text-[10px] text-slate-400 mt-0.5">cap {formatPHP(v.maxDiscount)}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {v.minSubtotal > 0 ? formatPHP(v.minSubtotal) : 'None'}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {usageText(v)}
                    {v.perUserLimit > 0 && (
                      <div className="text-[10px] text-slate-400 mt-0.5">max {v.perUserLimit} per user</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {v.expiresAt ? new Date(v.expiresAt).toLocaleDateString() : 'No expiry'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onToggleVoucher(v.code, !v.active)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
                        v.active
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Power className="w-3 h-3" /> {v.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(v)}
                        className="p-2 rounded-lg text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                        aria-label={`Edit ${v.code}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteVoucher(v.code)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30"
                        aria-label={`Delete ${v.code}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => { if (!saving) setModalOpen(false); }} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {editing ? `Edit Voucher ${editing.code}` : 'New Voucher'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Code</span>
                  <input
                    value={form.code}
                    onChange={e => setField('code', e.target.value.toUpperCase())}
                    disabled={!!editing}
                    placeholder="e.g. SALE50"
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold uppercase outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Type</span>
                  <select
                    value={form.type}
                    onChange={e => setField('type', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="percent">Percent (%)</option>
                    <option value="fixed">Fixed (₱)</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                    Value {form.type === 'percent' ? '(%)' : '(₱)'}
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={form.value}
                    onChange={e => setField('value', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Min. Subtotal</span>
                  <input
                    type="number"
                    min="0"
                    value={form.minSubtotal}
                    onChange={e => setField('minSubtotal', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Max Discount (0 = none)</span>
                  <input
                    type="number"
                    min="0"
                    value={form.maxDiscount}
                    onChange={e => setField('maxDiscount', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Usage Limit (0 = unlimited)</span>
                  <input
                    type="number"
                    min="0"
                    value={form.usageLimit}
                    onChange={e => setField('usageLimit', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Per-User Limit (0 = unlimited)</span>
                  <input
                    type="number"
                    min="0"
                    value={form.perUserLimit}
                    onChange={e => setField('perUserLimit', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
                <label className="block">
                  <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Expires At</span>
                  <input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={e => setField('expiresAt', e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Description</span>
                <input
                  value={form.description}
                  onChange={e => setField('description', e.target.value)}
                  placeholder="Short note about this voucher"
                  maxLength={300}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={e => setField('active', e.target.checked)}
                  className="rounded accent-indigo-600"
                />
                Active (redeemable at checkout)
              </label>

              {formError && <p className="text-[11px] text-red-500 font-bold">{formError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 disabled:opacity-50"
                >
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};