export default class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 500,
    public readonly code?: string,
    public readonly isOperational = true,
    public readonly errors?: unknown[]
  ) {
    super(message)

    this.statusCode = statusCode

    this.isOperational = isOperational

    this.errors = errors

    Error.captureStackTrace(this, this.constructor)
  }
}
