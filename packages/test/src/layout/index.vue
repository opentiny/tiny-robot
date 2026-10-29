<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watchEffect } from 'vue'
import { BubbleList, TrLayout } from '@opentiny/tiny-robot'
import type {
  LayoutAsideOpenValue,
  LayoutAsideResizeDetail,
  LayoutAsideResizeValue,
  LayoutFloatingDragDetail,
  LayoutFloatingOptions,
  LayoutFloatingResizeDetail,
  LayoutFloatingResizeHandle,
  LayoutFloatingState,
  LayoutScrollTarget,
} from '@opentiny/tiny-robot'
import AsideStateFixtures from './fixtures/AsideStateFixtures.vue'
import FloatingStateFixtures from './fixtures/FloatingStateFixtures.vue'
import LayoutCssVarFixtures from './fixtures/LayoutCssVarFixtures.vue'

interface LayoutMetrics {
  leftResizeStart: number
  leftResizeEnd: number
  rightResizeStart: number
  rightResizeEnd: number
  floatingDragStart: number
  floatingDrag: number
  floatingDragEnd: number
  floatingResizeStartByHandle: Record<LayoutFloatingResizeHandle, number>
  floatingResizeEndByHandle: Record<LayoutFloatingResizeHandle, number>
  leftToggleActions: number
  rightToggleActions: number
  modeToggleActions: number
}

interface LayoutWidths {
  left: number
  right: number
  floating: number
}

type LayoutEventPhase = 'start' | 'progress' | 'end'

type AsideResizeLogEntry = LayoutAsideResizeDetail & { phase: LayoutEventPhase }
type FloatingDragLogEntry = LayoutFloatingDragDetail & { phase: LayoutEventPhase }
type FloatingResizeLogEntry = LayoutFloatingResizeDetail & { phase: LayoutEventPhase }

interface LayoutHarnessSnapshot {
  metrics: LayoutMetrics
  widths: LayoutWidths
  messagesCount: number
  logs: {
    asideResize: AsideResizeLogEntry[]
    floatingDrag: FloatingDragLogEntry[]
    floatingResize: FloatingResizeLogEntry[]
  }
}

declare global {
  interface Window {
    __TR_LAYOUT_HARNESS__?: LayoutHarnessSnapshot
  }
}

const mode = ref<'normal' | 'floating'>('normal')
const scrollHostRef = ref<LayoutScrollTarget>(null)
const leftCollapseEffect = ref<'overlay' | 'slide'>('overlay')
const rightCollapseEffect = ref<'overlay' | 'slide'>('overlay')
const showHeaderSlot = ref(true)
const showLeftAsideSlot = ref(true)
const leftMode = ref<'dock' | 'drawer'>('dock')
const rightMode = ref<'dock' | 'drawer'>('drawer')
const leftOpen = ref(true)
const rightOpen = ref(false)
const leftWidth = ref(280)
const rightWidth = ref(320)
const leftCollapsedWidth = ref(56)
const rightCollapsedWidth = ref(0)
const leftResizable = ref(true)
const rightResizable = ref(true)
const showAsideStateFixtures = ref(false)
const showFloatingStateFixtures = ref(false)
const showCssVarFixtures = ref(false)

const floatingState = ref<LayoutFloatingState>({
  placement: 'top-left',
  offsetX: 96,
  offsetY: 72,
  width: 520,
  height: 620,
})

const floatingOptions = ref<LayoutFloatingOptions>({
  draggable: true,
  resizable: true,
  minWidth: 360,
  maxWidth: 720,
})

const leftAside = computed(() => ({
  mode: leftMode.value,
  open: leftOpen.value,
  expandedWidth: leftWidth.value,
  collapsedWidth: leftCollapsedWidth.value,
  collapseEffect: leftCollapseEffect.value,
  minExpandedWidth: 220,
  maxExpandedWidth: 420,
  resizable: leftResizable.value,
}))

