import express from 'express'
import request from 'supertest'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import validate from '#shared/middlewares/validate.js'

describe('validate middleware', () => {
  const app = express()
  app.use(express.json())
  app.post(
    '/users',
    validate(
      z.object({
        email: z.email().toLowerCase(),
        name: z.string().trim().min(1)
      })
    ),
    (req, res) => res.status(201).json(req.body)
  )

  it('passes parsed data to the route handler', async () => {
    const response = await request(app)
      .post('/users')
      .send({ email: 'JOHN@EXAMPLE.COM', name: ' John ' })
      .expect(201)

    expect(response.body).toEqual({
      email: 'john@example.com',
      name: 'John'
    })
  })

  it('returns structured validation errors', async () => {
    const response = await request(app)
      .post('/users')
      .send({ email: 'invalid', name: '' })
      .expect(400)

    expect(response.body.success).toBe(false)
    expect(response.body.error).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email' }),
        expect.objectContaining({ field: 'name' })
      ])
    )
  })
})
