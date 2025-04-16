<script setup lang="ts">
import { toRaw } from 'vue'
import { PromptProps, PromptsEvents, PromptsProps, PromptsSlots } from './index.type'
import Prompt from './prompt.vue'

const props = defineProps<PromptsProps>()

const emit = defineEmits<PromptsEvents>()

defineSlots<PromptsSlots>()

const handleClick = (ev: MouseEvent, item: PromptProps) => {
  emit('item-click', ev, toRaw(item))
}
</script>

<template>
  <div class="tr-prompts">
    <div :class="['tr-prompts__list-container', { wrap: props.wrap, vertical: props.vertical }]">
      <Prompt
        v-for="(item, index) in props.items"
        :key="item.id || index"
        v-bind="item"
        :style="props.itemStyle"
        :class="props.itemClass"
        @click="handleClick($event, item)"
      ></Prompt>
    </div>
    <slot name="footer"></slot>
  </div>
</template>

<style lang="less" scoped>
.tr-prompts {
  .tr-prompts__list-container {
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
}
</style>
