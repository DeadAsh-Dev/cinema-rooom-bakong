# 🎬 CINEMA ROOM (CAMBODIA) & BAKONG KHQR E-COMMERCE

> **A Luxury Private Cinema Room Booking & E-Commerce Platform with National Bank of Cambodia (NBC) Bakong KHQR Payment Integration.**
> Built for school presentation, demonstration in VS Code, and real Cambodian mobile banking apps.

---

## 🌟 Key Features

1. **Private Cinema Room Suites**:
   - **The Royal Gold Suite**: Couple Recliners, 4K OLED, Dolby Atmos 7.1 ($15.00 / ៛61,500).
   - **The Galaxy Friends Lounge**: 3-6 guests, 150" 4K laser projector, PS5 Pro ($25.00 / ៛102,500).
   - **The Velvet Grand Theater**: 6-12 guests, 220" CinemaScope, Karaoke & Butler service ($42.00 / ៛172,200).
   - **The Cyberpunk E-Sports Pod**: 2-4 guests, dual 4K 144Hz, Netflix/Disney+ ($18.00 / ៛73,800).

2. **Full E-Commerce Concession Stand**:
   - Gourmet Caramel & Truffle Cheddar Popcorn.
   - VIP Combo Sets (Popcorn + Drinks + Loaded Fries).
   - Loaded Nachos with Warm Queso, Crispy Chicken Tenders.
   - Brown Sugar Pearl Milk Tea, Coca-Cola Zero, Cambodia Beer.

3. **Authentic Bakong KHQR Integration (Cambodia Standard)**:
   - Built to the **National Bank of Cambodia (NBC) EMVCo KHQR** specification.
   - Connected with the verified merchant QR provided:
     - **Merchant Name**: `UNG CHEADEVITH` (Cinema Room)
     - **Acquiring Bank**: `ABA Bank`
     - **Bakong Account**: `abaakhppxxx@abaa`
     - **Account Number**: `124062615395144`
   - **Dual QR Display**:
     - **Dynamic KHQR**: Injects exact booking price into Tag 54 with CRC16 checksum calculation, prefilling the exact dollar amount when scanned in banking apps.
     - **Original Scan QR**: Displays the actual static QR code image (`user_qr.png`).
   - Supports all Cambodian banking apps: **ABA Mobile, Bakong App, Canadia Bank, Wing Bank, ACLEDA, Chip Mong, Sathapana**.

4. **Digital Cinema Boarding Pass & Room Key PIN**:
   - Upon successful payment, generates a boarding pass ticket.
   - Contains a unique **Smart Door Access PIN** (e.g. `PIN: 8492`) to unlock the private cinema room.
   - Entry check-in QR code and printable ticket format.

5. **Admin / Cashier POS Dashboard**:
   - Live revenue tracking in **USD ($)** and **KHR (៛)** (Rate: \$1 = 4,100៛).
   - Real-time order monitoring (Pending, Paid, Checked-In).
   - One-click payment confirmation and door check-in.

---

## 🚀 How to Run in VS Code

### Step 1: Open the Project in VS Code
1. Open **Visual Studio Code**.
2. Click **File > Open Folder...** and select `F:\Bakong`.

### Step 2: Run with One Click (or Terminal)

#### Option A: Press `F5` (Pre-configured VS Code Launch)
- Just press **`F5`** on your keyboard!
- VS Code will automatically start the server using `.vscode/launch.json`.

#### Option B: Using VS Code Integrated Terminal
1. Open the terminal in VS Code: press `Ctrl + ~` (or `Terminal > New Terminal`).
2. Run:
   ```bash
   npm start
   ```
   *(For auto-reload during editing, run `npm run dev`)*

