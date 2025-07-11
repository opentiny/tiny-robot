<script setup lang="ts">
import { IconClose, IconSparkles } from '@opentiny/tiny-robot-svgs'
import IconButton from '../../icon-button'
import { SuggestionPopoverProps } from '../index.type'

const props = defineProps<Pick<SuggestionPopoverProps, 'icon' | 'title'>>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <div class="tr-question__header">
    <component v-if="props.icon" :is="props.icon" />
    <span v-else class="tr-question__header-icon">
      <IconSparkles style="color: #1476ff" />
    </span>
    <h3 class="tr-question__header-title">{{ props.title }}</h3>
    <IconButton class="tr-question-popover__close" :icon="IconClose" size="32" svg-size="20" @click="handleClose" />
  </div>
</template>

<style lang="less">
:root {
  --tr-suggestion-popover-header-font-size: 20px;
  --tr-suggestion-popover-header-line-height: 30px;

  --tr-suggestion-popover-close-bg-color: var(--tr-icon-button-bg);
  --tr-suggestion-popover-close-hover-bg-color: var(--tr-icon-button-hover-bg);
  --tr-suggestion-popover-close-color: #595959;
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

  .tr-question-popover__close {
    background-color: var(--tr-suggestion-popover-close-bg-color);
    color: var(--tr-suggestion-popover-close-color);
    right: 0;
    position: absolute;
  }
}
</style>
