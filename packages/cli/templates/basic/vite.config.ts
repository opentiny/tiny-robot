import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'node:path'

const workspaceRoot = resolve(import.meta.dirname, '..')

export default defineConfig({
  plugins: [vue()],
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
})
