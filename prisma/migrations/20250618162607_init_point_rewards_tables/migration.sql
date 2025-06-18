-- CreateTable
CREATE TABLE "ShopRewardRules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop_name" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "rule_type" TEXT NOT NULL,
    "rule_name" TEXT NOT NULL,
    "reward_points" INTEGER NOT NULL DEFAULT 0,
    "total_awarded_points" INTEGER NOT NULL DEFAULT 0,
    "total_awarded_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CusomerRewards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" TEXT NOT NULL,
    "shop_name" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "total_points_earned_ever" INTEGER NOT NULL DEFAULT 0,
    "total_used_points" INTEGER NOT NULL DEFAULT 0,
    "available_points" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "PointsTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" TEXT NOT NULL,
    "shop_name" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "total_transacted_points" INTEGER NOT NULL DEFAULT 0,
    "transaction_type" TEXT NOT NULL,
    "transaction_reason" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
