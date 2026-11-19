<script setup lang="ts">
import { computed, shallowRef } from 'vue'
import {
  TrModelSelector,
  type ModelSelectorSnapshot,
  type ModelSelectorFeatureValues,
  type ModelSelectorOption,
  type ModelSelectorTriggerTextContext,
} from '@opentiny/tiny-robot'
import Chat from '../../../chat/src/Chat.vue'
import { createProviderModelRuntime } from '../../../chat/src/runtime/provider/modelRuntime'
import { resolveProviderModels } from '../../../chat/src/runtime/provider/presets'
import type { ChatModelFeatureValueChangePayload, ChatRuntime } from '../../../chat/src/types'

const props = withDefaults(
  defineProps<{
    external?: boolean
    invalid?: boolean
    modelId?: string
    accept?: boolean
    footer?: boolean
    chat?: boolean
    pending?: boolean
    longTriggerText?: boolean
    shared?: boolean
    uncontrolled?: boolean
  }>(),
  { accept: true },
)
const values = shallowRef<ModelSelectorFeatureValues>({})
const selectedModelId = shallowRef('a')
const events = shallowRef<unknown[]>([])
const models: ModelSelectorOption[] = [
  {
    id: 'a',
    label: 'Model A',
    features: [
      {
        key: 'mode',
        label: '模式',
        type: 'select',
        defaultValue: 'off',
        options: [
          { value: 'off', label: '关闭' },
          { value: 'low', label: '低' },
          { value: 'high', label: '高' },
          { value: 'extra-high', label: '超高' },
          { value: 'blocked', label: '禁用', disabled: true },
        ],
      },
      { key: 'lookup', label: '查询', type: 'switch' },
      { key: 'locked', label: '锁定', type: 'switch', disabled: true },
      { key: 'empty', label: '空项', type: 'select', options: [] },
    ],
  },
  {
    id: 'b',
    label: 'Model B',
    features: props.shared
      ? [
          {
            key: 'mode',
            label: '模式',
            type: 'select',
            defaultValue: 'low',
            options: [
              { value: 'low', label: '低' },
              { value: 'high', label: '高' },
            ],
          },
          { key: 'stream', label: '流式输出', type: 'switch' },
        ]
      : [],
  },
]
const currentValues = computed(() =>
  props.invalid ? { mode: 'stale', lookup: 'stale' } : props.external ? { mode: 'high', lookup: true } : values.value,
)
function recordChatChange(payload: ChatModelFeatureValueChangePayload) {
  events.value = [...events.value, ['change', payload]]
}
function change(current: ModelSelectorSnapshot, previous: ModelSelectorSnapshot) {
  events.value = [...events.value, ['change', current, previous]]
  if (props.accept && !props.uncontrolled) values.value = current.featureValues
}
function renderTriggerText({ model, featureValues }: ModelSelectorTriggerTextContext) {
  if (props.longTriggerText && featureValues.mode === 'high') {
    return `${model.label} · 深度思考 · 联网检索 · 结构化回答 · 显示完整推理 · 自动生成参考链接`
  }
  const mode = model.features?.find((feature) => feature.key === 'mode')
  const label = mode?.type === 'select' && mode.options.find((option) => option.value === featureValues.mode)?.label
  return label && featureValues.mode !== 'off' ? `${model.label} ${label}` : model.label
}
const { model } = createProviderModelRuntime(resolveProviderModels([{ type: 'openai', models }]))
model.renderTriggerText = renderTriggerText
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
    @model-feature-value-change="recordChatChange"
  />
  <button v-if="pending" data-testid="complete-pending-update" @click="completePendingUpdate">完成更新</button>
  <TrModelSelector
    v-else
    :models="models"
    :model-value="props.modelId ?? selectedModelId"
    v-bind="props.uncontrolled ? {} : { featureValues: currentValues }"
    :render-trigger-text="renderTriggerText"
    :close-on-select="false"
    @update:model-value="selectedModelId = $event ?? 'a'"
    @change="change"
  >
    <template v-if="footer" #footer="scope"
      ><button :disabled="scope.disabled" @click="scope.setFeatureValue('lookup', true)">自定义查询</button></template
    >
  </TrModelSelector>
  <output data-testid="events">{{ JSON.stringify(events) }}</output>
</template>
