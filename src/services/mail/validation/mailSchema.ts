import { z } from 'zod'

export const sendMailSchema = z
  .object({
    to: z.email('Recipient email must be valid'),
    subject: z.string().trim().min(1, 'Subject is required'),
    html: z.string().min(1).optional(),
    text: z.string().min(1).optional()
  })
  .refine((value) => value.html || value.text, {
    message: 'Either html or text content is required',
    path: ['text']
  })

export type SendMailDto = z.infer<typeof sendMailSchema>
