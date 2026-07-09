<script setup lang="ts">
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
</script>

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
