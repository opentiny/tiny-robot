<script setup lang="ts">
import { IconArrowDown, IconToolRunning } from '@opentiny/tiny-robot-svgs'
import { ref } from 'vue'
import { BubbleToolStepItem } from '../../types'

const props = defineProps<BubbleToolStepItem>()

const collapsed = ref(false)
</script>

<template>
  <div class="tr-bubble__step-tool">
    <div class="tr-bubble__step-tool-header">
      <IconToolRunning class="tr-bubble__step-tool-icon" />
      <span class="tr-bubble__step-tool-title">
        {{ props.status === 'running' ? '正在调用' : '已调用' }}
        <span class="tr-bubble__step-tool-name">{{ props.name }}</span></span
      >
    </div>
    <div class="tr-bubble__step-tool-expand">
      <IconArrowDown class="expand-icon" :class="{ '-rotate-90': !collapsed }" @click="collapsed = !collapsed" />
      <!-- TODO 渲染 data -->
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-bubble__step-tool {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 14px;
  line-height: 24px;
  padding: 12px;
  color: rgb(89, 89, 89);
  background-color: rgb(250, 250, 250);
  border-radius: 12px;

  .tr-bubble__step-tool-header {
    display: flex;
    align-items: center;
    gap: 8px;

    .tr-bubble__step-tool-icon {
      font-size: 20px;
      flex-shrink: 0;
    }

    .tr-bubble__step-tool-title {
      word-break: break-word;
    }

    .tr-bubble__step-tool-name {
      color: rgb(25, 25, 25);
      font-weight: 600;
    }
  }

  .tr-bubble__step-tool-expand {
    cursor: pointer;
    flex-shrink: 0;

    .expand-icon {
      font-size: 16px;

      &.-rotate-90 {
        transform: rotate(-90deg);
      }
    }
  }
}
</style>
