# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

RUN npx prisma generate
RUN npm run build

# Prune dev deps; keep Prisma CLI for migrate deploy in production
RUN npm prune --production && npm install prisma --no-save

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl wget

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY --from=build /app/src/config/env-paths.ts ./src/config/env-paths.ts
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN chmod +x docker-entrypoint.sh \
  && mkdir -p storage/assets storage/exports src/config

EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "run", "start:prod"]
