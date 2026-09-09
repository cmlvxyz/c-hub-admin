import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { InventoryView } from './components/InventoryView';
import { StockAlertsView } from './components/StockAlertsView';
import { PaymentGatewaysView } from './components/PaymentGatewaysView';
import { ReportsView } from './components/ReportsView';
import { CustomerReviewsView } from './components/CustomerReviewsView';
import { VouchersView } from './components/VouchersView';
import { OrderDetailModal } from './components/OrderDetailModal';
import { PrintWaybillModal } from './components/PrintWaybillModal';
import { NewProductModal } from './components/NewProductModal';
import { StockAdjustmentModal } from './components/StockAdjustmentModal';
import { InventoryHistoryModal } from './components/InventoryHistoryModal';
import { StoreCheckoutModal } from './components/StoreCheckoutModal';
import { TeamView } from './components/TeamView';
import { AuditLogsView } from './components/AuditLogsView';
import {
  Order,
  Product,
  StockAlert,
  PurchaseOrder,
  Review,
  PaymentGatewayConfig,
  OrderStatus,
  Voucher,
  AdminAccount,
  RoleDef,
  AuditLog
} from './types';
import { playNotificationChime } from './utils';
import { API_BASE, bootstrapAdminSession, adminFetch, adminSSEUrl, getAdminToken } from './service/adminApi';

const API_BASE_URL = API_BASE;

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    sku: 'CHUB-HD-001',
    barcode: '480651234001',
    name: 'C-HUB Signature Heavyweight Hoodie',
    category: 'Apparel',
    subCategory: 'Hoodies & Sweats',
    brand: 'C-HUB Originals',
    price: 1850,
    costPrice: 920,
    stock: 4,
    reservedStock: 2,
    lowStockThreshold: 10,
    reorderPoint: 15,
    reorderQty: 50,
    status: 'Low Stock',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80',
    sizes: ['S', 'M', 'L', 'XL', '2XL'],
    colors: ['Onyx Black', 'Heather Ash', 'Forest Green'],
    channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
    supplier: { name: 'Metro Garments Corp.', contact: 'supply@metrogarments.ph', leadTimeDays: 5 },
    salesVelocity7d: 14,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-002',
    sku: 'CHUB-CG-002',
    barcode: '480651234002',
    name: 'C-HUB Tactical Utility Cargo Pants',
    category: 'Apparel',
    subCategory: 'Bottoms',
    brand: 'C-HUB Street',
    price: 1650,
    costPrice: 780,
    stock: 28,
    reservedStock: 4,
    lowStockThreshold: 8,
    reorderPoint: 12,
    reorderQty: 40,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=500&auto=format&fit=crop&q=80',
    sizes: ['28', '30', '32', '34', '36'],
    colors: ['Khaki Slate', 'Midnight Black', 'Military Olive'],
    channelSync: { web: true, shopee: true, lazada: true, tiktok: false },
    supplier: { name: 'Apex Textile Works', contact: 'sales@apextextile.ph', leadTimeDays: 7 },
    salesVelocity7d: 18,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-003',
    sku: 'CHUB-TEE-003',
    barcode: '480651234003',
    name: 'C-HUB Acid Wash Boxy Oversized Tee',
    category: 'Apparel',
    subCategory: 'T-Shirts',
    brand: 'C-HUB Originals',
    price: 850,
    costPrice: 380,
    stock: 32,
    reservedStock: 1,
    lowStockThreshold: 12,
    reorderPoint: 20,
    reorderQty: 80,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80',
    sizes: ['M', 'L', 'XL'],
    colors: ['Vintage Charcoal', 'Washed Mocha', 'Bleached Stone'],
    channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
    supplier: { name: 'Metro Garments Corp.', contact: 'supply@metrogarments.ph', leadTimeDays: 5 },
    salesVelocity7d: 22,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-004',
    sku: 'CHUB-SNK-004',
    barcode: '480651234004',
    name: 'C-HUB Alpha Pro Retro Sneaker',
    category: 'Footwear',
    subCategory: 'Sneakers',
    brand: 'C-HUB Kicks',
    price: 3450,
    costPrice: 1750,
    stock: 3,
    reservedStock: 3,
    lowStockThreshold: 6,
    reorderPoint: 10,
    reorderQty: 30,
    status: 'Low Stock',
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500&auto=format&fit=crop&q=80',
    sizes: ['US 8', 'US 9', 'US 10', 'US 11'],
    colors: ['Cloud White / Crimson', 'Panda Monocrome'],
    channelSync: { web: true, shopee: false, lazada: true, tiktok: true },
    supplier: { name: 'Kicks Craft Footwear', contact: 'orders@kickscraft.com', leadTimeDays: 10 },
    salesVelocity7d: 9,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'prod-005',
    sku: 'CHUB-BAG-005',
    barcode: '480651234005',
    name: 'C-HUB Modular Cordura Crossbody Bag',
    category: 'Accessories',
    subCategory: 'Bags & Packs',
    brand: 'C-HUB Gear',
    price: 1150,
    costPrice: 480,
    stock: 45,
    reservedStock: 2,
    lowStockThreshold: 10,
    reorderPoint: 15,
    reorderQty: 50,
    status: 'In Stock',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80',
    sizes: ['One Size'],
    colors: ['Stealth Black', 'Coyote Tan'],
    channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
    supplier: { name: 'Urban Pack Industries', contact: 'b2b@urbanpack.ph', leadTimeDays: 4 },
    salesVelocity7d: 12,
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_GATEWAYS: PaymentGatewayConfig[] = [
  {
    id: 'gcash',
    name: 'GCash Direct & QR',
    type: 'E-Wallet',
    icon: 'gcash',
    enabled: true,
    testMode: false,
    feeFixed: 0,
    feePercentage: 1.5,
    successRate: 99.4,
    dailyVolume: 148500,
    health: 'healthy'
  },
  {
    id: 'maya',
    name: 'Maya Wallet & Checkout',
    type: 'E-Wallet',
    icon: 'maya',
    enabled: true,
    testMode: false,
    feeFixed: 0,
    feePercentage: 1.5,
    successRate: 98.9,
    dailyVolume: 92400,
    health: 'healthy'
  },
  {
    id: 'cards',
    name: 'Visa / Mastercard / JCB',
    type: 'Credit/Debit Card',
    icon: 'card',
    enabled: true,
    testMode: false,
    feeFixed: 15,
    feePercentage: 2.9,
    successRate: 97.8,
    dailyVolume: 215000,
    health: 'healthy'
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    type: 'Offline',
    icon: 'cash',
    enabled: true,
    testMode: false,
    feeFixed: 25,
    feePercentage: 0,
    successRate: 92.5,
    dailyVolume: 64000,
    health: 'healthy'
  }
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-001',
    orderId: 'CHUB-ORD-1089',
    customerName: 'Maria Santos',
    productName: 'C-HUB Signature Heavyweight Hoodie',
    rating: 5,
    comment: 'Super fast delivery via J&T! The fabric is thick and authentic heavyweight. Will order again.',
    verifiedPurchase: true,
    date: 'Yesterday, 4:10 PM',
    status: 'published',
    adminReply: {
      comment: 'Thank you Maria! We appreciate your loyalty as a C-HUB VIP member.',
      date: 'Yesterday, 5:30 PM'
    }
  }
];

