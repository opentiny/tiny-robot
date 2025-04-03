import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [vue()],
  root: '.',
  build: {
    rollupOptions: {
      input:
        command === 'serve'
          ? {
              test: path.resolve(__dirname, 'test/index.html'),
            }
          : null,
    },
  },
}))
