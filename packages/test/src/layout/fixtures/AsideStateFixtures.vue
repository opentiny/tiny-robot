<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutAsideOpenValue, LayoutAsideResizeValue } from '@opentiny/tiny-robot'

const baseLayoutStyle = {
  '--tr-layout-height': '100%',
  '--tr-layout-main-min-width': '120px',
  '--tr-layout-left-aside-bg': '#f8fafc',
  '--tr-layout-right-aside-bg': '#f8fafc',
  '--tr-layout-main-bg': '#ffffff',
  height: '100%',
} as const

const blockedOpenEvents = ref(0)
const blockedLastOpen = ref('true')
const blockedWidthEvents = ref(0)
const blockedLastWidth = ref(260)

const uncontrolledOpenEvents = ref(0)
const uncontrolledWidthEvents = ref(0)
const uncontrolledLastWidth = ref(290)
const uncontrolledLastOpen = ref(true)
const uncontrolledDefaultOpen = ref(true)
const uncontrolledDefaultWidth = ref(290)

const undefinedOpenLastState = ref(true)

const drawerLeftOpen = ref(false)
const drawerRightOpen = ref(false)

const blockedLeftAside = {
  mode: 'dock',
  open: true,
  expandedWidth: 260,
  collapsedWidth: 48,
  minExpandedWidth: 220,
  maxExpandedWidth: 420,
  resizable: true,
} as const

const uncontrolledLeftAside = computed(() => ({
  mode: 'dock' as const,
  defaultOpen: uncontrolledDefaultOpen.value,
  defaultExpandedWidth: uncontrolledDefaultWidth.value,
  collapsedWidth: 52,
  minExpandedWidth: 240,
  maxExpandedWidth: 340,
  resizable: true,
}))

const undefinedLeftAside = computed(() => ({
  mode: 'dock' as const,
  open: undefined,
  expandedWidth: undefined,
  defaultOpen: true,
  defaultExpandedWidth: 306,
  collapsedWidth: 52,
  minExpandedWidth: 240,
  maxExpandedWidth: 340,
  resizable: true,
}))

const drawerLeftAside = computed(() => ({
  mode: 'drawer' as const,
  open: drawerLeftOpen.value,
}))

const drawerRightAside = computed(() => ({
  mode: 'drawer' as const,
  open: drawerRightOpen.value,
}))

const drawerLayoutStyle = {
  ...baseLayoutStyle,
  '--tr-layout-drawer-width': '344px',
} as const

function handleBlockedOpen(detail: LayoutAsideOpenValue) {
  if (blockedLastOpen.value !== String(detail.open)) {
    blockedOpenEvents.value += 1
    blockedLastOpen.value = String(detail.open)
  }
}

function handleBlockedResize(detail: LayoutAsideResizeValue) {
  if (detail.expandedWidth !== blockedLastWidth.value) {
    blockedWidthEvents.value += 1
    blockedLastWidth.value = detail.expandedWidth
  }
}

function handleUncontrolledOpen(detail: LayoutAsideOpenValue) {
  if (detail.open !== uncontrolledLastOpen.value) {
    uncontrolledOpenEvents.value += 1
    uncontrolledLastOpen.value = detail.open
  }
}

function handleUncontrolledResize(detail: LayoutAsideResizeValue) {
  if (detail.expandedWidth !== uncontrolledLastWidth.value) {
    uncontrolledWidthEvents.value += 1
    uncontrolledLastWidth.value = detail.expandedWidth
  }
}

function updateUncontrolledDefaults() {
  uncontrolledDefaultOpen.value = false
  uncontrolledDefaultWidth.value = 332
}

function handleUndefinedOpen(detail: LayoutAsideOpenValue) {
  undefinedOpenLastState.value = detail.open
}

function updateDrawerLeftOpen(detail: LayoutAsideOpenValue) {
  drawerLeftOpen.value = detail.open
}

function updateDrawerRightOpen(detail: LayoutAsideOpenValue) {
  drawerRightOpen.value = detail.open
}
</script>

