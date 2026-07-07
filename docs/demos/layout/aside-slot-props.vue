<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import { TinyButton, TinySlider } from '@opentiny/vue'
import type { LayoutAsideProps, LayoutAsideOpenValue, LayoutAsideResizeValue } from '@opentiny/tiny-robot'

const leftOpen = ref(true)
const leftExpandedWidth = ref(220)
const leftWidthMin = 160
const leftWidthMax = 320
const rightOpen = ref(false)

const leftAside = computed<LayoutAsideProps>(() => ({
  open: leftOpen.value,
  expandedWidth: leftExpandedWidth.value,
  collapsedWidth: 0,
  minExpandedWidth: leftWidthMin,
  maxExpandedWidth: leftWidthMax,
  resizable: true,
}))

const rightAside = computed<LayoutAsideProps>(() => ({
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
  <div class="layout-slot-props-demo">
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
            :min="leftWidthMin"
            :max="leftWidthMax"
            :step="4"
            @change="leftOpen = true"
          />
          <strong>{{ leftExpandedWidth }}px</strong>
        </label>
      </div>

      <div class="layout-slot-props-demo__group">
        <span class="layout-slot-props-demo__group-label">右侧栏</span>
        <TinyButton :reset-time="0" @click="rightOpen = !rightOpen">
          {{ rightOpen ? '关闭抽屉' : '打开抽屉' }}
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
          <template v-if="leftOpen">
            <p>左侧栏宽度：{{ leftExpandedWidth }}px</p>
            <TrLayout.AsideToggle side="left" class="layout-slot-props-demo__button">
              <template #default="{ isOpen }">
                {{ isOpen ? '收起侧栏' : '展开侧栏' }}
              </template>
            </TrLayout.AsideToggle>
          </template>
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
          <p>右侧抽屉</p>
          <TrLayout.AsideToggle side="right" class="layout-slot-props-demo__button"> 关闭抽屉 </TrLayout.AsideToggle>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style>
.layout-slot-props-demo__layout {
  --tr-layout-height: 360px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 16px;
}
</style>

<style scoped>
.layout-slot-props-demo {
  display: grid;
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

.layout-slot-props-demo__button {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 8px;
  background: var(--vp-c-bg, #ffffff);
  cursor: pointer;
}

.layout-slot-props-demo__range-wrap {
  display: inline-flex;
  align-items: center;
  gap: 8px;
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
