<script setup lang="ts">
import { computed, ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import { TinyButton } from '@opentiny/vue'
import type { LayoutFloatingState } from '@opentiny/tiny-robot'

const open = ref(false)
const floatingState = ref<LayoutFloatingState>({
  placement: 'top-right',
  offsetX: 0,
  offsetY: 0,
  width: 520,
  height: 360,
})

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
      <span class="layout-floating-controlled-demo__tip">组件按 floatingState 渲染，变化通过事件通知外部。</span>
    </div>

    <TrLayout
      v-if="open"
      class="layout-floating-controlled-demo__layout"
      mode="floating"
      :floating-state="floatingState"
      :floating-options="{ draggable: false, resizable: true, minWidth: 360, maxWidth: 720, minHeight: 260 }"
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
          <pre class="layout-floating-controlled-demo__state">{{ stateText }}</pre>
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

.layout-floating-controlled-demo__tip {
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
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
  padding: 16px;
}

.layout-floating-controlled-demo__state {
  box-sizing: border-box;
  margin: 0;
  min-height: 100%;
  padding: 12px;
  border-radius: 8px;
  overflow: auto;
  background: var(--vp-c-bg-soft, #f6f8fa);
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}
</style>
