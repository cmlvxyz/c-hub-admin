export type OrderStatus =
  | 'To Pay'
  | 'To Ship'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'To Review'
  | 'Completed'
  | 'Cancelled'
  | 'Refunded';

export type PaymentMethod =
  | 'GCash'
  | 'Maya'
  | 'Credit/Debit Card (Visa/Mastercard)'
  | 'Cash on Delivery (COD)'
  | 'BPI/BDO Bank Transfer'
  | 'Billease BNPL'
  | 'ShopeePay';

export type SalesChannel =
  | 'Online Store'
  | 'TikTok Shop'
  | 'Shopee'
  | 'Lazada'
  | 'In-Store POS';

export type CarrierName =
  | 'J&T Express'
  | 'Ninja Van'
  | 'Lalamove'
  | 'Flash Express'
  | 'DHL Express'
  | 'Store Courier';

export interface OrderItem {
  id: string;
  productId: string;
  sku: string;
  name: string;
  price: number;
  costPrice: number;
  qty: number;
  image: string;
  size?: string;
  color?: string;
  subCategory?: string;
}

export interface CustomerDetails {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  tier: 'VIP' | 'Platinum' | 'Gold' | 'Standard';
  totalOrders: number;
  totalSpent: number;
}

export interface Order {
  id?: string;
  orderId: string;
  orderNumber: string;
  date: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  discountCode: string;
  tax: number;
  total: number;
  costTotal: number;
  payment: {
    method: PaymentMethod;
    status: 'Paid' | 'Pending' | 'Authorized' | 'Failed' | 'Refunded';
    transactionId: string;
    paidAt?: string;
    fee: number;
  };
  status: OrderStatus;
  fulfillment: {
    carrier: CarrierName;
    trackingNumber: string;
    estimatedDelivery: string;
    shippedAt?: string;
    deliveredAt?: string;
    timeline: Array<{
      status: string;
      time: string;
      location: string;
      note: string;
      completed: boolean;
    }>;
  };
  channel: SalesChannel;
  review?: {
    rating: number;
    comment: string;
    date: string;
  };
  notes?: string;
  tags?: string[];
  updatedAt: string;
}

export interface Product {
  id: string;
  sku: string;
  barcode: string;
  name: string;
  category: string;
  subCategory: string;
  brand: string;
  price: number;
  costPrice: number;
  stock: number;
  reservedStock: number;
  lowStockThreshold: number;
  reorderPoint: number;
  reorderQty: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Discontinued';
  image: string;
  sizes: string[];
  colors: string[];
  channelSync: {
    web: boolean;
    shopee: boolean;
    lazada: boolean;
    tiktok: boolean;
  };
  supplier: {
    name: string;
    contact: string;
    leadTimeDays: number;
  };
  salesVelocity7d: number;
  updatedAt: string;
}

export interface StockAlert {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  category: string;
  currentStock: number;
  threshold: number;
  reorderPoint: number;
  reorderQty: number;
  supplierName: string;
  estimatedDaysToOut: number;
  severity: 'critical' | 'warning' | 'info';
  status: 'active' | 'resolved' | 'po_created';
  createdAt: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  items: Array<{
    productId: string;
    sku: string;
    name: string;
    qty: number;
    unitCost: number;
    totalCost: number;
  }>;
  totalCost: number;
  status: 'Draft' | 'Sent' | 'In Transit' | 'Received' | 'Cancelled';
  createdAt: string;
  expectedDate: string;
}

export interface Review {
  id: string;
  orderId: string;
  customerName: string;
  productName: string;
  rating: number;
  comment: string;
  verifiedPurchase: boolean;
  date: string;
  status: 'published' | 'hidden';
  adminReply?: {
    comment: string;
    date: string;
  };
}

export interface PaymentGatewayConfig {
  id: string;
  name: string;
  type: string;
  icon: string;
  enabled: boolean;
  testMode: boolean;
  feeFixed: number;
  feePercentage: number;
  successRate: number;
  dailyVolume: number;
  health: 'healthy' | 'degraded' | 'maintenance';
}

export interface AnalyticsSummary {
  totalRevenue: number;
  grossProfit: number;
  grossMarginPct: number;
  aov: number;
  totalOrders: number;
  completedOrders: number;
  activeOrders: number;
  toPayOrders: number;
  channelData: Record<string, number>;
  gatewayData: Record<string, number>;
  inventoryValuation: number;
  retailValuation: number;
  totalUnitsInStock: number;
  lowStockCount: number;
  outOfStockCount: number;
}

// Add this at the bottom of the file
export type DashboardAnalytics = AnalyticsSummary;

