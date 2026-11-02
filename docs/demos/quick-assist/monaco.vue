<template>
  <section id="qa-monaco-manual" class="qa-monaco-demo">
    <p>在编辑器中拖选代码，松开鼠标后即可看到“智能帮助”；也支持 Shift + 方向键选择。</p>
    <p class="qa-monaco-demo__status" role="status">{{ status }}</p>
    <div ref="editorHost" class="qa-monaco-demo__editor" aria-label="可选取代码的 Monaco 编辑器"></div>
    <p class="qa-monaco-demo__hint">{{ selectedText ? `已选中 ${selectedText.length} 个字符` : '尚未选择代码' }}</p>
    <aside v-if="lastRequest" class="qa-monaco-demo__result" aria-live="polite">
      <strong>示例助手已收到请求</strong>
      <p>{{ lastRequest.prompt }}</p>
      <pre>{{ lastRequest.context.text }}</pre>
      <small>来源：{{ lastRequest.source }} · 语言：{{ lastRequest.context.meta?.language }}。本示例不调用模型。</small>
    </aside>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import type { AIRequest, QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'
import type * as Monaco from 'monaco-editor'
import '@opentiny/tiny-robot/vanilla/style.css'

const editorHost = ref<HTMLElement>()
const selectedText = ref('')
const status = ref('正在加载编辑器…')
const lastRequest = shallowRef<AIRequest>()
let editor: Monaco.editor.IStandaloneCodeEditor | undefined
let model: Monaco.editor.ITextModel | undefined
let quickAssist: QuickAssistInstance | undefined
let disposed = false
let selectingWithPointer = false
let activationFrame: number | undefined
let lastIdentity: string | undefined
const cleanups: Array<() => void> = []

function cancelActivation() {
  if (activationFrame !== undefined) cancelAnimationFrame(activationFrame)
  activationFrame = undefined
}

function scheduleActivation() {
  cancelActivation()
  // 在编辑器处理完 pointerup/keyup 后读取最终选区，拖选期间不显示入口。
  activationFrame = requestAnimationFrame(() => {
    activationFrame = undefined
    if (!disposed && !selectingWithPointer && editor?.hasTextFocus()) explainSelection()
  })
}

function explainSelection() {
  const selection = editor?.getSelection()
  const currentModel = editor?.getModel()
  const container = editor?.getDomNode()
  if (!selection || selection.isEmpty() || !currentModel || !container || !editor) return

  const text = currentModel.getValueInRange(selection)
  const version = currentModel.getVersionId()
  const identity = `${currentModel.uri}:${version}:${selection.selectionStartLineNumber}:${selection.selectionStartColumn}:${selection.positionLineNumber}:${selection.positionColumn}`
  if (identity === lastIdentity) return
  lastIdentity = identity
  const end = selection.getEndPosition()
  // 在激活时截取有限上下文，避免浮层打开后读取另一个文档版本。
  const nearbyText = currentModel.getValueInRange({
    startLineNumber: Math.max(1, selection.startLineNumber - 2),
    startColumn: 1,
    endLineNumber: Math.min(currentModel.getLineCount(), selection.endLineNumber + 2),
    endColumn: currentModel.getLineMaxColumn(Math.min(currentModel.getLineCount(), selection.endLineNumber + 2)),
  })

  // 选词完成后由示例主动调用通用 API，仍未引入官方编辑器桥接器。
  quickAssist?.activate({
    source: 'monaco',
    text,
    suggestions: [
      {
        id: 'explain-code',
        getLabel: () => '解释这段代码',
        getPrompt: (context) => `请解释以下 ${context.meta?.language ?? ''} 代码的作用：\n${context.text}`,
      },
      {
        id: 'review-code',
        getLabel: () => '检查潜在问题',
        getPrompt: (context) => `请检查以下代码是否存在潜在问题：\n${context.text}`,
      },
    ],
    anchorElement: container,
    meta: { language: currentModel.getLanguageId(), fileName: 'price.ts' },
    getNearbyText: () => nearbyText,
    verify: () => {
      const latest = editor?.getSelection()
      return (
        !disposed &&
        editor?.getModel() === currentModel &&
        currentModel.getVersionId() === version &&
        !!latest &&
        selection.equalsRange(latest)
      )
    },
    getRect() {
      if (!editor || !container.isConnected || container.getClientRects().length === 0) return null
      const position = editor.getScrolledVisiblePosition(end)
      const layout = editor.getLayoutInfo()
      if (
        !position ||
        position.left < layout.contentLeft ||
        position.left > layout.contentLeft + layout.contentWidth ||
        position.top < 0 ||
        position.top + position.height > layout.height
      )
        return null
      const box = container.getBoundingClientRect()
      return new DOMRect(box.left + position.left, box.top + position.top, 0, position.height)
    },
  })
  status.value = '点击选区旁的“智能帮助”，即可发送代码解释问题'
}

onMounted(async () => {
  try {
    // 仅在浏览器挂载后加载核心与语法着色；不加载语言服务或外部 CDN。
    const monaco = await import('monaco-editor/editor/editor.api')
    await import('monaco-editor/languages/definitions/typescript/register')
    if (disposed || !editorHost.value) return
    model = monaco.editor.createModel(
      [
        'function calculatePrice(price: number, quantity: number) {',
        '  const discount = quantity >= 10 ? 0.9 : 1',
        '  return Math.round(price * quantity * discount * 100) / 100',
        '}',
        '',
        'const total = calculatePrice(19.9, 12)',
      ].join('\n'),
      'typescript',
    )
    editor = monaco.editor.create(editorHost.value, {
      model,
      automaticLayout: true,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      fontSize: 14,
      unicodeHighlight: { ambiguousCharacters: false, invisibleCharacters: false },
    })
    quickAssist = createQuickAssist({
      include: ['#qa-monaco-manual'],
      selection: { maxTextLength: 2000 },
      adapter: {
        submit: (request) => {
          lastRequest.value = request
          status.value = '已提交到下方示例助手'
        },
      },
    })
    const selectionListener = editor.onDidChangeCursorSelection(() => {
      const selection = editor?.getSelection()
      const currentModel = editor?.getModel()
      selectedText.value =
        selection && !selection.isEmpty() && currentModel ? currentModel.getValueInRange(selection) : ''
      if (!selectedText.value) lastIdentity = undefined
      // 选择变化立即关闭旧会话；最终选区由 pointerup/keyup 调度激活。
      cancelActivation()
      quickAssist?.close()
    })
    const closeForLayout = () => {
      cancelActivation()
      quickAssist?.close()
    }
    const contentListener = editor.onDidChangeModelContent(closeForLayout)
    const scrollListener = editor.onDidScrollChange(closeForLayout)
    const layoutListener = editor.onDidLayoutChange(closeForLayout)
    const keyListener = editor.onKeyUp((event) => {
      if (!event.browserEvent.isComposing) scheduleActivation()
    })
    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return
      selectingWithPointer = true
      cancelActivation()
    }
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerType === 'touch' || !selectingWithPointer) return
      selectingWithPointer = false
      scheduleActivation()
    }
    const onPointerCancel = () => {
      selectingWithPointer = false
      cancelActivation()
    }
    editorHost.value.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('pointerup', onPointerUp)
    document.addEventListener('pointercancel', onPointerCancel)
    cleanups.push(
      () => selectionListener.dispose(),
      () => contentListener.dispose(),
      () => scrollListener.dispose(),
      () => layoutListener.dispose(),
      () => keyListener.dispose(),
      () => editorHost.value?.removeEventListener('pointerdown', onPointerDown, true),
      () => document.removeEventListener('pointerup', onPointerUp),
      () => document.removeEventListener('pointercancel', onPointerCancel),
    )
    status.value = '编辑器已就绪'
  } catch {
    if (!disposed) status.value = '编辑器加载失败，请刷新重试'
  }
})

onBeforeUnmount(() => {
  disposed = true
  cancelActivation()
  for (const cleanup of cleanups) cleanup()
  quickAssist?.destroy()
  editor?.dispose()
  model?.dispose()
})
</script>

<style scoped>
.qa-monaco-demo {
  padding: 18px;
  border: 1px solid var(--vp-c-divider, #ddd);
  border-radius: 10px;
}
.qa-monaco-demo__editor {
  height: 220px;
  border: 1px solid var(--vp-c-divider, #ccc);
}
.qa-monaco-demo__hint,
.qa-monaco-demo__status {
  font-size: 13px;
  color: var(--vp-c-text-2, #555);
}
.qa-monaco-demo__result {
  margin-top: 16px;
  padding: 14px;
  background: var(--vp-c-bg-soft, #f5f7fa);
  border-radius: 8px;
}
.qa-monaco-demo__result pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
