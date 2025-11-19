import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@opentiny/tiny-robot': fileURLToPath(new URL('../../packages/components/src', import.meta.url)),
    },
  },
})
