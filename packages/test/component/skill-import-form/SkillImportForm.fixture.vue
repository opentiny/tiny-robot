<script setup lang="ts">
import { computed, ref } from 'vue'
import SkillImportForm from '../../../components/src/skill-import-form'
import type {
  SkillImportFormInput,
  SkillImportFormSource,
  SkillDefinition,
  SkillResolver,
} from '../../../components/src/skill-import-form/index.type'

type ResolverMode = 'success' | 'error' | 'pending' | 'race'

const props = defineProps<{ maxUploadSize?: number }>()

const source = ref<SkillImportFormSource>('local')
const resolverMode = ref<ResolverMode>('success')
const useDefaultResolver = ref(false)
const submitted = ref<SkillDefinition>()
const cancelCount = ref(0)
const resolverInputs = ref<SkillImportFormInput[]>([])
let releasePending: (() => void) | undefined

const summarizeInput = (value: SkillImportFormInput | undefined) => {
  if (!value) return ''
  if (value.source === 'github') return JSON.stringify(value)

  return JSON.stringify({
    source: value.source,
    files: value.files.map((file) => ({
      name: file.name,
      size: file.size,
      webkitRelativePath: file.webkitRelativePath,
    })),
  })
}

const resolveSkill: SkillResolver = async (input) => {
  resolverInputs.value.push(input)

  if (resolverMode.value === 'race' && input.source === 'local') {
    const root = input.files[0]?.webkitRelativePath.split('/')[0] ?? 'unknown'
    await new Promise((resolve) => setTimeout(resolve, root === 'slow-skill' ? 100 : 0))
    return {
      name: root,
      description: 'Resolved race fixture',
      instructions: '# Resolved',
    }
  }

  if (resolverMode.value === 'pending') {
    await new Promise<void>((resolve) => {
      releasePending = resolve
    })
  }

  if (resolverMode.value === 'error') throw new Error('SKILL.md 的 YAML 格式不正确')

  return {
    name: input.source === 'local' ? 'resolved-local' : 'resolved-github',
    description: 'Resolved by fixture',
    instructions: '# Resolved',
    metadata: { source: input.source },
  }
}

const resolverInputOutput = computed(() => summarizeInput(resolverInputs.value.at(-1)))
const submitOutput = computed(() => (submitted.value ? JSON.stringify(submitted.value) : ''))

const handleSubmit = (definition: SkillDefinition) => {
  submitted.value = definition
}
</script>

<template>
  <button data-testid="show-local" type="button" @click="source = 'local'">Show local</button>
  <button data-testid="show-github" type="button" @click="source = 'github'">Show GitHub</button>
  <button data-testid="use-default-resolver" type="button" @click="useDefaultResolver = true">
    Use default resolver
  </button>
  <button data-testid="set-resolver-success" type="button" @click="resolverMode = 'success'">Resolve success</button>
  <button data-testid="set-resolver-error" type="button" @click="resolverMode = 'error'">Resolve error</button>
  <button data-testid="set-resolver-pending" type="button" @click="resolverMode = 'pending'">Resolve pending</button>
  <button data-testid="set-resolver-race" type="button" @click="resolverMode = 'race'">Resolve race</button>
  <button data-testid="release-resolver" type="button" @click="releasePending?.()">Release resolver</button>

  <SkillImportForm
    :source="source"
    :max-upload-size="props.maxUploadSize"
    :resolve-skill="useDefaultResolver ? undefined : resolveSkill"
    @submit="handleSubmit"
    @cancel="cancelCount += 1"
  />

  <output data-testid="resolver-call-count">{{ resolverInputs.length }}</output>
  <output data-testid="resolver-input">{{ resolverInputOutput }}</output>
  <output data-testid="submit-output">{{ submitOutput }}</output>
  <output data-testid="cancel-count">{{ cancelCount }}</output>
</template>
