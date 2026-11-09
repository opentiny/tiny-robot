<script setup lang="ts">
/** Markdown 所见即所得编辑器：入参与出参均为 Markdown 文本。 */
import type { Editor } from '@tiptap/core'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import { reactive, watch } from 'vue'
import { skillMarkdownExtensions, markdownToHtml, serializeMarkdown } from './markdown-editor'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const active = reactive({
  heading: 0,
  bold: false,
  italic: false,
  code: false,
  bulletList: false,
  orderedList: false,
  blockquote: false,
  codeBlock: false,
})

const syncActive = (instance: Editor) => {
  active.heading = instance.isActive('heading', { level: 1 }) ? 1 : instance.isActive('heading', { level: 2 }) ? 2 : 0
  active.bold = instance.isActive('bold')
  active.italic = instance.isActive('italic')
  active.code = instance.isActive('code')
  active.bulletList = instance.isActive('bulletList')
  active.orderedList = instance.isActive('orderedList')
  active.blockquote = instance.isActive('blockquote')
  active.codeBlock = instance.isActive('codeBlock')
}

const toggleHeading = (level: 1 | 2) => {
  const instance = editor.value
  if (!instance) return

  const chain = instance.chain().focus()
  if (instance.isActive('heading', { level })) chain.setNode('paragraph').run()
  else chain.setNode('heading', { level }).run()
}

let lastEmitted = props.modelValue

const editor = useEditor({
  content: markdownToHtml(props.modelValue),
  extensions: skillMarkdownExtensions,
  autofocus: 'start',
  editorProps: { attributes: { spellcheck: 'false', 'aria-label': 'Markdown 正文编辑器' } },
  onUpdate: ({ editor: instance }) => {
    lastEmitted = serializeMarkdown(instance.getJSON())
    emit('update:modelValue', lastEmitted)
  },
  onCreate: ({ editor: instance }: { editor: Editor }) => syncActive(instance),
  onTransaction: ({ editor: instance }: { editor: Editor }) => syncActive(instance),
})

watch(
  () => props.modelValue,
  (value) => {
    if (value === lastEmitted) return
    lastEmitted = value
    editor.value?.commands.setContent(markdownToHtml(value), { emitUpdate: false })
  },
)
</script>

<template>
  <div class="skill-markdown-editor">
    <div class="skill-markdown-editor__toolbar" role="toolbar" aria-label="Markdown 格式工具">
      <button
        type="button"
        class="skill-markdown-editor__button"
        :class="{ 'is-active': active.bold }"
        aria-label="加粗"
        title="加粗"
        @mousedown.prevent
        @click="editor?.chain().focus().toggleMark('bold').run()"
      >
        <span class="skill-markdown-editor__bold-label">B</span>
      </button>
      <button
        type="button"
        class="skill-markdown-editor__button"
        :class="{ 'is-active': active.italic }"
        aria-label="斜体"
        title="斜体"
        @mousedown.prevent
        @click="editor?.chain().focus().toggleMark('italic').run()"
      >
        <span class="skill-markdown-editor__italic-label">I</span>
      </button>
      <button
        type="button"
        class="skill-markdown-editor__button"
        :class="{ 'is-active': active.code }"
        aria-label="行内代码"
        title="行内代码"
        @mousedown.prevent
        @click="editor?.chain().focus().toggleMark('code').run()"
      >
        <span class="skill-markdown-editor__code-label">&lt;/&gt;</span>
      </button>
      <span class="skill-markdown-editor__divider" aria-hidden="true" />
      <button
        type="button"
        class="skill-markdown-editor__button skill-markdown-editor__button--text"
        :class="{ 'is-active': active.heading === 1 }"
        aria-label="标题 1"
        title="标题 1"
        @mousedown.prevent
        @click="toggleHeading(1)"
      >
        H1
      </button>
      <button
        type="button"
        class="skill-markdown-editor__button skill-markdown-editor__button--text"
        :class="{ 'is-active': active.heading === 2 }"
        aria-label="标题 2"
        title="标题 2"
        @mousedown.prevent
        @click="toggleHeading(2)"
      >
        H2
      </button>
      <span class="skill-markdown-editor__divider" aria-hidden="true" />
      <button
        type="button"
        class="skill-markdown-editor__button skill-markdown-editor__button--text"
        :class="{ 'is-active': active.bulletList }"
        aria-label="无序列表"
        title="无序列表"
        @mousedown.prevent
        @click="editor?.chain().focus().toggleList('bulletList', 'listItem').run()"
      >
        <span aria-hidden="true">• 列表</span>
      </button>
      <button
        type="button"
        class="skill-markdown-editor__button skill-markdown-editor__button--text"
        :class="{ 'is-active': active.orderedList }"
        aria-label="有序列表"
        title="有序列表"
        @mousedown.prevent
        @click="editor?.chain().focus().toggleList('orderedList', 'listItem').run()"
      >
        <span aria-hidden="true">1. 列表</span>
      </button>
      <span class="skill-markdown-editor__divider" aria-hidden="true" />
      <button
        type="button"
        class="skill-markdown-editor__button"
        :class="{ 'is-active': active.blockquote }"
        aria-label="引用"
        title="引用"
        @mousedown.prevent
        @click="editor?.chain().focus().toggleWrap('blockquote').run()"
      >
        <span aria-hidden="true">引用</span>
      </button>
      <button
        type="button"
        class="skill-markdown-editor__button"
        :class="{ 'is-active': active.codeBlock }"
        aria-label="代码块"
        title="代码块"
        @mousedown.prevent
        @click="editor?.chain().focus().toggleNode('paragraph', 'codeBlock').run()"
      >
        <span class="skill-markdown-editor__code-label">&lt;/&gt;</span>
      </button>
      <span class="skill-markdown-editor__spacer" />
      <button
        type="button"
        class="skill-markdown-editor__button"
        aria-label="撤销"
        title="撤销"
        :disabled="!editor?.can().undo()"
        @mousedown.prevent
        @click="editor?.chain().focus().undo().run()"
      >
        <span aria-hidden="true">↶</span>
      </button>
      <button
        type="button"
        class="skill-markdown-editor__button"
        aria-label="重做"
        title="重做"
        :disabled="!editor?.can().redo()"
        @mousedown.prevent
        @click="editor?.chain().focus().redo().run()"
      >
        <span aria-hidden="true">↷</span>
      </button>
    </div>
    <div class="skill-markdown-editor__body" @mousedown.self="editor?.commands.focus()">
      <EditorContent :editor="editor" class="skill-markdown-editor__content" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.skill-markdown-editor {
  display: flex;
  min-height: 280px;
  height: 100%;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--tr-border-color-default) 55%, transparent);
  border-radius: 6px;
  background: var(--tr-container-bg-default, #fff);
  color: var(--tr-text-primary);
}

