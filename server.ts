import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';

const app = express();
const PORT = 3005;

// ✅ CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());

// ============ FILE PATHS ============
const ORDERS_FILE = path.join(process.cwd(), 'orders.json');
const PRODUCTS_FILE = path.join(process.cwd(), 'products.json');

console.log('📁 Orders file:', ORDERS_FILE);
console.log('📁 Products file:', PRODUCTS_FILE);

// ============ TYPES ============
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

// ============ DEFAULT PRODUCTS ============
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "clothes-men-tshirt-White-XL",
    sku: "CHUB-TEE-001",
    barcode: "480651234001",
    name: "Premium T-Shirt - White",
    price: 1999,
    stock: 50,
    image: "https://c-hub-backend-1jy4.onrender.com/images/clothes/men/t-shirts/white.png",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White"],
    category: "Apparel",
    subCategory: "T-Shirts",
    costPrice: 800,
    brand: "C-HUB Originals",
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
    barcode: "480651234002",
    name: "Premium T-Shirt - Black",
    price: 1999,
    stock: 45,
    image: "https://c-hub-backend-1jy4.onrender.com/images/clothes/men/t-shirts/black.png",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black"],
    category: "Apparel",
    subCategory: "T-Shirts",
    costPrice: 800,
    brand: "C-HUB Originals",
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
    barcode: "480651234003",
    name: "Premium T-Shirt - Blue",
    price: 1999,
    stock: 40,
    image: "https://c-hub-backend-1jy4.onrender.com/images/clothes/men/t-shirts/blue.png",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blue"],
    category: "Apparel",
    subCategory: "T-Shirts",
    costPrice: 800,
    brand: "C-HUB Originals",
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
    barcode: "480651234004",
    name: "Premium T-Shirt - Yellow",
    price: 1999,
    stock: 35,
    image: "https://c-hub-backend-1jy4.onrender.com/images/clothes/men/t-shirts/yellow.png",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Yellow"],
    category: "Apparel",
    subCategory: "T-Shirts",
    costPrice: 800,
    brand: "C-HUB Originals",
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
    barcode: "480651234005",
    name: "Premium T-Shirt - Red",
    price: 1999,
    stock: 30,
    image: "https://c-hub-backend-1jy4.onrender.com/images/clothes/men/t-shirts/red.png",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Red"],
    category: "Apparel",
    subCategory: "T-Shirts",
    costPrice: 800,
    brand: "C-HUB Originals",
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
    barcode: "480651234006",
    name: "Premium T-Shirt - Green",
    price: 1999,
    stock: 25,
    image: "https://c-hub-backend-1jy4.onrender.com/images/clothes/men/t-shirts/green.png",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Green"],
    category: "Apparel",
    subCategory: "T-Shirts",
    costPrice: 800,
    brand: "C-HUB Originals",
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
    id: "clothes-men-hoodie-Beige-XL",
    sku: "CHUB-HD-001",
    barcode: "480651234007",
    name: "Cozy Hoodie - Beige",
    price: 2499,
    stock: 40,
    image: "https://c-hub-backend-1jy4.onrender.com/images/clothes/men/hoodie/beige.png",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Beige"],
    category: "Apparel",
    subCategory: "Hoodies & Sweats",
    costPrice: 1200,
    brand: "C-HUB Originals",
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
    barcode: "480651234008",
    name: "Cozy Hoodie - Mauve",
    price: 2499,
    stock: 35,
    image: "https://c-hub-backend-1jy4.onrender.com/images/clothes/men/hoodie/mauve.png",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Mauve"],
    category: "Apparel",
    subCategory: "Hoodies & Sweats",
    costPrice: 1200,
    brand: "C-HUB Originals",
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
    barcode: "480651234009",
    name: "Cozy Hoodie - Pink",
    price: 2499,
    stock: 30,
    image: "https://c-hub-backend-1jy4.onrender.com/images/clothes/men/hoodie/pink.png",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Pink"],
    category: "Apparel",
    subCategory: "Hoodies & Sweats",
    costPrice: 1200,
    brand: "C-HUB Originals",
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
    id: "clothes-women-top-Cream-S",
    sku: "CHUB-WTOP-001",
    barcode: "480651234010",
    name: "Peplum Top - Cream",
    price: 1799,
    stock: 30,
    image: "https://c-hub-backend-1jy4.onrender.com/images/clothes/women/top/top1.png",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Cream"],
    category: "Apparel",
    subCategory: "Top",
    costPrice: 800,
    brand: "C-HUB Originals",
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
    barcode: "480651234011",
    name: "Peplum Top - White",
    price: 1799,
    stock: 30,
    image: "https://c-hub-backend-1jy4.onrender.com/images/clothes/women/top/top2.png",
    sizes: ["S", "M", "L", "XL"],
    colors: ["White"],
    category: "Apparel",
    subCategory: "Top",
    costPrice: 800,
    brand: "C-HUB Originals",
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
    barcode: "480651234012",
    name: "Peplum Top - Sky Blue Gingham",
    price: 1799,
    stock: 30,
    image: "https://c-hub-backend-1jy4.onrender.com/images/clothes/women/top/top3.png",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Sky Blue Gingham"],
    category: "Apparel",
    subCategory: "Top",
    costPrice: 800,
    brand: "C-HUB Originals",
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
    id: "clothes-women-dress-Polka White-S",
    sku: "CHUB-WDRS-001",
    barcode: "480651234013",
    name: "Summer Halter Dress - Polka White",
    price: 2999,
    stock: 25,
    image: "https://c-hub-backend-1jy4.onrender.com/images/clothes/women/dress/dress1.png",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Polka White"],
    category: "Apparel",
    subCategory: "Dress",
    costPrice: 1500,
    brand: "C-HUB Originals",
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
    barcode: "480651234014",
    name: "Summer Halter Dress - Sky Stripe",
    price: 2999,
    stock: 25,
    image: "https://c-hub-backend-1jy4.onrender.com/images/clothes/women/dress/dress2.png",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Sky Stripe"],
    category: "Apparel",
    subCategory: "Dress",
    costPrice: 1500,
    brand: "C-HUB Originals",
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
    id: "clothes-men-pants-Light Stone-28",
    sku: "CHUB-PANTS-001",
    barcode: "480651234015",
    name: "Classic Denim Jeans - Light Stone",
    price: 1799,
    stock: 40,
    image: "https://c-hub-backend-1jy4.onrender.com/images/pants/men/pants/pants1.png",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Light Stone"],
    category: "Apparel",
    subCategory: "Jeans",
    costPrice: 900,
    brand: "C-HUB Street",
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
    barcode: "480651234016",
    name: "Classic Denim Jeans - Mid Gray",
    price: 1799,
    stock: 35,
    image: "https://c-hub-backend-1jy4.onrender.com/images/pants/men/pants/pants2.png",
    sizes: ["28", "30", "32", "34", "36"],
    colors: ["Mid Gray"],
    category: "Apparel",
    subCategory: "Jeans",
    costPrice: 900,
    brand: "C-HUB Street",
    reservedStock: 0,
    lowStockThreshold: 10,
    reorderPoint: 15,
    reorderQty: 50,
    status: "In Stock",
    channelSync: { web: true, shopee: true, lazada: true, tiktok: true },
    supplier: { name: "Apex Textile Works", contact: "sales@apextextile.ph", leadTimeDays: 7 },
    salesVelocity7d: 10,
    updatedAt: new Date().toISOString()
  }
];

