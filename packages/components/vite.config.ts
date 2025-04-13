import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuejsx from '@vitejs/plugin-vue-jsx'
import dts from 'vite-plugin-dts'
import importPlugin from '@opentiny/vue-vite-import'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuejsx(),
    dts(),
    importPlugin(
      [
        {
          libraryName: '@opentiny/vue',
        },
        {
          libraryName: `@opentiny/vue-icon`,
          customName: (name) => {
            return `@opentiny/vue-icon/lib/${name.replace(/^icon-/, '')}.js`
          },
        },
      ],
      'pc', // 此配置非必选，按需配置 (pc|mobile|mobile-first)
    ),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  build: {
    lib: {
      entry: './src/index.ts',
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
