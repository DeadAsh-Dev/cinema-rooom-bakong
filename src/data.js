/**
 * Initial Catalog Data for Cinema Room Cambodia
 * Rooms, Movies, and Concession E-Commerce Menu
 */

const EXCHANGE_RATE_USD_KHR = 4100; // 1 USD = 4,100 KHR

const ROOMS = [
  {
    id: 'room-gold',
    name: 'The Royal Gold Suite',
    tagline: 'Ultimate VIP Romantic & Couple Screening',
    capacity: '1 - 2 Guests',
    capacityMax: 2,
    priceUsd: 15.00,
    priceKhr: 15.00 * EXCHANGE_RATE_USD_KHR,
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    features: [
      'Dual Motorized Zero-Gravity Recliners',
      '4K OLED Ultra HDR 85" Display',
      'Dolby Atmos 7.1 Immersive Sound',
      'Private Mini Bar & Snack Butler Service',
      'Custom Dimmable Galaxy Mood Lighting',
      'Complimentary Popcorn Basket'
    ],
    status: 'AVAILABLE',
    colorTheme: 'from-amber-500/20 to-yellow-600/10'
  },
  {
    id: 'room-galaxy',
    name: 'The Galaxy Friends Lounge',
    tagline: 'Spacious Cozy Hub for Friend Hangouts & Anime Nights',
    capacity: '3 - 6 Guests',
    capacityMax: 6,
    priceUsd: 25.00,
    priceKhr: 25.00 * EXCHANGE_RATE_USD_KHR,
    image: 'https://images.unsplash.com/photo-1595769816263-9b910be24d5f?auto=format&fit=crop&w=800&q=80',
    features: [
      '150-inch 4K Laser Cinema Projection',
      'Plush Giant Modular Couch & Beanbags',
      'PS5 Pro Gaming Console with 4 Controllers',
      'Spatial Surround Sound Stage',
      'Board Games & Streaming Apps Preloaded',
      'Soundproof Acoustic Foam Walls'
    ],
    status: 'AVAILABLE',
    colorTheme: 'from-indigo-500/20 to-purple-600/10'
  },
  {
    id: 'room-velvet',
    name: 'The Velvet Grand Theater',
    tagline: 'Private Luxury Party & Celebration Cinema',
    capacity: '6 - 12 Guests',
    capacityMax: 12,
    priceUsd: 42.00,
    priceKhr: 42.00 * EXCHANGE_RATE_USD_KHR,
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80',
    features: [
      '220-inch High-Gain CinemaScope Screen',
      'Tiered Leather Club Loungers (12 Seats)',
      'THX Certified 9.2.4 Master Audio',
      'Private En-Suite Restroom & Dining Table',
      'Karaoke System & HDMI Laptop Dock',
      'Party Birthday / Anniversary Decor Option'
    ],
    status: 'AVAILABLE',
    colorTheme: 'from-rose-500/20 to-red-600/10'
  },
  {
    id: 'room-cyber',
    name: 'The Cyberpunk E-Sports Pod',
    tagline: 'Next-Gen Gaming & High-Refresh Blockbuster Suite',
    capacity: '2 - 4 Guests',
    capacityMax: 4,
    priceUsd: 18.00,
    priceKhr: 18.00 * EXCHANGE_RATE_USD_KHR,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
    features: [
      'Dual 65" 4K 144Hz Gaming OLED Displays',
      'PS5, Nintendo Switch & High-End PC Setup',
      'Pro Razer & Secretlab Reclining Chairs',
      'RGB Neon Cyberpunk Reactive Lighting',
      'Ultra Low Latency Fiber Internet (1 Gbps)',
      'Headsets & Studio Microphones'
    ],
    status: 'AVAILABLE',
    colorTheme: 'from-cyan-500/20 to-blue-600/10'
  }
];

const MOVIES = [
  {
    id: 'mov-1',
    title: 'Dune: Part Two',
    category: 'Sci-Fi / Action',
    duration: '2h 46m',
    rating: 'PG-13',
    score: '8.6/10',
    poster: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.'
  },
  {
    id: 'mov-2',
    title: 'Demon Slayer: Infinity Castle',
    category: 'Anime / Fantasy',
    duration: '2h 15m',
    rating: 'PG-13',
    score: '9.0/10',
    poster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
    description: 'The Demon Slayer Corps plunge into the Infinity Castle to confront Muzan Kibutsuji in the ultimate showdown.'
  },
  {
    id: 'mov-3',
    title: 'The Conjuring: Last Rites',
    category: 'Horror / Mystery',
    duration: '1h 58m',
    rating: 'R',
    score: '8.1/10',
    poster: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    description: 'Ed and Lorraine Warren take on one final terrifying case involving mysterious entities in an isolated estate.'
  },
  {
    id: 'mov-4',
    title: 'Interstellar (IMAX Edition)',
    category: 'Sci-Fi / Drama',
    duration: '2h 49m',
    rating: 'PG-13',
    score: '8.7/10',
    poster: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot is tasked to pilot a spacecraft through a wormhole.'
  },
  {
    id: 'mov-5',
    title: 'Spider-Man: Beyond the Spider-Verse',
    category: 'Animation / Action',
    duration: '2h 20m',
    rating: 'PG',
    score: '8.9/10',
    poster: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=600&q=80',
    description: 'Miles Morales traverses the multiverse to save the people he loves most from an impending dimensional collapse.'
  },
  {
    id: 'mov-byom',
    title: 'Bring Your Own Media / PS5 & Netflix',
    category: 'Custom Experience',
    duration: 'Full Session (2-3 hrs)',
    rating: 'All Ages',
    score: '10/10',
    poster: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=600&q=80',
    description: 'Plug in your HDMI laptop, log into your own Netflix/Disney+/YouTube account, or play PS5 multiplayer games!'
  }
];

