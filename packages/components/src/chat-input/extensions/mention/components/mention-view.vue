<script setup lang="ts">
import { NodeViewWrapper } from '@tiptap/vue-3'

interface NodeAttrs {
  id: string
  label: string
  value?: string
  [key: string]: unknown
}

interface Props {
  node: {
    attrs: NodeAttrs
    [key: string]: unknown
  }
  extension: {
    options: {
      char: string // 触发字符，插件默认为 '@'
    }
  }
}

defineProps<Props>()
</script>

<template>
  <NodeViewWrapper as="span" class="mention" :data-id="node.attrs.id" :data-value="node.attrs.value"
    >{{ extension.options.char }}{{ node.attrs.label }}</NodeViewWrapper
  >
</template>

<style lang="less" scoped>
.mention {
  display: inline;
  color: var(--tr-chat-input-mention-color);
  background: var(--tr-chat-input-mention-bg);
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
  transition: background 0.2s;

  &:hover {
    background: var(--tr-chat-input-mention-hover-bg);
  }
}
</style>
