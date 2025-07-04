-- CreateEnum
CREATE TYPE "RuleType" AS ENUM ('STORE_VISIT', 'NEW_CUSTOMER', 'PRODUCT_PURCHASE');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('EARN', 'REDEEM');

-- CreateEnum
CREATE TYPE "RedemptionRuleType" AS ENUM ('ORDER_DISCOUNT');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" TIMESTAMP(3),
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "new_customers" (
    "id" SERIAL NOT NULL,
    "customer_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shop_name" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,

    CONSTRAINT "new_customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_page_visits" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT,
    "session_id" TEXT NOT NULL,
    "page_url" TEXT NOT NULL,
    "page_pathname" TEXT NOT NULL,
    "page_type" TEXT NOT NULL,
    "browser_info" TEXT NOT NULL,
    "shop_name" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "visited_page_title" TEXT NOT NULL,
    "product_id" TEXT,
    "collection_id" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3),
    "duration" INTEGER DEFAULT 0,
    "device_type" TEXT,
    "referrer" TEXT,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_page_visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopRewardRules" (
    "id" TEXT NOT NULL,
    "shop_name" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "rule_type" "RuleType" NOT NULL,
    "rule_name" TEXT NOT NULL,
    "reward_points" INTEGER NOT NULL DEFAULT 0,
    "total_awarded_points" INTEGER NOT NULL DEFAULT 0,
    "total_awarded_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShopRewardRules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RewardedCustomrList" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "shop_name" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "total_used_points" INTEGER NOT NULL DEFAULT 0,
    "available_points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RewardedCustomrList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reward_points_transaction_history" (
    "id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "total_transacted_points" INTEGER NOT NULL DEFAULT 0,
    "rule_type" "RuleType" NOT NULL,
    "transaction_type" "TransactionType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reward_points_transaction_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupons" (
    "id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "coupon_code" TEXT NOT NULL,
    "coupon_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "customer_id" TEXT NOT NULL,

    CONSTRAINT "Coupons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shop_redemption_rules" (
    "id" TEXT NOT NULL,
    "shop_name" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "rule_type" "RedemptionRuleType" NOT NULL,
    "rule_name" TEXT NOT NULL,
    "points_required_for_redemption" INTEGER NOT NULL,
    "discount_percentage" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shop_redemption_rules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "new_customers_customer_id_key" ON "new_customers"("customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "new_customers_customer_id_shop_name_key" ON "new_customers"("customer_id", "shop_name");

-- CreateIndex
CREATE INDEX "user_page_visits_customer_id_idx" ON "user_page_visits"("customer_id");

-- CreateIndex
CREATE INDEX "user_page_visits_session_id_idx" ON "user_page_visits"("session_id");

-- CreateIndex
CREATE INDEX "user_page_visits_page_type_idx" ON "user_page_visits"("page_type");

-- CreateIndex
CREATE INDEX "user_page_visits_product_id_idx" ON "user_page_visits"("product_id");

-- CreateIndex
CREATE INDEX "user_page_visits_shop_id_idx" ON "user_page_visits"("shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "ShopRewardRules_shop_id_rule_type_key" ON "ShopRewardRules"("shop_id", "rule_type");

-- CreateIndex
CREATE UNIQUE INDEX "RewardedCustomrList_customer_id_shop_id_key" ON "RewardedCustomrList"("customer_id", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "Coupons_coupon_code_key" ON "Coupons"("coupon_code");

-- CreateIndex
CREATE UNIQUE INDEX "Coupons_coupon_id_key" ON "Coupons"("coupon_id");

-- CreateIndex
CREATE INDEX "Coupons_shop_id_idx" ON "Coupons"("shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "shop_redemption_rules_shop_id_rule_type_key" ON "shop_redemption_rules"("shop_id", "rule_type");
