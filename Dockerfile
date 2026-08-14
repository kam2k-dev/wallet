# Stage 1: Build the application
FROM node:20-alpine AS builder
WORKDIR /app

ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and build
COPY . .
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine
WORKDIR /app

# Copy built assets and server from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server/db/schema.sql ./server/db/schema.sql

# Install ONLY production dependencies
RUN npm ci --omit=dev

# Expose the port the app runs on
EXPOSE 5000

# Start the server
CMD ["npm", "run", "start"]
