<script setup lang="ts">
import DouBaoIcon from './DouBaoIcon.vue'

defineProps<{
  isSidebarOpen: boolean
  title: string
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
      <DouBaoIcon name="panel-left" />
    </button>
    <div class="doubao-header__heading">
      <div class="doubao-header__title">{{ title }}</div>
      <div class="doubao-header__notice">AI生成可能有误 注意核实</div>
    </div>
  </header>
</template>

<style scoped>
.doubao-header {
  position: relative;
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 18px;
  border-bottom: 1px solid #e6e8ec;
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
  color: var(--tr-text-primary);
  background: transparent;
  cursor: pointer;
}

.doubao-header__menu:hover {
  background: #f3f4f6;
}

.doubao-header__menu:focus-visible {
  outline: 2px solid var(--tr-color-primary);
  outline-offset: 2px;
}

.doubao-header__menu svg {
  width: 20px;
  height: 20px;
}

.doubao-header__heading {
  position: absolute;
  top: 50%;
  left: 50%;
  max-width: calc(100% - 120px);
  text-align: center;
  transform: translate(-50%, -50%);
}

.doubao-header__title {
  overflow: hidden;
  color: #1d1f23;
  font-size: 14px;
  font-weight: 500;
  line-height: 19px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.doubao-header__notice {
  color: #b4b7bd;
  font-size: 11px;
  line-height: 15px;
  white-space: nowrap;
}
</style>
