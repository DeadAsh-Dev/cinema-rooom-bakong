/**
 * Orders and State Management Store
 * Handles order creation, Bakong KHQR generation, and persistence
 */

const fs = require('fs');
const path = require('path');
const { generateKHQR, generateQRCodeDataUrl, DEFAULT_MERCHANT } = require('./khqr');
const { ROOMS, MOVIES, MENU_ITEMS, EXCHANGE_RATE_USD_KHR } = require('./data');

const DATA_DIR = path.join(__dirname, '..', 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache
let orders = [];

// Load existing orders from disk
try {
  if (fs.existsSync(ORDERS_FILE)) {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
    orders = JSON.parse(raw);
  }
} catch (err) {
  console.warn('Could not load orders file, initializing fresh store:', err.message);
  orders = [];
}

function saveOrders() {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist orders:', err);
  }
}

function generateOrderId() {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `CR-${num}`;
}

function generateAccessPin() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Creates a new cinema room booking with generated KHQR
 */
async function createOrder(payload) {
  const {
    customerName,
    customerPhone,
    customerEmail,
    roomId,
    movieId,
    date,
    timeSlot,
    guests = 2,
    items = [],
    currency = 'USD' // 'USD' or 'KHR'
  } = payload;

  const room = ROOMS.find(r => r.id === roomId) || ROOMS[0];
  const movie = MOVIES.find(m => m.id === movieId) || MOVIES[0];

  // Calculate items total
  let foodTotalUsd = 0;
  const processedItems = (items || []).map(item => {
    const menuItem = MENU_ITEMS.find(m => m.id === item.id);
    if (!menuItem) return null;
    const qty = Math.max(1, parseInt(item.quantity || 1, 10));
    const subtotalUsd = menuItem.priceUsd * qty;
    foodTotalUsd += subtotalUsd;
    return {
      id: menuItem.id,
      name: menuItem.name,
      category: menuItem.category,
      unitPriceUsd: menuItem.priceUsd,
      unitPriceKhr: menuItem.priceKhr,
      quantity: qty,
      subtotalUsd,
      subtotalKhr: subtotalUsd * EXCHANGE_RATE_USD_KHR,
      image: menuItem.image
    };
  }).filter(Boolean);

  const roomPriceUsd = room.priceUsd;
  const totalUsd = Number((roomPriceUsd + foodTotalUsd).toFixed(2));
  const totalKhr = Math.round(totalUsd * EXCHANGE_RATE_USD_KHR);

  const orderId = generateOrderId();
  const roomAccessPin = generateAccessPin();
  const targetAmount = currency === 'KHR' ? totalKhr : totalUsd;

  // Generate dynamic Bakong KHQR
  const khqrData = generateKHQR({
    amount: targetAmount,
    currency,
    billNumber: orderId,
    mobileNumber: customerPhone,
    merchantName: DEFAULT_MERCHANT.merchantName,
    isDynamic: true
  });

  // Generate QR code data URL image
  const qrImageDataUrl = await generateQRCodeDataUrl(khqrData.qrString, { width: 400 });

  const order = {
    id: orderId,
    status: 'PENDING', // PENDING -> PAID -> CHECKED_IN -> CANCELLED
    customer: {
      name: customerName || 'Valued Cinema Guest',
      phone: customerPhone || 'N/A',
      email: customerEmail || 'guest@cinemaroom.kh'
    },
    booking: {
      room: {
        id: room.id,
        name: room.name,
        priceUsd: room.priceUsd,
        priceKhr: room.priceKhr,
        capacity: room.capacity
      },
      movie: {
        id: movie.id,
        title: movie.title,
        duration: movie.duration,
        poster: movie.poster
      },
      date: date || new Date().toISOString().split('T')[0],
      timeSlot: timeSlot || '08:00 PM - 10:00 PM',
      guests: Number(guests) || 2,
      accessPin: roomAccessPin
    },
    items: processedItems,
    pricing: {
      currency,
      roomTotalUsd: roomPriceUsd,
      roomTotalKhr: roomPriceUsd * EXCHANGE_RATE_USD_KHR,
      foodTotalUsd,
      foodTotalKhr: foodTotalUsd * EXCHANGE_RATE_USD_KHR,
      totalUsd,
      totalKhr,
      activeAmount: targetAmount,
      exchangeRate: EXCHANGE_RATE_USD_KHR
    },
    payment: {
      method: 'BAKONG_KHQR',
      merchantName: DEFAULT_MERCHANT.merchantName,
      bankName: DEFAULT_MERCHANT.bankName,
      bakongAccount: DEFAULT_MERCHANT.bakongAccount,
      khqrString: khqrData.qrString,
      qrImageDataUrl,
      userQrImagePath: '/images/user_qr.png',
      checksum: khqrData.checksum,
      paidAt: null,
      transactionId: null,
      paymentHash: null
    },
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 mins
  };

  orders.unshift(order);
  saveOrders();
  return order;
}

function getOrder(id) {
  return orders.find(o => o.id === id);
}

function getAllOrders(filter = {}) {
  let list = [...orders];
  if (filter.status) {
    list = list.filter(o => o.status === filter.status);
  }
  return list;
}

function confirmPayment(id, details = {}) {
  const order = getOrder(id);
  if (!order) return null;

  order.status = 'PAID';
  order.payment.paidAt = new Date().toISOString();
  order.payment.transactionId = details.transactionId || `BK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  order.payment.paymentHash = details.paymentHash || Math.random().toString(16).substring(2, 18);
  order.payment.payerBank = details.payerBank || 'Bakong / ABA Mobile';
  order.payment.payerAccount = details.payerAccount || 'Customer via KHQR';

  saveOrders();
  return order;
}

function checkInOrder(id) {
  const order = getOrder(id);
  if (!order) return null;
  order.status = 'CHECKED_IN';
  order.checkedInAt = new Date().toISOString();
  saveOrders();
  return order;
}

function getDashboardStats() {
  const totalOrders = orders.length;
  const paidOrders = orders.filter(o => o.status === 'PAID' || o.status === 'CHECKED_IN');
  const totalRevenueUsd = paidOrders.reduce((sum, o) => sum + (o.pricing.totalUsd || 0), 0);
  const totalRevenueKhr = paidOrders.reduce((sum, o) => sum + (o.pricing.totalKhr || 0), 0);
  const pendingOrders = orders.filter(o => o.status === 'PENDING').length;

  return {
    totalOrders,
    paidCount: paidOrders.length,
    pendingCount: pendingOrders,
    totalRevenueUsd: Number(totalRevenueUsd.toFixed(2)),
    totalRevenueKhr,
    exchangeRate: EXCHANGE_RATE_USD_KHR,
    recentOrders: orders.slice(0, 8)
  };
}

module.exports = {
  createOrder,
  getOrder,
  getAllOrders,
  confirmPayment,
  checkInOrder,
  getDashboardStats
};
