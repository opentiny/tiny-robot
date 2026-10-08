<script setup lang="ts">
import { IconEdit, IconSparkles } from '@opentiny/tiny-robot-svgs'

defineProps<{
  isEmpty: boolean
}>()
</script>

<template>
  <div class="gemini-header" :class="{ 'is-session': !isEmpty }">
    <div class="gemini-header__actions">
      <button class="gemini-upgrade" type="button" aria-label="升级" title="升级" disabled>
        <IconSparkles :size="18" />
        <span>升级</span>
      </button>
      <button class="gemini-header__feedback" type="button" aria-label="发送反馈" title="发送反馈" disabled>
        <IconEdit :size="18" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.gemini-header {
  position: relative;
  z-index: 20;
  width: 100%;
  min-height: 0;
  pointer-events: none;
}

.gemini-header.is-session {
  min-height: 64px;
}

.gemini-header__feedback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}

.gemini-header__feedback:hover {
  background: var(--tr-container-bg-hover);
}

.gemini-header__feedback:disabled,
.gemini-upgrade:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.gemini-header__actions {
  position: absolute;
  top: 12px;
  right: 16px;
  display: inline-flex;
  align-items: center;
  gap: 16px;
  pointer-events: auto;
}

.gemini-upgrade {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 18px;
  border: 0;
  border-radius: 20px;
  color: var(--tr-color-primary);
  background: var(--tr-color-primary-light);
  font: inherit;
  font-size: 14px;
  cursor: pointer;
}

.gemini-upgrade:hover {
  background: var(--tr-container-bg-hover);
}

.gemini-header__feedback {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: var(--tr-text-primary);
}
</style>
