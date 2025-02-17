# Use Node 20
FROM node:20

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (for caching)
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm install --production

# Copy the Prisma schema directory
COPY prisma ./prisma

# Copy the rest of the application files
COPY . .

# Run Prisma generate to create the Prisma client
RUN npx prisma generate --schema=prisma/schema.prisma

# Expose the application port (adjust if needed)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
