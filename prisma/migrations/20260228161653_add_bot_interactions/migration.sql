-- CreateTable
CREATE TABLE "bot_interactions" (
    "id" UUID NOT NULL,
    "channel_id" BIGINT NOT NULL,
    "user_id" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bot_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bot_interactions_channel_id_idx" ON "bot_interactions"("channel_id");

-- CreateIndex
CREATE INDEX "bot_interactions_user_id_idx" ON "bot_interactions"("user_id");

-- AddForeignKey
ALTER TABLE "bot_interactions" ADD CONSTRAINT "bot_interactions_channel_id_fkey" FOREIGN KEY ("channel_id") REFERENCES "channels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bot_interactions" ADD CONSTRAINT "bot_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
