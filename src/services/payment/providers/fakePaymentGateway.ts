import { randomUUID } from 'node:crypto'

import type {
  CreatePaymentInput,
  PaymentGateway,
  PaymentResult
} from '../interfaces/paymentGateway.js'

export default class FakePaymentGateway implements PaymentGateway {
  async createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    return {
      id: `pay_${randomUUID()}`,
      amount: input.amount,
      currency: input.currency,
      status: 'succeeded',
      provider: 'fake'
    }
  }
}
