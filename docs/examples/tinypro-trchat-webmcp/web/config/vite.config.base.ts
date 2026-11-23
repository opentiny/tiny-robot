import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import UnoCSS from 'unocss/vite'
import { defineConfig, loadEnv } from 'vite'
import svgLoader from 'vite-svg-loader'
import { quillMentionOptimizePlugin, quillMentionRegisterPlugin } from './plugin/quill-mention.ts'

// npm workspaces 会把依赖提升到 monorepo 根目录，web/node_modules 下不一定存在，
// 通过 node 解析定位包真实目录，兼容 npm / pnpm 两种安装方式
const localRequire = createRequire(import.meta.url)
const resolveLocalPackage = (name: string) =>
  dirname(localRequire.resolve(`${name}/package.json`))

const config = {
  plugins: [
    vue(),
    vueJsx(),
    svgLoader({ svgoConfig: {} }),
    UnoCSS(),
    quillMentionRegisterPlugin(),
  ],
  build: {
    outDir: resolve(import.meta.dirname, loadEnv('', process.cwd()).VITE_OUT_DIR || '../dist'),
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
      {
        find: '@opentiny/vue-icon',
        replacement: resolveLocalPackage('@opentiny/vue-icon'), // compile template
      },
      {
        find: '@opentiny/vue-theme',
        replacement: resolveLocalPackage('@opentiny/vue-theme'),
      },
    ],
    extensions: ['.ts', '.js', '.css'],
    preserveSymlinks: false,
  },
  define: {
    BUILD_TOOLS: '\'VITE\'',
  },
  optimizeDeps: {
    rolldownOptions: {
      resolve: {
        extensions: ['.ts', '.js', '.css'],
      },
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
}
export default defineConfig(config)
