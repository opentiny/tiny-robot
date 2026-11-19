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
      '@opentiny/tiny-robot-kit': `https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot-kit@${tinyRobotVersion}/dist/index.mjs`,

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
      idb: 'https://cdn.jsdelivr.net/npm/idb@8/+esm',
      yaml: 'https://cdn.jsdelivr.net/npm/yaml@2/browser/index.min.js',

      // Tiptap 编辑器相关包 (用于 Sender 组件)
      // 使用 esm.sh CDN，自动处理子路径导入和依赖解析
      // 添加 ?external=vue 参数，避免 Vue 版本冲突
      '@tiptap/core': 'https://esm.sh/@tiptap/core@3.17.1',
      '@tiptap/vue-3': 'https://esm.sh/@tiptap/vue-3@3.17.1?external=vue',
      '@tiptap/pm/state': 'https://esm.sh/@tiptap/pm@3.17.1/state',
      '@tiptap/pm/view': 'https://esm.sh/@tiptap/pm@3.17.1/view',
      '@tiptap/pm/model': 'https://esm.sh/@tiptap/pm@3.17.1/model',
      '@tiptap/extension-document': 'https://esm.sh/@tiptap/extension-document@3.17.1',
      '@tiptap/extension-paragraph': 'https://esm.sh/@tiptap/extension-paragraph@3.17.1',
      '@tiptap/extension-text': 'https://esm.sh/@tiptap/extension-text@3.17.1',
      '@tiptap/extension-history': 'https://esm.sh/@tiptap/extension-history@3.17.1',
      '@tiptap/extension-placeholder': 'https://esm.sh/@tiptap/extension-placeholder@3.17.1',
      '@tiptap/extension-character-count': 'https://esm.sh/@tiptap/extension-character-count@3.17.1',

      ...extraImportsMap,
    },
  }

  return importMap
}
