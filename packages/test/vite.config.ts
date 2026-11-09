import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { vanillaThemePlugin } from '../components/scripts/vanilla-theme.mjs'

export default defineConfig({
  plugins: [vue(), vueJsx(), vanillaThemePlugin()],
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
