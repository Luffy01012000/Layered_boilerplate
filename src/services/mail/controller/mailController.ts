import type { NextFunction, Request, Response } from 'express'

import ResponseFormatter from '@shared/utils/responseFormatter.js'
import type MailService from '../service/mailService.js'

export default class MailController {
  constructor(private readonly mailService: MailService) {}

  async send(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await this.mailService.send(req.body)

      return res
        .status(202)
        .json(ResponseFormatter.success(result, 'Email accepted', 202))
    } catch (error) {
      next(error)
    }
  }
}
