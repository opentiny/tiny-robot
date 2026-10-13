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
      entryRoot: 'src/experimental',
      include: ['src/experimental'],
      tsconfigPath: resolve(__dirname, 'tsconfig.experimental.json'),
      beforeWriteFile(filePath, content) {
        return {
          filePath: filePath.replace(/index\.d\.ts$/, 'experimental.d.ts'),
          content,
        }
      },
    }),
  ],
  build: {
    lib: {
      entry: {
        experimental: resolve(__dirname, 'src/experimental/index.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) =>
          assetInfo.name === 'style.css' ? 'experimental.css' : 'assets/[name]-[hash][extname]',
      },
    },
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: false,
  },
})
