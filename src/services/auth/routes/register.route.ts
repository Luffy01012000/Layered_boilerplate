import { z } from 'zod'

export const RegisterSchema = z.object({
  email: z.string().email().openapi({
    example: 'john@gmail.com'
  }),

  password: z.string().min(8).openapi({
    example: 'secret123'
  }),

  name: z.string().min(2),

  role: z.string().optional()
})

export type RegisterDto1 = z.infer<typeof RegisterSchema>

import { registry } from '@infra/openapi/registry.js'

registry.registerPath({
  method: 'post',

  path: '/api/v1/auth/register',

  tags: ['Auth'],

  request: {
    body: {
      content: {
        'application/json': {
          schema: RegisterSchema
        }
      }
    }
  },

  responses: {
    201: {
      description: 'User registered'
    }
  }
})
