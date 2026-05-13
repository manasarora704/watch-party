FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src/

RUN npm run build

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4000

RUN mkdir -p /data

EXPOSE 4000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
