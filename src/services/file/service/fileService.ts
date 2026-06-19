import AppError from '@shared/utils/AppError.js'
import type { FileStorage, StoredFile } from '../interfaces/fileStorage.js'

export default class FileService {
  constructor(private readonly fileStorage: FileStorage) {}

  upload(file?: Express.Multer.File): Promise<StoredFile> {
    if (!file) {
      throw new AppError('File is required', 400)
    }

    return this.fileStorage.save(file)
  }
}
