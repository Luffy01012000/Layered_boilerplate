import { z } from 'zod'

export const employeeQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().positive().max(100).default(10),

  search: z.string().trim().optional(),

  departmentId: z.uuid().optional(),

  roleId: z.uuid().optional(),

  sortBy: z.enum(['name', 'email', 'createdAt']).default('createdAt'),

  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export type EmployeeQueryDto = z.infer<typeof employeeQuerySchema>
