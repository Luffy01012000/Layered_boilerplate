import type {
  CreatePaymentInput,
  PaymentGateway,
  PaymentResult
} from '../interfaces/paymentGateway.js'

export default class PaymentService {
  constructor(private readonly paymentGateway: PaymentGateway) {}

  createPayment(input: CreatePaymentInput): Promise<PaymentResult> {
    return this.paymentGateway.createPayment({
      ...input,
      currency: input.currency.toUpperCase()
    })
  }
}
