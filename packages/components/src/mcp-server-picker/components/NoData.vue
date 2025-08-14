<template>
  <section class="empty-state" role="status" aria-live="polite">
    <IconEmptySearch v-if="hasSearchQuery" class="empty-state__illustration" />
    <img v-else src="../../assets/svgs/no-data.svg" class="empty-state__illustration" />
    <p class="empty-state__message">
      {{ message }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { IconEmptySearch } from '@opentiny/tiny-robot-svgs'

interface EmptyStateProps {
  searchQuery: string
}

const props = withDefaults(defineProps<EmptyStateProps>(), {
  searchQuery: '',
})

const hasSearchQuery = computed(() => !!props.searchQuery?.trim())
const message = computed(() => (hasSearchQuery.value ? '暂无搜索结果' : '暂无数据'))
</script>

<style lang="less" scoped>
.empty-state {
  --empty-state-illustration-size: 112px;
  --empty-state-message-color: #191919;
  --empty-state-message-font-size: 12px;
  --empty-state-message-line-height: 24px;
  --empty-state-spacing: 12px;

  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 180px;

  &__illustration {
    width: var(--empty-state-illustration-size);
    height: var(--empty-state-illustration-size);
  }

  &__message {
    margin-top: var(--empty-state-spacing);
    font-size: var(--empty-state-message-font-size);
    line-height: var(--empty-state-message-line-height);
    color: var(--empty-state-message-color);
    text-align: center;
  }
}
</style>
