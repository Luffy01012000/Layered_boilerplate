import { z } from 'zod'

export const createPaymentSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  currency: z.string().trim().length(3, 'Currency must be a 3-letter code'),
  customerId: z.string().trim().min(1).optional(),
  metadata: z.record(z.string(), z.string()).optional()
})

export type CreatePaymentDto = z.infer<typeof createPaymentSchema>
