# Stage 1: Build
FROM node:20-bullseye AS builder

WORKDIR /app

COPY package*.json ./

# Clean install to resolve correct linux-x64 native bindings for @tailwindcss/oxide
RUN rm -f package-lock.json && \
    npm install

COPY . .

RUN npm run build


# Stage 2: Run
FROM node:20-bullseye-slim

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/dist-server ./dist-server

EXPOSE 3000

CMD ["node", "dist-server/server.js"]