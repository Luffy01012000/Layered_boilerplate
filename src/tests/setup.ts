process.env.DATABASE_URL ??=
  'postgresql://postgres:postgres@localhost:5432/postgres?schema=public'
process.env.JWT_SECRET ??= 'test-secret'
process.env.JWT_EXPIRES_IN ??= '1h'
