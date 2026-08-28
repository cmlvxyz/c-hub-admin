import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import cors from 'cors'; // ✅ Import CORS

const app = express();
const PORT = 3014;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// ============ DATA STORE ============
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
    carrier: 'J&T Express' | 'Ninja Van' | 'Lalamove' | 'Flash Express' | 'DHL Express' | 'Store Courier';
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
  channel: 'Online Store' | 'TikTok Shop' | 'Shopee' | 'Lazada' | 'In-Store POS';
  review?: {
    rating: number;
    comment: string;
    date: string;
  };
  notes?: string;
  tags?: string[];
  updatedAt: string;
}

// ============ FILE STORAGE ============
const ORDERS_FILE = path.join(process.cwd(), 'orders.json');
const PRODUCTS_FILE = path.join(process.cwd(), 'products.json');

// ✅ Load products from file or use default
function loadProductsFromFile(): Product[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load products from file:', error);
  }
  return getDefaultProducts();
}

// ✅ Save products to file
function saveProductsToFile(productsData: Product[]) {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(productsData, null, 2));
    console.log(`💾 Saved ${productsData.length} products to file`);
  } catch (error) {
    console.error('Failed to save products to file:', error);
  }
}

// ✅ Load orders from file
function loadOrdersFromFile(): Order[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load orders from file:', error);
  }
  return [];
}

// ✅ Save orders to file
function saveOrdersToFile(ordersData: Order[]) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(ordersData, null, 2));
    console.log(`💾 Saved ${ordersData.length} orders to file`);
  } catch (error) {
    console.error('Failed to save orders to file:', error);
  }
}