const rightAside = computed(() => ({
  mode: rightMode.value,
  open: rightOpen.value,
  expandedWidth: rightWidth.value,
  collapsedWidth: rightCollapsedWidth.value,
  collapseEffect: rightCollapseEffect.value,
  minExpandedWidth: 240,
  maxExpandedWidth: 420,
  resizable: rightResizable.value,
}))

const layoutProps = computed<Record<string, unknown>>(() =>
  mode.value === 'floating'
    ? {
        mode: 'floating',
        leftAside: leftAside.value,
        rightAside: rightAside.value,
        floatingState: floatingState.value,
        floatingOptions: floatingOptions.value,
      }
    : {
        mode: 'normal',
        leftAside: leftAside.value,
        rightAside: rightAside.value,
      },
)

const layoutSurfaceKey = computed(() => `${mode.value}-${showHeaderSlot.value}-${showLeftAsideSlot.value}`)

const metrics = ref<LayoutMetrics>({
  leftResizeStart: 0,
  leftResizeEnd: 0,
  rightResizeStart: 0,
  rightResizeEnd: 0,
  floatingDragStart: 0,
  floatingDrag: 0,
  floatingDragEnd: 0,
  floatingResizeStartByHandle: {
    s: 0,
    e: 0,
    w: 0,
    ne: 0,
    nw: 0,
    se: 0,
    sw: 0,
  },
  floatingResizeEndByHandle: {
    s: 0,
    e: 0,
    w: 0,
    ne: 0,
    nw: 0,
    se: 0,
    sw: 0,
  },
  leftToggleActions: 0,
  rightToggleActions: 0,
  modeToggleActions: 0,
})

const widths = ref<LayoutWidths>({
  left: 280,
  right: 320,
  floating: 520,
})

const eventLogs = ref<LayoutHarnessSnapshot['logs']>({
  asideResize: [],
  floatingDrag: [],
  floatingResize: [],
})

const messages = ref(
  Array.from({ length: 40 }, (_, index) => ({
    role: index % 2 === 0 ? 'assistant' : 'user',
    content: `layout message ${index + 1}`,
  })),
)

function setMode(next: 'normal' | 'floating') {
  mode.value = next
  metrics.value.modeToggleActions += 1
}

function setLeftMode(layoutMode: 'dock' | 'drawer') {
  leftMode.value = layoutMode
}

function setRightMode(layoutMode: 'dock' | 'drawer') {
  rightMode.value = layoutMode
}

function toggleLeft() {
  leftOpen.value = !leftOpen.value
  metrics.value.leftToggleActions += 1
}

function toggleRight() {
  rightOpen.value = !rightOpen.value
  metrics.value.rightToggleActions += 1
}

function collapseLeft() {
  leftOpen.value = false
}

function collapseRight() {
  rightOpen.value = false
}

function disableLeftResizable() {
  leftResizable.value = false
}

function disableRightResizable() {
  rightResizable.value = false
}

function setLeftCollapsedWidth(nextWidth: number) {
  leftCollapsedWidth.value = nextWidth
}

function disableFloatingResizable() {
  floatingOptions.value = { ...floatingOptions.value, resizable: false }
}

function disableFloatingDraggable() {
  floatingOptions.value = { ...floatingOptions.value, draggable: false }
}

function omitConditionalSlots() {
  showHeaderSlot.value = false
  showLeftAsideSlot.value = false
}

function updateLeftAsideOpen(detail: LayoutAsideOpenValue) {
  leftOpen.value = detail.open
}

function updateRightAsideOpen(detail: LayoutAsideOpenValue) {
  rightOpen.value = detail.open
}

function updateLeftAsideWidth(detail: LayoutAsideResizeValue) {
  leftWidth.value = detail.expandedWidth
  widths.value.left = detail.expandedWidth
}

