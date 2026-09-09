import React, { useState, useMemo } from 'react';
import {
  Layers,
  Search,
  Plus,
  ArrowUpDown,
  Edit2,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Radio,
  SlidersHorizontal,
  Download,
  ExternalLink,
  Package,
  TrendingUp,
  RefreshCw,
  History
} from 'lucide-react';
import { Product } from '../types';
import { formatPHP, exportToCSV } from '../utils';

interface InventoryViewProps {
  products: Product[];
  onOpenNewProductModal: () => void;
  onOpenStockAdjustModal: (product: Product) => void;
  onToggleChannelSync: (productId: string, channel: 'web' | 'shopee' | 'lazada' | 'tiktok') => void;
  onDeleteProduct: (productId: string) => void;
  onOpenHistory: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products = [],  // ✅ Add default value
  onOpenNewProductModal,
  onOpenStockAdjustModal,
  onToggleChannelSync,
  onDeleteProduct,
  onOpenHistory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');

  const categories = useMemo(() => {
    const set = new Set<string>();
    (products || []).forEach(p => {
      if (p && p.category) {
        set.add(p.category);
      }
    });
    return ['all', ...Array.from(set)];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const safeProducts = products || [];
    return safeProducts.filter(prod => {
      if (!prod) return false;
      
      if (categoryFilter !== 'all' && prod.category !== categoryFilter) return false;
      
      if (stockStatusFilter !== 'all') {
        if (stockStatusFilter === 'out' && prod.stock > 0) return false;
        if (stockStatusFilter === 'low' && (prod.stock > prod.lowStockThreshold || prod.stock === 0)) return false;
        if (stockStatusFilter === 'healthy' && prod.stock <= prod.lowStockThreshold) return false;
      }
      
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = prod.name?.toLowerCase().includes(query) || false;
        const matchesSku = prod.sku?.toLowerCase().includes(query) || false;
        const matchesBarcode = prod.barcode?.includes(query) || false;
        if (!matchesName && !matchesSku && !matchesBarcode) return false;
      }
      return true;
    });
  }, [products, categoryFilter, stockStatusFilter, searchTerm]);

  const handleExportCSV = () => {
    const rows = filteredProducts.map(p => ({
      SKU: p?.sku || 'N/A',
      Barcode: p?.barcode || 'N/A',
      Name: p?.name || 'N/A',
      Category: p?.category || 'N/A',
      SubCategory: p?.subCategory || 'N/A',
      Brand: p?.brand || 'N/A',
      Price: p?.price || 0,
      CostPrice: p?.costPrice || 0,
      Margin: p?.price ? `${(((p.price - (p.costPrice || 0)) / p.price) * 100).toFixed(1)}%` : '0%',
      Stock: p?.stock || 0,
      LowStockThreshold: p?.lowStockThreshold || 0,
      ReorderPoint: p?.reorderPoint || 0,
      Status: p?.status || 'Unknown',
      Supplier: p?.supplier?.name || 'N/A',
      SyncWeb: p?.channelSync?.web ? 'Yes' : 'No',
      SyncShopee: p?.channelSync?.shopee ? 'Yes' : 'No',
      SyncLazada: p?.channelSync?.lazada ? 'Yes' : 'No',
      SyncTikTok: p?.channelSync?.tiktok ? 'Yes' : 'No'
    }));
    exportToCSV(`CHUB_Inventory_${new Date().toISOString().split('T')[0]}`, rows);
  };

  const totalStockUnits = (products || []).reduce((sum, p) => sum + (p?.stock || 0), 0);
  const lowStockCount = (products || []).filter(p => (p?.stock || 0) <= (p?.lowStockThreshold || 0) && (p?.stock || 0) > 0).length;
  const outOfStockCount = (products || []).filter(p => (p?.stock || 0) === 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Multi-Channel Inventory Hub</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time stock synchronization, SKU variant controls, and multi-platform availability across Web, Shopee, Lazada & TikTok.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenHistory}
            className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-all shadow-sm flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>History</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg transition-all shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onOpenNewProductModal}
            className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New SKU</span>
          </button>
        </div>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase">Total SKUs in Stock</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              {totalStockUnits.toLocaleString()} units
            </p>
          </div>
          <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-orange-500 uppercase">Low Stock Warnings</span>
            <p className="text-2xl font-bold text-orange-600 mt-1">
              {lowStockCount} SKUs
            </p>
          </div>
          <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-red-500 uppercase">Depleted Stockouts</span>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {outOfStockCount} SKUs
            </p>
          </div>
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Row */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search SKU, Barcode, Product name..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Category */}
          <div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Categories</option>
              {categories
                .filter(c => c !== 'all')
                .map(cat => (
                  <option key={cat} value={cat}>
                    Category: {cat}
                  </option>
                ))}
            </select>
          </div>

          {/* Stock Health */}
          <div>
            <select
              value={stockStatusFilter}
              onChange={e => setStockStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Stock Statuses</option>
              <option value="healthy">In Stock (Healthy)</option>
              <option value="low">Low Stock (Threshold Triggered)</option>
              <option value="out">Out of Stock (Zero Units)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Product & SKU</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Pricing & Margin</th>
                <th className="px-4 py-3.5">Stock Level</th>
                <th className="px-4 py-3.5">Channel Sync Status</th>
                <th className="px-4 py-3.5">Supplier</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <Layers className="w-12 h-12 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No SKUs match criteria</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(prod => {
                  if (!prod) return null;
                  
                  const isOut = (prod.stock || 0) === 0;
                  const isLow = (prod.stock || 0) <= (prod.lowStockThreshold || 0) && (prod.stock || 0) > 0;
                  const marginPct = prod.price ? (((prod.price - (prod.costPrice || 0)) / prod.price) * 100).toFixed(0) : '0';

                  // ✅ Safe channel sync with fallback
                  const channelSync = prod.channelSync || { web: false, shopee: false, lazada: false, tiktok: false };

                  return (
                    <tr
                      key={prod.id || Math.random()}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Product & SKU */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={prod.image || ''}
                            alt={prod.name || 'Product'}
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="44" height="44"%3E%3Crect width="44" height="44" fill="%23e2e8f0"/%3E%3Ctext x="22" y="22" text-anchor="middle" dy=".3em" fill="%2394a3b8" font-size="10"%3ENo%20Image%3C/text%3E%3C/svg%3E';
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                              {prod.name || 'Unknown Product'}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">
                              SKU: {prod.sku || 'N/A'} • BAR: {prod.barcode || 'N/A'}
                            </p>
                            <div className="flex gap-1 mt-1">
                              {(prod.sizes || []).slice(0, 3).map(s => (
                                <span
                                  key={s}
                                  className="text-[9px] px-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono"
                                >
                                  {s}
                                </span>
                              ))}
                              {(prod.sizes || []).length > 3 && (
                                <span className="text-[9px] text-slate-400">+{(prod.sizes || []).length - 3}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {prod.category || 'N/A'}
                        </span>
                        <p className="text-[10px] text-slate-400">{prod.subCategory || 'N/A'}</p>
                      </td>

                      {/* Pricing & Margin */}
                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {formatPHP(prod.price || 0)}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            Cost: {formatPHP(prod.costPrice || 0)} ({marginPct}% margin)
                          </span>
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td className="px-4 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono text-sm font-bold ${
                                isOut ? 'text-red-600' : isLow ? 'text-orange-600' : 'text-emerald-600'
                              }`}
                            >
                              {prod.stock || 0} units
                            </span>
                            <span
                              className={`text-[9px] font-medium px-2 py-0.5 rounded-full ${
                                isOut
                                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                                  : isLow
                                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300'
                                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              }`}
                            >
                              {prod.status || 'Unknown'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">
                            Threshold: {prod.lowStockThreshold || 0} • ROP: {prod.reorderPoint || 0}
                          </p>
                        </div>
                      </td>

                      {/* Channel Sync Status Toggles */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5">
                          {(
                            [
                              { key: 'web', label: 'Web' },
                              { key: 'tiktok', label: 'TikTok' },
                              { key: 'shopee', label: 'Shopee' },
                              { key: 'lazada', label: 'Lazada' }
                            ] as const
                          ).map(ch => {
                            const isSync = channelSync[ch.key] || false;
                            return (
                              <button
                                key={ch.key}
                                onClick={() => onToggleChannelSync(prod.id, ch.key)}
                                className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                                  isSync
                                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                                    : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 opacity-60'
                                }`}
                                title={`Click to toggle ${ch.label} synchronization`}
                              >
                                {ch.label} {isSync ? '✓' : '✗'}
                              </button>
                            );
                          })}
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="px-4 py-4">
                        <div className="space-y-0.5">
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {prod.supplier?.name || 'N/A'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            Lead Time: {prod.supplier?.leadTimeDays || 0} days
                          </p>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenStockAdjustModal(prod)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors shadow-sm"
                            title="Adjust Stock / Receive Shipment"
                          >
                            Adjust Stock
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete SKU ${prod.sku || 'this product'}?`)) {
                                onDeleteProduct(prod.id);
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};