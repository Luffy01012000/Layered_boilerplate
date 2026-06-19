import request from 'supertest'
import { beforeAll, afterAll, describe, expect, it } from 'vitest'

import app from '#app.js'
import { prisma } from '@shared/config/prisma.js'

describe('Auth E2E', () => {
  beforeAll(async () => {
    await prisma.user.deleteMany()
  })

  afterAll(async () => {
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  it('should register a new user', async () => {
    const response = await request(app).post('/api/auth/register').send({
      email: 'john@example.com',
      name: 'John',
      password: 'Password123!'
    })

    expect(response.status).toBe(201)

    expect(response.body.success).toBe(true)

    expect(response.body.data.user.email).toBe('john@example.com')

    expect(response.body.data.token).toBeDefined()
  })

  it('should login an existing user', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'john@example.com',
      password: 'Password123!'
    })

    expect(response.status).toBe(200)

    expect(response.body.data.token).toBeDefined()
  })

  it('should reject invalid credentials', async () => {
    const response = await request(app).post('/api/auth/login').send({
      email: 'john@example.com',
      password: 'wrong-password'
    })

    expect(response.status).toBe(401)
  })
})
