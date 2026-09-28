<script setup lang="ts">
import { IconShare } from '@opentiny/tiny-robot-svgs'
import deepseekMark from './icons/deepseek-mark.svg'
import newChatIcon from './icons/new-chat.svg'
import searchIcon from './icons/search.svg'
import sidebarToggleIcon from './icons/sidebar-toggle.svg'

defineProps<{
  title: string
  isEmpty: boolean
  modeLabel: string
  isSidebarOpen: boolean
}>()

const emit = defineEmits<{
  toggle: []
  createConversation: []
}>()
</script>

<template>
  <div class="deepseek-header" :class="{ 'is-sidebar-collapsed': !isSidebarOpen }">
    <div v-if="!isSidebarOpen" class="deepseek-header__floating-tools">
      <img class="deepseek-header__logo" :src="deepseekMark" alt="DeepSeek" />
      <div class="deepseek-header__toolbar">
        <button
          class="deepseek-header__button"
          type="button"
          aria-label="展开侧栏"
          title="展开侧栏"
          @click="emit('toggle')"
        >
          <img :src="sidebarToggleIcon" alt="" />
        </button>
        <button class="deepseek-header__button" type="button" aria-label="搜索会话" title="搜索会话" disabled>
          <img :src="searchIcon" alt="" />
        </button>
        <button
          class="deepseek-header__button"
          type="button"
          aria-label="新对话"
          title="新对话"
          @click="emit('createConversation')"
        >
          <img :src="newChatIcon" alt="" />
        </button>
      </div>
    </div>

    <header v-if="!isEmpty" class="deepseek-session-header">
      <div class="deepseek-session-header__content">
        <h1 class="deepseek-session-header__title">{{ title }}</h1>
        <span class="deepseek-session-header__mode">{{ modeLabel }}</span>
      </div>
      <button class="deepseek-session-header__share" type="button" aria-label="分享会话" title="分享会话" disabled>
        <IconShare :size="18" />
      </button>
    </header>
  </div>
</template>

<style scoped>
.deepseek-header {
  --deepseek-header-left-padding: 24px;
  width: 100%;
}

.deepseek-header.is-sidebar-collapsed {
  --deepseek-header-left-padding: 184px;
}

.deepseek-header__floating-tools {
  position: absolute;
  z-index: 20;
  inset: 0;
  pointer-events: none;
}

.deepseek-header__logo {
  position: absolute;
  top: 20px;
  left: 12px;
  width: 28px;
  height: 28px;
}

.deepseek-header__toolbar {
  position: absolute;
  top: 12px;
  left: 56px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 40px;
  padding: 4px 6px;
  border: 1px solid var(--tr-border-color-default);
  border-radius: 20px;
  background: color-mix(in srgb, var(--tr-container-bg-default) 94%, transparent);
  box-shadow: var(--tr-shadow-sm);
  pointer-events: auto;
}

.deepseek-session-header {
  display: grid;
  box-sizing: border-box;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  width: 100%;
  min-height: 64px;
  padding: 8px 24px 8px var(--deepseek-header-left-padding);
}

.deepseek-session-header__content {
  grid-column: 1;
  justify-self: start;
  min-width: 0;
  text-align: left;
}

.deepseek-session-header__title {
  max-width: min(560px, 60vw);
  margin: 0;
  overflow: hidden;
  color: var(--tr-text-primary);
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.deepseek-session-header__mode {
  display: block;
  margin-top: 2px;
  color: var(--tr-text-secondary);
  font-size: 12px;
  line-height: 18px;
}

.deepseek-session-header__share {
  display: inline-flex;
  grid-column: 2;
  align-items: center;
  justify-content: center;
  justify-self: end;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  color: var(--tr-text-secondary);
  background: transparent;
  cursor: pointer;
}

.deepseek-session-header__share:hover {
  color: var(--tr-color-primary);
  background: var(--tr-color-primary-light);
}

.deepseek-session-header__share:disabled,
.deepseek-header__button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.deepseek-session-header__share:focus-visible,
.deepseek-header__button:focus-visible {
  outline: 2px solid var(--tr-color-primary);
  outline-offset: 2px;
}

.deepseek-header__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 7px;
  color: var(--tr-text-secondary);
  background: transparent;
  cursor: pointer;
}

.deepseek-header__button:hover {
  color: var(--tr-color-primary);
  background: var(--tr-color-primary-light);
}

.deepseek-header__button img {
  display: block;
  width: 16px;
  height: 16px;
}
</style>
