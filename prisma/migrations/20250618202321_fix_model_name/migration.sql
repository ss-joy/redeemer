/*
  Warnings:

  - You are about to drop the `CusomerRewards` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "CusomerRewards";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "CustomerRewards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" TEXT NOT NULL,
    "shop_name" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "total_points_earned_ever" INTEGER NOT NULL DEFAULT 0,
    "total_used_points" INTEGER NOT NULL DEFAULT 0,
    "available_points" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
