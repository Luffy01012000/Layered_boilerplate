import { Prisma, Employee } from '@prisma/client'

import BaseRepository from './BaseRepository.js'
import logger from '@shared/lib/logger.js'
import { prisma } from '@infra/db/prisma.js'
import { EmployeeWithRole } from '#authService/interfaces/userRepository.js'
import { ConflictError } from '@shared/errors/ConflictError.js'
import { Decimal } from '@prisma/client/runtime/client'

export default class PrismaUserRepository extends BaseRepository<
  Employee,
  Prisma.EmployeeCreateInput,
  string
> {
  async create(data: Prisma.EmployeeCreateInput): Promise<Employee> {
    try {
      const user = await prisma.employee.create({
        data
      })

      logger.info('User created', {
        meta: {
          email: user.email
        }
      })

      return user
    } catch (error) {
      logger.error('Error creating user', error)
      throw error
    }
  }

  async findById(id: string): Promise<Employee | null> {
    return await prisma.employee.findUnique({
      where: {
        id,
        deletedAt: null
      }
    })
  }

  async findByEmail(email: string): Promise<Employee | null> {
    try {
      return await prisma.employee.findFirst({
        where: {
          email,
          deletedAt: null
        }
      })
    } catch (error) {
      logger.error('Error finding user by email', error)
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictError('Email already exists')
      }

      throw error
    }
  }

  async findProfile(id: string): Promise<Employee | null> {
    try {
      return await prisma.employee.findUnique({
        where: {
          id,
          deletedAt: null
        },
        include: {
          profile: true
        }
      })
    } catch (error) {
      logger.error('Error finding user by email', error)
      throw error
    }
  }

  async findAll(): Promise<Employee[]> {
    try {
      return await prisma.employee.findMany()
    } catch (error) {
      logger.error('Error finding all users', error)
      throw error
    }
  }

  async findByIdWithRole(id: string): Promise<EmployeeWithRole | null> {
    try {
      return await prisma.employee.findUnique({
        where: { id },
        include: {
          role: true
        }
      })
    } catch (error) {
      logger.error('Error finding employee', error)
      throw error
    }
  }
  async update(
    id: string,
    payload: object
  ): Promise<{
    id: string
    email: string
    name: string
    salary: Decimal
    password: string
    managerId: string | null
    departmentId: string
    roleId: string
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
  }> {
    try {
      const udpatedEmp = await prisma.employee.update({
        where: { id },
        data: payload
      })

      logger.info('Emp updated:', {
        meta: {
          udpatedEmp
        }
      })
      return udpatedEmp
    } catch (error) {
      logger.error('Error updating employee', error)
      throw error
    }
  }

  async delete(id: string): Promise<{
    id: string
    email: string
    name: string
    password: string
    salary: Decimal
    managerId: string | null
    departmentId: string
    roleId: string
    createdAt: Date
    updatedAt: Date
    deletedAt: Date | null
  }> {
    try {
      const deletedEmp = await prisma.employee.update({
        where: { id, deletedAt: null },
        data: {
          deletedAt: new Date()
        }
      })

      logger.info('Emp deletedEmp:', {
        meta: {
          deletedEmp
        }
      })
      return deletedEmp
    } catch (error) {
      logger.error('Error updating employee', error)
      throw error
    }
  }
}
