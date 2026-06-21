import BaseRepository from './baseRepo.js'
import { Department, Prisma } from '@prisma/client'
import { prisma } from '#infra/db/prisma.js'
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
    const resData = await prisma.department.findUnique({
      where: {
        id
      }
    })

    return resData
  }

  async findByName(name: string): Promise<Department | null> {
    const resData = await prisma.department.findFirst({
      where: {
        name
      }
    })

    return resData
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
