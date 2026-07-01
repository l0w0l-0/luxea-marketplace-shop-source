export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "customer" | "admin";
  tier: "Member" | "VIP";
  points: number;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  shade: string;
  price: number;
  stock: number;
  rating: number;
  color: string;
};

export type Order = {
  id: string;
  userId: string;
  customerName: string;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  paymentMethod: string;
  status: "paid" | "waiting_payment" | "cod";
  createdAt: string;
};

type Database = {
  users: User[];
  products: Product[];
  orders: Order[];
};

const initialProducts: Product[] = [
  {
    id: "lip-velvet-01",
    name: "Velvet Matte Lipstick",
    category: "Lipstick",
    shade: "Rosy Pink",
    price: 299,
    stock: 24,
    rating: 4.9,
    color: "#D96483",
  },
  {
    id: "blush-soft-01",
    name: "Soft Cloud Blush",
    category: "Blush",
    shade: "Dusty Rose",
    price: 390,
    stock: 18,
    rating: 4.8,
    color: "#E8B4B8",
  },
  {
    id: "glow-gold-01",
    name: "Premium Glow Highlighter",
    category: "Highlighter",
    shade: "Champagne Gold",
    price: 590,
    stock: 10,
    rating: 4.9,
    color: "#D7B9AE",
  },
  {
    id: "base-silk-01",
    name: "Silk Skin Foundation",
    category: "Foundation",
    shade: "Neutral Beige",
    price: 690,
    stock: 15,
    rating: 4.7,
    color: "#C68493",
  },
  {
    id: "eye-soft-01",
    name: "Soft Glam Eyeshadow",
    category: "Eyeshadow",
    shade: "Rose Taupe",
    price: 450,
    stock: 22,
    rating: 4.8,
    color: "#B98B8F",
  },
  {
    id: "cleanser-rose-01",
    name: "Rose Jelly Cleanser",
    category: "Skincare",
    shade: "Gentle Rose",
    price: 320,
    stock: 31,
    rating: 4.6,
    color: "#F1B8C2",
  },
  {
    id: "mascara-lift-01",
    name: "Lash Lift Mascara",
    category: "Eye",
    shade: "Soft Black",
    price: 360,
    stock: 16,
    rating: 4.7,
    color: "#2A1D21",
  },
  {
    id: "mist-glow-01",
    name: "Dewy Setting Mist",
    category: "Setting",
    shade: "Glass Glow",
    price: 420,
    stock: 28,
    rating: 4.8,
    color: "#D7B9AE",
  },
  {
    id: "liner-brown-01",
    name: "Velvet Eye Liner",
    category: "Eye",
    shade: "Cocoa Brown",
    price: 250,
    stock: 40,
    rating: 4.5,
    color: "#6A3F3A",
  },
  {
    id: "lip-oil-01",
    name: "Hydra Lip Oil",
    category: "Lipstick",
    shade: "Pink Nectar",
    price: 290,
    stock: 33,
    rating: 4.9,
    color: "#F29AB0",
  },
  {
    id: "powder-air-01",
    name: "Air Blur Powder",
    category: "Face",
    shade: "Translucent",
    price: 490,
    stock: 14,
    rating: 4.6,
    color: "#F5E6E0",
  },
  {
    id: "brush-set-01",
    name: "Studio Brush Set",
    category: "Tools",
    shade: "Rose Gold",
    price: 790,
    stock: 9,
    rating: 4.8,
    color: "#D7B9AE",
  },
];

const initialUsers: User[] = [
  {
    id: "admin-01",
    name: "LUXEA Admin",
    email: "admin@luxea.test",
    password: "admin123",
    role: "admin",
    tier: "VIP",
    points: 1200,
  },
];

declare global {
  var luxeaDatabase: Database | undefined;
}

export function getDatabase() {
  if (!globalThis.luxeaDatabase) {
    globalThis.luxeaDatabase = {
      users: [...initialUsers],
      products: [...initialProducts],
      orders: [],
    };
  }

  return globalThis.luxeaDatabase;
}

export function publicUser(user: User) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    tier: user.tier,
    points: user.points,
  };
}

export function nextId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
