import { z } from 'zod'

import { APPLICATION_ROLES } from '@shared/constants/roles.js'

const name = z.string().trim().min(1, 'Name is required')
const email = z.email('Email must be valid').toLowerCase()
const password = z.string().min(6, 'Password must be at least 6 characters')
const role = z.enum([
  APPLICATION_ROLES.SUPER_ADMIN,
  APPLICATION_ROLES.ADMIN,
  APPLICATION_ROLES.USER
])

export const registrationSchema = z.object({
  name,
  email,
  password,
  role: role.optional()
})

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Password is required')
})

export type RegistrationInput = z.infer<typeof registrationSchema>
export type LoginInput = z.infer<typeof loginSchema>
