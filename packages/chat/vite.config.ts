import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    vue(),
    dts({
      outDir: 'dist',
      rollupTypes: true,
      entryRoot: 'src',
      tsconfigPath: './tsconfig.json',
    }),
  ],
  build: {
    lib: {
      entry: {
        index: './src/index.ts',
        internal: './src/internal.ts',
      },
      formats: ['es'],
    },
    cssMinify: true,
    minify: true,
    rollupOptions: {
      external: ['vue', '@opentiny/tiny-robot', '@opentiny/tiny-robot-kit', 'markstream-vue'],
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css'
          return '[name][extname]'
        },
        preserveModules: false,
        exports: 'named',
        dir: 'dist',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
  },
})
