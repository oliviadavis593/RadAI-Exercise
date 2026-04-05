# ── Stage 1: Compile ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN ./node_modules/.bin/tsc

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

# CSV is mounted at runtime via docker-compose volume.
ENV PORT=3001
ENV CSV_PATH=/data/Mobile_Food_Facility_Permit.csv

EXPOSE 3001
CMD ["node", "dist/server.js"]
