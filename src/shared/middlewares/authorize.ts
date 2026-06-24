import type { NextFunction, Request, Response } from 'express'

import ResponseFormatter from '../utils/responseFormatter.js'
import type { ApplicationRole } from '../constants/roles.js'

export default function authorize(allowedRoles: ApplicationRole[]) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const role = res.locals.user?.roleId

    if (!role || !allowedRoles.includes(role)) {
      return res
        .status(403)
        .json(ResponseFormatter.error('Insufficient permissions', 403))
    }

    next()
  }
}
