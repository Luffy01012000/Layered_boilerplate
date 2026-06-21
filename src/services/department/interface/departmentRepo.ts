import type { Department } from '@prisma/client'
import type {
  createDepartmentDto,
  updateDepartmentDto
} from '../dto/Department.dto.js'

export interface IDepartmentRepo {
  create(payload: createDepartmentDto): Promise<Department>
  findAll(): Promise<Department[] | []>
  findById(id: string): Promise<Department | null>
  findByName(name: string): Promise<Department | null>
  update(id: string, payload: updateDepartmentDto): Promise<Department | null>
  delete(id: string): Promise<Department | null>
}
