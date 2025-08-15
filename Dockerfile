# Stage 1: Install dependencies and build
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies based on the package manager
COPY package*.json ./
RUN npm install

# Copy all source files
COPY . .

# Limit memory usage during Next.js build
ENV NODE_OPTIONS="--max-old-space-size=512"

# Build the app for production
RUN npm run build

# Stage 2: Run the production build
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy the build output and node_modules from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]
