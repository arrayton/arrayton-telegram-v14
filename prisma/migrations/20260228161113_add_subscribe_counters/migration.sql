-- AlterTable
ALTER TABLE "channel_subscribers" ADD COLUMN     "subscribe_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "unsubscribe_count" INTEGER NOT NULL DEFAULT 0;
