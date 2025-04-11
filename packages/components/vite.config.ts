import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuejsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vuejsx(), dts()],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es'],
    },
    minify: true,
    rollupOptions: {
      external: ['vue', 'vue-router'],
      input: {
        index: './src/index.ts',
      },
      output: [
        {
          format: 'es',
          entryFileNames: '[name].js',
          preserveModules: true,
          exports: 'named',
          dir: 'dist',
        },
      ],
    },
    outDir: 'dist',
  },
})
