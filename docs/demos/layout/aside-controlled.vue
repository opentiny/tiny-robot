<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import { TinyButton, TinySlider } from '@opentiny/vue'
import { useElementSize } from '@vueuse/core'
import type { LayoutAsideOptions, LayoutAsideOpenValue, LayoutAsideResizeValue } from '@opentiny/tiny-robot'

const leftOpen = ref(true)
const demoRef = ref<HTMLElement | null>(null)
const { width: demoWidth } = useElementSize(demoRef)
const requestedLeftWidth = ref(220)
const leftWidthMin = 160
const leftWidthMax = 320
const leftWidthStep = 4
const mainWidthMin = 100
const rightOpen = ref(false)

const availableLeftWidth = computed(() => {
  if (demoWidth.value === 0) return leftWidthMax
  const spaceForLeftAside = Math.max(0, demoWidth.value - mainWidthMin)
  return Math.min(leftWidthMax, Math.floor(spaceForLeftAside / leftWidthStep) * leftWidthStep)
})
const minLeftWidth = computed(() => Math.min(leftWidthMin, availableLeftWidth.value))
const leftExpandedWidth = computed({
  get: () => Math.min(requestedLeftWidth.value, availableLeftWidth.value),
  set: (width: number) => {
    requestedLeftWidth.value = width
  },
})

const leftAside = computed<LayoutAsideOptions>(() => ({
  open: leftOpen.value,
  expandedWidth: leftExpandedWidth.value,
  collapsedWidth: 0,
  minExpandedWidth: minLeftWidth.value,
  maxExpandedWidth: availableLeftWidth.value,
  resizable: true,
}))

const rightAside = computed<LayoutAsideOptions>(() => ({
  mode: 'drawer',
  open: rightOpen.value,
}))

function updateLeftAsideOpen(detail: LayoutAsideOpenValue) {
  leftOpen.value = detail.open
}

function updateLeftAsideWidth(detail: LayoutAsideResizeValue) {
  leftExpandedWidth.value = detail.expandedWidth
}

function updateRightAsideOpen(detail: LayoutAsideOpenValue) {
  rightOpen.value = detail.open
}
</script>

<template>
  <div ref="demoRef" class="layout-slot-props-demo">
    <div class="layout-slot-props-demo__controls">
      <div class="layout-slot-props-demo__group">
        <span class="layout-slot-props-demo__group-label">左侧栏</span>
        <TinyButton :reset-time="0" @click="leftOpen = !leftOpen">
          {{ leftOpen ? '收起侧栏' : '展开侧栏' }}
        </TinyButton>
        <label class="layout-slot-props-demo__range-wrap">
          <span class="layout-slot-props-demo__range-label">宽度</span>
          <TinySlider
            v-model.number="leftExpandedWidth"
            class="layout-slot-props-demo__range"
            :min="minLeftWidth"
            :max="availableLeftWidth"
            :step="leftWidthStep"
            :disabled="minLeftWidth === availableLeftWidth"
            @change="leftOpen = true"
          />
          <strong>{{ leftExpandedWidth }}px</strong>
        </label>
      </div>

      <div class="layout-slot-props-demo__group">
        <span class="layout-slot-props-demo__group-label">右侧栏</span>
        <TinyButton :reset-time="0" @click="rightOpen = !rightOpen">
          {{ rightOpen ? '关闭 Drawer' : '打开 Drawer' }}
        </TinyButton>
      </div>
    </div>

    <TrLayout
      class="layout-slot-props-demo__layout"
      :left-aside="leftAside"
      :right-aside="rightAside"
      @left-aside-open-change="updateLeftAsideOpen"
      @left-aside-resize="updateLeftAsideWidth"
      @right-aside-open-change="updateRightAsideOpen"
    >
      <template #left-aside>
        <div class="layout-slot-props-demo__aside">
          <p v-if="leftOpen">左侧栏宽度：{{ leftExpandedWidth }}px</p>
          <p v-else>左侧栏已关闭，请通过外部按钮重新展开。</p>
        </div>
      </template>

      <template #header>
        <div class="layout-slot-props-demo__header">Header 区域</div>
      </template>

      <template #main>
        <div class="layout-slot-props-demo__main">Main 区域</div>
      </template>

      <template #right-aside>
        <div class="layout-slot-props-demo__drawer">
          <p>Drawer</p>
          <p>由外部按钮控制开关。</p>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style>
.layout-slot-props-demo__layout {
  --tr-layout-height: 360px;
  --tr-layout-main-min-width: 0px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 16px;
}
</style>

<style scoped>
.layout-slot-props-demo {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
}

.layout-slot-props-demo__controls {
  display: grid;
  gap: 8px;
}

.layout-slot-props-demo__group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.layout-slot-props-demo__group-label {
  font-weight: 600;
}

.layout-slot-props-demo__range-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px 16px;
  flex-wrap: wrap;
}

.layout-slot-props-demo__range-label {
  font-weight: 600;
}

.layout-slot-props-demo__range {
  min-width: 160px;
  flex: 1;
}

.layout-slot-props-demo__header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
}

.layout-slot-props-demo__aside,
.layout-slot-props-demo__drawer,
.layout-slot-props-demo__main {
  display: grid;
  align-content: start;
  gap: 10px;
  box-sizing: border-box;
  height: 100%;
  padding: 16px;
  background: var(--vp-c-bg, #ffffff);
}

.layout-slot-props-demo__aside p,
.layout-slot-props-demo__drawer p {
  margin: 0;
}
</style>
