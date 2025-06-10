# Use official Node.js image as the base
FROM node:22-alpine AS base

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# --- Production Image ---
FROM node:22-alpine AS production

# Set NODE_ENV to production
ENV NODE_ENV=production

# Set working directory
WORKDIR /app

# Copy only necessary files from the build stage
COPY --from=base /app/package.json /app/package-lock.json ./
COPY --from=base /app/.next ./.next
COPY --from=base /app/public ./public
COPY --from=base /app/node_modules ./node_modules

# Set environment variables at runtime using a .env file
# (Make sure to mount or pass them properly when deploying)
COPY .env.local .env.local

# Expose port (Next.js default)
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]