function getDefaultProducts(): Product[] {
  return [
    // ============ MEN'S T-SHIRTS ============
    {
      id: "clothes-men-tshirt-White-XL",
      sku: "CHUB-TEE-001",
      name: "Premium T-Shirt - White",
      price: 1999,
      stock: 50,
      image: "/images/clothes/men/t-shirts/white.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["White"],
      category: "Apparel",
      subCategory: "T-Shirts",
      costPrice: 800,
      brand: "C-HUB Originals",
      barcode: "CHUB-TEE-001",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 14,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-men-tshirt-Black-XL",
      sku: "CHUB-TEE-002",
      name: "Premium T-Shirt - Black",
      price: 1999,
      stock: 45,
      image: "/images/clothes/men/t-shirts/black.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black"],
      category: "Apparel",
      subCategory: "T-Shirts",
      costPrice: 800,
      brand: "C-HUB Originals",
      barcode: "CHUB-TEE-002",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 12,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-men-tshirt-Blue-XL",
      sku: "CHUB-TEE-003",
      name: "Premium T-Shirt - Blue",
      price: 1999,
      stock: 40,
      image: "/images/clothes/men/t-shirts/blue.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Blue"],
      category: "Apparel",
      subCategory: "T-Shirts",
      costPrice: 800,
      brand: "C-HUB Originals",
      barcode: "CHUB-TEE-003",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 10,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-men-tshirt-Yellow-XL",
      sku: "CHUB-TEE-004",
      name: "Premium T-Shirt - Yellow",
      price: 1999,
      stock: 35,
      image: "/images/clothes/men/t-shirts/yellow.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Yellow"],
      category: "Apparel",
      subCategory: "T-Shirts",
      costPrice: 800,
      brand: "C-HUB Originals",
      barcode: "CHUB-TEE-004",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 8,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-men-tshirt-Red-XL",
      sku: "CHUB-TEE-005",
      name: "Premium T-Shirt - Red",
      price: 1999,
      stock: 30,
      image: "/images/clothes/men/t-shirts/red.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Red"],
      category: "Apparel",
      subCategory: "T-Shirts",
      costPrice: 800,
      brand: "C-HUB Originals",
      barcode: "CHUB-TEE-005",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 6,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-men-tshirt-Green-XL",
      sku: "CHUB-TEE-006",
      name: "Premium T-Shirt - Green",
      price: 1999,
      stock: 25,
      image: "/images/clothes/men/t-shirts/green.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Green"],
      category: "Apparel",
      subCategory: "T-Shirts",
      costPrice: 800,
      brand: "C-HUB Originals",
      barcode: "CHUB-TEE-006",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 5,
      updatedAt: new Date().toISOString()
    },
    
    // ============ MEN'S HOODIES ============
    {
      id: "clothes-men-hoodie-Beige-XL",
      sku: "CHUB-HD-001",
      name: "Cozy Hoodie - Beige",
      price: 2499,
      stock: 40,
      image: "/images/clothes/men/hoodie/beige.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Beige"],
      category: "Apparel",
      subCategory: "Hoodies & Sweats",
      costPrice: 1200,
      brand: "C-HUB Originals",
      barcode: "CHUB-HD-001",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 12,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-men-hoodie-Mauve-XL",
      sku: "CHUB-HD-002",
      name: "Cozy Hoodie - Mauve",
      price: 2499,
      stock: 35,
      image: "/images/clothes/men/hoodie/mauve.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Mauve"],
      category: "Apparel",
      subCategory: "Hoodies & Sweats",
      costPrice: 1200,
      brand: "C-HUB Originals",
      barcode: "CHUB-HD-002",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 10,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-men-hoodie-Pink-XL",
      sku: "CHUB-HD-003",
      name: "Cozy Hoodie - Pink",
      price: 2499,
      stock: 30,
      image: "/images/clothes/men/hoodie/pink.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Pink"],
      category: "Apparel",
      subCategory: "Hoodies & Sweats",
      costPrice: 1200,
      brand: "C-HUB Originals",
      barcode: "CHUB-HD-003",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 8,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-men-hoodie-Sage-XL",
      sku: "CHUB-HD-004",
      name: "Cozy Hoodie - Sage",
      price: 2499,
      stock: 25,
      image: "/images/clothes/men/hoodie/sage.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Sage"],
      category: "Apparel",
      subCategory: "Hoodies & Sweats",
      costPrice: 1200,
      brand: "C-HUB Originals",
      barcode: "CHUB-HD-004",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 6,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-men-hoodie-Burgundy-XL",
      sku: "CHUB-HD-005",
      name: "Cozy Hoodie - Burgundy",
      price: 2499,
      stock: 20,
      image: "/images/clothes/men/hoodie/burgundy.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Burgundy"],
      category: "Apparel",
      subCategory: "Hoodies & Sweats",
      costPrice: 1200,
      brand: "C-HUB Originals",
      barcode: "CHUB-HD-005",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 5,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-men-hoodie-Brown-XL",
      sku: "CHUB-HD-006",
      name: "Cozy Hoodie - Brown",
      price: 2499,
      stock: 15,
      image: "/images/clothes/men/hoodie/brown.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Brown"],
      category: "Apparel",
      subCategory: "Hoodies & Sweats",
      costPrice: 1200,
      brand: "C-HUB Originals",
      barcode: "CHUB-HD-006",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 4,
      updatedAt: new Date().toISOString()
    },
    
    // ============ MEN'S SWEATSHIRTS ============
    {
      id: "clothes-men-sweatshirt-White-XL",
      sku: "CHUB-SW-001",
      name: "Classic Sweatshirt - White",
      price: 2199,
      stock: 40,
      image: "/images/clothes/men/sweatshirts/white1.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["White"],
      category: "Apparel",
      subCategory: "Sweatshirts",
      costPrice: 1000,
      brand: "C-HUB Originals",
      barcode: "CHUB-SW-001",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 11,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-men-sweatshirt-Gray-XL",
      sku: "CHUB-SW-002",
      name: "Classic Sweatshirt - Gray",
      price: 2199,
      stock: 35,
      image: "/images/clothes/men/sweatshirts/gray1.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Gray"],
      category: "Apparel",
      subCategory: "Sweatshirts",
      costPrice: 1000,
      brand: "C-HUB Originals",
      barcode: "CHUB-SW-002",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 9,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-men-sweatshirt-Blue-XL",
      sku: "CHUB-SW-003",
      name: "Classic Sweatshirt - Blue",
      price: 2199,
      stock: 30,
      image: "/images/clothes/men/sweatshirts/blue1.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Blue"],
      category: "Apparel",
      subCategory: "Sweatshirts",
      costPrice: 1000,
      brand: "C-HUB Originals",
      barcode: "CHUB-SW-003",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 8,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-men-sweatshirt-Brown-XL",
      sku: "CHUB-SW-004",
      name: "Classic Sweatshirt - Brown",
      price: 2199,
      stock: 25,
      image: "/images/clothes/men/sweatshirts/brown2.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Brown"],
      category: "Apparel",
      subCategory: "Sweatshirts",
      costPrice: 1000,
      brand: "C-HUB Originals",
      barcode: "CHUB-SW-004",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 6,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-men-sweatshirt-Pink-XL",
      sku: "CHUB-SW-005",
      name: "Classic Sweatshirt - Pink",
      price: 2199,
      stock: 20,
      image: "/images/clothes/men/sweatshirts/pink1.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Pink"],
      category: "Apparel",
      subCategory: "Sweatshirts",
      costPrice: 1000,
      brand: "C-HUB Originals",
      barcode: "CHUB-SW-005",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 5,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-men-sweatshirt-Beige-XL",
      sku: "CHUB-SW-006",
      name: "Classic Sweatshirt - Beige",
      price: 2199,
      stock: 15,
      image: "/images/clothes/men/sweatshirts/beige1.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Beige"],
      category: "Apparel",
      subCategory: "Sweatshirts",
      costPrice: 1000,
      brand: "C-HUB Originals",
      barcode: "CHUB-SW-006",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 4,
      updatedAt: new Date().toISOString()
    },

    // ============ WOMEN'S TOPS ============
    {
      id: "clothes-women-top-Cream-S",
      sku: "CHUB-WTOP-001",
      name: "Peplum Top - Cream",
      price: 1799,
      stock: 30,
      image: "/images/clothes/women/top/top1.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Cream"],
      category: "Apparel",
      subCategory: "Top",
      costPrice: 800,
      brand: "C-HUB Originals",
      barcode: "CHUB-WTOP-001",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 8,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-women-top-White-S",
      sku: "CHUB-WTOP-002",
      name: "Peplum Top - White",
      price: 1799,
      stock: 30,
      image: "/images/clothes/women/top/top2.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["White"],
      category: "Apparel",
      subCategory: "Top",
      costPrice: 800,
      brand: "C-HUB Originals",
      barcode: "CHUB-WTOP-002",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 7,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-women-top-Sky Blue Gingham-S",
      sku: "CHUB-WTOP-003",
      name: "Peplum Top - Sky Blue Gingham",
      price: 1799,
      stock: 30,
      image: "/images/clothes/women/top/top3.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Sky Blue Gingham"],
      category: "Apparel",
      subCategory: "Top",
      costPrice: 800,
      brand: "C-HUB Originals",
      barcode: "CHUB-WTOP-003",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 6,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-women-top-Sage Green-S",
      sku: "CHUB-WTOP-004",
      name: "Peplum Top - Sage Green",
      price: 1799,
      stock: 30,
      image: "/images/clothes/women/top/top4.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Sage Green"],
      category: "Apparel",
      subCategory: "Top",
      costPrice: 800,
      brand: "C-HUB Originals",
      barcode: "CHUB-WTOP-004",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 5,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-women-top-Mocha Brown-S",
      sku: "CHUB-WTOP-005",
      name: "Peplum Top - Mocha Brown",
      price: 1799,
      stock: 30,
      image: "/images/clothes/women/top/top5.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Mocha Brown"],
      category: "Apparel",
      subCategory: "Top",
      costPrice: 800,
      brand: "C-HUB Originals",
      barcode: "CHUB-WTOP-005",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 4,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-women-top-Obsidian Black-S",
      sku: "CHUB-WTOP-006",
      name: "Peplum Top - Obsidian Black",
      price: 1799,
      stock: 30,
      image: "/images/clothes/women/top/top6.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Obsidian Black"],
      category: "Apparel",
      subCategory: "Top",
      costPrice: 800,
      brand: "C-HUB Originals",
      barcode: "CHUB-WTOP-006",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 5 },
      salesVelocity7d: 3,
      updatedAt: new Date().toISOString()
    },

    // ============ WOMEN'S DRESSES ============
    {
      id: "clothes-women-dress-Polka White-S",
      sku: "CHUB-WDRS-001",
      name: "Summer Halter Dress - Polka White",
      price: 2999,
      stock: 25,
      image: "/images/clothes/women/dress/dress1.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Polka White"],
      category: "Apparel",
      subCategory: "Dress",
      costPrice: 1500,
      brand: "C-HUB Originals",
      barcode: "CHUB-WDRS-001",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 7 },
      salesVelocity7d: 6,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-women-dress-Sky Stripe-S",
      sku: "CHUB-WDRS-002",
      name: "Summer Halter Dress - Sky Stripe",
      price: 2999,
      stock: 25,
      image: "/images/clothes/women/dress/dress2.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Sky Stripe"],
      category: "Apparel",
      subCategory: "Dress",
      costPrice: 1500,
      brand: "C-HUB Originals",
      barcode: "CHUB-WDRS-002",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 7 },
      salesVelocity7d: 5,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-women-dress-Buttercup Gingham-S",
      sku: "CHUB-WDRS-003",
      name: "Summer Halter Dress - Buttercup Gingham",
      price: 2999,
      stock: 25,
      image: "/images/clothes/women/dress/dress3.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Buttercup Gingham"],
      category: "Apparel",
      subCategory: "Dress",
      costPrice: 1500,
      brand: "C-HUB Originals",
      barcode: "CHUB-WDRS-003",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 7 },
      salesVelocity7d: 4,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-women-dress-Rose Gingham-S",
      sku: "CHUB-WDRS-004",
      name: "Summer Halter Dress - Rose Gingham",
      price: 2999,
      stock: 25,
      image: "/images/clothes/women/dress/dress4.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Rose Gingham"],
      category: "Apparel",
      subCategory: "Dress",
      costPrice: 1500,
      brand: "C-HUB Originals",
      barcode: "CHUB-WDRS-004",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 7 },
      salesVelocity7d: 3,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-women-dress-Ocean Gingham-S",
      sku: "CHUB-WDRS-005",
      name: "Summer Halter Dress - Ocean Gingham",
      price: 2999,
      stock: 25,
      image: "/images/clothes/women/dress/dress5.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Ocean Gingham"],
      category: "Apparel",
      subCategory: "Dress",
      costPrice: 1500,
      brand: "C-HUB Originals",
      barcode: "CHUB-WDRS-005",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 7 },
      salesVelocity7d: 2,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-women-dress-Midnight Polka-S",
      sku: "CHUB-WDRS-006",
      name: "Summer Halter Dress - Midnight Polka",
      price: 2999,
      stock: 25,
      image: "/images/clothes/women/dress/dress6.png",
      sizes: ["S", "M", "L", "XL"],
      colors: ["Midnight Polka"],
      category: "Apparel",
      subCategory: "Dress",
      costPrice: 1500,
      brand: "C-HUB Originals",
      barcode: "CHUB-WDRS-006",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Metro Garments Corp.", contact: "supply@metrogarments.ph", leadTimeDays: 7 },
      salesVelocity7d: 2,
      updatedAt: new Date().toISOString()
    },

    // ============ PANTS - MEN ============
    {
      id: "clothes-men-pants-Light Stone-28",
      sku: "CHUB-PANTS-001",
      name: "Classic Denim Jeans - Light Stone",
      price: 1799,
      stock: 40,
      image: "/images/pants/men/pants/pants1.png",
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["Light Stone"],
      category: "Apparel",
      subCategory: "Jeans",
      costPrice: 900,
      brand: "C-HUB Street",
      barcode: "CHUB-PANTS-001",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Apex Textile Works", contact: "sales@apextextile.ph", leadTimeDays: 7 },
      salesVelocity7d: 12,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-men-pants-Mid Gray-28",
      sku: "CHUB-PANTS-002",
      name: "Classic Denim Jeans - Mid Gray",
      price: 1799,
      stock: 35,
      image: "/images/pants/men/pants/pants2.png",
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["Mid Gray"],
      category: "Apparel",
      subCategory: "Jeans",
      costPrice: 900,
      brand: "C-HUB Street",
      barcode: "CHUB-PANTS-002",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Apex Textile Works", contact: "sales@apextextile.ph", leadTimeDays: 7 },
      salesVelocity7d: 10,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-men-pants-Off White-28",
      sku: "CHUB-PANTS-003",
      name: "Classic Denim Jeans - Off White",
      price: 1799,
      stock: 30,
      image: "/images/pants/men/pants/pants3.png",
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["Off White"],
      category: "Apparel",
      subCategory: "Jeans",
      costPrice: 900,
      brand: "C-HUB Street",
      barcode: "CHUB-PANTS-003",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Apex Textile Works", contact: "sales@apextextile.ph", leadTimeDays: 7 },
      salesVelocity7d: 8,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-men-pants-Silver Sand-28",
      sku: "CHUB-PANTS-004",
      name: "Classic Denim Jeans - Silver Sand",
      price: 1799,
      stock: 25,
      image: "/images/pants/men/pants/pants4.png",
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["Silver Sand"],
      category: "Apparel",
      subCategory: "Jeans",
      costPrice: 900,
      brand: "C-HUB Street",
      barcode: "CHUB-PANTS-004",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Apex Textile Works", contact: "sales@apextextile.ph", leadTimeDays: 7 },
      salesVelocity7d: 6,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-men-pants-Deep Indigo Navy-28",
      sku: "CHUB-PANTS-005",
      name: "Classic Denim Jeans - Deep Indigo Navy",
      price: 1799,
      stock: 20,
      image: "/images/pants/men/pants/pants5.png",
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["Deep Indigo Navy"],
      category: "Apparel",
      subCategory: "Jeans",
      costPrice: 900,
      brand: "C-HUB Street",
      barcode: "CHUB-PANTS-005",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Apex Textile Works", contact: "sales@apextextile.ph", leadTimeDays: 7 },
      salesVelocity7d: 5,
      updatedAt: new Date().toISOString()
    },
    {
      id: "clothes-men-pants-Rustic Brown-28",
      sku: "CHUB-PANTS-006",
      name: "Classic Denim Jeans - Rustic Brown",
      price: 1799,
      stock: 15,
      image: "/images/pants/men/pants/pants6.png",
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["Rustic Brown"],
      category: "Apparel",
      subCategory: "Jeans",
      costPrice: 900,
      brand: "C-HUB Street",
      barcode: "CHUB-PANTS-006",
      reservedStock: 0,
      lowStockThreshold: 10,
      reorderPoint: 15,
      reorderQty: 50,
      status: "In Stock",
      channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
      supplier: { name: "Apex Textile Works", contact: "sales@apextextile.ph", leadTimeDays: 7 },
      salesVelocity7d: 4,
      updatedAt: new Date().toISOString()
    }
  ];
}

