import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '#prismagenerated/prisma/client.js'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export { prisma }
