import { faker } from '@faker-js/faker'

import type { Seeder } from '../umzug.js'

export const up: Seeder = async ({ context }) => {
  const queryInterface = context.getQueryInterface()
  const users = Array.from({ length: 100 }, () => ({
    id: crypto.randomUUID(),
    name: faker.internet.username(),
    email: faker.internet.email(),
    created_at: new Date(),
    updated_at: new Date()
  }))

  await queryInterface.bulkInsert('users', users)

  const posts = Array.from({ length: 500 }, () => ({
    id: crypto.randomUUID(),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph(),
    user_id: users[Math.floor(Math.random() * users.length)]!.id,
    published: faker.datatype.boolean(),
    created_at: new Date(),
    updated_at: new Date()
  }))

  await queryInterface.bulkInsert('posts', posts)
}

export const down: Seeder = async ({ context }) => {
  await context.getQueryInterface().bulkDelete('posts', {})
  await context.getQueryInterface().bulkDelete('users', {})
}
