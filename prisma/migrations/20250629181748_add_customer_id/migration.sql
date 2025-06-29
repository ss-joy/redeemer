-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Coupons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop_id" TEXT NOT NULL,
    "coupon_code" TEXT NOT NULL,
    "coupon_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "customer_id" TEXT NOT NULL DEFAULT '9079883923746'
);
INSERT INTO "new_Coupons" ("coupon_code", "coupon_id", "created_at", "id", "shop_id", "updated_at") SELECT "coupon_code", "coupon_id", "created_at", "id", "shop_id", "updated_at" FROM "Coupons";
DROP TABLE "Coupons";
ALTER TABLE "new_Coupons" RENAME TO "Coupons";
CREATE UNIQUE INDEX "Coupons_coupon_code_key" ON "Coupons"("coupon_code");
CREATE UNIQUE INDEX "Coupons_coupon_id_key" ON "Coupons"("coupon_id");
CREATE INDEX "Coupons_shop_id_idx" ON "Coupons"("shop_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
