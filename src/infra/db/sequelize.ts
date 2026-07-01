import { Sequelize } from 'sequelize'
import config from '@shared/configs/index.js'

export const sequelize = new Sequelize(config.postgres.database_url, {
  dialect: 'postgres',
  pool: config.postgres.pool,
  logging: false,
  dialectOptions: config.postgres.ssl
    ? { ssl: { require: true, rejectUnauthorized: false } }
    : undefined
})