// ✅ Function para i-normalize ang order structure (Store + Backend format support)
const normalizeOrder = (o: any): Order => {
  const paymentMethod = typeof o.payment === 'string'
    ? o.payment
    : o.payment?.method || 'Cash on Delivery';

  const isPaid = typeof o.payment === 'object'
    ? o.payment?.status === 'Paid'
    : o.status === 'Completed' || o.isPaid || false;

  const rawTotal = Number(o.total ?? o.subtotal ?? 0);
  const rawSubtotal = Number(o.subtotal ?? o.total ?? 0);
  const rawCost = Number(o.costTotal ?? (rawTotal ? rawTotal * 0.5 : 0));

  return {
    ...o,
    orderId: o.orderId || o.id || `CHUB-${Math.floor(100000 + Math.random() * 900000)}`,
    orderNumber: o.orderNumber || `${Math.floor(1000 + Math.random() * 9000)}`,
    date: o.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    total: rawTotal,
    subtotal: rawSubtotal,
    costTotal: rawCost,
    shipping: Number(o.shipping || 0),
    discount: Number(o.discount || 0),
    discountCode: o.discountCode || '',
    tax: Number(o.tax || 0),
    status: o.status || 'To Ship',
    channel: o.channel || 'Online Store',
    customer: {
      id: o.customer?.id || 'cust-1',
      name: o.customer?.name || o.customerName || 'Valued Customer',
      email: o.customer?.email || o.customerEmail || 'customer@chub.ph',
      phone: o.customer?.phone || o.customerPhone || '09123456789',
      address: o.customer?.address || o.shippingAddress?.address || 'Metro Manila',
      city: o.customer?.city || o.shippingAddress?.city || 'Manila',
      province: o.customer?.province || 'Metro Manila',
      postalCode: o.customer?.postalCode || '1000',
      tier: o.customer?.tier || (rawTotal > 4000 ? 'VIP' : 'Standard'),
      totalOrders: o.customer?.totalOrders || 1,
      totalSpent: o.customer?.totalSpent || rawTotal
    },
    payment: {
      method: paymentMethod as any,
      status: isPaid ? 'Paid' : 'Pending',
      transactionId: o.payment?.transactionId || `TXN-${Date.now()}`,
      paidAt: o.payment?.paidAt || (isPaid ? new Date().toISOString() : undefined),
      fee: o.payment?.fee || Math.round(rawTotal * 0.015)
    },
    fulfillment: {
      carrier: o.fulfillment?.carrier || 'J&T Express',
      trackingNumber: o.fulfillment?.trackingNumber || o.trackingNumber || `JT-PH-${Math.floor(100000000 + Math.random() * 900000000)}`,
      estimatedDelivery: o.fulfillment?.estimatedDelivery || '2-3 Business Days',
      timeline: o.fulfillment?.timeline || [
        {
          status: 'Order Placed & Confirmed',
          time: new Date().toLocaleTimeString(),
          location: 'C-HUB Central Store',
          note: `Payment authorized via ${paymentMethod}`,
          completed: true
        }
      ]
    },
    items: (o.items || []).map((item: any, idx: number) => {
      let img = item.image || '';
      if (img && !img.startsWith('http://') && !img.startsWith('https://')) {
        img = `${API_BASE_URL}${img.startsWith('/') ? '' : '/'}${img}`;
      }
      return {
        ...item,
        id: item.id || item.productId || `item-${idx}`,
        productId: item.productId || item.id || `prod-${idx}`,
        sku: item.sku || 'CHUB-SKU',
        name: item.name || 'Product Item',
        price: Number(item.price || 0),
        costPrice: Number(item.costPrice || item.price * 0.5 || 0),
        qty: Number(item.qty || item.quantity || 1),
        image: img || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80',
        size: item.size || 'XL',
        color: item.color || 'Standard',
        subCategory: item.subCategory || 'Apparel'
      };
    }),
    updatedAt: o.updatedAt || new Date().toISOString()
  };
};

