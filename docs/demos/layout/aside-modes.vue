<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import { TinyButton } from '@opentiny/vue'
import type { LayoutAsideOpenValue } from '@opentiny/tiny-robot'

const rightOpen = ref(false)

function updateRightAside(detail: LayoutAsideOpenValue) {
  rightOpen.value = detail.open
}
</script>

<template>
  <div class="layout-aside-demo">
    <TrLayout
      :left-aside="{ defaultOpen: true, defaultExpandedWidth: 156 }"
      :right-aside="{ mode: 'drawer', open: rightOpen }"
      @right-aside-open-change="updateRightAside"
    >
      <template #left-aside>
        <div class="layout-aside-demo__aside">Dock 区域</div>
      </template>

      <template #header>
        <div class="layout-aside-demo__header">
          <span>Header 区域</span>
          <TinyButton :reset-time="0" @click="rightOpen = !rightOpen">
            {{ rightOpen ? '关闭 Drawer' : '打开 Drawer' }}
          </TinyButton>
        </div>
      </template>

      <template #main>
        <div class="layout-aside-demo__main">左侧 `dock` 始终参与布局，右侧 `drawer` 按需覆盖主区。</div>
      </template>

      <template #right-aside>
        <div class="layout-aside-demo__drawer layout-aside-demo__drawer-panel">
          <div>Drawer</div>
          <div>打开后覆盖内容区，不占主布局宽度。</div>
          <div>点击遮罩或顶部按钮关闭。</div>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style scoped>
.layout-aside-demo {
  --tr-layout-height: 100%;
  --tr-layout-left-aside-bg: var(--vp-c-bg-alt, #f8fafc);
  --tr-layout-drawer-width: 240px;
  height: 400px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 16px;
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-aside-demo__drawer-panel {
  height: 100%;
}

.layout-aside-demo__header,
.layout-aside-demo__main,
.layout-aside-demo__drawer {
  background: var(--vp-c-bg, #ffffff);
}

.layout-aside-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
}

.layout-aside-demo__main,
.layout-aside-demo__aside,
.layout-aside-demo__drawer {
  padding: 16px;
  box-sizing: border-box;
}

.layout-aside-demo__aside,
.layout-aside-demo__drawer {
  display: grid;
  gap: 8px;
  justify-content: center;
}

.layout-aside-demo__drawer {
  min-height: 100%;
}

.layout-aside-demo__main,
.layout-aside-demo__drawer {
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-aside-demo__chip {
  display: grid;
  place-items: center;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  background: var(--vp-c-bg, #ffffff);
  color: inherit;
  min-height: 36px;
  padding: 0 12px;
  border-radius: 8px;
}
</style>
