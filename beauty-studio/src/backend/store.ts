export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "customer" | "admin";
  tier: "Member" | "VIP";
  points: number;
};

export type ProductColor = {
  id: string;
  name: string;
  hex: string;
  undertone: string;
  finish: string;
  coverage: string;
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
  description: string;
  image: string;
  colors: ProductColor[];
  isPremium: boolean;
  reviewCount: number;
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
  subtotal: number;
  shippingFee: number;
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
    description: "ลิปสติกเนื้อแมทท์ เกลี่ยง่าย ติดทนนาน ไม่แห้งปาก",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20velvet%20matte%20rose%20pink%20lipstick%20on%20elegant%20white%20background%20product%20photography&image_size=square_hd",
    colors: [
      { id: "rosy-pink", name: "Rosy Pink", hex: "#D96483", undertone: "Cool", finish: "Matte", coverage: "Medium" },
      { id: "cherry-red", name: "Cherry Red", hex: "#E2583E", undertone: "Warm", finish: "Matte", coverage: "Full" },
      { id: "plum-berry", name: "Plum Berry", hex: "#7A283D", undertone: "Neutral", finish: "Matte", coverage: "Full" },
    ],
    isPremium: false,
    reviewCount: 124,
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
    description: "บลัชออนเนื้อฝุ่นละเอียด ให้แก้มสีชมพูอ่อนโยน",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20dusty%20rose%20blush%20compact%20elegant%20product%20photography&image_size=square_hd",
    colors: [
      { id: "dusty-rose", name: "Dusty Rose", hex: "#E8B4B8", undertone: "Neutral", finish: "Satin", coverage: "Buildable" },
      { id: "peach-glow", name: "Peach Glow", hex: "#F2A284", undertone: "Warm", finish: "Satin", coverage: "Buildable" },
    ],
    isPremium: false,
    reviewCount: 87,
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
    description: "ไฮไลเตอร์เนื้อชิมเมอร์ ให้ผิวสะท้อนแสงอย่างเป็นธรรมชาติ",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20champagne%20gold%20highlighter%20compact%20elegant%20product%20photography&image_size=square_hd",
    colors: [
      { id: "champagne-gold", name: "Champagne Gold", hex: "#D7B9AE", undertone: "Neutral", finish: "Shimmer", coverage: "Buildable" },
      { id: "rose-gold", name: "Rose Gold", hex: "#E2A49A", undertone: "Warm", finish: "Shimmer", coverage: "Buildable" },
    ],
    isPremium: true,
    reviewCount: 156,
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
    description: "ฟาวน์เดชันเนื้อบางเบา ปกปิดดี ให้ผิวเนียนนุ่ม",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20silk%20skin%20foundation%20bottle%20elegant%20product%20photography&image_size=square_hd",
    colors: [
      { id: "neutral-beige", name: "Neutral Beige", hex: "#C68493", undertone: "Neutral", finish: "Natural", coverage: "Medium" },
      { id: "warm-ivory", name: "Warm Ivory", hex: "#F5E1D3", undertone: "Warm", finish: "Natural", coverage: "Light" },
      { id: "cool-porcelain", name: "Cool Porcelain", hex: "#CEB2A6", undertone: "Cool", finish: "Natural", coverage: "Medium" },
    ],
    isPremium: true,
    reviewCount: 201,
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
    description: "อายแชโดว์เนื้อฝุ่นละเอียด เบลนดี มีเฉดสีที่ใช้ได้ทุกโอกาส",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20rose%20taupe%20eyeshadow%20palette%20elegant%20product%20photography&image_size=square_hd",
    colors: [
      { id: "rose-taupe", name: "Rose Taupe", hex: "#B98B8F", undertone: "Neutral", finish: "Matte", coverage: "Full" },
    ],
    isPremium: false,
    reviewCount: 63,
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
    description: "คลีนเซอร์เนื้อเจลลี่ กลิ่นกุหลาบ ช่วยล้างเครื่องสำอางและสิ่งสกปรก",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20rose%20jelly%20cleanser%20bottle%20elegant%20product%20photography&image_size=square_hd",
    colors: [
      { id: "gentle-rose", name: "Gentle Rose", hex: "#F1B8C2", undertone: "Neutral", finish: "Gel", coverage: "N/A" },
    ],
    isPremium: false,
    reviewCount: 45,
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
    description: "มาสคาร่าที่ช่วยดันขนตาให้โค้งงอย่างเป็นธรรมชาติ",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20lash%20lift%20mascara%20tube%20elegant%20product%20photography&image_size=square_hd",
    colors: [
      { id: "soft-black", name: "Soft Black", hex: "#2A1D21", undertone: "Neutral", finish: "Volumizing", coverage: "Full" },
    ],
    isPremium: false,
    reviewCount: 92,
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
    description: "เซตติ้งมิสต์ ให้เครื่องสำอางติดทนนาน ผิวเรืองฉ่ำ",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20dewy%20setting%20mist%20spray%20bottle%20elegant%20product%20photography&image_size=square_hd",
    colors: [
      { id: "glass-glow", name: "Glass Glow", hex: "#D7B9AE", undertone: "Neutral", finish: "Dewy", coverage: "N/A" },
    ],
    isPremium: false,
    reviewCount: 78,
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
    description: "อายไลน์เนอร์เจลลี่ ระบายง่าย ติดทนนาน",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20cocoa%20brown%20eyeliner%20gel%20pot%20elegant%20product%20photography&image_size=square_hd",
    colors: [
      { id: "cocoa-brown", name: "Cocoa Brown", hex: "#6A3F3A", undertone: "Warm", finish: "Gel", coverage: "Full" },
    ],
    isPremium: false,
    reviewCount: 54,
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
    description: "ลิปออยล์บำรุงปาก ให้ปากชุ่มชื้น มีสีชมพูอ่อนโยน",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20pink%20nectar%20lip%20oil%20tube%20elegant%20product%20photography&image_size=square_hd",
    colors: [
      { id: "pink-nectar", name: "Pink Nectar", hex: "#F29AB0", undertone: "Neutral", finish: "Glossy", coverage: "Light" },
    ],
    isPremium: false,
    reviewCount: 134,
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
    description: "แป้งฝุ่นเนื้อละเอียด ช่วยดันซีบัม ให้ผิวเรียบเนียน",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20air%20blur%20translucent%20powder%20compact%20elegant%20product%20photography&image_size=square_hd",
    colors: [
      { id: "translucent", name: "Translucent", hex: "#F5E6E0", undertone: "Neutral", finish: "Matte", coverage: "Sheer" },
    ],
    isPremium: false,
    reviewCount: 67,
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
    description: "ชุดแปรงแต่งหน้าครบเซต คุณภาพสูง ใช้งานง่าย",
    image: "https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=luxury%20rose%20gold%20makeup%20brush%20set%20elegant%20product%20photography&image_size=square_hd",
    colors: [
      { id: "rose-gold", name: "Rose Gold", hex: "#D7B9AE", undertone: "N/A", finish: "N/A", coverage: "N/A" },
    ],
    isPremium: true,
    reviewCount: 112,
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
