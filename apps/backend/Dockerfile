# Stage 1: Build
FROM node:22-alpine AS builder

# Instalar dependencias necesarias para compilar en Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Prisma 7 necesita DATABASE_URL al cargar prisma.config.ts durante generate.
# En build alcanza con una URL placeholder; la real se inyecta en runtime.
ENV DATABASE_URL=postgresql://placeholder:placeholder@localhost:5432/placeholder

# Instalar dependencias
COPY package*.json ./
COPY prisma ./prisma/
# Copiamos el config de prisma necesario para el generate en v7
COPY prisma.config.ts ./

RUN npm install

# Copiar el resto del código y compilar
COPY . .
RUN npx prisma generate
RUN npm run build

# Stage 2: Runtime
FROM node:22-alpine

WORKDIR /app

# Variable para forzar logs inmediatos en Node.js
ENV NODE_STDOUT_LOG_LEVEL=info
ENV PYTHONUNBUFFERED=1

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 8080

# Usar node directamente en lugar de npm para capturar mejor los logs y señales de terminal
CMD ["node", "dist/src/server.js"]
