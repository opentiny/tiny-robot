<script setup lang="ts">
import SkillExtensionDetail from '../../../components/src/skill-extension-detail/index.vue'

const definition = {
  name: 'tiny-genui-skill',
  description: '生成 OpenTiny GenUI schema.json 时使用的 Skill。',
  instructions: '# 使用说明\n\n' + '仅输出符合约束的 GenUI schema。\n'.repeat(30),
  resources: [
    {
      path: 'references/schema.md',
      kind: 'text' as const,
      resourceId: 'references/schema.md',
      size: 1536,
      text: '# Schema',
    },
    {
      path: 'assets/example.png',
      kind: 'binary' as const,
      resourceId: 'assets/example.png',
      size: 2048,
      binary: new Uint8Array(),
    },
  ],
}

const emptyDefinition = {
  name: 'empty-skill',
  description: '',
  instructions: 'Follow the instructions.',
}

const manyResourcesDefinition = {
  ...definition,
  name: 'many-resources-skill',
  resources: Array.from({ length: 12 }, (_, index) => ({
    path: `references/file-${index + 1}.md`,
    kind: 'text' as const,
    resourceId: `references/file-${index + 1}.md`,
    text: 'Resource content',
  })),
}
</script>

<template>
  <SkillExtensionDetail data-testid="detail" :definition="definition" updated-at="2026-07-10" />
  <SkillExtensionDetail data-testid="empty-detail" :definition="emptyDefinition" />
  <SkillExtensionDetail
    data-testid="many-resources-detail"
    :definition="manyResourcesDefinition"
    style="--tr-skill-extension-detail-content-max-height: 320px"
  />
</template>
