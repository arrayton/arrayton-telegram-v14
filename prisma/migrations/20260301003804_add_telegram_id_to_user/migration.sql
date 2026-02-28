-- Add telegram_id column (nullable first for backfill)
ALTER TABLE "users" ADD COLUMN "telegram_id" BIGINT;

-- Backfill: copy id to telegram_id for existing rows
UPDATE "users" SET "telegram_id" = "id";

-- Make NOT NULL and add UNIQUE
ALTER TABLE "users" ALTER COLUMN "telegram_id" SET NOT NULL;
CREATE UNIQUE INDEX "users_telegram_id_key" ON "users"("telegram_id");