.skill-markdown-editor__toolbar {
  display: flex;
  min-height: 40px;
  flex: 0 0 auto;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-bottom: 1px solid var(--tr-border-color-default);
}

.skill-markdown-editor__button {
  display: inline-flex;
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: var(--tr-text-primary);
  cursor: pointer;
}

.skill-markdown-editor__button:hover,
.skill-markdown-editor__button.is-active {
  background: var(--tr-container-bg-hover, #f2f2f2);
}

.skill-markdown-editor__button:disabled {
  color: var(--tr-text-disabled, #aaa);
  cursor: not-allowed;
}

.skill-markdown-editor__button--text {
  width: auto;
  min-width: 32px;
  padding: 0 6px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.skill-markdown-editor__bold-label {
  font-weight: 700;
}

.skill-markdown-editor__italic-label {
  font-style: italic;
}

.skill-markdown-editor__divider {
  width: 1px;
  height: 22px;
  flex: 0 0 auto;
  margin: 0 4px;
  background: var(--tr-border-color-default);
}

.skill-markdown-editor__spacer {
  flex: 1;
}

.skill-markdown-editor__code-label {
  font-size: 12px;
  font-weight: 600;
}

.skill-markdown-editor__body {
  min-height: 0;
  flex: 1;
  overflow: auto;
  cursor: text;
}

.skill-markdown-editor__content {
  display: block;
  min-height: 100%;
  padding: 12px 16px;
}

.skill-markdown-editor__content :deep(.ProseMirror) {
  min-height: 240px;
  outline: none;
  font-size: 14px;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.skill-markdown-editor__content :deep(.ProseMirror > :first-child) {
  margin-top: 0;
}

.skill-markdown-editor__content :deep(.ProseMirror h1),
.skill-markdown-editor__content :deep(.ProseMirror h2),
.skill-markdown-editor__content :deep(.ProseMirror h3),
.skill-markdown-editor__content :deep(.ProseMirror h4) {
  margin: 1.25em 0 0.55em;
  font-weight: 600;
  line-height: 1.35;
}

.skill-markdown-editor__content :deep(.ProseMirror h1) {
  font-size: 1.55em;
}

.skill-markdown-editor__content :deep(.ProseMirror h2) {
  font-size: 1.3em;
}

.skill-markdown-editor__content :deep(.ProseMirror p) {
  margin: 0.7em 0;
}

.skill-markdown-editor__content :deep(.ProseMirror ul),
.skill-markdown-editor__content :deep(.ProseMirror ol) {
  padding-left: 1.6em;
}

.skill-markdown-editor__content :deep(.ProseMirror li) {
  margin: 0.25em 0;
}

.skill-markdown-editor__content :deep(.ProseMirror code) {
  padding: 0.12em 0.35em;
  border-radius: 4px;
  background: var(--tr-container-bg-hover, #f2f2f2);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.9em;
}

.skill-markdown-editor__content :deep(.ProseMirror pre) {
  padding: 12px 14px;
  overflow: auto;
  border-radius: 6px;
  background: var(--tr-container-bg-hover, #f2f2f2);
}

.skill-markdown-editor__content :deep(.ProseMirror blockquote) {
  margin: 1em 0;
  padding-left: 1em;
  border-left: 3px solid var(--tr-border-color-default);
  color: var(--tr-text-secondary);
}
</style>
