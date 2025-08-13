import vue from '@vitejs/plugin-vue'
import vuejsx from '@vitejs/plugin-vue-jsx'
import { readdirSync } from 'fs'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

// 构建入口
const entries = {
  index: './src/index.ts',
}

const componentWhitelist = ['assets', 'shared', 'styles']

// 为每个组件添加入口
const components = readdirSync(resolve(__dirname, 'src'), { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory() && !componentWhitelist.includes(dirent.name))
  .map((dirent) => dirent.name)
components.forEach((comp) => {
  entries[`${comp}/index`] = `./src/${comp}/index.ts`
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuejsx(),
    dts({
      outDir: 'dist',
      rollupTypes: true,
      entryRoot: 'src',
      tsconfigPath: './tsconfig.json',
    }),
  ],
  resolve: {
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es'],
      fileName: () => 'index.js',
    },
    minify: true,
    rollupOptions: {
      external: ['vue', 'vue-router', '@opentiny/vue', '@opentiny/tiny-robot-svgs'],
      input: entries,
      output: {
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return 'style.css'
          }
          return '[name][extname]'
        },
        preserveModules: false,
        exports: 'named',
        dir: 'dist',
      },
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
})
