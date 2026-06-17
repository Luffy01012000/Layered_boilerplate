import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  test: {
    environment: 'node',
    include: [
      'src/tests/**/*.unit.test.ts',
      'src/tests/**/*.integration.test.ts',
      'src/tests/**/*.e2e.test.ts'
    ],
    exclude: ['dist/**', 'node_modules/**']
  }
})
