import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@opentiny/tiny-robot': fileURLToPath(new URL('../components/src', import.meta.url)),
    },
  },
})
