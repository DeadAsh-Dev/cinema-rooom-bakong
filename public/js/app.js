/**
 * Cinema Room Cambodia - Frontend Application Logic
 * Interactive E-Commerce & Bakong KHQR Payment Engine
 */

// Application State
const state = {
  currency: 'USD', // 'USD' or 'KHR'
  exchangeRate: 4100,
  rooms: [],
  movies: [],
  menu: [],
  timeSlots: [],
  cart: {
    room: null,
    items: []
  },
  wizard: {
    roomId: null,
    movieId: null,
    date: new Date().toISOString().split('T')[0],
    timeSlot: '08:00 PM - 10:00 PM',
    guests: 2,
    selectedSnacks: {}
  },
  activeOrder: null,
  pollTimer: null,
  countdownTimer: null,
  countdownSeconds: 300 // 5 minutes
};

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupEventListeners();
});

async function initApp() {
  try {
    const res = await fetch('/api/catalog');
    const data = await res.json();
    state.rooms = data.rooms;
    state.movies = data.movies;
    state.menu = data.menu;
    state.timeSlots = data.timeSlots;
    state.exchangeRate = data.exchangeRate || 4100;

    renderRooms('all');
    renderMovies();
    renderMenu('all');
    updateCartUI();

    // Set default date in wizard
    const dateInput = document.getElementById('wizard-date');
    if (dateInput) {
      dateInput.value = state.wizard.date;
      dateInput.min = state.wizard.date;
    }
  } catch (err) {
    console.error('Failed to initialize app catalog:', err);
  }
}

function setupEventListeners() {
  // Update wizard date
  const dateInput = document.getElementById('wizard-date');
  if (dateInput) {
    dateInput.addEventListener('change', (e) => {
      state.wizard.date = e.target.value;
    });
  }

  // Update wizard guests
  const guestsSelect = document.getElementById('wizard-guests');
  if (guestsSelect) {
    guestsSelect.addEventListener('change', (e) => {
      state.wizard.guests = parseInt(e.target.value, 10);
    });
  }

  // Update wizard movie
  const movieSelect = document.getElementById('wizard-movie-select');
  if (movieSelect) {
    movieSelect.addEventListener('change', (e) => {
      state.wizard.movieId = e.target.value;
    });
  }
}

// ==========================================
// CURRENCY FORMATTING & TOGGLE
// ==========================================
function toggleCurrency() {
  state.currency = state.currency === 'USD' ? 'KHR' : 'USD';
  const label = document.getElementById('currency-label');
  if (label) {
    label.textContent = state.currency === 'USD' ? 'USD ($)' : 'KHR (៛)';
  }
  // Re-render rooms, menu, and cart
  renderRooms(getCurrentRoomFilter());
  renderMenu(getCurrentMenuFilter());
  updateCartUI();
  updateWizardSummary();
}

function formatPrice(usdAmount) {
  if (state.currency === 'KHR') {
    const khr = Math.round(usdAmount * state.exchangeRate);
    return `៛${khr.toLocaleString()}`;
  }
  return `$${Number(usdAmount).toFixed(2)}`;
}

function formatBothPrices(usdAmount) {
  const khr = Math.round(usdAmount * state.exchangeRate);
  return {
    primary: formatPrice(usdAmount),
    usd: `$${Number(usdAmount).toFixed(2)}`,
    khr: `៛${khr.toLocaleString()}`
  };
}

// ==========================================
// RENDER ROOMS
// ==========================================
function getCurrentRoomFilter() {
  const activeBtn = document.querySelector('.room-filter-btn.bg-red-600');
  return activeBtn ? activeBtn.getAttribute('data-filter') : 'all';
}

function filterRooms(filter) {
  document.querySelectorAll('.room-filter-btn').forEach(btn => {
    if (btn.getAttribute('data-filter') === filter) {
      btn.className = 'room-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white';
    } else {
      btn.className = 'room-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700';
    }
  });
  renderRooms(filter);
}

