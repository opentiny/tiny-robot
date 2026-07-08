<script setup lang="ts">
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
</script>

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
