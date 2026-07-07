<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import { TinyBaseSelect, TinyButton, TinyNumeric, TinyOption, TinySwitch } from '@opentiny/vue'
import type { LayoutFloatingOptions, LayoutFloatingState } from '@opentiny/tiny-robot'

type FloatingPlacement = LayoutFloatingState['placement']

const open = ref(false)
const placement = ref<FloatingPlacement>('top-right')
const offsetX = ref(0)
const offsetY = ref(0)
const draggable = ref(true)
const resizable = ref(true)

const placements: FloatingPlacement[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']

const defaultFloatingState = computed<LayoutFloatingState>(() => ({
  placement: placement.value,
  offsetX: offsetX.value,
  offsetY: offsetY.value,
  width: 520,
  height: 360,
}))

const floatingStateKey = computed(() => `${placement.value}-${offsetX.value}-${offsetY.value}`)

const floatingOptions = computed<LayoutFloatingOptions>(() => ({
  draggable: draggable.value,
  resizable: resizable.value,
  minWidth: 360,
  maxWidth: 680,
}))
</script>

<template>
  <div class="layout-floating-demo">
    <div class="layout-floating-demo__toolbar">
      <TinyButton :reset-time="0" @click="open = !open">
        {{ open ? '关闭浮层' : '打开浮层' }}
      </TinyButton>
      <span class="layout-floating-demo__tip">非受控浮层会在内部维护拖拽和缩放后的状态。</span>
    </div>

    <div class="layout-floating-demo__controls">
      <label class="layout-floating-demo__field">
        <span>placement</span>
        <TinyBaseSelect v-model="placement" class="layout-floating-demo__select">
          <TinyOption v-for="item in placements" :key="item" :label="item" :value="item" />
        </TinyBaseSelect>
      </label>

      <label class="layout-floating-demo__field">
        <span>offsetX</span>
        <TinyNumeric v-model="offsetX" class="layout-floating-demo__numeric" />
      </label>

      <label class="layout-floating-demo__field">
        <span>offsetY</span>
        <TinyNumeric v-model="offsetY" class="layout-floating-demo__numeric" />
      </label>

      <label class="layout-floating-demo__field">
        <span>draggable</span>
        <TinySwitch v-model="draggable" />
      </label>

      <label class="layout-floating-demo__field">
        <span>resizable</span>
        <TinySwitch v-model="resizable" />
      </label>
    </div>

    <TrLayout
      v-if="open"
      :key="floatingStateKey"
      class="layout-floating-demo__layout"
      mode="floating"
      :default-floating-state="defaultFloatingState"
      :floating-options="floatingOptions"
    >
      <template #header>
        <div class="layout-floating-demo__header">
          <strong>浮层布局</strong>
          <TinyButton :reset-time="0" size="small" @click="open = false">关闭</TinyButton>
        </div>
      </template>

      <template #main>
        <div class="layout-floating-demo__main">
          <div class="layout-floating-demo__card">`defaultFloatingState` 只设置初始位置和大小。</div>
          <div class="layout-floating-demo__card">拖动顶部横条可移动浮层，拖动边缘手柄可调整大小。</div>
          <div class="layout-floating-demo__card">切换 placement 或 offset 会重置初始位置，方便观察定位效果。</div>
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

.layout-floating-demo__controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-floating-demo__tip {
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-floating-demo__field {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-floating-demo__select {
  width: 148px;
}

.layout-floating-demo__numeric {
  width: 104px;
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