function updateRightAsideWidth(detail: LayoutAsideResizeValue) {
  rightWidth.value = detail.expandedWidth
  widths.value.right = detail.expandedWidth
}

function updateFloatingState(next: LayoutFloatingState) {
  floatingState.value = next
}

function appendMessages() {
  const start = messages.value.length
  messages.value = [
    ...messages.value,
    ...Array.from({ length: 20 }, (_, index) => ({
      role: (start + index) % 2 === 0 ? 'assistant' : 'user',
      content: `layout appended ${start + index + 1}`,
    })),
  ]
}

function resetMessagesToShortList() {
  messages.value = Array.from({ length: 2 }, (_, index) => ({
    role: index % 2 === 0 ? 'assistant' : 'user',
    content: `layout short message ${index + 1}`,
  }))
}

function resetFloating() {
  floatingState.value = {
    ...floatingState.value,
    placement: 'top-left',
    offsetX: 96,
    offsetY: 72,
    width: 520,
    height: 620,
  }
  widths.value.floating = 520
}

function pushAsideResizeLog(phase: LayoutEventPhase, detail: LayoutAsideResizeDetail) {
  eventLogs.value.asideResize.push({ phase, ...detail })
}

function pushFloatingDragLog(phase: LayoutEventPhase, detail: LayoutFloatingDragDetail) {
  eventLogs.value.floatingDrag.push({ phase, ...detail })
}

function pushFloatingResizeLog(phase: LayoutEventPhase, detail: LayoutFloatingResizeDetail) {
  eventLogs.value.floatingResize.push({ phase, ...detail })
}

function handleAsideResizeStart(detail: LayoutAsideResizeDetail) {
  if (detail.side === 'left') {
    metrics.value.leftResizeStart += 1
  } else {
    metrics.value.rightResizeStart += 1
  }

  pushAsideResizeLog('start', detail)
}

function handleAsideResize(detail: LayoutAsideResizeDetail) {
  pushAsideResizeLog('progress', detail)
}

function handleAsideResizeEnd(detail: LayoutAsideResizeDetail) {
  if (detail.side === 'left') {
    metrics.value.leftResizeEnd += 1
    widths.value.left = detail.expandedWidth
  } else {
    metrics.value.rightResizeEnd += 1
    widths.value.right = detail.expandedWidth
  }

  pushAsideResizeLog('end', detail)
}

function handleFloatingDragStart(detail: LayoutFloatingDragDetail) {
  metrics.value.floatingDragStart += 1
  pushFloatingDragLog('start', detail)
}

function handleFloatingDrag(detail: LayoutFloatingDragDetail) {
  metrics.value.floatingDrag += 1
  pushFloatingDragLog('progress', detail)
}

function handleFloatingDragEnd(detail: LayoutFloatingDragDetail) {
  metrics.value.floatingDragEnd += 1
  pushFloatingDragLog('end', detail)
}

function handleFloatingResizeStart(detail: LayoutFloatingResizeDetail) {
  metrics.value.floatingResizeStartByHandle[detail.handle] += 1

  pushFloatingResizeLog('start', detail)
}

function handleFloatingResize(detail: LayoutFloatingResizeDetail) {
  if (detail.width !== undefined) {
    widths.value.floating = detail.width
  }

  pushFloatingResizeLog('progress', detail)
}

function handleFloatingResizeEnd(detail: LayoutFloatingResizeDetail) {
  if (detail.width !== undefined) {
    widths.value.floating = detail.width
  }

  metrics.value.floatingResizeEndByHandle[detail.handle] += 1

  pushFloatingResizeLog('end', detail)
}

watchEffect(() => {
  if (typeof window === 'undefined') {
    return
  }

  window.__TR_LAYOUT_HARNESS__ = {
    metrics: { ...metrics.value },
    widths: { ...widths.value },
    messagesCount: messages.value.length,
    logs: {
      asideResize: eventLogs.value.asideResize.map((entry) => ({ ...entry })),
      floatingDrag: eventLogs.value.floatingDrag.map((entry) => ({ ...entry })),
      floatingResize: eventLogs.value.floatingResize.map((entry) => ({ ...entry })),
    },
  }
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') {
    return
  }

  delete window.__TR_LAYOUT_HARNESS__
})
</script>

