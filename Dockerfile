# ---- BUILD STAGE ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy and install deps
COPY package*.json ./
RUN npm ci

# Copy everything else
COPY . .

# Generate Prisma client and build
RUN npx prisma generate
RUN npm run build

# ---- RUN STAGE ----
FROM node:20-alpine

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app ./

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
