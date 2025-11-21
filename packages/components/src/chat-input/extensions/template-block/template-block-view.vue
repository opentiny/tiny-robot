<script setup lang="ts">
/**
 * TemplateBlockView 组件
 *
 * 模板块的 Vue 节点视图
 * - 渲染模板块的视觉样式
 * - 内容由 ProseMirror 管理（通过 NodeViewContent）
 */

import { NodeViewWrapper, NodeViewContent } from '@tiptap/vue-3'

interface NodeAttrs {
  id: string
  content: string
  [key: string]: unknown
}

interface Props {
  node: {
    attrs: NodeAttrs
    [key: string]: unknown
  }
}

defineProps<Props>()
</script>

<template>
  <NodeViewWrapper as="span" class="template-block" :data-id="node.attrs.id">
    <NodeViewContent as="span" class="template-block__content" />
  </NodeViewWrapper>
</template>

<style scoped>
.template-block {
  display: inline;
  color: var(--tr-chat-input-template-color, #1476ff);
  background: var(--tr-chat-input-template-bg, rgba(20, 118, 255, 0.1));
  padding: 2px 4px;
  margin: 0 2px;
  border-radius: var(--tr-chat-input-template-border-radius, 6px);
  cursor: text;
  white-space: pre-wrap;
  word-break: break-all;
  word-wrap: break-word;
  box-sizing: border-box;
  overflow-wrap: break-word;
  box-decoration-break: clone;
  vertical-align: baseline;
  min-width: 32px; /* 空白时保持最小宽度 */
}

.template-block__content {
  outline: none;
  display: inline;
  white-space: pre-wrap;
  word-break: break-all;
  word-wrap: break-word;
}

/* 空白占位符 */
.template-block__content:empty::before {
  content: '\200B'; /* 零宽字符占位 */
  opacity: 0;
}
</style>
