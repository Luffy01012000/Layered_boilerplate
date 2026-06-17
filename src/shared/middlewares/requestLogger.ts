import type { NextFunction, Request, Response } from 'express'

import logger from '../config/logger.js'

export default function requestLogger(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  logger.info('Incoming request', {
    meta: {
      method: req.method,
      path: req.originalUrl
    }
  })

  next()
}
