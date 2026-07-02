-- CreateEnum
CREATE TYPE "ProductCategory" AS ENUM ('LIPSTICK', 'FOUNDATION', 'BLUSH', 'EYESHADOW', 'HIGHLIGHTER', 'CONTOUR', 'SKINCARE');

-- CreateEnum
CREATE TYPE "Undertone" AS ENUM ('COOL', 'WARM', 'NEUTRAL');

-- CreateEnum
CREATE TYPE "Finish" AS ENUM ('MATTE', 'GLOSSY', 'SATIN', 'SHIMMER');

-- CreateEnum
CREATE TYPE "Coverage" AS ENUM ('LIGHT', 'MEDIUM', 'FULL');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CUSTOMER', 'ADMIN');

-- CreateEnum
CREATE TYPE "CartStatus" AS ENUM ('ACTIVE', 'CONVERTED', 'EXPIRED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAID', 'PROCESSING', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "OrderPaymentMethod" AS ENUM ('CREDIT_CARD', 'DEBIT_CARD', 'PROMPTPAY', 'WALLET');

-- CreateEnum
CREATE TYPE "LoyaltyTransactionReason" AS ENUM ('PURCHASE', 'REDEEM_DISCOUNT', 'REDEEM_SHIPPING', 'BOTTLE_RECYCLE', 'REFERRAL');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "skin_tone" VARCHAR(100),
    "undertone" "Undertone",
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" "ProductCategory" NOT NULL,
    "base_price" DECIMAL(12,2) NOT NULL,
    "description" TEXT NOT NULL,
    "video_url" TEXT,
    "avg_rating" DECIMAL(3,2),
    "review_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_colors" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "color_name" VARCHAR(120) NOT NULL,
    "hex" VARCHAR(7) NOT NULL,
    "rgb" VARCHAR(32) NOT NULL,
    "undertone" "Undertone" NOT NULL,
    "finish" "Finish" NOT NULL,
    "coverage" "Coverage" NOT NULL,
    "opacity_pct" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "color_id" UUID,
    "stock_qty" INTEGER NOT NULL DEFAULT 0,
    "reserved_qty" INTEGER NOT NULL DEFAULT 0,
    "low_stock_threshold" INTEGER NOT NULL DEFAULT 10,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carts" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "session_id" VARCHAR(255),
    "status" "CartStatus" NOT NULL DEFAULT 'ACTIVE',
    "expires_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "carts"
ADD CONSTRAINT "chk_cart_owner"
CHECK ("user_id" IS NOT NULL OR "session_id" IS NOT NULL);

-- CreateTable
CREATE TABLE "cart_items" (
    "id" UUID NOT NULL,
    "cart_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "color_id" UUID,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "shipping_fee" DECIMAL(12,2) NOT NULL,
    "discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "payment_method" "OrderPaymentMethod" NOT NULL,
    "payment_reference_token" VARCHAR(255),
    "idempotency_key" VARCHAR(255),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "color_id" UUID,
    "quantity" INTEGER NOT NULL,
    "unit_price" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "points_balance" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "order_id" UUID,
    "points_change" INTEGER NOT NULL,
    "reason" "LoyaltyTransactionReason" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE INDEX "products_category_is_active_idx" ON "products"("category", "is_active");

-- CreateIndex
CREATE INDEX "products_is_active_deleted_at_idx" ON "products"("is_active", "deleted_at");

-- CreateIndex
CREATE INDEX "products_created_at_idx" ON "products"("created_at");

-- CreateIndex
CREATE INDEX "products_base_price_idx" ON "products"("base_price");

-- CreateIndex
CREATE INDEX "product_colors_product_id_idx" ON "product_colors"("product_id");

-- CreateIndex
CREATE INDEX "product_colors_hex_idx" ON "product_colors"("hex");

-- CreateIndex
CREATE INDEX "product_colors_undertone_finish_idx" ON "product_colors"("undertone", "finish");

-- CreateIndex
CREATE INDEX "product_colors_deleted_at_idx" ON "product_colors"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "product_colors_product_id_color_name_key" ON "product_colors"("product_id", "color_name");

-- CreateIndex
CREATE INDEX "inventory_product_id_idx" ON "inventory"("product_id");

-- CreateIndex
CREATE INDEX "inventory_color_id_idx" ON "inventory"("color_id");

-- CreateIndex
CREATE INDEX "inventory_stock_qty_idx" ON "inventory"("stock_qty");

-- CreateIndex
CREATE INDEX "inventory_low_stock_threshold_idx" ON "inventory"("low_stock_threshold");

-- CreateIndex
CREATE INDEX "inventory_deleted_at_idx" ON "inventory"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "inventory_product_id_color_id_key" ON "inventory"("product_id", "color_id");

-- CreateIndex
CREATE INDEX "carts_user_id_idx" ON "carts"("user_id");

-- CreateIndex
CREATE INDEX "carts_session_id_idx" ON "carts"("session_id");

-- CreateIndex
CREATE INDEX "carts_status_expires_at_idx" ON "carts"("status", "expires_at");

-- CreateIndex
CREATE INDEX "carts_deleted_at_idx" ON "carts"("deleted_at");

-- CreateIndex
CREATE INDEX "cart_items_cart_id_idx" ON "cart_items"("cart_id");

-- CreateIndex
CREATE INDEX "cart_items_product_id_idx" ON "cart_items"("product_id");

-- CreateIndex
CREATE INDEX "cart_items_color_id_idx" ON "cart_items"("color_id");

-- CreateIndex
CREATE UNIQUE INDEX "cart_items_cart_id_product_id_color_id_key" ON "cart_items"("cart_id", "product_id", "color_id");

-- CreateIndex
CREATE INDEX "orders_user_id_idx" ON "orders"("user_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

-- CreateIndex
CREATE INDEX "orders_deleted_at_idx" ON "orders"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "orders_idempotency_key_key" ON "orders"("idempotency_key");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_items_product_id_idx" ON "order_items"("product_id");

-- CreateIndex
CREATE INDEX "order_items_color_id_idx" ON "order_items"("color_id");

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_user_id_key" ON "loyalty"("user_id");

-- CreateIndex
CREATE INDEX "loyalty_deleted_at_idx" ON "loyalty"("deleted_at");

-- CreateIndex
CREATE INDEX "loyalty_transactions_user_id_idx" ON "loyalty_transactions"("user_id");

-- CreateIndex
CREATE INDEX "loyalty_transactions_order_id_idx" ON "loyalty_transactions"("order_id");

-- CreateIndex
CREATE INDEX "loyalty_transactions_reason_created_at_idx" ON "loyalty_transactions"("reason", "created_at");

-- CreateIndex
CREATE INDEX "loyalty_transactions_user_id_created_at_idx" ON "loyalty_transactions"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "product_colors" ADD CONSTRAINT "product_colors_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "product_colors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "product_colors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_color_id_fkey" FOREIGN KEY ("color_id") REFERENCES "product_colors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty" ADD CONSTRAINT "loyalty_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