<template>
  <div class="aside-state-fixtures">
    <div class="aside-state-fixtures__metrics">
      <div data-testid="blocked-open-events">{{ blockedOpenEvents }}</div>
      <div data-testid="blocked-last-open">{{ blockedLastOpen }}</div>
      <div data-testid="blocked-width-events">{{ blockedWidthEvents }}</div>
      <div data-testid="blocked-last-width">{{ blockedLastWidth }}</div>
      <div data-testid="uncontrolled-open-events">{{ uncontrolledOpenEvents }}</div>
      <div data-testid="uncontrolled-width-events">{{ uncontrolledWidthEvents }}</div>
      <div data-testid="uncontrolled-last-width">{{ uncontrolledLastWidth }}</div>
    </div>

    <section class="aside-state-fixtures__section" data-testid="blocked-aside-fixture">
      <h3>Blocked Controlled Aside</h3>
      <div class="aside-state-fixtures__host">
        <TrLayout
          class="aside-state-fixtures__layout"
          :style="baseLayoutStyle"
          :left-aside="blockedLeftAside"
          @left-aside-open-change="handleBlockedOpen"
          @left-aside-resize="handleBlockedResize"
        >
          <template #left-aside>
            <div class="aside-state-fixtures__panel">
              <span data-testid="blocked-open-state">{{ blockedLeftAside.open ? 'open' : 'closed' }}</span>
              <TrLayout.AsideToggle side="left" data-testid="blocked-toggle" />
            </div>
          </template>

          <template #main>
            <div class="aside-state-fixtures__main">blocked controlled aside</div>
          </template>
        </TrLayout>
      </div>
    </section>

    <section class="aside-state-fixtures__section" data-testid="uncontrolled-aside-fixture">
      <h3>Uncontrolled Aside</h3>
      <div class="aside-state-fixtures__host">
        <TrLayout
          class="aside-state-fixtures__layout"
          :style="baseLayoutStyle"
          :left-aside="uncontrolledLeftAside"
          @left-aside-open-change="handleUncontrolledOpen"
          @left-aside-resize="handleUncontrolledResize"
        >
          <template #left-aside>
            <div class="aside-state-fixtures__panel">
              <TrLayout.AsideToggle side="left" data-testid="uncontrolled-toggle">
                <template #default="{ isOpen }">
                  <span data-testid="uncontrolled-open-state">{{ isOpen ? 'open' : 'closed' }}</span>
                </template>
              </TrLayout.AsideToggle>
              <button type="button" data-testid="uncontrolled-default-update-btn" @click="updateUncontrolledDefaults">
                update defaults
              </button>
            </div>
          </template>

          <template #main>
            <div class="aside-state-fixtures__main">uncontrolled aside</div>
          </template>
        </TrLayout>
      </div>
    </section>

    <section class="aside-state-fixtures__section" data-testid="drawer-aside-fixture">
      <h3>Drawer Width Aside</h3>
      <div class="aside-state-fixtures__host">
        <TrLayout
          class="aside-state-fixtures__layout"
          :style="drawerLayoutStyle"
          :left-aside="drawerLeftAside"
          :right-aside="drawerRightAside"
          @left-aside-open-change="updateDrawerLeftOpen"
          @right-aside-open-change="updateDrawerRightOpen"
        >
          <template #left-aside>
            <div class="aside-state-fixtures__drawer">
              <div class="aside-state-fixtures__panel">
                <span data-testid="drawer-left-state">{{ drawerLeftOpen ? 'open' : 'closed' }}</span>
                <TrLayout.AsideToggle side="right" data-testid="drawer-right-toggle" />
              </div>
            </div>
          </template>

          <template #main>
            <div class="aside-state-fixtures__drawer-controls">
              <TrLayout.AsideToggle side="left" data-testid="drawer-left-toggle" />
            </div>
          </template>

          <template #right-aside>
            <div class="aside-state-fixtures__drawer">
              <div class="aside-state-fixtures__panel">
                <span data-testid="drawer-right-state">{{ drawerRightOpen ? 'open' : 'closed' }}</span>
              </div>
            </div>
          </template>
        </TrLayout>
      </div>
    </section>

    <section class="aside-state-fixtures__section" data-testid="undefined-aside-fixture">
      <h3>Undefined Controlled Keys Aside</h3>
      <div class="aside-state-fixtures__host">
        <TrLayout
          class="aside-state-fixtures__layout"
          :style="baseLayoutStyle"
          :left-aside="undefinedLeftAside"
          @left-aside-open-change="handleUndefinedOpen"
        >
          <template #left-aside>
            <div class="aside-state-fixtures__panel">
              <TrLayout.AsideToggle side="left" data-testid="undefined-toggle">
                <template #default="{ isOpen }">
                  <span data-testid="undefined-open-state">{{ isOpen ? 'open' : 'closed' }}</span>
                </template>
              </TrLayout.AsideToggle>
              <span data-testid="undefined-last-open">{{ undefinedOpenLastState ? 'open' : 'closed' }}</span>
            </div>
          </template>

          <template #main>
            <div class="aside-state-fixtures__main">undefined controlled keys aside</div>
          </template>
        </TrLayout>
      </div>
    </section>
  </div>
</template>

<style scoped>
.aside-state-fixtures {
  display: grid;
  gap: 16px;
}

.aside-state-fixtures__metrics {
  display: none;
}

.aside-state-fixtures__section {
  display: grid;
  gap: 8px;
}

.aside-state-fixtures__host {
  position: relative;
  height: 320px;
  border: 1px solid #dcdfe6;
  overflow: hidden;
}

.aside-state-fixtures__panel,
.aside-state-fixtures__main,
.aside-state-fixtures__drawer-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 100%;
  padding: 16px;
  box-sizing: border-box;
}

.aside-state-fixtures__drawer-controls {
  justify-content: center;
  gap: 12px;
}

.aside-state-fixtures__drawer {
  width: 100%;
  height: 100%;
}
</style>
