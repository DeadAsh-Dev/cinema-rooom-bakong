/**
 * Cinema Room Cambodia - Backend Server
 * Powered by Express & Bakong KHQR
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const { ROOMS, MOVIES, MENU_ITEMS, TIME_SLOTS, EXCHANGE_RATE_USD_KHR } = require('./src/data');
const { generateKHQR, generateQRCodeDataUrl, verifyKHQR, DEFAULT_MERCHANT } = require('./src/khqr');
const store = require('./src/store');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API: Get Full Catalog
app.get('/api/catalog', (req, res) => {
  res.json({
    rooms: ROOMS,
    movies: MOVIES,
    menu: MENU_ITEMS,
    timeSlots: TIME_SLOTS,
    exchangeRate: EXCHANGE_RATE_USD_KHR,
    merchant: {
      name: DEFAULT_MERCHANT.merchantName,
      bank: DEFAULT_MERCHANT.bankName,
      account: DEFAULT_MERCHANT.bakongAccount,
      accountNumber: DEFAULT_MERCHANT.accountNumber,
      city: DEFAULT_MERCHANT.merchantCity
    }
  });
});

// API: Get Rooms
app.get('/api/rooms', (req, res) => {
  res.json(ROOMS);
});

// API: Get Movies
app.get('/api/movies', (req, res) => {
  res.json(MOVIES);
});

// API: Get Menu
app.get('/api/menu', (req, res) => {
  res.json(MENU_ITEMS);
});

// API: Create Booking & Generate Bakong KHQR
app.post('/api/orders', async (req, res) => {
  try {
    const order = await store.createOrder(req.body);
    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Get Order by ID
app.get('/api/orders/:id', (req, res) => {
  const order = store.getOrder(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  res.json({ success: true, order });
});

// API: Check Order Status (Polling endpoint for Bakong Payment)
app.get('/api/orders/:id/status', (req, res) => {
  const order = store.getOrder(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  res.json({
    id: order.id,
    status: order.status,
    paidAt: order.payment.paidAt,
    transactionId: order.payment.transactionId,
    totalUsd: order.pricing.totalUsd,
    totalKhr: order.pricing.totalKhr
  });
});

// API: Simulate Payment (Essential for School Project Demonstration!)
app.post('/api/orders/:id/simulate-pay', (req, res) => {
  const updatedOrder = store.confirmPayment(req.params.id, {
    payerBank: req.body.payerBank || 'Bakong / ABA Mobile (Simulated)',
    payerAccount: req.body.payerAccount || 'Customer @ Bakong',
    transactionId: req.body.transactionId
  });

  if (!updatedOrder) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }

  res.json({
    success: true,
    message: 'Payment simulated successfully via Bakong KHQR',
    order: updatedOrder
  });
});

// API: Confirm Payment (Cashier or Webhook)
app.post('/api/orders/:id/confirm-payment', (req, res) => {
  const updatedOrder = store.confirmPayment(req.params.id, req.body);
  if (!updatedOrder) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  res.json({ success: true, order: updatedOrder });
});

// API: Check-In guest at Cinema Door
app.post('/api/orders/:id/check-in', (req, res) => {
  const order = store.checkInOrder(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, error: 'Order not found' });
  }
  res.json({ success: true, order });
});

// API: Custom KHQR Generator Tool (Interactive playground for students)
app.post('/api/khqr/generate', async (req, res) => {
  try {
    const { amount, currency = 'USD', billNumber, mobileNumber, merchantName } = req.body;
    const khqrData = generateKHQR({
      amount: amount ? Number(amount) : undefined,
      currency,
      billNumber,
      mobileNumber,
      merchantName: merchantName || DEFAULT_MERCHANT.merchantName,
      isDynamic: Boolean(amount)
    });

    const qrDataUrl = await generateQRCodeDataUrl(khqrData.qrString, { width: 400 });

    res.json({
      success: true,
      khqr: khqrData,
      qrDataUrl,
      isValidCRC: verifyKHQR(khqrData.qrString)
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// API: Admin Dashboard Stats
app.get('/api/admin/stats', (req, res) => {
  const stats = store.getDashboardStats();
  res.json(stats);
});

// API: Admin Orders List
app.get('/api/admin/orders', (req, res) => {
  const orders = store.getAllOrders(req.query);
  res.json(orders);
});

// Serve frontend SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const os = require('os');

function getLocalIp() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if ((net.family === 'IPv4' || net.family === 4) && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// Start Server with automatic port fallback if port is busy
function startServer(port) {
  const server = app.listen(port, () => {
    const localIp = getLocalIp();
    console.log(`\n======================================================`);
    console.log(`🎬 CINEMA ROOM (CAMBODIA) - E-COMMERCE & BAKONG KHQR`);
    console.log(`======================================================`);
    console.log(`🏠 Local URL:      http://localhost:${port}`);
    console.log(`📱 Wi-Fi / Mobile: http://${localIp}:${port}`);
    console.log(`   (Anyone on the same Wi-Fi can open this on their phone!)`);
    console.log(`🌐 Public Link:    Run "npm run share" in a second terminal`);
    console.log(`   (Gives you a public link to share anywhere in Cambodia!)`);
    console.log(`💳 Merchant:       ${DEFAULT_MERCHANT.merchantName}`);
    console.log(`🏦 Acquiring Bank: ${DEFAULT_MERCHANT.bankName} (${DEFAULT_MERCHANT.bakongAccount})`);
    console.log(`======================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️  Port ${port} is currently in use. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);

