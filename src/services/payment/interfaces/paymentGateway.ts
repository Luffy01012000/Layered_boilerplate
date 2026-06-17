export type CreatePaymentInput = {
  amount: number
  currency: string
  customerId?: string
  metadata?: Record<string, string>
}

export type PaymentResult = {
  id: string
  amount: number
  currency: string
  status: 'requires_action' | 'succeeded' | 'failed'
  provider: string
}

export interface PaymentGateway {
  createPayment(input: CreatePaymentInput): Promise<PaymentResult>
}
