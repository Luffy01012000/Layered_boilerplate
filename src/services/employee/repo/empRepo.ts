import BaseRepository from './baseRepo.js'
import { createEmpDto, updateEmpDto } from '../validation/empValidation.js'
import { Decimal } from '@prisma/client/runtime/client'
import { prisma } from '@infra/db/prisma.js'
import { safeEmp } from '../interface/empRepo.js'
import { EmployeeQueryDto } from '../validation/empQuery.js'
import { Prisma } from '@prisma/client'
import { NotFoundError } from '@shared/errors/NotFoundError.js'

export class EmpRepo extends BaseRepository<
  safeEmp,
  createEmpDto,
  updateEmpDto,
  string
> {
  async create(data: createEmpDto): Promise<safeEmp> {
    return await prisma.employee.create({
      data,
      omit: {
        password: true
      }
    })
  }

  async findAll(query: EmployeeQueryDto): Promise<safeEmp[] | []> {
    const { page, limit, search, departmentId, roleId, sortBy, sortOrder } =
      query
    return await prisma.employee.findMany({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            },
            {
              email: {
                contains: search,
                mode: 'insensitive'
              }
            }
          ]
        }),

        ...(departmentId && {
          departmentId
        }),

        ...(roleId && {
          roleId
        })
      },

      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit,
      omit: {
        password: true
      }
    })
  }

  async findById(id: string): Promise<safeEmp | null> {
    return await prisma.employee.findUnique({
      where: { id, deletedAt: null },
      omit: {
        password: true
      }
    })
  }

  async findEmpManager(id: string): Promise<safeEmp | null> {
    return await prisma.employee.findUnique({
      where: { id, deletedAt: null },
      include: {
        manager: true
      },
      omit: {
        password: true
      }
    })
  }

  async findManagerTeam(id: string): Promise<safeEmp | null> {
    return await prisma.employee.findUnique({
      where: { id, deletedAt: null },
      include: {
        subordinates: true
      },
      omit: {
        password: true
      }
    })
  }

  async findEmpWithDepRole(query: EmployeeQueryDto): Promise<safeEmp[] | null> {
    const { page, limit, search, departmentId, roleId, sortBy, sortOrder } =
      query
    return await prisma.employee.findMany({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [
            {
              name: {
                contains: search,
                mode: 'insensitive'
              }
            },
            {
              email: {
                contains: search,
                mode: 'insensitive'
              }
            }
          ]
        }),

        ...(departmentId && {
          departmentId
        }),

        ...(roleId && {
          roleId
        })
      },
      include: {
        department: true,
        role: true
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip: (page - 1) * limit,
      take: limit,
      omit: {
        password: true
      }
    })
  }

  async findTopPaidEmp(query: EmployeeQueryDto): Promise<
    | {
        name: string
        salary: Decimal
      }[]
    | null
  > {
    const { page, limit } = query
    return await prisma.employee.findMany({
      where: {
        deletedAt: null
      },
      select: {
        name: true,
        salary: true
      },
      orderBy: {
        salary: 'desc'
      },
      skip: (page - 1) * limit,
      take: limit
    })
  }

  async update(id: string, payload: updateEmpDto): Promise<safeEmp> {
    return await prisma.employee.update({
      where: { id },
      data: payload,
      omit: {
        password: true
      }
    })
  }

  async delete(id: string): Promise<safeEmp> {
    try {
      return await prisma.employee.update({
        where: { id, deletedAt: null },
        data: {
          deletedAt: new Date().toISOString()
        },
        omit: {
          password: true
        }
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundError('Employee not found')
      }

      throw error
    }
  }
}
