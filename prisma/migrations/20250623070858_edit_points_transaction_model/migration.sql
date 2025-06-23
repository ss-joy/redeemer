/*
  Warnings:

  - You are about to drop the column `shop_name` on the `PointsTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_reason` on the `PointsTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `transaction_type` on the `PointsTransaction` table. All the data in the column will be lost.
  - Added the required column `rule_type` to the `PointsTransaction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PointsTransaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "total_transacted_points" INTEGER NOT NULL DEFAULT 0,
    "rule_type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_PointsTransaction" ("created_at", "customer_id", "id", "shop_id", "total_transacted_points") SELECT "created_at", "customer_id", "id", "shop_id", "total_transacted_points" FROM "PointsTransaction";
DROP TABLE "PointsTransaction";
ALTER TABLE "new_PointsTransaction" RENAME TO "PointsTransaction";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
