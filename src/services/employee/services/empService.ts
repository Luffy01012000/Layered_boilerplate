import { IEmpRepo } from '../interface/empRepo.js'
import { EmployeeQueryDto } from '../validation/empQuery.js'
import { createEmpDto, updateEmpDto } from '../validation/empValidation.js'

export class EmpService {
  constructor(private readonly empRepo: IEmpRepo) {
    this.empRepo = empRepo
  }

  async createEmp(dto: createEmpDto) {
    return await this.empRepo.create(dto)
  }

  async findAllEmp(query: EmployeeQueryDto) {
    return await this.empRepo.findAll(query)
  }

  async findEmpById(id: string) {
    return await this.empRepo.findById(id)
  }

  async findEmpManager(id: string) {
    return await this.empRepo.findEmpManager(id)
  }

  async findManagerTeam(id: string) {
    return await this.empRepo.findManagerTeam(id)
  }

  async findTopPaidEmp(query: EmployeeQueryDto) {
    const res = await this.empRepo.findTopPaidEmp(query)
    if (res) {
      return res.map((emp) => ({
        name: emp.name,
        salary: emp.salary.toNumber()
      }))
    }
    return []
  }

  async updateEmp(id: string, payload: updateEmpDto) {
    return await this.empRepo.update(id, payload)
  }

  async deleteEmp(id: string) {
    return await this.empRepo.delete(id)
  }
}
