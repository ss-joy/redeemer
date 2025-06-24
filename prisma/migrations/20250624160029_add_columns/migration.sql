-- CreateTable
CREATE TABLE "Coupons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop_id" TEXT NOT NULL,
    "coupon_code" TEXT NOT NULL,
    "coupon_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Coupons_coupon_code_key" ON "Coupons"("coupon_code");

-- CreateIndex
CREATE UNIQUE INDEX "Coupons_coupon_id_key" ON "Coupons"("coupon_id");

-- CreateIndex
CREATE INDEX "Coupons_shop_id_idx" ON "Coupons"("shop_id");
