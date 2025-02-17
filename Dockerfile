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

# ✅ Build the Next.js project for production
RUN npm run build

# ✅ Expose the correct port for Elastic Beanstalk (AWS expects 8080)
EXPOSE 8080

# ✅ Start the Next.js production server on port 8080
CMD ["npm", "start", "-p", "8080"]
