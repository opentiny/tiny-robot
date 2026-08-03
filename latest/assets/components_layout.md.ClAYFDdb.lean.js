const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/aside-toggle.DntuOQlv.js","assets/chunks/theme.Cp4egN6Z.js","assets/chunks/framework.DU7FgoRM.js","assets/chunks/main-scroll.B91vYpa4.js","assets/chunks/floating-panels.2txXwl80.js","assets/chunks/floating-controlled.BcS7WhNi.js","assets/chunks/floating.B0I92HsA.js","assets/chunks/aside-controlled.B_LLMm5C.js","assets/chunks/aside-resizable.C5ERXxN1.js","assets/chunks/aside-collapse-effect.k5K5lffV.js","assets/chunks/aside-modes.CE9U9W1w.js","assets/chunks/mode.QYIRqDfw.js","assets/chunks/basic.8m9Hexid.js"])))=>i.map(i=>d[i]);
import{aD as r,bQ as p,aZ as L,aL as w,v as F,H as g,bL as c,bB as u,J as e,bk as a,bJ as l,G as y,w as n,I as i,b7 as h,aU as W}from"./chunks/framework.DU7FgoRM.js";import{L as m,N as f}from"./chunks/index.jCZUXNFC.js";const S=`<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutAsideOpenValue } from '@opentiny/tiny-robot'

const leftOpen = ref(true)

function updateLeftAside(detail: LayoutAsideOpenValue) {
  leftOpen.value = detail.open
}
<\/script>

<template>
  <div class="layout-aside-toggle-demo">
    <TrLayout
      :left-aside="{ defaultOpen: true, defaultExpandedWidth: 168, collapsedWidth: 56 }"
      @left-aside-open-change="updateLeftAside"
    >
      <template #left-aside>
        <div class="layout-aside-toggle-demo__aside" :class="{ 'is-rail': !leftOpen }">
          <TrLayout.AsideToggle side="left" class="layout-aside-toggle-demo__toggle" aria-label="切换左侧栏">
            <template #default="{ isOpen }">
              <div :class="isOpen ? 'layout-aside-toggle-demo__chip' : 'layout-aside-toggle-demo__rail-chip'">
                {{ isOpen ? '收起' : '展开' }}
              </div>
            </template>
          </TrLayout.AsideToggle>
        </div>
      </template>

      <template #main>
        <div class="layout-aside-toggle-demo__main">按钮文案和形态直接使用 \`isOpen\` 插槽状态切换。</div>
      </template>
    </TrLayout>
  </div>
</template>

<style scoped>
.layout-aside-toggle-demo {
  --tr-layout-height: 280px;
  --tr-layout-main-min-width: 0;
  --tr-layout-left-aside-bg: var(--vp-c-bg-alt, #f8fafc);
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 16px;
}

.layout-aside-toggle-demo__aside {
  display: grid;
  align-content: center;
  gap: 8px;
  height: 100%;
  padding: 12px;
  box-sizing: border-box;
}

.layout-aside-toggle-demo__toggle {
  width: 100%;
}

.layout-aside-toggle-demo__chip,
.layout-aside-toggle-demo__rail-chip {
  display: grid;
  place-items: center;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  background: var(--vp-c-bg, #ffffff);
  color: inherit;
}

.layout-aside-toggle-demo__chip {
  min-height: 36px;
  padding: 0 12px;
  border-radius: 8px;
}

.layout-aside-toggle-demo__rail-chip {
  width: 40px;
  min-height: 40px;
  padding: 0;
  border-radius: 8px;
}

.layout-aside-toggle-demo__aside.is-rail {
  width: 56px;
  padding: 12px 8px;
  justify-items: center;
}

.layout-aside-toggle-demo__aside.is-rail .layout-aside-toggle-demo__toggle {
  width: auto;
}

.layout-aside-toggle-demo__main {
  display: grid;
  place-items: center;
  height: 100%;
  background: var(--vp-c-bg, #ffffff);
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
  padding: 16px;
  box-sizing: border-box;
}
</style>
`,X=`<script setup lang="ts">
import { ref } from 'vue'
import { TinyRadio, TinyRadioGroup, TinySwitch } from '@opentiny/vue'
import MainScrollBubble from './main-scroll-bubble.vue'
import MainScrollDiv from './main-scroll-div.vue'

const activeExample = ref<'bubble' | 'div'>('bubble')
const isCentered = ref(true)
<\/script>

<template>
  <div class="layout-main-scroll-demo">
    <div class="layout-main-scroll-demo__toolbar">
      <tiny-radio-group v-model="activeExample" aria-label="主区滚动示例切换">
        <tiny-radio label="bubble">BubbleList</tiny-radio>
        <tiny-radio label="div">普通 div</tiny-radio>
      </tiny-radio-group>

      <label class="layout-main-scroll-demo__field">
        <span>内容居中</span>
        <tiny-switch v-model="isCentered"></tiny-switch>
      </label>
    </div>
    <p class="layout-main-scroll-demo__tip">外层作为滚动宿主，内层只负责内容居中和限宽。</p>

    <div class="layout-main-scroll-demo__stage">
      <MainScrollBubble v-if="activeExample === 'bubble'" :centered="isCentered" />
      <MainScrollDiv v-else :centered="isCentered" />
    </div>
  </div>
</template>

<style scoped>
.layout-main-scroll-demo {
  display: grid;
  gap: 12px;
}

.layout-main-scroll-demo__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.layout-main-scroll-demo__field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-main-scroll-demo__tip {
  margin: 0;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-main-scroll-demo__stage {
  --tr-layout-height: 400px;
}
</style>
`,Z=`<script setup lang="ts">
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
<\/script>

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
            <TinyButton :reset-time="0" @click="rightOpen = true">右侧面板</TinyButton>
          </div>
        </div>
      </template>

      <template #main>
        <div class="layout-floating-panels-demo__main">
          <div class="layout-floating-panels-demo__card">左侧使用 dock，保留常驻导航区并占据浮层宽度。</div>
          <div class="layout-floating-panels-demo__card">右侧使用 drawer，需要时展开，不占主区宽度。</div>
          <div class="layout-floating-panels-demo__card">整个浮层仍可拖拽、缩放</div>
        </div>
      </template>

      <template #right-aside>
        <div class="layout-floating-panels-demo__aside">
          <div class="layout-floating-panels-demo__aside-title">右侧面板</div>
          <div>按需展开，不占主区宽度，适合放操作表单或补充面板。</div>
          <TrLayout.AsideToggle side="right" class="layout-floating-panels-demo__chip">关闭面板</TrLayout.AsideToggle>
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
`,z=`<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import { TinyBaseSelect, TinyButton, TinyNumeric, TinyOption } from '@opentiny/vue'
import type { LayoutFloatingOptions, LayoutFloatingState } from '@opentiny/tiny-robot'

type FloatingPlacement = LayoutFloatingState['placement']

const open = ref(false)
const placements: FloatingPlacement[] = ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'center']

const floatingState = ref<LayoutFloatingState>({
  placement: 'top-right',
  offsetX: 0,
  offsetY: 0,
  width: 520,
  height: 360,
})

const floatingOptions: LayoutFloatingOptions = {
  draggable: true,
  resizable: true,
  minWidth: 360,
  maxWidth: 720,
  minHeight: 260,
}

const stateText = computed(() => JSON.stringify(floatingState.value, null, 2))

function updateFloatingState(nextState: LayoutFloatingState) {
  floatingState.value = nextState
}
<\/script>

<template>
  <div class="layout-floating-controlled-demo">
    <div class="layout-floating-controlled-demo__toolbar">
      <TinyButton :reset-time="0" @click="open = !open">
        {{ open ? '关闭浮层' : '打开浮层' }}
      </TinyButton>
    </div>

    <div class="layout-floating-controlled-demo__controls">
      <label class="layout-floating-controlled-demo__field">
        <span>placement</span>
        <TinyBaseSelect v-model="floatingState.placement" class="layout-floating-controlled-demo__select">
          <TinyOption v-for="item in placements" :key="item" :label="item" :value="item" />
        </TinyBaseSelect>
      </label>

      <label class="layout-floating-controlled-demo__field">
        <span>offsetX</span>
        <TinyNumeric v-model="floatingState.offsetX" class="layout-floating-controlled-demo__numeric" />
      </label>

      <label class="layout-floating-controlled-demo__field">
        <span>offsetY</span>
        <TinyNumeric v-model="floatingState.offsetY" class="layout-floating-controlled-demo__numeric" />
      </label>

      <label class="layout-floating-controlled-demo__field">
        <span>width</span>
        <TinyNumeric v-model="floatingState.width" class="layout-floating-controlled-demo__numeric" />
      </label>

      <label class="layout-floating-controlled-demo__field">
        <span>height</span>
        <TinyNumeric v-model="floatingState.height" class="layout-floating-controlled-demo__numeric" />
      </label>
    </div>

    <pre class="layout-floating-controlled-demo__state">{{ stateText }}</pre>

    <TrLayout
      v-if="open"
      class="layout-floating-controlled-demo__layout"
      mode="floating"
      :floating-state="floatingState"
      :floating-options="floatingOptions"
      @update:floating-state="updateFloatingState"
    >
      <template #header>
        <div class="layout-floating-controlled-demo__header">
          <strong>受控浮层</strong>
          <TinyButton :reset-time="0" size="small" @click="open = false">关闭</TinyButton>
        </div>
      </template>

      <template #main>
        <div class="layout-floating-controlled-demo__main">
          <div class="layout-floating-controlled-demo__card">当前示例由外部维护 <code>floatingState</code>。</div>
          <div class="layout-floating-controlled-demo__card">
            拖拽或缩放后，变化会通过 <code>update:floatingState</code> 回传到外部状态。
          </div>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style>
.layout-floating-controlled-demo__layout {
  --tr-layout-floating-radius: 12px;
}
</style>

<style scoped>
.layout-floating-controlled-demo {
  display: grid;
  gap: 8px;
}

.layout-floating-controlled-demo__toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-floating-controlled-demo__controls {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-floating-controlled-demo__field {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-floating-controlled-demo__select {
  width: 148px;
}

.layout-floating-controlled-demo__numeric {
  width: 104px;
}

.layout-floating-controlled-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-floating-controlled-demo__main {
  display: grid;
  gap: 12px;
  padding: 16px;
}

.layout-floating-controlled-demo__card {
  padding: 12px 14px;
  border-radius: 12px;
  background: var(--vp-c-bg-soft, #f6f8fa);
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-floating-controlled-demo__state {
  box-sizing: border-box;
  margin: 0;
  padding: 12px;
  border-radius: 8px;
  overflow: auto;
  background: var(--vp-c-bg-soft, #f6f8fa);
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}
</style>
`,O=`<script setup lang="ts">
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
<\/script>

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
`,q=`<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import { TinyButton, TinySlider } from '@opentiny/vue'
import type { LayoutAsideOptions, LayoutAsideOpenValue, LayoutAsideResizeValue } from '@opentiny/tiny-robot'

const leftOpen = ref(true)
const leftExpandedWidth = ref(220)
const leftWidthMin = 160
const leftWidthMax = 320
const rightOpen = ref(false)

const leftAside = computed<LayoutAsideOptions>(() => ({
  open: leftOpen.value,
  expandedWidth: leftExpandedWidth.value,
  collapsedWidth: 0,
  minExpandedWidth: leftWidthMin,
  maxExpandedWidth: leftWidthMax,
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
<\/script>

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
`,R=`<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutAsideOptions, LayoutAsideResizeValue } from '@opentiny/tiny-robot'

const minExpandedWidth = 160
const maxExpandedWidth = 320
const expandedWidth = ref(220)

const leftAside = computed<LayoutAsideOptions>(() => ({
  defaultOpen: true,
  expandedWidth: expandedWidth.value,
  minExpandedWidth,
  maxExpandedWidth,
  resizable: true,
}))

function updateLeftAsideWidth(detail: LayoutAsideResizeValue) {
  expandedWidth.value = detail.expandedWidth
}
<\/script>

<template>
  <div class="layout-aside-resizable-demo">
    <TrLayout :left-aside="leftAside" @left-aside-resize="updateLeftAsideWidth">
      <template #left-aside>
        <div class="layout-aside-resizable-demo__aside">
          <strong>{{ expandedWidth }}px</strong>
          <span>拖动右侧分隔线</span>
        </div>
      </template>

      <template #main>
        <div class="layout-aside-resizable-demo__main">
          <div class="layout-aside-resizable-demo__metric">
            <span>最小宽度</span>
            <strong>{{ minExpandedWidth }}px</strong>
          </div>
          <div class="layout-aside-resizable-demo__metric">
            <span>当前宽度</span>
            <strong>{{ expandedWidth }}px</strong>
          </div>
          <div class="layout-aside-resizable-demo__metric">
            <span>最大宽度</span>
            <strong>{{ maxExpandedWidth }}px</strong>
          </div>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style scoped>
.layout-aside-resizable-demo {
  --tr-layout-height: 100%;
  --tr-layout-main-min-width: 0;
  --tr-layout-left-aside-bg: var(--vp-c-bg-alt, #f8fafc);
  height: 400px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 16px;
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-aside-resizable-demo__aside {
  display: grid;
  place-items: center;
  gap: 8px;
  height: 100%;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-aside-resizable-demo__aside strong {
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

.layout-aside-resizable-demo__main {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  align-content: center;
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-aside-resizable-demo__metric {
  display: grid;
  gap: 6px;
  padding: 12px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 8px;
  background: var(--vp-c-bg, #ffffff);
}

.layout-aside-resizable-demo__metric strong {
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}

@media (max-width: 520px) {
  .layout-aside-resizable-demo__main {
    grid-template-columns: 1fr;
  }
}
</style>
`,P=`<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import { TinyRadio, TinyRadioGroup, TinySlider, TinySwitch } from '@opentiny/vue'
import type { LayoutAsideCollapseEffect, LayoutAsideOptions } from '@opentiny/tiny-robot'

const collapseEffect = ref<LayoutAsideCollapseEffect>('overlay')
const collapsedWidth = ref(72)
const open = ref(true)

const leftAside = computed<LayoutAsideOptions>(() => ({
  open: open.value,
  expandedWidth: 176,
  collapsedWidth: collapsedWidth.value,
  collapseEffect: collapseEffect.value,
}))

const hint = computed(() =>
  collapseEffect.value === 'overlay' ? '收起时内容层不跟随宽度滑动' : '收起时内容层随宽度一起滑动',
)

const collapsedHint = computed(() =>
  collapsedWidth.value === 0 ? '当前收起到 0，主要看收起过程。' : '当前会留一条窄栏，更容易看出两种结果的差别。',
)
<\/script>

<template>
  <div class="layout-collapse-effect-demo">
    <div class="layout-collapse-effect-demo__controls">
      <div class="layout-collapse-effect-demo__group">
        <label class="layout-collapse-effect-demo__field">
          <span>收起方式</span>
          <tiny-radio-group v-model="collapseEffect">
            <tiny-radio label="overlay">overlay</tiny-radio>
            <tiny-radio label="slide">slide</tiny-radio>
          </tiny-radio-group>
        </label>

        <label class="layout-collapse-effect-demo__field">
          <span>展开</span>
          <tiny-switch v-model="open"></tiny-switch>
        </label>
      </div>

      <label class="layout-collapse-effect-demo__field layout-collapse-effect-demo__field--range">
        <span class="layout-collapse-effect-demo__range-label">收起宽度</span>
        <TinySlider
          v-model.number="collapsedWidth"
          class="layout-collapse-effect-demo__range"
          :min="0"
          :max="120"
          :step="4"
        />
        <strong>{{ collapsedWidth }}px</strong>
      </label>
    </div>

    <TrLayout class="layout-collapse-effect-demo__layout" :left-aside="leftAside">
      <template #left-aside>
        <div class="layout-collapse-effect-demo__aside">
          <div class="layout-collapse-effect-demo__aside-rail" />
          <div class="layout-collapse-effect-demo__aside-panel" />
        </div>
      </template>

      <template #main>
        <div class="layout-collapse-effect-demo__main">
          <strong>{{ collapseEffect }}</strong>
          <span>{{ hint }}</span>
          <em>{{ collapsedHint }}</em>
        </div>
      </template>
    </TrLayout>
  </div>
</template>

<style>
.layout-collapse-effect-demo__layout {
  --layout-collapse-effect-demo-aside-bg: color-mix(
    in srgb,
    var(--vp-c-brand-1, var(--tr-color-primary, #5e7ce0)) 6%,
    var(--vp-c-bg, #ffffff)
  );
  --layout-collapse-effect-demo-rail-bg: color-mix(in srgb, var(--vp-c-text-1, #1f2329) 4%, var(--vp-c-bg, #ffffff));
  --layout-collapse-effect-demo-panel-bg: color-mix(
    in srgb,
    var(--vp-c-brand-1, var(--tr-color-primary, #5e7ce0)) 10%,
    var(--vp-c-bg, #ffffff)
  );
  --tr-layout-height: 216px;
  --tr-layout-main-min-width: 0;
  --tr-layout-left-aside-bg: var(--layout-collapse-effect-demo-aside-bg);
  --tr-layout-main-bg: var(--vp-c-bg, #ffffff);
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 12px;
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
}
</style>

<style scoped>
.layout-collapse-effect-demo {
  display: grid;
  gap: 12px;
}

.layout-collapse-effect-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}

.layout-collapse-effect-demo__group {
  display: inline-flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.layout-collapse-effect-demo__field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-collapse-effect-demo__field--range {
  flex: 1 1 280px;
}

.layout-collapse-effect-demo__range-label {
  min-width: 60px;
}

.layout-collapse-effect-demo__range {
  min-width: 160px;
  flex: 1;
}

.layout-collapse-effect-demo__aside {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 10px;
  box-sizing: border-box;
  width: 176px;
  height: 100%;
  padding: 12px;
  background: var(--layout-collapse-effect-demo-aside-bg);
}

.layout-collapse-effect-demo__aside-rail,
.layout-collapse-effect-demo__aside-panel {
  height: 100%;
  border-radius: 12px;
}

.layout-collapse-effect-demo__aside-rail {
  background: var(--layout-collapse-effect-demo-rail-bg);
}

.layout-collapse-effect-demo__aside-panel {
  background: var(--layout-collapse-effect-demo-panel-bg);
}

.layout-collapse-effect-demo__main {
  display: grid;
  align-content: center;
  justify-items: center;
  gap: 8px;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
  text-align: center;
  background: var(--vp-c-bg, #ffffff);
}

.layout-collapse-effect-demo__main strong {
  color: var(--vp-c-text-1, var(--tr-text-primary, #1f2329));
  font-size: 14px;
}

.layout-collapse-effect-demo__main em {
  font-style: normal;
  font-size: 12px;
}
</style>
`,Y=`<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import { TinyButton } from '@opentiny/vue'
import type { LayoutAsideOpenValue } from '@opentiny/tiny-robot'

const rightOpen = ref(false)

function updateRightAside(detail: LayoutAsideOpenValue) {
  rightOpen.value = detail.open
}
<\/script>

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
        <div class="layout-aside-demo__main">左侧 \`dock\` 始终参与布局，右侧 \`drawer\` 按需覆盖主区。</div>
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
`,G=`<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import { TinyRadio, TinyRadioGroup } from '@opentiny/vue'
import type { LayoutMode } from '@opentiny/tiny-robot'

const mode = ref<LayoutMode>('normal')

const layoutProps = computed(() =>
  mode.value === 'floating'
    ? {
        mode: 'floating' as const,
        defaultFloatingState: {
          placement: 'center' as const,
          width: 220,
          height: 200,
        },
        floatingOptions: {
          draggable: true,
          resizable: true,
        },
      }
    : {
        mode: 'normal' as const,
      },
)
<\/script>

<template>
  <div class="layout-mode-demo">
    <tiny-radio-group v-model="mode">
      <tiny-radio label="normal">normal</tiny-radio>
      <tiny-radio label="floating">floating</tiny-radio>
    </tiny-radio-group>

    <div class="layout-mode-demo__stage">
      <TrLayout :key="mode" v-bind="layoutProps" class="layout-mode-demo__layout">
        <template #header>
          <div class="layout-mode-demo__header">{{ mode }}</div>
        </template>

        <template #main>
          <div class="layout-mode-demo__main">
            {{ mode === 'normal' ? '参与页面布局' : '挂载到 body 并悬浮显示' }}
          </div>
        </template>
      </TrLayout>
    </div>
  </div>
</template>

<style>
.layout-mode-demo__layout {
  --tr-layout-height: 220px;
  --tr-layout-main-min-width: 0;
  --tr-layout-floating-radius: 12px;
}
</style>

<style scoped>
.layout-mode-demo {
  display: grid;
  gap: 12px;
}

.layout-mode-demo__stage {
  position: relative;
  height: 260px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 16px;
}

.layout-mode-demo__header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  background: var(--vp-c-bg-soft, #f6f8fa);
  font-weight: 600;
}

.layout-mode-demo__main {
  display: grid;
  place-items: center;
  height: 100%;
  background: var(--vp-c-bg, #ffffff);
}
</style>
`,V=`<script setup lang="ts">
import { TrLayout } from '@opentiny/tiny-robot'
<\/script>

<template>
  <div class="layout-basic-demo">
    <TrLayout
      :left-aside="{ defaultOpen: true, defaultExpandedWidth: 160 }"
      :right-aside="{ defaultOpen: true, defaultExpandedWidth: 160 }"
    >
      <template #left-aside>
        <div class="layout-basic-demo__aside">Left-Aside</div>
      </template>

      <template #header>
        <div class="layout-basic-demo__header">Header</div>
      </template>

      <template #main>
        <div class="layout-basic-demo__main">Main</div>
      </template>

      <template #footer>
        <div class="layout-basic-demo__footer">Footer</div>
      </template>

      <template #right-aside>
        <div class="layout-basic-demo__aside">Right-Aside</div>
      </template>
    </TrLayout>
  </div>
</template>

<style scoped>
.layout-basic-demo {
  --tr-layout-height: 100%;
  --tr-layout-main-min-width: 0;
  --tr-layout-header-bg: var(--vp-c-bg-soft, #f6f8fa);
  --tr-layout-main-bg: var(--vp-c-bg, #ffffff);
  --tr-layout-footer-bg: var(--vp-c-bg-soft, #f6f8fa);
  --tr-layout-left-aside-bg: var(--vp-c-bg-alt, #f8fafc);
  --tr-layout-right-aside-bg: var(--vp-c-bg-alt, #f8fafc);
  height: 400px;
  overflow: hidden;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 16px;
}

.layout-basic-demo__header,
.layout-basic-demo__footer {
  padding: 12px 16px;
  text-align: center;
}

.layout-basic-demo__main,
.layout-basic-demo__aside {
  display: grid;
  place-items: center;
  height: 100%;
}
</style>
`,J=JSON.parse('{"title":"Layout 布局","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/layout.md","filePath":"components/layout.md"}'),I={name:"components/layout.md"},j=Object.assign(I,{setup(Q){const v=h();r(async()=>{v.value=(await p(async()=>{const{default:d}=await import("./chunks/aside-toggle.DntuOQlv.js");return{default:d}},__vite__mapDeps([0,1,2]))).default});const b=h();r(async()=>{b.value=(await p(async()=>{const{default:d}=await import("./chunks/main-scroll.B91vYpa4.js");return{default:d}},__vite__mapDeps([3,1,2]))).default});const _=h();r(async()=>{_.value=(await p(async()=>{const{default:d}=await import("./chunks/floating-panels.2txXwl80.js");return{default:d}},__vite__mapDeps([4,1,2]))).default});const E=h();r(async()=>{E.value=(await p(async()=>{const{default:d}=await import("./chunks/floating-controlled.BcS7WhNi.js");return{default:d}},__vite__mapDeps([5,1,2]))).default});const C=h();r(async()=>{C.value=(await p(async()=>{const{default:d}=await import("./chunks/floating.B0I92HsA.js");return{default:d}},__vite__mapDeps([6,1,2]))).default});const k=h();r(async()=>{k.value=(await p(async()=>{const{default:d}=await import("./chunks/aside-controlled.B_LLMm5C.js");return{default:d}},__vite__mapDeps([7,1,2]))).default});const x=h();r(async()=>{x.value=(await p(async()=>{const{default:d}=await import("./chunks/aside-resizable.C5ERXxN1.js");return{default:d}},__vite__mapDeps([8,1,2]))).default});const A=h();r(async()=>{A.value=(await p(async()=>{const{default:d}=await import("./chunks/aside-collapse-effect.k5K5lffV.js");return{default:d}},__vite__mapDeps([9,1,2]))).default});const B=h();r(async()=>{B.value=(await p(async()=>{const{default:d}=await import("./chunks/aside-modes.CE9U9W1w.js");return{default:d}},__vite__mapDeps([10,1,2]))).default});const D=h();r(async()=>{D.value=(await p(async()=>{const{default:d}=await import("./chunks/mode.QYIRqDfw.js");return{default:d}},__vite__mapDeps([11,1,2]))).default});const o=W(!0),T=h();return r(async()=>{T.value=(await p(async()=>{const{default:d}=await import("./chunks/basic.8m9Hexid.js");return{default:d}},__vite__mapDeps([12,1,2]))).default}),(d,t)=>{const s=L("ClientOnly");return w(),F("div",null,[t[11]||(t[11]=g("",6)),c(e(a(m),null,null,512),[[u,o.value]]),e(s,null,{default:l(()=>[e(a(f),{title:"基础布局",description:"最小布局示例。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{o.value=!1}),vueCode:a(V)},y({_:2},[T.value?{name:"vue",fn:l(()=>[e(a(T))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[12]||(t[12]=g("",3)),c(e(a(m),null,null,512),[[u,o.value]]),e(s,null,{default:l(()=>[e(a(f),{title:"布局模式",description:"切换 normal 和 floating 查看布局形态差异。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{o.value=!1}),vueCode:a(G)},y({_:2},[D.value?{name:"vue",fn:l(()=>[e(a(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[13]||(t[13]=g("",7)),c(e(a(m),null,null,512),[[u,o.value]]),e(s,null,{default:l(()=>[e(a(f),{title:"显示模式",description:"左侧占据页面空间，右侧覆盖在内容上方。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{o.value=!1}),vueCode:a(Y)},y({_:2},[B.value?{name:"vue",fn:l(()=>[e(a(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[14]||(t[14]=g("",3)),c(e(a(m),null,null,512),[[u,o.value]]),e(s,null,{default:l(()=>[e(a(f),{title:"收起行为",description:"对比 overlay 和 slide 两种收起动画。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[3]||(t[3]=()=>{o.value=!1}),vueCode:a(P)},y({_:2},[A.value?{name:"vue",fn:l(()=>[e(a(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[15]||(t[15]=n("h3",{id:"宽度调整",tabindex:"-1"},[i("宽度调整 "),n("a",{class:"header-anchor",href:"#宽度调整","aria-label":'Permalink to "宽度调整"'},"​")],-1)),t[16]||(t[16]=n("p",null,[n("code",null,"resizable"),i(" 可以开启 "),n("code",null,"dock"),i(" 侧栏的拖拽改宽，宽度范围由 "),n("code",null,"minExpandedWidth"),i(" 和 "),n("code",null,"maxExpandedWidth"),i(" 控制。")],-1)),c(e(a(m),null,null,512),[[u,o.value]]),e(s,null,{default:l(()=>[e(a(f),{title:"宽度调整",description:"拖动分隔线查看当前宽度和边界。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[4]||(t[4]=()=>{o.value=!1}),vueCode:a(R)},y({_:2},[x.value?{name:"vue",fn:l(()=>[e(a(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[17]||(t[17]=n("h3",{id:"侧栏受控",tabindex:"-1"},[i("侧栏受控 "),n("a",{class:"header-anchor",href:"#侧栏受控","aria-label":'Permalink to "侧栏受控"'},"​")],-1)),t[18]||(t[18]=n("p",null,[n("code",null,"open"),i(" 和 "),n("code",null,"expandedWidth"),i(" 是受控值，状态变化后需要通过事件同步外部状态。")],-1)),t[19]||(t[19]=n("p",null,[n("code",null,"defaultOpen"),i(" 和 "),n("code",null,"defaultExpandedWidth"),i(" 只提供初始值，适合不需要外部持续控制的场景。")],-1)),c(e(a(m),null,null,512),[[u,o.value]]),e(s,null,{default:l(()=>[e(a(f),{title:"侧栏受控",description:"外部控制侧栏开关和宽度。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[5]||(t[5]=()=>{o.value=!1}),vueCode:a(q)},y({_:2},[k.value?{name:"vue",fn:l(()=>[e(a(k))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[20]||(t[20]=g("",6)),c(e(a(m),null,null,512),[[u,o.value]]),e(s,null,{default:l(()=>[e(a(f),{title:"非受控浮层",description:"只设置初始位置和大小，后续由组件内部维护。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[6]||(t[6]=()=>{o.value=!1}),vueCode:a(O)},y({_:2},[C.value?{name:"vue",fn:l(()=>[e(a(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[21]||(t[21]=n("h3",{id:"受控浮层",tabindex:"-1"},[i("受控浮层 "),n("a",{class:"header-anchor",href:"#受控浮层","aria-label":'Permalink to "受控浮层"'},"​")],-1)),t[22]||(t[22]=n("p",null,[i("受控浮层以 "),n("code",null,"floatingState"),i(" 作为唯一状态源，组件始终按外部状态渲染。")],-1)),t[23]||(t[23]=n("p",null,[i("后续通过 "),n("code",null,"update:floatingState"),i(" 通知外部同步。")],-1)),c(e(a(m),null,null,512),[[u,o.value]]),e(s,null,{default:l(()=>[e(a(f),{title:"受控浮层",description:"由外部维护位置和尺寸状态。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[7]||(t[7]=()=>{o.value=!1}),vueCode:a(z)},y({_:2},[E.value?{name:"vue",fn:l(()=>[e(a(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[24]||(t[24]=n("h3",{id:"浮层模式下的侧栏",tabindex:"-1"},[i("浮层模式下的侧栏 "),n("a",{class:"header-anchor",href:"#浮层模式下的侧栏","aria-label":'Permalink to "浮层模式下的侧栏"'},"​")],-1)),t[25]||(t[25]=n("p",null,"浮层里同样可以放入侧栏、头部和主区。",-1)),c(e(a(m),null,null,512),[[u,o.value]]),e(s,null,{default:l(()=>[e(a(f),{title:"浮层模式下的侧栏",description:"在浮层里组合常驻侧栏和按需抽屉。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[8]||(t[8]=()=>{o.value=!1}),vueCode:a(Z)},y({_:2},[_.value?{name:"vue",fn:l(()=>[e(a(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[26]||(t[26]=g("",10)),c(e(a(m),null,null,512),[[u,o.value]]),e(s,null,{default:l(()=>[e(a(f),{title:"代理滚动条",description:"内容区居中后，滚动条仍固定在主区右侧。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22main-scroll.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Flayout%2Fmain-scroll.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TinyRadio%2C%20TinyRadioGroup%2C%20TinySwitch%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20MainScrollBubble%20from%20'.%2Fmain-scroll-bubble.vue'%5Cnimport%20MainScrollDiv%20from%20'.%2Fmain-scroll-div.vue'%5Cn%5Cnconst%20activeExample%20%3D%20ref%3C'bubble'%20%7C%20'div'%3E('bubble')%5Cnconst%20isCentered%20%3D%20ref(true)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-demo__toolbar%5C%22%3E%5Cn%20%20%20%20%20%20%3Ctiny-radio-group%20v-model%3D%5C%22activeExample%5C%22%20aria-label%3D%5C%22%E4%B8%BB%E5%8C%BA%E6%BB%9A%E5%8A%A8%E7%A4%BA%E4%BE%8B%E5%88%87%E6%8D%A2%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ctiny-radio%20label%3D%5C%22bubble%5C%22%3EBubbleList%3C%2Ftiny-radio%3E%5Cn%20%20%20%20%20%20%20%20%3Ctiny-radio%20label%3D%5C%22div%5C%22%3E%E6%99%AE%E9%80%9A%20div%3C%2Ftiny-radio%3E%5Cn%20%20%20%20%20%20%3C%2Ftiny-radio-group%3E%5Cn%5Cn%20%20%20%20%20%20%3Clabel%20class%3D%5C%22layout-main-scroll-demo__field%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cspan%3E%E5%86%85%E5%AE%B9%E5%B1%85%E4%B8%AD%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%3Ctiny-switch%20v-model%3D%5C%22isCentered%5C%22%3E%3C%2Ftiny-switch%3E%5Cn%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22layout-main-scroll-demo__tip%5C%22%3E%E5%A4%96%E5%B1%82%E4%BD%9C%E4%B8%BA%E6%BB%9A%E5%8A%A8%E5%AE%BF%E4%B8%BB%EF%BC%8C%E5%86%85%E5%B1%82%E5%8F%AA%E8%B4%9F%E8%B4%A3%E5%86%85%E5%AE%B9%E5%B1%85%E4%B8%AD%E5%92%8C%E9%99%90%E5%AE%BD%E3%80%82%3C%2Fp%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-demo__stage%5C%22%3E%5Cn%20%20%20%20%20%20%3CMainScrollBubble%20v-if%3D%5C%22activeExample%20%3D%3D%3D%20'bubble'%5C%22%20%3Acentered%3D%5C%22isCentered%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3CMainScrollDiv%20v-else%20%3Acentered%3D%5C%22isCentered%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.layout-main-scroll-demo%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__toolbar%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__field%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20color%3A%20var(--vp-c-text-2%2C%20var(--tr-text-secondary%2C%20%234e5969))%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__tip%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20color%3A%20var(--vp-c-text-2%2C%20var(--tr-text-secondary%2C%20%234e5969))%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__stage%20%7B%5Cn%20%20--tr-layout-height%3A%20400px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22main-scroll-bubble.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Flayout%2Fmain-scroll-bubble.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20BubbleList%2C%20TrLayout%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20type%20%7B%20BubbleListProps%2C%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cnconst%20props%20%3D%20defineProps%3C%7B%5Cn%20%20centered%3A%20boolean%5Cn%7D%3E()%5Cn%5Cnconst%20scrollTargetRef%20%3D%20ref%3CHTMLElement%20%7C%20null%3E(null)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20user%3A%20%7B%20placement%3A%20'end'%20%7D%2C%5Cn%20%20assistant%3A%20%7B%20placement%3A%20'start'%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20messages%3A%20BubbleListProps%5B'messages'%5D%20%3D%20Array.from(%7B%20length%3A%2012%20%7D%2C%20(_%2C%20index)%20%3D%3E%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20content%3A%20%60%E7%AC%AC%20%24%7Bindex%20%2B%201%7D%20%E8%BD%AE%EF%BC%9A%E5%B8%AE%E6%88%91%E6%95%B4%E7%90%86%E4%B8%80%E4%B8%8B%E5%BD%93%E5%89%8D%E5%B8%83%E5%B1%80%E7%9A%84%E6%BB%9A%E5%8A%A8%E5%8C%BA%E3%80%82%60%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%20'%E5%8F%AF%E4%BB%A5%E3%80%82%E5%86%85%E5%AE%B9%E5%8C%BA%E5%8F%AF%E4%BB%A5%E5%B1%85%E4%B8%AD%E6%98%BE%E7%A4%BA%EF%BC%8C%E6%BB%9A%E5%8A%A8%E6%9D%A1%E4%BB%8D%E7%84%B6%E5%9B%BA%E5%AE%9A%E5%9C%A8%20Layout%20%E4%B8%BB%E5%8C%BA%E5%8F%B3%E4%BE%A7%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%5D).flat()%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3CTrLayout%3E%5Cn%20%20%20%20%3Ctemplate%20%23main%3E%5Cn%20%20%20%20%20%20%3Cdiv%20ref%3D%5C%22scrollTargetRef%5C%22%20class%3D%5C%22layout-main-scroll-bubble-host%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-bubble-host__content%5C%22%20%3Aclass%3D%5C%22%7B%20'is-centered'%3A%20props.centered%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3CBubbleList%20class%3D%5C%22layout-main-scroll-bubble%5C%22%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3CTrLayout.ProxyScrollbar%20%3Ascroll-target%3D%5C%22scrollTargetRef%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%3C%2FTrLayout%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.layout-main-scroll-bubble-host%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-bubble-host__content.is-centered%20%7B%5Cn%20%20max-width%3A%20450px%3B%5Cn%20%20margin%3A%200%20auto%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-bubble%20%7B%5Cn%20%20--tr-bubble-list-padding%3A%2016px%3B%5Cn%20%20overflow%3A%20visible%3B%5Cn%7D%5Cn%5Cn%3Adeep(%5Bdata-role%3D'user'%5D)%20%7B%5Cn%20%20--tr-bubble-box-bg%3A%20var(--tr-color-primary-light)%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22main-scroll-div.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Flayout%2Fmain-scroll-div.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrLayout%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cnconst%20props%20%3D%20defineProps%3C%7B%5Cn%20%20centered%3A%20boolean%5Cn%7D%3E()%5Cn%5Cnconst%20scrollTargetRef%20%3D%20ref%3CHTMLElement%20%7C%20null%3E(null)%5Cn%5Cnconst%20sections%20%3D%20Array.from(%7B%20length%3A%2012%20%7D%2C%20(_%2C%20index)%20%3D%3E%20index%20%2B%201)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3CTrLayout%3E%5Cn%20%20%20%20%3Ctemplate%20%23main%3E%5Cn%20%20%20%20%20%20%3Cdiv%20ref%3D%5C%22scrollTargetRef%5C%22%20class%3D%5C%22layout-main-scroll-div%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-div__content%5C%22%20%3Aclass%3D%5C%22%7B%20'is-centered'%3A%20props.centered%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Csection%20v-for%3D%5C%22section%20in%20sections%5C%22%20%3Akey%3D%5C%22section%5C%22%20class%3D%5C%22layout-main-scroll-div__item%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cstrong%3ESection%20%7B%7B%20section%20%7D%7D%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cp%3E%E6%99%AE%E9%80%9A%E5%86%85%E5%AE%B9%E5%8C%BA%E4%B9%9F%E5%8F%AF%E4%BB%A5%E6%8A%8A%E6%BB%9A%E5%8A%A8%E5%AE%BF%E4%B8%BB%E4%BA%A4%E7%BB%99%20Layout.ProxyScrollbar%20%E4%BB%A3%E7%90%86%E6%BB%9A%E5%8A%A8%E6%9D%A1%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fsection%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3CTrLayout.ProxyScrollbar%20%3Ascroll-target%3D%5C%22scrollTargetRef%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%3C%2FTrLayout%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.layout-main-scroll-div%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-div__content%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%20%20padding%3A%2016px%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-div__content.is-centered%20%7B%5Cn%20%20max-width%3A%20550px%3B%5Cn%20%20margin%3A%200%20auto%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-div__item%20%7B%5Cn%20%20padding%3A%2016px%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider%2C%20var(--tr-border-color%2C%20%23dcdfe6))%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%20%20background%3A%20var(--vp-c-bg%2C%20%23ffffff)%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-div__item%20p%20%7B%5Cn%20%20margin%3A%208px%200%200%3B%5Cn%20%20color%3A%20var(--vp-c-text-2%2C%20var(--tr-text-secondary%2C%20%234e5969))%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[9]||(t[9]=()=>{o.value=!1}),vueCode:a(X)},y({_:2},[b.value?{name:"vue",fn:l(()=>[e(a(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[27]||(t[27]=g("",7)),c(e(a(m),null,null,512),[[u,o.value]]),e(s,null,{default:l(()=>[e(a(f),{title:"侧栏开关",description:"在侧栏内容中使用 AsideToggle 触发当前侧栏开关。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[10]||(t[10]=()=>{o.value=!1}),vueCode:a(S)},y({_:2},[v.value?{name:"vue",fn:l(()=>[e(a(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[28]||(t[28]=g("",42))])}}});export{J as __pageData,j as default};
