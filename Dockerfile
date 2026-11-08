# syntax=docker/dockerfile:1

# ---- base : runtime commun (docker-cli requis par le terminal des labs : `docker exec`) ----
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat docker-cli
WORKDIR /app

# ---- deps : dépendances (outils de compilation pour node-pty, uniquement dans ce stage) ----
FROM base AS deps
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci

# ---- dev : utilisé par docker-compose.yml (code monté en volume, rechargement à chaud) ----
FROM deps AS dev
ENV NODE_ENV=development
COPY . .
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---- builder : build Next.js de production ----
# `npm prune` efface le client Prisma généré : on le régénère après (prisma est en dependencies).
FROM deps AS builder
ENV NODE_ENV=production
COPY . .
RUN npx prisma generate \
 && npm run build \
 && npm prune --omit=dev \
 && npx prisma generate

# ---- runner : image de production (sans outils de compilation ni devDependencies) ----
FROM base AS runner
ENV NODE_ENV=production \
    PORT=3000
COPY --from=builder /app/package.json /app/tsconfig.json /app/next.config.ts /app/prisma.config.ts /app/server.ts ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/content ./content
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src
EXPOSE 3000
CMD ["npm", "run", "start"]
