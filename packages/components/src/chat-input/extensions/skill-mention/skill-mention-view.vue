<script setup lang="ts">
/**
 * SkillMentionView 组件
 *
 * 技能 Mention 的 Vue 节点视图
 * - 渲染技能 mention 的视觉样式
 * - 作为 atom 节点，不可编辑
 */

import { NodeViewWrapper } from '@tiptap/vue-3'

interface NodeAttrs {
  id: string
  label: string
  preset?: string
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
  <NodeViewWrapper as="span" class="skill-mention" :data-id="node.attrs.id" :data-preset="node.attrs.preset"
    >@{{ node.attrs.label }}</NodeViewWrapper
  >
</template>

<style scoped>
.skill-mention {
  display: inline;
  color: var(--tr-chat-input-mention-color);
  background: var(--tr-chat-input-mention-bg);
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
  transition: background 0.2s;
}

.skill-mention:hover {
  background: var(--tr-chat-input-mention-hover-bg);
}
</style>
