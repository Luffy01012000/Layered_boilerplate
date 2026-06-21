import { PrismaClient } from '@prisma/client'

export async function seedProfiles(prisma: PrismaClient) {
  const employee = await prisma.employee.findUnique({
    where: {
      email: 'employee@test.com'
    }
  })

  if (!employee) {
    return
  }

  await prisma.employeeProfile.upsert({
    where: {
      employeeId: employee.id
    },

    update: {},

    create: {
      employeeId: employee.id,
      phone: '9999999999',
      address: 'Surat, Gujarat'
    }
  })
}
