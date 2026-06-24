import { Router } from 'express'
import dependency from '../di/department.di.js'
import requestLogger from '@shared/middlewares/requestLogger.js'
import authenticate from '@shared/middlewares/authenticate.js'
import { asyncHandler } from '@shared/middlewares/asyncHandler.js'
import {
  validateBody,
  validateParams,
  validateQuery
} from '@shared/middlewares/validate.js'
import {
  createDepartmentSchema,
  updateDepartmentSchema
} from '../validation/departmentValidation.js'
import { departmentIdSchema } from '../validation/department.params.js'
import { departmentStatsQuerySchema } from '../validation/department.query.js'

const router = Router()
const { controller } = dependency
const departmentController = controller.departmentController

router.post(
  '/',
  requestLogger,
  authenticate,
  validateBody(createDepartmentSchema),
  asyncHandler(departmentController.createDepartment.bind(departmentController))
)

router.get(
  '/',
  requestLogger,
  authenticate,
  asyncHandler(departmentController.getAllDepartment.bind(departmentController))
)

router.get(
  '/stats',
  requestLogger,
  authenticate,
  validateQuery(departmentStatsQuerySchema),
  asyncHandler(
    departmentController.getDepartmentStats.bind(departmentController)
  )
)

router.get(
  '/:id',
  requestLogger,
  authenticate,
  validateParams(departmentIdSchema),
  asyncHandler(departmentController.getDepartment.bind(departmentController))
)

router.put(
  '/:id',
  requestLogger,
  authenticate,
  validateParams(departmentIdSchema),
  validateBody(updateDepartmentSchema),
  asyncHandler(departmentController.upateDepartment.bind(departmentController))
)

router.delete(
  '/:id',
  requestLogger,
  authenticate,
  validateParams(departmentIdSchema),
  asyncHandler(departmentController.deleteDepartment.bind(departmentController))
)

export default router
