<script setup lang="ts">
import { BubbleListProps } from './index.type'
import BubbleItem from '../bubble-item'
import { computed, nextTick, ref, watch } from 'vue'

const props = withDefaults(defineProps<BubbleListProps>(), {})

const scrollContainer = ref()

const lastBubble = computed(() => props.items.slice(-1).pop())

watch([() => props.items.length, () => lastBubble.value?.content], () => {
  if (!props.autoScroll) {
    return
  }

  nextTick(() => {
    scrollContainer.value?.scrollTo({
      top: scrollContainer.value.scrollHeight,
      behavior: 'smooth',
    })
  })
})
</script>

<template>
  <div class="tr-bubble-list" ref="scrollContainer">
    <!-- TODO key 怎么处理 -->
    <bubble-item
      v-for="(item, index) in props.items"
      :key="index"
      :role="item.role"
      :content="item.content"
      :type="item.type"
      :status="item.status"
      :role-config="item.roleConfig || props.roleConfigs?.[item.role]"
      :md-config="item.mdConfig || props.mdConfig"
      :show-actions="props.actionConfigs?.[item.role]?.show"
      :actions="props.actionConfigs?.[item.role]?.actions"
      :max-width="props.maxWidth"
    ></bubble-item>
  </div>
</template>

<style lang="less" scoped>
.tr-bubble-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
  padding: 16px;
}
</style>
