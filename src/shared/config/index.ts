import dotenvFlow from 'dotenv-flow'
import type { StringValue } from 'ms'
dotenvFlow.config()

function required(name: string): string {
  const value = process.env[name]

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }

  return value
}

export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test'
}

const config = {
  node_env: (process.env.NODE_ENV as Environment) ?? Environment.DEVELOPMENT,

  port: Number(process.env.PORT ?? 5000),

  postgres: {
    database_url: required('DATABASE_URL')
  },

  //   rabbitmq: {
  //     url: required('RABBITMQ_URL'),
  //     queue: process.env.RABBITMQ_QUEUE ?? 'api_hits',
  //     publisherConfirms: process.env.RABBITMQ_PUBLISHER_CONFIRMS === 'true',
  //     retryAttempts: Number(process.env.RABBITMQ_RETRY_ATTEMPTS ?? 3),
  //     retryDelay: Number(process.env.RABBITMQ_RETRY_DELAY ?? 1000)
  //   },

  jwt: {
    secret: required('JWT_SECRET'),
    accessSecret: required('JWT_ACCESS_SECRET'),
    refreshSecret: required('JWT_REFRESH_SECRET'),
    accessExpiresIn:
      (process.env.JWT_ACCESS_EXPIRES_IN! as StringValue) ??
      ('15m' as StringValue),
    refreshExpiresIn:
      (process.env.JWT_REFRESH_EXPIRES_IN! as StringValue) ??
      ('7d' as StringValue)
  },

  mail: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM ?? 'noreply@example.com'
  }
} as const

export default config
