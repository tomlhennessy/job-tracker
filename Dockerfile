# Use Node 20 as the base image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first (to leverage Docker caching)
COPY package.json package-lock.json ./

# Ensure Prisma schema is copied **before** npm install
COPY prisma ./prisma

# Install only production dependencies (omit dev dependencies)
RUN npm install --omit=dev

# Explicitly install Webpack (otherwise, it’s missing during the build)
RUN npm install --save-dev webpack

# Copy the rest of the app
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=prisma/schema.prisma

# Build the Next.js application
RUN npm run build

# Expose port 8080
EXPOSE 8080

# Start the Next.js app
CMD ["npm", "start"]