function renderRooms(filter = 'all') {
  const container = document.getElementById('rooms-grid');
  if (!container) return;

  let filtered = state.rooms;
  if (filter === 'couple') filtered = state.rooms.filter(r => r.capacityMax <= 2);
  else if (filter === 'group') filtered = state.rooms.filter(r => r.capacityMax > 2 && r.capacityMax <= 6);
  else if (filter === 'party') filtered = state.rooms.filter(r => r.capacityMax > 6);

  container.innerHTML = filtered.map(room => {
    const prices = formatBothPrices(room.priceUsd);
    return `
      <div class="room-card glass-panel rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-600/10 group">
        <!-- Room Image & Badges -->
        <div class="relative aspect-video overflow-hidden">
          <img src="${room.image}" alt="${room.name}" class="room-card-img w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-[#121824] via-transparent to-transparent"></div>
          
          <div class="absolute top-3 left-3">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <i class="fa-solid fa-users text-[9px]"></i> ${room.capacity}
            </span>
          </div>

          <div class="absolute top-3 right-3">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              AVAILABLE
            </span>
          </div>
        </div>

        <!-- Room Content -->
        <div class="p-5 flex-1 flex flex-col justify-between space-y-4">
          <div>
            <h3 class="text-base font-bold text-white font-heading group-hover:text-red-400 transition-colors">
              ${room.name}
            </h3>
            <p class="text-xs text-slate-400 mt-1 line-clamp-1">${room.tagline}</p>

            <!-- Features Pill List -->
            <ul class="mt-3 space-y-1.5 text-[11px] text-slate-300">
              ${room.features.slice(0, 3).map(feat => `
                <li class="flex items-center gap-2">
                  <i class="fa-solid fa-circle-check text-red-500 text-[10px]"></i>
                  <span>${feat}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- Price & Booking CTA -->
          <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <div>
              <div class="text-[10px] text-slate-400 uppercase tracking-wider">Per 2 Hours</div>
              <div class="text-base font-extrabold text-amber-400 font-heading">
                ${prices.primary}
              </div>
            </div>

            <button onclick="openBookingWizard('${room.id}')" class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/20 flex items-center gap-1.5 transition-transform active:scale-95">
              <span>Book Suite</span>
              <i class="fa-solid fa-arrow-right text-[10px]"></i>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// RENDER MOVIES
// ==========================================
function renderMovies() {
  const container = document.getElementById('movies-grid');
  if (!container) return;

  container.innerHTML = state.movies.map(movie => `
    <div class="group relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-slate-600 transition-all">
      <div class="aspect-[2/3] overflow-hidden relative">
        <img src="${movie.poster}" alt="${movie.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>
        <div class="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/80 text-amber-300 border border-amber-500/30">
          ${movie.rating}
        </div>
      </div>
      <div class="p-3">
        <div class="text-[10px] font-bold text-red-400 uppercase tracking-wider">${movie.category}</div>
        <h4 class="text-xs font-bold text-white truncate mt-0.5" title="${movie.title}">${movie.title}</h4>
        <div class="flex items-center justify-between text-[10px] text-slate-400 mt-2">
          <span><i class="fa-regular fa-clock mr-1"></i>${movie.duration}</span>
          <span class="text-amber-400 font-semibold"><i class="fa-solid fa-star mr-1"></i>${movie.score}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ==========================================
// RENDER MENU & CONCESSIONS
// ==========================================
function getCurrentMenuFilter() {
  const activeBtn = document.querySelector('.menu-filter-btn.bg-red-600');
  return activeBtn ? activeBtn.getAttribute('data-cat') : 'all';
}

function filterMenu(category) {
  document.querySelectorAll('.menu-filter-btn').forEach(btn => {
    if (btn.getAttribute('data-cat') === category) {
      btn.className = 'menu-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 text-white';
    } else {
      btn.className = 'menu-filter-btn px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700';
    }
  });
  renderMenu(category);
}

function renderMenu(category = 'all') {
  const container = document.getElementById('menu-grid');
  if (!container) return;

  const filtered = category === 'all'
    ? state.menu
    : state.menu.filter(item => item.category === category);

  container.innerHTML = filtered.map(item => {
    const prices = formatBothPrices(item.priceUsd);
    return `
      <div class="glass-panel rounded-2xl overflow-hidden flex flex-col hover:border-slate-700 transition-all group">
        <div class="aspect-[4/3] overflow-hidden relative">
          <img src="${item.image}" alt="${item.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
          <span class="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-black/70 backdrop-blur-md text-slate-300 border border-slate-700">
            ${item.category}
          </span>
        </div>
        <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <h4 class="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">${item.name}</h4>
            <p class="text-xs text-slate-400 mt-1 line-clamp-2">${item.description}</p>
          </div>
          <div class="pt-2 border-t border-slate-800 flex items-center justify-between">
            <span class="text-sm font-bold text-amber-400 font-heading">${prices.primary}</span>
            <button onclick="addSnackToCart('${item.id}')" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-white text-xs font-bold transition-colors flex items-center gap-1">
              <i class="fa-solid fa-plus text-[10px]"></i> Add
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ==========================================
// CART & DRAWER MANAGEMENT
// ==========================================
function openCartDrawer() {
  document.getElementById('cart-drawer').classList.remove('hidden');
  updateCartUI();
}

function closeCartDrawer() {
  document.getElementById('cart-drawer').classList.add('hidden');
}

function addSnackToCart(itemId) {
  const item = state.menu.find(m => m.id === itemId);
  if (!item) return;

  const existing = state.cart.items.find(i => i.id === itemId);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.items.push({
      id: item.id,
      name: item.name,
      priceUsd: item.priceUsd,
      image: item.image,
      quantity: 1
    });
  }

  updateCartUI();
  showToast(`Added ${item.name} to cart!`);
}

function updateCartQty(itemId, delta) {
  const item = state.cart.items.find(i => i.id === itemId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart.items = state.cart.items.filter(i => i.id !== itemId);
  }
  updateCartUI();
}

function removeRoomFromCart() {
  state.cart.room = null;
  updateCartUI();
}

function updateCartUI() {
  const container = document.getElementById('cart-items-container');
  const countBadge = document.getElementById('cart-count-badge');
  const checkoutBtn = document.getElementById('cart-checkout-btn');

  const totalItemsCount = (state.cart.room ? 1 : 0) + state.cart.items.reduce((s, i) => s + i.quantity, 0);

  if (countBadge) {
    if (totalItemsCount > 0) {
      countBadge.textContent = totalItemsCount;
      countBadge.classList.remove('hidden');
    } else {
      countBadge.classList.add('hidden');
    }
  }

  // Calculate Subtotals
  const roomSubtotal = state.cart.room ? state.cart.room.priceUsd : 0;
  const snackSubtotal = state.cart.items.reduce((sum, item) => sum + (item.priceUsd * item.quantity), 0);
  const grandTotalUsd = roomSubtotal + snackSubtotal;
  const grandTotalKhr = Math.round(grandTotalUsd * state.exchangeRate);

  document.getElementById('cart-room-subtotal').textContent = formatPrice(roomSubtotal);
  document.getElementById('cart-snack-subtotal').textContent = formatPrice(snackSubtotal);
  document.getElementById('cart-total-usd').textContent = `$${grandTotalUsd.toFixed(2)}`;
  document.getElementById('cart-total-khr').textContent = `៛${grandTotalKhr.toLocaleString()}`;

  if (checkoutBtn) {
    checkoutBtn.disabled = !state.cart.room && state.cart.items.length === 0;
  }

  if (!container) return;

  if (totalItemsCount === 0) {
    container.innerHTML = `
      <div class="text-center py-12 text-slate-400">
        <i class="fa-solid fa-couch text-4xl mb-3 text-slate-600"></i>
        <p class="font-medium text-white">Your cart is empty.</p>
        <p class="text-xs text-slate-500 mt-1">Book a private suite or add delicious snacks!</p>
      </div>
    `;
    return;
  }

  let html = '';

  // Room item in cart
  if (state.cart.room) {
    const r = state.cart.room;
    html += `
      <div class="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-[10px] font-bold text-red-400 uppercase tracking-wider">PRIVATE ROOM RESERVATION</span>
          <button onclick="removeRoomFromCart()" class="text-slate-400 hover:text-red-400 text-xs p-1">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
        <div class="flex items-center gap-3">
          <img src="${r.image}" class="w-12 h-12 rounded-lg object-cover">
          <div class="flex-1 min-w-0">
            <div class="text-sm font-bold text-white truncate">${r.name}</div>
            <div class="text-xs text-slate-400">${state.wizard.date} &bull; ${state.wizard.timeSlot}</div>
          </div>
          <div class="text-right">
            <div class="text-sm font-bold text-amber-400 font-heading">${formatPrice(r.priceUsd)}</div>
          </div>
        </div>
      </div>
    `;
  }

  // Concession items
  if (state.cart.items.length > 0) {
    html += `
      <div class="space-y-3">
        <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Snacks & Concessions</div>
        ${state.cart.items.map(item => `
          <div class="flex items-center justify-between gap-3 p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <img src="${item.image}" class="w-10 h-10 rounded object-cover">
            <div class="flex-1 min-w-0">
              <div class="text-xs font-bold text-white truncate">${item.name}</div>
              <div class="text-[11px] text-amber-400">${formatPrice(item.priceUsd)}</div>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="updateCartQty('${item.id}', -1)" class="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs">
                -
              </button>
              <span class="text-xs font-bold text-white w-4 text-center">${item.quantity}</span>
              <button onclick="updateCartQty('${item.id}', 1)" class="w-6 h-6 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs">
                +
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  container.innerHTML = html;
}

// ==========================================
// INTERACTIVE BOOKING WIZARD
// ==========================================
function openBookingWizard(roomId) {
  state.wizard.roomId = roomId || state.rooms[0]?.id;
  const room = state.rooms.find(r => r.id === state.wizard.roomId);
  state.cart.room = room;

  // Populate Room Card in Step 1
  const roomCardContainer = document.getElementById('wizard-selected-room-card');
  if (roomCardContainer && room) {
    roomCardContainer.innerHTML = `
      <div class="flex items-center gap-3">
        <img src="${room.image}" class="w-14 h-14 rounded-xl object-cover">
        <div>
          <div class="text-sm font-bold text-white">${room.name}</div>
          <div class="text-xs text-slate-400">${room.capacity} &bull; 4K OLED / Laser</div>
        </div>
      </div>
      <div class="text-right">
        <div class="text-sm font-extrabold text-amber-400 font-heading">${formatPrice(room.priceUsd)}</div>
        <div class="text-[10px] text-slate-400">2 Hours Session</div>
      </div>
    `;
  }

  // Populate Time Slots
  const timeSlotsContainer = document.getElementById('wizard-time-slots');
  if (timeSlotsContainer) {
    timeSlotsContainer.innerHTML = state.timeSlots.map((slot, idx) => `
      <button onclick="selectWizardTimeSlot('${slot}')" class="time-slot-btn p-2 rounded-xl border text-xs font-semibold transition-all ${slot === state.wizard.timeSlot ? 'border-red-500 bg-red-500/20 text-white font-bold' : 'border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500'}" data-slot="${slot}">
        ${slot}
      </button>
    `).join('');
  }

  // Populate Movie Selection dropdown
  const movieSelect = document.getElementById('wizard-movie-select');
  if (movieSelect) {
    movieSelect.innerHTML = state.movies.map(m => `
      <option value="${m.id}">${m.title} (${m.category} &bull; ${m.duration})</option>
    `).join('');
    state.wizard.movieId = state.movies[0]?.id;
  }

  // Populate Quick Snacks
  const quickSnacksContainer = document.getElementById('wizard-quick-snacks');
  if (quickSnacksContainer) {
    quickSnacksContainer.innerHTML = state.menu.map(snack => {
      const isSelected = state.cart.items.some(i => i.id === snack.id);
      return `
        <div class="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <img src="${snack.image}" class="w-8 h-8 rounded object-cover">
            <div class="min-w-0">
              <div class="text-xs font-bold text-white truncate">${snack.name}</div>
              <div class="text-[11px] text-amber-400">${formatPrice(snack.priceUsd)}</div>
            </div>
          </div>
          <button onclick="toggleQuickSnack('${snack.id}', this)" class="px-2 py-1 rounded bg-slate-800 hover:bg-red-600 text-xs font-bold text-white">
            ${isSelected ? 'Added ✓' : '+ Add'}
          </button>
        </div>
      `;
    }).join('');
  }

  goToWizardStep(1);
  updateWizardSummary();
  document.getElementById('booking-modal').classList.remove('hidden');
}

function selectWizardTimeSlot(slot) {
  state.wizard.timeSlot = slot;
  document.querySelectorAll('.time-slot-btn').forEach(btn => {
    if (btn.getAttribute('data-slot') === slot) {
      btn.className = 'time-slot-btn p-2 rounded-xl border text-xs font-bold transition-all border-red-500 bg-red-500/20 text-white';
    } else {
      btn.className = 'time-slot-btn p-2 rounded-xl border text-xs font-semibold transition-all border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500';
    }
  });
  updateWizardSummary();
}

function toggleQuickSnack(snackId, btnElement) {
  const existing = state.cart.items.find(i => i.id === snackId);
  if (existing) {
    state.cart.items = state.cart.items.filter(i => i.id !== snackId);
    if (btnElement) btnElement.textContent = '+ Add';
  } else {
    const item = state.menu.find(m => m.id === snackId);
    if (item) {
      state.cart.items.push({
        id: item.id,
        name: item.name,
        priceUsd: item.priceUsd,
        image: item.image,
        quantity: 1
      });
      if (btnElement) btnElement.textContent = 'Added ✓';
    }
  }
  updateWizardSummary();
  updateCartUI();
}

function goToWizardStep(step) {
  [1, 2, 3].forEach(s => {
    const stepEl = document.getElementById(`wizard-step-${s}`);
    const indEl = document.getElementById(`step-indicator-${s}`);
    if (s === step) {
      stepEl.classList.remove('hidden');
      indEl.className = 'py-2.5 border-b-2 border-red-500 text-red-400 bg-red-500/10 font-bold';
    } else {
      stepEl.classList.add('hidden');
      indEl.className = 'py-2.5 border-b-2 border-transparent text-slate-400 font-semibold';
    }
  });
  updateWizardSummary();
}

function updateWizardSummary() {
  const room = state.rooms.find(r => r.id === state.wizard.roomId) || state.rooms[0];
  const roomPrice = room ? room.priceUsd : 0;
  const snackTotal = state.cart.items.reduce((s, i) => s + (i.priceUsd * i.quantity), 0);
  const totalUsd = roomPrice + snackTotal;
  const totalKhr = Math.round(totalUsd * state.exchangeRate);

  if (document.getElementById('wizard-summary-room-name')) {
    document.getElementById('wizard-summary-room-name').textContent = `${room.name}:`;
  }
  if (document.getElementById('wizard-summary-room-price')) {
    document.getElementById('wizard-summary-room-price').textContent = formatPrice(roomPrice);
  }
  if (document.getElementById('wizard-summary-snacks-price')) {
    document.getElementById('wizard-summary-snacks-price').textContent = formatPrice(snackTotal);
  }
  if (document.getElementById('wizard-summary-total-usd')) {
    document.getElementById('wizard-summary-total-usd').textContent = `$${totalUsd.toFixed(2)}`;
  }
  if (document.getElementById('wizard-summary-total-khr')) {
    document.getElementById('wizard-summary-total-khr').textContent = `៛${totalKhr.toLocaleString()}`;
  }
}

function closeBookingModal() {
  document.getElementById('booking-modal').classList.add('hidden');
}

function startBookingWizardFromCart() {
  closeCartDrawer();
  const roomId = state.cart.room ? state.cart.room.id : state.rooms[0]?.id;
  openBookingWizard(roomId);
}

// ==========================================
// SUBMIT ORDER & TRIGGER BAKONG KHQR
// ==========================================
async function submitBookingOrder() {
  const payBtn = document.getElementById('wizard-pay-btn');
  const name = document.getElementById('wizard-customer-name')?.value.trim() || 'Valued Cinema Guest';
  const phone = document.getElementById('wizard-customer-phone')?.value.trim() || '012 345 678';
  const email = document.getElementById('wizard-customer-email')?.value.trim() || '';

  payBtn.disabled = true;
  payBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-1"></i> Generating Bakong KHQR...`;

  try {
    const payload = {
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      roomId: state.wizard.roomId,
      movieId: state.wizard.movieId,
      date: state.wizard.date,
      timeSlot: state.wizard.timeSlot,
      guests: state.wizard.guests,
      items: state.cart.items,
      currency: state.currency
    };

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success && data.order) {
      state.activeOrder = data.order;
      closeBookingModal();
      openKhqrModal(data.order);
    } else {
      alert('Error creating order: ' + (data.error || 'Unknown error'));
    }
  } catch (err) {
    console.error('Error submitting order:', err);
    alert('Failed to connect to Cinema Room server.');
  } finally {
    payBtn.disabled = false;
    payBtn.innerHTML = `<i class="fa-solid fa-qrcode text-base"></i><span>Generate Bakong KHQR</span>`;
  }
}

// ==========================================
// BAKONG KHQR PAYMENT MODAL
// ==========================================
function openKhqrModal(order) {
  state.activeOrder = order;

  // Set amounts
  document.getElementById('khqr-modal-amount-usd').textContent = `$${order.pricing.totalUsd.toFixed(2)}`;
  document.getElementById('khqr-modal-amount-khr').textContent = `៛${order.pricing.totalKhr.toLocaleString()}`;

  // Set Dynamic QR Image
  const dynImg = document.getElementById('khqr-dynamic-img');
  if (dynImg) {
    dynImg.src = order.payment.qrImageDataUrl;
  }

  // Set Deep Link
  const deepLinkBtn = document.getElementById('khqr-deeplink-btn');
  if (deepLinkBtn) {
    // ABA / Bakong deep link format
    deepLinkBtn.href = `bakong://khqr?data=${encodeURIComponent(order.payment.khqrString)}`;
  }

  // Reset tab to Dynamic
  switchQrTab('dynamic');

  // Start 5-minute countdown
  startCountdown(300);

  // Start Auto-polling payment status
  startPollingPayment(order.id);

  document.getElementById('khqr-modal').classList.remove('hidden');
}

function closeKhqrModal() {
  clearInterval(state.pollTimer);
  clearInterval(state.countdownTimer);
  document.getElementById('khqr-modal').classList.add('hidden');
}

function switchQrTab(mode) {
  const dynamicBtn = document.getElementById('qr-tab-dynamic');
  const originalBtn = document.getElementById('qr-tab-original');
  const dynImg = document.getElementById('khqr-dynamic-img');
  const origImg = document.getElementById('khqr-original-img');
  const badge = document.getElementById('khqr-center-badge');

  if (mode === 'dynamic') {
    dynamicBtn.className = 'flex-1 py-1.5 rounded-lg bg-white shadow-sm text-red-600 font-bold';
    originalBtn.className = 'flex-1 py-1.5 rounded-lg text-slate-600 hover:text-slate-900';
    dynImg.classList.remove('hidden');
    origImg.classList.add('hidden');
    badge.classList.remove('hidden');
  } else {
    originalBtn.className = 'flex-1 py-1.5 rounded-lg bg-white shadow-sm text-red-600 font-bold';
    dynamicBtn.className = 'flex-1 py-1.5 rounded-lg text-slate-600 hover:text-slate-900';
    origImg.classList.remove('hidden');
    dynImg.classList.add('hidden');
    badge.classList.add('hidden');
  }
}

function startCountdown(durationSeconds) {
  clearInterval(state.countdownTimer);
  let remaining = durationSeconds;

  const timerEl = document.getElementById('khqr-timer');
  function updateTimer() {
    const minutes = Math.floor(remaining / 60).toString().padStart(2, '0');
    const seconds = (remaining % 60).toString().padStart(2, '0');
    if (timerEl) timerEl.textContent = `${minutes}:${seconds}`;

    if (remaining <= 0) {
      clearInterval(state.countdownTimer);
      if (timerEl) timerEl.textContent = 'EXPIRED';
    }
    remaining--;
  }

  updateTimer();
  state.countdownTimer = setInterval(updateTimer, 1000);
}

function startPollingPayment(orderId) {
  clearInterval(state.pollTimer);
  state.pollTimer = setInterval(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`);
      const statusData = await res.json();

      if (statusData.status === 'PAID' || statusData.status === 'CHECKED_IN') {
        clearInterval(state.pollTimer);
        clearInterval(state.countdownTimer);
        // Fetch full order and show ticket
        const fullOrderRes = await fetch(`/api/orders/${orderId}`);
        const fullOrderData = await fullOrderRes.json();
        closeKhqrModal();
        openTicketModal(fullOrderData.order);
      }
    } catch (e) {
      console.warn('Status poll warning:', e);
    }
  }, 3000);
}

// Presentation simulation for school teacher & classmates
async function simulateOrderPayment() {
  if (!state.activeOrder) return;
  const statusEl = document.getElementById('khqr-poll-status');
  if (statusEl) {
    statusEl.innerHTML = `<span class="text-amber-500 font-bold"><i class="fa-solid fa-spinner fa-spin mr-1"></i> Processing Bakong Webhook...</span>`;
  }

  try {
    const res = await fetch(`/api/orders/${state.activeOrder.id}/simulate-pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        payerBank: 'ABA Mobile / Bakong',
        payerAccount: `${state.activeOrder.customer.name} (via Bakong KHQR)`
      })
    });
    const data = await res.json();
    if (data.success && data.order) {
      clearInterval(state.pollTimer);
      clearInterval(state.countdownTimer);
      // Play celebratory sound or transition
      setTimeout(() => {
        closeKhqrModal();
        openTicketModal(data.order);
      }, 700);
    }
  } catch (err) {
    console.error('Failed to simulate payment:', err);
  }
}

