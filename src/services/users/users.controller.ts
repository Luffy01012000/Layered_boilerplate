import type { Request, Response } from 'express'
import ResponseFormatter from '@shared/utils/responseFormatter.js'

import { usersService } from './users.service.js'

export const usersController = {
  async list(req: Request, res: Response) {
    const { page, limit, search } = (req as any).validatedQuery as {
      page: number
      limit: number
      search?: string
    }
    const { rows, count } = await usersService.list({ page, limit, search })
    return res
      .status(200)
      .json(ResponseFormatter.paginated(rows, page, limit, count))
  }
}
