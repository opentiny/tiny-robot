<script setup lang="ts">
import { IconArrowUp } from '@opentiny/tiny-robot-svgs'
import { ref } from 'vue'
import { BubbleTextStepItem } from '../../types'

const props = defineProps<BubbleTextStepItem>()

const collapsed = ref(false)
</script>

<template>
  <div class="tr-bubble__step">
    <div class="tr-bubble__step-text-title">
      <span>{{ props.title }}</span>
      <IconArrowUp class="expand-icon" :class="{ 'rotate-180': collapsed }" @click="collapsed = !collapsed" />
    </div>
    <div class="tr-bubble__step-text-content-wrapper">
      <div v-show="!collapsed" class="tr-bubble__step-text-content">{{ props.content }}</div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-bubble__step-text-title {
  font-size: 14px;
  line-height: 22px;
  color: rgb(25, 25, 25);
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    margin-left: -1px;
    border-radius: 50%;
    background-color: rgb(25, 25, 25);
  }
}

.tr-bubble__step-text-content-wrapper {
  overflow: hidden;
}

.tr-bubble__step-text-content {
  font-size: 14px;
  line-height: 16px;
  color: rgb(89, 89, 89);
  border-left: 2px solid rgb(219, 219, 219);
  padding-left: 8px;
  margin-top: 8px;
  white-space: pre-line;
  display: inline-block;
}

.expand-icon {
  font-size: 14px;
  cursor: pointer;

  &.rotate-180 {
    transform: rotate(180deg);
  }
}
</style>
