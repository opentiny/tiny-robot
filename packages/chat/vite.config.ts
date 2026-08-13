import vue from '@vitejs/plugin-vue'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
    dts({
      outDir: 'dist',
      rollupTypes: true,
      entryRoot: 'src',
      tsconfigPath: resolve(__dirname, 'tsconfig.json'),
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [
        'vue',
        '@opentiny/tiny-robot',
        '@opentiny/tiny-robot-kit',
        '@opentiny/tiny-robot-svgs',
        '@modelcontextprotocol/sdk',
        '@modelcontextprotocol/sdk/client',
        '@modelcontextprotocol/sdk/client/streamableHttp.js',
        '@vueuse/core',
      ],
    },
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
})
