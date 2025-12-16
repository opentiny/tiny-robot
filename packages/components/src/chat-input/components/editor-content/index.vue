<script setup lang="ts">
import { EditorContent as TiptapEditorContent } from '@tiptap/vue-3'
import { useChatInputContext } from '../../context'

// editorRef 在模板中通过 ref="editorRef" 使用
const { editor, editorRef } = useChatInputContext()
</script>

<template>
  <div ref="editorRef" class="tr-chat-input-editor-wrapper">
    <!-- 新增：滚动容器，用于控制高度和滚动 -->
    <div class="tr-chat-input-editor-scroll">
      <TiptapEditorContent v-if="editor" :editor="editor" class="tr-chat-input-editor-content" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-chat-input-editor-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
}

// 滚动容器：高度和滚动由 useAutoSize 控制
.tr-chat-input-editor-scroll {
  flex: 1;
  min-width: 0;
  overflow-y: hidden; // 默认隐藏，由 JS 控制

  // 滚动条样式
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15);
    border-radius: 3px;

    &:hover {
      background: rgba(0, 0, 0, 0.25);
    }
  }
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
    min-height: var(--tr-chat-input-line-height, 26px);

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
