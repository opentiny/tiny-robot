<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutFloatingOptions, LayoutFloatingState } from '@opentiny/tiny-robot'

const blockedFloatingState = ref<LayoutFloatingState>({
  placement: 'top-left',
  offsetX: 64,
  offsetY: 96,
  width: 420,
  height: 300,
})

const blockedFloatingOptions: LayoutFloatingOptions = {
  draggable: true,
  resizable: true,
  minWidth: 320,
  maxWidth: 480,
}

const blockedFloatingUpdates = ref(0)
const blockedFloatingLastPlacement = ref('')
const blockedFloatingLastOffsetX = ref(-1)
const blockedFloatingLastOffsetY = ref(-1)
const blockedFloatingLastWidth = ref(420)

const uncontrolledDefaultFloatingState = ref<LayoutFloatingState>({
  placement: 'top-right',
  offsetX: 24,
  offsetY: 32,
  width: 420,
  height: 300,
})

const uncontrolledFloatingOptions: LayoutFloatingOptions = {
  draggable: true,
  resizable: true,
  minWidth: 320,
  maxWidth: 480,
}

const uncontrolledFloatingUpdates = ref(0)
const uncontrolledFloatingLastPlacement = ref('')
const uncontrolledFloatingLastOffsetX = ref(-1)
const uncontrolledFloatingLastOffsetY = ref(-1)
const uncontrolledFloatingLastWidth = ref(420)

const undefinedFloatingDefaultState = ref<LayoutFloatingState>({
  placement: 'bottom-right',
  offsetX: 48,
  offsetY: 56,
  width: 388,
  height: 276,
})

const showPlacementFixtures = ref(false)

const placementOptions: LayoutFloatingOptions = {
  draggable: false,
  resizable: false,
}

const placementDefaults: Array<{ marker: string; config: LayoutFloatingState }> = [
  {
    marker: 'placement-top-left',
    config: {
      placement: 'top-left',
      offsetX: 16,
      offsetY: 16,
      width: 320,
      height: 220,
    },
  },
  {
    marker: 'placement-top-right',
    config: {
      placement: 'top-right',
      offsetX: 20,
      offsetY: 36,
      width: 340,
      height: 230,
    },
  },
  {
    marker: 'placement-bottom-left',
    config: {
      placement: 'bottom-left',
      offsetX: 28,
      offsetY: 44,
      width: 300,
      height: 210,
    },
  },
  {
    marker: 'placement-bottom-right',
    config: {
      placement: 'bottom-right',
      offsetX: 32,
      offsetY: 32,
      width: 280,
      height: 200,
    },
  },
  {
    marker: 'placement-center',
    config: {
      placement: 'center',
      offsetX: 96,
      offsetY: 96,
      width: 360,
      height: 240,
    },
  },
]

const blockedFloatingLayoutProps = computed<Record<string, unknown>>(() => ({
  mode: 'floating',
  floatingState: blockedFloatingState.value,
  floatingOptions: blockedFloatingOptions,
}))

const uncontrolledFloatingLayoutProps = computed<Record<string, unknown>>(() => ({
  mode: 'floating',
  defaultFloatingState: uncontrolledDefaultFloatingState.value,
  floatingOptions: uncontrolledFloatingOptions,
}))

const undefinedFloatingLayoutProps = computed<Record<string, unknown>>(() => ({
  mode: 'floating',
  floatingState: undefined,
  defaultFloatingState: undefinedFloatingDefaultState.value,
  floatingOptions: uncontrolledFloatingOptions,
}))

function getPlacementLayoutProps(config: LayoutFloatingState): Record<string, unknown> {
  return {
    mode: 'floating',
    defaultFloatingState: config,
    floatingOptions: placementOptions,
  }
}

function handleBlockedFloating(next: LayoutFloatingState) {
  blockedFloatingUpdates.value += 1
  blockedFloatingLastPlacement.value = next.placement ?? ''
  blockedFloatingLastOffsetX.value = next.offsetX ?? -1
  blockedFloatingLastOffsetY.value = next.offsetY ?? -1
  if (next.width !== undefined) {
    blockedFloatingLastWidth.value = next.width
  }
}

function handleUncontrolledFloating(next: LayoutFloatingState) {
  uncontrolledFloatingUpdates.value += 1
  uncontrolledFloatingLastPlacement.value = next.placement ?? ''
  uncontrolledFloatingLastOffsetX.value = next.offsetX ?? -1
  uncontrolledFloatingLastOffsetY.value = next.offsetY ?? -1
  if (next.width !== undefined) {
    uncontrolledFloatingLastWidth.value = next.width
  }
}

