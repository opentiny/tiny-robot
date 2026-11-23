<script setup lang="ts">
import { computed, ref } from 'vue'
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
      readBinary: async () => new TextEncoder().encode('# Schema'),
    },
    {
      path: 'references/lazy.md',
      kind: 'text' as const,
      resourceId: 'references/lazy.md',
      readText: async () => '# Lazy resource',
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
const externallyUpdatedDefinition = ref<SkillDefinition>({
  ...definition,
  resources: [...(definition.resources ?? [])],
})
const resourceIdentityLog = computed(() =>
  (editableDefinition.value.resources ?? []).map((resource) => `${resource.path}|${resource.resourceId}`).join('|'),
)
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
const singleFileFolderDefinition = ref<SkillDefinition>({
  name: 'single-file-folder-skill',
  description: 'Skill with a directory that starts with one file.',
  instructions: '# Single file folder skill',
  resources: [
    {
      path: 'references/only.md',
      kind: 'text',
      resourceId: 'references/only.md',
      text: '# Only file',
    },
  ],
})
const fileActionLog = ref<SkillFileAction[]>([])
const singleFileFolderDirectories = computed(() => singleFileFolderDefinition.value.directories?.join('|') ?? '')
const savedBinaryText = ref('')

const saveDefinition = (nextDefinition: SkillDefinition) => {
  editableDefinition.value = nextDefinition
  const schema = nextDefinition.resources?.find((resource) => resource.path === 'references/schema.md')
  void schema?.readBinary?.().then((bytes) => {
    savedBinaryText.value = new TextDecoder().decode(bytes)
  })
}

const handleFileAction = (action: SkillFileAction) => {
  fileActionLog.value = [...fileActionLog.value, action]
}

const switchDefinition = () => {
  switchableDefinition.value = alternateDefinition
}

const removeExternalResource = () => {
  externallyUpdatedDefinition.value = {
    ...externallyUpdatedDefinition.value,
    resources: (externallyUpdatedDefinition.value.resources ?? []).filter(
      (resource) => resource.resourceId !== 'references/schema.md',
    ),
  }
}

const refreshExternalResource = () => {
  externallyUpdatedDefinition.value = {
    ...externallyUpdatedDefinition.value,
    instructions: '# Refreshed instructions',
    resources: (externallyUpdatedDefinition.value.resources ?? []).map((resource) =>
      resource.resourceId === 'references/schema.md'
        ? {
            ...resource,
            text: '# Refreshed schema',
            readBinary: async () => new TextEncoder().encode('# Refreshed schema'),
          }
        : resource,
    ),
  }
}

const saveSingleFileFolderDefinition = (nextDefinition: SkillDefinition) => {
  singleFileFolderDefinition.value = nextDefinition
}
</script>

<template>
  <button data-testid="switch-definition" type="button" @click="switchDefinition">切换 Skill</button>
  <output data-testid="file-action-log">
    {{ fileActionLog.map((action) => `${action.type}|${action.path}|${action.nextPath ?? ''}`).join('|') }}
  </output>
  <output data-testid="resource-identity-log">{{ resourceIdentityLog }}</output>
  <output data-testid="single-file-folder-directories">{{ singleFileFolderDirectories }}</output>
  <output data-testid="saved-binary-text">{{ savedBinaryText }}</output>
  <button data-testid="remove-external-resource" type="button" @click="removeExternalResource">移除外部资源</button>
  <button data-testid="refresh-external-resource" type="button" @click="refreshExternalResource">刷新外部资源</button>
  <SkillExtensionDetail data-testid="detail" :definition="definition" updated-at="2026-07-10" />
  <SkillExtensionDetail data-testid="uncontrolled-detail" :definition="definition" mode="edit" />
  <SkillExtensionDetail data-testid="empty-detail" :definition="emptyDefinition" />
  <SkillExtensionDetail
    data-testid="many-resources-detail"
    :definition="manyResourcesDefinition"
    style="--tr-skill-extension-detail-content-min-height: 360px; --tr-skill-extension-detail-content-max-height: 420px"
  />
  <SkillExtensionDetail
    data-testid="editable-detail"
    :definition="editableDefinition"
    mode="edit"
    @file-action="handleFileAction"
    @save="saveDefinition"
  />
  <SkillExtensionDetail data-testid="external-update-detail" :definition="externallyUpdatedDefinition" mode="edit" />
  <SkillExtensionDetail data-testid="switchable-detail" :definition="switchableDefinition" mode="edit" />
  <SkillExtensionDetail
    data-testid="single-file-folder-detail"
    :definition="singleFileFolderDefinition"
    mode="edit"
    @save="saveSingleFileFolderDefinition"
  />
</template>
