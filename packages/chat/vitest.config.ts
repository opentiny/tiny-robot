import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: /^@opentiny\/tiny-robot$/,
        replacement: fileURLToPath(new URL('../components/src/model-selector/featureFields.ts', import.meta.url)),
      },
      {
        find: /^@opentiny\/tiny-robot-svgs$/,
        replacement: fileURLToPath(new URL('../svgs/src/index.ts', import.meta.url)),
      },
    ],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
