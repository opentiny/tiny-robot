<script setup lang="ts">
import { computed, onUnmounted, shallowRef } from 'vue'
import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'
import {
  TrChat,
  useChatRuntime,
  type ChatRuntimeActionErrorPayload,
  type ChatUIOptions,
} from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { modelProviders } from './shared/modelProviders'

const ready = shallowRef(false)
const runtime = useChatRuntime({
  modelProviders,
  conversation: {
    storage: localStorageStrategyFactory({ key: 'tiny-robot-demo-runtime-actions-v1' }),
    autoSaveThrottle: 0,
    async onLoad(conversations) {
      try {
        const latest = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)[0]
        if (latest) await runtime.actions.switchConversation(latest.id)
      } catch (error) {
        actionError.value = `恢复会话失败：${error instanceof Error ? error.message : String(error)}`
      } finally {
        ready.value = true
      }
    },
  },
  beforeSend() {
    actionError.value = ''
    return 'continue'
  },
})
const ui: ChatUIOptions = {
  layout: { leftAside: false, rightAside: false },
  welcome: false,
  prompts: false,
  model: false,
}
const actionError = shallowRef('')
const pending = shallowRef(false)
const processing = computed(() => runtime.activeConversation.value?.requestState === 'processing')
const status = computed(() => {
  switch (runtime.activeConversation.value?.requestState) {
    case 'processing':
      return '正在生成'
    case 'completed':
      return '已完成'
    case 'aborted':
      return '已停止'
    case 'error':
      return '请求失败'
    default:
      return '等待发送'
  }
})

async function send(text: string) {
  if (!ready.value || pending.value || processing.value) return
  pending.value = true
  try {
    await runtime.actions.send({ text })
  } catch (error) {
    actionError.value = `发送失败：${error instanceof Error ? error.message : String(error)}`
  } finally {
    pending.value = false
  }
}

async function stop() {
  actionError.value = ''
  try {
    await runtime.actions.abort?.()
  } catch (error) {
    actionError.value = `停止失败：${error instanceof Error ? error.message : String(error)}`
  }
}

function handleActionError({ error }: ChatRuntimeActionErrorPayload) {
  actionError.value = `界面操作失败：${error instanceof Error ? error.message : String(error)}`
}

onUnmounted(() => {
  void Promise.resolve(runtime.actions.abort?.()).catch(() => undefined)
})
</script>

<template>
  <section class="runtime-demo">
    <div class="runtime-demo__controls">
      <button
        class="runtime-demo__button"
        type="button"
        :disabled="!ready || pending || processing"
        @click="send('介绍一下这个项目')"
      >
        发送预设问题
      </button>
      <button class="runtime-demo__button" type="button" :disabled="!processing" @click="stop">停止回答</button>
    </div>
    <p class="runtime-demo__status" role="status">{{ status }}</p>
    <p v-if="actionError" class="runtime-demo__status" role="alert">{{ actionError }}</p>
    <div class="runtime-demo__chat">
      <TrChat v-if="ready" :runtime="runtime" :ui="ui" @runtime-action-error="handleActionError" />
    </div>
  </section>
</template>

<style scoped src="./shared/runtime-demo.css"></style>
