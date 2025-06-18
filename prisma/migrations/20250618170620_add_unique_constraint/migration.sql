/*
  Warnings:

  - A unique constraint covering the columns `[shop_name,shop_id,rule_type]` on the table `ShopRewardRules` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ShopRewardRules_shop_name_shop_id_rule_type_key" ON "ShopRewardRules"("shop_name", "shop_id", "rule_type");
