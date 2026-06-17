import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'

import ResponseFormatter from '../utils/responseFormatter.js'

export default function validate<TBody>(schema: ZodType<TBody>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message
      }))

      return res.status(400).json(ResponseFormatter.validationError(errors))
    }

    req.body = result.data
    next()
  }
}
