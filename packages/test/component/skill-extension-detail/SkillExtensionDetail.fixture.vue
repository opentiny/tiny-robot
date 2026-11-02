<script setup lang="ts">
import { ref } from 'vue'
import SkillExtensionDetail from '../../../components/src/skill-extension-detail/index.vue'
import type { SkillDefinition } from '../../../components/src/skill-import-form/index.type'
import type { SkillFileAction } from '../../../components/src/skill-extension-detail/index.type'

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
      path: 'references/lazy.md',
      kind: 'text' as const,
      resourceId: 'references/lazy.md',
      readText: async () => '# Lazy resource',
    },
    {
      path: 'references/readonly.md',
      kind: 'text' as const,
      resourceId: 'references/readonly.md',
      editable: false,
      text: '# Read only resource',
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

const editableDefinition = ref<SkillDefinition>({ ...definition })
const alternateDefinition: SkillDefinition = {
  name: 'alternate-skill',
  description: 'Alternate Skill',
  instructions: '# Alternate skill',
  resources: [
    {
      path: 'guide.md',
      kind: 'text',
      resourceId: 'guide.md',
      text: '# Guide',
    },
  ],
}
const switchableDefinition = ref<SkillDefinition>({ ...definition })
const fileActionLog = ref<SkillFileAction[]>([])

const saveDefinition = (nextDefinition: SkillDefinition) => {
  editableDefinition.value = nextDefinition
}

const handleFileAction = (action: SkillFileAction) => {
  fileActionLog.value = [...fileActionLog.value, action]
}

const switchDefinition = () => {
  switchableDefinition.value = alternateDefinition
}
</script>

<template>
  <button data-testid="switch-definition" type="button" @click="switchDefinition">切换 Skill</button>
  <output data-testid="file-action-log">
    {{ fileActionLog.map((action) => `${action.type}|${action.path}|${action.nextPath ?? ''}`).join('|') }}
  </output>
  <SkillExtensionDetail data-testid="detail" :definition="definition" updated-at="2026-07-10" />
  <SkillExtensionDetail data-testid="uncontrolled-detail" :definition="definition" />
  <SkillExtensionDetail data-testid="empty-detail" :definition="emptyDefinition" />
  <SkillExtensionDetail
    data-testid="many-resources-detail"
    :definition="manyResourcesDefinition"
    style="--tr-skill-extension-detail-content-max-height: 320px"
  />
  <SkillExtensionDetail
    data-testid="editable-detail"
    :definition="editableDefinition"
    mode="edit"
    @file-action="handleFileAction"
    @save="saveDefinition"
  />
  <SkillExtensionDetail data-testid="switchable-detail" :definition="switchableDefinition" mode="edit" />
</template>
