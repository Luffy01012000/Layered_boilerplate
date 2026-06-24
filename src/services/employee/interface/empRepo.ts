import { Employee } from '@prisma/client'
import { createEmpDto, updateEmpDto } from '../validation/empValidation.js'
import { EmployeeQueryDto } from '../validation/empQuery.js'
import type { Decimal } from '@prisma/client/runtime/client'

export type safeEmp = Omit<Employee, 'password'>
export type TDecimal = Decimal

export interface IEmpRepo {
  create(payload: createEmpDto): Promise<safeEmp>
  findAll(query: EmployeeQueryDto): Promise<safeEmp[] | []>
  findById(id: string): Promise<safeEmp | null>
  findEmpManager(id: string): Promise<safeEmp | null>
  findManagerTeam(id: string): Promise<safeEmp | null>
  findTopPaidEmp(query: EmployeeQueryDto): Promise<
    | {
        name: string
        salary: Decimal
      }[]
    | null
  >
  update(id: string, payload: updateEmpDto): Promise<safeEmp | null>
  delete(id: string): Promise<safeEmp | null>
}
