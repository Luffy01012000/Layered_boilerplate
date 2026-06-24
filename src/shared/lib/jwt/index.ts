// shared/lib/jwt/index.ts

import config from '@shared/config/index.js'
import { JwtService } from './jwt.service.js'

export const jwtService = new JwtService(
  config.jwt.accessSecret,
  config.jwt.refreshSecret,
  config.jwt.accessExpiresIn,
  config.jwt.refreshExpiresIn
)

export * from './jwt.service.js'
export * from './jwt.types.js'
