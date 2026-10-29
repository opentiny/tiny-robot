<script setup lang="ts">
import { IconNoData } from '@opentiny/tiny-robot-svgs'
</script>

<style lang="less">
:root {
  --tr-suggestion-popover-no-data-color: var(--tr-text-primary);
  --tr-suggestion-popover-no-data-font-size: 12px;
  --tr-suggestion-popover-no-data-line-height: 24px;
}
</style>

<template>
  <div class="tr-question__no-data-wrapper">
    <slot>
      <IconNoData class="tr-question__no-data" />
      <span class="tr-question__no-data-text">暂时没有内容</span>
    </slot>
  </div>
</template>

<style scoped lang="less">
.tr-question__no-data-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .tr-question__no-data {
    width: 120px;
    height: 120px;
  }

  .tr-question__no-data-text {
    margin-top: 14px;
    font-size: var(--tr-suggestion-popover-no-data-font-size);
    line-height: var(--tr-suggestion-popover-no-data-line-height);
    color: var(--tr-suggestion-popover-no-data-color);
  }
}
</style>
