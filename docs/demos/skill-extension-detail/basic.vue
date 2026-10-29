<script setup lang="ts">
import { TrSkillExtensionDetail } from '@opentiny/tiny-robot'
import type { SkillDefinition } from '@opentiny/tiny-robot'

const definition: SkillDefinition = {
  name: 'document-summary',
  description: '将长文档整理为摘要。',
  instructions: [
    '# 文档摘要',
    '',
    '先阅读文档，再列出三条要点和待办事项。',
    '',
    '## 输出格式',
    '- 摘要',
    '- 待办事项',
  ].join('\n'),
  resources: [
    {
      path: 'references/style.md',
      kind: 'text',
      resourceId: 'references/style.md',
      size: 32,
      text: '# 摘要格式',
    },
    {
      path: 'assets/example.png',
      kind: 'binary',
      resourceId: 'assets/example.png',
      size: 4,
      binary: new Uint8Array([137, 80, 78, 71]),
    },
  ],
}
</script>

<template>
  <tr-skill-extension-detail :definition="definition" updated-at="2026-07-10" />
</template>
