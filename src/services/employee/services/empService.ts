import { singleFlight } from '@shared/lib/singleflight/index.js'
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

  private externalApi = 0

  async findTopPaidEmp(query: EmployeeQueryDto) {
    const res = await singleFlight.use('top-paid', async () => {
      const res = await this.empRepo.findTopPaidEmp(query)
      if (res) {
        return res.map((emp) => ({
          name: emp.name,
          salary: emp.salary.toNumber()
        }))
      }
      this.externalApi += 1
      return
    })

    if (res && res?.length > 0) return res
    return []
  }

  async getCalls() {
    return this.externalApi
  }

  async updateEmp(id: string, payload: updateEmpDto) {
    return await this.empRepo.update(id, payload)
  }

  async deleteEmp(id: string) {
    return await this.empRepo.delete(id)
  }
}
