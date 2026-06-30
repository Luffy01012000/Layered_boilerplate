import authenticate from '@shared/middlewares/authenticate.js'
import {
  validateBody,
  validateParams,
  validateQuery
} from '@shared/middlewares/validate.js'
import { Router } from 'express'
import { employeeQuerySchema } from '../validation/empQuery.js'
import { asyncHandler } from '@shared/middlewares/asyncHandler.js'
import dependency from '../di/empDI.js'
import {
  createEmpSchema,
  updateEmpSchema
} from '../validation/empValidation.js'
import { IdSchema } from '@shared/validation/params.js'

const router = Router()
const { controller } = dependency
const empController = controller.employeeController

router.get(
  '/',
  authenticate,
  validateQuery(employeeQuerySchema),
  asyncHandler(empController.findAllEmployee.bind(empController))
)

router.get('/getcall', asyncHandler(empController.getCall.bind(empController)))

router.post(
  '/',
  authenticate,
  validateBody(createEmpSchema),
  asyncHandler(empController.createEmployee.bind(empController))
)

router.get(
  '/top-paid',
  authenticate,
  validateQuery(employeeQuerySchema),
  asyncHandler(empController.findTopPaidEmployee.bind(empController))
)

router.get(
  '/emp-manager/:id',
  authenticate,
  validateParams(IdSchema),
  validateQuery(employeeQuerySchema),
  asyncHandler(empController.findEmpManager.bind(empController))
)

router.get(
  '/manager-team/:id',
  authenticate,
  validateParams(IdSchema),
  validateQuery(employeeQuerySchema),
  asyncHandler(empController.findManagerTeam.bind(empController))
)

router.get(
  '/:id',
  authenticate,
  validateParams(IdSchema),
  asyncHandler(empController.findEmployee.bind(empController))
)

router.put(
  '/:id',
  authenticate,
  validateParams(IdSchema),
  validateBody(updateEmpSchema),
  asyncHandler(empController.updateEmployee.bind(empController))
)

router.delete(
  '/:id',
  authenticate,
  validateParams(IdSchema),
  asyncHandler(empController.deleteEmployee.bind(empController))
)

export default router
