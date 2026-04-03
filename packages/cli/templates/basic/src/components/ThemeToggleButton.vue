<template>
  <button class="theme-toggle-btn" type="button" aria-label="切换主题" @click="toggleColorMode()">
    <IconMoon v-if="resolvedColorMode === 'light'" :size="20" />
    <IconSun v-else :size="20" />
  </button>
</template>

<script setup lang="ts">
import { useTheme } from '@opentiny/tiny-robot'
import { IconMoon, IconSun } from './icons'

const { toggleColorMode, resolvedColorMode } = useTheme()
</script>

<style scoped>
.theme-toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: var(--tr-radius-full);
  background: transparent;
  color: var(--tr-icon-color-default);
  cursor: pointer;
}

.theme-toggle-btn:hover {
  color: var(--tr-icon-color-hover);
  background: var(--tr-container-bg-hover);
}

@media (max-width: 959px) {
  .theme-toggle-btn {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
