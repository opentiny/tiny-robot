<script setup lang="ts">
import { useAttrs } from 'vue'
import type { DataItem } from '../types/editor.type'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps<DataItem>()
const attrs = useAttrs()
</script>
<!-- 设置 contenteditable="false" 是为了不会将文本插入到非text元素。但是可能导致光标不显示 -->
<template>
  <span v-if="props.type !== 'block'" :data-id="props.id" :data-type="props.type" v-bind="attrs">
    {{ props.content }}
  </span>
  <template v-else>
    <template v-if="props.asChild">
      <Block v-for="item in props.content as DataItem[]" :key="`${item.id}-${item.type}`" v-bind="item" />
    </template>
    <span v-else :data-id="props.id" :data-type="props.type" v-bind="attrs">
      <Block v-for="item in props.content as DataItem[]" :key="`${item.id}-${item.type}`" v-bind="item" />
    </span>
  </template>
</template>

<style lang="less" scoped>
[data-type='text'] {
  display: inline;
  white-space: pre-wrap;
  word-break: break-all;
  word-wrap: break-word;
}

[data-type='block'] {
  color: var(--tr-sender-template-block-color);
  max-width: none;
  background: var(--tr-sender-template-block-bg-color);
  padding: 5.5px 8px;
  margin: 0 4px;
  border-radius: 6px;
  cursor: text;
  caret-color: var(--tr-sender-template-block-caret-color);
  white-space: pre-wrap;
  word-break: break-all;
  word-wrap: break-word;
  box-sizing: border-box;
  overflow-wrap: break-word;
  hyphens: auto;

  box-decoration-break: clone;
}

[data-type='template']:empty {
  display: inline-block;
  min-width: 16px;
}
</style>
