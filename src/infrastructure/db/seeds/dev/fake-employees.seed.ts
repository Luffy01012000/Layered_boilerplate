import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

export async function seedEmployees(prisma: PrismaClient) {
  const adminRole = await prisma.role.findUnique({
    where: {
      name: 'ADMIN'
    }
  })

  const managerRole = await prisma.role.findUnique({
    where: {
      name: 'MANAGER'
    }
  })

  const employeeRole = await prisma.role.findUnique({
    where: {
      name: 'EMPLOYEE'
    }
  })

  const engineeringDepartment = await prisma.department.findUnique({
    where: {
      name: 'Engineering'
    }
  })

  const hrDepartment = await prisma.department.findUnique({
    where: {
      name: 'HR'
    }
  })

  const password = await bcrypt.hash('Password@123', 10)

  const admin = await prisma.employee.upsert({
    where: {
      email: 'admin@test.com'
    },

    update: {},

    create: {
      name: 'System Admin',
      email: 'admin@test.com',
      password,
      roleId: adminRole!.id,
      departmentId: engineeringDepartment!.id
    }
  })

  const manager = await prisma.employee.upsert({
    where: {
      email: 'manager@test.com'
    },

    update: {},

    create: {
      name: 'Engineering Manager',
      email: 'manager@test.com',
      password,
      roleId: managerRole!.id,
      departmentId: engineeringDepartment!.id,

      managerId: admin.id
    }
  })

  await prisma.employee.upsert({
    where: {
      email: 'employee@test.com'
    },

    update: {},

    create: {
      name: 'John Doe',
      email: 'employee@test.com',
      password,
      roleId: employeeRole!.id,
      departmentId: engineeringDepartment!.id,

      managerId: manager.id
    }
  })

  await prisma.employee.upsert({
    where: {
      email: 'hr@test.com'
    },

    update: {},

    create: {
      name: 'HR Executive',
      email: 'hr@test.com',
      password,
      roleId: employeeRole!.id,
      departmentId: hrDepartment!.id,

      managerId: admin.id
    }
  })
}
