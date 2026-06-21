import { PrismaClient } from '@prisma/client'

export async function seedProjects(prisma: PrismaClient) {
  await prisma.project.createMany({
    data: [
      {
        name: 'Payroll System',
        description: 'Internal payroll platform'
      },
      {
        name: 'Employee Portal',
        description: 'Employee self-service portal'
      },
      {
        name: 'HRMS',
        description: 'Human Resource Management System'
      }
    ],
    skipDuplicates: true
  })
}
