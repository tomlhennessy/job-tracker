# Use Node 20 as the base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (to leverage Docker caching)
COPY package.json package-lock.json ./

# Ensure Prisma schema is copied **before** npm install
COPY prisma ./prisma

# Remove any pre-existing node_modules (avoid cross-OS issues)
RUN rm -rf node_modules

# Install **all** dependencies (including dev dependencies, needed for ESLint)
RUN npm install

# Copy the rest of the app
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=prisma/schema.prisma

# Ensure ESLint is installed (to prevent Next.js build failure)
RUN npm install --save-dev eslint @types/ioredis

# Build the Next.js application
RUN npm run build

# Expose port 8080
EXPOSE 8080

# Start the Next.js app
CMD ["npm", "start"]
