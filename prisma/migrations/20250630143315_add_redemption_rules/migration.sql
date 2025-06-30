-- CreateTable
CREATE TABLE "shop_redemption_rules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop_name" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "rule_type" TEXT NOT NULL,
    "rule_name" TEXT NOT NULL,
    "points_required_for_redemption" INTEGER NOT NULL,
    "discount_percentage" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "shop_redemption_rules_shop_id_rule_type_key" ON "shop_redemption_rules"("shop_id", "rule_type");
