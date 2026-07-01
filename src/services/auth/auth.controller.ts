import type { Request, Response } from 'express'
import ResponseFormatter from '@shared/utils/responseFormatter.js'

import { authService } from './auth.service.js'

export const authController = {
  async register(req: Request, res: Response) {
    const { email, password } = req.body as { email: string; password: string }
    const tokens = await authService.register({ email, password })
    return res.status(201).json(ResponseFormatter.success(tokens))
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body as { email: string; password: string }
    const tokens = await authService.login({ email, password })
    return res.status(200).json(ResponseFormatter.success(tokens))
  }
}
