import logger from '@shared/lib/logger.js'

import { revertLastMigration } from './umzug.js'

revertLastMigration()
  .then(() => {
    logger.info('migration reverted')
    process.exit(0)
  })
  .catch((err) => {
    logger.error('migration revert failed', { meta: { err } })
    process.exit(1)
  })
