import express from 'express'

import { APPLICATION_ROLES } from '@shared/constants/roles.js'
import authenticate from '@shared/middlewares/authenticate.js'
import authorize from '@shared/middlewares/authorize.js'
import requestLogger from '@shared/middlewares/requestLogger.js'
import validate from '@shared/middlewares/validate.js'
import dependencies from '../Dependencies/dependencies.js'
import { sendMailSchema } from '../validation/mailSchema.js'

const router = express.Router()
const mailController = dependencies.controller.mailController

router.post(
  '/',
  requestLogger,
  authenticate,
  authorize([APPLICATION_ROLES.SUPER_ADMIN, APPLICATION_ROLES.ADMIN]),
  validate(sendMailSchema),
  (req, res, next) => mailController.send(req, res, next)
)

export default router