function copyKhqrPayload() {
  if (!state.activeOrder?.payment?.khqrString) return;
  navigator.clipboard.writeText(state.activeOrder.payment.khqrString)
    .then(() => showToast('KHQR Payload copied to clipboard!'))
    .catch(() => alert('Could not copy to clipboard.'));
}

// ==========================================
// CINEMA DIGITAL TICKET MODAL
// ==========================================
function openTicketModal(order) {
  document.getElementById('ticket-order-id').textContent = order.id;
  document.getElementById('ticket-room-pin').textContent = order.booking.accessPin.split('').join(' ');
  document.getElementById('ticket-room-name').textContent = order.booking.room.name;
  document.getElementById('ticket-movie-title').textContent = order.booking.movie.title;
  document.getElementById('ticket-datetime').textContent = `${order.booking.date} • ${order.booking.timeSlot}`;
  document.getElementById('ticket-guest-name').textContent = order.customer.name;
  document.getElementById('ticket-tx-ref').textContent = order.payment.transactionId || 'BK-78921B';

  // Concession snacks list
  const snacksBox = document.getElementById('ticket-items-box');
  const snacksList = document.getElementById('ticket-items-list');
  if (order.items && order.items.length > 0) {
    snacksBox.classList.remove('hidden');
    snacksList.textContent = order.items.map(i => `${i.name} x${i.quantity}`).join(', ');
  } else {
    snacksBox.classList.add('hidden');
  }

  // Barcode / Check-In QR
  const barcodeImg = document.getElementById('ticket-barcode-img');
  if (barcodeImg) {
    barcodeImg.src = order.payment.qrImageDataUrl;
  }

  // Clear cart after confirmed booking
  state.cart = { room: null, items: [] };
  updateCartUI();

  document.getElementById('ticket-modal').classList.remove('hidden');
}

