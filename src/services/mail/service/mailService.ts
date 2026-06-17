import AppError from '#shared/utils/AppError.js'
import type {
  MailProvider,
  SendMailInput,
  SendMailResult
} from '../interfaces/mailProvider.js'

export default class MailService {
  constructor(private readonly mailProvider: MailProvider) {}

  send(input: SendMailInput): Promise<SendMailResult> {
    if (!input.html && !input.text) {
      throw new AppError('Either html or text content is required', 400)
    }

    return this.mailProvider.send(input)
  }
}
