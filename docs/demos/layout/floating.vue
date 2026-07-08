<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import { TinyButton } from '@opentiny/vue'
import type { LayoutFloatingOptions, LayoutFloatingState } from '@opentiny/tiny-robot'

const open = ref(false)

const defaultFloatingState: LayoutFloatingState = {
  placement: 'top-right',
  offsetX: 0,
  offsetY: 0,
  width: 520,
  height: 360,
}

const floatingOptions: LayoutFloatingOptions = {
  draggable: true,
  resizable: true,
  minWidth: 360,
  maxWidth: 680,
  minHeight: 260,
}
</script>

<template>
  <div class="layout-floating-demo">
    <div class="layout-floating-demo__toolbar">
      <TinyButton :reset-time="0" @click="open = !open">
        {{ open ? '关闭浮层' : '打开浮层' }}
      </TinyButton>
    </div>

    <TrLayout
      v-if="open"
      class="layout-floating-demo__layout"
      mode="floating"
      :default-floating-state="defaultFloatingState"
      :floating-options="floatingOptions"
    >
      <template #header>
        <div class="layout-floating-demo__header">
          <strong>非受控浮层</strong>
          <TinyButton :reset-time="0" size="small" @click="open = false">关闭</TinyButton>
        </div>
      </template>

      <template #main>
        <div class="layout-floating-demo__main">
          <div class="layout-floating-demo__card">当前示例只设置初始位置和尺寸。</div>
          <div class="layout-floating-demo__card">拖拽或缩放后，位置和尺寸由组件内部维护。</div>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style>
.layout-floating-demo__layout {
  --tr-layout-floating-radius: 12px;
}
</style>

<style scoped>
.layout-floating-demo {
  display: grid;
  gap: 8px;
}

.layout-floating-demo__toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-floating-demo__main {
  display: grid;
  gap: 12px;
  padding: 16px;
}

.layout-floating-demo__card {
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--vp-c-bg-soft, #f6f8fa);
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-floating-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}
</style>
