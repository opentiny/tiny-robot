<script setup lang="ts">
import { PromptsEvents, PromptsProps } from './index.type'
import Prompt from './prompt.vue'

const props = defineProps<PromptsProps>()

const emit = defineEmits<PromptsEvents>()
</script>

<template>
  <div :class="['tr-prompts', { wrap: props.wrap, vertical: props.vertical }]">
    <Prompt
      v-for="(item, index) in props.items"
      :key="item.id || index"
      v-bind="item"
      :style="props.itemStyle"
      :class="props.itemClass"
      @click="emit('item-click', $event, item)"
    ></Prompt>
  </div>
</template>

<style lang="less" scoped>
.tr-prompts {
  display: flex;
  gap: 16px;
  overflow-x: auto;

  &.wrap {
    flex-wrap: wrap;
  }

  &.vertical {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
