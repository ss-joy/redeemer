/*
  Warnings:

  - You are about to drop the `PointsTransaction` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "PointsTransaction";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "PointsTransactionHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "total_transacted_points" INTEGER NOT NULL DEFAULT 0,
    "rule_type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
