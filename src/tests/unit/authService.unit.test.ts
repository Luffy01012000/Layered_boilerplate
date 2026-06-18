import { describe, it, expect, vi } from 'vitest'
import { AuthService } from '#authService/service/authService.ts'
import type { IUserRepository } from '#authService/interfaces/userRepository.ts'
import { APPLICATION_ROLES } from '#shared/constants/roles.ts'
import bcrypt from 'bcryptjs'

describe('AuthService', () => {
  it('creates a user', async () => {
    const repository: IUserRepository = {
      findByEmail: vi.fn().mockResolvedValue(null),
      findByUsername: vi.fn(),
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn().mockResolvedValue({
        id: 1,
        email: 'john@example.com',
        name: 'John',
        role: APPLICATION_ROLES.USER,
        passwordHash: 'hashed-password'
      })
    }

    const service = new AuthService(repository)

    const dto = {
      email: 'john@example.com',
      name: 'John',
      password: 'password123'
    }

    await service.register(dto)

    expect(repository.create).toHaveBeenCalledOnce()
  })

  it('logs in an existing user', async () => {
    const passwordHash = await bcrypt.hash('password123', 12)
    const repository: IUserRepository = {
      findByEmail: vi.fn(),
      findByUsername: vi.fn().mockResolvedValue({
        id: 1,
        email: 'john@example.com',
        name: 'John',
        role: APPLICATION_ROLES.USER,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date()
      }),
      findById: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn()
    }

    const service = new AuthService(repository)

    const result = await service.login('John', 'password123')

    expect(result.token).toEqual(expect.any(String))
    expect(result.user).not.toHaveProperty('passwordHash')
  })
})