let products: Product[] = loadProductsFromFile();
let orders: Order[] = loadOrdersFromFile();

// ✅ Function to enrich order items with product images - FIXED with BASE_URL
function enrichOrdersWithProductImages(ordersData: Order[]): Order[] {
  const BASE_URL = 'https://c-hub-backend-ijy4.onrender.com';
  
  return ordersData.map(order => ({
    ...order,
    items: order.items.map(item => {
      // ✅ KUNG MAY IMAGE NA, I-CONVERT SA FULL URL
      if (item.image) {
        // Kung nagsisimula sa /, idagdag ang BASE_URL
        if (item.image.startsWith('/')) {
          return { ...item, image: `${BASE_URL}${item.image}` };
        }
        // Kung hindi nagsisimula sa / at walang http, idagdag ang BASE_URL + /
        if (!item.image.startsWith('http://') && !item.image.startsWith('https://')) {
          return { ...item, image: `${BASE_URL}/${item.image}` };
        }
        return item;
      }
      
      // ✅ KUNG WALA, SUBUKAN HANAPIN SA DATABASE
      let product = null;
      
      // 1. Hanapin gamit ang productId
      if (item.productId) {
        product = products.find(p => p.id === item.productId);
      }
      
      // 2. Hanapin gamit ang SKU (kung hindi N/A)
      if (!product && item.sku && item.sku !== 'N/A') {
        product = products.find(p => p.sku === item.sku);
      }
      
      // 3. Hanapin gamit ang exact name
      if (!product && item.name) {
        product = products.find(p => p.name === item.name);
        if (product) console.log(`✅ Found by exact name: ${item.name}`);
      }
      
      // 4. Hanapin gamit ang base name (without size/color)
      if (!product && item.name) {
        const itemBaseName = item.name.split(' - ')[0];
        product = products.find(p => {
          const productBaseName = p.name.split(' - ')[0];
          return productBaseName === itemBaseName;
        });
        if (product) console.log(`✅ Found by base name: ${item.name}`);
      }
      
      // 5. Hanapin gamit ang partial match (last resort)
      if (!product && item.name) {
        const itemNameLower = item.name.toLowerCase();
        const matches = products.filter(p => 
          p.name.toLowerCase().includes(itemNameLower) || 
          itemNameLower.includes(p.name.toLowerCase())
        );
        if (matches.length > 0) {
          product = matches.reduce((a, b) => a.name.length > b.name.length ? a : b);
          if (product) console.log(`✅ Found by partial match: ${item.name}`);
        }
      }
      
      if (product && product.image) {
        // I-convert din ang product image sa full URL
        const imageUrl = product.image.startsWith('/') 
          ? `${BASE_URL}${product.image}` 
          : product.image;
        return { ...item, image: imageUrl };
      }
      
      console.log(`❌ No product found for: ${item.name}`);
      return item;
    })
  }));
}

