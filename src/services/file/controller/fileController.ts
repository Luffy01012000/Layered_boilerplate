import type { NextFunction, Request, Response } from 'express'

import ResponseFormatter from '#shared/utils/responseFormatter.js'
import type FileService from '../service/fileService.js'

export default class FileController {
  constructor(private readonly fileService: FileService) {}

  async upload(req: Request, res: Response, next: NextFunction) {
    try {
      const file = await this.fileService.upload(req.file)

      return res
        .status(201)
        .json(ResponseFormatter.success(file, 'File uploaded', 201))
    } catch (error) {
      next(error)
    }
  }
}
