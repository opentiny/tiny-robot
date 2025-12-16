<script setup lang="ts">
import { computed } from 'vue'
import { NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3'
import { ZERO_WIDTH_CHAR } from '../utils'

interface NodeAttrs {
  id: string
  content: string
  [key: string]: unknown
}

interface Props {
  node: {
    attrs: NodeAttrs
    textContent?: string
    [key: string]: unknown
  }
}

const props = defineProps<Props>()

// 判断内容是否为空（用于动态设置样式）
const isEmpty = computed(() => {
  const content = props.node.textContent || ''
  // 排除零宽字符
  return content.length === 0 || content === ZERO_WIDTH_CHAR
})
</script>

<template>
  <NodeViewWrapper as="span" class="template-block" :class="{ 'is-empty': isEmpty }" :data-id="node.attrs.id">
    <span contenteditable="false" class="template-block__prefix">&nbsp;</span>
    <NodeViewContent as="span" class="template-block__content" />
    <span contenteditable="false" class="template-block__suffix">&nbsp;</span>
  </NodeViewWrapper>
</template>

<style lang="less" scoped>
.template-block {
  display: inline;
  color: var(--tr-chat-input-template-color);
  background: var(--tr-chat-input-template-bg);
  padding: var(--tr-chat-input-template-padding);
  margin: var(--tr-chat-input-template-margin);
  border-radius: var(--tr-chat-input-template-border-radius);
  cursor: text;
  white-space: pre-wrap;
  word-break: break-all;
  word-wrap: break-word;
  box-sizing: border-box;
  overflow-wrap: break-word;
  box-decoration-break: clone;
  vertical-align: baseline;

  &__prefix,
  &__suffix {
    vertical-align: top;
    font-size: 0px;
    user-select: none;
  }

  /* 空内容时使用 inline-block，确保最小宽度生效 */
  &.is-empty {
    display: inline-block;
    min-width: var(--tr-chat-input-template-min-width);
    line-height: 1.1em;
  }

  &__content {
    outline: none;
    display: inline;
    white-space: pre-wrap;
    word-break: break-all;
    word-wrap: break-word;
  }
}
</style>
