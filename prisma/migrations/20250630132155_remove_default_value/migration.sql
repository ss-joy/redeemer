-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_reward_points_transaction_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "total_transacted_points" INTEGER NOT NULL DEFAULT 0,
    "rule_type" TEXT NOT NULL,
    "transaction_type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_reward_points_transaction_history" ("created_at", "customer_id", "id", "rule_type", "shop_id", "total_transacted_points", "transaction_type") SELECT "created_at", "customer_id", "id", "rule_type", "shop_id", "total_transacted_points", "transaction_type" FROM "reward_points_transaction_history";
DROP TABLE "reward_points_transaction_history";
ALTER TABLE "new_reward_points_transaction_history" RENAME TO "reward_points_transaction_history";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
