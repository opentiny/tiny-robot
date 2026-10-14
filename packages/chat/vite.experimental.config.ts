import vue from '@vitejs/plugin-vue'
import { rmSync } from 'node:fs'
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
      exclude: [
        'src/experimental/**/*.test.*',
        'src/experimental/**/*.ce.vue',
        'src/experimental/elementHost.ts',
        'src/experimental/elementRenderers.ts',
      ],
      tsconfigPath: resolve(__dirname, 'tsconfig.experimental.json'),
      beforeWriteFile(filePath, content) {
        return {
          filePath: filePath.replace(/index\.d\.ts$/, 'experimental.d.ts'),
          content: content
            .replace(/from ['"]\.\.\/types['"]/g, "from '..'")
            .replace(
              /from ['"]\.\.\/\.\.\/(?:types|runtime\/(?:useChatRuntime|mcp\/types|provider))['"]/g,
              "from '../..'",
            ),
        }
      },
    }),
    {
      name: 'remove-internal-experimental-declarations',
      closeBundle() {
        for (const file of [
          'TrChatElement.ce.vue.d.ts',
          'TrChatUIElement.ce.vue.d.ts',
          'elementHost.d.ts',
          'elementRenderers.d.ts',
        ]) {
          rmSync(resolve(__dirname, 'dist', file), { force: true })
        }
      },
    },
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
          assetInfo.name === 'style.css' ? 'web-component.css' : 'assets/[name]-[hash][extname]',
      },
    },
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: false,
  },
})
