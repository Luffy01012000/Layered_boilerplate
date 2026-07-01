import DotenvFlow from 'dotenv-flow'
DotenvFlow.config()

import logger from '@shared/lib/logger.js'
import config from '@shared/configs/index.js'
import { sequelize } from '@infra/db/sequelize.js'
import { runMigrations } from '@infra/db/umzug.js'
import '@infra/db/models/index.js'

import { createServer } from './app.js'

const port = process.env.PORT || 3001

const start = async () => {
  try {
    await runMigrations()
    await sequelize.authenticate()
    logger.info('database ready', {
      meta: { env: config.node_env }
    })

    const server = createServer()

    server.listen(port, () => {
      logger.info(`api running on ${port}`, {
        meta: {
          env: config.node_env,
          Port: port
        }
      })
    })
  } catch (err) {
    logger.error('startup failed', { meta: { err } })
    process.exit(1)
  }
}

start()

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason)
})

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error)
  process.exit(1)
})
