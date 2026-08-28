import React, { useState } from 'react';
import { X, Layers, Plus, Minus, Check, ArrowUpDown } from 'lucide-react';
import { Product } from '../types';
import { formatPHP } from '../utils';

interface StockAdjustmentModalProps {
  product: Product | null;
  onClose: () => void;
  onAdjustStock: (productId: string, adjustment: number, reason: string) => void;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  product,
  onClose,
  onAdjustStock
}) => {
  const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove'>('add');
  const [amount, setAmount] = useState<number>(10);
  const [reason, setReason] = useState<string>('Restock Batch Received');

  if (!product) return null;

  const currentStock = product.stock;
  const newStock =
    adjustmentType === 'add'
      ? currentStock + (Number(amount) || 0)
      : Math.max(0, currentStock - (Number(amount) || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    const finalAdjustment = adjustmentType === 'add' ? Number(amount) : -Number(amount);
    onAdjustStock(product.id, finalAdjustment, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-50 dark:bg-stone-800/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <ArrowUpDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-stone-900 dark:text-white">
                Stock Count Adjustment
              </h3>
              <p className="text-[11px] text-stone-500 font-mono">SKU: {product.sku}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-xl"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-12 h-12 rounded-xl object-cover border border-stone-200 dark:border-stone-700 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-stone-900 dark:text-white truncate">
                {product.name}
              </p>
              <p className="text-[11px] text-stone-500">
                Current Active Stock: <span className="font-mono font-bold text-indigo-600">{currentStock} units</span>
              </p>
            </div>
          </div>

          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-stone-100 dark:bg-stone-800 rounded-xl">
            <button
              type="button"
              onClick={() => setAdjustmentType('add')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                adjustmentType === 'add'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Stock In (Add)</span>
            </button>
            <button
              type="button"
              onClick={() => setAdjustmentType('remove')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                adjustmentType === 'remove'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
              }`}
            >
              <Minus className="w-3.5 h-3.5" />
              <span>Stock Out (Deduct)</span>
            </button>
          </div>

          {/* Amount */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
              Units Quantity
            </label>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={e => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-sm font-mono font-bold text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
              Audit Reason Code
            </label>
            <select
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-medium text-stone-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Restock Batch Received">Restock Batch Received (Supplier PO)</option>
              <option value="Physical Warehouse Inventory Audit">Physical Warehouse Inventory Audit</option>
              <option value="Customer Return Restocked">Customer Return Restocked</option>
              <option value="Damaged / QC Defect Discard">Damaged / QC Defect Discard</option>
              <option value="Marketing Promo Sample">Marketing Promo / Influencer Sample</option>
              <option value="In-Store POS Direct Transfer">In-Store POS Direct Transfer</option>
            </select>
          </div>

          {/* Projected Result Box */}
          <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs flex justify-between items-center">
            <span className="text-stone-500">Projected Resulting Stock:</span>
            <span className="font-mono text-sm font-black text-indigo-600 dark:text-indigo-400">
              {currentStock} → {newStock} units
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm Adjustment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
