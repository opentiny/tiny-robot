<script setup lang="ts">
import { IconSparkles } from '@opentiny/tiny-robot-svgs'
import { SuggestionPopoverProps } from '../index.type'

const props = defineProps<Pick<SuggestionPopoverProps, 'icon' | 'title'>>()
</script>

<template>
  <div class="tr-question__header">
    <component v-if="props.icon" :is="props.icon" />
    <span v-else class="tr-question__header-icon">
      <IconSparkles style="color: #1476ff" />
    </span>
    <h3 class="tr-question__header-title">{{ props.title }}</h3>
  </div>
</template>

<style lang="less">
:root {
  --tr-suggestion-popover-header-font-size: 20px;
  --tr-suggestion-popover-header-line-height: 30px;
}
</style>

<style scoped lang="less">
.tr-question__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;

  .tr-question__header-icon {
    font-size: 24px;
    width: 36px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .tr-question__header-title {
    margin: 0;
    font-size: var(--tr-suggestion-popover-header-font-size);
    line-height: var(--tr-suggestion-popover-header-line-height);
    font-weight: 600;
  }
}
</style>
