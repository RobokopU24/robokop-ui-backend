# FROM node:22

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .
# RUN npx prisma generate --schema=./prisma/schema.prisma

# RUN npm run build

# ENV PORT=4000
# EXPOSE 4000

# CMD ["node", "dist/server.js"]


# Builder stage
FROM node:22 AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY  prisma ./prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

COPY . .
RUN npm run build

# Production stage
FROM node:22-slim
WORKDIR /app

RUN apt-get update \
    && apt-get install -y openssl libssl1.1 \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "dist/server.js"]