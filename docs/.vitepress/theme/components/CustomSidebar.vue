<template>
  <div class="custom-sidebar">
    <div class="sidebar-content">
      <!-- 使用默认的 VitePress 侧边栏，但应用自定义样式 -->
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
// 这个组件主要用于包装和样式化默认的 VitePress 侧边栏
</script>

<style scoped>
.custom-sidebar {
  height: 100%;
  background-color: var(--vp-c-bg);
  border-right: 1px solid var(--vp-c-divider);
}

.sidebar-content {
  height: 100%;
  overflow-y: auto;
  padding: 16px 0;
}

/* 自定义滚动条 */
.sidebar-content::-webkit-scrollbar {
  width: 6px;
}

.sidebar-content::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-content::-webkit-scrollbar-thumb {
  /* background: var(--vp-c-brand-soft); */
  border-radius: 3px;
  transition: background 0.2s ease;
}

.sidebar-content::-webkit-scrollbar-thumb:hover {
  background: var(--vp-c-brand-1);
}
</style>
