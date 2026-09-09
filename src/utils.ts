import { OrderStatus } from './types';

export const formatPHP = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatPHPWithDecimals = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const statusColors: Record<
  OrderStatus,
  {
    bg: string;
    text: string;
    border: string;
    badgeBg: string;
    step: number;
    description: string;
  }
> = {
  'Pending': {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-900',
    badgeBg: 'bg-rose-500',
    step: 1,
    description: 'New order placed. Awaiting payment (online) or store dispatch'
  },
  'To Ship': {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-900',
    badgeBg: 'bg-amber-500',
    step: 2,
    description: 'Payment settled. Ready for pick, pack & AWB label generation'
  },
  'Shipped': {
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    text: 'text-sky-700 dark:text-sky-300',
    border: 'border-sky-200 dark:border-sky-900',
    badgeBg: 'bg-sky-500',
    step: 3,
    description: 'Handed over to courier. In transit to sorting center'
  },
  'Out for Delivery': {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-900',
    badgeBg: 'bg-blue-500',
    step: 4,
    description: 'Assigned to courier rider for same-day/next-day dropoff'
  },
  'Delivered': {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-900',
    badgeBg: 'bg-emerald-500',
    step: 5,
    description: 'Delivered to customer doorstep or authorized consignee'
  },
  'To Review': {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-900',
    badgeBg: 'bg-purple-500',
    step: 6,
    description: 'Delivery confirmed. Review prompt sent to customer'
  },
  'Completed': {
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-900',
    badgeBg: 'bg-teal-500',
    step: 7,
    description: 'Transaction complete and settled in financial ledger'
  },
  'Cancelled': {
    bg: 'bg-stone-100 dark:bg-stone-800',
    text: 'text-stone-700 dark:text-stone-300',
    border: 'border-stone-300 dark:border-stone-700',
    badgeBg: 'bg-stone-500',
    step: 0,
    description: 'Order voided prior to dispatch'
  },
  'Refund Requested': {
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-900',
    badgeBg: 'bg-orange-500',
    step: 0,
    description: 'Customer requested a refund. Awaiting admin approval'
  },
  'Refunded': {
    bg: 'bg-red-50 dark:bg-red-950/40',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-900',
    badgeBg: 'bg-red-500',
    step: 0,
    description: 'Returned item processed and payment reversed via gateway'
  },
  'Return Requested': {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-900',
    badgeBg: 'bg-indigo-500',
    step: 0,
    description: 'Customer requested a return. Awaiting admin approval'
  },
  'Returned': {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-300 dark:border-slate-700',
    badgeBg: 'bg-slate-500',
    step: 0,
    description: 'Returned items received and processed'
  }
};

// Web Audio API chime tone synthesizer for live notifications
export const playNotificationChime = (type: 'order' | 'alert' | 'success' = 'order') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'order') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'alert') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(330, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.2); // G5
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    }
  } catch (err) {
    console.debug('Audio chime skipped', err);
  }
};

// CSV Exporter
export const exportToCSV = (filename: string, rows: Record<string, any>[]) => {
  if (!rows || rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [
      headers.join(','),
      ...rows.map(row =>
        headers
          .map(header => {
            const val = row[header];
            if (val === null || val === undefined) return '""';
            const escaped = String(val).replace(/"/g, '""');
            return `"${escaped}"`;
          })
          .join(',')
      )
    ].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ✅ Improved helper function para sa image URL (same-origin /images via Vite/project static)
export const getImageUrl = (path: string): string => {
  if (!path) return '';
  
  // Kung may http na, ibalik na as-is (already a full URL)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Kung nagsisimula sa /, relative na sa same origin (web app images)
  if (path.startsWith('/')) {
    return path;
  }
  
  // Kung relative path lang (walang /), i-prefix ng /
  return `/${path}`;
};