<script setup lang="ts">
import { shallowRef } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import { TrChat, type ChatRuntime } from '@opentiny/tiny-robot-chat'
import type { LayoutFloatingOptions, LayoutFloatingState } from '@opentiny/tiny-robot'

defineProps<{
  runtime: ChatRuntime
}>()

const open = shallowRef(false)

const defaultFloatingState: LayoutFloatingState = {
  placement: 'bottom-right',
  offsetX: 24,
  offsetY: 24,
  width: 440,
  height: 680,
}

const floatingOptions: LayoutFloatingOptions = {
  draggable: true,
  resizable: true,
  minWidth: 360,
  maxWidth: 680,
  minHeight: 420,
}
</script>

<template>
  <div class="floating-chat-case">
    <main class="floating-chat-case__content">
      <p class="floating-chat-case__eyebrow">TinyRobot Chat Case</p>
      <h1>业务页面</h1>
      <p>此页面用于验证悬浮式聊天窗口，以及 TrLayout 提供的拖拽和缩放能力。</p>
    </main>

    <button
      v-if="!open"
      class="floating-chat-case__trigger"
      type="button"
      aria-label="打开悬浮聊天"
      @click="open = true"
    >
      打开聊天
    </button>

    <TrLayout
      v-if="open"
      class="floating-chat-case__layout"
      mode="floating"
      :default-floating-state="defaultFloatingState"
      :floating-options="floatingOptions"
    >
      <template #header>
        <div class="floating-chat-case__header">
          <strong>TinyRobot Chat</strong>
          <button type="button" aria-label="关闭悬浮聊天" @click="open = false">关闭</button>
        </div>
      </template>

      <template #main>
        <TrChat :runtime="runtime" />
      </template>
    </TrLayout>
  </div>
</template>

<style scoped>
.floating-chat-case {
  min-height: 100vh;
  background: #f4f7f8;
  color: #172326;
}

.floating-chat-case__content {
  max-width: 720px;
  padding: 80px 48px;
}

.floating-chat-case__eyebrow {
  margin: 0 0 12px;
  color: #087f8c;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.floating-chat-case__content h1 {
  margin: 0 0 16px;
  font-size: 36px;
}

.floating-chat-case__content p:last-child {
  max-width: 520px;
  margin: 0;
  color: #536467;
  line-height: 1.7;
}

.floating-chat-case__trigger,
.floating-chat-case__header button {
  border: 1px solid #c9d5d6;
  border-radius: 6px;
  background: #ffffff;
  color: #172326;
  cursor: pointer;
  font: inherit;
}

.floating-chat-case__trigger {
  position: fixed;
  right: 24px;
  bottom: 24px;
  padding: 10px 14px;
  box-shadow: 0 8px 20px rgb(23 35 38 / 12%);
}

.floating-chat-case__layout {
  --tr-layout-floating-radius: 10px;
  --tr-layout-floating-shadow: 0 18px 48px rgb(23 35 38 / 20%);
  --tr-layout-height: 100%;
}

.floating-chat-case__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  height: 100%;
  padding: 0 14px;
}

.floating-chat-case__header button {
  padding: 5px 9px;
}

.floating-chat-case__layout :deep(.tr-layout__main) {
  min-height: 0;
}

.floating-chat-case__layout :deep(.tr-chat) {
  height: 100%;
}

@media (max-width: 640px) {
  .floating-chat-case__content {
    padding: 48px 24px;
  }

  .floating-chat-case__layout {
    --tr-layout-floating-radius: 0;
  }
}
</style>
