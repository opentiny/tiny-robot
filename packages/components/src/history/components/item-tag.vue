<script setup lang="ts">
import type { HistoryItemTagProps } from '../index.type'

const props = withDefaults(defineProps<HistoryItemTagProps>(), {
  type: 'default',
})
</script>

<template>
  <div :class="['tr-history__item-tag', props.type]" :style="props.style">
    <span>{{ props.text }}</span>
  </div>
</template>

<style lang="less" scoped>
.tr-history__item-tag {
  padding: 0 4px;
  font-size: 12px;
  line-height: 18px;
  border-radius: 2px;

  &.default {
    color: rgb(25, 25, 25);
    background-color: rgb(245, 245, 245);
  }

  &.success {
    // TODO 成功
    color: rgb(25, 25, 25);
    background-color: rgb(245, 245, 245);
  }

  &.warning {
    // TODO 警告
    color: rgb(25, 25, 25);
    background-color: rgb(245, 245, 245);
  }

  &.error {
    color: rgb(242, 48, 48);
    background-color: rgb(252, 227, 224);
  }

  &.info {
    color: rgb(20, 118, 255);
    background-color: rgb(222, 236, 255);
  }
}
</style>
