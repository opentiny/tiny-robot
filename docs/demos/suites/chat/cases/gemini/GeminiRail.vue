<script setup lang="ts">
import { IconNewSession, IconSearch, IconSetting, IconTypeAll } from '@opentiny/tiny-robot-svgs'
import geminiMask from './icons/gemini-mask.svg'

const emit = defineEmits<{
  open: []
  create: []
}>()

withDefaults(
  defineProps<{
    isOpen: boolean
    isNewConversationActive?: boolean
  }>(),
  {
    isNewConversationActive: false,
  },
)
</script>

<template>
  <aside class="gemini-rail" aria-label="Gemini 导航">
    <button
      class="gemini-rail__logo"
      type="button"
      aria-label="展开边栏"
      title="展开边栏"
      :aria-expanded="isOpen"
      @click="emit('open')"
    >
      <img class="gemini-rail__logo-image" :src="geminiMask" alt="Gemini" />
      <span class="gemini-rail__expand-hint" aria-hidden="true">
        <span class="gemini-sidebar-icon gemini-sidebar-icon--right" />
      </span>
    </button>

    <nav class="gemini-rail__navigation">
      <button
        class="gemini-rail__button"
        :class="{ 'is-active': isNewConversationActive }"
        type="button"
        aria-label="新建对话"
        title="新建对话"
        @click="emit('create')"
      >
        <IconNewSession :size="19" aria-hidden="true" />
      </button>
      <button class="gemini-rail__button" type="button" aria-label="搜索对话内容" title="搜索对话内容" disabled>
        <IconSearch :size="19" aria-hidden="true" />
      </button>
      <button class="gemini-rail__button" type="button" aria-label="库" title="库" disabled>
        <IconTypeAll :size="19" aria-hidden="true" />
      </button>
    </nav>

    <div class="gemini-rail__bottom">
      <button class="gemini-rail__button" type="button" aria-label="设置" title="设置" disabled>
        <IconSetting :size="19" />
      </button>
      <button class="gemini-rail__avatar" type="button" aria-label="用户账户" title="用户账户" disabled>sl</button>
    </div>
  </aside>
</template>

<style scoped>
.gemini-rail {
  display: flex;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  flex-direction: column;
  align-items: center;
  padding: 0 8px;
  color: var(--gemini-sidebar-text);
  background: var(--gemini-sidebar-bg);
}

.gemini-rail__logo,
.gemini-rail__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 10px;
  color: var(--gemini-sidebar-text);
  background: transparent;
  cursor: pointer;
}

.gemini-rail__logo {
  position: relative;
  width: 32px;
  height: 32px;
}

.gemini-rail__logo-image {
  position: absolute;
  inset: 0;
  margin: auto;
  display: block;
  width: 24px;
  height: 24px;
  opacity: 1;
  visibility: visible;
  transition:
    opacity var(--transition-duration) var(--transition-easing),
    visibility var(--transition-duration) var(--transition-easing);
}

.gemini-rail__expand-hint {
  position: absolute;
  inset: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin: auto;
  color: var(--gemini-sidebar-text);
  opacity: 0;
  visibility: hidden;
  transition:
    opacity var(--transition-duration) var(--transition-easing),
    visibility var(--transition-duration) var(--transition-easing);
}

.gemini-rail__logo:hover,
.gemini-rail__logo:focus-visible {
  border-radius: 50%;
  background: var(--gemini-sidebar-hover-bg);
}

.gemini-rail__logo:hover .gemini-rail__expand-hint,
.gemini-rail__logo:focus-visible .gemini-rail__expand-hint {
  opacity: 1;
  visibility: visible;
}

.gemini-rail__logo:hover .gemini-rail__logo-image,
.gemini-rail__logo:focus-visible .gemini-rail__logo-image {
  opacity: 0;
  visibility: hidden;
}

.gemini-rail__navigation {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

.gemini-rail__bottom {
  display: grid;
  gap: 16px;
  justify-items: center;
  margin-top: auto;
}

.gemini-rail__avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  overflow: hidden;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  cursor: pointer;
}

.gemini-rail__button:hover,
.gemini-rail__button:focus-visible,
.gemini-rail__avatar:hover,
.gemini-rail__avatar:focus-visible {
  background: var(--gemini-sidebar-hover-bg);
}

.gemini-rail__button:disabled,
.gemini-rail__avatar:disabled {
  cursor: not-allowed;
}

.gemini-rail__button.is-active,
.gemini-rail__button.is-active:hover,
.gemini-rail__button.is-active:focus-visible {
  background: var(--gemini-sidebar-selected-bg);
}

.gemini-rail__logo:focus-visible,
.gemini-rail__button:focus-visible,
.gemini-rail__avatar:focus-visible {
  outline: 2px solid var(--gemini-sidebar-focus-ring);
  outline-offset: 2px;
}

.gemini-sidebar-icon {
  display: block;
  flex: none;
  width: 20px;
  height: 20px;
  background-color: currentColor;
  -webkit-mask-position: center;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-size: contain;
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
}

.gemini-sidebar-icon--right {
  -webkit-mask-image: url('./icons/sidebar-toggle-right.svg');
  mask-image: url('./icons/sidebar-toggle-right.svg');
}

@media (prefers-reduced-motion: reduce) {
  .gemini-rail__logo-image,
  .gemini-rail__expand-hint {
    transition: none;
  }
}

.gemini-rail__avatar {
  color: var(--gemini-avatar-text);
  background: var(--gemini-avatar-bg);
  font-size: 11px;
  font-weight: 600;
}
</style>
