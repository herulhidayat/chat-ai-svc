# syntax=docker/dockerfile:1

FROM node:22-slim AS builder
WORKDIR /app

ENV NODE_ENV=development
ENV PRISMA_CLIENT_OUTPUT=./generated/prisma
ARG DATABASE_URL=postgresql://user:pass@localhost:5432/db

COPY package*.json ./
RUN npm ci

COPY nest-cli.json tsconfig*.json prisma.config.ts ./
COPY prisma ./prisma
RUN DATABASE_URL=${DATABASE_URL} npx prisma generate

COPY src ./src
RUN npm run build

FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=9876
ENV PRISMA_CLIENT_OUTPUT=./generated/prisma

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/uploads

EXPOSE 9876
CMD ["node", "dist/src/main.js"]
