// shared/lib/jwt/jwt.types.ts

export interface AccessTokenPayload {
  userId: string
  email: string
  roleId: string
}

export interface RefreshTokenPayload {
  userId: string
}
