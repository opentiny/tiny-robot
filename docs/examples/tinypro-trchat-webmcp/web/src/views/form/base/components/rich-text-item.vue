<script lang="ts" setup>
import TinyEditor from '@opentiny/fluent-editor'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import '@opentiny/fluent-editor/style.css'

const editorRef = ref<HTMLElement>()
let _editor: TinyEditor | null = null

// 工具栏配置：数组按行分组
const TOOLBAR_OPTIONS = [
  // 撤销 / 重做（fluent-editor 内置扩展）
  ['undo', 'redo'],
  // 标题
  [{ header: [1, 2, 3, 4, false] }],
  // 加粗等基础样式
  ['bold', 'italic', 'underline', 'strike'],
  // 字体颜色 / 背景色
  [{ color: [] }, { background: [] }],
  // 列表 / 对齐
  [{ list: 'ordered' }, { list: 'bullet' }],
  // 清除格式
  ['clean'],
  // 引用 / 代码块 / 链接
  ['blockquote', 'code-block', 'link'],
  [{ size: ['small', false, 'large', 'huge'] }],
  [{ align: [] }],
]

onMounted(() => {
  _editor = new TinyEditor(editorRef.value, {
    theme: 'snow',
    modules: {
      toolbar: TOOLBAR_OPTIONS,
    },
  })

  const html = '<p>Hello <strong>TinyEditor</strong>!</p>'
  _editor.root.innerHTML = html
})

onBeforeUnmount(() => {
  // 手动移除 Quill 生成的工具栏和编辑器 DOM，避免内存泄漏
  const container = editorRef.value
  if (container) {
    container.innerHTML = ''
  }
  _editor = null
})
</script>

<template>
  <div ref="editorRef" class="rich-text-item">
    <p>请在这里输入富文本内容...</p>
  </div>
</template>

<style scoped lang="less">
.rich-text-item {
  width: 100%;
}
</style>
