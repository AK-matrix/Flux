import { PrismaClient } from '@prisma/client'

// Initialize Prisma client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

export { prisma }