### Step 3: Open in Your Browser
- Visit: [http://localhost:3000](http://localhost:3000)

---

## 🎯 How to Demonstrate to Teachers & Classmates

1. **Browse & Currency Toggle**:
   - Show the website in dark cinema luxury theme.
   - Click the **USD ($) / KHR (៛)** toggle in the top navbar to show instant conversion.
2. **Book a Private Cinema Suite**:
   - Click **Book Suite** on any room (e.g., *The Royal Gold Suite*).
   - Pick a date, guest count, and showtime slot.
   - Pick a movie (e.g., *Dune: Part Two* or *Bring Your Own Media*).
   - Add snacks (e.g., *Caramel Popcorn* + *Coke Zero*).
   - Fill in customer details and click **Generate Bakong KHQR**.
3. **The Bakong Scan Experience**:
   - The red official **NBC KHQR Modal** will appear with merchant **Cinema Room (UNG CHEADEVITH)**.
   - **Test with Real Phone**: Have anyone scan the QR with **ABA Mobile** or **Bakong App** — it will detect the account!
   - **School Demo Simulation**: Click the green button **"Simulate Payment Complete (School Demo)"** — this simulates an instant webhook callback from Bakong!
4. **View & Print Ticket**:
   - The modal automatically transforms into the VIP Cinema Ticket with the **Room Access PIN** and check-in barcode!
5. **Open Admin Dashboard**:
   - Click **Admin POS** in the top navbar to show live revenue stats and order status tracking.

---

## 🌐 How to Share Your Website (Hosting Options)

You have 3 easy ways to let anyone (teachers, classmates, friends) view and test your website on their phones or computers:

### Method 1: Same Wi-Fi / Classroom (Instant — No Setup)
If your phone or your classmate's phone is connected to the same Wi-Fi network, anyone can simply open your computer's local IP address:
```
http://192.168.100.216:3000
```
*(Check your exact Wi-Fi IP in the VS Code terminal output when `npm start` runs).*

---

### Method 2: Instant Public Link with `npm run share` (No Signup Required)
To let anyone view your website over **mobile data (Smart, Cellcard, Metfone)** anywhere in Cambodia:
1. Make sure your server is running (`npm start`) in your first terminal.
2. Open a **second terminal** in VS Code (`Terminal > New Terminal`).
3. Run:
   ```bash
   npm run share
   ```
4. It will generate a live public HTTPS URL (e.g. `https://cinema-room-phnompenh.loca.lt`).
5. Share that URL with anyone!
   *(On first visit, LocalTunnel shows a friendly password verification page: enter your public IP from `https://loca.lt/mytunnelpassword`)*.

---

### Method 3: 24/7 Permanent Free Cloud Hosting (Render.com)
To keep your Cinema Room website online 24/7 for your final project submission:
1. Initialize a git repository:
   ```bash
   git init
   git add .
   git commit -m "Cinema Room Cambodia"
   ```
2. Push to your GitHub account (`https://github.com/your-username/cinema-room`).
3. Go to [Render.com](https://render.com) (100% free account):
   - Click **New +** > **Web Service**.
   - Select your GitHub repository.
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. In under 2 minutes, Render gives you a permanent URL like `https://cinema-room.onrender.com` that stays online forever!

---

## 🧩 Technical Architecture

```
F:\Bakong\
├── .vscode\              # VS Code one-click run (F5) configuration
│   ├── launch.json
│   └── tasks.json
├── data\                 # Persistent database
│   └── orders.json
├── public\               # Frontend static assets
│   ├── css\style.css     # Luxury cinema styles & glassmorphism
│   ├── js\app.js         # Reactive booking & KHQR polling engine
│   ├── images\
│   │   └── user_qr.png   # The user's original Bakong QR code
│   └── index.html        # Responsive UI with Tailwind & Lucide icons
├── src\
│   ├── khqr.js           # EMVCo TLV encoder & CRC16-CCITT algorithm
│   ├── data.js           # Room suites, movies, and menu catalog
│   └── store.js          # Order manager, payment verification
├── server.js             # Express REST API server
├── package.json          # Node.js dependencies
└── README.md             # Documentation
```

### Bakong KHQR EMVCo Specification Details

| Tag | Name | Example Value | Description |
|---|---|---|---|
| `00` | Payload Format | `01` | Format Indicator |
| `01` | Initiation Method | `12` | `11` = Static, `12` = Dynamic (Amount specified) |
| `30` | Merchant Account | `0016abaakhppxxx@abaa...` | Bakong ID & Account `124062615395144` |
| `52` | Merchant Category | `8220` | Educational / Entertainment Services |
| `53` | Currency Code | `840` / `116` | `840` = USD, `116` = KHR |
| `54` | Transaction Amount | `21.50` | Dynamic order price |
| `58` | Country Code | `KH` | Cambodia |
| `59` | Merchant Name | `UNG CHEADEVITH` | Official NBC registered name |
| `60` | Merchant City | `PHNOM PENH` | City |
| `62` | Additional Template | Subtag `68` | ABA PayWay routing & Bill ID |
| `63` | Checksum | `123C` | CRC16-CCITT (0xFFFF, 0x1021) |
