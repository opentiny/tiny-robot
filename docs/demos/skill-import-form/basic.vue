<script setup lang="ts">
import { TrSkillExtensionDetail } from '@opentiny/tiny-robot'
import type { SkillDefinition } from '@opentiny/tiny-robot'

const definition: SkillDefinition = {
  name: 'example-skill',
  description: '一个不依赖网络的最小 Skill 定义。',
  instructions: '# 使用说明\n\n先阅读输入，再输出三条重点。',
  resources: [
    {
      path: 'references/format.md',
      kind: 'text',
      resourceId: 'references/format.md',
      text: '# 输出格式\n\n先给结论，再列出依据。',
    },
  ],
}
</script>

<template>
  <section>
    <p>这个示例直接传入一个内联的 <code>SkillDefinition</code>，不需要网络或导入器。</p>
    <tr-skill-extension-detail :definition="definition" />
  </section>
</template>
