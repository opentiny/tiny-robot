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

const mode = shallowRef<'normal' | 'disabled' | 'submit-disabled'>('normal')
const disabled = computed(() => mode.value === 'disabled')
const submitDisabled = computed(() => mode.value === 'submit-disabled')
const error = shallowRef('')
const ready = shallowRef(false)
const presetControls = shallowRef<HTMLDivElement | null>(null)
const runtime = useChatRuntime({
  modelProviders,
  conversation: {
    storage: localStorageStrategyFactory({ key: 'tiny-robot-demo-runtime-composer-v1' }),
    autoSaveThrottle: 0,
    async onLoad(conversations) {
      try {
        const latest = [...conversations].sort((a, b) => b.updatedAt - a.updatedAt)[0]
        if (latest) await runtime.actions.switchConversation(latest.id)
      } catch (cause) {
        error.value = `恢复会话失败：${cause instanceof Error ? cause.message : String(cause)}`
      } finally {
        ready.value = true
      }
    },
  },
  composer: { disabled, submitDisabled },
  beforeSend() {
    error.value = ''
    return 'continue'
  },
})
const ui: ChatUIOptions = {
  layout: { leftAside: false, rightAside: false },
  header: false,
  welcome: false,
  prompts: false,
  model: false,
}
const processing = computed(() => runtime.activeConversation.value?.requestState === 'processing')
const description = computed(() => {
  if (disabled.value) return '无法编辑或发送。'
  if (submitDisabled.value) return '可以编辑和清空，但不能发送。'
  return processing.value ? '正在生成回答，可点击停止按钮取消。' : '可以编辑，内容非空时可发送。'
})

function handleActionError({ error: cause }: ChatRuntimeActionErrorPayload) {
  error.value = `操作失败：${cause instanceof Error ? cause.message : String(cause)}`
}

onUnmounted(() => {
  void Promise.resolve(runtime.actions.abort?.()).catch(() => undefined)
})
</script>

<template>
  <section class="runtime-demo">
    <div class="runtime-demo__controls">
      <div ref="presetControls" class="runtime-demo__controls"></div>
      <label class="runtime-demo__label"
        ><input v-model="mode" type="radio" value="normal" :disabled="processing" /> 正常</label
      >
      <label class="runtime-demo__label"
        ><input v-model="mode" type="radio" value="disabled" :disabled="processing" /> 禁用输入区</label
      >
      <label class="runtime-demo__label"
        ><input v-model="mode" type="radio" value="submit-disabled" :disabled="processing" /> 仅禁用提交</label
      >
    </div>
    <p class="runtime-demo__status" role="status">
      <code>composer: { disabled: {{ disabled }}, submitDisabled: {{ submitDisabled }} }</code>
      — {{ description }}
    </p>
    <p v-if="error" class="runtime-demo__status" role="alert">{{ error }}</p>
    <div class="runtime-demo__chat">
      <TrChat v-if="ready" :runtime="runtime" :ui="ui" @runtime-action-error="handleActionError">
        <template #composer-before="{ disabled: inputDisabled, loading, setInputValue }">
          <Teleport v-if="presetControls" :to="presetControls">
            <button
              class="runtime-demo__button"
              type="button"
              :disabled="inputDisabled || loading"
              @click="setInputValue('介绍一下这个项目')"
            >
              填入预设问题
            </button>
          </Teleport>
        </template>
      </TrChat>
    </div>
  </section>
</template>

<style scoped src="./shared/runtime-demo.css"></style>
