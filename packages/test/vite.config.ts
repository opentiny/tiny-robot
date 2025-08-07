import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3333,
    host: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@opentiny/tiny-robot': resolve(__dirname, '../components/src'),
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
})
