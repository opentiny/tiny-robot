<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import {
  TrModelSelector,
  type ModelSelectorFeatureChange,
  type ModelSelectorFeatureValues,
  type ModelSelectorOption,
} from '@opentiny/tiny-robot'
import Chat from '../../../chat/src/Chat.vue'
import { createProviderModelRuntime } from '../../../chat/src/runtime/provider/modelRuntime'
import { resolveProviderModels } from '../../../chat/src/runtime/provider/presets'
import type { ChatRuntime } from '../../../chat/src/types'

const props = withDefaults(
  defineProps<{
    external?: boolean
    invalid?: boolean
    modelId?: string
    accept?: boolean
    footer?: boolean
    chat?: boolean
    pending?: boolean
  }>(),
  { accept: true },
)
const values = shallowRef<ModelSelectorFeatureValues>({})
const selectedModelId = shallowRef('a')
const events = shallowRef<unknown[]>([])
const models: ModelSelectorOption[] = [
  {
    value: 'a',
    label: 'Model A',
    fields: [
      {
        key: 'mode',
        label: '模式',
        type: 'select',
        defaultValue: 'off',
        summary: true,
        options: [
          { value: 'off', label: '关闭', summary: false },
          { value: 'high', label: '高' },
          { value: 'blocked', label: '禁用', disabled: true },
        ],
      },
      { key: 'lookup', label: '查询', type: 'switch' },
      { key: 'locked', label: '锁定', type: 'switch', disabled: true },
      { key: 'empty', label: '空项', type: 'select', options: [] },
    ],
  },
  { value: 'b', label: 'Model B', fields: [] },
]
const currentValues = computed(() =>
  props.invalid ? { mode: 'stale', lookup: 'stale' } : props.external ? { mode: 'high', lookup: true } : values.value,
)
function update(next: ModelSelectorFeatureValues) {
  events.value = [...events.value, ['update', next]]
  if (props.accept !== false) values.value = next
}
function change(next: ModelSelectorFeatureChange) {
  events.value = [...events.value, ['change', next]]
}
const { model } = createProviderModelRuntime(
  resolveProviderModels([
    { type: 'openai', models: models.map((item) => ({ id: item.value, label: item.label, fields: item.fields })) },
  ]),
)
let resolvePendingUpdate: (() => void) | undefined
if (props.pending) {
  const setFeatureValue = model.setFeatureValue
  model.setFeatureValue = async (change) => {
    await new Promise<void>((resolve) => {
      resolvePendingUpdate = resolve
    })
    await setFeatureValue?.(change)
  }
}
function completePendingUpdate() {
  resolvePendingUpdate?.()
}
const runtime: ChatRuntime = {
  conversations: shallowRef([]),
  activeConversation: shallowRef(null),
  composer: { model },
  actions: {
    send: async () => true,
    clearActiveConversation() {},
    createConversation() {},
    switchConversation() {},
    renameConversation() {},
    deleteConversation() {},
  },
}
</script>

<template>
  <Chat
    v-if="chat"
    :runtime="runtime"
    :ui="{ history: false, welcome: false, layout: { leftAside: false } }"
    @model-feature-value-change="change"
  />
  <button v-if="pending" data-testid="complete-pending-update" @click="completePendingUpdate">完成更新</button>
  <TrModelSelector
    v-else
    :models="models"
    :model-value="props.modelId ?? selectedModelId"
    :feature-values="currentValues"
    :close-on-select="false"
    @update:model-value="selectedModelId = $event ?? 'a'"
    @update:feature-values="update"
    @feature-change="change"
  >
    <template v-if="footer" #footer="scope"
      ><button :disabled="scope.disabled" @click="scope.setFeatureValue('lookup', true)">自定义查询</button></template
    >
  </TrModelSelector>
  <output data-testid="events">{{ JSON.stringify(events) }}</output>
</template>
