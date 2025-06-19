/*
  Warnings:

  - A unique constraint covering the columns `[customer_id,shop_id]` on the table `CustomerRewards` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[shop_id,rule_type]` on the table `ShopRewardRules` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "CustomerRewards_customer_id_shop_name_shop_id_key";

-- DropIndex
DROP INDEX "ShopRewardRules_shop_name_shop_id_rule_type_key";

-- CreateIndex
CREATE UNIQUE INDEX "CustomerRewards_customer_id_shop_id_key" ON "CustomerRewards"("customer_id", "shop_id");

-- CreateIndex
CREATE UNIQUE INDEX "ShopRewardRules_shop_id_rule_type_key" ON "ShopRewardRules"("shop_id", "rule_type");