// ============ LOAD/SAVE FUNCTIONS ============
function loadProductsFromFile(): Product[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`📦 Loaded ${parsed.length} products from file`);
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load products from file:', error);
  }
  
  // ✅ Kung walang products sa file, gamitin ang default products
  console.log('📦 No products found in file, using default products...');
  saveProductsToFile(DEFAULT_PRODUCTS);
  return DEFAULT_PRODUCTS;
}

function saveProductsToFile(productsData: Product[]) {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(productsData, null, 2));
    console.log(`💾 Saved ${productsData.length} products to file`);
  } catch (error) {
    console.error('Failed to save products to file:', error);
  }
}

function loadOrdersFromFile(): Order[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        console.log(`📦 Loaded ${parsed.length} orders from file`);
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load orders from file:', error);
  }
  return [];
}

function saveOrdersToFile(ordersData: Order[]) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(ordersData, null, 2));
    console.log(`💾 Saved ${ordersData.length} orders to file`);
  } catch (error) {
    console.error('Failed to save orders to file:', error);
  }
}

// ============ INITIALIZE DATA ============
let products: Product[] = loadProductsFromFile();
let orders: Order[] = loadOrdersFromFile();

// ============ ENRICH ORDER ITEMS WITH IMAGES ============
function enrichOrderItemsWithImages(order: Order): Order {
  if (!order || !order.items || order.items.length === 0) {
    return order;
  }
  
  const BASE_URL = 'https://c-hub-backend-1jy4.onrender.com';
  
  const enrichedItems = order.items.map(item => {
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
    
    // Hanapin ang product sa database
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
      let imageUrl = product.image;
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        imageUrl = `${BASE_URL}${imageUrl}`;
      }
      return { ...item, image: imageUrl };
    }
    
    // Fallback image
    return { 
      ...item, 
      image: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80' 
    };
  });
  
  return { ...order, items: enrichedItems };
}

