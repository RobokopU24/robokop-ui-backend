FROM node:22

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .
RUN npx prisma generate --schema=./prisma/schema.prisma

RUN npm run build

ENV PORT=4000
EXPOSE 4000

CMD ["node", "dist/server.js"]