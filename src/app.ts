import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import compression from 'compression'
// import rateLimit from 'express-rate-limit';
import hpp from 'hpp'

import authRouter from './services/auth/routes/authRouter.js'
import fileRouter from './services/file/routes/fileRouter.js'
import mailRouter from './services/mail/routes/mailRouter.js'
import paymentRouter from './services/payment/routes/paymentRouter.js'
import { errorHandler } from './shared/middlewares/errorHandler.js'

export const createServer = () => {
  const app = express()
  app
    .disable('x-powered-by')
    .set('trust proxy', 1)
    .use(morgan('dev'))
    .use(express.urlencoded({ extended: true }))
    .use(express.json())
    .use(cookieParser())
    .use(cors())
    .use(compression())
    .use(hpp())

  app.get('/healthz', (req, res) => {
    return res.json({ ok: true, environment: process.env.NODE_ENV })
  })

  app.get('/message/:name', (req, res) => {
    return res.json({ message: `hello ${req.params.name}` })
  })

  app.use('/api/auth', authRouter)
  app.use('/api/files', fileRouter)
  app.use('/api/mail', mailRouter)
  app.use('/api/payments', paymentRouter)

  app.use(errorHandler)

  return app
}
