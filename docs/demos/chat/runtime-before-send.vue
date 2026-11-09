<script setup lang="ts">
import { onUnmounted, shallowRef } from 'vue'
import { localStorageStrategyFactory } from '@opentiny/tiny-robot-kit'
import {
  TrChat,
  useChatRuntime,
  type ChatRuntimeActionErrorPayload,
  type ChatUIOptions,
} from '@opentiny/tiny-robot-chat'
import '@opentiny/tiny-robot-chat/dist/style.css'
import { modelProviders } from './shared/modelProviders'

const loggedIn = shallowRef(false)
const ready = shallowRef(false)
const status = shallowRef('先输入问题并发送，再勾选“已登录”重试。')
const runtime = useChatRuntime({
  modelProviders,
  conversation: {
    storage: localStorageStrategyFactory({ key: 'tiny-robot-demo-runtime-before-send-v1' }),
    autoSaveThrottle: 0,
    async onLoad(conversations) {
      try {
        const latest = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)[0]
        if (latest) await runtime.actions.switchConversation(latest.id)
      } catch (error) {
        status.value = `恢复会话失败：${error instanceof Error ? error.message : String(error)}`
      } finally {
        ready.value = true
      }
    },
  },
  beforeSend() {
    if (!loggedIn.value) {
      status.value = '检查返回 reject：请先登录；输入保留，不追加消息。'
      return 'reject'
    }
    status.value = '检查返回 continue：允许发送。'
    return 'continue'
  },
})
const ui: ChatUIOptions = {
  layout: { leftAside: false, rightAside: false },
  welcome: false,
  prompts: false,
  model: false,
}

function handleActionError({ error }: ChatRuntimeActionErrorPayload) {
  status.value = `操作失败：${error instanceof Error ? error.message : String(error)}`
}

onUnmounted(() => {
  void Promise.resolve(runtime.actions.abort?.()).catch(() => undefined)
})
</script>

<template>
  <section class="runtime-demo">
    <label class="runtime-demo__label"><input v-model="loggedIn" type="checkbox" /> 已登录（模拟）</label>
    <p class="runtime-demo__status" role="status">{{ status }}</p>
    <div class="runtime-demo__chat">
      <TrChat v-if="ready" :runtime="runtime" :ui="ui" @runtime-action-error="handleActionError" />
    </div>
  </section>
</template>

<style scoped src="./shared/runtime-demo.css"></style>
