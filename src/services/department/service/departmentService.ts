import AppError from '@shared/errors/AppError.js'
import type {
  createDepartmentDto,
  updateDepartmentDto
} from '../dto/Department.dto.js'
import { IDepartmentRepo } from '../interface/departmentRepo.js'
import { ConflictError } from '@shared/errors/ConflictError.js'
import { NotFoundError } from '@shared/errors/NotFoundError.js'

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
    const department = await this.departmentRepo.findById(id)
    if (!department) throw new NotFoundError('Department not found!')
    return department
  }

  async updateDepartment(id: string, dto: updateDepartmentDto) {
    return await this.departmentRepo.update(id, dto)
  }

  async deleteDepartment(id: string) {
    return await this.departmentRepo.delete(id)
  }
}
