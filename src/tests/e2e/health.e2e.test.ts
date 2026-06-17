import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { createServer } from '../../app.js'

describe('Health Check', () => {
  it('returns 200', async () => {
    const response = await request(createServer()).get('/healthz')

    expect(response.status).toBe(200)

    expect(response.body).toEqual({
      ok: true,
      environment: 'test'
    })
  })
})
