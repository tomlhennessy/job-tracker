# Use Node 20 (since your Next.js project uses it)
FROM node:20

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (to leverage caching)
COPY package.json package-lock.json ./

# ✅ Copy the entire `prisma/` directory explicitly
COPY prisma ./prisma

# Install dependencies
RUN npm install --production

# ✅ Copy the rest of the app (excluding node_modules)
COPY . .

# ✅ Run Prisma generate inside Docker
RUN npx prisma generate --schema=prisma/schema.prisma

# Expose the application port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
