import { prisma } from '..//prisma.js'
import { seedRoles } from './role.seed.js'
import { seedDepartments } from './department.seed.js'
import { seedProjects } from './dev/fake-projects.seed.js'
import { seedEmployees } from './dev/fake-employees.seed.js'
import { seedProfiles } from './dev/fake-employee-profile.seed.js'
// import { seedEmployeeProjects } from './dev/'
import { seedAuditLogs } from './dev/fake-audit-log.seed.js'
import logger from '@shared/lib/logger.js'

async function main() {
  logger.info('🌱 Starting database seed...')

  await seedRoles(prisma)

  await seedDepartments(prisma)

  await seedProjects(prisma)

  await seedEmployees(prisma)

  await seedProfiles(prisma)

  //   await seedEmployeeProjects(prisma)

  await seedAuditLogs(prisma)

  logger.info('✅ Database seeded successfully')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
