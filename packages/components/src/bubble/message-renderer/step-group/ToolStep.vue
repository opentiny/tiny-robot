<script setup lang="ts">
import { IconArrowDown } from '@opentiny/tiny-robot-svgs'
import { BubbleToolStepItem } from '../../types'
import { ref } from 'vue'

const props = defineProps<BubbleToolStepItem>()

const collapsed = ref(false)
</script>

<template>
  <div class="tr-bubble__step-tool">
    <div class="tr-bubble__step-tool-title">
      <span class="tr-bubble__step-tool-status">{{ props.status === 'running' ? '正在调用' : '已调用' }}</span>
      <span class="tr-bubble__step-tool-name">{{ props.name }}</span>
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
  line-height: 22px;
  padding: 12px;
  background-color: #fafafa;
  border-radius: 8px;

  .tr-bubble__step-tool-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tr-bubble__step-tool-expand {
    cursor: pointer;
    flex-shrink: 0;

    .expand-icon {
      font-size: 14px;

      &.-rotate-90 {
        transform: rotate(-90deg);
      }
    }
  }

  .tr-bubble__step-tool-name {
    font-weight: 600;
  }
}
</style>
