import { Router } from 'express'
import authenticate from '@shared/middlewares/authenticate.js'
import authorize from '@shared/middlewares/authorize.js'
import { asyncHandler } from '@shared/middlewares/asyncHandler.js'
import { validateQuery } from '@shared/middlewares/validate.js'
import { APPLICATION_ROLES } from '@shared/constants/roles.js'
import { QuerySchema } from '@shared/validation/query.js'

import { usersController } from './users.controller.js'

export const usersRouter = Router()

usersRouter.get(
  '/',
  authenticate,
  authorize(Object.values(APPLICATION_ROLES)),
  validateQuery(QuerySchema),
  asyncHandler(usersController.list)
)