function enrichOrders(ordersData: Order[]): Order[] {
  return ordersData.map(order => enrichOrderItemsWithImages(order));
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

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    orders: orders.length,
    products: products.length
  });
});

// ✅ Get orders
app.get('/api/orders', (req, res) => {
  console.log(`📦 Loading ${orders.length} orders...`);
  const enrichedOrders = enrichOrders(orders);
  res.json(enrichedOrders);
});

// ✅ Sync orders from client
app.post('/api/orders/sync', (req, res) => {
  try {
    const { orders: clientOrders } = req.body;
    if (!Array.isArray(clientOrders)) {
      return res.status(400).json({ error: 'Invalid orders data' });
    }
    
    console.log(`🔄 Syncing ${clientOrders.length} orders from client...`);
    
    // I-enrich ang orders
    const enrichedOrders = clientOrders.map(order => enrichOrderItemsWithImages(order));
    
    // I-merge sa existing orders
    const existingIds = new Set(orders.map(o => o.orderId));
    enrichedOrders.forEach(clientOrder => {
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
    broadcastSSE('order_sync', { count: orders.length });
    console.log(`✅ Synced ${orders.length} total orders`);
    res.json({ success: true, count: orders.length });
  } catch (error) {
    console.error('Failed to sync orders:', error);
    res.status(500).json({ error: 'Failed to sync orders' });
  }
});

// ✅ Create order
app.post('/api/orders', (req, res) => {
  const BASE_URL = 'https://c-hub-backend-1jy4.onrender.com';
  
  const newOrder: Order = {
    ...req.body,
    orderId: req.body.orderId || `CHUB-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    orderNumber: `${Math.floor(8900 + orders.length + 1)}`,
    date: req.body.date || new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
    updatedAt: new Date().toISOString()
  };

  // I-enrich ang items
  newOrder.items = newOrder.items.map(item => {
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
      let imageUrl = product.image;
      if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
        imageUrl = `${BASE_URL}${imageUrl}`;
      }
      return { ...item, image: imageUrl };
    }
    return item;
  });

  const exists = orders.some(o => o.orderId === newOrder.orderId);
  if (!exists) {
    orders.unshift(newOrder);
    saveOrdersToFile(orders);
    broadcastSSE('new_order', newOrder);
    console.log(`📦 New order added: ${newOrder.orderId}`);
  }

  res.status(201).json({ success: true, order: newOrder });
});

// ✅ Update order
app.patch('/api/orders/:id', (req, res) => {
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

  // I-enrich ang items
  orders[index].items = orders[index].items.map(item => {
    if (item.image && !item.image.startsWith('http://') && !item.image.startsWith('https://')) {
      return { ...item, image: `https://c-hub-backend-1jy4.onrender.com${item.image}` };
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

// ✅ Delete order
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

// ✅ Get products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// ✅ Create product
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

// ✅ Update product
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

// ✅ Delete product
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

// ✅ SSE endpoint
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
    console.log(`   📦 Orders: ${orders.length}`);
    console.log(`   📦 Products: ${products.length}`);
  });
}

startServer();