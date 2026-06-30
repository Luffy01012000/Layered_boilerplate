# Sequelize Setup — Design Spec

**Date:** 2026-06-30
**Status:** Approved (brainstorming → design)

## Goal

Replace the placeholder Prisma setup in `src/infra/db/` with a working Sequelize + umzug stack wired into the existing Express 5 + TypeScript ESM architecture. Keep the existing `BaseRepository<TEntity, TCreateInput, TId>` abstraction, the existing `AppError` model, the existing `ResponseFormatter` shape, and the existing `dotenv-flow` config loader. Deliver one end-to-end example (`User` model + auth + list route) plus a single vitest integration test so the stack is proven from boot to HTTP.

## Non-goals

- No production-grade auth (no email verification, no rate limiting, no refresh-token rotation/DB persistence, no logout endpoint). The example exists to exercise the stack.
- No multi-tenant / multi-schema support.
- No data seeders (the example test inserts its own row; production seeds are a follow-up).
- No fix for husky/commitlint/ESLint/Prettier rules — the new code follows the existing config.
- No associations on `User` in v1. The `associate()` hook is a no-op reserved for later.
- No coverage tooling, no CI wiring, no docker-compose for the DB.

## Architecture

### New layout

```
src/
├── server.ts                          # load env → init Sequelize → runMigrations() → authenticate() → listen
├── app.ts                             # +app.use('/api/auth', authRouter); +app.use('/api/users', usersRouter)
├── infra/db/
│   ├── sequelize.ts                   # new Sequelize({...}) from config.postgres
│   ├── umzug.ts                       # Umzug instance (QueryInterface + Sequelize)
│   ├── run-migrations.ts              # CLI shim → bun run db:migrate
│   ├── run-migrations-down.ts         # CLI shim → bun run db:migrate:down
│   ├── migrations/
│   │   └── 20260630-001-create-users.js
│   └── models/
│       ├── index.ts                   # side-effect: sequelize.addModels([User]); User.associate(models)
│       └── user/
│           ├── user.model.ts          # class User extends Model<UserAttrs, UserCreationAttrs>
│           ├── user.types.ts          # UserAttrs / UserCreationAttrs
│           ├── user.repo.ts           # export const usersRepo = new SequelizeRepository(User, {...})
│           └── user.repo.test.ts      # vitest integration test
├── services/
│   ├── auth/{auth.controller.ts, auth.service.ts, auth.routes.ts, auth.schemas.ts}
│   └── users/{users.controller.ts, users.service.ts, users.routes.ts}
└── shared/
    ├── repo/baseRepo.ts               # unchanged
    ├── repo-extensions/SequelizeRepository.ts   # generic BaseRepository impl
    ├── configs/index.ts               # +postgres: { pool, ssl }
    └── middlewares/errorHandler.ts    # +Sequelize error branches
```

`src/shared/repo-extensions/` is a new layer that depends on both `shared/repo/baseRepo` (the contract) and `infra/db/sequelize` (the implementation). The dependency arrow stays one-way: services depend on the abstract repo, the abstract repo is filled in by `SequelizeRepository`, which talks to Sequelize. `shared/` remains vendor-agnostic.

## Data flow

### Boot (`server.ts`)

1. `import DotenvFlow from 'dotenv-flow'; DotenvFlow.config()` (first statement, existing).
2. `import { sequelize } from '@infra/db/sequelize.js'` — constructs the `Sequelize` instance; no connection yet.
3. `import { runMigrations } from '@infra/db/umzug.js'`.
4. `import '@infra/db/models/index.js'` — side effect: `sequelize.addModels([User])` and `User.associate(sequelize.models)`.
5. `await runMigrations()` — umzug runs `up()` on any pending migration.
6. `await sequelize.authenticate()` — fails fast: `logger.error(...)` + `process.exit(1)` on rejection.
7. `server.listen(port)`.

`unhandledRejection` and `uncaughtException` handlers stay as-is.

### Read path (`GET /api/users`)

```
client → express
       → authenticate                 (JWT, sets res.locals.user)
       → authorize(['ADMIN','SUPER_ADMIN'])
       → usersController.list         (asyncHandler)
       → usersService.list({ page, limit, search })
       → usersRepo.findAll({ offset, limit, where })
       → User.findAndCountAll(...)
       → ResponseFormatter.paginated(rows, page, limit, count)
       → client
```

