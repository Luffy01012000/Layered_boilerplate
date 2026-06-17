import { randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import type { FileStorage, StoredFile } from '../interfaces/fileStorage.js'

export default class LocalFileStorage implements FileStorage {
  constructor(
    private readonly uploadDir = path.join(process.cwd(), 'uploads')
  ) {}

  async save(file: Express.Multer.File): Promise<StoredFile> {
    await mkdir(this.uploadDir, { recursive: true })

    const extension = path.extname(file.originalname)
    const id = randomUUID()
    const filename = `${id}${extension}`
    const filePath = path.join(this.uploadDir, filename)

    await writeFile(filePath, file.buffer)

    return {
      id,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: filePath
    }
  }
}
