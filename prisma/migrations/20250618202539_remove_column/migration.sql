/*
  Warnings:

  - You are about to drop the column `total_points_earned_ever` on the `CustomerRewards` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CustomerRewards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" TEXT NOT NULL,
    "shop_name" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "total_used_points" INTEGER NOT NULL DEFAULT 0,
    "available_points" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_CustomerRewards" ("available_points", "created_at", "customer_id", "id", "shop_id", "shop_name", "total_used_points") SELECT "available_points", "created_at", "customer_id", "id", "shop_id", "shop_name", "total_used_points" FROM "CustomerRewards";
DROP TABLE "CustomerRewards";
ALTER TABLE "new_CustomerRewards" RENAME TO "CustomerRewards";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
