<script setup lang="ts">
import { computed, onUnmounted, shallowRef } from 'vue'
import {
  TrChat,
  useChatRuntime,
  type ChatRuntimeActionErrorPayload,
  type ChatUIOptions,
} from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { modelProviders } from './shared/modelProviders'
import { createMockConversationStorage } from './shared/mockConversationStorage'

const ready = shallowRef(false)
const pending = shallowRef(false)
const title = shallowRef('项目问答')
const actionError = shallowRef('')
const runtime = useChatRuntime({
  modelProviders,
  conversation: {
    storage: createMockConversationStorage('tiny-robot-demo-runtime-conversations-v1', [
      {
        title: '项目介绍',
        messages: [
          { role: 'user', content: '这个项目提供什么功能？' },
          { role: 'assistant', content: '这里展示项目问答。切换到“使用帮助”，可查看另一组历史消息。' },
        ],
      },
      {
        title: '使用帮助',
        messages: [
          { role: 'user', content: '如何管理历史会话？' },
          { role: 'assistant', content: '点击左侧会话名称切换，通过会话菜单重命名或删除。' },
        ],
      },
    ]),
    // 本地示例即时保存，避免快速切换会话时丢失刚生成的消息。
    autoSaveThrottle: 0,
    async onLoad(conversations) {
      try {
        if (conversations.length) await runtime.actions.switchConversation(conversations[0].id)
      } catch (error) {
        actionError.value = `恢复会话失败：${error instanceof Error ? error.message : String(error)}`
      } finally {
        ready.value = true
      }
    },
  },
  composer: { disabled: computed(() => !ready.value || pending.value) },
})
const ui: ChatUIOptions = {
  layout: { leftAside: { width: 240, defaultOpen: true }, rightAside: false },
  history: { showRenameControls: true },
  welcome: false,
  prompts: false,
  model: false,
}
const active = computed(() => runtime.activeConversation.value)
const processing = computed(() => active.value?.requestState === 'processing')
const busy = computed(() => !ready.value || pending.value || processing.value)

async function createConversation() {
  if (busy.value) return
  pending.value = true
  actionError.value = ''
  try {
    await runtime.actions.createConversation({ title: title.value.trim() || '新对话' })
  } catch (error) {
    actionError.value = `操作失败：${error instanceof Error ? error.message : String(error)}`
  } finally {
    pending.value = false
  }
}

function handleActionError({ error }: ChatRuntimeActionErrorPayload) {
  actionError.value = `操作失败：${error instanceof Error ? error.message : String(error)}`
}

onUnmounted(() => {
  void Promise.resolve(runtime.actions.abort?.()).catch(() => undefined)
})
</script>

<template>
  <section class="runtime-demo">
    <div class="runtime-demo__controls">
      <label class="runtime-demo__label">
        会话标题
        <input v-model="title" class="runtime-demo__input" :disabled="busy" />
      </label>
      <button class="runtime-demo__button" type="button" :disabled="busy" @click="createConversation">
        立即创建会话
      </button>
    </div>
    <p v-if="actionError" class="runtime-demo__status" role="alert">{{ actionError }}</p>
    <div class="runtime-demo__chat runtime-conversations-demo__chat">
      <TrChat :runtime="runtime" :ui="ui" @runtime-action-error="handleActionError" />
    </div>
  </section>
</template>

<style scoped src="./shared/runtime-demo.css"></style>

<style scoped>
.runtime-conversations-demo__chat {
  --tr-history-item-selected-bg: var(--tr-color-primary-light);
  --tr-history-item-selected-color: var(--tr-color-primary);
}
</style>
