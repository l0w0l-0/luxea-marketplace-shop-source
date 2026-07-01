# LUXÉA Beauty — วิธีติดตั้ง

## สิ่งที่ต้องมีก่อน

| โปรแกรม | เวอร์ชัน | ดาวน์โหลด |
|---------|---------|-----------|
| Node.js | 18+ | https://nodejs.org |
| PostgreSQL | 15+ | https://postgresql.org |
| Git | ล่าสุด | https://git-scm.com |

---

## ขั้นตอนติดตั้ง

### 1. รัน setup script
```bash
chmod +x setup.sh
./setup.sh
```

### 2. ตั้งค่า Environment
```bash
cp .env.example .env.local
# แก้ไขค่าใน .env.local ให้ครบ
```

### 3. สร้างฐานข้อมูล
```bash
cd luxea-beauty
npx prisma db push
npx prisma generate
```

### 4. รันโปรเจค
```bash
npm run dev
# เปิด http://localhost:3000
```

---

## โครงสร้างโฟลเดอร์

```
luxea-beauty/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (shop)/
│   │   │   ├── products/
│   │   │   │   └── [id]/
│   │   │   ├── cart/
│   │   │   ├── checkout/
│   │   │   ├── orders/
│   │   │   └── profile/
│   │   ├── admin/
│   │   │   ├── products/
│   │   │   └── orders/
│   │   └── api/
│   │       ├── products/
│   │       ├── orders/
│   │       └── payments/
│   ├── components/
│   │   ├── layout/      ← Navbar, Footer
│   │   ├── product/     ← ProductCard, ColorPicker
│   │   └── cart/        ← CartDrawer, CartItem
│   ├── lib/
│   │   ├── prisma.ts    ← Database client
│   │   └── utils.ts     ← Helper functions
│   └── types/
│       └── index.ts     ← TypeScript types
├── prisma/
│   └── schema.prisma    ← Database schema
├── .env.example
└── setup.sh
```

---

## Services ที่ต้องสมัคร

| Service | ใช้ทำอะไร | ราคา |
|---------|----------|------|
| [Clerk](https://clerk.com) | Authentication | ฟรี 10,000 users |
| [Omise](https://omise.co) | Payment | % ต่อรายการ |
| [Resend](https://resend.com) | Email | ฟรี 3,000/เดือน |
| [Vercel](https://vercel.com) | Deploy | ฟรี |
| [Supabase](https://supabase.com) | PostgreSQL | ฟรี |