// ✅ I-map ang backend product (computed stockStatus) papunta sa admin Product shape.
const normalizeProduct = (p: any): Product => ({
  id: p.id,
  sku: p.sku || '',
  barcode: p.barcode || '',
  name: p.name || 'Product',
  category: p.category || 'Apparel',
  subCategory: p.subCategory || 'General',
  brand: p.brand || '',
  price: Number(p.price) || 0,
  costPrice: Number(p.costPrice) || 0,
  stock: Number(p.stock) || 0,
  reservedStock: Number(p.reservedStock) || 0,
  lowStockThreshold: Number(p.lowStockThreshold) || 10,
  reorderPoint: Number(p.reorderPoint) || 15,
  reorderQty: Number(p.reorderQty) || 50,
  status: (p.stockStatus || (Number(p.stock) === 0 ? 'Out of Stock' : Number(p.stock) <= Number(p.lowStockThreshold) ? 'Low Stock' : 'In Stock')) as Product['status'],
  image: p.image || '',
  sizes: Array.isArray(p.sizes) ? p.sizes : [],
  colors: Array.isArray(p.colors) ? p.colors : [],
  channelSync: p.channelSync || { web: false, shopee: false, lazada: false, tiktok: false },
  supplier: p.supplier || { name: '', contact: '', leadTimeDays: 0 },
  salesVelocity7d: Number(p.salesVelocity7d) || 0,
  updatedAt: p.updatedAt || new Date().toISOString()
});

// ✅ Function para mag-load ng orders mula sa server
const loadOrdersFromServer = async (): Promise<Order[]> => {
  try {
    const response = await adminFetch(`${API_BASE_URL}/api/orders`);
    if (response.ok) {
      const serverOrders = await response.json();
      if (Array.isArray(serverOrders)) {
        console.log(`📦 Loaded ${serverOrders.length} orders from server`);
        return serverOrders.map(normalizeOrder);
      }
    }
    return [];
  } catch (error) {
    console.error('Failed to load orders from server:', error);
    return [];
  }
};

