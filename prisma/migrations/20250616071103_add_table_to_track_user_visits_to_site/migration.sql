-- CreateTable
CREATE TABLE "user_page_visits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" TEXT,
    "session_id" TEXT NOT NULL,
    "page_url" TEXT NOT NULL,
    "page_pathname" TEXT NOT NULL,
    "page_type" TEXT NOT NULL,
    "browser_info" TEXT NOT NULL,
    "shop_name" TEXT NOT NULL,
    "shop_id" TEXT NOT NULL,
    "visited_page_title" TEXT NOT NULL,
    "product_id" TEXT,
    "collection_id" TEXT,
    "start_time" DATETIME NOT NULL,
    "end_time" DATETIME,
    "duration" INTEGER DEFAULT 0,
    "device_type" TEXT,
    "referrer" TEXT,
    "ip_address" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "user_page_visits_customer_id_idx" ON "user_page_visits"("customer_id");

-- CreateIndex
CREATE INDEX "user_page_visits_session_id_idx" ON "user_page_visits"("session_id");

-- CreateIndex
CREATE INDEX "user_page_visits_page_type_idx" ON "user_page_visits"("page_type");

-- CreateIndex
CREATE INDEX "user_page_visits_product_id_idx" ON "user_page_visits"("product_id");

-- CreateIndex
CREATE INDEX "user_page_visits_shop_id_idx" ON "user_page_visits"("shop_id");
