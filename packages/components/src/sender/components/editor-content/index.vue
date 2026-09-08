<script setup lang="ts">
import { ref } from 'vue'
import { EditorContent as TiptapEditorContent } from '@tiptap/vue-3'
import { useResizeObserver } from '@vueuse/core'
import { useSenderContext } from '../../context'

// editorRef 在模板中通过 ref="editorRef" 使用
const { editor, editorRef } = useSenderContext()
const editorScrollRef = ref<HTMLElement | null>(null)
const inputPrefixRef = ref<HTMLElement | null>(null)

useResizeObserver(inputPrefixRef, ([entry]) => {
  if (!entry) return

  editorScrollRef.value?.style.setProperty('--tr-sender-input-prefix-width', `${entry.contentRect.width}px`)
})
</script>

<template>
  <div ref="editorRef" class="tr-sender-editor-wrapper">
    <!-- 新增：滚动容器，用于控制高度和滚动 -->
    <div ref="editorScrollRef" :class="['tr-sender-editor-scroll', { 'has-input-prefix': $slots['input-prefix'] }]">
      <div v-if="$slots['input-prefix']" ref="inputPrefixRef" class="tr-sender-input-prefix">
        <slot name="input-prefix" />
      </div>
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
  position: relative;
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

  &.has-input-prefix {
    :deep(.ProseMirror > p:first-child) {
      text-indent: calc(var(--tr-sender-input-prefix-width, 0px) + var(--tr-sender-gap, 8px));
    }
  }
}

.tr-sender-input-prefix {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  width: max-content;
  min-height: var(--tr-sender-line-height, 26px);
  line-height: var(--tr-sender-line-height, 26px);
  white-space: nowrap;
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
