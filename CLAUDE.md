# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Express 5 + TypeScript backend (ESM, Node 24) for backend apis. Uses PostgreSQL type orm or mongoose for mongodb, JWT auth, Zod validation, Winston logging, and `dotenv-flow` for layered env files. Package manager is **bun** (per husky hooks), but the runtime/build tools are plain `tsc`/`tsx`/`node`.

## Common Commands

| Task               | Command                                                                                                                                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Dev (watch)        | `bun run dev` (runs `tsx watch src/server.ts`)                                                                                                                                                         |
| Typecheck only     | `bun run typecheck` (watch) or `tsc --noEmit` (one-shot)                                                                                                                                               |
| Lint               | `bun run lint` (runs `tsc --noEmit` + ESLint on `src/**/*.ts*`)                                                                                                                                        |
| Lint + autofix     | `bun run lint:fix`                                                                                                                                                                                     |
| Format check / fix | `bun run format:check` / `bun run format:fix`                                                                                                                                                          |
| Build              | `bun run build` → `dist/` (via `tsc`)                                                                                                                                                                  |
| Start (prod)       | `bun run start` (`node dist/server.js`)                                                                                                                                                                |
| Tests              | _none configured_ — `npm test` is a placeholder (`"test": "echo \"Error: no test specified\" && exit 1"`). No test framework, no `*.test.ts`/`*.spec.ts` are compiled (`tsconfig.json` excludes them). |

PM2 deployment config is in `ecosystem.config.js` (entry: `dist/server.js`, `NODE_ENV=production`).

## Architecture & Layout

```
src/
├── server.ts              # Process entry. Loads env via dotenv-flow, builds app, starts listener, wires unhandledRejection/uncaughtException handlers.
├── app.ts                 # createServer(): assembles Express app — security middleware, parsers, health routes, route mounts, terminal errorHandler.
├── docs/                  # Reserved (empty .gitkeep)
├── infra/
│   └── db/                # Prisma client + seeds (currently a placeholder)
├── services/              # Reserved for feature services (controllers + business logic) (currently empty .gitkeep)
└── shared/                # Cross-cutting infrastructure reused by services
    ├── configs/index.ts   # Centralized config object loaded from process.env (see "Config & Env" below)
    ├── constants/         # responseMessage, roles (APPLICATION_ROLES + isValidRole type guard)
    ├── errors/            # AppError base + NotFoundError (404), ConflictError (409), UnauthorizedError (401)
    ├── lib/
    │   ├── logger.ts      # Winston logger — colorized console in dev, JSON file under src/logs/{env}.log always
    │   ├── jwt/           # JwtService singleton (`jwtService`) + types (AccessTokenPayload/RefreshTokenPayload)
    │   └── singleflight/  # SingleFlight pattern — dedupe concurrent identical async work via `singleFlight.use(key, fn)`
    ├── middlewares/
    │   ├── asyncHandler.ts    # Wraps async handlers and forwards errors to next()
    │   ├── authenticate.ts    # Pulls token from `authToken` cookie or `Authorization: Bearer ...`; verifies via jwtService; attaches payload to `res.locals.user`
    │   ├── authorize.ts       # Role gate — `authorize(['ADMIN', 'SUPER_ADMIN'])` reads `res.locals.user.roleId`
    │   ├── errorHandler.ts    # Terminal error handler — maps AppError → status/message, falls back to 500
    │   ├── requestLogger.ts   # Per-request timing log (method/path/status/durationMs/ip/ua); level chosen by status
    │   └── validate.ts        # Zod-backed `validate(schema, target)` + `validateBody`/`validateParams`/`validateQuery`; throws AppError(400) on failure
    ├── repo/baseRepo.ts       # Abstract BaseRepository<TEntity, TCreateInput, TId> — `create`/`findById`/`findAll`/`update`/`delete`
    ├── utils/                 # ResponseFormatter (success/error/validationError/paginated), typeExtraction (pick helper)
    └── validation/            # Reusable Zod schemas — `IdSchema` (uuid), `QuerySchema` (page/limit/search with coercion+defaults)
```

