import bcrypt from 'bcryptjs'
import { ConflictError } from '@shared/errors/ConflictError.js'
import { UnauthorizedError } from '@shared/errors/UnauthorizedError.js'
import { jwtService } from '@shared/lib/jwt/index.js'
import { usersRepo } from '@infra/db/models/user/user.repo.js'
import { User } from '@infra/db/models/user/user.model.js'

export interface RegisterInput {
  email: string
  password: string
}

export interface LoginInput {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

const BCRYPT_ROUNDS = 12

export const authService = {
  async register({ email, password }: RegisterInput): Promise<AuthTokens> {
    const existing = await User.findByEmail(email)
    if (existing) throw new ConflictError('Email already registered')

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS)
    const user = await usersRepo.create({ email, passwordHash })

    const accessToken = jwtService.signAccessToken({
      userId: user.id,
      email: user.email,
      roleId: user.roleId
    })
    const refreshToken = jwtService.signRefreshToken({ userId: user.id })

    return { accessToken, refreshToken }
  },

  async login({ email, password }: LoginInput): Promise<AuthTokens> {
    const user = await User.findByEmail(email)
    if (!user) throw new UnauthorizedError('Invalid credentials')

    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) throw new UnauthorizedError('Invalid credentials')

    const accessToken = jwtService.signAccessToken({
      userId: user.id,
      email: user.email,
      roleId: user.roleId
    })
    const refreshToken = jwtService.signRefreshToken({ userId: user.id })

    return { accessToken, refreshToken }
  }
}