<template>
  <div class="layout-demo">
    <h2>Layout 组件测试</h2>

    <div class="layout-demo__controls">
      <button data-testid="mode-normal-btn" type="button" @click="setMode('normal')">normal</button>
      <button data-testid="mode-floating-btn" type="button" @click="setMode('floating')">floating</button>
      <button data-testid="reset-floating-btn" type="button" @click="resetFloating">reset floating</button>

      <button data-testid="left-mode-dock-btn" type="button" @click="setLeftMode('dock')">left dock</button>
      <button data-testid="left-mode-drawer-btn" type="button" @click="setLeftMode('drawer')">left drawer</button>
      <button data-testid="left-toggle-btn" type="button" @click="toggleLeft">left toggle</button>
      <button data-testid="left-collapse-btn" type="button" @click="collapseLeft">left collapse</button>
      <button data-testid="left-effect-overlay-btn" type="button" @click="leftCollapseEffect = 'overlay'">
        left overlay
      </button>
      <button data-testid="left-effect-slide-btn" type="button" @click="leftCollapseEffect = 'slide'">
        left slide
      </button>
      <button data-testid="left-resizable-off-btn" type="button" @click="disableLeftResizable">
        left resizable off
      </button>
      <button data-testid="left-collapsed-width-zero-btn" type="button" @click="setLeftCollapsedWidth(0)">
        left collapsed zero
      </button>

      <button data-testid="right-mode-dock-btn" type="button" @click="setRightMode('dock')">right dock</button>
      <button data-testid="right-mode-drawer-btn" type="button" @click="setRightMode('drawer')">right drawer</button>
      <button data-testid="right-toggle-btn" type="button" @click="toggleRight">right toggle</button>
      <button data-testid="right-collapse-btn" type="button" @click="collapseRight">right collapse</button>
      <button data-testid="right-effect-slide-btn" type="button" @click="rightCollapseEffect = 'slide'">
        right slide
      </button>
      <button data-testid="right-resizable-off-btn" type="button" @click="disableRightResizable">
        right resizable off
      </button>

      <button data-testid="append-messages-btn" type="button" @click="appendMessages">append messages</button>
      <button data-testid="short-messages-btn" type="button" @click="resetMessagesToShortList">short messages</button>
      <button data-testid="conditional-slots-omit-btn" type="button" @click="omitConditionalSlots">
        omit conditional slots
      </button>
      <button data-testid="floating-resizable-off-btn" type="button" @click="disableFloatingResizable">
        floating resizable off
      </button>
      <button data-testid="floating-draggable-off-btn" type="button" @click="disableFloatingDraggable">
        floating draggable off
      </button>
      <button data-testid="show-aside-state-fixtures-btn" type="button" @click="showAsideStateFixtures = true">
        show aside fixtures
      </button>
      <button data-testid="show-floating-state-fixtures-btn" type="button" @click="showFloatingStateFixtures = true">
        show floating fixtures
      </button>
      <button data-testid="show-css-var-fixtures-btn" type="button" @click="showCssVarFixtures = true">
        show css var fixtures
      </button>
    </div>
    <div class="layout-demo__host" data-testid="layout-demo-host">
      <TrLayout
        :key="layoutSurfaceKey"
        id="layout-demo-surface"
        class="layout-demo__layout layout-demo__layout--surface-marker"
        data-surface-marker="layout-demo-surface"
        v-bind="layoutProps"
        @left-aside-open-change="updateLeftAsideOpen"
        @left-aside-resize="updateLeftAsideWidth"
        @right-aside-open-change="updateRightAsideOpen"
        @right-aside-resize="updateRightAsideWidth"
        @update:floating-state="updateFloatingState"
        @aside-resize-start="handleAsideResizeStart"
        @aside-resize="handleAsideResize"
        @aside-resize-end="handleAsideResizeEnd"
        @floating-drag-start="handleFloatingDragStart"
        @floating-drag="handleFloatingDrag"
        @floating-drag-end="handleFloatingDragEnd"
        @floating-resize-start="handleFloatingResizeStart"
        @floating-resize="handleFloatingResize"
        @floating-resize-end="handleFloatingResizeEnd"
      >
        <template v-if="showLeftAsideSlot" #left-aside>
          <div class="layout-demo__aside layout-demo__aside--left">
            <div class="layout-demo__aside-content" data-testid="left-aside-slot">
              <div class="layout-demo__aside-header">
                <TrLayout.AsideToggle side="left" data-testid="left-aside-toggle">
                  <template #default="{ isOpen }">
                    <span data-testid="left-toggle-slot">{{ isOpen ? 'left-open' : 'left-close' }}</span>
                  </template>
                </TrLayout.AsideToggle>
              </div>
              <div class="layout-demo__aside-body">left aside content</div>
            </div>
          </div>
        </template>

        <template v-if="showHeaderSlot" #header>
          <div class="layout-demo__header" data-testid="layout-header-slot">layout header</div>
        </template>

        <template #main>
          <BubbleList
            ref="scrollHostRef"
            class="layout-demo__bubble-list"
            data-testid="layout-scroll-target"
            :messages="messages"
          />
          <TrLayout.ProxyScrollbar :scroll-target="scrollHostRef" />
        </template>

        <template #footer>
          <div class="layout-demo__footer" data-testid="layout-footer-slot">layout footer</div>
        </template>

        <template #right-aside>
          <div class="layout-demo__aside layout-demo__aside--right">
            <div class="layout-demo__aside-content" data-testid="right-aside-slot">
              <div class="layout-demo__aside-header">
                <TrLayout.AsideToggle side="right" data-testid="right-aside-toggle" />
              </div>
              <div class="layout-demo__aside-body">right aside content</div>
            </div>
          </div>
        </template>
      </TrLayout>
    </div>

    <AsideStateFixtures v-if="showAsideStateFixtures" />
    <FloatingStateFixtures v-if="showFloatingStateFixtures" />
    <LayoutCssVarFixtures v-if="showCssVarFixtures" />
  </div>
