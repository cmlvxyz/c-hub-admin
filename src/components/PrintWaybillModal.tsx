import React from 'react';
import { X, Printer } from 'lucide-react';
import { Order } from '../types';
import { formatPHP } from '../utils';

interface PrintWaybillModalProps {
  order: Order | null;
  onClose: () => void;
}

export const PrintWaybillModal: React.FC<PrintWaybillModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 text-slate-950 dark:text-slate-100 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col border border-slate-300 dark:border-slate-800 print:border-none print:shadow-none">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="px-6 py-4 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Thermal Airway Bill (AWB)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Label</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Thermal Label Sheet */}
        <div className="p-6 bg-slate-100 dark:bg-slate-950 font-sans text-xs print:p-0 print:bg-white flex justify-center">
          <div className="bg-white text-slate-950 border-2 border-slate-950 p-4 space-y-3 w-full rounded-lg shadow-sm print:shadow-none print:rounded-none">
            {/* Courier Brand & Carrier */}
            <div className="flex items-center justify-between border-b-2 border-slate-950 pb-2">
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tighter bg-slate-950 text-white px-2 py-0.5">
                  {(order.fulfillment?.carrier || 'J&T EXPRESS').toUpperCase()}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                  STANDARD EXPRESS
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">Hub Sort Code</span>
                <span className="font-mono font-black text-base">MNL-PSG-04</span>
              </div>
            </div>

            {/* Tracking Barcode Simulation */}
            <div className="text-center py-2 border-b-2 border-slate-950">
              <div className="font-mono font-black text-lg tracking-widest uppercase">
                {order.fulfillment?.trackingNumber || 'N/A'}
              </div>
              <div className="h-10 w-full flex items-center justify-center gap-[2px] mt-1 bg-slate-50 py-1">
                {[3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 3, 1, 2, 4, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 3].map(
                  (w, i) => (
                    <div
                      key={i}
                      className="bg-black h-full"
                      style={{ width: `${w * 2}px` }}
                    />
                  )
                )}
              </div>
              <p className="text-[9px] font-mono mt-1 text-slate-500">
                REF: {order.orderId} • CHANNEL: {order.channel}
              </p>
            </div>

            {/* Sender & Receiver Info */}
            <div className="grid grid-cols-2 gap-4 border-b-2 border-slate-950 pb-3 text-[11px]">
              {/* Sender */}
              <div className="space-y-1">
                <span className="font-bold uppercase text-[9px] text-slate-500 block">SENDER (FROM):</span>
                <p className="font-black text-slate-950">C-HUB STORE PHILIPPINES</p>
                <p className="text-slate-700 leading-tight">
                  Central Distribution Hub, Amang Rodriguez Ave, Pasig City, Metro Manila 1600
                </p>
                <p className="font-mono text-slate-700">TEL: +63 2 8888 2482</p>
              </div>

              {/* Consignee */}
              <div className="space-y-1 border-l-2 border-slate-950 pl-3">
                <span className="font-bold uppercase text-[9px] text-slate-500 block">
                  CONSIGNEE / RECIPIENT (TO):
                </span>
                <p className="font-black text-slate-950">{order.customer?.name || 'N/A'}</p>
                <p className="text-slate-700 leading-tight">
                  {order.customer?.address}, {order.customer?.city}, {order.customer?.province}{' '}
                  {order.customer?.postalCode}
                </p>
                <p className="font-mono text-slate-700 font-bold">TEL: {order.customer?.phone || 'N/A'}</p>
              </div>
            </div>

            {/* Payment & COD Badge */}
            <div className="flex items-center justify-between border-b-2 border-slate-950 pb-2">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Payment Method:</span>
                <span className="font-bold text-xs">{order.payment?.method || 'Prepaid'}</span>
              </div>

              <div className="text-right">
                {order.payment?.method?.includes('COD') ? (
                  <div className="bg-slate-950 text-white px-3 py-1 font-black text-sm uppercase rounded">
                    COD AMOUNT: {formatPHP(order.total || 0)}
                  </div>
                ) : (
                  <div className="border border-slate-950 px-3 py-1 font-bold text-xs uppercase text-emerald-800 bg-emerald-50 rounded">
                    PREPAID: {formatPHP(order.total || 0)}
                  </div>
                )}
              </div>
            </div>

            {/* Package Contents Checklist */}
            <div className="space-y-1 text-[10px]">
              <span className="font-bold uppercase text-slate-500">PACKAGE ITEM BREAKDOWN:</span>
              <ul className="divide-y divide-slate-200 font-mono">
                {(order.items || []).map((item, idx) => (
                  <li key={idx} className="py-1 flex justify-between">
                    <span>
                      {item.qty}x {item.name} ({item.size || 'STD'} / {item.color || 'STD'})
                    </span>
                    <span className="font-bold">{item.sku}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Security Seals */}
            <div className="pt-2 border-t border-dashed border-slate-400 flex items-center justify-between text-[9px] text-slate-500 font-mono">
              <span>SECURITY CHECK: INSPECTION VERIFIED</span>
              <span>PARCEL COUNT: 1/1</span>
              <span>WEIGHT: 0.85 KG</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
