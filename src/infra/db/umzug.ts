import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { Umzug, SequelizeStorage } from 'umzug'

import { sequelize } from './sequelize.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const umzug = new Umzug({
  migrations: {
    glob: path.join(__dirname, 'migrations', '*.js'),
    resolve: ({ name, path: migrationPath, context }) => {
      const migration = require(migrationPath!)
      return {
        name,
        up: async () => migration.up(context),
        down: async () => migration.down(context)
      }
    }
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize, tableName: 'sequelize_meta' }),
  logger: undefined
})

export const runMigrations = () => umzug.up()
export const revertLastMigration = () => umzug.down()
