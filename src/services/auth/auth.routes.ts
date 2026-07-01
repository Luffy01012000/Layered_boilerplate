import { Router } from 'express'
import { asyncHandler } from '@shared/middlewares/asyncHandler.js'
import { validateBody } from '@shared/middlewares/validate.js'

import { authController } from './auth.controller.js'
import { LoginSchema, RegisterSchema } from './auth.schemas.js'

export const authRouter = Router()

authRouter.post(
  '/register',
  validateBody(RegisterSchema),
  asyncHandler(authController.register)
)

authRouter.post(
  '/login',
  validateBody(LoginSchema),
  asyncHandler(authController.login)
)
