import responseMessage from '@shared/constants/responseMessage.js'
import ResponseFormatter from '@shared/utils/responseFormatter.js'
import type { Request, Response } from 'express'
import { IEmpService } from '../interface/empService.js'
import { EmployeeQueryDto } from '../validation/empQuery.js'
export class EmployeeController {
  constructor(private readonly employeeService: IEmpService) {
    this.employeeService = employeeService
  }

  async createEmployee(req: Request, res: Response) {
    const emp = await this.employeeService.createEmp(req.body)
    res
      .status(201)
      .json(
        ResponseFormatter.success(
          emp,
          responseMessage.SUCCESSFN('Employee created'),
          201
        )
      )
  }

  async findAllEmployee(req: Request, res: Response) {
    const query = (req as any).validatedQuery as unknown as EmployeeQueryDto
    const emp = await this.employeeService.findAllEmp(query)
    res
      .status(200)
      .json(
        ResponseFormatter.success(
          emp,
          responseMessage.SUCCESSFN('Fetched Employees'),
          200
        )
      )
  }

  async findEmployee(req: Request, res: Response) {
    const emp = await this.employeeService.findEmpById(req.params?.id as string)
    res
      .status(200)
      .json(
        ResponseFormatter.success(
          emp,
          responseMessage.SUCCESSFN('Fetched Employee'),
          200
        )
      )
  }

  async findManagerTeam(req: Request, res: Response) {
    const emp = await this.employeeService.findManagerTeam(
      req.params?.id as string
    )
    res
      .status(200)
      .json(
        ResponseFormatter.success(
          emp,
          responseMessage.SUCCESSFN('Fetched Employee'),
          200
        )
      )
  }

  async findEmpManager(req: Request, res: Response) {
    const emp = await this.employeeService.findEmpManager(
      req.params?.id as string
    )
    res
      .status(200)
      .json(
        ResponseFormatter.success(
          emp,
          responseMessage.SUCCESSFN('Fetched Employee'),
          200
        )
      )
  }

  async findTopPaidEmployee(req: Request, res: Response) {
    const query = (req as any).validatedQuery as unknown as EmployeeQueryDto
    const emp = await this.employeeService.findTopPaidEmp(query)
    res
      .status(200)
      .json(
        ResponseFormatter.success(
          emp,
          responseMessage.SUCCESSFN('Fetched top paid Employee'),
          200
        )
      )
  }

  async updateEmployee(req: Request, res: Response) {
    const emp = await this.employeeService.updateEmp(
      req.params.id as string,
      req.body
    )
    res
      .status(200)
      .json(
        ResponseFormatter.success(
          emp,
          responseMessage.SUCCESSFN('Employee updated'),
          200
        )
      )
  }

  async deleteEmployee(req: Request, res: Response) {
    await this.employeeService.deleteEmp(req.params.id as string)
    res
      .status(204)
      .json(
        ResponseFormatter.success(
          {},
          responseMessage.SUCCESSFN('Employee deleted'),
          200
        )
      )
  }
}
