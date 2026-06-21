import { PrismaClient } from '@prisma/client'

export async function seedAuditLogs(prisma: PrismaClient) {
  const employee = await prisma.employee.findUnique({
    where: {
      email: 'employee@test.com'
    }
  })

  if (!employee) {
    return
  }

  await prisma.auditLog.create({
    data: {
      action: 'CREATE',
      entity: 'Employee',

      newData: {
        employeeId: employee.id,
        name: employee.name
      },

      employeeId: employee.id
    }
  })
}
