import { z } from 'zod'

const name = z.string().trim().min(2, 'Name is required')
const description = z
  .string()
  .min(3, 'Description must be at least 3 characters')
  .optional()

export const createDepartmentSchema = z.object({
  name,
  description
})

export const updateDepartmentSchema = createDepartmentSchema.partial()

export type createDepartmentInput = z.infer<typeof createDepartmentSchema>
export type upateDepartmentInput = z.infer<typeof updateDepartmentSchema>
