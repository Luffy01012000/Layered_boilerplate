/**
 * #########################
 * ------V3-----------------
 * #########################
 */
import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import AppError from '@shared/errors/AppError.js'

type ValidationTarget = 'body' | 'params' | 'query'

export function validate<T>(
  schema: z.ZodType<T>,
  target: ValidationTarget = 'body'
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target])

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))

      return next(new AppError('Validation failed', 400, '', true, errors))
    }

    ;(req as any)[target] = result.data

    next()
  }
}

export const validateBody = <T>(schema: z.ZodType<T>) =>
  validate(schema, 'body')

export const validateParams = <T>(schema: z.ZodType<T>) =>
  validate(schema, 'params')

export const validateQuery = <T>(schema: z.ZodType<T>) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query)

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))

      return next(new AppError('Validation failed', 400, '', true, errors))
    }

    ;(req as any).validatedQuery = result.data

    next()
  }
}