function updateUncontrolledDefaultFloating() {
  uncontrolledDefaultFloatingState.value = {
    ...uncontrolledDefaultFloatingState.value,
    placement: 'bottom-left',
    offsetX: 40,
    offsetY: 48,
    width: 360,
  }
}

function openPlacementFixtures() {
  showPlacementFixtures.value = true
}
</script>

<template>
  <div class="floating-state-fixtures">
    <div class="floating-state-fixtures__metrics">
      <div data-testid="blocked-floating-updates">{{ blockedFloatingUpdates }}</div>
      <div data-testid="blocked-floating-last-placement">{{ blockedFloatingLastPlacement }}</div>
      <div data-testid="blocked-floating-last-offset-x">{{ blockedFloatingLastOffsetX }}</div>
      <div data-testid="blocked-floating-last-offset-y">{{ blockedFloatingLastOffsetY }}</div>
      <div data-testid="blocked-floating-last-width">{{ blockedFloatingLastWidth }}</div>
      <div data-testid="uncontrolled-floating-updates">{{ uncontrolledFloatingUpdates }}</div>
      <div data-testid="uncontrolled-floating-last-placement">{{ uncontrolledFloatingLastPlacement }}</div>
      <div data-testid="uncontrolled-floating-last-offset-x">{{ uncontrolledFloatingLastOffsetX }}</div>
      <div data-testid="uncontrolled-floating-last-offset-y">{{ uncontrolledFloatingLastOffsetY }}</div>
      <div data-testid="uncontrolled-floating-last-width">{{ uncontrolledFloatingLastWidth }}</div>
    </div>

    <button
      type="button"
      class="floating-state-fixtures__placement-toggle"
      data-testid="show-floating-placement-fixtures-btn"
      @click="openPlacementFixtures"
    >
      show floating placement fixtures
    </button>

    <TrLayout
      id="blocked-floating-surface"
      data-surface-marker="blocked-floating"
      class="floating-state-fixtures__layout"
      v-bind="blockedFloatingLayoutProps"
      @update:floating-state="handleBlockedFloating"
    >
      <template #main>
        <div class="floating-state-fixtures__panel">blocked controlled floating</div>
      </template>
    </TrLayout>

    <TrLayout
      id="uncontrolled-floating-surface"
      data-surface-marker="uncontrolled-floating"
      class="floating-state-fixtures__layout"
      v-bind="uncontrolledFloatingLayoutProps"
      @update:floating-state="handleUncontrolledFloating"
    >
      <template #main>
        <div class="floating-state-fixtures__panel">
          <span>uncontrolled floating</span>
          <button
            type="button"
            data-testid="uncontrolled-default-floating-update-btn"
            @click="updateUncontrolledDefaultFloating"
          >
            update default floating
          </button>
        </div>
      </template>
    </TrLayout>

    <TrLayout
      id="undefined-floating-surface"
      data-surface-marker="undefined-floating"
      class="floating-state-fixtures__layout"
      v-bind="undefinedFloatingLayoutProps"
    >
      <template #main>
        <div class="floating-state-fixtures__panel">undefined controlled keys floating</div>
      </template>
    </TrLayout>

    <template v-if="showPlacementFixtures">
      <TrLayout
        v-for="placementFixture in placementDefaults"
        :id="`${placementFixture.marker}-surface`"
        :key="placementFixture.marker"
        :data-surface-marker="placementFixture.marker"
        class="floating-state-fixtures__layout"
        v-bind="getPlacementLayoutProps(placementFixture.config)"
      >
        <template #main>
          <div class="floating-state-fixtures__panel">{{ placementFixture.marker }}</div>
        </template>
      </TrLayout>
    </template>
  </div>
</template>

<style scoped>
.floating-state-fixtures__metrics {
  display: none;
}

.floating-state-fixtures__placement-toggle {
  margin: 0 0 12px;
}

.floating-state-fixtures__layout {
  --tr-layout-left-aside-bg: #f8fafc;
  --tr-layout-right-aside-bg: #f8fafc;
  --tr-layout-main-bg: #ffffff;
}

.floating-state-fixtures__panel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 100%;
  padding: 16px;
  box-sizing: border-box;
}
</style>
