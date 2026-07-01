import logger from '@shared/lib/logger.js'

import { runMigrations } from './umzug.js'

runMigrations()
  .then(() => {
    logger.info('migrations complete')
    process.exit(0)
  })
  .catch((err) => {
    logger.error('migration failed', { meta: { err } })
    process.exit(1)
  })
