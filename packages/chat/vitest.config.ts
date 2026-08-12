import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
  resolve: {
    dedupe: ['vue'],
    alias: {
      vue: resolve(__dirname, 'node_modules/vue'),
      '@opentiny/tiny-robot-svgs': resolve(__dirname, 'test/fixtures/svgs.ts'),
    },
  },
})
