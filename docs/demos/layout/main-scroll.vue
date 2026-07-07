<script setup lang="ts">
import { ref } from 'vue'
import { TinyRadio, TinyRadioGroup, TinySwitch } from '@opentiny/vue'
import MainScrollBubble from './main-scroll-bubble.vue'
import MainScrollDiv from './main-scroll-div.vue'

const activeExample = ref<'bubble' | 'div'>('bubble')
const isCentered = ref(true)
</script>

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
    <p class="layout-main-scroll-demo__tip">外层作为滚动宿主，内层只负责居中和限宽。</p>

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
