<script setup lang="ts">
import { EditorContent as TiptapEditorContent } from '@tiptap/vue-3'
import { useSenderContext } from '../../context'

// editorRef 在模板中通过 ref="editorRef" 使用
const { editor, editorRef } = useSenderContext()
</script>

<template>
  <div ref="editorRef" class="tr-sender-editor-wrapper">
    <!-- 新增：滚动容器，用于控制高度和滚动 -->
    <div class="tr-sender-editor-scroll">
      <TiptapEditorContent v-if="editor" :editor="editor" class="tr-sender-editor-content" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.tr-sender-editor-wrapper {
  flex: 1;
  min-width: 0;
  display: flex;
}

// 滚动容器：高度和滚动由 useAutoSize 控制
.tr-sender-editor-scroll {
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

.tr-sender-editor-content {
  flex: 1;
  min-width: 0;

  :deep(.ProseMirror) {
    outline: none;
    line-height: var(--tr-sender-line-height, 26px);
    font-size: var(--tr-sender-font-size, 16px);
    color: var(--tr-sender-text-color);
    white-space: pre-wrap; // ProseMirror 推荐使用 pre-wrap
    min-height: var(--tr-sender-line-height, 26px);

    p.is-editor-empty:first-child::before {
      content: attr(data-placeholder);
      float: left;
      color: var(--tr-sender-placeholder-color);
      pointer-events: none;
      height: 0;
    }

    p {
      margin: 0;
      line-height: var(--tr-sender-line-height, 26px);
    }
  }
}
</style>
