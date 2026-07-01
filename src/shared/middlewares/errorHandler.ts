import type { NextFunction, Request, Response } from 'express'
import {
  ConnectionError,
  DatabaseError,
  ForeignKeyConstraintError,
  UniqueConstraintError,
  ValidationError
} from 'sequelize'

import logger from '../lib/logger.js'
import AppError from '../errors/AppError.js'
import ResponseFormatter from '../utils/responseFormatter.js'

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (error instanceof UniqueConstraintError) {
    return res
      .status(409)
      .json(ResponseFormatter.error('Resource already exists', 409))
  }

  if (
    error instanceof ValidationError ||
    error instanceof ForeignKeyConstraintError
  ) {
    const details =
      (error as ValidationError).errors?.map((e) => ({
        path: e.path,
        message: e.message
      })) ?? null
    return res
      .status(400)
      .json(ResponseFormatter.error('Validation failed', 400, details))
  }

  if (error instanceof ConnectionError || error instanceof DatabaseError) {
    return res
      .status(503)
      .json(ResponseFormatter.error('Database unavailable', 503))
  }

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
