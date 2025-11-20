<script setup lang="ts">
import { EditorContent as TiptapEditorContent } from '@tiptap/vue-3'
import { useChatInputContext } from '../../context'

const { editor, editorRef } = useChatInputContext()
</script>

<template>
  <div ref="editorRef" class="tr-chat-input-editor-wrapper">
    <TiptapEditorContent v-if="editor" :editor="editor" class="tr-chat-input-editor-content" />
  </div>
</template>

<style lang="less" scoped>
.tr-chat-input-editor-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
}

.tr-chat-input-editor-content {
  flex: 1;
  min-width: 0;

  :deep(.ProseMirror) {
    outline: none;
    line-height: var(--tr-chat-input-line-height, 26px);
    font-size: var(--tr-chat-input-font-size, 16px);
    color: var(--tr-chat-input-text-color);
    white-space: pre-wrap; // ProseMirror 推荐使用 pre-wrap
    overflow: hidden;

    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: var(--tr-chat-input-placeholder-color);
      pointer-events: none;
      height: 0;
    }

    p {
      margin: 0;
      line-height: var(--tr-chat-input-line-height, 26px);
    }
  }
}
</style>
