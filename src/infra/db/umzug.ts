import { fileURLToPath } from 'node:url'
import path from 'node:path'

import { Umzug, SequelizeStorage } from 'umzug'
import { Sequelize, Options, DataTypes } from 'sequelize'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// import config from '../../shared/configs/index.js'
// const isProd = config.node_env === 'production'
const isProd = false

function createMigrator(sequelize: Sequelize, name: string, tableName: string) {
  const model = sequelize.define(
    tableName,
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        primaryKey: true,
        autoIncrement: false
      }
    },
    {
      schema: 'public',
      modelName: tableName,
      underscored: true,
      charset: 'utf8',
      collate: 'utf8_unicode_ci'
    }
  )

  return new Umzug({
    migrations: {
      glob: isProd
        ? ['*.js', { cwd: path.join(__dirname, name) }]
        : ['*.ts', { cwd: path.join(__dirname, name) }]
    },
    context: sequelize,

    storage: new SequelizeStorage({
      model,
      sequelize
      // tableName: name
    }),
    logger: console
  })
}

const sequelize = new Sequelize(
  'postgresql://neondb_owner:npg_UxQVtK2A3Mij@ep-steep-smoke-ahjocfu3.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
)
export const migrator = createMigrator(
  sequelize,
  'migrations',
  'migrations_meta'
)
export type Migration = typeof migrator._types.migration

export const seeder = createMigrator(sequelize, 'seeds', 'seeders_meta')
export type Seeder = typeof seeder._types.migration
