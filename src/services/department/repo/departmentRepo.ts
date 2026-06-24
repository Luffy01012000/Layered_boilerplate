import { Department, Prisma } from '@prisma/client'
import { prisma } from '@infra/db/prisma.js'
import BaseRepository from './baseRepo.js'
import { NotFoundError } from '@shared/errors/NotFoundError.js'
import { updateDepartmentDto } from '../dto/Department.dto.js'

export default class DepartmentRepo extends BaseRepository<
  Department,
  Prisma.DepartmentCreateInput,
  updateDepartmentDto,
  string
> {
  async create(data: Prisma.DepartmentCreateInput): Promise<{
    name: string
    id: string
    description: string | null
    createdAt: Date
    updatedAt: Date
  }> {
    return await prisma.department.create({
      data
    })
  }
  async findAll(): Promise<Department[]> {
    const resData = await prisma.department.findMany({
      take: 100
    })

    return resData
  }

  async findById(id: string): Promise<Department | null> {
    try {
      return await prisma.department.findUnique({
        where: {
          id
        }
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundError('Department not found')
      }

      throw error
    }
  }

  async findByName(name: string): Promise<Department | null> {
    try {
      return await prisma.department.findUnique({
        where: {
          name
        }
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundError('Department not found')
      }

      throw error
    }
  }

  async findDepartmentStats(name: string): Promise<any | null> {
    const department = await prisma.department.findUnique({
      where: {
        name
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            employees: true
          }
        }
      }
    })

    if (!department) {
      throw new NotFoundError('Department not found')
    }

    const avgSalary = await prisma.employee.aggregate({
      where: {
        departmentId: department.id
      },
      _avg: {
        salary: true
      }
    })

    return {
      department: department.name,
      employeeCount: department._count.employees,
      averageSalary: avgSalary._avg.salary ?? 0
    }
  }

  async update(id: string, payload: updateDepartmentDto): Promise<Department> {
    try {
      return await prisma.department.update({
        where: { id },
        data: payload
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundError('Department not found')
      }

      throw error
    }
  }

  async delete(id: string): Promise<Department> {
    try {
      return await prisma.department.delete({
        where: { id }
      })
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundError('Department not found')
      }

      throw error
    }
  }
}
