<script setup lang="ts">
import menuToggleIcon from './icons/menu-toggle.svg'

defineProps<{
  isSidebarOpen: boolean
}>()

const emit = defineEmits<{
  toggle: []
  menuEnter: [isSidebarOpen: boolean]
  menuLeave: []
}>()
</script>

<template>
  <header class="doubao-header">
    <button
      class="doubao-header__menu"
      type="button"
      :aria-label="isSidebarOpen ? '隐藏侧栏' : '显示侧栏'"
      :title="isSidebarOpen ? '隐藏侧栏' : '显示侧栏'"
      @mouseenter="emit('menuEnter', isSidebarOpen)"
      @mouseleave="emit('menuLeave')"
      @click="emit('toggle')"
    >
      <img :src="menuToggleIcon" alt="" />
    </button>
  </header>
</template>

<style scoped>
.doubao-header {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 16px;
  border-bottom: 1px solid #e5e6eb;
  background: #fff;
}

.doubao-header__menu {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 4px;
  border: 0;
  border-radius: 7px;
  color: #1f2329;
  background: transparent;
  cursor: pointer;
}

.doubao-header__menu:hover {
  background: #f2f3f5;
}

.doubao-header__menu img {
  width: 20px;
  height: 20px;
}
</style>
