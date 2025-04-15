import { defineConfig, type PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue() as PluginOption],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'TinyRobotSvgs',
      fileName: 'tiny-robot-svgs',
      formats: ['es'],
    },
    rollupOptions: {
      external: ['vue'],
    },
    outDir: 'dist',
  },
})
