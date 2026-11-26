import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'vite'
import svgLoader from 'vite-svg-loader'
import { quillMentionOptimizePlugin, quillMentionRegisterPlugin } from './plugin/quill-mention.ts'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    svgLoader({ svgoConfig: {} }),
    quillMentionRegisterPlugin(),
  ],
  build: {
    outDir: resolve(import.meta.dirname, '../dist/vue-pro/pages'),
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(import.meta.dirname, '../src'),
      },
      {
        find: 'assets',
        replacement: resolve(import.meta.dirname, '../src/assets'),
      },
      {
        find: 'vue-i18n',
        replacement: 'vue-i18n/dist/vue-i18n.esm-bundler.js', // Resolve the i18n warning issue
      },
      {
        find: 'vue',
        replacement: 'vue/dist/vue.esm-bundler.js', // compile template
      },
    ],
    extensions: ['.ts', '.js'],
  },
  define: {
    'process.env': {},
  },
  optimizeDeps: {
    rolldownOptions: {
      plugins: [quillMentionOptimizePlugin()],
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          hack: `true; @import (reference) "${resolve(
            'src/assets/style/breakpoint.less',
          )}";`,
        },
        javascriptEnabled: true,
      },
    },
  },
})
