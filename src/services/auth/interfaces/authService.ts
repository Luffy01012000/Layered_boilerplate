import type { Employee } from '@prisma/client'
import { RegisterDto } from '../dto/register.dto.js'

type SafeUser = Omit<Employee, 'password'>

export interface IAuthService {
  login(
    email: string,
    password: string
  ): Promise<{ user: SafeUser; token: string }>

  register(data: RegisterDto): Promise<{ user: SafeUser; token: string }>

  getProfile(userId: string): Promise<SafeUser>
  deleteEmp(userId: string): Promise<SafeUser>
}
