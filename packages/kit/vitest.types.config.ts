import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [],
    typecheck: { enabled: true, only: true, include: ['src/**/*.test-d.ts'], ignoreSourceErrors: true },
  },
})
