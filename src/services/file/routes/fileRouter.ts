import express from 'express'

import authenticate from '@shared/middlewares/authenticate.js'
import requestLogger from '@shared/middlewares/requestLogger.js'
import dependencies from '../Dependencies/dependencies.js'
import { upload } from '../middlewares/upload.js'

const router = express.Router()
const fileController = dependencies.controller.fileController

router.post(
  '/',
  requestLogger,
  authenticate,
  upload.single('file'),
  (req, res, next) => fileController.upload(req, res, next)
)

export default router
