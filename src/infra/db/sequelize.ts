import 'reflect-metadata'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { Sequelize } from 'sequelize-typescript'
import { Options } from 'sequelize'
import config from '@config/index.js'
import logger from '@shared/lib/logger.js'

import User from './models/user.model.js'
import Post from './models/post.model.js'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const sequelize = new Sequelize(config.db.DATABASE_URL, {
  dialect: 'postgres',
  models: [User, Post],

  // replication: {
  //   write: {
  //     host: config.db.write.hostname,/
  //     port: Number(config.db.write.port),
  //     username: config.db.write.username,
  //     password: config.db.write.password),
  //     database: config.db.write.database,
  //   },

  //   read: [
  //     {
  // host: config.db.read.host,
  // port: config.db.read.port,
  // username: config.db.read.user,
  // password: config.db.read.password,
  // database: config.db.read.database,
  //     }

  //     // optional second replica
  //     // {
  //     //   url: env.DB_READ_URL_2,
  //     // },
  //   ]
  // },

  pool: {
    max: config.db.POOL_MAX,
    min: config.db.POOL_MIN,
    idle: config.db.POOL_IDLE,
    acquire: config.db.POOL_ACQUIRE,
    evict: config.db.POOL_EVICT
  },

  logging: false
} as Options)

export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate()
    await sequelize.sync({ alter: config.node_env === 'development' })
    logger.info('Database Connected!')
  } catch (err) {
    logger.error('DB connection failed:', {
      meta: {
        error: err
      }
    })
    process.exit(1)
  }
}

export const disConnectDB = async (): Promise<void> => {
  try {
    await sequelize.close()
    logger.info('Connection closed successfully.')
  } catch (err) {
    logger.error('DB connection failed:', {
      meta: {
        error: err
      }
    })
    process.exit(1)
  }
}
