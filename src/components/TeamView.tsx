import React, { useMemo, useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Plus,
  Search,
  UserPlus,
  Lock,
  KeyRound,
  Power,
  Mail,
  AtSign,
  User,
  RefreshCw,
  X
} from 'lucide-react';
import { AdminAccount, RoleDef } from '../types';

interface TeamViewProps {
  admins: AdminAccount[];
  roleDefs: RoleDef[];
  currentEmail: string;
  onCreateAdmin: (payload: { name: string; username: string; email: string; password: string; role: string }) => Promise<boolean>;
  onUpdateAdmin: (email: string, payload: { name?: string; role?: string; active?: boolean; password?: string }) => Promise<boolean>;
  onRefresh: () => void;
}

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300',
  operations: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300',
  inventory: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300',
  support: 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300',
  viewer: 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
};

export const TeamView: React.FC<TeamViewProps> = ({
  admins,
  roleDefs,
  currentEmail,
  onCreateAdmin,
  onUpdateAdmin,
  onRefresh
}) => {
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<AdminAccount | null>(null);
  const [resetPwEmail, setResetPwEmail] = useState<string | null>(null);
  const [newPw, setNewPw] = useState('');
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', role: '' });
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState('');

  const roleLabel = (key: string) => roleDefs.find(r => r.key === key)?.label || key;
  const roleDesc = (key: string) => roleDefs.find(r => r.key === key)?.description || '';

  const filtered = useMemo(
    () =>
      admins.filter(a => {
        const q = search.trim().toLowerCase();
        if (!q) return true;
        return (
          a.name.toLowerCase().includes(q) ||
          a.email.toLowerCase().includes(q) ||
          a.username.toLowerCase().includes(q) ||
          a.role.toLowerCase().includes(q)
        );
      }),
    [admins, search]
  );

  const activeCount = admins.filter(a => a.active).length;
  const superCount = admins.filter(a => a.active && a.role === 'super_admin').length;

  const sorted = [...filtered].sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1));

  const notify = (msg: string) => {
    setFlash(msg);
    window.setTimeout(() => setFlash(''), 3500);
  };

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.username.trim() || form.password.length < 8 || !form.role) {
      notify('Fill in all fields (password must be at least 8 characters).');
      return;
    }
    setSaving(true);
    const ok = await onCreateAdmin({ ...form, name: form.name.trim(), username: form.username.trim(), email: form.email.trim().toLowerCase() });
    setSaving(false);
    if (ok) {
      setShowCreate(false);
      setForm({ name: '', username: '', email: '', password: '', role: '' });
      notify('Admin account created.');
    }
  };

  const handleRoleChange = async (admin: AdminAccount, role: string) => {
    const ok = await onUpdateAdmin(admin.email, { role });
    if (ok) notify(`${admin.email} role updated to ${roleLabel(role)}.`);
  };

  const handleToggleActive = async (admin: AdminAccount) => {
    const ok = await onUpdateAdmin(admin.email, { active: !admin.active });
    if (ok) notify(admin.active ? `${admin.email} deactivated.` : `${admin.email} re-activated.`);
  };

  const handleResetPw = async () => {
    if (!resetPwEmail) return;
    if (newPw.length < 8) {
      notify('Password must be at least 8 characters.');
      return;
    }
    setSaving(true);
    const ok = await onUpdateAdmin(resetPwEmail, { password: newPw });
    setSaving(false);
    setNewPw('');
    setResetPwEmail(null);
    if (ok) notify('Password reset successfully.');
  };

  const inputBase =
    'w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white';

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Team & Roles
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage admin accounts, assign roles, and control access — Super Admin only ({activeCount} active, {superCount} super admin).
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            title="Refresh admin list"
            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search admins..."
              className={inputBase + ' pl-8 w-52'}
            />
          </div>
          <button
            onClick={() => { setShowCreate(v => !v); setEditing(null); }}
            className="px-3 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {showCreate ? <ShieldAlert className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            {showCreate ? 'Cancel' : 'Add Admin'}
          </button>
        </div>
      </div>

      {flash && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-300 text-xs">
          {flash}
        </div>
      )}

      {/* Create Admin Form */}
      {showCreate && (
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-500 flex items-center gap-1.5">
            <UserPlus className="w-3.5 h-3.5" /> New Admin Account
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><User className="w-3 h-3" /> Full Name</label>
              <input className={inputBase} placeholder="Juan Dela Cruz" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><AtSign className="w-3 h-3" /> Username</label>
              <input className={inputBase} placeholder="juan" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</label>
              <input className={inputBase} placeholder="juan@c-hub.ph" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Password</label>
              <input className={inputBase} type="password" placeholder="min 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-4 flex-wrap">
              {roleDefs.map(r => (
                <label
                  key={r.key}
                  className={`flex items-start gap-1.5 px-3 py-2 rounded-xl border text-xs cursor-pointer transition-colors ${
                    form.role === r.key
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="new-role"
                    className="mt-0.5 accent-indigo-600"
                    checked={form.role === r.key}
                    onChange={() => setForm({ ...form, role: r.key })}
                  />
                  <span>
                    <span className="font-semibold">{r.label}</span>
                    <span className="block text-[10px] text-slate-400">{r.description}</span>
                  </span>
                </label>
              ))}
            </div>
            <button
              onClick={handleCreate}
              disabled={saving}
              className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg flex items-center gap-1.5"
            >
              {saving ? 'Creating...' : <><Plus className="w-3.5 h-3.5" /> Create Admin</>}
            </button>
          </div>
        </div>
      )}

      {/* Role legend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {roleDefs.map(r => (
          <div key={r.key} className="p-3 rounded-xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold capitalize ${ROLE_COLORS[r.key] || 'bg-slate-200'}`}>{r.label}</span>
              {r.isSuper && <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{r.description}</p>
            <p className="text-[10px] text-slate-400 mt-1.5 font-mono truncate" title={r.permissions.join(', ')}>
              {r.permissions.length === 1 && r.permissions[0] === '*' ? 'all permissions' : `${r.permissions.length} permissions`}
            </p>
          </div>
        ))}
      </div>

      {/* Admins table */}
      <div className="rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700">
                <th className="px-4 py-3 font-bold">Admin</th>
                <th className="px-4 py-3 font-bold">Username</th>
                <th className="px-4 py-3 font-bold">Role</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-xs text-slate-400">
                    No admin accounts found.
                  </td>
                </tr>
              )}
              {sorted.map(a => {
                const isSelf = a.email === currentEmail;
                return (
                  <tr key={a.email} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                          <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase">
                            {(a.name || a.email).slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {a.name || '—'}
                            {isSelf && <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">You</span>}
                          </p>
                          <p className="text-[10px] text-slate-400">{a.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-mono">@{a.username || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      {isSelf ? (
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold capitalize ${ROLE_COLORS[a.role] || 'bg-slate-200'}`}>
                          {roleLabel(a.role)}
                        </span>
                      ) : (
                        <select
                          value={a.role}
                          onChange={e => handleRoleChange(a, e.target.value)}
                          disabled={isSelf}
                          className={`text-[10px] px-2 py-1 rounded-full font-bold capitalize appearance-none cursor-pointer disabled:cursor-not-allowed border-0 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${ROLE_COLORS[a.role] || 'bg-slate-200'}`}
                        >
                          {roleDefs.map(r => <option key={r.key} value={r.key} className="normal-case">{r.label}</option>)}
                        </select>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${a.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'}`}>
                        {a.active ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setResetPwEmail(a.email)}
                          disabled={isSelf}
                          title="Reset password"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(a)}
                          disabled={isSelf}
                          title={a.active ? 'Deactivate' : 'Re-activate'}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset password modal */}
      {resetPwEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-500" /> Reset Password
              </h3>
              <button onClick={() => { setResetPwEmail(null); setNewPw(''); }} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Set a new password for <b>{resetPwEmail}</b>.</p>
            <input type="password" placeholder="New password (min 8 chars)" className={inputBase} value={newPw} onChange={e => setNewPw(e.target.value)} />
            <button
              onClick={handleResetPw}
              disabled={saving}
              className="w-full py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-lg"
            >
              {saving ? 'Saving...' : 'Save new password'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};