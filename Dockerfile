# ──────────────────────────────────────────────────────────────────────────────
# SkillPath Academy — Production Dockerfile
#
# Multi-stage build:
#   deps     → install production + dev dependencies
#   builder  → compile Next.js (standalone output)
#   runner   → minimal runtime image (~node:20-alpine + Next.js output)
#
# Build:
#   docker build -t skillpath-academy .
#
# Run:
#   docker run -p 3000:3000 --env-file .env.production skillpath-academy
#
# Required env vars at runtime — see .env.example for full list:
#   DATABASE_URL, DIRECT_URL, NEXTAUTH_URL, NEXTAUTH_SECRET,
#   NEXT_PUBLIC_APP_URL, GEMINI_API_KEY (if AI features are used)
# ──────────────────────────────────────────────────────────────────────────────

ARG NODE_VERSION=20

# ── Stage 1: dependency installation ─────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS deps

# Install build tools needed by native Node modules (e.g. prisma, bcrypt)
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copy lockfiles and manifests first for better layer caching
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install all deps (including devDependencies needed by the build step)
RUN npm ci --ignore-scripts

# Generate Prisma client targeting the Alpine/linux-musl runtime
RUN npx prisma generate

# ── Stage 2: Next.js build ────────────────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Reuse node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma/
COPY . .

# Build-time env vars (NOT secrets — these are baked into the JS bundle)
# Override at build time with: docker build --build-arg NEXT_PUBLIC_APP_URL=...
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ARG NEXT_PUBLIC_ENABLE_DEMO_MODE=false
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_ENABLE_DEMO_MODE=${NEXT_PUBLIC_ENABLE_DEMO_MODE}

# Provide stub values for server-only vars required by `validateEnv()` at
# *build time*.  Real secrets are injected at *runtime* via --env-file.
# These stubs are never used in the production runtime image.
ENV DATABASE_URL=postgresql://build-stub:stub@localhost:5432/stub
ENV DIRECT_URL=postgresql://build-stub:stub@localhost:5432/stub
ENV NEXTAUTH_URL=http://localhost:3000
ENV NEXTAUTH_SECRET=build-time-stub-not-used-at-runtime-32chars
ENV DEMO_USER_EMAIL=build-stub@example.com
ENV DEMO_USER_PASSWORD=build-stub

# Disable Next.js telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Produce a standalone Next.js output (smaller runtime image, no node_modules needed)
# Add to next.config.mjs:  output: "standalone"
RUN npm run build

# ── Stage 3: minimal runtime image ───────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS runner

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Security: run as non-root
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Copy only what the standalone server needs
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma client into the runtime image
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Copy the env check script so `prestart` can run it
COPY --chown=nextjs:nodejs scripts/check-env.mjs ./scripts/check-env.mjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

USER nextjs

EXPOSE 3000

# Run the env check before starting the server.
# Fails fast with a clear message if required vars are missing.
CMD ["sh", "-c", "node scripts/check-env.mjs && node server.js"]
