/*
  Warnings:

  - The primary key for the `channel_subscribers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `channel_subscribers` table. All the data in the column will be lost.
  - Added the required column `chat_id` to the `channel_subscribers` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `channel_subscribers` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "channel_subscribers" DROP CONSTRAINT "channel_subscribers_pkey",
DROP COLUMN "id",
ADD COLUMN     "chat_id" BIGINT NOT NULL,
ADD COLUMN     "user_id" BIGINT NOT NULL,
ADD CONSTRAINT "channel_subscribers_pkey" PRIMARY KEY ("chat_id", "user_id");

-- CreateIndex
CREATE INDEX "channel_subscribers_chat_id_idx" ON "channel_subscribers"("chat_id");

-- CreateIndex
CREATE INDEX "channel_subscribers_user_id_idx" ON "channel_subscribers"("user_id");
