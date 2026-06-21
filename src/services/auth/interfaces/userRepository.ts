import type { Employee, Prisma } from '@prisma/client'

export type CreateUserInput = {
  email: string
  name: string
  password: string
  roleId?: string
}

export type EmployeeWithRole = Prisma.EmployeeGetPayload<{
  include: {
    role: true
  }
}>

export interface IUserRepository {
  findByEmail(email: string): Promise<Employee | null>

  findAll(): Promise<Employee[]>

  // findByUsername(name: string): Promise<Employee | null>
  findProfile(id: string): Promise<Employee | null>

  findById(id: string): Promise<Employee | null>
  findByIdWithRole(id: string): Promise<EmployeeWithRole | null>

  create(data: CreateUserInput): Promise<Employee>
  delete(id: string): Promise<Employee>
}
