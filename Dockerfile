# Nymbus website: Next.js standalone server + in-process data pipeline.
# Northflank: build from this Dockerfile, expose port 3000 (health check GET /api/health),
# mount a persistent volume at /data. See docs/deploy.md.

FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --no-audit --no-fund; else npm install --no-audit --no-fund; fi

FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm test && npm run build

FROM node:22-bookworm-slim AS run
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    SITE_DATA_DIR=/data
RUN groupadd --system --gid 1001 nymbus && useradd --system --uid 1001 --gid nymbus nymbus \
 && mkdir -p /data && chown nymbus:nymbus /data
COPY --from=build --chown=nymbus:nymbus /app/.next/standalone ./
COPY --from=build --chown=nymbus:nymbus /app/.next/static ./.next/static
COPY --from=build --chown=nymbus:nymbus /app/public ./public
# the pipeline CLI (npm run pipeline) runs from source with Node type stripping
COPY --from=build --chown=nymbus:nymbus /app/src/lib/pipeline ./src/lib/pipeline
COPY --from=build --chown=nymbus:nymbus /app/src/lib/data ./src/lib/data
COPY --from=build --chown=nymbus:nymbus /app/src/config ./src/config
COPY --chown=root:root docker/start.mjs ./start.mjs
# starts as root only to give the mounted volume to `nymbus`, then drops to uid/gid 1001 (docker/start.mjs)
EXPOSE 3000
VOLUME ["/data"]
CMD ["node", "start.mjs"]