</template>

<style scoped>
.layout-demo {
  display: grid;
  gap: 16px;
}

.layout-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-demo__host {
  position: relative;
  height: 720px;
  border: 1px solid #dcdfe6;
  overflow: hidden;
}

.layout-demo__layout {
  --tr-layout-height: 100%;
  --tr-layout-left-aside-bg: #f8fafc;
  --tr-layout-right-aside-bg: #f8fafc;
  --tr-layout-header-bg: #ffffff;
  --tr-layout-main-bg: #ffffff;
  --tr-layout-footer-bg: #ffffff;
  height: 100%;
}

.layout-demo__header,
.layout-demo__footer {
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

.layout-demo__footer {
  border-top: 1px solid #ebeef5;
  border-bottom: 0;
}

.layout-demo__aside--left {
  --tr-layout-drawer-width: min(84vw, 320px);
}

.layout-demo__aside--right {
  --tr-layout-drawer-width: min(88vw, 360px);
}

.layout-demo__aside {
  width: 100%;
  height: 100%;
}

.layout-demo__aside-content {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 100%;
}

.layout-demo__aside-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px;
  border-bottom: 1px solid #ebeef5;
}

.layout-demo__aside-body {
  padding: 12px;
}

.layout-demo__bubble-list {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 16px;
  box-sizing: border-box;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.layout-demo__bubble-list::-webkit-scrollbar {
  display: none;
}
</style>
