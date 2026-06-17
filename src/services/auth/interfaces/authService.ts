import type { User } from '@prisma/client'
import { RegisterDto } from '../dto/register.dto.js'

type SafeUser = Omit<User, 'passwordHash'>

export interface IAuthService {
  login(
    name: string,
    password: string
  ): Promise<{ user: SafeUser; token: string }>

  register(data: RegisterDto): Promise<{ user: SafeUser; token: string }>

  onboardSuperAdmin(
    data: RegisterDto
  ): Promise<{ user: SafeUser; token: string }>

  getProfile(userId: number): Promise<SafeUser>
}
