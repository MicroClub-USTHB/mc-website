# Production image for self-hosting (Dokploy), based on the official Next.js with-docker example:
# https://github.com/vercel/next.js/tree/canary/examples/with-docker
# `output: "standalone"` in next.config.ts makes `next build` trace the files the server needs into
# .next/standalone, so the runner ships without node_modules or the source.

# Keep on the current Node.js LTS (package.json requires >=24).
ARG NODE_VERSION=24-alpine

FROM node:${NODE_VERSION} AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

# Every dependency, devDependencies included: the build needs TypeScript, Tailwind's PostCSS plugin
# and the React Compiler. Do not set NODE_ENV=production here, pnpm would skip them.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    corepack enable pnpm && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
# Placeholders, as in CI: the build imports the auth config, which needs them but connects to
# nothing. Scoped to this command; the real values reach the container at run time.
RUN corepack enable pnpm && \
    MONGODB_URI=mongodb://localhost:27017/microclub \
    BETTER_AUTH_SECRET=build-placeholder-secret-not-used-to-sign-anything \
    BETTER_AUTH_URL=http://localhost:3000 \
    pnpm build

FROM base AS runner
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder --chown=node:node /app/public ./public
# Writable by the server for the ISR and image caches.
RUN mkdir .next && chown node:node .next
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node
EXPOSE 3000
CMD ["node", "server.js"]
