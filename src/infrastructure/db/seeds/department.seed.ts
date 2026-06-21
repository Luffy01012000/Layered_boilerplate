import { PrismaClient } from '@prisma/client'

export async function seedDepartments(prisma: PrismaClient) {
  await prisma.department.createMany({
    data: [
      {
        name: 'Engineering'
      },
      {
        name: 'HR'
      },
      {
        name: 'Finance'
      },
      {
        name: 'Marketing'
      }
    ],
    skipDuplicates: true
  })
}
