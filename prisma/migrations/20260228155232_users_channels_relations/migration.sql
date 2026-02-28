/*
  Warnings:

  - The primary key for the `channel_subscribers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `chat_id` on the `channel_subscribers` table. All the data in the column will be lost.
  - You are about to drop the column `first_name` on the `channel_subscribers` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `channel_subscribers` table. All the data in the column will be lost.
  - Added the required column `channel_id` to the `channel_subscribers` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "channel_subscribers_chat_id_idx";

-- AlterTable
ALTER TABLE "channel_subscribers" DROP CONSTRAINT "channel_subscribers_pkey",
DROP COLUMN "chat_id",
DROP COLUMN "first_name",
DROP COLUMN "username",
ADD COLUMN     "channel_id" BIGINT NOT NULL,
ADD CONSTRAINT "channel_subscribers_pkey" PRIMARY KEY ("channel_id", "user_id");

-- CreateTable
CREATE TABLE "users" (
    "id" BIGINT NOT NULL,
    "username" TEXT,
    "first_name" TEXT,
    "last_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channels" (
    "id" BIGINT NOT NULL,
    "title" TEXT,
    "username" TEXT,
    "type" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "channel_subscribers_channel_id_idx" ON "channel_subscribers"("channel_id");

-- AddForeignKey
ALTER TABLE "channel_subscribers" ADD CONSTRAINT "channel_subscribers_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "channel_subscribers" ADD CONSTRAINT "channel_subscribers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