function closeTicketModal() {
  document.getElementById('ticket-modal').classList.add('hidden');
}

// ==========================================
// ADMIN DASHBOARD
// ==========================================
function openAdminModal() {
  document.getElementById('admin-modal').classList.remove('hidden');
  loadAdminData();
}

function closeAdminModal() {
  document.getElementById('admin-modal').classList.add('hidden');
}

async function loadAdminData() {
  try {
    const statsRes = await fetch('/api/admin/stats');
    const stats = await statsRes.json();

    document.getElementById('admin-stat-revenue-usd').textContent = `$${stats.totalRevenueUsd.toFixed(2)}`;
    document.getElementById('admin-stat-revenue-khr').textContent = `៛${stats.totalRevenueKhr.toLocaleString()}`;
    document.getElementById('admin-stat-paid').textContent = stats.paidCount;
    document.getElementById('admin-stat-pending').textContent = stats.pendingCount;

    const ordersRes = await fetch('/api/admin/orders');
    const orders = await ordersRes.json();

    const tbody = document.getElementById('admin-orders-table');
    if (orders.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-500">No bookings placed yet.</td></tr>`;
      return;
    }

    tbody.innerHTML = orders.map(o => {
      const statusBadge = o.status === 'PAID'
        ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">PAID</span>`
        : o.status === 'CHECKED_IN'
        ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">CHECKED IN</span>`
        : `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">PENDING</span>`;

      return `
        <tr class="hover:bg-slate-800/40">
          <td class="py-3 px-4 font-mono font-bold text-white">${o.id}</td>
          <td class="py-3 px-4">
            <div class="font-bold text-white">${o.customer.name}</div>
            <div class="text-[10px] text-slate-400">${o.customer.phone}</div>
          </td>
          <td class="py-3 px-4">
            <div class="text-white">${o.booking.room.name}</div>
            <div class="text-[10px] text-slate-400">${o.booking.date} &bull; ${o.booking.timeSlot}</div>
          </td>
          <td class="py-3 px-4 font-bold text-amber-400">$${o.pricing.totalUsd.toFixed(2)}</td>
          <td class="py-3 px-4">${statusBadge}</td>
          <td class="py-3 px-4 text-right space-x-1">
            ${o.status === 'PENDING' ? `
              <button onclick="adminMarkPaid('${o.id}')" class="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold">
                Confirm Pay
              </button>
            ` : ''}
            ${o.status === 'PAID' ? `
              <button onclick="adminCheckIn('${o.id}')" class="px-2 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold">
                Check In
              </button>
            ` : ''}
            <button onclick="viewOrderTicket('${o.id}')" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold">
              Ticket
            </button>
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Error loading admin data:', err);
  }
}

async function adminMarkPaid(orderId) {
  try {
    await fetch(`/api/orders/${orderId}/simulate-pay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payerBank: 'Cashier / Bakong Manual' })
    });
    loadAdminData();
    showToast(`Order ${orderId} marked as PAID!`);
  } catch (err) {
    alert('Failed to mark order as paid.');
  }
}

