-- CreateTable
CREATE TABLE "channel_subscribers" (
    "id" BIGINT NOT NULL,
    "username" TEXT,
    "first_name" TEXT,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),

    CONSTRAINT "channel_subscribers_pkey" PRIMARY KEY ("id")
);
