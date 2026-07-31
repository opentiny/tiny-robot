import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

const workspaceRoot = resolve(import.meta.dirname, '..')
const chatRoot = resolve(workspaceRoot, 'chat/src')

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': chatRoot,
      '@opentiny/tiny-robot-chat': resolve(chatRoot, 'index.ts'),
    },
  },
  server: {
    fs: {
      allow: [workspaceRoot],
    },
    proxy: {
      '/modelcontextprotocol-mcp': {
        target: 'https://modelcontextprotocol.io/mcp',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/modelcontextprotocol-mcp/, ''),
      },
    },
  },
  optimizeDeps: {
    exclude: ['@opentiny/tiny-robot-chat'],
  },
})
