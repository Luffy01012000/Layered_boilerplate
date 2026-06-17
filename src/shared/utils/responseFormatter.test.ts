import { describe, expect, it } from 'vitest'

import ResponseFormatter from './responseFormatter.js'

describe('ResponseFormatter', () => {
  it('formats successful responses consistently', () => {
    const response = ResponseFormatter.success({ id: 1 }, 'Created', 201)

    expect(response).toMatchObject({
      success: true,
      message: 'Created',
      data: { id: 1 },
      statusCode: 201
    })
    expect(response.timestamp).toEqual(expect.any(String))
  })
})
