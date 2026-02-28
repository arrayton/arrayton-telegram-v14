import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { config } from '@/config/config';

const connectionString = String(config.DATABASE_URL)
  .replace(/^["']|["']$/g, "")
  .trim()
  .replace(/([?&])sslmode=(?:prefer|require|verify-ca)\b/gi, "$1sslmode=verify-full");

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };