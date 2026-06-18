import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true
  },
  test: {
    environment: 'node',
    setupFiles: ['./src/tests/setup.ts'],
    exclude: ['dist/**', 'node_modules/**']
  }
})
