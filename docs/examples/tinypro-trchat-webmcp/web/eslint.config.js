import antfu from '@antfu/eslint-config'

export default antfu({
  ignores: [
    'dist',
    'node_modules',
    '*.min.js',
    '*.d.ts',
    'coverage',
    'public',
    'farm.config.ts',
    'webpack.config.cjs',
    'rspack.config.cjs',
    '.vscode/*',
  ],
  formatters: true,
  unocss: true,
  vue: true,
})
