export type StoredFile = {
  id: string
  originalName: string
  mimeType: string
  size: number
  path: string
}

export interface FileStorage {
  save(file: Express.Multer.File): Promise<StoredFile>
}
