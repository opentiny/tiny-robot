import { ImportMap } from '@vue/repl'

interface ImportMapOptions {
  tinyRobotVersion: string
  builtinImportMap?: ImportMap
  extraImports?: Record<string, string>
}

export function generateImportMap(options: ImportMapOptions) {
  const { tinyRobotVersion, builtinImportMap, extraImports } = options

  const extraImportsMap = Object.entries(extraImports || {})
    .map(([pkg, version]) => {
      return {
        [pkg]: `https://cdn.jsdelivr.net/npm/${pkg}@${version}`,
      }
    })
    .reduce((acc, curr) => {
      return { ...acc, ...curr }
    }, {})

  const importMap: ImportMap = {
    imports: {
      ...builtinImportMap?.imports,
      // TinyRobot 相关包 - 使用统一版本号
      '@opentiny/tiny-robot': `https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot@${tinyRobotVersion}/dist/index.min.js`,
      '@opentiny/tiny-robot-svgs': `https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot-svgs@${tinyRobotVersion}/dist/tiny-robot-svgs.min.js`,
      '@opentiny/tiny-robot-kit': `https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot-kit@${tinyRobotVersion}/+esm`,

      // TinyVue 相关包
      '@opentiny/vue': 'https://cdn.jsdelivr.net/npm/@opentiny/vue-runtime@3/dist3/tiny-vue-pc.mjs',
      '@opentiny/vue-icon': 'https://cdn.jsdelivr.net/npm/@opentiny/vue-runtime@3/dist3/tiny-vue-icon.mjs',
      '@opentiny/vue-locale': 'https://cdn.jsdelivr.net/npm/@opentiny/vue-runtime@3/dist3/tiny-vue-locale.mjs',
      '@opentiny/vue-common': 'https://cdn.jsdelivr.net/npm/@opentiny/vue-runtime@3/dist3/tiny-vue-common.mjs',

      // 其他常用库
      '@vueuse/core': 'https://cdn.jsdelivr.net/npm/@vueuse/core@13/index.iife.min.js',
      dompurify: 'https://cdn.jsdelivr.net/npm/dompurify@3/dist/purify.min.js',
      'markdown-it': 'https://cdn.jsdelivr.net/npm/markdown-it@14/dist/markdown-it.min.js',
      echarts: 'https://cdn.jsdelivr.net/npm/echarts@5/dist/echarts.min.js',

      ...extraImportsMap,
    },
  }

  return importMap
}
