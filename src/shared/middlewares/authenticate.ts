import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

import config from '../config/index.js'
import ResponseFormatter from '../utils/responseFormatter.js'

export type AuthenticatedUser = {
  userId: number
  email: string
  role?: string
}

export default function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token =
    req.cookies?.authToken ??
    req.header('authorization')?.replace(/^Bearer\s+/i, '')

  if (!token) {
    return res
      .status(401)
      .json(ResponseFormatter.error('Authentication required', 401))
  }

  try {
    res.locals.user = jwt.verify(token, config.jwt.secret) as AuthenticatedUser
    next()
  } catch {
    return res
      .status(401)
      .json(ResponseFormatter.error('Invalid or expired token', 401))
  }
}
