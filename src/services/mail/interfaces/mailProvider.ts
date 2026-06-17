export type SendMailInput = {
  to: string
  subject: string
  html?: string
  text?: string
}

export type SendMailResult = {
  messageId: string
}

export interface MailProvider {
  send(input: SendMailInput): Promise<SendMailResult>
}
