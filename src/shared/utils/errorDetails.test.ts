import { describe, expect, it } from 'vitest'

import { getErrorLocation, serializeError } from './errorDetails.js'

function createErrorOnKnownLine() {
  return new Error('known line')
}

describe('errorDetails', () => {
  it('extracts file, line, and column from an error stack', () => {
    const location = getErrorLocation(createErrorOnKnownLine())

    expect(location).toEqual(
      expect.objectContaining({
        file: expect.stringContaining('errorDetails.test.ts'),
        line: expect.any(Number),
        column: expect.any(Number)
      })
    )
    expect(location?.line).toBeGreaterThan(1)
  })

  it('normalizes tsx one-line stack frames to the source throw line', () => {
    const error = new Error('known line')
    error.stack =
      'Error: known line\n' +
      '    at createErrorOnKnownLine (file:///C:/dev/solid_project/server/src/shared/utils/errorDetails.test.ts:1:9999)'

    const serialized = serializeError(error)

    expect(serialized.location).toEqual(
      expect.objectContaining({
        file: expect.stringContaining('errorDetails.test.ts'),
        line: expect.any(Number),
        column: expect.any(Number)
      })
    )
    expect(serialized.location?.line).toBeGreaterThan(1)
  })
})
