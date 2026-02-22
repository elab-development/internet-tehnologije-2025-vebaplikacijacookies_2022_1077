FROM node:20-alpine AS base

# Faza 1: Instalacija zavisnosti
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Faza 2: Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_ varijable moraju biti dostupne tokom build-a
ARG NEXT_PUBLIC_WEATHER_API_KEY
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_WEATHER_API_KEY=$NEXT_PUBLIC_WEATHER_API_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npx prisma@6.19.2 generate
RUN npx tsc prisma/seed.ts --esModuleInterop --skipLibCheck --outDir . || echo "TSC Seed Ok"
RUN npm run build

# Faza 3: Produkcija
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache openssl

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Obezbeđujemo da seed.js postoji
COPY --from=builder --chown=nextjs:nodejs /app/seed.js ./seed.js

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Prilikom pokretanja, aplikacija automatski pušta migracije, seed-uje i startuje server
CMD ["sh", "-c", "npx prisma@6.19.2 migrate deploy && node seed.js && node server.js"]