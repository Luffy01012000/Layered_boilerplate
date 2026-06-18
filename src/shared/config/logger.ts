import util from 'node:util'
import path from 'node:path'
import { createLogger, format, transports } from 'winston'
import {
  ConsoleTransportInstance,
  FileTransportInstance
} from 'winston/lib/winston/transports'
import config, { Environment } from '../config/index.js'
import { red, blue, yellow, green, magenta } from 'colorette'
import { fileURLToPath } from 'node:url'
import { serializeUnknownError } from '../utils/errorDetails.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const splatSymbol = Symbol.for('splat')

const colorizeLevel = (level: string) => {
  switch (level) {
    case 'ERROR':
      return red(level)
    case 'INFO':
      return blue(level)
    case 'WARN':
      return yellow(level)
    default:
      return level
  }
}

const consoleLogFormat = format.printf((info) => {
  const { level, message, timestamp } = info
  const meta = normalizeLogMeta(info)

  const customLevel = colorizeLevel(level.toUpperCase())
  const customTimestamp = green(timestamp as string)

  const customMessage = message

  const customMeta = util.inspect(meta, {
    showHidden: false,
    depth: null,
    colors: true
  })

  const customLog = `${customLevel} [${customTimestamp}] ${customMessage}\n${magenta('META')} ${customMeta}\n`

  return customLog
})

const consoleTransport = (): Array<ConsoleTransportInstance> => {
  if (config.node_env === Environment.DEVELOPMENT) {
    return [
      new transports.Console({
        level: 'info',
        format: format.combine(format.timestamp(), consoleLogFormat)
      })
    ]
  }

  return []
}

const fileLogFormat = format.printf((info) => {
  const { level, message, timestamp } = info
  const meta = normalizeLogMeta(info)

  const logMeta: Record<string, unknown> = {}
  const metaObject = meta

  for (const [key, value] of Object.entries(metaObject)) {
    logMeta[key] = serializeUnknownError(value)
  }

  const logData = {
    level: level.toUpperCase(),
    message,
    timestamp,
    meta: logMeta
  }

  return JSON.stringify(logData, null, 4)
})

const FileTransport = (): Array<FileTransportInstance> => {
  return [
    new transports.File({
      filename: path.join(
        __dirname,
        '../',
        '../',
        'logs',
        `${config.node_env}.log`
      ),
      level: 'info',
      format: format.combine(format.timestamp(), fileLogFormat)
    })
  ]
}

export default createLogger({
  defaultMeta: {
    meta: {}
  },
  transports: [...FileTransport(), ...consoleTransport()]
})

function normalizeLogMeta(info: Record<PropertyKey, unknown>) {
  const meta = (info.meta ?? {}) as Record<string, unknown>
  const splat = (info[splatSymbol] ?? []) as unknown[]
  const normalized: Record<string, unknown> = { ...meta }

  splat.forEach((value, index) => {
    if (value instanceof Error) {
      normalized.error = serializeUnknownError(value)
      return
    }

    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      const objectValue = value as Record<string, unknown>

      if (objectValue.meta && typeof objectValue.meta === 'object') {
        Object.assign(normalized, objectValue.meta)

        const { meta: _meta, ...rest } = objectValue
        Object.assign(normalized, rest)
        return
      }

      Object.assign(normalized, objectValue)
      return
    }

    normalized[`arg${index}`] = value
  })

  for (const [key, value] of Object.entries(normalized)) {
    normalized[key] = serializeUnknownError(value)
  }

  return normalized
}
