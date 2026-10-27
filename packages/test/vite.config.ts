import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { vanillaThemePlugin } from '../components/scripts/vanilla-theme.mjs'

export default defineConfig({
  plugins: [vue(), vanillaThemePlugin()],
  server: {
    port: 3333,
    host: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
  },
})
