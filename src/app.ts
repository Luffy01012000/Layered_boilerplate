import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import compression from 'compression'
// import rateLimit from 'express-rate-limit';
import hpp from 'hpp'
import helmet from 'helmet'

import authRouter from './services/auth/routes/authRouter.js'
import departmentRouter from './services/department/routes/departmentRouter.js'
import employeeRouter from './services/employee/routes/empRouter.js'
import { errorHandler } from './shared/middlewares/errorHandler.js'
import config from '@shared/config/index.js'

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

  app.get('/health', (req, res) => {
    return res.status(200).json({ ok: true, status: 'up' })
  })

  app.get('/live', (req, res) => {
    return res.status(200).json({ ok: true, alive: true })
  })

  app.get('/ready', (req, res) => {
    return res
      .status(200)
      .json({ ready: true, pg: true, redis: true, rabbitmq: true })
  })

  app.get('/version', (req, res) => {
    return res.status(200).json({
      ok: true,
      environment: process.env.NODE_ENV,
      version: '1.0.0',
      serivce: 'ems',
      commit: 'git-sha'
    })
  })

  app.get('/message/:name', (req, res) => {
    return res.json({ message: `hello ${req.params.name}` })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/department', departmentRouter)
  app.use('/api/employee', employeeRouter)

  app.use(errorHandler)

  return app
}
