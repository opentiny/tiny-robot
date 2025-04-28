<template>
  <div class="tr-history__empty">
    <span class="tr-history__empty-icon">
      <IconEmptySearch />
    </span>
    <span class="tr-history__empty-text">{{ props.text }}</span>
  </div>
</template>

<script setup lang="ts">
import { IconEmptySearch } from '@opentiny/tiny-robot-svgs'

const props = withDefaults(defineProps<{ text: string }>(), {
  text: '暂无内容',
})
</script>

<style lang="less" scoped>
.tr-history__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 84px;
  padding-bottom: 0;

  .tr-history__empty-icon {
    font-size: 16px;
  }

  .tr-history__empty-text {
    font-size: 12px;
    line-height: 24px;
    color: rgb(25, 25, 25);
  }
}
</style>