export function App() {
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('chub_theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Data Store States
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>(INITIAL_GATEWAYS);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [roleDefs, setRoleDefs] = useState<RoleDef[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Modal States
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [selectedOrderForWaybill, setSelectedOrderForWaybill] = useState<Order | null>(null);
  const [isNewProductOpen, setIsNewProductOpen] = useState<boolean>(false);
  const [selectedProductForStockAdjust, setSelectedProductForStockAdjust] = useState<Product | null>(null);
  const [isInventoryHistoryOpen, setIsInventoryHistoryOpen] = useState<boolean>(false);
  const [isStoreCheckoutOpen, setIsStoreCheckoutOpen] = useState<boolean>(false);

  // Live Toast & Status
  const [liveToast, setLiveToast] = useState<{ message: string; id: string } | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [searchGlobal, setSearchGlobal] = useState<string>('');

  // Fetch initial data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const serverOrders = await loadOrdersFromServer();
      setOrders(serverOrders);

      if (API_BASE_URL) {
        const [prodRes, revRes, gwRes, vouchRes] = await Promise.all([
          adminFetch(`${API_BASE_URL}/api/products`).then(r => (r.ok ? r.json() : null)),
          adminFetch(`${API_BASE_URL}/api/admin/reviews`).then(r => (r.ok ? r.json() : null)),
          adminFetch(`${API_BASE_URL}/api/gateways`).then(r => (r.ok ? r.json() : null)),
          adminFetch(`${API_BASE_URL}/api/vouchers`).then(r => (r.ok ? r.json() : null))
        ]);

        if (prodRes && Array.isArray(prodRes) && prodRes.length > 0) setProducts(prodRes.map(normalizeProduct));
        if (revRes && Array.isArray(revRes) && revRes.length > 0) setReviews(revRes);
        if (gwRes && Array.isArray(gwRes) && gwRes.length > 0) setGateways(gwRes);
        if (vouchRes && Array.isArray(vouchRes)) setVouchers(vouchRes);

        // Team & roles (RBAC) — susubukan kahit limited ang role; 403 = walang access.
        const [adminsRes, rolesRes] = await Promise.all([
          adminFetch(`${API_BASE_URL}/api/admin/admins`).then(r => (r.ok ? r.json() : null)),
          adminFetch(`${API_BASE_URL}/api/admin/roles`).then(r => (r.ok ? r.json() : null))
        ]);
        if (Array.isArray(adminsRes)) setAdmins(adminsRes);
        if (rolesRes?.roles) setRoleDefs(rolesRes.roles);

        // Audit trail (audit.view) — 403 = walang access, huwag ipakita.
        const auditRes = await adminFetch(`${API_BASE_URL}/api/admin/audit`).then(r => (r.ok ? r.json() : null));
        if (auditRes?.logs && Array.isArray(auditRes.logs)) setAuditLogs(auditRes.logs);
      }
      setIsLiveConnected(true);
    } catch (err) {
      console.warn('Backend connect notice:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Real-time SSE Event Source & Auto Polling
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let cancelled = false;

    // 1. Bootstrap admin session (auto-login), then load initial data
    (async () => {
      await bootstrapAdminSession();
      if (cancelled) return;
      await fetchData();

      // 2. Setup SSE stream for instant real-time updates (?token= query param)
      try {
        eventSource = new EventSource(adminSSEUrl('/api/orders/stream/public'));

        eventSource.addEventListener('new-order', (event: any) => {
          try {
            const rawOrder = JSON.parse(event.data);
            const newNormalizedOrder = normalizeOrder(rawOrder);
            setOrders(prev => [newNormalizedOrder, ...prev.filter(o => o.orderId !== newNormalizedOrder.orderId)]);
            if (soundEnabled) playNotificationChime('order');
            setLiveToast({
              message: `⚡ New Order #${newNormalizedOrder.orderId} received! Total: ₱${newNormalizedOrder.total.toLocaleString()}`,
              id: Date.now().toString()
            });
          } catch (err) {
            console.error('Error parsing SSE new-order:', err);
          }
        });

        eventSource.addEventListener('order-updated', (event: any) => {
          try {
            const rawOrder = JSON.parse(event.data);
            const updated = normalizeOrder(rawOrder);
            setOrders(prev => prev.map(o => o.orderId === updated.orderId ? updated : o));
          } catch (err) {
            console.error('Error parsing SSE order-updated:', err);
          }
        });

        eventSource.addEventListener('order-deleted', (event: any) => {
          try {
            const { orderId } = JSON.parse(event.data);
            setOrders(prev => prev.filter(o => o.orderId !== orderId));
          } catch (err) {}
        });

        eventSource.addEventListener('vouchers-updated', (event: any) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload?.deleted) {
              setVouchers(prev => prev.filter(v => v.code !== payload.code));
            } else if (payload?.id) {
              setVouchers(prev => {
                const exists = prev.some(v => v.id === payload.id);
                return exists ? prev.map(v => (v.id === payload.id ? payload : v)) : [payload, ...prev];
              });
            }
          } catch (err) {}
        });

        eventSource.onerror = () => {
          setIsLiveConnected(false);
        };

        eventSource.onopen = () => {
          setIsLiveConnected(true);
        };
      } catch (e) {
        console.warn('SSE not initialized:', e);
      }
    })();

    // 3. Background Polling every 5 seconds (Safety net)
    const interval = setInterval(async () => {
      if (!getAdminToken()) return;
      const serverOrders = await loadOrdersFromServer();
      if (serverOrders.length > 0) {
        setOrders(serverOrders);
      }
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      if (eventSource) eventSource.close();
    };
  }, [fetchData, soundEnabled]);

  // Compute live stock alerts from product stock
  const stockAlerts: StockAlert[] = products
    .filter(p => p && p.stock <= p.lowStockThreshold)
    .map(p => ({
      id: `alert-${p.id}`,
      productId: p.id,
      sku: p.sku,
      productName: p.name,
      category: p.category,
      currentStock: p.stock,
      threshold: p.lowStockThreshold,
      reorderPoint: p.reorderPoint,
      reorderQty: p.reorderQty,
      supplierName: p.supplier?.name || 'Metro Garments',
      estimatedDaysToOut: p.stock === 0 ? 0 : Math.max(1, Math.round(p.stock / 2)),
      severity: p.stock === 0 || p.stock <= 5 ? 'critical' : 'warning',
      status: 'active',
      createdAt: new Date().toISOString()
    }));

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('chub_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('chub_theme', 'light');
    }
  }, [isDarkMode]);

  // Auto clear toast
  useEffect(() => {
    if (liveToast) {
      const timer = setTimeout(() => setLiveToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [liveToast]);

  // Order Actions — ang backend ang siyang nagpapatunay ng bawat transition.
  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus, note?: string) => {
    let failureMessage = '';
    try {
      const response = await adminFetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ status, note })
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        failureMessage = body?.error || `Transition to "${status}" was rejected by the backend.`;
      }
    } catch (error) {
      console.error('Failed to sync order status:', error);
      failureMessage = 'Network error while updating order status.';
    }

    if (failureMessage) {
      // I-revert sa totoong server state
      const serverOrders = await loadOrdersFromServer();
      if (serverOrders.length > 0) setOrders(serverOrders);
      setLiveToast({ message: `⚠️ ${failureMessage}`, id: Date.now().toString() });
      return;
    }

    setOrders((prev: Order[]) =>
      prev.map(o => {
        if (o.orderId === orderId) {
          const updatedTimeline = [
            ...(o.fulfillment?.timeline || []),
            {
              status: `Status changed to ${status}`,
              time: new Date().toLocaleTimeString(),
              location: 'C-HUB Operations Hub',
              note: note || `Manual status update to ${status}`,
              completed: true
            }
          ];
          return {
            ...o,
            status,
            fulfillment: {
              ...o.fulfillment,
              timeline: updatedTimeline
            },
            updatedAt: new Date().toISOString()
          };
        }
        return o;
      })
    );

    if (selectedOrderForDetail?.orderId === orderId) {
      setSelectedOrderForDetail(prev => (prev ? { ...prev, status, updatedAt: new Date().toISOString() } : null));
    }

    if (soundEnabled) playNotificationChime('order');
    setLiveToast({
      message: `Order #${orderId} moved to "${status}"`,
      id: Date.now().toString()
    });
  };

  const applyOrderDecision = async (
    orderId: string,
    endpoint: 'refund-decision' | 'return-decision',
    payload: { approve: boolean; amount?: number; method?: string; note?: string }
  ): Promise<boolean> => {
    try {
      const response = await adminFetch(`${API_BASE_URL}/api/admin/orders/${orderId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setLiveToast({ message: `⚠️ ${data?.error || 'Decision rejected by the backend.'}`, id: Date.now().toString() });
        const serverOrders = await loadOrdersFromServer();
        if (serverOrders.length > 0) setOrders(serverOrders);
        return false;
      }
      if (data?.order) {
        setOrders(prev => prev.map(o => (o.orderId === orderId ? data.order : o)));
        if (selectedOrderForDetail?.orderId === orderId) setSelectedOrderForDetail(data.order);
      }
      if (soundEnabled) playNotificationChime('order');
      setLiveToast({ message: `Order #${orderId} ${payload.approve ? 'approved' : 'denied'} (${endpoint.replace('-decision', '')})`, id: Date.now().toString() });
      return true;
    } catch (error) {
      console.error(`Failed to apply ${endpoint}:`, error);
      setLiveToast({ message: 'Network error while processing decision.', id: Date.now().toString() });
      return false;
    }
  };

  const handleRefundDecision = (orderId: string, payload: { approve: boolean; amount?: number; method?: string; note?: string }) =>
    applyOrderDecision(orderId, 'refund-decision', payload);

  const handleReturnDecision = (orderId: string, payload: { approve: boolean; note?: string }) =>
    applyOrderDecision(orderId, 'return-decision', payload);

  const handleBulkUpdateStatus = async (orderIds: string[], status: OrderStatus) => {
    const results = await Promise.all(
      orderIds.map(async id => {
        try {
          const response = await adminFetch(`${API_BASE_URL}/api/orders/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({ status })
          });
          return response.ok ? 'ok' : 'rejected';
        } catch {
          return 'error';
        }
      })
    );

    const failed = orderIds.filter((_, i) => results[i] !== 'ok');
    if (failed.length > 0) {
      setLiveToast({
        message: `⚠️ Backend rejected the move to "${status}" for ${failed.length} order(s) — valid order flow rules were applied.`,
        id: Date.now().toString()
      });
    }

    setOrders((prev: Order[]) =>
      prev.map(o => (orderIds.includes(o.orderId) && results[orderIds.indexOf(o.orderId)] === 'ok'
        ? { ...o, status, updatedAt: new Date().toISOString() }
        : o))
    );

    if (soundEnabled) playNotificationChime('order');
    if (failed.length === 0) {
      setLiveToast({
        message: `Updated status to "${status}" for ${orderIds.length} orders`,
        id: Date.now().toString()
      });
    }
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrderForDetail(order);
  };

  const handleCloseOrderDetail = () => {
    setSelectedOrderForDetail(null);
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const response = await adminFetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setOrders(prev => prev.filter(o => o.orderId !== orderId));
        if (soundEnabled) playNotificationChime('alert');
        setLiveToast({
          message: `Order #${orderId} deleted permanently`,
          id: Date.now().toString()
        });
      }
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  // Product Actions — lahat ng writes ay dumadaan sa backend (single source of truth).
  const handleAddProduct = async (productData: Partial<Product>) => {
    const name = productData.name || 'New Product';
    const price = Number(productData.price) || 0;
    let failureMessage = '';
    try {
      const response = await adminFetch(`${API_BASE_URL}/api/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({
          id: productData.id || `prod-${Date.now()}`,
          sku: productData.sku,
          name,
          category: productData.category,
          subCategory: productData.subCategory,
          price,
          originalPrice: price,
          brand: productData.brand,
          image: productData.image,
          sizes: productData.sizes,
          stock: productData.stock,
          lowStockThreshold: productData.lowStockThreshold,
          user: 'admin'
        })
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        failureMessage = body?.error || 'Failed to create product on the backend.';
      }
    } catch (error) {
      console.error('Failed to sync new product:', error);
      failureMessage = 'Network error while creating product.';
    }

    if (failureMessage) {
      setLiveToast({ message: `⚠️ ${failureMessage}`, id: Date.now().toString() });
      return;
    }

    await fetchData();
    if (soundEnabled) playNotificationChime('success');
    setLiveToast({
      message: `New SKU ${name} added to catalog!`,
      id: Date.now().toString()
    });
  };

  const handleAdjustStock = async (productId: string, adjustment: number, reason: string) => {
    let failureMessage = '';
    try {
      const response = await adminFetch(`${API_BASE_URL}/api/products/${encodeURIComponent(productId)}/adjust`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ adjustment, reason, user: 'admin' })
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        failureMessage = body?.error || 'Stock adjustment was rejected by the backend.';
      }
    } catch (error) {
      console.error('Failed to sync stock adjustment:', error);
      failureMessage = 'Network error while adjusting stock.';
    }

    if (failureMessage) {
      setLiveToast({ message: `⚠️ ${failureMessage}`, id: Date.now().toString() });
      return;
    }

    await fetchData();
    if (soundEnabled) playNotificationChime('alert');
    setLiveToast({
      message: `Stock updated (${adjustment > 0 ? `+${adjustment}` : adjustment}): ${reason}`,
      id: Date.now().toString()
    });
  };

  const handleToggleChannelSync = (
    productId: string,
    channel: 'web' | 'shopee' | 'lazada' | 'tiktok'
  ) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const nextSync = !p.channelSync[channel];
          return {
            ...p,
            channelSync: {
              ...p.channelSync,
              [channel]: nextSync
            }
          };
        }
        return p;
      })
    );
  };

  const handleDeleteProduct = async (productId: string) => {
    let failureMessage = '';
    try {
      const response = await adminFetch(`${API_BASE_URL}/api/products/${encodeURIComponent(productId)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ user: 'admin' })
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        failureMessage = body?.error || 'Product deletion was rejected by the backend.';
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      failureMessage = 'Network error while deleting product.';
    }

    if (failureMessage) {
      setLiveToast({ message: `⚠️ ${failureMessage}`, id: Date.now().toString() });
      return;
    }

    await fetchData();
    setLiveToast({
      message: 'Product removed from catalog',
      id: Date.now().toString()
    });
  };

  // Stock Alerts & Purchase Orders
  const handleGeneratePO = (alertIds?: string[]) => {
    const alertsToProcess = alertIds
      ? stockAlerts.filter(a => alertIds.includes(a.id))
      : stockAlerts;

    if (alertsToProcess.length === 0) return;

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-CHUB-${Math.floor(1000 + Math.random() * 9000)}`,
      supplierName: alertsToProcess[0]?.supplierName || 'Metro Garments Corp.',
      items: alertsToProcess.map(a => ({
        productId: a.productId,
        sku: a.sku,
        name: a.productName,
        qty: a.reorderQty,
        unitCost: 550,
        totalCost: a.reorderQty * 550
      })),
      totalCost: alertsToProcess.reduce((sum, a) => sum + a.reorderQty * 550, 0),
      status: 'Sent',
      createdAt: new Date().toLocaleDateString(),
      expectedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString()
    };

    setPurchaseOrders(prev => [newPO, ...prev]);
    if (soundEnabled) playNotificationChime('success');
    setLiveToast({
      message: `Purchase Order ${newPO.poNumber} sent to supplier!`,
      id: Date.now().toString()
    });
  };

  const handleUpdatePOStatus = (poId: string, status: PurchaseOrder['status']) => {
    setPurchaseOrders(prev =>
      prev.map(po => {
        if (po.id === poId) {
          return { ...po, status };
        }
        return po;
      })
    );

    if (status === 'Received') {
      const po = purchaseOrders.find(p => p.id === poId);
      if (po) {
        setProducts(prev =>
          prev.map(prod => {
            const poItem = po.items.find(i => i.productId === prod.id);
            if (poItem) {
              const newStock = prod.stock + poItem.qty;
              return {
                ...prod,
                stock: newStock,
                status: 'In Stock'
              };
            }
            return prod;
          })
        );
      }
      if (soundEnabled) playNotificationChime('success');
      setLiveToast({
        message: `PO Received! Stock counts automatically replenished.`,
        id: Date.now().toString()
      });
    }
  };

  // Payment Gateways
  const handleToggleGateway = (gatewayId: string) => {
    setGateways(prev =>
      prev.map(g => (g.id === gatewayId ? { ...g, enabled: !g.enabled } : g))
    );
  };

  const handleSendTestWebhook = (gatewayId: string) => {
    const gw = gateways.find(g => g.id === gatewayId);
    if (soundEnabled) playNotificationChime('order');
    setLiveToast({
      message: `Webhook Test Success: ${gw?.name || 'Gateway'} Instant Settlement Confirmed`,
      id: Date.now().toString()
    });
  };

  // Customer Reviews
  const handleReplyReview = (reviewId: string, replyText: string) => {
    const applyReply = (date: string) => {
      setReviews(prev =>
        prev.map(r =>
          r.id === reviewId
            ? {
                ...r,
                adminReply: {
                  comment: replyText,
                  date: date || 'Just now'
                }
              }
            : r
        )
      );
    };

    applyReply(new Date().toLocaleString());
    setLiveToast({
      message: 'Official merchant response published',
      id: Date.now().toString()
    });

    adminFetch(`${API_BASE_URL}/api/admin/reviews/${reviewId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json'},
      body: JSON.stringify({
        adminReply: { comment: replyText }
      })
    }).catch(err => console.warn('Failed to sync admin reply:', err));
  };

  // Moderate review status (approve / hide / reject)
  const handleModerateReview = async (reviewId: string, status: 'published' | 'hidden' | 'rejected') => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setReviews(prev => prev.map(r => (r.id === reviewId ? { ...r, status } : r)));
        setLiveToast({
          message: `Review ${status === 'published' ? 'approved' : status === 'hidden' ? 'hidden' : 'rejected'}`,
          id: Date.now().toString()
        });
      } else {
        const data = await res.json().catch(() => ({}));
        setLiveToast({ message: data?.error || 'Failed to moderate review', id: Date.now().toString() });
      }
    } catch (err) {
      console.warn('Moderation failed:', err);
    }
  };

  // Hard delete review
  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm('Permanently delete this review?')) return;
    try {
      const res = await adminFetch(`${API_BASE_URL}/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
        setLiveToast({ message: 'Review deleted', id: Date.now().toString() });
      } else {
        const data = await res.json().catch(() => ({}));
        setLiveToast({ message: data?.error || 'Failed to delete review', id: Date.now().toString() });
      }
    } catch (err) {
      console.warn('Delete review failed:', err);
    }
  };

  // Create voucher (admin)
  const handleCreateVoucher = async (payload: Partial<Voucher>): Promise<boolean> => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/api/vouchers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.voucher) {
        setVouchers(prev => [data.voucher, ...prev.filter(v => v.id !== data.voucher.id)]);
        setLiveToast({ message: `Voucher ${data.voucher.code} created`, id: Date.now().toString() });
        return true;
      }
      setLiveToast({ message: data?.error || 'Failed to create voucher', id: Date.now().toString() });
      return false;
    } catch (err) {
      console.warn('Create voucher failed:', err);
      return false;
    }
  };

  // Update voucher (admin)
  const handleUpdateVoucher = async (code: string, payload: Partial<Voucher>): Promise<boolean> => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/api/vouchers/${encodeURIComponent(code)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.voucher) {
        setVouchers(prev => prev.map(v => (v.id === data.voucher.id ? data.voucher : v)));
        setLiveToast({ message: `Voucher ${data.voucher.code} updated`, id: Date.now().toString() });
        return true;
      }
      setLiveToast({ message: data?.error || 'Failed to update voucher', id: Date.now().toString() });
      return false;
    } catch (err) {
      console.warn('Update voucher failed:', err);
      return false;
    }
  };

  // Toggle active status (admin)
  const handleToggleVoucher = async (code: string, active: boolean): Promise<boolean> => {
    return handleUpdateVoucher(code, { active });
  };

  // Delete voucher (admin)
  const handleDeleteVoucher = async (code: string): Promise<boolean> => {
    if (!window.confirm(`Permanently delete voucher ${code}?`)) return false;
    try {
      const res = await adminFetch(`${API_BASE_URL}/api/vouchers/${encodeURIComponent(code)}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setVouchers(prev => prev.filter(v => v.code !== code));
        setLiveToast({ message: `Voucher ${code} deleted`, id: Date.now().toString() });
        return true;
      }
      const data = await res.json().catch(() => ({}));
      setLiveToast({ message: data?.error || 'Failed to delete voucher', id: Date.now().toString() });
      return false;
    } catch (err) {
      console.warn('Delete voucher failed:', err);
      return false;
    }
  };

  // ---- RBAC: Admin team management (Super Admin lang) ----
  const refreshAdmins = async () => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/api/admin/admins`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setAdmins(data);
      }
    } catch (err) {
      console.warn('Failed to load admins:', err);
    }
  };

  const roleLabel = (role: string) => roleDefs.find(r => r.key === role)?.label || role;

  const handleCreateAdmin = async (payload: { name: string; username: string; email: string; password: string; role: string }): Promise<boolean> => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/api/admin/admins`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.admin) {
        setAdmins(prev => [data.admin, ...prev.filter(a => a.email !== data.admin.email)]);
        setLiveToast({ message: `${data.admin.name} added as ${roleLabel(data.admin.role)}`, id: Date.now().toString() });
        return true;
      }
      setLiveToast({ message: data?.error || 'Failed to create admin', id: Date.now().toString() });
      return false;
    } catch (err) {
      console.warn('Create admin failed:', err);
      setLiveToast({ message: 'Network error while creating admin.', id: Date.now().toString() });
      return false;
    }
  };

  const handleUpdateAdmin = async (email: string, payload: { name?: string; role?: string; active?: boolean; password?: string }): Promise<boolean> => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/api/admin/admins/${encodeURIComponent(email)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.admin) {
        setAdmins(prev => prev.map(a => (a.email === data.admin.email ? data.admin : a)));
        const verb = payload.active === false ? 'deactivated' : 'updated';
        setLiveToast({ message: `Admin ${data.admin.email} ${verb}`, id: Date.now().toString() });
        return true;
      }
      setLiveToast({ message: data?.error || 'Failed to update admin', id: Date.now().toString() });
      return false;
    } catch (err) {
      console.warn('Update admin failed:', err);
      setLiveToast({ message: 'Network error while updating admin.', id: Date.now().toString() });
      return false;
    }
  };

  // ---- Audit trail (Feature #9) ----
  const refreshAuditLogs = async () => {
    try {
      const res = await adminFetch(`${API_BASE_URL}/api/admin/audit`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.logs)) setAuditLogs(data.logs);
      }
    } catch (err) {
      console.warn('Failed to load audit logs:', err);
    }
  };

  // Create Order from Admin Simulator
  const handleCreateOrder = async (orderPayload: any): Promise<boolean> => {
    const normalized = normalizeOrder(orderPayload);

    setOrders(prev => [normalized, ...prev]);

    try {
      await adminFetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized)
      });
    } catch (error) {
      console.error('Failed to sync order to server:', error);
    }

    if (soundEnabled) playNotificationChime('order');
    setLiveToast({
      message: `⚡ New Order #${normalized.orderId} placed via ${normalized.payment.method}!`,
      id: Date.now().toString()
    });
    return true;
  };

  const pendingOrdersCount = orders.filter(
    o => o.status === 'Pending' || o.status === 'To Ship'
  ).length;
  const activeAlertsCount = stockAlerts.length;

  return (
    <div
      className={`h-screen flex flex-col font-sans transition-colors duration-200 overflow-hidden ${
        isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-[#F8FAFC] text-slate-900'
      }`}
    >
      {/* Top Sticky Navbar */}
      <Navbar
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        isConnected={isLiveConnected}
        isLoading={isLoading}
        onRefresh={fetchData}
        stockAlerts={stockAlerts}
        orders={orders}
        onSelectTab={(tab: string) => setActiveTab(tab)}
        onSelectOrder={handleSelectOrder}
        onOpenStoreModal={() => setIsStoreCheckoutOpen(true)}
        onOpenNewProductModal={() => setIsNewProductOpen(true)}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        searchGlobal={searchGlobal}
        setSearchGlobal={setSearchGlobal}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        isMobileSidebarOpen={isMobileSidebarOpen}
      />

      {/* Main Layout Area: Sidebar & Content */}
      <div className="flex flex-1 relative w-full h-[calc(100vh-4rem)] overflow-hidden">
        {/* Sidebar Component */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab: string) => {
            setActiveTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          isMobileOpen={isMobileSidebarOpen}
          setIsMobileOpen={setIsMobileSidebarOpen}
          pendingOrdersCount={pendingOrdersCount}
          stockAlertsCount={activeAlertsCount}
          onOpenStoreModal={() => setIsStoreCheckoutOpen(true)}
        />

        {/* Main Scrollable Content View */}
        <main className="flex-1 w-full min-w-0 overflow-y-auto p-3.5 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {(activeTab === 'dashboard' || activeTab === 'analytics') && (
              <DashboardView
                orders={orders}
                products={products}
                stockAlerts={stockAlerts}
                reviews={reviews}
                onSelectOrder={handleSelectOrder}
                onNavigateTab={(tab: string) => setActiveTab(tab)}
                onOpenStoreModal={() => setIsStoreCheckoutOpen(true)}
              />
            )}

            {activeTab === 'orders' && (
              <OrdersView
                orders={orders}
                onSelectOrder={handleSelectOrder}
                onOpenPrintWaybillModal={(order: Order) => setSelectedOrderForWaybill(order)}
                onUpdateStatus={handleUpdateOrderStatus}
                onBulkUpdateStatus={handleBulkUpdateStatus}
                onOpenStoreModal={() => setIsStoreCheckoutOpen(true)}
                searchFilter={searchGlobal}
                setSearchFilter={setSearchGlobal}
                onDeleteOrder={handleDeleteOrder}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryView
                products={products}
                onOpenNewProductModal={() => setIsNewProductOpen(true)}
                onOpenStockAdjustModal={(prod: Product) => setSelectedProductForStockAdjust(prod)}
                onToggleChannelSync={handleToggleChannelSync}
                onDeleteProduct={handleDeleteProduct}
                onOpenHistory={() => setIsInventoryHistoryOpen(true)}
              />
            )}

            {activeTab === 'alerts' && (
              <StockAlertsView
                stockAlerts={stockAlerts}
                purchaseOrders={purchaseOrders}
                products={products}
                onGeneratePO={handleGeneratePO}
                onUpdatePOStatus={handleUpdatePOStatus}
                onOpenStockAdjustModal={(prod: Product) => setSelectedProductForStockAdjust(prod)}
              />
            )}

            {activeTab === 'gateways' && (
              <PaymentGatewaysView
                gateways={gateways}
                onToggleGateway={handleToggleGateway}
                onSendTestWebhook={handleSendTestWebhook}
              />
            )}

            {activeTab === 'reports' && (
              <ReportsView orders={orders} products={products} />
            )}

            {(activeTab === 'reviews' || activeTab === 'customers') && (
              <CustomerReviewsView
                reviews={reviews}
                orders={orders}
                onReplyReview={handleReplyReview}
                onModerateReview={handleModerateReview}
                onDeleteReview={handleDeleteReview}
              />
            )}

            {activeTab === 'vouchers' && (
              <VouchersView
                vouchers={vouchers}
                onCreateVoucher={handleCreateVoucher}
                onUpdateVoucher={handleUpdateVoucher}
                onToggleVoucher={handleToggleVoucher}
                onDeleteVoucher={handleDeleteVoucher}
              />
            )}

            {activeTab === 'team' && (
              <TeamView
                admins={admins}
                roleDefs={roleDefs}
                currentEmail=""
                onCreateAdmin={handleCreateAdmin}
                onUpdateAdmin={handleUpdateAdmin}
                onRefresh={refreshAdmins}
              />
            )}

            {activeTab === 'audit' && (
              <AuditLogsView
                logs={auditLogs}
                onRefresh={refreshAuditLogs}
              />
            )}
          </div>
        </main>
      </div>

      {/* Floating Live Notification Toast */}
      {liveToast && (
        <div className="fixed bottom-6 right-6 z-[90] animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 dark:border-slate-300 flex items-center gap-3 text-xs font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span>{liveToast.message}</span>
            <button
              onClick={() => setLiveToast(null)}
              className="ml-2 text-slate-400 hover:text-white dark:hover:text-slate-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrderForDetail && (
        <OrderDetailModal
          order={selectedOrderForDetail}
          onClose={handleCloseOrderDetail}
          onUpdateStatus={handleUpdateOrderStatus}
          onRefundDecision={handleRefundDecision}
          onReturnDecision={handleReturnDecision}
          onOpenPrintWaybillModal={(order: Order) => {
            setSelectedOrderForDetail(null);
            setSelectedOrderForWaybill(order);
          }}
        />
      )}

      {/* Print Waybill Modal */}
      {selectedOrderForWaybill && (
        <PrintWaybillModal
          order={selectedOrderForWaybill}
          onClose={() => setSelectedOrderForWaybill(null)}
        />
      )}

      {/* New Product Modal */}
      <NewProductModal
        isOpen={isNewProductOpen}
        onClose={() => setIsNewProductOpen(false)}
        onAddProduct={handleAddProduct}
      />

      {/* Stock Adjustment Modal */}
      {selectedProductForStockAdjust && (
        <StockAdjustmentModal
          product={selectedProductForStockAdjust}
          onClose={() => setSelectedProductForStockAdjust(null)}
          onAdjustStock={handleAdjustStock}
        />
      )}

      {/* Inventory History Modal */}
      <InventoryHistoryModal
        apiBase={API_BASE_URL}
        isOpen={isInventoryHistoryOpen}
        onClose={() => setIsInventoryHistoryOpen(false)}
      />

      {/* Store Checkout Modal */}
      <StoreCheckoutModal
        isOpen={isStoreCheckoutOpen}
        onClose={() => setIsStoreCheckoutOpen(false)}
        products={products}
        onCreateOrder={handleCreateOrder}
      />
    </div>
  );
}

export default App;