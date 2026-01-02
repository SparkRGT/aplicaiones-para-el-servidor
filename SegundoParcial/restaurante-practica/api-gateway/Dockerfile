# Dockerfile para API Gateway
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY tsconfig.json ./

# Instalar dependencias
RUN npm install

# Copiar código fuente
COPY src ./src

# Compilar TypeScript
RUN npm run build

# Etapa de producción
FROM node:18-alpine

# Instalar wget para health checks
RUN apk add --no-cache wget

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --only=production

# Copiar código compilado desde builder
COPY --from=builder /app/dist ./dist

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Comando para iniciar
CMD ["node", "dist/index.js"]

