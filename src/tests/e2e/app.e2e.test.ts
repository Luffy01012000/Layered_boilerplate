import request from 'supertest'
import { describe, expect, it } from 'vitest'

describe('app', () => {
  it('responds to the health endpoint', async () => {
    process.env.DATABASE_URL ??=
      'postgresql://postgres:postgres@localhost:5432/postgres?schema=public'
    process.env.JWT_SECRET ??= 'test-secret'

    const { createServer } = await import('../../app.ts')
    const response = await request(createServer()).get('/healthz').expect(200)

    expect(response.body).toMatchObject({ ok: true })
  })
})
