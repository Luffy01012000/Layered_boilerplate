import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import compression from 'compression'
// import rateLimit from 'express-rate-limit';
import hpp from 'hpp'
import helmet from 'helmet'

/**
 * =====================================
 *   Middlwares
 * ====================================
 */
import { errorHandler } from '@shared/middlewares/errorHandler.js'
import config from '@shared/configs/index.js'

/**
 * =====================================
 *   Routes
 * ====================================
 */
import { usersRouter } from './services/users/users.routes.js'

export const createServer = () => {
  const app = express()
  app
    .disable('x-powered-by')
    .set('trust proxy', 1)
    .use(morgan(config.node_env !== 'production' ? 'dev' : 'tiny'))
    .use(helmet())
    .use(express.urlencoded({ extended: true }))
    .use(express.json())
    .use(cookieParser())
    .use(cors())
    .use(compression())
    .use(hpp())

  app.get('/health', (_req, res) => {
    return res.status(200).json({ ok: true, status: 'up' })
  })

  app.get('/live', (_req, res) => {
    return res.status(200).json({ ok: true, alive: true })
  })

  app.get('/ready', (_req, res) => {
    return res
      .status(200)
      .json({ ready: true, pg: true, redis: true, rabbitmq: true })
  })

  app.get('/version', (_req, res) => {
    return res.status(200).json({
      ok: true,
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      serivce: 'ems',
      commit: 'git-sha'
    })
  })

  app.use('/api/users', usersRouter)

  app.use(errorHandler)

  return app
}
