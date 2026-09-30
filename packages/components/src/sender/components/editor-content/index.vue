<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { EditorContent as TiptapEditorContent } from '@tiptap/vue-3'
import { useMutationObserver, useResizeObserver } from '@vueuse/core'
import { useSenderContext } from '../../context'

// editorRef 在模板中通过 ref="editorRef" 使用
const { editor, editorRef, mode } = useSenderContext()
const editorScrollRef = ref<HTMLElement | null>(null)
const inputPrefixRef = ref<HTMLElement | null>(null)
const placeholder = ref('')

const syncPlaceholder = () => {
  const element = editorScrollRef.value?.querySelector('.ProseMirror > p.is-editor-empty:first-child')
  placeholder.value = mode.value === 'multiple' ? (element?.getAttribute('data-placeholder') ?? '') : ''
}

useResizeObserver(inputPrefixRef, ([entry]) => {
  if (!entry) return

  editorScrollRef.value?.style.setProperty('--tr-sender-input-prefix-width', `${entry.contentRect.width}px`)
})

useMutationObserver(editorScrollRef, syncPlaceholder, {
  subtree: true,
  childList: true,
  attributes: true,
  attributeFilter: ['class', 'data-placeholder'],
})

watch([editor, mode], () => nextTick(syncPlaceholder), { immediate: true })
</script>

<template>
  <div ref="editorRef" class="tr-sender-editor-wrapper">
    <!-- 新增：滚动容器，用于控制高度和滚动 -->
    <div
      ref="editorScrollRef"
      :class="[
        'tr-sender-editor-scroll',
        { 'has-input-prefix': $slots['input-prefix'], 'is-multiple': mode === 'multiple' },
      ]"
    >
      <div v-if="$slots['input-prefix']" ref="inputPrefixRef" class="tr-sender-input-prefix">
        <slot name="input-prefix" />
      </div>
      <div v-if="mode === 'multiple' && placeholder" class="tr-sender-placeholder" aria-hidden="true">
        {{ placeholder }}
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

    .tr-sender-placeholder {
      text-indent: calc(var(--tr-sender-input-prefix-width, 0px) + var(--tr-sender-gap, 8px));
    }
  }

  &.is-multiple {
    display: grid;

    .tr-sender-placeholder,
    :deep(.tr-sender-editor-content) {
      grid-area: 1 / 1;
    }

    :deep(.tr-sender-editor-content),
    :deep(.ProseMirror),
    :deep(.ProseMirror p.is-editor-empty:first-child) {
      min-height: 100%;
    }

    :deep(.ProseMirror p.is-editor-empty:first-child::before) {
      display: none;
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

.tr-sender-placeholder {
  min-width: 0;
  color: var(--tr-sender-placeholder-color);
  line-height: var(--tr-sender-line-height, 26px);
  font-size: var(--tr-sender-font-size, 16px);
  pointer-events: none;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
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
