import type { NextFunction, Request, Response } from 'express'

import ResponseFormatter from '@shared/utils/responseFormatter.js'
import type PaymentService from '../service/paymentService.js'

export default class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await this.paymentService.createPayment(req.body)

      return res
        .status(201)
        .json(ResponseFormatter.success(payment, 'Payment created', 201))
    } catch (error) {
      next(error)
    }
  }
}
