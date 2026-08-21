const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/aside-toggle.BcRGgHWA.js","assets/chunks/theme.BmH3qq_L.js","assets/chunks/framework.CUa_Cx66.js","assets/chunks/main-scroll.B5cc_1zT.js","assets/chunks/floating-panels.BHOpPp7y.js","assets/chunks/floating-controlled.D7UCNTsZ.js","assets/chunks/floating.Cjsz_FoT.js","assets/chunks/aside-controlled.DEVN1aa6.js","assets/chunks/aside-resizable.q7J8rr6V.js","assets/chunks/aside-collapse-effect.D-2l-0Ag.js","assets/chunks/aside-modes.a6f6-y_c.js","assets/chunks/mode.BsGohitV.js","assets/chunks/basic.CrNyiMr0.js"])))=>i.map(i=>d[i]);
import{aD as r,bQ as p,aZ as L,aL as w,v as F,H as g,bL as c,bB as u,J as e,bk as a,bJ as l,G as y,w as n,I as i,b7 as h,aU as W}from"./chunks/framework.CUa_Cx66.js";import{L as m,N as f}from"./chunks/index.C4PESc4f.js";const S=`<script setup lang="ts">
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
`,J=JSON.parse('{"title":"Layout 布局","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/layout.md","filePath":"components/layout.md"}'),I={name:"components/layout.md"},j=Object.assign(I,{setup(Q){const v=h();r(async()=>{v.value=(await p(async()=>{const{default:d}=await import("./chunks/aside-toggle.BcRGgHWA.js");return{default:d}},__vite__mapDeps([0,1,2]))).default});const b=h();r(async()=>{b.value=(await p(async()=>{const{default:d}=await import("./chunks/main-scroll.B5cc_1zT.js");return{default:d}},__vite__mapDeps([3,1,2]))).default});const _=h();r(async()=>{_.value=(await p(async()=>{const{default:d}=await import("./chunks/floating-panels.BHOpPp7y.js");return{default:d}},__vite__mapDeps([4,1,2]))).default});const E=h();r(async()=>{E.value=(await p(async()=>{const{default:d}=await import("./chunks/floating-controlled.D7UCNTsZ.js");return{default:d}},__vite__mapDeps([5,1,2]))).default});const C=h();r(async()=>{C.value=(await p(async()=>{const{default:d}=await import("./chunks/floating.Cjsz_FoT.js");return{default:d}},__vite__mapDeps([6,1,2]))).default});const k=h();r(async()=>{k.value=(await p(async()=>{const{default:d}=await import("./chunks/aside-controlled.DEVN1aa6.js");return{default:d}},__vite__mapDeps([7,1,2]))).default});const x=h();r(async()=>{x.value=(await p(async()=>{const{default:d}=await import("./chunks/aside-resizable.q7J8rr6V.js");return{default:d}},__vite__mapDeps([8,1,2]))).default});const A=h();r(async()=>{A.value=(await p(async()=>{const{default:d}=await import("./chunks/aside-collapse-effect.D-2l-0Ag.js");return{default:d}},__vite__mapDeps([9,1,2]))).default});const B=h();r(async()=>{B.value=(await p(async()=>{const{default:d}=await import("./chunks/aside-modes.a6f6-y_c.js");return{default:d}},__vite__mapDeps([10,1,2]))).default});const D=h();r(async()=>{D.value=(await p(async()=>{const{default:d}=await import("./chunks/mode.BsGohitV.js");return{default:d}},__vite__mapDeps([11,1,2]))).default});const o=W(!0),T=h();return r(async()=>{T.value=(await p(async()=>{const{default:d}=await import("./chunks/basic.CrNyiMr0.js");return{default:d}},__vite__mapDeps([12,1,2]))).default}),(d,t)=>{const s=L("ClientOnly");return w(),F("div",null,[t[11]||(t[11]=g('<h1 id="layout-布局" tabindex="-1">Layout 布局 <a class="header-anchor" href="#layout-布局" aria-label="Permalink to &quot;Layout 布局&quot;">​</a></h1><p><code>Layout</code> 是 AI 应用页面的通用布局组件，可用于搭建聊天页、工作台和多面板操作界面。</p><p>它提供以下能力：</p><ul><li>页面骨架：统一组织头部、主区、底部与左右侧栏</li><li>侧栏交互：支持展开、收起、拖拽改宽和 <code>drawer</code> 覆盖</li><li>浮层布局：支持定位、拖拽和缩放</li><li>代理滚动条：适用于内容列居中或限宽后，原生滚动条偏离主区右边界的场景</li></ul><h2 id="基础布局" tabindex="-1">基础布局 <a class="header-anchor" href="#基础布局" aria-label="Permalink to &quot;基础布局&quot;">​</a></h2><p><code>Layout</code> 提供 <code>left-aside</code>、<code>header</code>、<code>main</code>、<code>footer</code> 和 <code>right-aside</code> 五个区域插槽，用于编排页面结构。</p>',6)),c(e(a(m),null,null,512),[[u,o.value]]),e(s,null,{default:l(()=>[e(a(f),{title:"基础布局",description:"最小布局示例。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{o.value=!1}),vueCode:a(V)},y({_:2},[T.value?{name:"vue",fn:l(()=>[e(a(T))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[12]||(t[12]=g('<h2 id="布局模式" tabindex="-1">布局模式 <a class="header-anchor" href="#布局模式" aria-label="Permalink to &quot;布局模式&quot;">​</a></h2><p><code>mode</code> 控制 <code>Layout</code> 的整体形态，默认值为 <code>normal</code>。</p><ul><li><code>normal</code>：普通页面骨架，参与文档流布局</li><li><code>floating</code>：悬浮布局，脱离文档流，可用于构建悬浮工作区或拖拽窗口</li></ul>',3)),c(e(a(m),null,null,512),[[u,o.value]]),e(s,null,{default:l(()=>[e(a(f),{title:"布局模式",description:"切换 normal 和 floating 查看布局形态差异。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{o.value=!1}),vueCode:a(G)},y({_:2},[D.value?{name:"vue",fn:l(()=>[e(a(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[13]||(t[13]=g('<h2 id="侧栏" tabindex="-1">侧栏 <a class="header-anchor" href="#侧栏" aria-label="Permalink to &quot;侧栏&quot;">​</a></h2><p>侧栏由 <code>leftAside</code> / <code>rightAside</code> 控制，类型为 <a href="#layout-aside-options"><code>LayoutAsideOptions</code></a>。</p><p>侧栏内容通过 <code>left-aside</code> / <code>right-aside</code> 插槽提供。</p><h3 id="展示形态" tabindex="-1">展示形态 <a class="header-anchor" href="#展示形态" aria-label="Permalink to &quot;展示形态&quot;">​</a></h3><p><code>LayoutAsideOptions.mode</code> 控制侧栏展示形态，默认值为 <code>dock</code>。</p><ul><li><code>dock</code>：占据页面空间</li><li><code>drawer</code>：覆盖在内容上方</li></ul><p><code>drawer</code> 的宽度优先通过 <code>--tr-layout-drawer-width</code> 控制，未设置时回退到侧栏展开宽度。</p>',7)),c(e(a(m),null,null,512),[[u,o.value]]),e(s,null,{default:l(()=>[e(a(f),{title:"显示模式",description:"左侧占据页面空间，右侧覆盖在内容上方。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{o.value=!1}),vueCode:a(Y)},y({_:2},[B.value?{name:"vue",fn:l(()=>[e(a(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[14]||(t[14]=g('<h3 id="收起行为" tabindex="-1">收起行为 <a class="header-anchor" href="#收起行为" aria-label="Permalink to &quot;收起行为&quot;">​</a></h3><p><code>collapsedWidth</code> 控制收起后还保留多少宽度，仅 <code>dock</code> 模式生效；<code>collapseEffect</code> 控制收起时的动画效果。</p><ul><li><code>collapsedWidth &gt; 0</code>：收起后保留一条窄栏</li><li><code>collapsedWidth = 0</code>：收起后完全隐藏</li><li><code>overlay</code>：侧栏外框保留，内容层不跟随宽度滑动</li><li><code>slide</code>：侧栏内容随宽度一起滑出</li></ul>',3)),c(e(a(m),null,null,512),[[u,o.value]]),e(s,null,{default:l(()=>[e(a(f),{title:"收起行为",description:"对比 overlay 和 slide 两种收起动画。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[3]||(t[3]=()=>{o.value=!1}),vueCode:a(P)},y({_:2},[A.value?{name:"vue",fn:l(()=>[e(a(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[15]||(t[15]=n("h3",{id:"宽度调整",tabindex:"-1"},[i("宽度调整 "),n("a",{class:"header-anchor",href:"#宽度调整","aria-label":'Permalink to "宽度调整"'},"​")],-1)),t[16]||(t[16]=n("p",null,[n("code",null,"resizable"),i(" 可以开启 "),n("code",null,"dock"),i(" 侧栏的拖拽改宽，宽度范围由 "),n("code",null,"minExpandedWidth"),i(" 和 "),n("code",null,"maxExpandedWidth"),i(" 控制。")],-1)),c(e(a(m),null,null,512),[[u,o.value]]),e(s,null,{default:l(()=>[e(a(f),{title:"宽度调整",description:"拖动分隔线查看当前宽度和边界。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[4]||(t[4]=()=>{o.value=!1}),vueCode:a(R)},y({_:2},[x.value?{name:"vue",fn:l(()=>[e(a(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[17]||(t[17]=n("h3",{id:"侧栏受控",tabindex:"-1"},[i("侧栏受控 "),n("a",{class:"header-anchor",href:"#侧栏受控","aria-label":'Permalink to "侧栏受控"'},"​")],-1)),t[18]||(t[18]=n("p",null,[n("code",null,"open"),i(" 和 "),n("code",null,"expandedWidth"),i(" 是受控值，状态变化后需要通过事件同步外部状态。")],-1)),t[19]||(t[19]=n("p",null,[n("code",null,"defaultOpen"),i(" 和 "),n("code",null,"defaultExpandedWidth"),i(" 只提供初始值，适合不需要外部持续控制的场景。")],-1)),c(e(a(m),null,null,512),[[u,o.value]]),e(s,null,{default:l(()=>[e(a(f),{title:"侧栏受控",description:"外部控制侧栏开关和宽度。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[5]||(t[5]=()=>{o.value=!1}),vueCode:a(q)},y({_:2},[k.value?{name:"vue",fn:l(()=>[e(a(k))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[20]||(t[20]=g('<h2 id="浮层" tabindex="-1">浮层 <a class="header-anchor" href="#浮层" aria-label="Permalink to &quot;浮层&quot;">​</a></h2><p>浮层相关配置和交互只在浮层模式(<code>mode=&quot;floating&quot;</code>)下生效。</p><ul><li><code>defaultFloatingState</code>：非受控初始状态，只在首次加载时读取</li><li><code>floatingState</code>：受控状态，由外部维护当前位置和尺寸</li><li><code>floatingOptions</code>：浮层行为配置，用于拖拽、缩放和尺寸约束</li></ul><blockquote><p><code>defaultFloatingState</code> 和 <code>floatingState</code> 不要同时传入</p></blockquote><h3 id="非受控浮层" tabindex="-1">非受控浮层 <a class="header-anchor" href="#非受控浮层" aria-label="Permalink to &quot;非受控浮层&quot;">​</a></h3><p>非受控浮层通过 <code>defaultFloatingState</code> 设置初始位置和尺寸。</p>',6)),c(e(a(m),null,null,512),[[u,o.value]]),e(s,null,{default:l(()=>[e(a(f),{title:"非受控浮层",description:"只设置初始位置和大小，后续由组件内部维护。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[6]||(t[6]=()=>{o.value=!1}),vueCode:a(O)},y({_:2},[C.value?{name:"vue",fn:l(()=>[e(a(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[21]||(t[21]=n("h3",{id:"受控浮层",tabindex:"-1"},[i("受控浮层 "),n("a",{class:"header-anchor",href:"#受控浮层","aria-label":'Permalink to "受控浮层"'},"​")],-1)),t[22]||(t[22]=n("p",null,[i("受控浮层以 "),n("code",null,"floatingState"),i(" 作为唯一状态源，组件始终按外部状态渲染。")],-1)),t[23]||(t[23]=n("p",null,[i("后续通过 "),n("code",null,"update:floatingState"),i(" 通知外部同步。")],-1)),c(e(a(m),null,null,512),[[u,o.value]]),e(s,null,{default:l(()=>[e(a(f),{title:"受控浮层",description:"由外部维护位置和尺寸状态。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[7]||(t[7]=()=>{o.value=!1}),vueCode:a(z)},y({_:2},[E.value?{name:"vue",fn:l(()=>[e(a(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[24]||(t[24]=n("h3",{id:"浮层模式下的侧栏",tabindex:"-1"},[i("浮层模式下的侧栏 "),n("a",{class:"header-anchor",href:"#浮层模式下的侧栏","aria-label":'Permalink to "浮层模式下的侧栏"'},"​")],-1)),t[25]||(t[25]=n("p",null,"浮层里同样可以放入侧栏、头部和主区。",-1)),c(e(a(m),null,null,512),[[u,o.value]]),e(s,null,{default:l(()=>[e(a(f),{title:"浮层模式下的侧栏",description:"在浮层里组合常驻侧栏和按需抽屉。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[8]||(t[8]=()=>{o.value=!1}),vueCode:a(Z)},y({_:2},[_.value?{name:"vue",fn:l(()=>[e(a(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[26]||(t[26]=g(`<h2 id="代理滚动条" tabindex="-1">代理滚动条 <a class="header-anchor" href="#代理滚动条" aria-label="Permalink to &quot;代理滚动条&quot;">​</a></h2><p>在布局组件中，消息列表通常作为内部滚动区域存在。但当消息列表的宽度小于外层容器宽度时，浏览器原生滚动条会出现在消息列表自身的右侧，而不是外层容器的右侧。</p><p>为了解决这个布局问题，布局组件内部使用 ProxyScrollbar 渲染代理滚动条。代理滚动条与消息列表平级，通过接收消息列表的 DOM 引用来同步真实滚动状态，并将滚动条视觉上渲染到外层容器右侧。</p><h3 id="使用要求" tabindex="-1">使用要求 <a class="header-anchor" href="#使用要求" aria-label="Permalink to &quot;使用要求&quot;">​</a></h3><ul><li>将实际承担滚动的元素传给 <code>scrollTarget</code>。</li><li>为使 <code>Layout.ProxyScrollbar</code> 正常生效，传给 <code>scrollTarget</code> 的滚动容器需要具备明确高度，并通过 <code>overflow: auto</code> 或 <code>overflow: scroll</code> 承担真实滚动。</li></ul><blockquote><p>scrollTarget 推荐的样式如下：</p></blockquote><div class="language-css vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">css</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">.scroll-host</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  height</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">100</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">%</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  overflow</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">auto</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="基本结构" tabindex="-1">基本结构 <a class="header-anchor" href="#基本结构" aria-label="Permalink to &quot;基本结构&quot;">​</a></h3><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> setup</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> lang</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;ts&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { ref } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { TrLayout } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> messageListRef</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ref</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">HTMLElement</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrLayout</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> #</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">main</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">div</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ref</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;messageListRef&quot;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> class</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;message-list&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        &lt;!-- messages --&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">div</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrLayout.ProxyScrollbar</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">scroll-target</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">messageListRef</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> /&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">TrLayout</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><h3 id="使用示例" tabindex="-1">使用示例 <a class="header-anchor" href="#使用示例" aria-label="Permalink to &quot;使用示例&quot;">​</a></h3>`,10)),c(e(a(m),null,null,512),[[u,o.value]]),e(s,null,{default:l(()=>[e(a(f),{title:"代理滚动条",description:"内容区居中后，滚动条仍固定在主区右侧。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22main-scroll.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Flayout%2Fmain-scroll.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TinyRadio%2C%20TinyRadioGroup%2C%20TinySwitch%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20MainScrollBubble%20from%20'.%2Fmain-scroll-bubble.vue'%5Cnimport%20MainScrollDiv%20from%20'.%2Fmain-scroll-div.vue'%5Cn%5Cnconst%20activeExample%20%3D%20ref%3C'bubble'%20%7C%20'div'%3E('bubble')%5Cnconst%20isCentered%20%3D%20ref(true)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-demo%5C%22%3E%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-demo__toolbar%5C%22%3E%5Cn%20%20%20%20%20%20%3Ctiny-radio-group%20v-model%3D%5C%22activeExample%5C%22%20aria-label%3D%5C%22%E4%B8%BB%E5%8C%BA%E6%BB%9A%E5%8A%A8%E7%A4%BA%E4%BE%8B%E5%88%87%E6%8D%A2%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Ctiny-radio%20label%3D%5C%22bubble%5C%22%3EBubbleList%3C%2Ftiny-radio%3E%5Cn%20%20%20%20%20%20%20%20%3Ctiny-radio%20label%3D%5C%22div%5C%22%3E%E6%99%AE%E9%80%9A%20div%3C%2Ftiny-radio%3E%5Cn%20%20%20%20%20%20%3C%2Ftiny-radio-group%3E%5Cn%5Cn%20%20%20%20%20%20%3Clabel%20class%3D%5C%22layout-main-scroll-demo__field%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cspan%3E%E5%86%85%E5%AE%B9%E5%B1%85%E4%B8%AD%3C%2Fspan%3E%5Cn%20%20%20%20%20%20%20%20%3Ctiny-switch%20v-model%3D%5C%22isCentered%5C%22%3E%3C%2Ftiny-switch%3E%5Cn%20%20%20%20%20%20%3C%2Flabel%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3Cp%20class%3D%5C%22layout-main-scroll-demo__tip%5C%22%3E%E5%A4%96%E5%B1%82%E4%BD%9C%E4%B8%BA%E6%BB%9A%E5%8A%A8%E5%AE%BF%E4%B8%BB%EF%BC%8C%E5%86%85%E5%B1%82%E5%8F%AA%E8%B4%9F%E8%B4%A3%E5%86%85%E5%AE%B9%E5%B1%85%E4%B8%AD%E5%92%8C%E9%99%90%E5%AE%BD%E3%80%82%3C%2Fp%3E%5Cn%5Cn%20%20%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-demo__stage%5C%22%3E%5Cn%20%20%20%20%20%20%3CMainScrollBubble%20v-if%3D%5C%22activeExample%20%3D%3D%3D%20'bubble'%5C%22%20%3Acentered%3D%5C%22isCentered%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3CMainScrollDiv%20v-else%20%3Acentered%3D%5C%22isCentered%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.layout-main-scroll-demo%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__toolbar%20%7B%5Cn%20%20display%3A%20flex%3B%5Cn%20%20flex-wrap%3A%20wrap%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__field%20%7B%5Cn%20%20display%3A%20inline-flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%208px%3B%5Cn%20%20color%3A%20var(--vp-c-text-2%2C%20var(--tr-text-secondary%2C%20%234e5969))%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__tip%20%7B%5Cn%20%20margin%3A%200%3B%5Cn%20%20color%3A%20var(--vp-c-text-2%2C%20var(--tr-text-secondary%2C%20%234e5969))%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-demo__stage%20%7B%5Cn%20%20--tr-layout-height%3A%20400px%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22main-scroll-bubble.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Flayout%2Fmain-scroll-bubble.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20BubbleList%2C%20TrLayout%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20type%20%7B%20BubbleListProps%2C%20BubbleRoleConfig%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cnconst%20props%20%3D%20defineProps%3C%7B%5Cn%20%20centered%3A%20boolean%5Cn%7D%3E()%5Cn%5Cnconst%20scrollTargetRef%20%3D%20ref%3CHTMLElement%20%7C%20null%3E(null)%5Cn%5Cnconst%20roles%3A%20Record%3Cstring%2C%20BubbleRoleConfig%3E%20%3D%20%7B%5Cn%20%20user%3A%20%7B%20placement%3A%20'end'%20%7D%2C%5Cn%20%20assistant%3A%20%7B%20placement%3A%20'start'%20%7D%2C%5Cn%7D%5Cn%5Cnconst%20messages%3A%20BubbleListProps%5B'messages'%5D%20%3D%20Array.from(%7B%20length%3A%2012%20%7D%2C%20(_%2C%20index)%20%3D%3E%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20content%3A%20%60%E7%AC%AC%20%24%7Bindex%20%2B%201%7D%20%E8%BD%AE%EF%BC%9A%E5%B8%AE%E6%88%91%E6%95%B4%E7%90%86%E4%B8%80%E4%B8%8B%E5%BD%93%E5%89%8D%E5%B8%83%E5%B1%80%E7%9A%84%E6%BB%9A%E5%8A%A8%E5%8C%BA%E3%80%82%60%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20role%3A%20'assistant'%2C%5Cn%20%20%20%20content%3A%20'%E5%8F%AF%E4%BB%A5%E3%80%82%E5%86%85%E5%AE%B9%E5%8C%BA%E5%8F%AF%E4%BB%A5%E5%B1%85%E4%B8%AD%E6%98%BE%E7%A4%BA%EF%BC%8C%E6%BB%9A%E5%8A%A8%E6%9D%A1%E4%BB%8D%E7%84%B6%E5%9B%BA%E5%AE%9A%E5%9C%A8%20Layout%20%E4%B8%BB%E5%8C%BA%E5%8F%B3%E4%BE%A7%E3%80%82'%2C%5Cn%20%20%7D%2C%5Cn%5D).flat()%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3CTrLayout%3E%5Cn%20%20%20%20%3Ctemplate%20%23main%3E%5Cn%20%20%20%20%20%20%3Cdiv%20ref%3D%5C%22scrollTargetRef%5C%22%20class%3D%5C%22layout-main-scroll-bubble-host%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-bubble-host__content%5C%22%20%3Aclass%3D%5C%22%7B%20'is-centered'%3A%20props.centered%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3CBubbleList%20class%3D%5C%22layout-main-scroll-bubble%5C%22%20%3Amessages%3D%5C%22messages%5C%22%20%3Arole-configs%3D%5C%22roles%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3CTrLayout.ProxyScrollbar%20%3Ascroll-target%3D%5C%22scrollTargetRef%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%3C%2FTrLayout%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.layout-main-scroll-bubble-host%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-bubble-host__content.is-centered%20%7B%5Cn%20%20max-width%3A%20450px%3B%5Cn%20%20margin%3A%200%20auto%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-bubble%20%7B%5Cn%20%20--tr-bubble-list-padding%3A%2016px%3B%5Cn%20%20overflow%3A%20visible%3B%5Cn%7D%5Cn%5Cn%3Adeep(%5Bdata-role%3D'user'%5D)%20%7B%5Cn%20%20--tr-bubble-box-bg%3A%20var(--tr-color-primary-light)%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22main-scroll-div.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Flayout%2Fmain-scroll-div.vue%22%2C%22code%22%3A%22%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20ref%20%7D%20from%20'vue'%5Cnimport%20%7B%20TrLayout%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cn%5Cnconst%20props%20%3D%20defineProps%3C%7B%5Cn%20%20centered%3A%20boolean%5Cn%7D%3E()%5Cn%5Cnconst%20scrollTargetRef%20%3D%20ref%3CHTMLElement%20%7C%20null%3E(null)%5Cn%5Cnconst%20sections%20%3D%20Array.from(%7B%20length%3A%2012%20%7D%2C%20(_%2C%20index)%20%3D%3E%20index%20%2B%201)%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Ctemplate%3E%5Cn%20%20%3CTrLayout%3E%5Cn%20%20%20%20%3Ctemplate%20%23main%3E%5Cn%20%20%20%20%20%20%3Cdiv%20ref%3D%5C%22scrollTargetRef%5C%22%20class%3D%5C%22layout-main-scroll-div%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22layout-main-scroll-div__content%5C%22%20%3Aclass%3D%5C%22%7B%20'is-centered'%3A%20props.centered%20%7D%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3Csection%20v-for%3D%5C%22section%20in%20sections%5C%22%20%3Akey%3D%5C%22section%5C%22%20class%3D%5C%22layout-main-scroll-div__item%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cstrong%3ESection%20%7B%7B%20section%20%7D%7D%3C%2Fstrong%3E%5Cn%20%20%20%20%20%20%20%20%20%20%20%20%3Cp%3E%E6%99%AE%E9%80%9A%E5%86%85%E5%AE%B9%E5%8C%BA%E4%B9%9F%E5%8F%AF%E4%BB%A5%E6%8A%8A%E6%BB%9A%E5%8A%A8%E5%AE%BF%E4%B8%BB%E4%BA%A4%E7%BB%99%20Layout.ProxyScrollbar%20%E4%BB%A3%E7%90%86%E6%BB%9A%E5%8A%A8%E6%9D%A1%E3%80%82%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3C%2Fsection%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3CTrLayout.ProxyScrollbar%20%3Ascroll-target%3D%5C%22scrollTargetRef%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%3C%2FTrLayout%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.layout-main-scroll-div%20%7B%5Cn%20%20height%3A%20100%25%3B%5Cn%20%20overflow%3A%20auto%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-div__content%20%7B%5Cn%20%20display%3A%20grid%3B%5Cn%20%20gap%3A%2012px%3B%5Cn%20%20padding%3A%2016px%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-div__content.is-centered%20%7B%5Cn%20%20max-width%3A%20550px%3B%5Cn%20%20margin%3A%200%20auto%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-div__item%20%7B%5Cn%20%20padding%3A%2016px%3B%5Cn%20%20border%3A%201px%20solid%20var(--vp-c-divider%2C%20var(--tr-border-color%2C%20%23dcdfe6))%3B%5Cn%20%20border-radius%3A%2012px%3B%5Cn%20%20background%3A%20var(--vp-c-bg%2C%20%23ffffff)%3B%5Cn%7D%5Cn%5Cn.layout-main-scroll-div__item%20p%20%7B%5Cn%20%20margin%3A%208px%200%200%3B%5Cn%20%20color%3A%20var(--vp-c-text-2%2C%20var(--tr-text-secondary%2C%20%234e5969))%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[9]||(t[9]=()=>{o.value=!1}),vueCode:a(X)},y({_:2},[b.value?{name:"vue",fn:l(()=>[e(a(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[27]||(t[27]=g(`<h3 id="注意事项" tabindex="-1">注意事项 <a class="header-anchor" href="#注意事项" aria-label="Permalink to &quot;注意事项&quot;">​</a></h3><ul><li>代理滚动条会默认给目标滚动元素添加以下样式，用于隐藏原生滚动条</li></ul><div class="language-css vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">css</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">.tr-layout-proxy-scrollbar-target</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  scrollbar-width</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">none</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  -ms-overflow-style</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">none</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &amp;::</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">-webkit-scrollbar</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    display: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">none</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><ul><li><code>Layout.ProxyScrollbar</code> 仅用于代理滚动条显示与拖拽，不负责内容渲染或性能优化。传入 <code>ProxyScrollbar</code> 的 <code>scrollTarget</code> 必须是真正产生滚动的 DOM 元素。</li></ul><h2 id="侧栏开关" tabindex="-1">侧栏开关 <a class="header-anchor" href="#侧栏开关" aria-label="Permalink to &quot;侧栏开关&quot;">​</a></h2><p><code>Layout.AsideToggle</code> 是内置侧栏开关按钮，可以在 <code>Layout</code> 内部任意区域使用。</p><p>它给侧栏内容提供控制展开和收起的能力，默认插槽提供 <code>{ isOpen }</code>。</p>`,7)),c(e(a(m),null,null,512),[[u,o.value]]),e(s,null,{default:l(()=>[e(a(f),{title:"侧栏开关",description:"在侧栏内容中使用 AsideToggle 触发当前侧栏开关。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[10]||(t[10]=()=>{o.value=!1}),vueCode:a(S)},y({_:2},[v.value?{name:"vue",fn:l(()=>[e(a(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[28]||(t[28]=g('<h2 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h2><h3 id="layout-props" tabindex="-1">Layout <a class="header-anchor" href="#layout-props" aria-label="Permalink to &quot;Layout {#layout-props}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>mode</code></td><td>布局模式；<code>normal</code> 参与普通布局，<code>floating</code> 会脱离普通布局，不占原来的位置空间</td><td><code>&#39;normal&#39; | &#39;floating&#39;</code></td><td><code>&#39;normal&#39;</code></td></tr><tr><td><code>leftAside</code></td><td>左侧栏配置</td><td><a href="#layout-aside-options"><code>LayoutAsideOptions</code></a></td><td><code>-</code></td></tr><tr><td><code>rightAside</code></td><td>右侧栏配置</td><td><a href="#layout-aside-options"><code>LayoutAsideOptions</code></a></td><td><code>-</code></td></tr><tr><td><code>floatingState</code></td><td>受控浮层状态，需配合 <code>update:floatingState</code> 同步外部状态；不要和 <code>defaultFloatingState</code> 同时传入</td><td><a href="#layout-floating-state"><code>LayoutFloatingState</code></a></td><td><code>-</code></td></tr><tr><td><code>defaultFloatingState</code></td><td>非受控浮层初始状态，仅首次挂载读取一次；不要和 <code>floatingState</code> 同时传入</td><td><a href="#layout-floating-state"><code>LayoutFloatingState</code></a></td><td><code>-</code></td></tr><tr><td><code>floatingOptions</code></td><td>浮层行为配置，包括拖拽、缩放和尺寸约束；不参与状态控制</td><td><a href="#layout-floating-options"><code>LayoutFloatingOptions</code></a></td><td><code>-</code></td></tr></tbody></table><h3 id="layout-proxy-scrollbar-props" tabindex="-1">Layout.ProxyScrollbar <a class="header-anchor" href="#layout-proxy-scrollbar-props" aria-label="Permalink to &quot;Layout.ProxyScrollbar {#layout-proxy-scrollbar-props}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>scrollTarget</code></td><td>真实滚动容器的元素，或对应组件实例的 ref</td><td><a href="#layout-scroll-target"><code>LayoutScrollTarget</code></a></td><td><code>-</code></td></tr></tbody></table><h3 id="layout-aside-toggle-props" tabindex="-1">Layout.AsideToggle <a class="header-anchor" href="#layout-aside-toggle-props" aria-label="Permalink to &quot;Layout.AsideToggle {#layout-aside-toggle-props}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>side</code></td><td>控制的侧栏位置</td><td><code>&#39;left&#39; | &#39;right&#39;</code></td><td><code>-</code></td></tr></tbody></table><h2 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h2><h3 id="layout-slots" tabindex="-1">Layout <a class="header-anchor" href="#layout-slots" aria-label="Permalink to &quot;Layout {#layout-slots}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>插槽名</th><th>说明</th><th>作用域参数</th></tr></thead><tbody><tr><td><code>left-aside</code></td><td>左侧栏内容</td><td><code>-</code></td></tr><tr><td><code>header</code></td><td>顶部区域</td><td><code>-</code></td></tr><tr><td><code>main</code></td><td>主区内容</td><td><code>-</code></td></tr><tr><td><code>footer</code></td><td>底部区域</td><td><code>-</code></td></tr><tr><td><code>right-aside</code></td><td>右侧栏内容</td><td><code>-</code></td></tr></tbody></table><h3 id="layout-asidetoggle" tabindex="-1">Layout.AsideToggle <a class="header-anchor" href="#layout-asidetoggle" aria-label="Permalink to &quot;Layout.AsideToggle&quot;">​</a></h3><table tabindex="0"><thead><tr><th>插槽名</th><th>说明</th><th>作用域参数</th></tr></thead><tbody><tr><td><code>default</code></td><td>自定义切换按钮内容</td><td><code>{ isOpen: boolean }</code></td></tr></tbody></table><h2 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h2><h3 id="layout-layout-events" tabindex="-1">Layout <a class="header-anchor" href="#layout-layout-events" aria-label="Permalink to &quot;Layout {#layout-layout-events}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>事件名</th><th>说明</th><th>回调参数</th></tr></thead><tbody><tr><td><code>update:floatingState</code></td><td>浮层位置或尺寸变化</td><td>(value: <a href="#layout-floating-state"><code>LayoutFloatingState</code></a>)</td></tr><tr><td><code>aside-open-change</code></td><td>侧栏开关变化</td><td>(detail: <a href="#layout-aside-open-detail"><code>LayoutAsideOpenDetail</code></a>)</td></tr><tr><td><code>left-aside-open-change</code></td><td>左侧栏开关变化</td><td>(detail: <a href="#layout-aside-open-value"><code>LayoutAsideOpenValue</code></a>)</td></tr><tr><td><code>right-aside-open-change</code></td><td>右侧栏开关变化</td><td>(detail: <a href="#layout-aside-open-value"><code>LayoutAsideOpenValue</code></a>)</td></tr><tr><td><code>aside-resize-start</code></td><td>开始调整侧栏宽度</td><td>(detail: <a href="#layout-aside-resize-detail"><code>LayoutAsideResizeDetail</code></a>)</td></tr><tr><td><code>aside-resize</code></td><td>调整侧栏宽度时持续触发</td><td>(detail: <a href="#layout-aside-resize-detail"><code>LayoutAsideResizeDetail</code></a>)</td></tr><tr><td><code>aside-resize-end</code></td><td>结束调整侧栏宽度</td><td>(detail: <a href="#layout-aside-resize-detail"><code>LayoutAsideResizeDetail</code></a>)</td></tr><tr><td><code>left-aside-resize-start</code></td><td>开始调整左侧栏宽度</td><td>(detail: <a href="#layout-aside-resize-value"><code>LayoutAsideResizeValue</code></a>)</td></tr><tr><td><code>left-aside-resize</code></td><td>调整左侧栏宽度时持续触发</td><td>(detail: <a href="#layout-aside-resize-value"><code>LayoutAsideResizeValue</code></a>)</td></tr><tr><td><code>left-aside-resize-end</code></td><td>结束调整左侧栏宽度</td><td>(detail: <a href="#layout-aside-resize-value"><code>LayoutAsideResizeValue</code></a>)</td></tr><tr><td><code>right-aside-resize-start</code></td><td>开始调整右侧栏宽度</td><td>(detail: <a href="#layout-aside-resize-value"><code>LayoutAsideResizeValue</code></a>)</td></tr><tr><td><code>right-aside-resize</code></td><td>调整右侧栏宽度时持续触发</td><td>(detail: <a href="#layout-aside-resize-value"><code>LayoutAsideResizeValue</code></a>)</td></tr><tr><td><code>right-aside-resize-end</code></td><td>结束调整右侧栏宽度</td><td>(detail: <a href="#layout-aside-resize-value"><code>LayoutAsideResizeValue</code></a>)</td></tr><tr><td><code>floating-drag-start</code></td><td>开始拖动浮层</td><td>(detail: <a href="#layout-floating-drag-detail"><code>LayoutFloatingDragDetail</code></a>)</td></tr><tr><td><code>floating-drag</code></td><td>拖动浮层时持续触发</td><td>(detail: <a href="#layout-floating-drag-detail"><code>LayoutFloatingDragDetail</code></a>)</td></tr><tr><td><code>floating-drag-end</code></td><td>结束拖动浮层</td><td>(detail: <a href="#layout-floating-drag-detail"><code>LayoutFloatingDragDetail</code></a>)</td></tr><tr><td><code>floating-resize-start</code></td><td>开始调整浮层尺寸</td><td>(detail: <a href="#layout-floating-resize-detail"><code>LayoutFloatingResizeDetail</code></a>)</td></tr><tr><td><code>floating-resize</code></td><td>调整浮层尺寸时持续触发</td><td>(detail: <a href="#layout-floating-resize-detail"><code>LayoutFloatingResizeDetail</code></a>)</td></tr><tr><td><code>floating-resize-end</code></td><td>结束调整浮层尺寸</td><td>(detail: <a href="#layout-floating-resize-detail"><code>LayoutFloatingResizeDetail</code></a>)</td></tr></tbody></table><h2 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types {#types}&quot;">​</a></h2><h3 id="layout-aside-options" tabindex="-1">LayoutAsideOptions <a class="header-anchor" href="#layout-aside-options" aria-label="Permalink to &quot;LayoutAsideOptions {#layout-aside-options}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>mode</code></td><td>侧栏模式</td><td><code>&#39;dock&#39; | &#39;drawer&#39;</code></td><td><code>&#39;dock&#39;</code></td></tr><tr><td><code>open</code></td><td>受控开关状态</td><td><code>boolean</code></td><td><code>-</code></td></tr><tr><td><code>defaultOpen</code></td><td>非受控初始开关状态</td><td><code>boolean</code></td><td><code>left: true</code> / <code>right: false</code></td></tr><tr><td><code>expandedWidth</code></td><td>受控展开宽度；<code>drawer</code> 未设置 <code>--tr-layout-drawer-width</code> 时会回退使用该宽度</td><td><code>number</code></td><td><code>-</code></td></tr><tr><td><code>defaultExpandedWidth</code></td><td>非受控初始展开宽度；<code>drawer</code> 宽度回退值</td><td><code>number</code></td><td><code>left: 300</code> / <code>right: 320</code></td></tr><tr><td><code>minExpandedWidth</code></td><td>最小展开宽度边界</td><td><code>number</code></td><td><code>left: 200</code> / <code>right: 240</code></td></tr><tr><td><code>maxExpandedWidth</code></td><td>最大展开宽度边界</td><td><code>number</code></td><td><code>left: 560</code> / <code>right: 640</code></td></tr><tr><td><code>collapsedWidth</code></td><td>收起后保留的窄栏宽度，仅 <code>dock</code> 生效</td><td><code>number</code></td><td><code>0</code></td></tr><tr><td><code>collapseEffect</code></td><td><code>dock</code> 收起到窄栏时的内容动画</td><td><code>&#39;overlay&#39; | &#39;slide&#39;</code></td><td><code>&#39;overlay&#39;</code></td></tr><tr><td><code>resizable</code></td><td>是否允许拖拽改宽，仅 <code>dock</code> 生效</td><td><code>boolean</code></td><td><code>false</code></td></tr></tbody></table><h3 id="layout-aside-open-detail" tabindex="-1">LayoutAsideOpenDetail <a class="header-anchor" href="#layout-aside-open-detail" aria-label="Permalink to &quot;LayoutAsideOpenDetail {#layout-aside-open-detail}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th></tr></thead><tbody><tr><td><code>side</code></td><td>当前侧栏位置</td><td><code>&#39;left&#39; | &#39;right&#39;</code></td></tr><tr><td><code>open</code></td><td>当前是否展开</td><td><code>boolean</code></td></tr></tbody></table><h3 id="layout-aside-open-value" tabindex="-1">LayoutAsideOpenValue <a class="header-anchor" href="#layout-aside-open-value" aria-label="Permalink to &quot;LayoutAsideOpenValue {#layout-aside-open-value}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th></tr></thead><tbody><tr><td><code>open</code></td><td>当前是否展开</td><td><code>boolean</code></td></tr></tbody></table><h3 id="layout-aside-resize-detail" tabindex="-1">LayoutAsideResizeDetail <a class="header-anchor" href="#layout-aside-resize-detail" aria-label="Permalink to &quot;LayoutAsideResizeDetail {#layout-aside-resize-detail}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th></tr></thead><tbody><tr><td><code>side</code></td><td>当前侧栏位置</td><td><code>&#39;left&#39; | &#39;right&#39;</code></td></tr><tr><td><code>expandedWidth</code></td><td>当前侧栏宽度</td><td><code>number</code></td></tr></tbody></table><h3 id="layout-aside-resize-value" tabindex="-1">LayoutAsideResizeValue <a class="header-anchor" href="#layout-aside-resize-value" aria-label="Permalink to &quot;LayoutAsideResizeValue {#layout-aside-resize-value}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th></tr></thead><tbody><tr><td><code>expandedWidth</code></td><td>当前侧栏宽度</td><td><code>number</code></td></tr></tbody></table><h3 id="layout-scroll-target" tabindex="-1">LayoutScrollTarget <a class="header-anchor" href="#layout-scroll-target" aria-label="Permalink to &quot;LayoutScrollTarget {#layout-scroll-target}&quot;">​</a></h3><p><code>HTMLElement | Pick&lt;ComponentPublicInstance, &#39;$el&#39;&gt; | null | undefined</code></p><h3 id="layout-floating-state" tabindex="-1">LayoutFloatingState <a class="header-anchor" href="#layout-floating-state" aria-label="Permalink to &quot;LayoutFloatingState {#layout-floating-state}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>placement</code></td><td>浮层位置</td><td><code>&#39;top-left&#39; | &#39;top-right&#39; | &#39;bottom-left&#39; | &#39;bottom-right&#39; | &#39;center&#39;</code></td><td><code>&#39;center&#39;</code></td></tr><tr><td><code>offsetX</code></td><td>横向偏移；<code>placement</code> 为 <code>center</code> 时不生效</td><td><code>number</code></td><td><code>24</code></td></tr><tr><td><code>offsetY</code></td><td>纵向偏移；<code>placement</code> 为 <code>center</code> 时不生效</td><td><code>number</code></td><td><code>24</code></td></tr><tr><td><code>width</code></td><td>浮层宽度；非受控时表示初始值，受控时表示当前值</td><td><code>number</code></td><td><code>420</code></td></tr><tr><td><code>height</code></td><td>浮层高度；非受控时表示初始值，受控时表示当前值</td><td><code>number</code></td><td><code>560</code></td></tr></tbody></table><h3 id="layout-floating-options" tabindex="-1">LayoutFloatingOptions <a class="header-anchor" href="#layout-floating-options" aria-label="Permalink to &quot;LayoutFloatingOptions {#layout-floating-options}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead><tbody><tr><td><code>draggable</code></td><td>是否允许拖动浮层</td><td><code>boolean</code></td><td><code>true</code></td></tr><tr><td><code>resizable</code></td><td>是否允许通过浮层边缘手柄调整尺寸</td><td><code>boolean</code></td><td><code>false</code></td></tr><tr><td><code>minWidth</code></td><td>最小宽度</td><td><code>number</code></td><td><code>320</code></td></tr><tr><td><code>maxWidth</code></td><td>最大宽度</td><td><code>number</code></td><td><code>视口宽度</code></td></tr><tr><td><code>minHeight</code></td><td>最小高度</td><td><code>number</code></td><td><code>240</code></td></tr><tr><td><code>maxHeight</code></td><td>最大高度</td><td><code>number</code></td><td><code>视口高度</code></td></tr></tbody></table><h3 id="layout-floating-drag-detail" tabindex="-1">LayoutFloatingDragDetail <a class="header-anchor" href="#layout-floating-drag-detail" aria-label="Permalink to &quot;LayoutFloatingDragDetail {#layout-floating-drag-detail}&quot;">​</a></h3><p>与 <a href="#layout-floating-state"><code>LayoutFloatingState</code></a> 一致。</p><h3 id="layout-floating-resize-detail" tabindex="-1">LayoutFloatingResizeDetail <a class="header-anchor" href="#layout-floating-resize-detail" aria-label="Permalink to &quot;LayoutFloatingResizeDetail {#layout-floating-resize-detail}&quot;">​</a></h3><p>在 <a href="#layout-floating-state"><code>LayoutFloatingState</code></a> 基础上增加以下字段：</p><table tabindex="0"><thead><tr><th>字段</th><th>说明</th><th>类型</th></tr></thead><tbody><tr><td><code>handle</code></td><td>当前拖动的边或角</td><td><code>&#39;s&#39; | &#39;e&#39; | &#39;w&#39; | &#39;ne&#39; | &#39;nw&#39; | &#39;se&#39; | &#39;sw&#39;</code></td></tr></tbody></table><h2 id="css-变量" tabindex="-1">CSS 变量 <a class="header-anchor" href="#css-变量" aria-label="Permalink to &quot;CSS 变量&quot;">​</a></h2><h3 id="layout-css-basics" tabindex="-1">布局基础 <a class="header-anchor" href="#layout-css-basics" aria-label="Permalink to &quot;布局基础 {#layout-css-basics}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-layout-height</code></td><td>布局高度</td></tr><tr><td><code>--tr-layout-bg</code></td><td>容器背景</td></tr><tr><td><code>--tr-layout-left-aside-bg</code></td><td>左侧栏背景</td></tr><tr><td><code>--tr-layout-right-aside-bg</code></td><td>右侧栏背景</td></tr><tr><td><code>--tr-layout-header-bg</code></td><td>顶部背景</td></tr><tr><td><code>--tr-layout-main-bg</code></td><td>主区背景</td></tr><tr><td><code>--tr-layout-footer-bg</code></td><td>底部背景</td></tr><tr><td><code>--tr-layout-divider-color</code></td><td>分隔线颜色</td></tr><tr><td><code>--tr-layout-overlay-bg</code></td><td>drawer 遮罩颜色</td></tr><tr><td><code>--tr-layout-panel-shadow</code></td><td>drawer 阴影</td></tr><tr><td><code>--tr-layout-floating-radius</code></td><td>浮层圆角</td></tr><tr><td><code>--tr-layout-floating-shadow</code></td><td>浮层阴影</td></tr><tr><td><code>--tr-layout-floating-z-index</code></td><td>浮层层级</td></tr></tbody></table><h3 id="layout-css-content" tabindex="-1">内容与交互 <a class="header-anchor" href="#layout-css-content" aria-label="Permalink to &quot;内容与交互 {#layout-css-content}&quot;">​</a></h3><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-layout-main-min-width</code></td><td>主区最小宽度</td></tr><tr><td><code>--tr-layout-drawer-width</code></td><td>drawer 展示宽度</td></tr><tr><td><code>--tr-layout-main-scrollbar-width</code></td><td>滚动条宽度</td></tr><tr><td><code>--tr-layout-main-scrollbar-thumb-bg</code></td><td>滚动条滑块颜色</td></tr><tr><td><code>--tr-layout-main-scrollbar-thumb-bg-hover</code></td><td>滑块悬停颜色</td></tr><tr><td><code>--tr-layout-main-scrollbar-thumb-bg-active</code></td><td>滑块激活颜色</td></tr></tbody></table>',42))])}}});export{J as __pageData,j as default};
