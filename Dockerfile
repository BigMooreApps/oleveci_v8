# Dockerfile for OleVeci v8 Production Deployment
FROM node:20-slim

WORKDIR /app

# Install build & runtime dependencies
COPY package*.json ./
RUN npm ci

# Copy full application source code
COPY . .

# Build Vite client and Express server bundle
RUN npm run build

# Configure runtime environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start production server
CMD ["node", "dist/server.cjs"]
