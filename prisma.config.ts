import dotenvFlow from 'dotenv-flow'
import { defineConfig, env } from 'prisma/config'

dotenvFlow.config({ node_env: process.env.NODE_ENV ?? 'development' })

export default defineConfig({
  migrations: {
    seed: 'tsx src/infrastructure/db/seeds/index.ts'
  },
  schema: './prisma/schema.prisma',
  datasource: {
    url: env('DATABASE_URL')
  }
})
