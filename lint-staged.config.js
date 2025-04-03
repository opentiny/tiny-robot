export default {
  '*.{ts,mts,tsx,vue}': [
    'prettier --write',
    'eslint --fix',
    // lint-staged默认只对修改了的文件执行命令，这里使用函数返回命令字符串，是全量执行，是因为type-check依赖tsconfig配置
    () => 'pnpm type-check',
  ],
}
