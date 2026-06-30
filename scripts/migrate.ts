import { migrator } from '../src/infra/db/umzug.js'

await migrator.runAsCLI()
