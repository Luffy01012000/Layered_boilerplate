import AppError from '@shared/errors/AppError.js'
import type {
  createDepartmentDto,
  updateDepartmentDto
} from '../dto/Department.dto.js'
import { IDepartmentRepo } from '../interface/departmentRepo.js'
import { ConflictError } from '@shared/errors/ConflictError.js'
import { NotFoundError } from '@shared/errors/NotFoundError.js'
// import logger from '@shared/lib/logger.js'

export class DepartmentService {
  constructor(private readonly departmentRepo: IDepartmentRepo) {
    this.departmentRepo = departmentRepo
  }

  async createDepartment(dto: createDepartmentDto) {
    const existing = await this.departmentRepo.findByName(dto.name)

    if (existing) {
      throw new ConflictError('Department already exists')
    }
    const resData = await this.departmentRepo.create(dto)
    if (!resData) {
      throw new AppError('Failed to create record', 400)
    }
    return resData
  }

  async getAllDepartment() {
    const departments = await this.departmentRepo.findAll()
    if (departments.length === 0) {
      throw new NotFoundError('No department found!')
    }
    return departments
  }

  async getDepartment(id: string) {
    return await this.departmentRepo.findById(id)
  }

  async getDepartmentStats(name: string) {
    const department = await this.departmentRepo.findDepartmentStats(name)
    return department
  }

  async updateDepartment(id: string, dto: updateDepartmentDto) {
    return await this.departmentRepo.update(id, dto)
  }

  async deleteDepartment(id: string) {
    return await this.departmentRepo.delete(id)
  }
}
