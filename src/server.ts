import DotenvFlow from 'dotenv-flow'
DotenvFlow.config()

import { createServer } from './app.js'
import logger from '@shared/lib/logger.js'
import config from '@shared/config/index.js'
import { prisma } from '@infra/db/prisma.js'

const port = process.env.PORT || 3001
const server = createServer()
prisma
  .$connect()
  .then(() => {
    logger.info('Connected to the database')
    server.listen(port, () => {
      logger.info(`api running on ${port}`, {
        meta: {
          env: config.node_env,
          Port: port
        }
      })
    })
  })
  .catch((err) => {
    logger.error('Failed to connect to the database:', err)
    process.exit(1)
  })

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason)
})

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})