// ============ SSE SETUP ============
interface SSEClient {
  id: number;
  res: express.Response;
}
let sseClients: SSEClient[] = [];

function broadcastSSE(event: string, data: any) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.res.write(payload);
    } catch {
      // client disconnected
    }
  });
}

// ============ API ROUTES ============

// ✅ SYNC ORDERS FROM CLIENT
app.post('/api/orders/sync', (req, res) => {
  try {
    const { orders: clientOrders } = req.body;
    if (Array.isArray(clientOrders)) {
      console.log(`🔄 Syncing ${clientOrders.length} orders from client...`);
      
      const enrichedOrders = enrichOrdersWithProductImages(clientOrders);
      
      const existingIds = new Set(orders.map(o => o.orderId));
      
      enrichedOrders.forEach((clientOrder: Order) => {
        if (!existingIds.has(clientOrder.orderId)) {
          orders.push(clientOrder);
          existingIds.add(clientOrder.orderId);
        } else {
          const index = orders.findIndex(o => o.orderId === clientOrder.orderId);
          if (index !== -1) {
            orders[index] = { ...orders[index], ...clientOrder };
          }
        }
      });
      
      saveOrdersToFile(orders);
      
      console.log(`✅ Synced ${orders.length} total orders from client`);
      broadcastSSE('order_sync', { count: orders.length });
      res.json({ success: true, count: orders.length });
    } else {
      res.status(400).json({ error: 'Invalid orders data' });
    }
  } catch (error) {
    console.error('Failed to sync orders:', error);
    res.status(500).json({ error: 'Failed to sync orders' });
  }
});

