# ============================================================
# Stage 1: Dependencies
# ============================================================
FROM node:22-alpine AS deps

WORKDIR /app

RUN apk add --no-cache libc6-compat

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# ============================================================
# Stage 2: Builder
# ============================================================
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js application
# NEXT_PUBLIC_API_URL will be injected at build time via --build-arg
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN yarn build

# ============================================================
# Stage 3: Production Runner
# ============================================================
FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public

# Set correct permissions for nextjs user
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy standalone output (requires `output: 'standalone'` in next.config.ts)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
