export const skills = import.meta.glob('./**/*', {
  query: '?raw',      // 以原始文本形式导入，不经过模块解析
  import: 'default',  // 取模块的 default 导出（即文件内容字符串）
  eager: true         // 同步加载，避免异步等待
}) as Record<string, string>

export const tinyProOperatorSkillText = skills['./tiny-pro-operator/SKILL.md'] ?? ''
