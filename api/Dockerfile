FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev --no-optional && \
    find ./node_modules -name "*.md" -delete 2>/dev/null; \
    find ./node_modules -name "*.map" -delete 2>/dev/null; \
    find ./node_modules -name "CHANGELOG*" -delete 2>/dev/null; \
    find ./node_modules -name "LICENSE*" -delete 2>/dev/null; \
    find ./node_modules -name "HISTORY*" -delete 2>/dev/null; \
    find ./node_modules -name "AUTHORS*" -delete 2>/dev/null; \
    find ./node_modules -name "*.ts" ! -name "*.d.ts" -delete 2>/dev/null; \
    find ./node_modules -name "test" -type d -exec rm -rf {} + 2>/dev/null; \
    find ./node_modules -name "__tests__" -type d -exec rm -rf {} + 2>/dev/null; \
    true

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV API_PORT=3000
ENV LOG_LEVEL=info
ENV DATABASE_URL=""

COPY --from=deps /app/node_modules ./node_modules
COPY src ./src

USER node

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD wget -qO- http://127.0.0.1:3000/health || exit 1

CMD ["node", "src/server.js"]