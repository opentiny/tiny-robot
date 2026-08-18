<script setup lang="ts">
import { IconEdit, IconSparkles } from '@opentiny/tiny-robot-svgs'

defineProps<{
  isEmpty: boolean
}>()
</script>

<template>
  <div class="gemini-header" :class="{ 'is-session': !isEmpty }">
    <div class="gemini-header__actions">
      <button class="gemini-upgrade" type="button" aria-label="升级" title="升级">
        <IconSparkles :size="18" />
        <span>升级</span>
      </button>
      <button class="gemini-header__feedback" type="button" aria-label="发送反馈" title="发送反馈">
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
  background: #f1f3f4;
}

.gemini-header__actions {
  position: fixed;
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
  color: #145078;
  background: #c6e8ff;
  font: inherit;
  font-size: 14px;
  cursor: pointer;
}

.gemini-upgrade:hover {
  background: #b4dffb;
}

.gemini-header__feedback {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: #1f1f1f;
}
</style>
