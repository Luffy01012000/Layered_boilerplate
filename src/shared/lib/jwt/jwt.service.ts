// shared/lib/jwt/jwt.service.ts
import { type StringValue } from 'ms'
import jwt from 'jsonwebtoken'

import AppError from '@shared/errors/AppError.js'

import type { AccessTokenPayload, RefreshTokenPayload } from './jwt.types.js'

export class JwtService {
  constructor(
    private readonly accessSecret: string,
    private readonly refreshSecret: string,
    private readonly accessExpiresIn: StringValue,
    private readonly refreshExpiresIn: StringValue
  ) {}

  signAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpiresIn
    })
  }

  signRefreshToken(payload: RefreshTokenPayload): string {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn
    })
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return jwt.verify(token, this.accessSecret) as AccessTokenPayload
    } catch {
      throw new AppError('Invalid or expired token', 401)
    }
  }

  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      return jwt.verify(token, this.refreshSecret) as RefreshTokenPayload
    } catch {
      throw new AppError('Invalid or expired refresh token', 401)
    }
  }
}
