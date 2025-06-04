/*
  Warnings:

  - You are about to drop the column `new_customer_data_recorder_at` on the `new_customers` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_new_customers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customer_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shop_name" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL
);
INSERT INTO "new_new_customers" ("customer_id", "id", "shop_id", "shop_name") SELECT "customer_id", "id", "shop_id", "shop_name" FROM "new_customers";
DROP TABLE "new_customers";
ALTER TABLE "new_new_customers" RENAME TO "new_customers";
CREATE UNIQUE INDEX "new_customers_customer_id_key" ON "new_customers"("customer_id");
CREATE UNIQUE INDEX "new_customers_customer_id_shop_name_key" ON "new_customers"("customer_id", "shop_name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
