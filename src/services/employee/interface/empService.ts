import { createEmpDto, updateEmpDto } from '../validation/empValidation.js'
import { EmployeeQueryDto } from '../validation/empQuery.js'
import { safeEmp } from './empRepo.js'

export interface IEmpService {
  createEmp(payload: createEmpDto): Promise<safeEmp>
  findAllEmp(query: EmployeeQueryDto): Promise<safeEmp[] | []>
  findEmpById(id: string): Promise<safeEmp | null>
  findEmpManager(id: string): Promise<safeEmp | null>
  findManagerTeam(id: string): Promise<safeEmp | null>
  findTopPaidEmp(query: EmployeeQueryDto): Promise<
    | {
        name: string
        salary: number
      }[]
    | null
  >
  updateEmp(id: string, payload: updateEmpDto): Promise<safeEmp | null>
  deleteEmp(id: string): Promise<safeEmp | null>
}