`page`/`limit` come from `validateQuery(QuerySchema)` (the schema already exists in `src/shared/validation/query.ts`).

### Write path (`POST /api/auth/register`)

```
client → express
       → validateBody(RegisterSchema)         (Zod; AppError 400 on failure)
       → authController.register
       → authService.register({ email, password })
       → usersRepo... (no findByEmail on generic repo)
       → User.findByEmail(email)              (static helper on the model)
       → ConflictError if exists
       → bcrypt.hash(password, 12)
       → usersRepo.create({ email, passwordHash, roleId: 'USER' })
       → jwtService.signAccessToken + signRefreshToken
       → ResponseFormatter.success({ accessToken, refreshToken })
       → client
```

`POST /api/auth/login` is the inverse: `User.findByEmail` → `bcrypt.compare` → `UnauthorizedError` on mismatch → mint tokens → respond.

## Component contracts

### `SequelizeRepository<TEntity, TCreateInput, TId>`

```ts
// src/shared/repo-extensions/SequelizeRepository.ts
import { Op, type Model, type ModelStatic, type Order, type WhereOptions } from 'sequelize'
import { NotFoundError } from '@shared/errors/NotFoundError.js'
import BaseRepository from '@shared/repo/baseRepo.js'

export interface FindAllOpts<TEntity> {
  offset?: number
  limit?: number
  search?: string
  where?: WhereOptions<TEntity>
  order?: Order
}

export default class SequelizeRepository<
  TEntity extends Model,
  TCreateInput,
  TId = string
> extends BaseRepository<TEntity, TCreateInput, TId> {
  constructor(
    private readonly model: ModelStatic<TEntity>,
    private readonly opts: {
      searchFields?: ReadonlyArray<string>
      defaultLimit?: number
      maxLimit?: number
    } = {}
  ) {
    super()
  }

  async create(input: TCreateInput): Promise<TEntity> {
    return this.model.create(input as any)
  }

  async findById(id: TId): Promise<TEntity | null> {
    return this.model.findByPk(id as any)
  }

  async findAll(opts: FindAllOpts<TEntity> = {}): Promise<{ rows: TEntity[]; count: number }> {
    const { offset, limit, search, where = {}, order } = opts
    const searchWhere = search && this.opts.searchFields?.length
      ? {
          [Op.or]: this.opts.searchFields.map((f) => ({
            [f]: { [Op.iLike]: `%${search}%` }
          }))
        }
      : {}

    return this.model.findAndCountAll({
      where: { ...searchWhere, ...(where as object) } as any,
      offset,
      limit,
      order
    })
  }

  async update(id: TId, payload: Partial<TEntity>): Promise<TEntity> {
    const row = await this.findById(id)
    if (!row) throw new NotFoundError()
    return row.update(payload as any) as Promise<TEntity>
  }

  async delete(id: TId): Promise<TEntity> {
    const row = await this.findById(id)
    if (!row) throw new NotFoundError()
    await row.destroy()
    return row
  }
}
```

