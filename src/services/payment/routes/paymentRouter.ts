import express from 'express'

import authenticate from '@shared/middlewares/authenticate.js'
import requestLogger from '@shared/middlewares/requestLogger.js'
import validate from '@shared/middlewares/validate.js'
import dependencies from '../Dependencies/dependencies.js'
import { createPaymentSchema } from '../validation/paymentSchema.js'

const router = express.Router()
const paymentController = dependencies.controller.paymentController

router.post(
  '/',
  requestLogger,
  authenticate,
  validate(createPaymentSchema),
  (req, res, next) => paymentController.createPayment(req, res, next)
)

export default router
