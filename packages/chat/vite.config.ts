import vue from '@vitejs/plugin-vue'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  root: resolve(__dirname, 'demo'),
  server: {
    port: 5185,
  },
  preview: {
    port: 5186,
  },
  build: {
    outDir: resolve(__dirname, 'demo/dist'),
    emptyOutDir: true,
  },
})
