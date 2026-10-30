<script setup lang="ts">
import { computed } from 'vue'
import { IconSearch, IconAtom } from '@opentiny/tiny-robot-svgs'
import ChatToolbarButton from './ChatToolbarButton.vue'
import type { ChatBuiltInModelFeature, ChatLabels, ChatModelView } from '../../types'

const props = defineProps<{
  id: ChatBuiltInModelFeature
  model: ChatModelView
  labels: ChatLabels
  disabled?: boolean
}>()

const emit = defineEmits<{
  updateFeature: [payload: { id: ChatBuiltInModelFeature; enabled: boolean }]
}>()

const featureLabels: Record<ChatBuiltInModelFeature, keyof ChatLabels> = {
  thinking: 'thinkingFeature',
  search: 'searchFeature',
}
const featureIcons: Record<ChatBuiltInModelFeature, typeof IconAtom> = {
  thinking: IconAtom,
  search: IconSearch,
}

const selectedModel = computed(() => props.model.options?.find((model) => model.id === props.model.selectedId))

const disabled = computed(
  () =>
    props.disabled === true ||
    selectedModel.value?.capabilities?.[props.id] !== true ||
    props.model.pendingFeatureIds?.includes(props.id) === true ||
    (props.id === 'thinking' && selectedModel.value?.thinkingRequired === true),
)

function toggleFeature() {
  if (disabled.value) return
  emit('updateFeature', { id: props.id, enabled: !props.model.features?.[props.id] })
}
</script>

<template>
  <ChatToolbarButton
    :label="labels[featureLabels[id]]"
    :icon="featureIcons[id]"
    :active="model.features?.[id] === true"
    :disabled="disabled"
    @click="toggleFeature"
  />
</template>
