import "dotenv/config";
import { defineConfig } from "prisma/config";

// Get DATABASE_URL or use dummy URL for generation (when DATABASE_URL is not needed)
// For Prisma client generation, we don't need a real database connection
// Use process.env directly to avoid errors when DATABASE_URL is not set during build
let databaseUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

// Remove quotes if present (Windows .env files sometimes add quotes)
databaseUrl = databaseUrl.replace(/^["']|["']$/g, "").trim();

// Remove schema parameter from URL (not a standard PostgreSQL parameter)
// Prisma uses @@map in models to specify schema, not connection string parameter
databaseUrl = databaseUrl.replace(/[?&]schema=[^&]*/g, "");

// Fix pg SSL warning: prefer/require/verify-ca → verify-full
databaseUrl = databaseUrl.replace(/([?&])sslmode=(?:prefer|require|verify-ca)\b/gi, "$1sslmode=verify-full");

// Ensure URL format is correct
if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
  throw new Error("DATABASE_URL must start with postgresql:// or postgres://");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
