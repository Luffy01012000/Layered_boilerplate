import fs from 'node:fs'

export type ErrorLocation = {
  file: string
  line: number
  column: number
}

export type SerializedError = {
  name: string
  message: string
  stack?: string
  location?: ErrorLocation
}

const stackFramePattern =
  /^\s*at\s+(?:(?<fn>.*?)\s+\()?(?<file>(?:file:\/\/\/)?[A-Za-z]:[\\/].*?|[./][^:)]+):(?<line>\d+):(?<column>\d+)\)?$/

export function getErrorLocation(error: Error): ErrorLocation | undefined {
  const stackLines = error.stack?.split('\n').slice(1) ?? []

  for (const line of stackLines) {
    const match = stackFramePattern.exec(line)

    if (!match?.groups) {
      continue
    }

    const matchedFile = match.groups.file

    if (!matchedFile) {
      continue
    }

    const file = matchedFile.replace(/^file:\/\/\//, '')

    if (
      file.includes('node_modules') ||
      file.includes('node:internal') ||
      file.includes('internal/')
    ) {
      continue
    }

    const rawLocation = {
      file,
      line: Number(match.groups.line),
      column: Number(match.groups.column)
    }

    return normalizeSourceLocation({
      error,
      functionName: match.groups.fn,
      location: rawLocation
    })
  }

  return undefined
}

function normalizeSourceLocation({
  error,
  functionName,
  location
}: {
  error: Error
  functionName?: string
  location: ErrorLocation
}): ErrorLocation {
  if (
    location.line !== 1 ||
    !functionName ||
    !location.file.endsWith('.ts') ||
    !fs.existsSync(location.file)
  ) {
    return location
  }

  const source = fs.readFileSync(location.file, 'utf8')
  const methodName = functionName.split('.').at(-1)

  if (!methodName) {
    return location
  }

  const methodStartIndex = source.search(
    new RegExp(`\\b(?:async\\s+)?${escapeRegExp(methodName)}\\s*\\(`)
  )

  if (methodStartIndex < 0) {
    return location
  }

  const methodBody = source.slice(methodStartIndex)
  const messageIndex = methodBody.indexOf(error.message)
  const targetIndex =
    messageIndex >= 0 ? methodStartIndex + messageIndex : methodStartIndex

  return offsetToLocation(source, location.file, targetIndex)
}

function offsetToLocation(
  source: string,
  file: string,
  offset: number
): ErrorLocation {
  const prefix = source.slice(0, offset)
  const lines = prefix.split('\n')

  return {
    file,
    line: lines.length,
    column: (lines.at(-1)?.length ?? 0) + 1
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function serializeError(error: Error): SerializedError {
  const serialized: SerializedError = {
    name: error.name,
    message: error.message
  }

  if (error.stack) {
    serialized.stack = error.stack
  }

  const location = getErrorLocation(error)
  if (location) {
    serialized.location = location
  }

  return serialized
}

export function serializeUnknownError(error: unknown): unknown {
  if (error instanceof Error) {
    return serializeError(error)
  }

  return error
}
