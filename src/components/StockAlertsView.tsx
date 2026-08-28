import React, { useState } from 'react';
import {
  AlertTriangle,
  Package,
  Plus,
  Send,
  Truck,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  Building,
  Calendar,
  FileText,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { StockAlert, PurchaseOrder, Product } from '../types';
import { formatPHP } from '../utils';

interface StockAlertsViewProps {
  stockAlerts: StockAlert[];
  purchaseOrders: PurchaseOrder[];
  products: Product[];
  onGeneratePO: (alertIds?: string[]) => void;
  onUpdatePOStatus: (poId: string, status: PurchaseOrder['status']) => void;
  onOpenStockAdjustModal: (product: Product) => void;
}

export const StockAlertsView: React.FC<StockAlertsViewProps> = ({
  stockAlerts,
  purchaseOrders,
  products,
  onGeneratePO,
  onUpdatePOStatus,
  onOpenStockAdjustModal
}) => {
  const [selectedTab, setSelectedTab] = useState<'alerts' | 'pos'>('alerts');

  const criticalCount = stockAlerts.filter(a => a.severity === 'critical').length;
  const warningCount = stockAlerts.filter(a => a.severity === 'warning').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Automated Stock Alerts & Reorder Engine</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stockout forecast, dynamic Reorder Point (ROP) triggers, and 1-click supplier PO dispatch.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {stockAlerts.length > 0 && (
            <button
              onClick={() => onGeneratePO()}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>1-Click Generate All Supplier POs ({stockAlerts.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-red-700 dark:text-red-300">
              Critical Stockout Imminent
            </span>
            <p className="text-2xl font-bold text-red-800 dark:text-red-200 mt-1">
              {criticalCount} SKUs
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              Stock &lt; 5 units or zero inventory
            </p>
          </div>
          <div className="p-3 rounded-lg bg-red-200/60 dark:bg-red-900 text-red-700 dark:text-red-300">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
              Reorder Point Reached
            </span>
            <p className="text-2xl font-bold text-amber-800 dark:text-amber-200 mt-1">
              {warningCount} SKUs
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              Below safety threshold
            </p>
          </div>
          <div className="p-3 rounded-lg bg-amber-200/60 dark:bg-amber-900 text-amber-700 dark:text-amber-300">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
              Active Purchase Orders
            </span>
            <p className="text-2xl font-bold text-indigo-800 dark:text-indigo-200 mt-1">
              {purchaseOrders.filter(p => p.status !== 'Received' && p.status !== 'Cancelled').length} POs
            </p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-0.5">
              Awaiting supplier delivery
            </p>
          </div>
          <div className="p-3 rounded-lg bg-indigo-200/60 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
            <Truck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs: Active Alerts vs Purchase Orders */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setSelectedTab('alerts')}
          className={`px-4 py-3 text-xs font-medium transition-all border-b-2 flex items-center gap-2 ${
            selectedTab === 'alerts'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Active Stock Warnings ({stockAlerts.length})</span>
        </button>

        <button
          onClick={() => setSelectedTab('pos')}
          className={`px-4 py-3 text-xs font-medium transition-all border-b-2 flex items-center gap-2 ${
            selectedTab === 'pos'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4 text-indigo-500" />
          <span>Supplier Purchase Orders ({purchaseOrders.length})</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE STOCK ALERTS */}
      {selectedTab === 'alerts' && (
        <div className="space-y-4">
          {stockAlerts.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                All Inventory Levels Healthy
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                No items are currently below their minimum safety thresholds.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stockAlerts.map(alert => {
                const prod = products.find(p => p.id === alert.productId);
                const isCritical = alert.severity === 'critical';

                return (
                  <div
                    key={alert.id}
                    className={`p-5 rounded-xl border shadow-sm transition-all ${
                      isCritical
                        ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/60'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {prod && (
                          <img
                            src={prod.image}
                            alt={alert.productName}
                            referrerPolicy="no-referrer"
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1 ${
                              isCritical
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                            }`}
                          >
                            {isCritical ? 'Critical Depletion' : 'Reorder Alert'}
                          </span>
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {alert.productName}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-mono">
                            SKU: {alert.sku} • Category: {alert.category}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-mono text-xl font-bold text-red-600 block">
                          {alert.currentStock} units left
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Threshold: {alert.threshold}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 text-xs">
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-semibold">
                          Est. Stockout
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {alert.estimatedDaysToOut === 0 ? 'Out of Stock' : `${alert.estimatedDaysToOut} days`}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-semibold">
                          Suggested Reorder
                        </span>
                        <span className="font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                          +{alert.reorderQty} units
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-semibold">
                          Supplier
                        </span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 truncate block">
                          {alert.supplierName}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between gap-2">
                      {prod && (
                        <button
                          onClick={() => onOpenStockAdjustModal(prod)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                          Manual Stock In
                        </button>
                      )}

                      <button
                        onClick={() => onGeneratePO([alert.id])}
                        className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Create PO ({alert.reorderQty} pcs)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PURCHASE ORDERS LIFECYCLE */}
      {selectedTab === 'pos' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">PO Number & Date</th>
                  <th className="px-4 py-3.5">Supplier</th>
                  <th className="px-4 py-3.5">Items & Quantities</th>
                  <th className="px-4 py-3.5">Total Cost</th>
                  <th className="px-4 py-3.5">Expected Delivery</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Fulfillment Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {purchaseOrders.map(po => {
                  return (
                    <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-4">
                        <span className="font-mono font-semibold text-slate-900 dark:text-white block">
                          #{po.poNumber}
                        </span>
                        <span className="text-[10px] text-slate-400">{po.createdAt}</span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {po.supplierName}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          {po.items.map((item, i) => (
                            <p key={i} className="text-xs text-slate-700 dark:text-slate-300">
                              {item.qty}x {item.name} ({item.sku})
                            </p>
                          ))}
                        </div>
                      </td>

                      <td className="px-4 py-4 font-bold text-slate-900 dark:text-white">
                        {formatPHP(po.totalCost)}
                      </td>

                      <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                        {po.expectedDate}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                            po.status === 'Received'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : po.status === 'In Transit'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : po.status === 'Sent'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {po.status}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        {po.status !== 'Received' && (
                          <button
                            onClick={() => onUpdatePOStatus(po.id, 'Received')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm inline-flex items-center gap-1.5"
                            title="Clicking this will automatically restock and increment SKU stock counts!"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Receive & Auto-Restock</span>
                          </button>
                        )}
                        {po.status === 'Received' && (
                          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Restocked to Inventory
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
