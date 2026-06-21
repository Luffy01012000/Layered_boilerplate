import type { Department } from '@prisma/client'
import type {
  createDepartmentDto,
  updateDepartmentDto
} from '../dto/Department.dto.js'

export interface IDepartmentService {
  createDepartment(dto: createDepartmentDto): Promise<Department>
  getAllDepartment(): Promise<Department[] | []>
  getDepartment(id: string): Promise<Department | null>
  updateDepartment(
    id: string,
    dto: updateDepartmentDto
  ): Promise<Department | null>
  deleteDepartment(id: string): Promise<Department | null>
}
