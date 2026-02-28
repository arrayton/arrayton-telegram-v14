# Telegram Bot — multi-stage, Node 24, grammY + Prisma
# Deploy: Dokploy

# --- Dependencies ---
FROM node:24-alpine AS deps
RUN corepack enable pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/
COPY prisma.config.ts ./
RUN pnpm install --frozen-lockfile

# --- Production ---
FROM node:24-alpine AS runner
RUN corepack enable pnpm && apk add --no-cache dumb-init
ENV NODE_ENV=production
WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S telegram -u 1001 -G nodejs

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/prisma ./prisma
COPY --from=deps /app/prisma.config.ts ./
COPY src ./src
COPY tsconfig.json ./

RUN pnpm prisma generate

USER telegram

ENTRYPOINT ["dumb-init", "--"]
CMD ["pnpm", "exec", "tsx", "src/index.ts"]
