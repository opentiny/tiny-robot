<script setup lang="ts">
import { TrChat, type ChatRuntime } from '@opentiny/tiny-robot-chat'

defineProps<{
  runtime: ChatRuntime
}>()

const open = defineModel<boolean>('open', { default: true })
</script>

<template>
  <div class="right-panel-case">
    <main class="right-panel-case__content">
      <p class="right-panel-case__eyebrow">TinyRobot Chat Case</p>
      <h1>业务页面</h1>
      <p>此页面用于验证客服系统式的右侧聊天面板。聊天窗口脱离页面普通布局，固定在视口右侧。</p>
    </main>

    <button v-if="!open" class="right-panel-case__trigger" type="button" aria-label="打开聊天面板" @click="open = true">
      打开聊天
    </button>

    <aside v-if="open" class="right-panel-case__panel" aria-label="聊天面板">
      <button class="right-panel-case__close" type="button" aria-label="关闭聊天面板" @click="open = false">
        关闭
      </button>
      <TrChat :runtime="runtime" />
    </aside>
  </div>
</template>

<style scoped>
.right-panel-case {
  min-height: 100vh;
  background: #f4f7f8;
  color: #172326;
}

.right-panel-case__content {
  max-width: 720px;
  padding: 80px 48px;
}

.right-panel-case__eyebrow {
  margin: 0 0 12px;
  color: #087f8c;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.right-panel-case__content h1 {
  margin: 0 0 16px;
  font-size: 36px;
}

.right-panel-case__content p:last-child {
  max-width: 520px;
  margin: 0;
  color: #536467;
  line-height: 1.7;
}

.right-panel-case__panel {
  position: fixed;
  z-index: 20;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(440px, 100vw);
  padding: 12px;
  background: #ffffff;
  box-shadow: -12px 0 32px rgb(23 35 38 / 14%);
}

.right-panel-case__panel :deep(.tr-chat) {
  height: 100%;
}

.right-panel-case__close,
.right-panel-case__trigger {
  position: fixed;
  z-index: 21;
  border: 1px solid #c9d5d6;
  border-radius: 6px;
  background: #ffffff;
  color: #172326;
  cursor: pointer;
  font: inherit;
}

.right-panel-case__close {
  top: 20px;
  right: 28px;
  padding: 6px 10px;
}

.right-panel-case__trigger {
  right: 24px;
  bottom: 24px;
  padding: 10px 14px;
  box-shadow: 0 8px 20px rgb(23 35 38 / 12%);
}

@media (max-width: 640px) {
  .right-panel-case__content {
    padding: 48px 24px;
  }
}
</style>
