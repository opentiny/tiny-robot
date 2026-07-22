<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'
import type { LayoutAsideOpenValue } from '@opentiny/tiny-robot'

const leftOpen = ref(true)

function updateLeftAside(detail: LayoutAsideOpenValue) {
  leftOpen.value = detail.open
}
</script>

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
        <div class="layout-aside-toggle-demo__main">按钮文案和形态直接使用 `isOpen` 插槽状态切换。</div>
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
