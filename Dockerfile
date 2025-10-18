FROM node:18-alpine

WORKDIR /app

# Install dependencies for building and Prisma
RUN apk add --no-cache libc6-compat openssl

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "dev"]