const MENU_ITEMS = [
  {
    id: 'snack-popcorn-caramel',
    name: 'Gourmet Caramel Popcorn (L)',
    category: 'Popcorn',
    priceUsd: 3.50,
    priceKhr: 3.50 * EXCHANGE_RATE_USD_KHR,
    image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=400&q=80',
    description: 'Freshly popped warm popcorn coated with rich golden buttery caramel glaze.'
  },
  {
    id: 'snack-popcorn-cheese',
    name: 'Cheddar Truffle Popcorn (L)',
    category: 'Popcorn',
    priceUsd: 3.50,
    priceKhr: 3.50 * EXCHANGE_RATE_USD_KHR,
    image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=400&q=80',
    description: 'Savory blend of sharp aged cheddar with a gentle kiss of Italian white truffle.'
  },
  {
    id: 'snack-combo-couple',
    name: 'Cinema VIP Duo Combo',
    category: 'Combos',
    priceUsd: 6.00,
    priceKhr: 6.00 * EXCHANGE_RATE_USD_KHR,
    image: 'https://images.unsplash.com/photo-1512149177596-f817c7ef5d4c?auto=format&fit=crop&w=400&q=80',
    description: '1 Large Popcorn (Caramel/Cheese) + 2 Ice-Cold Drinks + 1 Crispy Fries.'
  },
  {
    id: 'snack-nachos',
    name: 'Loaded Nachos with Warm Queso',
    category: 'Hot Food',
    priceUsd: 4.50,
    priceKhr: 4.50 * EXCHANGE_RATE_USD_KHR,
    image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=400&q=80',
    description: 'Crispy corn tortilla chips topped with melted cheese sauce, salsa, and jalapenos.'
  },
  {
    id: 'snack-tenders',
    name: 'Crispy Boneless Chicken Tenders',
    category: 'Hot Food',
    priceUsd: 4.75,
    priceKhr: 4.75 * EXCHANGE_RATE_USD_KHR,
    image: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=80',
    description: '5 pieces golden seasoned chicken tenders served with honey mustard & spicy mayo.'
  },
  {
    id: 'drink-boba',
    name: 'Brown Sugar Pearl Fresh Milk',
    category: 'Drinks',
    priceUsd: 2.75,
    priceKhr: 2.75 * EXCHANGE_RATE_USD_KHR,
    image: 'https://images.unsplash.com/photo-1558857563-b37d1d26f634?auto=format&fit=crop&w=400&q=80',
    description: 'Chewy warm tapioca pearls with organic brown sugar syrup and fresh chilled milk.'
  },
  {
    id: 'drink-coke-zero',
    name: 'Coca-Cola Zero Can (Chilled)',
    category: 'Drinks',
    priceUsd: 1.50,
    priceKhr: 1.50 * EXCHANGE_RATE_USD_KHR,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
    description: 'Ice-cold refreshing zero-sugar classic cola served with ice cup.'
  },
  {
    id: 'drink-cambodia-beer',
    name: 'Cambodia Premium Lager Can',
    category: 'Drinks',
    priceUsd: 2.00,
    priceKhr: 2.00 * EXCHANGE_RATE_USD_KHR,
    image: 'https://images.unsplash.com/photo-1608270119853-29c878939c87?auto=format&fit=crop&w=400&q=80',
    description: 'Local favorite chilled crisp Cambodian brew for adult movie screenings (18+).'
  }
];

const TIME_SLOTS = [
  '10:00 AM - 12:00 PM',
  '12:30 PM - 02:30 PM',
  '03:00 PM - 05:00 PM',
  '05:30 PM - 07:30 PM',
  '08:00 PM - 10:00 PM',
  '10:30 PM - 12:30 AM'
];

module.exports = {
  EXCHANGE_RATE_USD_KHR,
  ROOMS,
  MOVIES,
  MENU_ITEMS,
  TIME_SLOTS
};
