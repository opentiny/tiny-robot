<script setup lang="ts">
import { BubbleStepGroupMessageProps } from '../../types'
import TextStep from './TextStep.vue'
import ToolStep from './ToolStep.vue'

const props = defineProps<BubbleStepGroupMessageProps>()
</script>

<template>
  <div class="tr-bubble__step-group">
    <div class="tr-bubble__step-group-title">
      <!-- TODO 其他状态的图标 -->
      <img
        v-if="props.data.status === 'running'"
        src="../../../assets/loading.webp"
        style="width: 24px; height: 24px"
      />
      <span>{{ props.data.title }}</span>
    </div>
    <template v-for="(step, index) in props.data.steps" :key="index">
      <TextStep v-if="step.type === 'text'" v-bind="step" />
      <ToolStep v-else-if="step.type === 'tool'" v-bind="step" />
    </template>
  </div>
</template>

<style lang="less" scoped>
.tr-bubble__step-group {
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tr-bubble__step-group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  line-height: 22px;
  font-weight: 600;
}
</style>
