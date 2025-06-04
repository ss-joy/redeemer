/*
  Warnings:

  - You are about to alter the column `customer_id` on the `new_customers` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_new_customers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customer_id" INTEGER NOT NULL,
    "new_customer_data_recorder_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shop_name" TEXT NOT NULL,
    "shop_id" INTEGER NOT NULL
);
INSERT INTO "new_new_customers" ("customer_id", "id", "new_customer_data_recorder_at", "shop_id", "shop_name") SELECT "customer_id", "id", "new_customer_data_recorder_at", "shop_id", "shop_name" FROM "new_customers";
DROP TABLE "new_customers";
ALTER TABLE "new_new_customers" RENAME TO "new_customers";
CREATE UNIQUE INDEX "new_customers_customer_id_key" ON "new_customers"("customer_id");
CREATE UNIQUE INDEX "new_customers_customer_id_shop_name_key" ON "new_customers"("customer_id", "shop_name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