- Throws `NotFoundError` from `update`/`delete` when the id doesn't exist. `findById` returns `null` (matches `BaseRepository`).
- Does not pre-check uniqueness in `create` — uniqueness violations surface as `SequelizeUniqueConstraintError` and are mapped to 409 by `errorHandler`.
- `searchFields` is a list of string column names (the generic constraint system can't enforce keyof on the Sequelize model, so we accept `string[]` and rely on tests to catch typos).

### `User` model

```ts
// src/infra/db/models/user/user.types.ts
import type { Optional } from 'sequelize'

export interface UserAttrs {
  id: string
  email: string
  passwordHash: string
  roleId: string
  createdAt: Date
  updatedAt: Date
}

export type UserCreationAttrs = Optional<
  UserAttrs,
  'id' | 'roleId' | 'createdAt' | 'updatedAt'
>
```

```ts
// src/infra/db/models/user/user.model.ts
import { DataTypes, Model } from 'sequelize'
import { sequelize } from '@infra/db/sequelize.js'
import type { UserAttrs, UserCreationAttrs } from './user.types.js'

export class User extends Model<UserAttrs, UserCreationAttrs> implements UserAttrs {
  declare id: string
  declare email: string
  declare passwordHash: string
  declare roleId: string
  declare readonly createdAt: Date
  declare readonly updatedAt: Date

  static associate(_models: Record<string, Model>): void {
    // reserved for future relations; no-op in v1
  }

  static findByEmail(email: string) {
    return User.findOne({ where: { email } })
  }
}

User.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    email: { type: new DataTypes.STRING(255), allowNull: false, unique: true },
    passwordHash: { type: new DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
    roleId: { type: new DataTypes.STRING(32), allowNull: false, defaultValue: 'USER', field: 'role_id' },
    createdAt: { type: DataTypes.DATE, allowNull: false, field: 'created_at' },
    updatedAt: { type: DataTypes.DATE, allowNull: false, field: 'updated_at' }
  },
  { sequelize, tableName: 'users', underscored: true }
)
```

`field:` overrides keep the model property names camelCase while the columns are snake_case.

```ts
// src/infra/db/models/user/user.repo.ts
import { SequelizeRepository } from '@shared/repo-extensions/SequelizeRepository.js'
import { User, type UserAttrs, type UserCreationAttrs } from './user.model.js'

export const usersRepo = new SequelizeRepository<
  InstanceType<typeof User>,
  UserCreationAttrs,
  UserAttrs['id']
>(User, { searchFields: ['email'] })
```

```ts
// src/infra/db/models/index.ts
import { sequelize } from '@infra/db/sequelize.js'
import { User } from './user/user.model.js'

export const models = [User]

for (const model of models) {
  sequelize.addModels([model])
}

User.associate(sequelize.models)
```

### Migration

`src/infra/db/migrations/20260630-001-create-users.js` (pure JS so the migration runs through umzug without a TS build step):

```js
'use strict'

const { Sequelize, DataTypes } = require('sequelize')

module.exports = {
  async up({ context: queryInterface }) {
    await queryInterface.createTable('users', {
      id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      email:         { type: DataTypes.STRING(255), allowNull: false, unique: true },
      password_hash: { type: DataTypes.STRING(255), allowNull: false },
      role_id:       { type: DataTypes.STRING(32),  allowNull: false, defaultValue: 'USER' },
      created_at:    { type: DataTypes.DATE, allowNull: false },
      updated_at:    { type: DataTypes.DATE, allowNull: false }
    })
    await queryInterface.addIndex('users', ['role_id'])
  },
  async down({ context: queryInterface }) {
    await queryInterface.dropTable('users')
  }
}
```

Naming: `YYYYMMDD-NNN-<name>.js`, matching the umzug/sequelize-cli convention. Filename is the only thing the example does; subsequent migrations follow the same pattern.

### umzug setup

```ts
// src/infra/db/umzug.ts
import { Umzug, SequelizeStorage } from 'umzug'
import { sequelize } from '@infra/db/sequelize.js'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const umzug = new Umzug({
  migrations: {
    glob: path.join(__dirname, 'migrations', '*.js'),
    resolve: ({ name, path: migrationPath, context }) => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const migration = require(migrationPath!)
      return { name, up: async () => migration.up(context), down: async () => migration.down(context) }
    }
  },
  context: { queryInterface: sequelize.getQueryInterface() },
  storage: new SequelizeStorage({ sequelize, tableName: 'sequelize_meta' }),
  logger: undefined
})

export const runMigrations = () => umzug.up()
export const revertLastMigration = () => umzug.down()
```

The `require()` for the migration file is acceptable here: migrations are authored as CommonJS (matches sequelize-cli's default output) and umzug's loader is intentionally resolution-agnostic.

### CLI shims

```ts
// src/infra/db/run-migrations.ts
import { runMigrations } from './umzug.js'
import logger from '@shared/lib/logger.js'

runMigrations()
  .then(() => { logger.info('migrations complete'); process.exit(0) })
  .catch((err) => { logger.error('migration failed', { meta: { err } }); process.exit(1) })
```

`run-migrations-down.ts` is the same shape with `revertLastMigration()`.

### Config additions

`src/shared/configs/index.ts` `postgres` block becomes:

```ts
postgres: {
  database_url: required('DATABASE_URL'),
  pool: {
    max:     Number(process.env.POSTGRES_POOL_MAX     ?? 10),
    min:     Number(process.env.POSTGRES_POOL_MIN     ?? 0),
    acquire: Number(process.env.POSTGRES_POOL_ACQUIRE ?? 30000),
    idle:    Number(process.env.POSTGRES_POOL_IDLE    ?? 10000)
  },
  ssl: process.env.POSTGRES_SSL === 'true'
}
```

`sequelize.ts`:

```ts
import { Sequelize } from 'sequelize'
import config from '@shared/configs/index.js'

export const sequelize = new Sequelize(config.postgres.database_url, {
  dialect: 'postgres',
  pool:    config.postgres.pool,
  logging: false,
  dialectOptions: { ssl: config.postgres.ssl ? { require: true, rejectUnauthorized: false } : undefined }
})
```

### Error handler

`src/shared/middlewares/errorHandler.ts` gains a Sequelize branch placed after the `AppError` check:

```ts
import { UniqueConstraintError, ValidationError, ForeignKeyConstraintError,
         ConnectionError, DatabaseError } from 'sequelize'

// after the AppError branch:
if (error instanceof UniqueConstraintError) {
  return res.status(409).json(ResponseFormatter.error('Resource already exists', 409))
}
if (error instanceof ValidationError || error instanceof ForeignKeyConstraintError) {
  return res.status(400).json(ResponseFormatter.error('Validation failed', 400,
    error.errors?.map((e) => ({ path: e.path, message: e.message })) ?? null
  ))
}
if (error instanceof ConnectionError || error instanceof DatabaseError) {
  return res.status(503).json(ResponseFormatter.error('Database unavailable', 503))
}
```

Existing `AppError` and 500 fallthrough stay.

### Routes

`src/services/auth/auth.routes.ts`:

```ts
import { Router } from 'express'
import asyncHandler from '@shared/middlewares/asyncHandler.js'
import { validateBody } from '@shared/middlewares/validate.js'
import { RegisterSchema, LoginSchema } from './auth.schemas.js'
import { authController } from './auth.controller.js'

export const authRouter = Router()

authRouter.post('/register', validateBody(RegisterSchema),
  asyncHandler(authController.register))
authRouter.post('/login', validateBody(LoginSchema),
  asyncHandler(authController.login))
```

`auth.schemas.ts` defines `RegisterSchema` and `LoginSchema` (Zod) with `email` (string, email) and `password` (string, min 8).

`auth.controller.ts` and `auth.service.ts` implement `register` / `login` per the data-flow section, returning `ResponseFormatter.success({ accessToken, refreshToken })` on success and throwing `AppError` subclasses on failure.

`src/services/users/users.routes.ts`:

```ts
import { Router } from 'express'
import asyncHandler from '@shared/middlewares/asyncHandler.js'
import { validateQuery } from '@shared/middlewares/validate.js'
import { QuerySchema } from '@shared/validation/query.js'
import { authenticate } from '@shared/middlewares/authenticate.js'
import { authorize } from '@shared/middlewares/authorize.js'
import { APPLICATION_ROLES } from '@shared/constants/roles.js'
import { usersController } from './users.controller.js'

export const usersRouter = Router()

usersRouter.get('/',
  authenticate,
  authorize(Object.values(APPLICATION_ROLES)),
  validateQuery(QuerySchema),
  asyncHandler(usersController.list))
```

`users.service.ts` `list({ page, limit, search })` calls `usersRepo.findAll({ offset: (page-1)*limit, limit, search })` and returns `{ rows, count, page, limit }`. `usersController.list` wraps in `ResponseFormatter.paginated(rows, page, limit, count)`.

## Testing

### Stack

- `vitest` as the only test dependency. No coverage tooling in v1.
- `tsconfig.json` is **not** modified. `.test.ts` files stay excluded from `tsc --noEmit` (existing behavior). Vitest compiles them on the fly via `tsx`/esbuild.
- The test points at the same Postgres `DATABASE_URL` but with a separate database name (`ems_test`). Set via `.env.test` (gitignored, same shape as `.env.development`).

### Example test

`src/infra/db/models/user/user.repo.test.ts` (one test):

```ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { sequelize } from '@infra/db/sequelize.js'
import { usersRepo } from './user.repo.js'
import { User } from './user.model.js'

describe('usersRepo', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true })
    await User.create({ email: 'a@example.com', passwordHash: 'x', roleId: 'USER' })
  })
  afterAll(async () => { await sequelize.close() })

  it('findAll returns seeded users', async () => {
    const { rows, count } = await usersRepo.findAll({ limit: 10, offset: 0 })
    expect(count).toBe(1)
    expect(rows[0]?.email).toBe('a@example.com')
  })
})
```

`force: true` drops and recreates — fine for a test DB, not for production. No `findById` / `update` / `delete` tests in v1; the goal is to prove the stack boots, the model binds, the repo works, and the type signatures match.

### Vitest config

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 20000
  },
  resolve: {
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@infra':  path.resolve(__dirname, 'src/infra')
    }
  }
})
```

The aliases mirror `tsconfig.json` so the test file can import via `@infra/db/sequelize.js`.

## Dependency changes

`package.json` — `dependencies`:

```jsonc
{
  // ... existing
  "sequelize": "^6.37.0",
  "pg": "^8.11.0",
  "bcryptjs": "^2.4.3",
  "umzug": "^3.8.0"
}
```

`devDependencies`:

```jsonc
{
  // ... existing
  "vitest": "^1.6.0"
}
```

`@types/pg` is already a devDependency and stays. `@types/bcryptjs` is added alongside.

`scripts`:

```jsonc
{
  // ... existing
  "db:migrate":     "tsx src/infra/db/run-migrations.ts",
  "db:migrate:down": "tsx src/infra/db/run-migrations-down.ts",
  "test":           "vitest run",
  "test:watch":     "vitest"
}
```

The pre-existing `"test": "echo \"Error: no test specified\" && exit 1"` is replaced.

## File-change summary

**New files (19):**

```
src/infra/db/sequelize.ts
src/infra/db/umzug.ts
src/infra/db/run-migrations.ts
src/infra/db/run-migrations-down.ts
src/infra/db/migrations/20260630-001-create-users.js
src/infra/db/models/index.ts
src/infra/db/models/user/user.model.ts
src/infra/db/models/user/user.types.ts
src/infra/db/models/user/user.repo.ts
src/infra/db/models/user/user.repo.test.ts
src/shared/repo-extensions/SequelizeRepository.ts
src/services/auth/auth.controller.ts
src/services/auth/auth.service.ts
src/services/auth/auth.routes.ts
src/services/auth/auth.schemas.ts
src/services/users/users.controller.ts
src/services/users/users.service.ts
src/services/users/users.routes.ts
vitest.config.ts
```

**Modified files (6):**

```
package.json                                  # +deps, +scripts, replace test script
tsconfig.json                                 # @infra/* → ./src/infra/*
src/shared/configs/index.ts                   # +postgres: { pool, ssl }
src/shared/middlewares/errorHandler.ts        # +Sequelize error branches
src/app.ts                                    # +app.use('/api/auth', authRouter); +app.use('/api/users', usersRouter)
src/server.ts                                 # +import sequelize + runMigrations; await runMigrations() + await sequelize.authenticate() before listen
```

**Unchanged:**

```
src/shared/repo/baseRepo.ts                   # no API change; abstract stays as-is
```

## Rollout

Implementation goes in this order (one logical step at a time, each runnable and typechecking):

1. Install deps + fix `@infra/*` alias.
2. Add `SequelizeRepository` + `config.postgres.{pool,ssl}` + `src/infra/db/sequelize.ts` + `umzug.ts` + CLI shims. Boot should still start (Sequelize constructs, doesn't connect).
3. Add `User` model + `models/index.ts` + `usersRepo` + the create-users migration. Run `bun run db:migrate` against a local Postgres. Boot now authenticates.
4. Add `errorHandler` Sequelize branches.
5. Add `usersRouter` (auth + authorize + validateQuery + controller + service) and mount in `app.ts`. `GET /api/users` works end-to-end.
6. Add `authRouter` (register + login) and mount in `app.ts`. Auth flow works end-to-end.
7. Add vitest + the single integration test. `bun run test` passes.
8. `bun run lint` and `bun run typecheck` both clean.

Each step ends in a runnable, typechecking state. The full plan is the responsibility of the writing-plans skill, invoked after this spec is approved.