async function adminCheckIn(orderId) {
  try {
    await fetch(`/api/orders/${orderId}/check-in`, { method: 'POST' });
    loadAdminData();
    showToast(`Guest checked in for room door entry!`);
  } catch (err) {
    alert('Failed to check in guest.');
  }
}

async function viewOrderTicket(orderId) {
  try {
    const res = await fetch(`/api/orders/${orderId}`);
    const data = await res.json();
    if (data.success && data.order) {
      closeAdminModal();
      openTicketModal(data.order);
    }
  } catch (err) {
    alert('Could not load ticket.');
  }
}

// ==========================================
// CUSTOM KHQR PLAYGROUND
// ==========================================
function openCustomKhqrModal() {
  document.getElementById('custom-khqr-modal').classList.remove('hidden');
}

function closeCustomKhqrModal() {
  document.getElementById('custom-khqr-modal').classList.add('hidden');
}

async function generateCustomKhqr() {
  const amount = document.getElementById('custom-qr-amount').value;
  const currency = document.getElementById('custom-qr-currency').value;
  const billNumber = document.getElementById('custom-qr-bill').value;

  try {
    const res = await fetch('/api/khqr/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency, billNumber })
    });
    const data = await res.json();
    if (data.success) {
      document.getElementById('custom-qr-result').classList.remove('hidden');
      document.getElementById('custom-qr-img').src = data.qrDataUrl;
      document.getElementById('custom-qr-raw').textContent = data.khqr.qrString;
    }
  } catch (err) {
    alert('Failed to generate KHQR');
  }
}

// ==========================================
// UTILITIES
// ==========================================
function scrollToRooms() {
  document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' });
}

function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'fixed bottom-6 right-6 z-50 bg-slate-900 border border-slate-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce';
  toast.innerHTML = `<i class="fa-solid fa-bell text-red-500"></i><span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
