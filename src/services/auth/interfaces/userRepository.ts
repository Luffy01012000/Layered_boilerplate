import type { User } from '@prisma/client'

export type CreateUserInput = {
  email: string
  name: string
  passwordHash: string
  role: string
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>

  findAll(): Promise<User[]>

  findByUsername(name: string): Promise<User | null>

  findById(id: number): Promise<User | null>

  create(data: CreateUserInput): Promise<User>
}
