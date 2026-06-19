import nodemailer from 'nodemailer'

import config from '@shared/config/index.js'
import type {
  MailProvider,
  SendMailInput,
  SendMailResult
} from '../interfaces/mailProvider.js'

export default class NodemailerMailProvider implements MailProvider {
  private readonly transporter = config.mail.host
    ? nodemailer.createTransport({
        host: config.mail.host,
        port: config.mail.port,
        secure: config.mail.port === 465,
        auth:
          config.mail.user && config.mail.pass
            ? {
                user: config.mail.user,
                pass: config.mail.pass
              }
            : undefined
      })
    : nodemailer.createTransport({ jsonTransport: true })

  async send(input: SendMailInput): Promise<SendMailResult> {
    const info = await this.transporter.sendMail({
      from: config.mail.from,
      ...input
    })

    return {
      messageId: info.messageId
    }
  }
}
