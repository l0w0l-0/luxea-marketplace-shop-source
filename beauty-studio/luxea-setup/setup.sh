#!/bin/bash

echo "=============================="
echo "  LUXÉA Beauty — Project Setup"
echo "=============================="

# 1. สร้าง Next.js project
npx create-next-app@latest luxea-beauty \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-git

cd luxea-beauty

# 2. ติดตั้ง dependencies
npm install \
  @clerk/nextjs \
  framer-motion \
  lucide-react \
  prisma \
  @prisma/client \
  axios \
  zustand \
  react-hot-toast

npm install -D \
  @types/node \
  prisma

# 3. ติดตั้ง shadcn/ui
npx shadcn@latest init -d

# shadcn components ที่ใช้
npx shadcn@latest add button card badge input label sheet dialog toast

# 4. สร้างโครงสร้างโฟลเดอร์
mkdir -p src/app/(auth)/login
mkdir -p src/app/(auth)/register
mkdir -p src/app/(shop)/products
mkdir -p src/app/(shop)/products/[id]
mkdir -p src/app/(shop)/cart
mkdir -p src/app/(shop)/checkout
mkdir -p src/app/(shop)/orders
mkdir -p src/app/(shop)/profile
mkdir -p src/app/admin/products
mkdir -p src/app/admin/orders
mkdir -p src/app/api/products
mkdir -p src/app/api/orders
mkdir -p src/app/api/payments
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/components/product
mkdir -p src/components/cart
mkdir -p src/lib
mkdir -p src/types
mkdir -p prisma

echo ""
echo "✅ ติดตั้งเสร็จแล้ว!"
echo ""
echo "ขั้นตอนต่อไป:"
echo "  1. แก้ไขไฟล์ .env.local"
echo "  2. npx prisma db push"
echo "  3. npm run dev"
