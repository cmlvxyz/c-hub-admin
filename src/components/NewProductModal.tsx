import React, { useState } from 'react';
import { X, Plus, Package, Sparkles, Image as ImageIcon } from 'lucide-react';
import { Product } from '../types';

interface NewProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (productData: Partial<Product>) => void;
}

export const NewProductModal: React.FC<NewProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Apparel');
  const [subCategory, setSubCategory] = useState('Hoodies & Sweats');
  const [sku, setSku] = useState(`CHUB-${Math.floor(100 + Math.random() * 900)}`);
  const [barcode, setBarcode] = useState(`48065123${Math.floor(1000 + Math.random() * 9000)}`);
  const [brand, setBrand] = useState('C-HUB Originals');
  const [price, setPrice] = useState<number>(1450);
  const [costPrice, setCostPrice] = useState<number>(680);
  const [stock, setStock] = useState<number>(30);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(10);
  const [reorderPoint, setReorderPoint] = useState<number>(15);
  const [reorderQty, setReorderQty] = useState<number>(50);
  const [supplierName, setSupplierName] = useState('Metro Garments Corp.');
  const [supplierContact, setSupplierContact] = useState('supply@metrogarments.ph');
  const [image, setImage] = useState(
    'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80'
  );
  const [sizes, setSizes] = useState<string>('S, M, L, XL');
  const [colors, setColors] = useState<string>('Black, Ash Grey, Charcoal');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddProduct({
      name,
      category,
      subCategory,
      sku: sku || `CHUB-${Date.now().toString().slice(-4)}`,
      barcode,
      brand,
      price: Number(price),
      costPrice: Number(costPrice),
      stock: Number(stock),
      lowStockThreshold: Number(lowStockThreshold),
      reorderPoint: Number(reorderPoint),
      reorderQty: Number(reorderQty),
      image,
      sizes: sizes.split(',').map(s => s.trim()).filter(Boolean),
      colors: colors.split(',').map(c => c.trim()).filter(Boolean),
      supplier: {
        name: supplierName,
        contact: supplierContact,
        leadTimeDays: 5
      },
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true }
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Add New Inventory SKU
              </h3>
              <p className="text-xs text-slate-500">
                Register new catalog item with automatic multi-platform synchronization
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product Name */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Product Title / Name *
              </label>
              <input
                type="text"
                placeholder="e.g. C-HUB Heavyweight Fleece Zip Hoodie"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            {/* SKU & Barcode */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">SKU Code</label>
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">EAN/UPC Barcode</label>
              <input
                type="text"
                value={barcode}
                onChange={e => setBarcode(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            {/* Category & SubCategory */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Apparel">Apparel</option>
                <option value="Footwear">Footwear</option>
                <option value="Accessories">Accessories</option>
                <option value="Gear">Gear & Tech</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">Sub-Category</label>
              <input
                type="text"
                value={subCategory}
                onChange={e => setSubCategory(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Pricing */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Retail Price (₱) *
              </label>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Cost Price / COGS (₱)
              </label>
              <input
                type="number"
                value={costPrice}
                onChange={e => setCostPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Stock Counts */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Initial Stock Count
              </label>
              <input
                type="number"
                value={stock}
                onChange={e => setStock(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Low-Stock Alert Threshold
              </label>
              <input
                type="number"
                value={lowStockThreshold}
                onChange={e => setLowStockThreshold(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Image URL */}
            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Product Image URL
              </label>
              <input
                type="text"
                value={image}
                onChange={e => setImage(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Variants */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Sizes (Comma separated)
              </label>
              <input
                type="text"
                value={sizes}
                onChange={e => setSizes(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Colors (Comma separated)
              </label>
              <input
                type="text"
                value={colors}
                onChange={e => setColors(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Supplier Info */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Supplier / Manufacturer
              </label>
              <input
                type="text"
                value={supplierName}
                onChange={e => setSupplierName(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Supplier Email / Order Desk
              </label>
              <input
                type="text"
                value={supplierContact}
                onChange={e => setSupplierContact(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Save & Publish SKU</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
