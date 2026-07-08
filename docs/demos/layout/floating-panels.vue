<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import { TinyButton } from '@opentiny/vue'
import type { LayoutAsideOpenValue, LayoutFloatingOptions, LayoutFloatingState } from '@opentiny/tiny-robot'

const open = ref(false)
const rightOpen = ref(false)

const defaultFloatingState: LayoutFloatingState = {
  placement: 'top-right',
  offsetX: 24,
  offsetY: 32,
  width: 560,
  height: 420,
}

const floatingOptions: LayoutFloatingOptions = {
  draggable: true,
  resizable: true,
  minWidth: 420,
  maxWidth: 760,
  minHeight: 320,
}

function updateRightAside(detail: LayoutAsideOpenValue) {
  rightOpen.value = detail.open
}
</script>

<template>
  <div class="layout-floating-panels-demo">
    <div class="layout-floating-panels-demo__toolbar">
      <TinyButton :reset-time="0" @click="open = !open">
        {{ open ? '关闭浮层' : '打开浮层' }}
      </TinyButton>
    </div>

    <TrLayout
      v-if="open"
      class="layout-floating-panels-demo__layout"
      mode="floating"
      :default-floating-state="defaultFloatingState"
      :floating-options="floatingOptions"
      :left-aside="{ mode: 'dock', defaultOpen: true, defaultExpandedWidth: 208 }"
      :right-aside="{ mode: 'drawer', open: rightOpen }"
      @right-aside-open-change="updateRightAside"
    >
      <template #left-aside>
        <div class="layout-floating-panels-demo__aside">
          <div class="layout-floating-panels-demo__aside-title">左侧导航栏</div>
          <div>使用 dock 常驻显示，适合放目录、导航或上下文信息。</div>
        </div>
      </template>

      <template #header>
        <div class="layout-floating-panels-demo__header">
          <strong>浮层工作区</strong>
          <div class="layout-floating-panels-demo__actions">
            <TinyButton :reset-time="0" @click="rightOpen = true">打开右抽屉</TinyButton>
          </div>
        </div>
      </template>

      <template #main>
        <div class="layout-floating-panels-demo__main">
          <div class="layout-floating-panels-demo__card">左侧使用 dock，保留常驻导航区并占据浮层宽度。</div>
          <div class="layout-floating-panels-demo__card">右侧使用 drawer，需要时展开，不占主区宽度。</div>
          <div class="layout-floating-panels-demo__card">整个浮层仍可拖拽、缩放，适合组合常驻导航和临时操作面板。</div>
        </div>
      </template>

      <template #right-aside>
        <div class="layout-floating-panels-demo__aside">
          <div class="layout-floating-panels-demo__aside-title">右侧操作抽屉</div>
          <div>按需展开，不占主区宽度，适合放操作表单或补充面板。</div>
          <TrLayout.AsideToggle side="right" class="layout-floating-panels-demo__chip">关闭抽屉</TrLayout.AsideToggle>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style>
.layout-floating-panels-demo__layout {
  --tr-layout-floating-radius: 16px;
  --tr-layout-drawer-width: 240px;
}
</style>

<style scoped>
.layout-floating-panels-demo {
  display: grid;
  gap: 8px;
}

.layout-floating-panels-demo__toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-floating-panels-demo__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-floating-panels-demo__chip {
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  background: var(--vp-c-bg, #ffffff);
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
  min-height: 36px;
  padding: 0 12px;
  border-radius: 8px;
}

.layout-floating-panels-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 24px 16px;
  background: var(--vp-c-bg, #ffffff);
}

.layout-floating-panels-demo__main,
.layout-floating-panels-demo__aside {
  display: grid;
  align-content: start;
  gap: 12px;
  padding: 16px;
  box-sizing: border-box;
  height: 100%;
  background: var(--vp-c-bg, #ffffff);
}

.layout-floating-panels-demo__main {
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-floating-panels-demo__card {
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--vp-c-bg-soft, #f6f8fa);
}

.layout-floating-panels-demo__aside-title {
  font-weight: 600;
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}
</style>
