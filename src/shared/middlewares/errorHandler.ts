import type { NextFunction, Request, Response } from 'express'

import logger from '../lib/logger.js'
import AppError from '../errors/AppError.js'
import ResponseFormatter from '../utils/responseFormatter.js'

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const statusCode = error instanceof AppError ? error.statusCode : 500
  const message =
    error instanceof AppError ? error.message : 'Internal server error'
  const errors = error instanceof AppError ? error.errors : undefined

  logger.error(message, {
    meta: {
      error
    }
  })

  return res
    .status(statusCode)
    .json(ResponseFormatter.error(message, statusCode, errors))
}