// Orders
app.get('/api/orders', (req, res) => {
  console.log(`📦 Loading ${orders.length} orders...`);
  const enrichedOrders = enrichOrdersWithProductImages(orders);
  res.json(enrichedOrders);
});

app.post('/api/orders', (req, res) => {
  const BASE_URL = 'https://c-hub-backend-ijy4.onrender.com';
  
  const newOrder: Order = {
    ...req.body,
    orderId: req.body.orderId || `CHUB-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    orderNumber: `${Math.floor(8900 + orders.length + 1)}`,
    date: req.body.date || new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
    updatedAt: new Date().toISOString()
  };

  // ✅ I-enrich ang items ng product images na may full URL
  const enrichedItems = newOrder.items.map(item => {
    // Kung may image na, i-convert sa full URL
    if (item.image) {
      if (item.image.startsWith('/')) {
        return { ...item, image: `${BASE_URL}${item.image}` };
      }
      if (!item.image.startsWith('http://') && !item.image.startsWith('https://')) {
        return { ...item, image: `${BASE_URL}/${item.image}` };
      }
      return item;
    }
    
    let product = null;
    
    if (item.productId) {
      product = products.find(p => p.id === item.productId);
    }
    
    if (!product && item.sku && item.sku !== 'N/A') {
      product = products.find(p => p.sku === item.sku);
    }
    
    if (!product && item.name) {
      product = products.find(p => p.name === item.name);
    }
    
    if (!product && item.name) {
      const itemBaseName = item.name.split(' - ')[0];
      product = products.find(p => {
        const productBaseName = p.name.split(' - ')[0];
        return productBaseName === itemBaseName;
      });
    }
    
    if (product && product.image) {
      const imageUrl = product.image.startsWith('/') 
        ? `${BASE_URL}${product.image}` 
        : product.image;
      return { ...item, image: imageUrl };
    }
    return item;
  });
  newOrder.items = enrichedItems;

  const exists = orders.some(o => o.orderId === newOrder.orderId);
  if (!exists) {
    orders.unshift(newOrder);
    saveOrdersToFile(orders);
    broadcastSSE('new_order', newOrder);
    broadcastSSE('inventory_sync', products);
    console.log(`📦 New order added: ${newOrder.orderId}`);
  }

  res.status(201).json({ success: true, order: newOrder });
});

app.patch('/api/orders/:id', (req, res) => {
  const BASE_URL = 'https://c-hub-backend-ijy4.onrender.com';
  const { id } = req.params;
  const index = orders.findIndex(o => o.orderId === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  orders[index] = {
    ...orders[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  // ✅ I-enrich ang items ng product images na may full URL
  orders[index].items = orders[index].items.map(item => {
    // Kung may image na, i-convert sa full URL
    if (item.image) {
      if (item.image.startsWith('/')) {
        return { ...item, image: `${BASE_URL}${item.image}` };
      }
      if (!item.image.startsWith('http://') && !item.image.startsWith('https://')) {
        return { ...item, image: `${BASE_URL}/${item.image}` };
      }
      return item;
    }
    
    let product = null;
    
    if (item.productId) {
      product = products.find(p => p.id === item.productId);
    }
    
    if (!product && item.sku && item.sku !== 'N/A') {
      product = products.find(p => p.sku === item.sku);
    }
    
    if (!product && item.name) {
      product = products.find(p => p.name === item.name);
    }
    
    if (!product && item.name) {
      const itemBaseName = item.name.split(' - ')[0];
      product = products.find(p => {
        const productBaseName = p.name.split(' - ')[0];
        return productBaseName === itemBaseName;
      });
    }
    
    if (product && product.image) {
      const imageUrl = product.image.startsWith('/') 
        ? `${BASE_URL}${product.image}` 
        : product.image;
      return { ...item, image: imageUrl };
    }
    return item;
  });

  saveOrdersToFile(orders);
  broadcastSSE('order_update', { 
    orderId: id, 
    status: orders[index].status, 
    order: orders[index] 
  });
  
  res.json({ success: true, order: orders[index] });
});

app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const index = orders.findIndex(o => o.orderId === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const deletedOrder = orders[index];
  orders.splice(index, 1);
  saveOrdersToFile(orders);
  broadcastSSE('order_deleted', { orderId: id });
  console.log(`🗑️ Order deleted: ${id}`);
  
  res.json({ success: true, order: deletedOrder });
});

// Products
app.get('/api/products', (req, res) => {
  res.json(products);
});

app.post('/api/products', (req, res) => {
  const newProduct: Product = {
    ...req.body,
    id: req.body.id || `prod-${Date.now()}`,
    updatedAt: new Date().toISOString()
  };
  products.push(newProduct);
  saveProductsToFile(products);
  broadcastSSE('inventory_sync', products);
  res.status(201).json({ success: true, product: newProduct });
});

app.patch('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  products[index] = {
    ...products[index],
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  saveProductsToFile(products);
  broadcastSSE('inventory_sync', products);
  res.json({ success: true, product: products[index] });
});

app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  const index = products.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const deletedProduct = products[index];
  products.splice(index, 1);
  saveProductsToFile(products);
  broadcastSSE('inventory_sync', products);
  console.log(`🗑️ Product deleted: ${id}`);
  
  res.json({ success: true, product: deletedProduct });
});

// ============ SSE ENDPOINT ============
app.get('/api/orders/stream/public', (req, res) => {
  console.log('🔌 SSE client connected');
  
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const clientId = Date.now();
  const newClient: SSEClient = { id: clientId, res };
  sseClients.push(newClient);

  res.write(`event: connected\ndata: ${JSON.stringify({ status: 'connected', clientsCount: sseClients.length })}\n\n`);

  console.log(`📡 SSE clients: ${sseClients.length}`);

  req.on('close', () => {
    sseClients = sseClients.filter(c => c.id !== clientId);
    console.log(`🔌 SSE client disconnected. Clients: ${sseClients.length}`);
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    orders: orders.length,
    products: products.length
  });
});

// ============ START SERVER ============
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 C-HUB Enterprise Admin Server running on http://localhost:${PORT}`);
    console.log(`   🔌 SSE: http://localhost:${PORT}/api/orders/stream/public`);
    console.log(`   📦 Orders sync endpoint: POST /api/orders/sync`);
  });
}

startServer();