<script setup lang="ts">
import { ref } from 'vue'
import { TinySwitch } from '@opentiny/vue'
import MainScrollBubble from './main-scroll-bubble.vue'
import MainScrollDiv from './main-scroll-div.vue'

const activeExample = ref<'bubble' | 'div'>('bubble')
const isCentered = ref(true)
</script>

<template>
  <div class="layout-main-scroll-demo">
    <div class="layout-main-scroll-demo__toolbar">
      <div class="layout-main-scroll-demo__switcher" aria-label="主区滚动示例切换">
        <button
          type="button"
          class="layout-main-scroll-demo__switch"
          :class="{ 'is-active': activeExample === 'bubble' }"
          :aria-pressed="activeExample === 'bubble'"
          @click="activeExample = 'bubble'"
        >
          BubbleList
        </button>

        <button
          type="button"
          class="layout-main-scroll-demo__switch"
          :class="{ 'is-active': activeExample === 'div' }"
          :aria-pressed="activeExample === 'div'"
          @click="activeExample = 'div'"
        >
          普通 div
        </button>
      </div>

      <label class="layout-main-scroll-demo__field">
        <span>内容居中</span>
        <tiny-switch v-model="isCentered"></tiny-switch>
      </label>
    </div>

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

.layout-main-scroll-demo__switcher {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.layout-main-scroll-demo__field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
}

.layout-main-scroll-demo__switch {
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--vp-c-divider, var(--tr-border-color, #dcdfe6));
  border-radius: 8px;
  background: var(--vp-c-bg, #ffffff);
  color: var(--vp-c-text-2, var(--tr-text-secondary, #4e5969));
  cursor: pointer;
}

.layout-main-scroll-demo__switch.is-active {
  border-color: var(--vp-c-brand-1, var(--tr-color-primary, #5e7ce0));
  color: var(--vp-c-brand-1, var(--tr-color-primary, #5e7ce0));
}

.layout-main-scroll-demo__stage {
  --tr-layout-height: 400px;
}
</style>
