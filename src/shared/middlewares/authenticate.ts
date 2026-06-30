import type { NextFunction, Request, Response } from 'express'
import { jwtService } from '@shared/lib/jwt/index.js'

import ResponseFormatter from '../utils/responseFormatter.js'

export type AuthenticatedUser = {
  userId: number
  email: string
  roleId?: string
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

  res.locals.user = jwtService.verifyAccessToken(token)
  next()
}
