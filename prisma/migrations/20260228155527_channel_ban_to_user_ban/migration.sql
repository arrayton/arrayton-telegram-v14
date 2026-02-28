/*
  Warnings:

  - You are about to drop the `channel_bans` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "channel_bans" DROP CONSTRAINT "channel_bans_channel_id_fkey";

-- DropForeignKey
ALTER TABLE "channel_bans" DROP CONSTRAINT "channel_bans_user_id_fkey";

-- DropTable
DROP TABLE "channel_bans";

-- CreateTable
CREATE TABLE "user_bans" (
    "user_id" BIGINT NOT NULL,
    "reason" TEXT,
    "banned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_bans_pkey" PRIMARY KEY ("user_id")
);

-- AddForeignKey
ALTER TABLE "user_bans" ADD CONSTRAINT "user_bans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
