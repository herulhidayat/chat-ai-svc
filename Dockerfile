# syntax=docker/dockerfile:1

FROM node:22-slim AS builder
WORKDIR /app

ENV NODE_ENV=development
ARG DATABASE_URL="postgresql://user:pass@localhost:5432/db"
ENV DATABASE_URL=${DATABASE_URL}

COPY package*.json ./
RUN npm ci

COPY nest-cli.json tsconfig*.json prisma.config.ts ./
COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=9876

COPY package*.json ./
COPY --from=builder /app/prisma ./prisma
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/uploads

EXPOSE 9876
CMD ["node", "dist/main.js"]
