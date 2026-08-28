import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  CheckCircle2,
  Sparkles,
  Truck,
  ShieldCheck,
  QrCode,
  ArrowRight,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, PaymentMethod, SalesChannel } from '../types';
import { formatPHP } from '../utils';

interface StoreCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onCreateOrder: (orderData: any) => Promise<boolean>;
}

interface CartItem {
  product: Product;
  qty: number;
  selectedSize: string;
  selectedColor: string;
}

export const StoreCheckoutModal: React.FC<StoreCheckoutModalProps> = ({
  isOpen,
  onClose,
  products,
  onCreateOrder
}) => {
  const [cart, setCart] = useState<CartItem[]>([
    {
      product: products[0] || {
        id: 'prod-001',
        sku: 'CHUB-HD-001',
        name: 'C-HUB Signature Heavyweight Hoodie',
        price: 1850,
        costPrice: 920,
        stock: 4,
        image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80',
        sizes: ['M', 'L', 'XL'],
        colors: ['Onyx Black', 'Heather Ash'],
        category: 'Apparel',
        subCategory: 'Hoodies'
      } as any,
      qty: 1,
      selectedSize: 'L',
      selectedColor: 'Onyx Black'
    }
  ]);

  const [customerName, setCustomerName] = useState('Edrian Dela Cruz');
  const [customerEmail, setCustomerEmail] = useState('edrian.delacruz@apcas.ph');
  const [customerPhone, setCustomerPhone] = useState('+63 917 888 5432');
  const [customerAddress, setCustomerAddress] = useState('Unit 1204 Grand Riviera Suites, Roxas Blvd');
  const [customerCity, setCustomerCity] = useState('Manila');
  const [customerProvince, setCustomerProvince] = useState('Metro Manila');
  const [customerPostal, setCustomerPostal] = useState('1000');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('GCash');
  const [channel, setChannel] = useState<SalesChannel>('Online Store');
  const [discountCode, setDiscountCode] = useState('CHUBVIP');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  const discount = discountCode.toUpperCase() === 'CHUBVIP' ? Math.round(subtotal * 0.1) : 0;
  const shipping = subtotal > 2000 ? 0 : 120;
  const total = subtotal - discount + shipping;

  const handleAddToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          product,
          qty: 1,
          selectedSize: product.sizes[0] || 'Standard',
          selectedColor: product.colors[0] || 'Default'
        }
      ];
    });
  };

  const handleUpdateQty = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsProcessing(true);

    const costTotal = cart.reduce((sum, i) => sum + (i.product.costPrice || 450) * i.qty, 0);

    const orderPayload = {
      orderId: `CHUB-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customer: {
        id: `cust-${Date.now()}`,
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress,
        city: customerCity,
        province: customerProvince,
        postalCode: customerPostal,
        tier: total > 5000 ? 'VIP' : total > 2500 ? 'Gold' : 'Standard',
        totalOrders: 1,
        totalSpent: total
      },
      items: cart.map(item => ({
        id: `item-${Date.now()}-${item.product.id}`,
        productId: item.product.id,
        sku: item.product.sku,
        name: item.product.name,
        price: item.product.price,
        costPrice: item.product.costPrice || 450,
        qty: item.qty,
        image: item.product.image,
        size: item.selectedSize,
        color: item.selectedColor,
        subCategory: item.product.subCategory
      })),
      subtotal,
      shipping,
      discount,
      discountCode: discount > 0 ? discountCode : '',
      tax: 0,
      total,
      costTotal,
      payment: {
        method: paymentMethod,
        status: paymentMethod.includes('COD') ? 'Pending' : 'Paid',
        transactionId: `${paymentMethod.slice(0, 2).toUpperCase()}-${Date.now()}`,
        paidAt: new Date().toLocaleString(),
        fee: Math.round(total * 0.015)
      },
      status: paymentMethod.includes('COD') ? 'To Ship' : 'To Ship',
      fulfillment: {
        carrier: 'J&T Express',
        trackingNumber: `JT-PH-${Math.floor(100000000 + Math.random() * 900000000)}`,
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        timeline: [
          {
            status: 'Order Placed & Confirmed',
            time: new Date().toLocaleTimeString(),
            location: 'C-HUB Storefront',
            note: `Payment authorized via ${paymentMethod}`,
            completed: true
          }
        ]
      },
      channel
    };

    const success = await onCreateOrder(orderPayload);
    setIsProcessing(false);

    if (success) {
      setOrderSuccess(orderPayload);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // ignore
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold">C-HUB Store Customer Checkout Simulator</h3>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
                  Live Sync Sandbox
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Simulates real customer checkout — watch it auto-decrement inventory and ping admin orders in real time!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {orderSuccess ? (
          <div className="p-8 text-center space-y-4 max-w-md mx-auto my-auto animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Order Placed Successfully!
            </h3>
            <p className="text-xs text-slate-500">
              Order <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{orderSuccess.orderId}</span> has been processed via {orderSuccess.payment.method} and synchronized to the C-HUB Admin fulfillment pipeline.
            </p>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1">
              <div className="flex justify-between font-semibold">
                <span>Customer:</span>
                <span>{orderSuccess.customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Paid:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatPHP(orderSuccess.total)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tracking Ref:</span>
                <span className="font-mono">{orderSuccess.fulfillment.trackingNumber}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setOrderSuccess(null);
                  setCart([]);
                }}
                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold rounded-lg text-xs transition-colors"
              >
                Place Another Test Order
              </button>
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition-colors shadow-sm"
              >
                Back to Admin Panel
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCheckoutSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Product Picker & Shopping Cart */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <ShoppingCart className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    1. Cart & Selected Items ({cart.length})
                  </h4>
                  <span className="text-[10px] text-slate-400">Click below to add more items</span>
                </div>

                {/* Cart Items */}
                <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  {cart.length === 0 ? (
                    <div className="py-6 text-center text-slate-400">
                      Cart is empty. Select a product below.
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            referrerPolicy="no-referrer"
                            className="w-11 h-11 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 dark:text-white truncate">
                              {item.product.name}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              {formatPHP(item.product.price)} • Size: {item.selectedSize}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.product.id, -1)}
                            className="p-1 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono font-semibold w-4 text-center">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => handleUpdateQty(item.product.id, 1)}
                            className="p-1 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Quick Add Product Chips */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-500">Quick Add C-HUB Items:</span>
                  <div className="grid grid-cols-2 gap-2">
                    {products.slice(0, 4).map(p => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => handleAddToCart(p)}
                        className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-left transition-all flex items-center gap-2 group"
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-md object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-[11px] text-slate-900 dark:text-white truncate">
                            {p.name}
                          </p>
                          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                            {formatPHP(p.price)}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal:</span>
                    <span>{formatPHP(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Shipping (Metro Manila):</span>
                    <span>{shipping === 0 ? 'FREE (Orders > ₱2k)' : formatPHP(shipping)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-red-600 font-semibold">
                      <span>VIP Discount (10%):</span>
                      <span>-{formatPHP(discount)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                    <span>Order Total:</span>
                    <span className="text-indigo-600 dark:text-indigo-400">{formatPHP(total)}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Customer Shipping & Payment Gateway */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  2. Shipping & Consignee Info
                </h4>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Customer Full Name
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={e => setCustomerEmail(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-700 dark:text-slate-300">
                      Street Address & Unit
                    </label>
                    <input
                      type="text"
                      value={customerAddress}
                      onChange={e => setCustomerAddress(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">City</label>
                      <input
                        type="text"
                        value={customerCity}
                        onChange={e => setCustomerCity(e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-700 dark:text-slate-300">Channel</label>
                      <select
                        value={channel}
                        onChange={e => setChannel(e.target.value as SalesChannel)}
                        className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-medium text-slate-900 dark:text-white"
                      >
                        <option value="Online Store">Online Web Store</option>
                        <option value="TikTok Shop">TikTok Shop</option>
                        <option value="Shopee">Shopee</option>
                        <option value="Lazada">Lazada</option>
                        <option value="In-Store POS">In-Store POS</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Payment Gateway Picker */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    3. Select Payment Gateway
                  </h4>

                  <div className="grid grid-cols-2 gap-2">
                    {(
                      [
                        { id: 'GCash', label: 'GCash QR & Direct', badge: 'Popular' },
                        { id: 'Maya', label: 'Maya Checkout', badge: 'Instant' },
                        { id: 'Credit/Debit Card (Visa/Mastercard)', label: 'Cards (Visa/MC)', badge: '3D Secure' },
                        { id: 'Cash on Delivery (COD)', label: 'Cash on Delivery', badge: 'Doorstep' },
                        { id: 'Billease BNPL', label: 'Billease Installments', badge: '0% Interest' },
                        { id: 'BPI/BDO Bank Transfer', label: 'BPI/BDO Online', badge: 'Direct' }
                      ] as const
                    ).map(gw => {
                      const isSelected = paymentMethod === gw.id;
                      return (
                        <button
                          type="button"
                          key={gw.id}
                          onClick={() => setPaymentMethod(gw.id as PaymentMethod)}
                          className={`p-2.5 rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 ring-2 ring-indigo-500/20 text-indigo-900 dark:text-indigo-200'
                              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[11px] truncate">{gw.label}</span>
                            <span className="text-[9px] px-1 rounded bg-slate-200 dark:bg-slate-700 font-mono">
                              {gw.badge}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isProcessing || cart.length === 0}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-lg transition-all shadow-sm flex items-center justify-center gap-2 text-sm"
                >
                  {isProcessing ? (
                    <span>Processing Gateway Authorization...</span>
                  ) : (
                    <>
                      <span>Place Order & Pay {formatPHP(total)}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
