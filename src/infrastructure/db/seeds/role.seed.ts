import { PrismaClient } from '@prisma/client'

export async function seedRoles(prisma: PrismaClient) {
  await prisma.role.createMany({
    data: [
      {
        name: 'ADMIN',
        description: 'System Administrator'
      },
      {
        name: 'MANAGER',
        description: 'Department Manager'
      },
      {
        name: 'EMPLOYEE',
        description: 'Regular Employee'
      }
    ],
    skipDuplicates: true
  })
}