### Request lifecycle

1. `server.ts` loads env (`dotenv-flow`), constructs the app via `createServer()` in `app.ts`, then `server.listen(PORT)`.
2. `app.ts` middleware chain (order matters): `morgan` → `helmet` → `urlencoded` → `json` → `cookieParser` → `cors` → `compression` → `hpp`.
3. Health/probe routes (`/health`, `/live`, `/ready`, `/version`) are mounted inline before route modules.
4. Feature routers mount under `/api/*` (currently not present — `authRouter`, `departmentRouter`, `employeeRouter` are placeholders).
5. `errorHandler` is the terminal middleware.

### Path aliases (tsconfig `paths`)

- `@shared/*` → `./src/shared/*`
- `#prismagenerated/*` → `./src/shared/generated/*` (Prisma client output — directory not yet created)
- `@infra/*` → `./src/infrastructure/*` (note: actual code lives in `./src/infra/`; the alias target is misspelled — most code currently imports the real path)

Always include the `.js` extension on relative ESM imports (`from './foo.js'`).

### Config & Env

`src/shared/configs/index.ts` calls `dotenv-flow.config()` which merges `.env.{NODE_ENV}` over `.env` automatically. Required env vars (will throw at boot if missing): `DATABASE_URL`, `JWT_SECRET`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`. The `.env.example` in repo root only lists `NODE_ENV` and `PORT` — copy from `.env.development` when bootstrapping.

Env files present: `.env.example`, `.env.development`, `.env.production`. All `.env.*` except `.env.example` are gitignored.

### Auth flow

- `jwtService` (singleton in `shared/lib/jwt`) signs/verifies access (short-lived) and refresh (long-lived) tokens with separate secrets.
- `authenticate` middleware reads from `req.cookies.authToken` first, then `Authorization: Bearer ...`. The verified payload (containing `userId`, `email`, `roleId`) is stored on `res.locals.user`.
- `authorize([...roles])` enforces role checks against `res.locals.user.roleId`.

### Error model

Throw `AppError` (or subclasses `NotFoundError`/`ConflictError`/`UnauthorizedError`) from services/handlers. `asyncHandler` and `validate` forward them to the terminal `errorHandler`, which serializes via `ResponseFormatter.error`. Unknown errors collapse to HTTP 500 with `Internal server error`.

### Tooling & conventions

- **Module system**: ESM (`"type": "module"`). All TS imports must use `.js` extension for relative paths.
- **Formatter**: Prettier — no trailing commas, single quotes, no semicolons, 2-space tabs, 80-col width, LF endings, `bracketSameLine: true`. ESLint runs Prettier as a rule.
- **Lint**: ESLint flat config with `typescript-eslint`, `eslint-plugin-import` (groups: builtin/external/internal/parent/sibling/index with blank lines between groups), `eslint-plugin-prettier`. Unused args prefix with `_`; `no-explicit-any` is a warning.
- **Husky**: `pre-commit` → `bun x --no -- lint-staged` (runs `lint:fix` + `format:fix` on staged `*.{js,ts,tsx}`); `commit-msg` → commitlint with conventional-commits (`commitlint.config.js`). Commit scopes must be snake-case; subject ≤ 72 chars.
- **Strict TS**: `noUncheckedIndexedAccess: true`; extends `@tsconfig/node24`.

## Notes for future work

- `src/services/` is empty — new features should land here (controllers + service classes backed by `BaseRepository` subclasses in `src/shared/repo/` or feature-local repos).
- The `@infra/*` path alias target (`./src/infrastructure/*`) does not match the real `src/infra/` directory. New code should import via the real path until the alias is fixed.
- A real Prisma client is expected under `src/shared/generated/` (per the `#prismagenerated` alias and tsconfig exclude) but is not yet committed. `src/infra/db/prisma.js` is referenced from a previous version of `server.ts` but is not present.
- No tests exist — adding a runner will require removing `**/*.test.ts`/`**/*.spec.ts` from `tsconfig.json`'s `exclude` and wiring a script in `package.json`.
