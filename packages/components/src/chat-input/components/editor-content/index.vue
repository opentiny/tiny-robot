<script setup lang="ts">
import { EditorContent as TiptapEditorContent } from '@tiptap/vue-3'
import { useChatInputContext } from '../../context'

const { editor } = useChatInputContext()
</script>

<template>
  <TiptapEditorContent v-if="editor" :editor="editor" class="tr-chat-input-editor-content" />
</template>

<style lang="less" scoped>
.tr-chat-input-editor-content {
  flex: 1;
  min-width: 0;

  :deep(.ProseMirror) {
    outline: none;
    min-height: var(--tr-chat-input-min-height, 42px);
    line-height: var(--tr-chat-input-line-height, 26px);
    font-size: var(--tr-chat-input-font-size, 16px);
    color: var(--tr-chat-input-text-color);

    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: var(--tr-chat-input-placeholder-color);
      pointer-events: none;
      height: 0;
    }
  }
}
</style>
