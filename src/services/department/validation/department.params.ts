import { z } from 'zod'

export const departmentIdSchema = z.object({
  id: z.uuid()
})
