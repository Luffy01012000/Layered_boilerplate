import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { sequelize } from '@infra/db/sequelize.js'

import { User } from './user.model.js'
import { usersRepo } from './user.repo.js'

describe('usersRepo', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true })
    await User.create({
      email: 'a@example.com',
      passwordHash: 'x',
      roleId: 'USER'
    })
  })

  afterAll(async () => {
    await sequelize.close()
  })

  it('findAllPaginated returns seeded users', async () => {
    const { rows, count } = await usersRepo.findAllPaginated({
      limit: 10,
      offset: 0
    })
    expect(count).toBe(1)
    expect(rows[0]?.email).toBe('a@example.com')
  })

  it('findAllPaginated filters by search across searchFields', async () => {
    const { rows, count } = await usersRepo.findAllPaginated({
      limit: 10,
      offset: 0,
      search: 'A@EXAMPLE'
    })
    expect(count).toBe(1)
    expect(rows[0]?.email).toBe('a@example.com')
  })
})
