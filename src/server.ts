import DotenvFlow from 'dotenv-flow'
DotenvFlow.config()

import { createServer } from './app.js'
import logger from '#shared/config/logger.js'
import config from '#shared/config/index.js'

const port = process.env.PORT || 3001
const server = createServer()

server.listen(port, () => {
  logger.info(`api running on ${port}`, {
    meta: {
      env: config.node_env,
      Port: port
    }
  })
})

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason)
})

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})

process.on('SIGTERM', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})
