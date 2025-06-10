import vue from '@vitejs/plugin-vue'
import path from 'path'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: { compilerOptions: { isCustomElement: (tag) => tag.startsWith('sender-') } },
    }),
  ],
  resolve: {
    alias: {
      '@opentiny/tiny-robot': path.resolve(__dirname, '../../packages/components/src'),
      '@opentiny/tiny-robot-style': path.resolve(__dirname, '../../packages/components/dist/style.css'),
    },
  },
})
