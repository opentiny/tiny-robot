<script setup lang="ts">
import { computed } from 'vue'
import { IconClose } from '@opentiny/tiny-robot-svgs'

const props = withDefaults(
  defineProps<{
    title?: string
    showClose?: boolean
  }>(),
  {
    title: 'right panel title',
    showClose: true,
  },
)

const emit = defineEmits<{
  close: []
}>()

const isHeaderVisible = computed(() => props.title || props.showClose)
</script>

<template>
  <section class="tr-chat-right-aside-panel">
    <header v-if="isHeaderVisible" class="tr-chat-right-aside-panel__header">
      <h2 class="tr-chat-right-aside-panel__title">{{ title }}</h2>
      <button
        v-if="showClose"
        class="tr-chat-right-aside-panel__close"
        type="button"
        aria-label="关闭"
        title="关闭"
        @click="emit('close')"
      >
        <IconClose class="tr-chat-right-aside-panel__close-icon" />
      </button>
    </header>

    <div class="tr-chat-right-aside-panel__body">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.tr-chat-right-aside-panel {
  display: flex;
  box-sizing: border-box;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-default);
}

.tr-chat-right-aside-panel__header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: space-between;
  padding: 24px 12px 12px;
}

.tr-chat-right-aside-panel__title {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--tr-text-primary);
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tr-chat-right-aside-panel__close {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  color: var(--tr-text-secondary);
  background: transparent;
  cursor: pointer;
}

.tr-chat-right-aside-panel__close:hover {
  color: var(--tr-text-primary);
  background: var(--tr-container-bg-hover);
}

.tr-chat-right-aside-panel__close-icon {
  font-size: 18px;
}

.tr-chat-right-aside-panel__body {
  flex: 1;
  min-width: 0;
  min-height: 0;
  overflow: auto;
  padding: 16px;
}
</style>
