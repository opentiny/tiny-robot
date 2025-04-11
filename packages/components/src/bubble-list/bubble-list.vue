<script setup lang="ts">
import { BubbleListProps } from './index.type'
import BubbleItem from '../bubble-item'

const props = withDefaults(defineProps<BubbleListProps>(), {})
</script>

<template>
  <div class="tr-bubble-list">
    <!-- TODO key 怎么处理 -->
    <bubble-item
      v-for="(item, index) in props.items"
      :key="index"
      :role="item.role"
      :content="item.content"
      :type="item.type"
      :loading="index === props.items.length - 1 && props.loading"
      :aborted="item.aborted"
      :role-config="item.roleConfig || props.roleConfigs?.[item.role]"
      :md-config="item.mdConfig || props.mdConfig"
      :user-actions="props.userActions"
      :ai-actions="props.aiActions"
    ></bubble-item>
  </div>
</template>

<style lang="less" scoped>
.tr-bubble-list {
}
</style>
