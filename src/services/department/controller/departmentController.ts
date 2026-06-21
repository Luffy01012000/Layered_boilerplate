import type { Request, Response } from 'express'
import ResponseFormatter from '@shared/utils/responseFormatter.js'
import { IDepartmentService } from '../interface/departmentService.js'
import responseMessage from '@shared/constants/responseMessage.js'

export class DepartmentController {
  constructor(private readonly departmentService: IDepartmentService) {
    this.departmentService = departmentService
  }

  async createDepartment(req: Request, res: Response) {
    const resData = await this.departmentService.createDepartment(req.body)

    res
      .status(201)
      .json(
        ResponseFormatter.success(
          resData,
          responseMessage.SUCCESSFN('Department created'),
          201
        )
      )
  }

  async upateDepartment(req: Request, res: Response) {
    const resData = await this.departmentService.updateDepartment(
      req?.params?.id as string,
      req?.body
    )

    res
      .status(200)
      .json(
        ResponseFormatter.success(
          resData,
          responseMessage.SUCCESSFN('Department updated'),
          200
        )
      )
  }

  async getAllDepartment(req: Request, res: Response) {
    const resData = await this.departmentService.getAllDepartment()

    res
      .status(200)
      .json(
        ResponseFormatter.success(
          resData,
          responseMessage.SUCCESSFN(
            resData.length > 1 ? 'Fetch departments' : 'Fetch department'
          ),
          200
        )
      )
  }

  async getDepartment(req: Request, res: Response) {
    const resData = await this.departmentService.getDepartment(
      req?.params?.id as string
    )

    res
      .status(200)
      .json(
        ResponseFormatter.success(
          resData,
          responseMessage.SUCCESSFN('Fetch department'),
          200
        )
      )
  }

  async deleteDepartment(req: Request, res: Response) {
    const resData = await this.departmentService.deleteDepartment(
      req?.params?.id as string
    )

    res
      .status(204)
      .json(
        ResponseFormatter.success(
          resData,
          responseMessage.SUCCESSFN('Department deleted'),
          204
        )
      )
  }
}
