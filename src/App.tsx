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
import { OrderDetailModal } from './components/OrderDetailModal';
import { PrintWaybillModal } from './components/PrintWaybillModal';
import { NewProductModal } from './components/NewProductModal';
import { StockAdjustmentModal } from './components/StockAdjustmentModal';
import { StoreCheckoutModal } from './components/StoreCheckoutModal';
import {
  Order,
  Product,
  StockAlert,
  PurchaseOrder,
  Review,
  PaymentGatewayConfig,
  DashboardAnalytics,
  OrderStatus
} from './types';
import { playNotificationChime } from './utils';

const API_BASE_URL = 'http://localhost:3013';

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

// ✅ TANGGALIN ang INITIAL_ORDERS - kukunin na lang mula sa server

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

// ✅ Function para mag-load ng orders mula sa server
const loadOrdersFromServer = async (): Promise<Order[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`);
    if (response.ok) {
      const serverOrders = await response.json();
      if (Array.isArray(serverOrders)) {
        console.log(`📦 Loaded ${serverOrders.length} orders from server`);
        return serverOrders;
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

  // ✅ Data Store States - walang INITIAL_ORDERS
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [gateways, setGateways] = useState<PaymentGatewayConfig[]>(INITIAL_GATEWAYS);

  // Modal States
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);
  const [selectedOrderForWaybill, setSelectedOrderForWaybill] = useState<Order | null>(null);
  const [isNewProductOpen, setIsNewProductOpen] = useState<boolean>(false);
  const [selectedProductForStockAdjust, setSelectedProductForStockAdjust] = useState<Product | null>(
    null
  );
  const [isStoreCheckoutOpen, setIsStoreCheckoutOpen] = useState<boolean>(false);

  // Live Toast & Status
  const [liveToast, setLiveToast] = useState<{ message: string; id: string } | null>(null);
  const [isLiveConnected, setIsLiveConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [searchGlobal, setSearchGlobal] = useState<string>('');

  // ✅ Auto-refresh orders from server every 5 seconds
  useEffect(() => {
    const refreshOrders = async () => {
      const serverOrders = await loadOrdersFromServer();
      if (serverOrders.length > 0 || orders.length > 0) {
        setOrders(serverOrders);
      }
    };
    
    refreshOrders();
    const interval = setInterval(refreshOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // Compute live stock alerts from product stock
  const stockAlerts: StockAlert[] = products
    .filter(p => p.stock <= p.lowStockThreshold)
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

  // ✅ Fetch from backend API
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      // ✅ Load orders from server
      const serverOrders = await loadOrdersFromServer();
      if (serverOrders.length > 0) {
        setOrders(serverOrders);
      }
      
      if (API_BASE_URL) {
        const [prodRes, revRes, gwRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/products`).then(r => (r.ok ? r.json() : null)),
          fetch(`${API_BASE_URL}/api/reviews`).then(r => (r.ok ? r.json() : null)),
          fetch(`${API_BASE_URL}/api/gateways`).then(r => (r.ok ? r.json() : null))
        ]);

        if (prodRes && Array.isArray(prodRes) && prodRes.length > 0) setProducts(prodRes);
        if (revRes && Array.isArray(revRes) && revRes.length > 0) setReviews(revRes);
        if (gwRes && Array.isArray(gwRes) && gwRes.length > 0) setGateways(gwRes);
      }
      setIsLiveConnected(true);
    } catch {
      // Keep local state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto clear toast
  useEffect(() => {
    if (liveToast) {
      const timer = setTimeout(() => setLiveToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [liveToast]);

  // Order Actions
  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus, note?: string) => {
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

    // ✅ I-sync sa server
    if (orders.find(o => o.orderId === orderId)) {
      fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      }).catch(err => console.error('Failed to sync order status:', err));
    }

    if (selectedOrderForDetail?.orderId === orderId) {
      setSelectedOrderForDetail(prev => (prev ? { ...prev, status } : null));
    }

    if (soundEnabled) playNotificationChime('order');
    setLiveToast({
      message: `Order #${orderId} moved to "${status}"`,
      id: Date.now().toString()
    });
  };

  const handleBulkUpdateStatus = (orderIds: string[], status: OrderStatus) => {
    setOrders((prev: Order[]) =>
      prev.map(o => (orderIds.includes(o.orderId) ? { ...o, status, updatedAt: new Date().toISOString() } : o))
    );
    if (soundEnabled) playNotificationChime('order');
    setLiveToast({
      message: `Updated status to "${status}" for ${orderIds.length} orders`,
      id: Date.now().toString()
    });
  };

  const handleSelectOrder = (order: Order) => {
    setSelectedOrderForDetail(order);
  };

  const handleCloseOrderDetail = () => {
    setSelectedOrderForDetail(null);
  };

  // Product Actions
  const handleAddProduct = (productData: Partial<Product>) => {
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      sku: productData.sku || `CHUB-${Date.now().toString().slice(-4)}`,
      barcode: productData.barcode || '480651239999',
      name: productData.name || 'New Product',
      category: productData.category || 'Apparel',
      subCategory: productData.subCategory || 'General',
      brand: productData.brand || 'C-HUB Originals',
      price: productData.price || 1200,
      costPrice: productData.costPrice || 600,
      stock: productData.stock || 25,
      reservedStock: 0,
      lowStockThreshold: productData.lowStockThreshold || 10,
      reorderPoint: productData.reorderPoint || 15,
      reorderQty: productData.reorderQty || 50,
      status: (productData.stock || 25) > 10 ? 'In Stock' : 'Low Stock',
      image: productData.image || 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&auto=format&fit=crop&q=80',
      sizes: productData.sizes || ['M', 'L'],
      colors: productData.colors || ['Black'],
      channelSync: productData.channelSync || { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: productData.supplier || { name: 'Metro Garments Corp.', contact: 'supply@metrogarments.ph', leadTimeDays: 5 },
      salesVelocity7d: 5,
      updatedAt: new Date().toISOString()
    };

    setProducts(prev => [newProd, ...prev]);
    if (soundEnabled) playNotificationChime('success');
    setLiveToast({
      message: `New SKU ${newProd.name} added to catalog!`,
      id: Date.now().toString()
    });
  };

  const handleAdjustStock = (productId: string, adjustment: number, reason: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          const newStock = Math.max(0, p.stock + adjustment);
          return {
            ...p,
            stock: newStock,
            status: newStock === 0 ? 'Out of Stock' : newStock <= p.lowStockThreshold ? 'Low Stock' : 'In Stock',
            updatedAt: new Date().toISOString()
          };
        }
        return p;
      })
    );
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

  const handleDeleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
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
    setReviews(prev =>
      prev.map(r =>
        r.id === reviewId
          ? {
              ...r,
              adminReply: {
                comment: replyText,
                date: 'Just now'
              }
            }
          : r
      )
    );
    setLiveToast({
      message: 'Official merchant response published',
      id: Date.now().toString()
    });
  };

  // Create Order Simulator
  const handleCreateOrder = async (orderPayload: any): Promise<boolean> => {
    const newOrder: Order = {
      ...orderPayload,
      orderId: orderPayload.orderId || `CHUB-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      orderNumber: `${Math.floor(8900 + orders.length + 1)}`,
      date: 'Just now',
      updatedAt: new Date().toISOString()
    };

    // Auto-decrement inventory stock
    setProducts(prev =>
      prev.map(prod => {
        const matchingItem = newOrder.items.find(i => i.productId === prod.id);
        if (matchingItem) {
          const newStock = Math.max(0, prod.stock - matchingItem.qty);
          return {
            ...prod,
            stock: newStock,
            status: newStock === 0 ? 'Out of Stock' : newStock <= prod.lowStockThreshold ? 'Low Stock' : 'In Stock',
            salesVelocity7d: (prod.salesVelocity7d || 0) + matchingItem.qty
          };
        }
        return prod;
      })
    );

    setOrders(prev => [newOrder, ...prev]);
    
    // ✅ I-sync sa server
    try {
      await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
    } catch (error) {
      console.error('Failed to sync order to server:', error);
    }
    
    if (soundEnabled) playNotificationChime('order');
    setLiveToast({
      message: `⚡ New Order #${newOrder.orderId} placed via ${newOrder.payment.method}!`,
      id: Date.now().toString()
    });
    return true;
  };

  const pendingOrdersCount = orders.filter(
    o => o.status === 'To Ship' || o.status === 'To Pay'
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
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryView
                products={products}
                onOpenNewProductModal={() => setIsNewProductOpen(true)}
                onOpenStockAdjustModal={(prod: Product) => setSelectedProductForStockAdjust(prod)}
                onToggleChannelSync={handleToggleChannelSync}
                onDeleteProduct={handleDeleteProduct}
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