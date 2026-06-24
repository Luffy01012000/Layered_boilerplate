import { z } from 'zod'

const email = z.email()
const name = z.string().min(2, 'Name is required')
const salary = z.number()
const departmentId = z.uuid()
const roleId = z.uuid()
const managerId = z.uuid().optional()
const password = z
  .string()
  .nonempty()
  .min(8, 'Min 8 character required for Password')
  .max(20, 'Only 20 character allowed max')
  .toLowerCase()
  .toUpperCase()

export const createEmpSchema = z.object({
  email,
  name,
  password,
  departmentId,
  roleId,
  managerId,
  salary
})

export const updateEmpSchema = z.object({
  email: z.email().optional(),
  name: z.string().min(2, 'Name is required').optional(),
  salary: z.number().optional(),
  departmentId: z.uuid().optional(),
  roleId: z.uuid().optional(),
  managerId
})

export type createEmpDto = z.infer<typeof createEmpSchema>
export type updateEmpDto = z.infer<typeof updateEmpSchema>
