<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { TrChat, useChatRuntime, type LayoutFloatingState } from '@opentiny/tiny-robot-chat'
import { createDemoStorage } from '../../fixtures/data'

const open = ref(false)
const error = ref('')
const showInitialSidebar = innerWidth > 900
const floatingState = ref<LayoutFloatingState>({
  placement: 'top-left',
  offsetX: innerWidth > 900 ? 340 : 16,
  offsetY: Math.min(240, Math.max(80, innerHeight - 560)),
  width: Math.min(680, innerWidth - 32),
  height: Math.min(520, innerHeight - 120),
})
const runtime = useChatRuntime({
  modelProviders: [
    {
      type: 'openai',
      apiUrl: new URL('/api/demo/chat/completions', location.origin).href,
      models: [{ id: 'demo', label: '本地模拟模型' }],
    },
  ],
  conversation: {
    storage: createDemoStorage(),
    onLoad: () => {
      void runtime.actions.switchConversation('release')
    },
  },
})
onUnmounted(() => {
  void Promise.resolve(runtime.actions.abort?.()).catch(() => undefined)
})
</script>

<template>
  <section class="floating-demo">
    <button class="primary-button" @click="open = !open">{{ open ? '关闭聊天浮窗' : '打开聊天浮窗' }}</button>
    <p>打开后，拖动窗口顶部把手，或拉伸窗口边缘。关闭后再次打开，可继续当前会话。</p>
    <p v-if="error" role="alert" class="error-message">{{ error }}</p>
    <TrChat
      v-if="open"
      :runtime="runtime"
      :ui="{
        layout: {
          leftAside: { defaultOpen: showInitialSidebar, width: 196 },
          surface: { mode: 'floating', floatingOptions: { resizable: true } },
        },
      }"
      v-model:floating-state="floatingState"
      @runtime-action-error="error = String($event.error)"
    >
      <template #layout-header="{ title, toggleLeftAside }">
        <div class="floating-header">
          <button class="utility-button" aria-label="切换会话列表" @click="toggleLeftAside">会话</button>
          <strong>{{ title || '聊天助手' }}</strong>
          <button class="utility-button" aria-label="关闭浮窗" @click="open = false">关闭</button>
        </div>
      </template>
    </TrChat>
  </section>
</template>

<style scoped>
.floating-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
}
.floating-header strong {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
