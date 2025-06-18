/*
  Warnings:

  - A unique constraint covering the columns `[customer_id,shop_name,shop_id]` on the table `CustomerRewards` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "CustomerRewards_customer_id_shop_name_shop_id_key" ON "CustomerRewards"("customer_id", "shop_name", "shop_id");
