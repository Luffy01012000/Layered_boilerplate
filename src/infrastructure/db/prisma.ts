import { PrismaPg } from '@prisma/adapter-pg'
// import { PrismaClient } from '#prismagenerated/prisma/client.js'
import { PrismaClient } from '@prisma/client'
import logger from '@shared/lib/logger.js'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({
  adapter,
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'stdout', level: 'error' },
    { emit: 'stdout', level: 'warn' },
    { emit: 'stdout', level: 'info' }
  ]
})

prisma.$on('query', (e) => {
  logger.info('Query:', {
    meta: {
      Query: e.query
    }
  })
  logger.info('Params:', {
    meta: {
      Params: e.params
    }
  })

  logger.info('Duration:', {
    meta: {
      Duration: e.duration.toFixed(2) + ' ms'
    }
  })
})
export { prisma }
