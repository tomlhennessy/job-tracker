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

# Install production dependencies inside Docker
RUN npm install --omit=dev

# Copy the rest of the app (excluding node_modules)
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=prisma/schema.prisma

# Build the Next.js application
RUN npm run build

# Expose port 8080
EXPOSE 8080

# Start the Next.js app
CMD ["npm", "start"]
