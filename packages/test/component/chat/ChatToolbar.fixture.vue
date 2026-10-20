<script setup lang="ts">
import { computed, reactive, shallowRef } from 'vue'
import { IconThink } from '@opentiny/tiny-robot-svgs'
import TrChat from '../../../chat/src/Chat.vue'
import TrChatUI from '../../../chat/src/ChatUI.vue'
import type {
  ChatModelFeatureChangePayload,
  ChatModelView,
  ChatRuntime,
  ChatSenderOptions,
  ChatSenderToolbarItem,
  ChatUIOptions,
} from '../../../chat/src/types'

const props = withDefaults(
  defineProps<{
    entry?: 'ui' | 'runtime'
    preset?: 'default' | 'mixed' | 'empty' | 'hidden' | 'custom-only' | 'append' | 'transform' | 'callback-empty'
    hostWidth?: number
    disabled?: boolean
    itemDisabled?: boolean
    hasModel?: boolean
    modelId?: string | null
    pending?: boolean
    thinkingRequired?: boolean
    modelVisible?: boolean
    mcpVisible?: boolean
  }>(),
  {
    entry: 'ui',
    preset: 'default',
    hasModel: true,
    modelId: 'supported',
    modelVisible: true,
    mcpVisible: true,
  },
)

const features = reactive({ thinking: true, search: false })
const featureChanges = shallowRef(0)
const customClicks = shallowRef(0)
const customActive = shallowRef(false)
const panelChanges = shallowRef(0)
const input = shallowRef('test message')
const model = computed<ChatModelView>(() => ({
  options: [
    {
      id: 'supported',
      label: 'Supported model',
      capabilities: { thinking: true, search: true },
      thinkingRequired: props.thinkingRequired,
    },
    { id: 'unsupported', label: 'Unsupported model' },
  ],
  selectedId: props.modelId,
  features,
  pendingFeatureIds: props.pending ? ['thinking', 'search'] : [],
}))

function handleFeatureChange(payload: ChatModelFeatureChangePayload) {
  features[payload.featureId] = payload.enabled
  featureChanges.value++
}

const ui = computed<ChatUIOptions>(() => {
  const custom: ChatSenderToolbarItem = {
    type: 'custom',
    id: 'generate-ui',
    label: 'Generate UI',
    icon: props.preset === 'custom-only' ? undefined : IconThink,
    active: customActive.value,
    disabled: props.itemDisabled,
    onClick: () => {
      customClicks.value++
      customActive.value = !customActive.value
    },
  }
  let toolbar: ChatSenderOptions['toolbar']
  if (props.preset === 'mixed' || props.preset === 'hidden') {
    const items: ChatSenderToolbarItem[] = [
      { type: 'builtin', id: 'mcp' },
      custom,
      { type: 'builtin', id: 'model' },
      { type: 'builtin', id: 'search' },
      { type: 'builtin', id: 'thinking' },
    ]
    toolbar = items.map((item) => ({ ...item, visible: props.preset !== 'hidden', disabled: props.itemDisabled }))
  } else if (props.preset === 'empty') {
    toolbar = []
  } else if (props.preset === 'custom-only') {
    toolbar = [custom]
  } else if (props.preset === 'append') {
    toolbar = (defaults) => [...defaults, custom]
  } else if (props.preset === 'transform') {
    toolbar = (defaults) => [
      ...defaults
        .slice()
        .reverse()
        .map((item) => ({ ...item, visible: item.id !== 'search', disabled: props.itemDisabled })),
      ...defaults,
      custom,
    ]
  } else if (props.preset === 'callback-empty') {
    toolbar = () => []
  }
  return {
    history: false,
    welcome: false,
    layout: { leftAside: false },
    model: props.modelVisible ? {} : false,
    mcp: props.mcpVisible ? {} : false,
    sender: { toolbar, showWordLimit: false },
  }
})

const data = computed(() => ({
  sender: { disabled: props.disabled },
  model: props.hasModel ? model.value : undefined,
  mcp: { servers: [] },
}))

const runtime = computed<ChatRuntime>(() => ({
  conversations: shallowRef([]),
  activeConversation: shallowRef(null),
  composer: {
    disabled: computed(() => props.disabled === true),
    model: props.hasModel
      ? {
          options: computed(() => model.value.options ?? []),
          selectedId: computed(() => props.modelId),
          features: computed(() => features),
          select: () => {},
          setFeature: async (featureId, enabled) => {
            if (props.pending) await new Promise<void>(() => {})
            handleFeatureChange({ featureId, enabled })
          },
          setReasoningEffort: () => {},
        }
      : undefined,
    mcp: {
      servers: shallowRef([]),
      tools: shallowRef({}),
      addServer: () => {},
      removeServer: () => {},
      setServerEnabled: () => {},
      setToolEnabled: () => {},
    },
  },
  actions: {
    send: async () => true,
    clearActiveConversation: () => {},
    createConversation: () => {},
    switchConversation: () => {},
    renameConversation: () => {},
    deleteConversation: () => {},
  },
}))
</script>

<template>
  <main>
    <div class="toolbar-host" :style="props.hostWidth === undefined ? undefined : { width: `${props.hostWidth}px` }">
      <TrChatUI
        v-if="entry === 'ui'"
        v-model:input-value="input"
        :data="data"
        :ui="ui"
        @model-feature-change="handleFeatureChange"
        @update:right-aside-open="panelChanges++"
      >
        <template #sender-footer><span data-testid="legacy-footer">Legacy footer</span></template>
        <template #sender-footer-right><span data-testid="legacy-footer-right">Right footer</span></template>
      </TrChatUI>
      <TrChat v-else :runtime="runtime" :ui="ui" @update:right-aside-open="panelChanges++">
        <template #sender-footer><span data-testid="legacy-footer">Legacy footer</span></template>
        <template #sender-footer-right><span data-testid="legacy-footer-right">Right footer</span></template>
      </TrChat>
    </div>
    <output data-testid="feature-changes">{{ featureChanges }}</output>
    <output data-testid="custom-clicks">{{ customClicks }}</output>
    <output data-testid="panel-changes">{{ panelChanges }}</output>
    <output data-testid="feature-state">{{ JSON.stringify(features) }}</output>
  </main>
</template>

<style scoped>
.toolbar-host {
  width: 900px;
  height: 500px;
}
</style>
