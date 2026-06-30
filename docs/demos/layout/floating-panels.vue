<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutAsideOpenValue, LayoutFloatingOptions, LayoutFloatingState } from '@opentiny/tiny-robot'

const open = ref(false)
const leftOpen = ref(false)
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

function updateLeftAside(detail: LayoutAsideOpenValue) {
  leftOpen.value = detail.open
}

function updateRightAside(detail: LayoutAsideOpenValue) {
  rightOpen.value = detail.open
}
</script>

<template>
  <div class="layout-floating-panels-demo">
    <div class="layout-floating-panels-demo__toolbar">
      <button type="button" class="layout-floating-panels-demo__button" @click="open = !open">
        {{ open ? '关闭浮层' : '打开浮层' }}
      </button>
    </div>

    <TrLayout
      v-if="open"
      class="layout-floating-panels-demo__layout"
      mode="floating"
      :default-floating-state="defaultFloatingState"
      :floating-options="floatingOptions"
      :left-aside="{ mode: 'drawer', open: leftOpen }"
      :right-aside="{ mode: 'drawer', open: rightOpen }"
      @left-aside-open-change="updateLeftAside"
      @right-aside-open-change="updateRightAside"
    >
      <template #left-aside>
        <div class="layout-floating-panels-demo__drawer">
          <div class="layout-floating-panels-demo__drawer-title">左侧抽屉</div>
          <div>适合放筛选、导航或补充信息。</div>
          <TrLayout.AsideToggle side="left" class="layout-floating-panels-demo__chip">关闭抽屉</TrLayout.AsideToggle>
        </div>
      </template>

      <template #header>
        <div class="layout-floating-panels-demo__header">
          <strong>浮层工作区</strong>
          <div class="layout-floating-panels-demo__actions">
            <button type="button" class="layout-floating-panels-demo__button" @click="leftOpen = true">
              打开左抽屉
            </button>
            <button type="button" class="layout-floating-panels-demo__button" @click="rightOpen = true">
              打开右抽屉
            </button>
          </div>
        </div>
      </template>

      <template #main>
        <div class="layout-floating-panels-demo__main">
          <div class="layout-floating-panels-demo__card">左右两侧都使用 drawer，需要时再展开，不占主区宽度。</div>
          <div class="layout-floating-panels-demo__card">整个浮层仍可拖拽、缩放，适合临时工作区或对话面板。</div>
        </div>
      </template>

      <template #right-aside>
        <div class="layout-floating-panels-demo__drawer">
          <div class="layout-floating-panels-demo__drawer-title">右侧抽屉</div>
          <div>点击遮罩、按 `Esc` 或按钮都可以关闭。</div>
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

.layout-floating-panels-demo__button,
.layout-floating-panels-demo__chip,
.layout-floating-panels-demo__rail-chip {
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  background: var(--vp-c-bg, #ffffff);
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-floating-panels-demo__button,
.layout-floating-panels-demo__chip {
  min-height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  cursor: pointer;
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
.layout-floating-panels-demo__drawer {
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

.layout-floating-panels-demo__drawer-title {
  font-weight: 600;
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}
</style>
