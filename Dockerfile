# Telegram Bot — multi-stage, Node 24, grammY + Prisma
# Deploy: Dokploy

# --- Build ---
FROM node:24-alpine AS builder
RUN corepack enable pnpm && apk add --no-cache wget
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm prisma generate

# --- Production ---
FROM node:24-alpine AS runner
RUN apk add --no-cache dumb-init wget
ENV NODE_ENV=production
WORKDIR /app

# Create a non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S telegram -u 1001 -G nodejs

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
COPY --from=builder /app/tsconfig.json ./

# Ensure permissions
RUN chown -R telegram:nodejs /app

USER telegram

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD pgrep -f "tsx src/index.ts" || exit 1

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "--loader", "tsx", "src/index.ts"]
