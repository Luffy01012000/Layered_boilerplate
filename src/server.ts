import DotenvFlow from 'dotenv-flow'
DotenvFlow.config()

import logger from '@shared/lib/logger.js'
import config from '@shared/configs/index.js'

import { createServer } from './app.js'

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
