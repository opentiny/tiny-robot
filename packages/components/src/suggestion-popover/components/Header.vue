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
    <IconButton class="tr-question-popover__close" :icon="IconClose" size="24" svg-size="20" @click="handleClose" />
  </div>
</template>

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
    font-size: 20px;
    line-height: 30px;
    font-weight: 600;
  }

  .tr-question-popover__close {
    // TODO icon 待整改
    // color: #595959;
    right: 0;
    position: absolute;
  }
}
</style>
