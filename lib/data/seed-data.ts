import { PRNG } from "./prng";
import type {
  Category,
  Customer,
  CustomerSegment,
  EcommerceDataset,
  Order,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  Product,
  Region,
  User,
} from "@/types/ecommerce";

const CATEGORIES_DEF: string[] = [
  "Electronics",
  "Fashion & Apparel",
  "Beauty & Personal Care",
  "Home & Kitchen",
  "Footwear",
  "Jewellery & Accessories",
  "Health & Wellness",
  "Grocery & Gourmet",
  "Mobile Accessories",
  "Home Decor",
];

const REGIONS_DEF: Region[] = [
  "Maharashtra",
  "Karnataka",
  "Delhi",
  "Tamil Nadu",
  "Telangana",
  "Gujarat",
  "Uttar Pradesh",
  "West Bengal",
  "Rajasthan",
  "Kerala",
];

const REGION_WEIGHTS = [0.24, 0.18, 0.16, 0.12, 0.10, 0.07, 0.05, 0.04, 0.02, 0.02];

const STATE_CITIES: Record<Region, string[]> = {
  Maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Thane"],
  Karnataka: ["Bengaluru", "Mysuru", "Hubballi", "Mangaluru"],
  Delhi: ["New Delhi", "South Delhi", "Central Delhi", "Dwarka"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli"],
  Telangana: ["Hyderabad", "Warangal", "Nizamabad", "Secunderabad"],
  Gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot"],
  "Uttar Pradesh": ["Lucknow", "Noida", "Kanpur", "Varanasi", "Ghaziabad"],
  "West Bengal": ["Kolkata", "Siliguri", "Howrah", "Durgapur"],
  Rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota"],
  Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur"],
};

const PAYMENT_METHODS_DEF: PaymentMethod[] = [
  "UPI",
  "Credit Card",
  "Debit Card",
  "Cash on Delivery",
  "Net Banking",
  "Wallet",
];
const PAYMENT_WEIGHTS = [0.50, 0.18, 0.12, 0.12, 0.05, 0.03];

const SEGMENTS_DEF: CustomerSegment[] = ["New", "Returning", "VIP", "At Risk"];
const SEGMENT_WEIGHTS = [0.35, 0.40, 0.15, 0.10];

const FIRST_NAMES = [
  "Aarav", "Priya", "Rahul", "Ananya", "Rohan", "Sneha", "Arjun", "Neha", "Vikram", "Kavya",
  "Aditya", "Pooja", "Karan", "Ishita", "Siddharth", "Meera", "Nikhil", "Aditi", "Yash", "Simran",
  "Karthik", "Deepa", "Harish", "Divya", "Varun", "Swati", "Pranav", "Tanvi", "Abhinav", "Ritu",
  "Sanjay", "Sunita", "Rajesh", "Shreya", "Manoj", "Pallavi", "Alok", "Shilpa", "Sourav", "Debashree",
  "Chirag", "Hetal", "Manan", "Kinjal", "Omkar", "Sayali", "Swapnil", "Vaishali", "Venkat", "Lakshmi",
  "Sridhar", "Gayathri", "Kiran", "Radhika", "Ashwin", "Malavika", "Amartya", "Anwesha", "Gautam", "Tarun",
];

const LAST_NAMES = [
  "Sharma", "Mehta", "Verma", "Gupta", "Malhotra", "Iyer", "Kapoor", "Agarwal", "Singh", "Nair",
  "Shah", "Joshi", "Bansal", "Rao", "Jain", "Patel", "Arora", "Kulkarni", "Thakur", "Kaur",
  "Chatterjee", "Mukherjee", "Banerjee", "Das", "Sen", "Dutta", "Bhattacharya", "Deshmukh", "Patil", "Shinde",
  "Bhosale", "Jadhav", "Pawar", "Reddy", "Chowdary", "Raju", "Murthy", "Subramanian", "Natarajan", "Balakrishnan",
  "Raman", "Nambiar", "Menon", "Pillai", "Hegde", "Shetty", "Gowda", "Trivedi", "Desai", "Parekh",
  "Vora", "Solanki", "Gill", "Dhillon", "Sandhu", "Bhatia", "Chauhan", "Sengupta", "Choudhury", "Bose",
];

const PRODUCT_TEMPLATES: Record<string, { names: string[]; minPrice: number; maxPrice: number }> = {
  Electronics: {
    names: [
      "Studio ANC Wireless Headphones",
      "65W GaN Fast Wall Charger",
      "Smart Fitness Band with SpO2",
      "4K Ultra HD Streaming Stick",
      "Mechanical Wireless Gaming Keyboard",
      "Ergonomic Optical Precision Mouse",
      "20000mAh Power Delivery Power Bank",
      "True Wireless Sport Earbuds ANC",
      "Wi-Fi 6 Dual-Band Mesh Router",
      "Smart Security Camera 360",
      "USB-C 8-in-1 Aluminium Hub",
      "RGB Dynamic Ambient Light Bar",
      "Surge Protector 6-Socket Board",
      "Active Stylus Pen for Touchscreens",
      "Portable Bluetooth Speaker 20W",
    ],
    minPrice: 1299,
    maxPrice: 24999,
  },
  "Fashion & Apparel": {
    names: [
      "Pure Cotton Embroidered Kurta",
      "Handloom Linen Regular Shirt",
      "Slim Fit Stretch Chino Trousers",
      "Heavyweight Organic Cotton Tee",
      "Festive Silk Blend Nehru Jacket",
      "Handwoven Banarasi Silk Saree",
      "Structured Raw Denim Jacket",
      "Tailored Oxford Formal Shirt",
      "French Terry Relaxed Fit Hoodie",
      "Breathable Cotton Chino Shorts",
      "Lightweight Water-Repellent Windcheater",
      "Classic Checked Casual Shirt",
      "Stretch Knit Polo T-Shirt",
      "Utility Multi-Pocket Cargo Trousers",
      "Fine Merino Wool Blend Pullover",
    ],
    minPrice: 699,
    maxPrice: 4499,
  },
  "Beauty & Personal Care": {
    names: [
      "Kumkumadi Ayurvedic Miracle Face Oil",
      "Vitamin C Brightening Glow Serum",
      "Rosemary & Bhringraj Scalp Hair Oil",
      "Mineral SPF 50 Broad Spectrum Sunscreen",
      "Gentle Hydrating Foaming Face Wash",
      "10% Niacinamide Clarifying Serum",
      "Ceramide Deep Barrier Repair Moisturizer",
      "Organic Cold-Pressed Rosehip Seed Oil",
      "Revitalizing Caffeine Under-Eye Cream",
      "Deep Cleansing Multani Mitti Face Pack",
      "Hydrating Aloe & Green Tea Body Lotion",
      "Bamboo Charcoal Micro-Exfoliating Scrub",
      "Red Onion Hair Growth Therapy Oil",
      "Volumizing Biotin Hair Cleanser",
      "Hydrating Overnight Lip Butter Mask",
    ],
    minPrice: 349,
    maxPrice: 2499,
  },
  "Home & Kitchen": {
    names: [
      "Pre-Seasoned Cast Iron Dosa Tawa 11in",
      "Cold Press Slow Masticating Juicer",
      "Traditional Brass Filter Coffee Brewer",
      "Pure Copper Water Dispenser Hammered 5L",
      "Ceramic Hand-Glazed Dinner Set 12-Piece",
      "Solid Teakwood Heavy Chopping Board",
      "Borosilicate Airtight Spice Jar Set",
      "Tri-Ply Stainless Steel Kadhai with Lid",
      "Precision Electric Gooseneck Kettle",
      "Manual Ceramic Burr Coffee Grinder",
      "Enameled Cast Iron Dutch Oven Pot",
      "Vacuum Insulated Steel Travel Tumbler",
      "Non-Stick Granite Fry Pan 26cm",
      "Magnetic Stainless Steel Knife Strip",
      "Artisan Stoneware Tea Cups Set of 6",
    ],
    minPrice: 499,
    maxPrice: 6999,
  },
  Footwear: {
    names: [
      "Handcrafted Kolhapuri Leather Mojaris",
      "Lightweight Cloud Cushion Running Shoes",
      "Classic Tan Leather Penny Loafers",
      "Breathable Mesh Slip-On Daily Walkers",
      "All-Weather Vibram Grip Trekking Boots",
      "Handmade Genuine Leather Chelsea Boots",
      "Ergonomic Orthopedic Recovery Slides",
      "Retro Heritage Canvas High-Top Sneakers",
      "Cushioned Aerobic Training Trainers",
      "Water-Repellent Commuter Urban Shoes",
      "Minimalist Everyday Lace-Up Sneakers",
      "Formal Double Monk-Strap Dress Shoes",
      "Comfort Foam Walking Sandals",
      "Memory Foam Indoor House Slippers",
      "Trail Runner Breathable Sports Shoes",
    ],
    minPrice: 899,
    maxPrice: 4999,
  },
  "Jewellery & Accessories": {
    names: [
      "925 Sterling Silver Lotus Pendant",
      "Handcrafted Kundan Choker Necklace Set",
      "Top-Grain Leather RFID Bi-Fold Wallet",
      "Classic Polarized Aviator Sunglasses",
      "Antique Brass Temple Jhumka Earrings",
      "Minimalist Chronograph Leather Watch",
      "Traditional Meenakari Enamel Bangle Duo",
      "Genuine Leather Reversible Formal Belt",
      "Zircon Solitaire Crystal Stud Earrings",
      "Handwoven Pure Silk Jacquard Pocket Square",
      "Rose Gold Plated Link Bracelet",
      "Silver Plated Floral Anklets Pair",
      "Handcrafted Wooden Cufflink Set",
      "Matte Black Metal Frame Reading Glasses",
      "Beaded Natural Stone Energy Bracelet",
    ],
    minPrice: 799,
    maxPrice: 8999,
  },
  "Health & Wellness": {
    names: [
      "Organic KSM-66 Ashwagandha Capsules",
      "Plant Protein Isolate Powder 1kg",
      "Pure Himalayan Grade A Shilajit Resin",
      "Cold-Pressed Extra Virgin Coconut Oil",
      "Raw Wild Forest Organic Honey 500g",
      "Triple Strength Omega-3 Fish Oil",
      "Ayurvedic Triphala Digestion Tablets",
      "Natural Rubber Pro Yoga Mat 6mm",
      "High-Density Foam Muscle Roller",
      "Heavy-Duty Fabric Resistance Loop Bands",
      "Electrolyte Hydration Drink Mix 30 Servings",
      "Deep Tissue Percussion Massage Gun",
      "Organic Spirulina & Chlorella Tablets",
      "Apple Cider Vinegar with Mother 750ml",
      "Herbal Immunity Kadha Brew Pack",
    ],
    minPrice: 399,
    maxPrice: 3499,
  },
  "Grocery & Gourmet": {
    names: [
      "A++ Grade Kashmiri Mogra Saffron 1g",
      "Single-Origin Chikmagalur Arabica Coffee",
      "First Flush Darjeeling Whole Leaf Tea",
      "California Jumbo Roasted Almonds 500g",
      "Artisanal Dark Chocolate 72% Single Origin",
      "A2 Desi Cow Cultured Ghee 500ml",
      "Organic White Quinoa Grain 1kg",
      "Cold-Pressed Yellow Mustard Oil 1L",
      "Pure Kashmiri Walnut Kernels 400g",
      "Roasted Peri Peri Makhana Fox Nuts",
      "Himalayan Pink Rock Salt Fine 1kg",
      "Organic Chia & Flax Seed Healthy Mix",
      "Raw Unfiltered Wildflower Honey",
      "Belgian Style Cocoa Powder 250g",
      "Sun-Dried Medjool Organic Dates 500g",
    ],
    minPrice: 249,
    maxPrice: 2299,
  },
  "Mobile Accessories": {
    names: [
      "65W Braided Type-C SuperFast Cable",
      "Magnetic Qi Wireless Car Dashboard Mount",
      "Edge-to-Edge 9H Tempered Glass 2-Pack",
      "Shockproof Matte Bumper Hybrid Case",
      "3-in-1 Magnetic Foldable Charging Station",
      "Metal Kickstand Armor Phone Cover",
      "USB-C to 3.5mm DAC Audio Adapter",
      "Ultra-Thin Matte Fingerprint Grip Ring",
      "Universal Waterproof Phone Pouch Case",
      "Braided Nylon Lightning MFi Cable",
      "Multi-Angle Desktop Metal Phone Stand",
      "Camera Lens Sapphire Glass Protector",
      "Magnetic Leather Card Holder Wallet",
      "High-Speed Dual USB Car Fast Charger 45W",
      "Anti-Dust Speaker Mesh Protector Kit",
    ],
    minPrice: 299,
    maxPrice: 3499,
  },
  "Home Decor": {
    names: [
      "Handwoven Natural Jute Area Rug 4x6ft",
      "Matte Glazed Ceramic Ribbed Floor Vase",
      "Handcrafted Solid Brass Urli Bowl 10in",
      "Textured Bohemian Macrame Wall Tapestry",
      "Pure Soy Wax Scented Aromatherapy Candle",
      "Hand-Carved Sheesham Wood Wall Clock",
      "Minimalist Nordic Arc Desk Lamp",
      "Embroidered Cotton Cushion Covers Set of 5",
      "Handcrafted Iron Tealight Lantern Set",
      "Floating Solid Sheesham Wall Shelves Set",
      "Abstract Terracotta Canvas Wall Art",
      "Brass Finished Hammered Planter with Stand",
      "Block Printed Cotton Table Runner",
      "Natural Dried Pampas Grass Bouquet 30-Stem",
      "Aromatherapy Ceramic Oil Diffuser Burner",
    ],
    minPrice: 499,
    maxPrice: 5999,
  },
};

export function generateDeterministicSeed(seed: number = 133742): EcommerceDataset {
  const prng = new PRNG(seed);

  // 1. Users (Admin and Viewer)
  const users: User[] = [
    {
      id: "usr_admin_01",
      name: "Aarav Sharma",
      email: "admin@commandcenter.io",
      role: "ADMIN",
    },
    {
      id: "usr_viewer_01",
      name: "Priya Mehta",
      email: "viewer@commandcenter.io",
      role: "VIEWER",
    },
  ];

  // 2. Categories (10 items)
  const categories: Category[] = CATEGORIES_DEF.map((name, idx) => ({
    id: `cat_${(idx + 1).toString().padStart(2, "0")}`,
    name,
  }));

  // 3. Products (~150 items: 15 per category)
  const products: Product[] = [];
  let prodCounter = 1;

  for (const cat of categories) {
    const template = PRODUCT_TEMPLATES[cat.name];
    for (let i = 0; i < template.names.length; i++) {
      const name = template.names[i];
      const rawPrice = prng.nextFloat(template.minPrice, template.maxPrice, 0);
      // Realistic Indian price endings: e.g. round to 9 or 99 or clean round
      const price = Math.round(rawPrice);
      // Realistic margin: cost is between 38% and 62% of price
      const costFactor = prng.nextFloat(0.38, 0.62, 2);
      const cost = Math.round(price * costFactor * 100) / 100;
      const stock = prng.nextInt(15, 650);

      // Deterministic created date in 2025
      const month = (i % 12) + 1;
      const day = (i % 28) + 1;
      const createdAt = `2025-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}T08:00:00.000Z`;

      products.push({
        id: `prod_${prodCounter.toString().padStart(4, "0")}`,
        name,
        categoryId: cat.id,
        price,
        cost,
        stock,
        createdAt,
      });
      prodCounter++;
    }
  }

  // 4. Customers (~500 customers)
  const customers: Customer[] = [];
  const usedEmails = new Set<string>();

  for (let i = 1; i <= 500; i++) {
    const firstName = prng.choice(FIRST_NAMES);
    const lastName = prng.choice(LAST_NAMES);
    const name = `${firstName} ${lastName}`;
    let email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
    if (usedEmails.has(email)) {
      email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${i}@urbannest.in`;
    }
    usedEmails.add(email);

    const region = prng.weightedChoice(REGIONS_DEF, REGION_WEIGHTS);
    const cityOptions = STATE_CITIES[region] ?? ["Mumbai"];
    const city = prng.choice(cityOptions);

    // Realistic Indian mobile number format: +91 98XXX XXXXX
    const prefix = prng.choice(["98", "97", "99", "91", "93", "94", "88", "70", "81", "86"]);
    const mid = prng.nextInt(100, 999);
    const last = prng.nextInt(10000, 99999);
    const phone = `+91 ${prefix}${mid} ${last}`;

    const segment = prng.weightedChoice(SEGMENTS_DEF, SEGMENT_WEIGHTS);

    // Distributed created date between Aug 2025 and Mar 2026
    const dayOffset = prng.nextInt(0, 240);
    const baseDate = new Date("2025-08-01T10:00:00.000Z");
    baseDate.setDate(baseDate.getDate() + dayOffset);
    const createdAt = baseDate.toISOString();

    customers.push({
      id: `cust_${i.toString().padStart(4, "0")}`,
      name,
      email,
      phone,
      city,
      region,
      segment,
      createdAt,
    });
  }

  // 5. Orders (~2,000 orders) & OrderItems
  const orders: Order[] = [];
  const orderItems: OrderItem[] = [];
  let orderItemCounter = 1;

  // Date horizon: 2025-08-01 to 2026-09-01 (approx 396 days)
  const startDate = new Date("2025-08-01T00:00:00.000Z").getTime();
  const endDate = new Date("2026-09-01T23:59:59.000Z").getTime();
  const totalDuration = endDate - startDate;

  // Realistic order status weights
  const ALL_STATUSES: OrderStatus[] = [
    "Delivered",
    "Shipped",
    "Processing",
    "Pending",
    "Cancelled",
  ];
  const HISTORIC_STATUS_WEIGHTS = [0.88, 0.02, 0.01, 0.01, 0.08];
  const RECENT_STATUS_WEIGHTS = [0.45, 0.22, 0.18, 0.10, 0.05];

  for (let i = 1; i <= 2000; i++) {
    const orderId = `ord_${i.toString().padStart(5, "0")}`;
    const customer = prng.choice(customers);

    // Distribution with slight upward growth over time
    const normalizedTime = Math.pow(prng.next(), 0.85);
    const orderTimestamp = startDate + normalizedTime * totalDuration;
    const orderDate = new Date(orderTimestamp);
    const createdAt = orderDate.toISOString();

    // Check if order is in the recent 14 days of the horizon
    const isRecent = endDate - orderTimestamp < 14 * 86400 * 1000;
    const status = isRecent
      ? prng.weightedChoice(ALL_STATUSES, RECENT_STATUS_WEIGHTS)
      : prng.weightedChoice(ALL_STATUSES, HISTORIC_STATUS_WEIGHTS);

    const paymentMethod = prng.weightedChoice(PAYMENT_METHODS_DEF, PAYMENT_WEIGHTS);

    // Determine number of distinct items (1 to 4)
    const itemCountWeights = [0.55, 0.30, 0.12, 0.03];
    const numItems = prng.weightedChoice([1, 2, 3, 4], itemCountWeights);

    // Pick distinct products
    const chosenProductIndices = new Set<number>();
    while (chosenProductIndices.size < numItems) {
      chosenProductIndices.add(prng.nextInt(0, products.length - 1));
    }

    let totalAmount = 0;

    for (const prodIndex of chosenProductIndices) {
      const product = products[prodIndex];
      // Quantity usually 1 (75%), 2 (18%), 3 (7%)
      const quantity = prng.weightedChoice([1, 2, 3], [0.75, 0.18, 0.07]);
      const unitPrice = product.price;
      const itemSubtotal = Math.round(quantity * unitPrice * 100) / 100;
      totalAmount = Math.round((totalAmount + itemSubtotal) * 100) / 100;

      orderItems.push({
        id: `item_${orderItemCounter.toString().padStart(6, "0")}`,
        orderId,
        productId: product.id,
        quantity,
        unitPrice,
      });
      orderItemCounter++;
    }

    orders.push({
      id: orderId,
      customerId: customer.id,
      status,
      totalAmount,
      region: customer.region,
      paymentMethod,
      createdAt,
    });
  }

  // Sort orders chronologically
  orders.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return {
    users,
    categories,
    products,
    customers,
    orders,
    orderItems,
  };
}

/**
 * Deterministic default dataset singleton.
 */
export const SEED_DATA = generateDeterministicSeed(133742);
