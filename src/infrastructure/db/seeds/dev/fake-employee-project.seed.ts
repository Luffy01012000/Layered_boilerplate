import { PrismaClient } from '@prisma/client'

export async function seedEmployeeProjects(prisma: PrismaClient) {
  const employee = await prisma.employee.findUnique({
    where: {
      email: 'employee@test.com'
    }
  })

  const project = await prisma.project.findFirst({
    where: {
      name: 'Payroll System'
    }
  })

  if (!employee || !project) {
    return
  }

  await prisma.employeeProject.upsert({
    where: {
      employeeId_projectId: {
        employeeId: employee.id,
        projectId: project.id
      }
    },

    update: {},

    create: {
      employeeId: employee.id,
      projectId: project.id,
      assignedBy: 'SYSTEM'
    }
  })
}
