import { faker } from '@faker-js/faker'

import type { Seeder } from '../umzug.js'
type TUser = {
  id: string
  name: string
  email: string
  created_at: Date
  updated_at: Date
}
const users: TUser[] = []
for (let i = 0; i < 100; i++) {
  users.push({
    id: crypto.randomUUID(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    created_at: new Date(),
    updated_at: new Date()
  })
}

export const up: Seeder = async ({ context }) => {
  await context.getQueryInterface().bulkInsert('users', users)
}
export const down: Seeder = async ({ context }) => {
  await context.getQueryInterface().bulkDelete('users', {})
}
