const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/lifecycle.DNVNV6Fr.js","assets/chunks/style.CsrNxyLz.js","assets/chunks/framework.BnMBnixn.js","assets/chunks/monaco.WbtuP6vb.js","assets/chunks/activation.CTIQHTqW.js","assets/chunks/selection-scope.CBWMoQB8.js","assets/chunks/context.hG45-5ey.js","assets/chunks/suggestion-validation.Bbp_95pf.js","assets/chunks/remote-recommendations.BqLxRdYG.js","assets/chunks/recommendations.CbB7l5mA.js","assets/chunks/direction-placement.DdkT5dq_.js","assets/chunks/trigger-delay.D74aTNHL.js","assets/chunks/vue-chat.DEl2cDmz.js","assets/chunks/theme.BZ9yqhu8.js"])))=>i.map(i=>d[i]);
import{aD as c,bQ as k,aZ as D,aL as w,v as T,H as h,bL as o,bB as d,J as i,bk as n,bJ as e,G as u,w as E,I as y,b7 as g,aU as S}from"./chunks/framework.BnMBnixn.js";import{L as p,N as r}from"./chunks/index.Cyut7m58.js";const L=`<!doctype html>
<html lang="zh-CN" data-cf-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>QuickAssist 主题切换</title>
    <style>
      :root {
        color-scheme: light;
        --demo-bg: #ffffff;
        --demo-text: #242424;
        --demo-surface: #f5f5f5;
        --demo-border: #cccccc;
      }
      :root[data-cf-theme='dark'] {
        color-scheme: dark;
        --demo-bg: #1b1b1f;
        --demo-text: #e6e6e6;
        --demo-surface: #29292e;
        --demo-border: #55555b;
      }
      body {
        margin: 0;
        padding: 20px;
        min-height: 320px;
        box-sizing: border-box;
        background: var(--demo-bg);
        color: var(--demo-text);
        font:
          14px/1.8 system-ui,
          sans-serif;
      }
      label {
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }
      select {
        padding: 5px 10px;
        border: 1px solid var(--demo-border);
        border-radius: 6px;
        background: var(--demo-bg);
        color: inherit;
        font: inherit;
      }
      #theme-text {
        padding: 16px;
        border-radius: 8px;
        background: var(--demo-surface);
      }
      #theme-status {
        overflow-wrap: anywhere;
      }
    </style>
  </head>
  <body>
    <label>
      颜色模式
      <select id="theme-mode">
        <option value="light">亮色</option>
        <option value="dark">暗色</option>
        <option value="auto">跟随系统</option>
      </select>
    </label>
    <p id="theme-text">选中“<span id="theme-term">弹性计费</span>”，查看当前主题下的智能帮助。</p>
    <p id="theme-status" aria-live="polite">正在加载组件…</p>
    <script>
      ;(async () => {
        // 文档的 HTML 预览会复制宿主样式；移除副本，展示组件自带的配色。
        document.querySelectorAll('style[replace="true"], link[as="style"]').forEach((element) => element.remove())
        const root = document.documentElement
        const select = document.querySelector('#theme-mode')
        const status = document.querySelector('#theme-status')
        const system = window.matchMedia('(prefers-color-scheme: dark)')
        let previewGlobalUrl
        try {
          previewGlobalUrl = window.parent.__tinyRobotVanillaDemoGlobalUrl
        } catch {
          // 单独打开或跨源嵌入时使用本地构建产物。
        }
        const script = document.createElement('script')
        script.src =
          previewGlobalUrl ??
          new URL('../../../packages/components/dist/vanilla/vanilla.global.js', document.baseURI).href
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = () => reject(new Error('组件加载失败，请先构建 TinyRobot'))
          document.head.append(script)
        })

        const { configureVanillaTheme, createQuickAssist } = window.TinyRobotVanilla
        const syncPage = () => {
          const mode = select.value === 'auto' ? (system.matches ? 'dark' : 'light') : select.value
          root.setAttribute('data-cf-theme', mode)
          status.textContent = \`当前主题：\${mode === 'dark' ? '暗色' : '亮色'}\${select.value === 'auto' ? '（跟随系统）' : ''}，请选择示例文字。\`
        }
        const applyMode = () => {
          if (select.value === 'auto') {
            configureVanillaTheme({ colorMode: 'auto' })
          } else {
            // 实际业务只配置一次来源，之后由业务切换 html 上的属性。
            configureVanillaTheme({ source: { type: 'attribute', attribute: 'data-cf-theme' } })
          }
          syncPage()
        }
        applyMode()
        const quickAssist = createQuickAssist({
          include: ['#theme-text'],
          adapter: {
            submit(request) {
              status.textContent = \`已提交：\${request.prompt}\`
            },
          },
        })
        select.addEventListener('change', applyMode)
        const onSystemChange = () => {
          if (select.value === 'auto') syncPage()
        }
        system.addEventListener('change', onSystemChange)
        root.dataset.quickAssistReady = 'true'
        window.addEventListener(
          'pagehide',
          () => {
            quickAssist.destroy()
            system.removeEventListener('change', onSystemChange)
            select.removeEventListener('change', applyMode)
          },
          { once: true },
        )
      })().catch((error) => {
        document.querySelector('#theme-status').textContent = error.message
      })
    <\/script>
  </body>
</html>
`,I=`<template>
  <div class="qa-feature-demo">
    <div class="qa-feature-demo__controls">
      <button type="button" @click="enable">启用划词</button>
      <button type="button" @click="disable">停用划词</button>
      <button type="button" @click="close">模拟路由切换</button>
    </div>
    <p id="qa-lifecycle-text">选中这段文字，然后用上方按钮观察当前划词入口或输入浮层如何关闭。</p>
    <p class="qa-feature-demo__status" aria-live="polite">{{ status }}</p>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
import type { QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'

const status = ref('划词已启用')
let quickAssist: QuickAssistInstance | undefined

function enable() {
  quickAssist?.enable()
  status.value = '划词已启用，可以重新选中文字'
}

function disable() {
  quickAssist?.disable()
  status.value = '划词已停用，当前界面已关闭'
}

function close() {
  quickAssist?.close()
  status.value = '已模拟路由切换并关闭当前会话，划词功能仍保持原有启停状态'
}

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['#qa-lifecycle-text'],
    adapter: {
      submit(request) {
        status.value = \`已提交：\${request.prompt}\`
      },
    },
  })
})

onBeforeUnmount(() => quickAssist?.destroy())
<\/script>

<style scoped>
.qa-feature-demo {
  color: var(--vp-c-text-1, #213547);
  background: var(--vp-c-bg, #fff);
  padding: 18px;
  border: 1px solid var(--vp-c-divider, #dfe3e8);
  border-radius: 10px;
  line-height: 1.7;
}
.qa-feature-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
button {
  padding: 7px 12px;
  border: 1px solid var(--vp-c-border, #cbd3dd);
  border-radius: 6px;
  background: var(--vp-c-bg, #fff);
  color: inherit;
  font: inherit;
  cursor: pointer;
}
#qa-lifecycle-text {
  padding: 14px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft, #f5f7fa);
}
.qa-feature-demo__status {
  color: var(--vp-c-text-2, #536171);
  font-size: 13px;
}

button:hover {
  border-color: var(--vp-c-brand-1, #2175c4);
}
button:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #2175c4);
  outline-offset: 2px;
}
</style>
`,R=`<template>
  <section id="qa-monaco-manual" class="qa-monaco-demo">
    <p>在编辑器中拖选代码，松开鼠标后即可看到“智能帮助”；也支持 Shift + 方向键选择。</p>
    <p class="qa-monaco-demo__status" role="status">{{ status }}</p>
    <div ref="editorHost" class="qa-monaco-demo__editor" aria-label="可选取代码的 Monaco 编辑器"></div>
    <p class="qa-monaco-demo__hint">{{ selectedText ? \`已选中 \${selectedText.length} 个字符\` : '尚未选择代码' }}</p>
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
  const identity = \`\${currentModel.uri}:\${version}:\${selection.selectionStartLineNumber}:\${selection.selectionStartColumn}:\${selection.positionLineNumber}:\${selection.positionColumn}\`
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
        getPrompt: (context) => \`请解释以下 \${context.meta?.language ?? ''} 代码的作用：\\n\${context.text}\`,
      },
      {
        id: 'review-code',
        getLabel: () => '检查潜在问题',
        getPrompt: (context) => \`请检查以下代码是否存在潜在问题：\\n\${context.text}\`,
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
      ].join('\\n'),
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
<\/script>

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
`,W=`<template>
  <section id="qa-manual-activation" class="qa-activation-demo">
    <label class="qa-activation-demo__setting">
      <input v-model="directOpen" type="checkbox" @change="closeCurrent" />
      直接显示输入框（跳过“智能帮助”按钮）
    </label>
    <div class="qa-activation-demo__example">
      <h4>按钮作为锚点</h4>
      <p>点击按钮解释指定术语，使用实例的默认推荐；上方开关控制是否直接显示输入框。</p>
      <button type="button" @click="activateButton">解释“按需计费”</button>
    </div>
    <div class="qa-activation-demo__example">
      <h4>悬停指标，自定义内容与推荐</h4>
      <p>悬停或聚焦指标，按指标数值定位并提供专属推荐。浮层打开后可移入其中操作，也支持点击。</p>
      <div class="qa-activation-demo__metrics">
        <button
          v-for="metric in metrics"
          :key="metric.id"
          type="button"
          class="qa-activation-demo__metric"
          :aria-pressed="selectedMetric === metric.id"
          @pointerenter="activateMetric($event, metric)"
          @focus="activateMetric($event, metric)"
          @click="activateMetric($event, metric)"
        >
          <span>{{ metric.label }}</span>
          <strong data-metric-value>{{ metric.value }}</strong>
        </button>
      </div>
    </div>
    <aside v-if="lastRequest" class="qa-activation-demo__result" aria-live="polite">
      <strong>示例助手已收到请求</strong>
      <p>{{ lastRequest.prompt }}</p>
      <dl>
        <dt>内容</dt>
        <dd>{{ lastRequest.context.text }}</dd>
        <dt>来源</dt>
        <dd>{{ lastRequest.source }}</dd>
        <dt>业务字段</dt>
        <dd>{{ JSON.stringify(lastRequest.context.meta) }}</dd>
      </dl>
      <small>本示例只展示实际收到的请求，不调用模型。</small>
    </aside>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import type {
  AIRequest,
  QuickAssistInstance,
  QuickAssistActivationInput,
  QuickAssistAnchorShortcut,
} from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'

const metrics = [
  { id: 'availability', label: '服务可用性', value: '99.95%' },
  { id: 'latency', label: '平均响应时间', value: '128 ms' },
]
const selectedMetric = ref('')
const directOpen = ref(true)
const lastRequest = shallowRef<AIRequest>()
let quickAssist: QuickAssistInstance | undefined
let switchingActivation = false

function activate(input: QuickAssistActivationInput | QuickAssistAnchorShortcut) {
  switchingActivation = true
  try {
    quickAssist?.activate(input)
  } finally {
    switchingActivation = false
  }
}

function closeCurrent() {
  quickAssist?.close()
  selectedMetric.value = ''
}

function activateButton(event: MouseEvent) {
  selectedMetric.value = ''
  lastRequest.value = undefined
  activate({
    text: '按需计费',
    anchor: event.currentTarget as HTMLButtonElement,
    open: directOpen.value ? 'popover' : 'trigger',
    meta: { product: '云服务器', feature: 'billing' },
  })
}

function activateMetric(event: Event, metric: (typeof metrics)[number]) {
  if (event.type === 'pointerenter' && (event as PointerEvent).pointerType === 'touch') return
  // Esc 恢复卡片焦点时不自动重开；重新悬停或显式点击仍可打开。
  if (event.type === 'focus' && (switchingActivation || selectedMetric.value === metric.id)) return
  const button = event.currentTarget as HTMLButtonElement
  const value = button.querySelector<HTMLElement>('[data-metric-value]')!
  selectedMetric.value = metric.id
  lastRequest.value = undefined
  activate({
    source: 'dashboard',
    open: directOpen.value ? 'popover' : 'trigger',
    text: \`\${metric.label}：\${metric.value}\`,
    suggestions: [
      {
        id: 'metric-explain',
        getLabel: () => '解读这个指标',
        getPrompt: (context) => \`请解读运行指标：\${context.text}\`,
      },
      {
        id: 'metric-investigate',
        getLabel: () => '异常时如何排查',
        getPrompt: (context) => \`如果\${context.text}出现异常，应如何排查？\`,
      },
    ],
    anchorElement: value,
    getRect: () => (value.isConnected && value.getClientRects().length ? value.getBoundingClientRect() : null),
    verify: () => selectedMetric.value === metric.id,
    meta: { metric: metric.id, value: metric.value },
    getNearbyText: () => '应用服务最近 24 小时的运行指标',
    onInvalidate(notify) {
      const observer = new ResizeObserver(notify)
      observer.observe(button)
      return () => observer.disconnect()
    },
  })
}

onMounted(() => {
  quickAssist = createQuickAssist({
    // 此 Demo 只演示 API 激活；旧 validate 只影响原生 DOM 划词。
    include: ['#qa-manual-activation'],
    selection: { validate: () => false },
    suggestions: [
      { id: 'term-explain', getLabel: () => '解释术语', getPrompt: (context) => \`请解释：\${context.text}\` },
      { id: 'term-scenario', getLabel: () => '适用场景', getPrompt: (context) => \`请说明\${context.text}的适用场景\` },
    ],
    adapter: {
      submit: (request) => {
        lastRequest.value = request
      },
    },
  })
})
onBeforeUnmount(() => quickAssist?.destroy())
<\/script>

<style scoped>
.qa-activation-demo {
  padding: 18px;
  border: 1px solid var(--vp-c-divider, #ddd);
  border-radius: 10px;
  color: var(--vp-c-text-1, #213547);
}
.qa-activation-demo__example + .qa-activation-demo__example {
  margin-top: 22px;
}
.qa-activation-demo__setting {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  font-size: 14px;
}
h4 {
  margin: 0 0 8px;
}
p {
  margin: 8px 0 12px;
}
button {
  padding: 8px 14px;
  border: 1px solid var(--vp-c-divider, #ccc);
  border-radius: 8px;
  color: inherit;
  background: var(--vp-c-bg, #fff);
  font: inherit;
  cursor: pointer;
}
button:hover,
button[aria-pressed='true'] {
  border-color: var(--vp-c-brand-1, #3451b2);
  background: var(--vp-c-bg-soft, #f5f7fa);
}
button:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #3451b2);
  outline-offset: 2px;
}
.qa-activation-demo__metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.qa-activation-demo__metric {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  min-width: 160px;
}
.qa-activation-demo__metric strong {
  font-size: 22px;
}
.qa-activation-demo__result {
  margin-top: 18px;
  padding: 14px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft, #f5f7fa);
  overflow-wrap: anywhere;
}
dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 6px 12px;
  margin: 12px 0;
  font-size: 13px;
}
dd {
  margin: 0;
}
dt,
small {
  color: var(--vp-c-text-2, #555);
}
</style>
`,M=`<template>
  <div class="qa-feature-demo">
    <div id="qa-scope-allowed" class="qa-feature-demo__allowed">
      <p>可选择区域：ECS、VPC 和 QoS 都是有效的短技术词。</p>
      <p>这段文字明显超过本示例设置的二十四字上限，整句选中时不会出现智能帮助入口。</p>
      <p data-qa-ignore>排除区域：即使文字很短，也不会出现智能帮助入口。</p>
    </div>
    <p class="qa-feature-demo__outside">范围外：这里的文字没有包含在生效区域内。</p>
    <p class="qa-feature-demo__hint">分别选择短词、整句和排除区域，对比入口是否出现。</p>
    <pre v-if="submitted">已提交：{{ submitted }}</pre>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
import type { QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'

const submitted = ref('')
let quickAssist: QuickAssistInstance | undefined

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['#qa-scope-allowed'],
    exclude: ['[data-qa-ignore]'],
    selection: { maxTextLength: 24 },
    adapter: {
      submit(request) {
        submitted.value = request.prompt
      },
    },
  })
})

onBeforeUnmount(() => quickAssist?.destroy())
<\/script>

<style scoped>
.qa-feature-demo {
  color: var(--vp-c-text-1, #213547);
  background: var(--vp-c-bg, #fff);
  padding: 18px;
  border: 1px solid var(--vp-c-divider, #dfe3e8);
  border-radius: 10px;
  line-height: 1.7;
}
.qa-feature-demo__allowed {
  padding: 8px 14px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft, #f5f7fa);
}
[data-qa-ignore] {
  padding: 8px;
  border-radius: 6px;
  background: var(--vp-c-warning-soft, #fff4e5);
  color: var(--vp-c-warning-1, #744c12);
}
.qa-feature-demo__outside {
  padding: 8px 14px;
  border: 1px dashed var(--vp-c-border, #cbd3dd);
  border-radius: 8px;
}
.qa-feature-demo__hint {
  color: var(--vp-c-text-2, #536171);
  font-size: 13px;
}
pre {
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
</style>
`,Q=`<template>
  <div class="qa-feature-demo">
    <div id="qa-context-text" class="qa-feature-demo__text">
      <p>安全组控制云服务器的入站和出站流量。生产环境应遵循最小权限原则。</p>
      <p>虚构租户编号：<span id="qa-context-tenant">tenant-demo-4812</span>（可划词，提交前脱敏）。</p>
      <p data-sensitive="true">敏感区域：accessToken=demo-secret（无法触发划词，也不采集附近文本）。</p>
    </div>
    <p class="qa-feature-demo__hint">选中虚构租户编号并提交，查看选区、附近文本和业务上下文中的编号如何被替换。</p>
    <pre v-if="submitted">{{ submitted }}</pre>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
import type { QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'

const submitted = ref('')
let quickAssist: QuickAssistInstance | undefined

const redactTenant = (text: string) => text.replaceAll('tenant-demo-4812', '[已脱敏]')

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['#qa-context-text'],
    getContext: () => ({ product: '云服务器', tenantId: 'tenant-demo-4812' }),
    sanitizeContext: (context) => ({
      ...context,
      text: redactTenant(context.text),
      selection: context.selection ? { ...context.selection, text: redactTenant(context.selection.text) } : undefined,
      nearbyText: context.nearbyText ? redactTenant(context.nearbyText) : undefined,
      businessContext: { ...context.businessContext, tenantId: '[已脱敏]' },
    }),
    // 输入框保留用户选中的原文；发送前也要对最终问题做脱敏。
    buildPrompt: ({ query, suggestion }) => redactTenant(suggestion?.prompt ?? query),
    adapter: {
      submit(request) {
        submitted.value = JSON.stringify({ 提交内容: request.prompt, 上下文: request.context }, null, 2)
      },
    },
  })
})

onBeforeUnmount(() => quickAssist?.destroy())
<\/script>

<style scoped>
.qa-feature-demo {
  color: var(--vp-c-text-1, #213547);
  background: var(--vp-c-bg, #fff);
  padding: 18px;
  border: 1px solid var(--vp-c-divider, #dfe3e8);
  border-radius: 10px;
  line-height: 1.7;
}
.qa-feature-demo__text {
  padding: 8px 14px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft, #f5f7fa);
}
[data-sensitive] {
  padding: 8px;
  border-radius: 6px;
  background: var(--vp-c-warning-soft, #fff4e5);
  color: var(--vp-c-warning-1, #744c12);
}
.qa-feature-demo__hint {
  color: var(--vp-c-text-2, #536171);
  font-size: 13px;
}
pre {
  max-height: 260px;
  overflow: auto;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
</style>
`,P=`<template>
  <div class="qa-validation-demo">
    <div class="qa-validation-demo__controls">
      <label>
        远程数据
        <select v-model="response" @change="configure">
          <option value="mixed">有效与异常问题混合</option>
          <option value="invalid">全部异常问题</option>
        </select>
      </label>
      <label><input v-model="enabled" type="checkbox" @change="configure" />启用业务校验</label>
    </div>
    <p class="qa-validation-demo__text">
      请选择 <strong id="qa-validation-text">竞价计费</strong> 并打开智能帮助，观察校验前后的问题变化。
    </p>
    <p>业务规则：标题 ≤ 40 字、问题 ≤ 1000 字，且问题包含选中文字。空白字段始终由基础校验过滤。</p>
    <p aria-live="polite">{{ status }}</p>
    <div v-if="finished" class="qa-validation-demo__comparison">
      <section>
        <h4>远程原始问题（{{ incoming.length }} 条）</h4>
        <ul>
          <li v-for="item in incoming" :key="item.id">
            <span class="qa-validation-demo__label" :title="item.label">{{ item.label }}</span>
            <span :class="kept(item.id) ? 'qa-validation-demo__kept' : 'qa-validation-demo__rejected'">
              {{ kept(item.id) ? '保留' : rejectionReasons[item.id] || '基础校验过滤：问题为空白' }}
            </span>
          </li>
        </ul>
      </section>
      <section>
        <h4>最终展示问题（{{ displayed.length }} 条）</h4>
        <ul>
          <li v-for="item in displayed" :key="item.id">
            <span>{{ item.label }}</span>
            <small>{{ item.prompt }}</small>
          </li>
        </ul>
        <p v-if="failed">远程问题全部无效，保留静态问题。</p>
      </section>
    </div>
    <pre v-if="submitted">{{ submitted }}</pre>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import type { QuickAssistInstance, Suggestion, ValidateSuggestion } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'

const response = ref<'mixed' | 'invalid'>('mixed')
const enabled = ref(true)
const incoming = ref<Suggestion[]>([])
const accepted = ref<Suggestion[]>([])
const displayed = ref<Suggestion[]>([])
const rejectionReasons = ref<Record<string, string>>({})
const finished = ref(false)
const failed = ref(false)
const status = ref('请选择“竞价计费”并打开智能帮助。')
const submitted = ref('')
let quickAssist: QuickAssistInstance | undefined

const staticSuggestions: Suggestion[] = [
  { id: 'static', label: '静态：了解竞价计费', prompt: '请介绍竞价计费的基本规则' },
]

const validateSuggestion: ValidateSuggestion = (suggestion, context) => {
  let reason = ''
  if (suggestion.label.length > 40) reason = '业务校验过滤：标题超过 40 字'
  else if (suggestion.prompt.length > 1000) reason = '业务校验过滤：问题超过 1000 字'
  else if (!suggestion.prompt.includes(context.text)) reason = '业务校验过滤：与选中文字无关'
  if (reason) rejectionReasons.value[suggestion.id] = reason
  return !reason
}

const kept = (id: string) => accepted.value.some((item) => item.id === id)

function configure() {
  quickAssist?.destroy()
  incoming.value = []
  accepted.value = []
  displayed.value = []
  rejectionReasons.value = {}
  finished.value = false
  failed.value = false
  submitted.value = ''
  status.value = '配置已更新，请选择“竞价计费”并打开智能帮助。'
  const result = response.value
  quickAssist = createQuickAssist({
    include: ['#qa-validation-text'],
    suggestions: staticSuggestions,
    getSuggestions: async (context, signal) => {
      status.value = '正在模拟远程请求…'
      await new Promise((resolve) => setTimeout(resolve, 600))
      signal.throwIfAborted()
      const invalid: Suggestion[] = [
        { id: 'blank', label: '空白问题', prompt: ' ' },
        { id: 'long', label: '请详细解释竞价计费规则及相关注意事项'.repeat(4), prompt: \`解释“\${context.text}”\` },
        { id: 'unrelated', label: '今天晚餐吃什么？', prompt: '请推荐今天的晚餐' },
      ]
      incoming.value =
        result === 'invalid'
          ? invalid
          : [
              { id: 'valid', label: '竞价计费有哪些中断风险？', prompt: \`请说明“\${context.text}”的中断风险\` },
              ...invalid,
            ]
      return incoming.value
    },
    validateSuggestion: enabled.value ? validateSuggestion : undefined,
    // 只展示通过校验的远程问题，避免静态问题占位影响对比。
    mergeSuggestions: (_base, valid) => {
      accepted.value = valid
      displayed.value = valid
      finished.value = true
      status.value = \`远程返回 \${incoming.value.length} 条，保留 \${valid.length} 条，过滤 \${incoming.value.length - valid.length} 条。\`
      return valid
    },
    maxSuggestions: 6,
    onEvent(event) {
      if (event.type === 'error' && event.stage === 'suggestions') {
        accepted.value = []
        displayed.value = staticSuggestions
        failed.value = true
        finished.value = true
        status.value = \`远程返回 \${incoming.value.length} 条，全部被过滤，已回退到静态问题。\`
      }
    },
    adapter: {
      submit(request) {
        submitted.value = JSON.stringify(
          { 推荐项: request.suggestion?.label ?? '手动输入', 提交内容: request.prompt },
          null,
          2,
        )
      },
    },
  })
}

onMounted(configure)
onBeforeUnmount(() => quickAssist?.destroy())
<\/script>

<style scoped>
.qa-validation-demo {
  color: var(--vp-c-text-1, #213547);
  background: var(--vp-c-bg, #fff);
  padding: 18px;
  border: 1px solid var(--vp-c-divider, #dfe3e8);
  border-radius: 10px;
  line-height: 1.7;
}
.qa-validation-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
}
.qa-validation-demo__controls label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
select {
  appearance: auto;
  min-height: 32px;
  padding: 4px 8px;
  border: 1px solid var(--vp-c-border, #cbd3dd);
  border-radius: 6px;
  background: var(--vp-c-bg, #fff);
  color: var(--vp-c-text-1, #213547);
  font: inherit;
}
select:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #2175c4);
  outline-offset: 2px;
}
.qa-validation-demo__text {
  padding: 12px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft, #f5f7fa);
}
.qa-validation-demo__comparison {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
section {
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--vp-c-divider, #dfe3e8);
  border-radius: 8px;
}
h4 {
  margin: 0 0 12px;
}
ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
li + li {
  margin-top: 12px;
}
li span,
small {
  display: block;
  overflow-wrap: anywhere;
}
.qa-validation-demo__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.qa-validation-demo__kept {
  color: var(--vp-c-green-1, #187347);
  font-size: 13px;
}
.qa-validation-demo__rejected {
  color: var(--vp-c-text-2, #536171);
  font-size: 13px;
}
pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
@media (max-width: 640px) {
  .qa-validation-demo__comparison {
    grid-template-columns: 1fr;
  }
}
</style>
`,Z=`<template>
  <div class="qa-remote-demo">
    <div class="qa-remote-demo__controls">
      <label>
        推荐策略
        <select v-model="strategy" @change="configure">
          <option value="remote-only">仅远程推荐</option>
          <option value="replace">远程整体替换</option>
          <option value="fallback">空结果回退</option>
          <option value="remote-first">远程优先，保留其他静态问题</option>
        </select>
      </label>
      <label>
        模拟响应
        <select v-model="response" @change="configure">
          <option value="success">成功返回问题</option>
          <option value="empty">返回空数组</option>
          <option value="error">请求失败</option>
        </select>
      </label>
    </div>
    <div id="qa-remote-recommendations-text" class="qa-remote-demo__text">
      <p>竞价计费适合可中断的计算任务，实例价格随供需变化。</p>
      <p>请选择上面的计费说明并点击智能帮助，观察一秒后推荐问题如何变化。</p>
    </div>
    <p class="qa-remote-demo__hint" aria-live="polite">{{ status }}</p>
    <pre v-if="submitted">{{ submitted }}</pre>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import type { MergeSuggestions, QuickAssistInstance, QuickAssistSuggestionInput } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'

type Strategy = 'remote-only' | 'replace' | 'fallback' | 'remote-first'
const strategy = ref<Strategy>('replace')
const response = ref<'success' | 'empty' | 'error'>('success')
const status = ref('请选择文字并打开智能帮助。')
const submitted = ref('')
let quickAssist: QuickAssistInstance | undefined

const staticSuggestions: QuickAssistSuggestionInput[] = [
  {
    id: 'explain',
    getLabel: ({ text }) => \`静态：解释“\${text}”\`,
    getPrompt: ({ text }) => \`请解释“\${text}”的计费规则\`,
  },
  { id: 'compare', label: '静态：比较计费方式', prompt: '请比较竞价计费与按需计费' },
]

const mergeStrategies: Record<Exclude<Strategy, 'remote-only'>, MergeSuggestions> = {
  replace: (_base, incoming) => incoming,
  fallback: (base, incoming) => (incoming.length ? incoming : base),
  'remote-first': (base, incoming) => [...incoming, ...base],
}

function configure() {
  // 重新创建实例，确保“仅远程推荐”模式完全省略 suggestions。
  quickAssist?.destroy()
  submitted.value = ''
  status.value = '配置已更新，请重新选择文字并打开智能帮助。'
  const mode = strategy.value
  const result = response.value
  quickAssist = createQuickAssist({
    include: ['#qa-remote-recommendations-text'],
    ...(mode === 'remote-only' ? {} : { suggestions: staticSuggestions, mergeSuggestions: mergeStrategies[mode] }),
    getSuggestions: async (context, signal) => {
      status.value = '正在模拟远程请求，约一秒后返回。'
      // 接入业务服务时，在这里用 fetch(url, { signal, ... }) 获取 Suggestion[]。
      await new Promise((resolve) => setTimeout(resolve, 1000))
      signal.throwIfAborted()
      if (result === 'error') throw new Error('模拟推荐请求失败')
      status.value =
        result === 'empty' ? '远程返回空数组，已应用当前合并策略。' : '远程问题已返回，已应用当前合并策略。'
      if (result === 'empty') return []
      return [
        { id: 'explain', label: '远程：解释计费规则', prompt: \`请结合当前页面解释“\${context.text}”的计费规则\` },
        { id: 'risk', label: '远程：查看中断风险', prompt: \`请说明“\${context.text}”的中断风险与应对措施\` },
      ]
    },
    maxSuggestions: 3,
    onEvent(event) {
      if (event.type === 'error' && event.stage === 'suggestions') {
        status.value = '远程请求失败，已有静态问题会保留，仍可手动输入提交。'
      }
      if (event.type === 'close') status.value = '会话已关闭，可重新选择文字。'
    },
    adapter: {
      submit(request) {
        submitted.value = JSON.stringify(
          { 推荐项: request.suggestion?.label ?? '手动输入', 提交内容: request.prompt },
          null,
          2,
        )
      },
    },
  })
}

onMounted(configure)
onBeforeUnmount(() => quickAssist?.destroy())
<\/script>

<style scoped>
.qa-remote-demo {
  color: var(--vp-c-text-1, #213547);
  background: var(--vp-c-bg, #fff);
  padding: 18px;
  border: 1px solid var(--vp-c-divider, #dfe3e8);
  border-radius: 10px;
  line-height: 1.7;
}
.qa-remote-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  margin-bottom: 16px;
}
.qa-remote-demo__controls label {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.qa-remote-demo__controls select {
  appearance: auto;
  max-width: 100%;
  min-height: 32px;
  padding: 4px 8px;
  border: 1px solid var(--vp-c-border, #cbd3dd);
  border-radius: 6px;
  background: var(--vp-c-bg, #fff);
  color: var(--vp-c-text-1, #213547);
  font: inherit;
}
.qa-remote-demo__controls select:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #2175c4);
  outline-offset: 2px;
}
.qa-remote-demo__text {
  padding: 8px 14px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft, #f5f7fa);
}
.qa-remote-demo__hint {
  color: var(--vp-c-text-2, #536171);
  font-size: 13px;
}
pre {
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
</style>
`,V=`<template>
  <div class="qa-feature-demo">
    <div id="qa-recommendations-text" class="qa-feature-demo__text">
      <p>包年包月适合长期稳定的工作负载，按需计费适合短期或波动较大的任务。</p>
      <p>选中一种计费方式，打开智能帮助，观察推荐问题从静态内容扩展为异步内容。</p>
    </div>
    <p class="qa-feature-demo__hint">点击推荐问题后会直接提交，无需再次按发送。</p>
    <pre v-if="submitted">{{ submitted }}</pre>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
import type { QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'

const submitted = ref('')
let quickAssist: QuickAssistInstance | undefined

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['#qa-recommendations-text'],
    suggestions: [
      { id: 'explain', label: '解释这个概念', prompt: '请解释选中的计费方式' },
      { id: 'compare', label: '比较计费方式', prompt: '请比较选中的计费方式与其他方式' },
    ],
    getSuggestions: async (context, signal) => {
      await new Promise((resolve) => setTimeout(resolve, 700))
      if (signal.aborted) return []
      return [{ id: 'risk', label: '查看注意事项', prompt: \`请说明“\${context.text}”的注意事项\` }]
    },
    adapter: {
      submit(request) {
        submitted.value = JSON.stringify(
          { 推荐项: request.suggestion?.label ?? '手动输入', 提交内容: request.prompt },
          null,
          2,
        )
      },
    },
  })
})

onBeforeUnmount(() => quickAssist?.destroy())
<\/script>

<style scoped>
.qa-feature-demo {
  color: var(--vp-c-text-1, #213547);
  background: var(--vp-c-bg, #fff);
  padding: 18px;
  border: 1px solid var(--vp-c-divider, #dfe3e8);
  border-radius: 10px;
  line-height: 1.7;
}
.qa-feature-demo__text {
  padding: 8px 14px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft, #f5f7fa);
}
.qa-feature-demo__hint {
  color: var(--vp-c-text-2, #536171);
  font-size: 13px;
}
pre {
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
</style>
`,N=`<template>
  <div class="qa-position-demo">
    <div class="qa-position-demo__controls">
      <label><input v-model="forwardOnly" type="checkbox" @change="update" />仅正向划词触发</label>
      <label>
        入口位置
        <select v-model="placement" @change="update">
          <option value="bottom-end">右下（默认）</option>
          <option value="bottom-start">左下</option>
          <option value="bottom">下方居中</option>
          <option value="top-end">右上</option>
          <option value="top-start">左上</option>
          <option value="top">上方居中</option>
          <option value="auto">自动</option>
        </select>
      </label>
    </div>
    <p id="qa-position-text">
      选中这段云服务器配置说明，<b>包括加粗文字</b>，观察入口位置。<br />
      最后一行较短。
    </p>
    <p aria-live="polite">{{ status }}</p>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import type { QuickAssistInstance, QuickAssistPlacement } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'

const forwardOnly = ref(true)
const placement = ref<QuickAssistPlacement>('bottom-end')
const status = ref('试着正向、反向及跨行选择上面的文字。')
let quickAssist: QuickAssistInstance | undefined

function update() {
  quickAssist?.updateOptions({
    selection: { forwardOnly: forwardOnly.value },
    trigger: { placement: placement.value },
  })
  status.value = '配置已更新，请重新选择文字。'
}

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['#qa-position-text'],
    selection: { forwardOnly: forwardOnly.value },
    trigger: { placement: placement.value },
    adapter: {
      submit(request) {
        status.value = \`已提交：\${request.prompt}\`
      },
    },
  })
})

onBeforeUnmount(() => quickAssist?.destroy())
<\/script>

<style scoped>
.qa-position-demo {
  color: var(--vp-c-text-1, #213547);
  background: var(--vp-c-bg, #fff);
  padding: 18px;
  border: 1px solid var(--vp-c-divider, #dfe3e8);
  border-radius: 10px;
  line-height: 1.8;
}
.qa-position-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}
.qa-position-demo__controls label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.qa-position-demo__controls select {
  appearance: auto;
  min-height: 32px;
  padding: 4px 10px;
  border: 1px solid var(--vp-c-border, #cbd3dd);
  border-radius: 6px;
  background: var(--vp-c-bg, #fff);
  color: var(--vp-c-text-1, #213547);
  font: inherit;
  cursor: pointer;
}
.qa-position-demo__controls select:hover {
  border-color: var(--vp-c-brand-1, #2175c4);
}
.qa-position-demo__controls select:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #2175c4);
  outline-offset: 2px;
}
#qa-position-text {
  padding: 14px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft, #f5f7fa);
}
</style>
`,X=`<template>
  <div class="qa-delay-demo">
    <div class="qa-delay-demo__controls">
      <button type="button" :aria-pressed="delay === 0" @click="setDelay(0)">立即显示</button>
      <button type="button" :aria-pressed="delay === 300" @click="setDelay(300)">延迟 300 毫秒</button>
    </div>
    <p id="qa-delay-text">选中这段云服务器配置说明，比较立即显示与延迟显示的划词入口。</p>
    <p class="qa-delay-demo__status" aria-live="polite">{{ status }}</p>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
import type { QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'

const delay = ref(300)
const status = ref('当前延迟 300 毫秒；选中文字后观察入口。')
let quickAssist: QuickAssistInstance | undefined

function setDelay(value: number) {
  delay.value = value
  quickAssist?.updateOptions({ trigger: { showDelay: value } })
  status.value = value ? \`当前延迟 \${value} 毫秒；选中文字后观察入口。\` : '当前立即显示；选中文字后观察入口。'
}

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['#qa-delay-text'],
    trigger: { showDelay: delay.value },
    adapter: {
      submit(request) {
        status.value = \`已提交：\${request.prompt}\`
      },
    },
    onEvent(event) {
      if (event.type === 'selection') status.value = '选区已确认，等待显示入口…'
      if (event.type === 'trigger_show') status.value = '划词入口已显示'
    },
  })
})

onBeforeUnmount(() => quickAssist?.destroy())
<\/script>

<style scoped>
.qa-delay-demo {
  color: var(--vp-c-text-1, #213547);
  background: var(--vp-c-bg, #fff);
  padding: 18px;
  border: 1px solid var(--vp-c-divider, #dfe3e8);
  border-radius: 10px;
  line-height: 1.7;
}
.qa-delay-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
button {
  padding: 7px 12px;
  border: 1px solid var(--vp-c-border, #cbd3dd);
  border-radius: 6px;
  background: var(--vp-c-bg, #fff);
  color: inherit;
  font: inherit;
  cursor: pointer;
}
button[aria-pressed='true'] {
  border-color: var(--vp-c-brand-1, #2175c4);
  background: var(--vp-c-brand-soft, #e8f2ff);
}
#qa-delay-text {
  padding: 14px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft, #f5f7fa);
}
.qa-delay-demo__status {
  color: var(--vp-c-text-2, #536171);
  font-size: 13px;
}

button:hover {
  border-color: var(--vp-c-brand-1, #2175c4);
}
button:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #2175c4);
  outline-offset: 2px;
}
</style>
`,j=`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>QuickAssist HTML 接入示例</title>
    <style>
      :root {
        color-scheme: light;
        --qa-page-bg: #f5f7fa;
        --qa-surface: #fff;
        --qa-text: #222b36;
        --qa-muted: #536171;
        --qa-border: #cbd3dd;
        --qa-warning-bg: #fff4e5;
        --qa-warning-text: #744c12;
        --qa-accent: #1476ff;
        --tr-container-bg-default: var(--qa-surface);
        --tr-container-bg-default-2: var(--qa-page-bg);
        --tr-text-primary: var(--qa-text);
        --tr-text-secondary: var(--qa-muted);
        --tr-border-color-default: var(--qa-border);
        --tr-color-primary: var(--qa-accent);
      }
      :root[data-theme='dark'] {
        color-scheme: dark;
        --qa-page-bg: #1b1b1f;
        --qa-surface: #202127;
        --qa-text: #dfdfe4;
        --qa-muted: #a2a2a8;
        --qa-border: #3c3f44;
        --qa-warning-bg: rgb(234 179 8 / 16%);
        --qa-warning-text: #f0ca7f;
        --qa-accent: #a8b1ff;
      }
      body {
        margin: 0;
        padding: 32px;
        color: var(--qa-text);
        font:
          15px/1.7 system-ui,
          sans-serif;
        background: var(--qa-page-bg);
      }
      main {
        max-width: 900px;
        margin: 0 auto;
      }
      article,
      aside {
        padding: 20px;
        border: 1px solid var(--qa-border);
        border-radius: 12px;
        background: var(--qa-surface);
      }
      article {
        margin: 20px 0;
      }
      article p {
        max-width: 72ch;
      }
      [data-sensitive],
      [data-ai-selection='false'] {
        padding: 8px 10px;
        border-radius: 6px;
        color: var(--qa-warning-text);
        background: var(--qa-warning-bg);
      }
      aside {
        position: sticky;
        bottom: 16px;
        box-shadow: 0 8px 28px #20304018;
      }
      aside[hidden] {
        display: none;
      }
      pre {
        max-height: 280px;
        overflow: auto;
        white-space: pre-wrap;
        overflow-wrap: anywhere;
      }
      button {
        padding: 7px 12px;
        border: 1px solid var(--qa-border);
        border-radius: 6px;
        background: var(--qa-surface);
        color: var(--qa-text);
        font: inherit;
        cursor: pointer;
      }
      button:hover {
        border-color: var(--qa-accent);
      }
      button:focus-visible {
        outline: 2px solid var(--qa-accent);
        outline-offset: 2px;
      }
      .status {
        min-height: 1.4em;
        color: var(--qa-muted);
        font-size: 13px;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>QuickAssist HTML 接入示例</h1>
      <p>选中下面正文中的一个概念，点击“智能帮助”，查看组件如何把请求交给模拟对话面板。</p>

      <article id="guide-content" aria-label="可选择的产品帮助内容">
        <h2>云服务器配置</h2>
        <p>
          包年包月适合长期、稳定运行的工作负载。按需计费适合临时任务和用量变化较大的业务，用户可以根据预期使用时长调整预算。
        </p>
        <p>
          竞价计费使用闲置计算资源来降低成本，但实例可能因供需变化被回收。生产系统应评估业务中断容忍度，并为重要数据配置独立的持久化存储。
        </p>
        <p>安全组用于管理云服务器的入站和出站访问规则。建议遵循最小权限原则，只开放业务实际需要的端口。</p>
        <p data-sensitive="true">敏感示例：access token = demo-secret-abc123（不可选择，也不会放入附近上下文）。</p>
        <p data-ai-selection="false">此内容通过 data-ai-selection 标记排除。</p>
      </article>

      <aside id="assistant-panel" aria-label="模拟 AI 对话面板" hidden>
        <h2>模拟 AI 对话面板</h2>
        <p>适配器收到请求后立即打开此面板。此示例不会连接模型。</p>
        <pre id="request-output"></pre>
        <div><button id="close-assistant" type="button">关闭面板</button></div>
      </aside>
      <p class="status" id="event-status" aria-live="polite"></p>
    </main>

    <script>
      ;(async () => {
        const root = document.documentElement
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        let parentRoot
        let previewGlobalUrl
        try {
          if (window.parent !== window) {
            parentRoot = window.parent.document.documentElement
            previewGlobalUrl = window.parent.__tinyRobotVanillaDemoGlobalUrl
          }
        } catch {
          // 跨源嵌入时不能读取父页面，使用当前系统主题。
        }
        const syncTheme = () => {
          const dark = parentRoot ? parentRoot.classList.contains('dark') : systemTheme.matches
          root.dataset.theme = dark ? 'dark' : 'light'
        }
        syncTheme()
        const themeObserver = parentRoot ? new MutationObserver(syncTheme) : undefined
        if (parentRoot) themeObserver.observe(parentRoot, { attributes: true, attributeFilter: ['class'] })
        if (!parentRoot) systemTheme.addEventListener('change', syncTheme)
        window.addEventListener(
          'pagehide',
          () => {
            themeObserver?.disconnect()
            systemTheme.removeEventListener('change', syncTheme)
          },
          { once: true },
        )
        const output = document.querySelector('#request-output')
        const panel = document.querySelector('#assistant-panel')
        const status = document.querySelector('#event-status')

        // 文档预览在 iframe 中运行，资源地址由文档页面提供；单独打开此文件时从仓库构建产物加载。
        const localGlobalUrl = new URL('../../../packages/components/dist/vanilla/vanilla.global.js', document.baseURI)
        const script = document.createElement('script')
        script.src = previewGlobalUrl ?? localGlobalUrl.href
        await new Promise((resolve, reject) => {
          script.onload = resolve
          script.onerror = () => reject(new Error('无框架组件脚本加载失败'))
          document.head.appendChild(script)
        })

        window.TinyRobotVanilla.configureVanillaTheme({
          source: { type: 'attribute', attribute: 'data-theme' },
        })
        const quickAssist = window.TinyRobotVanilla.createQuickAssist({
          include: ['#guide-content'],
          selection: { maxTextLength: 240 },
          getContext: () => ({ product: '云服务器', section: '实例配置', accountId: 'account-demo-0481' }),
          sanitizeContext: (context) => ({
            ...context,
            businessContext: {
              ...context.businessContext,
              accountId: '[已脱敏]',
            },
          }),
          suggestions: [
            {
              id: 'compare',
              getLabel: ({ text }) => \`比较“\${text}”\`,
              getPrompt: ({ text }) => \`请结合页面上下文比较“\${text}”与相关选项\`,
            },
          ],
          getSuggestions: async (context, signal) => {
            await new Promise((resolve) => setTimeout(resolve, 650))
            if (signal.aborted) return []
            return [
              {
                id: 'risk',
                label: \`查看“\${context.text}”的注意事项\`,
                prompt: \`请结合页面上下文说明“\${context.text}”的注意事项\`,
              },
            ]
          },
          adapter: {
            submit(request) {
              panel.hidden = false
              // 使用 textContent 展示完整请求；实际接入时应把 prompt 和 context
              // 一起交给应用的对话层，而不是把上下文拼到页面 HTML 中。
              output.textContent = JSON.stringify(
                {
                  source: request.source,
                  query: request.query,
                  prompt: request.prompt,
                  context: request.context,
                  suggestion: request.suggestion,
                },
                null,
                2,
              )
            },
          },
          onEvent(event) {
            status.textContent = event.type === 'error' ? \`QuickAssist 错误：\${event.stage}\` : \`最近事件：\${event.type}\`
          },
        })

        document.querySelector('#close-assistant').addEventListener('click', () => {
          panel.hidden = true
        })
        window.addEventListener('pagehide', () => quickAssist.destroy(), { once: true })
        document.documentElement.dataset.quickAssistReady = 'true'
      })().catch((error) => {
        document.querySelector('#event-status').textContent = \`组件初始化失败：\${error.message}\`
        console.error(error)
      })
    <\/script>
  </body>
</html>
`,O=`<template>
  <div class="qa-demo">
    <section class="qa-demo__page" aria-labelledby="qa-page-title">
      <h3 id="qa-page-title">创建云服务器：选择一段文字试试</h3>
      <p>计费模式决定了云服务器资源的付费方式。包年包月适合长期、稳定运行的业务，按需计费适合临时或波动的工作负载。</p>
      <p>
        竞价计费通过使用闲置计算资源降低成本，但实例可能因资源供需变化而被回收。请结合业务中断容忍度、数据持久性和预算来选择。
      </p>
      <p>
        网络安全组用于控制云服务器的入站和出站访问规则。生产环境中应遵循最小权限原则，只开放业务必需的端口和来源地址。
      </p>
      <p data-sensitive="true">演示敏感区域：tenantId=tenant-demo-4812（此处不应触发 QuickAssist）。</p>
      <p data-ai-selection="false">这个区域通过 data-ai-selection 标记排除。</p>
      <button class="qa-demo__open" type="button" @click="openAssistantPanel">打开 AI 对话</button>
    </section>

    <aside v-if="panelOpen" class="qa-demo__assistant" aria-label="TinyRobot 模拟对话面板">
      <header class="qa-demo__assistant-head">
        <div>
          <h3>AI 对话面板</h3>
          <p>QuickAssist 提交后在此打开并自动发送</p>
        </div>
        <span class="qa-demo__badge">模拟后端</span>
      </header>

      <div class="qa-demo__messages">
        <TrBubbleList v-if="messages.length" :messages="messages" :role-configs="roleConfigs" auto-scroll />
        <p v-else class="qa-demo__empty">在左侧内容中选中文字，点击“智能帮助”；也可以在上方打开面板后输入问题。</p>
      </div>

      <details v-if="latestRequest" class="qa-demo__context">
        <summary>本次提交的 prompt 与脱敏 Context</summary>
        <pre>{{ JSON.stringify({ prompt: latestRequest.prompt, context: latestRequest.context }, null, 2) }}</pre>
      </details>

      <TrSender v-model="draft" mode="multiple" placeholder="也可以在这里输入问题" @submit="handleManualSubmit" />
    </aside>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { TrBubbleList, TrSender } from '@opentiny/tiny-robot'
import type { BubbleMessage } from '@opentiny/tiny-robot'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
import type { AIRequest, QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'

const messages = ref<BubbleMessage[]>([])
const draft = ref('')
const latestRequest = ref<AIRequest | null>(null)
const panelOpen = ref(false)
const roleConfigs = {
  user: { placement: 'end' as const },
  assistant: { placement: 'start' as const },
}

let quickAssist: QuickAssistInstance | undefined
let nextMessageId = 0

function appendMessage(role: 'user' | 'assistant', content: string) {
  messages.value.push({
    id: \`quick-assist-\${++nextMessageId}\`,
    role,
    content,
  })
}

async function sendMockRequest(request: AIRequest) {
  latestRequest.value = request
  appendMessage('user', request.prompt)

  // 模拟宿主的 AI 接口；prompt 与完整 Context 一起进入发送函数。
  const contextSummary = [
    request.context.nearbyText,
    request.context.businessContext?.product,
    request.context.businessContext?.section,
  ]
    .filter(Boolean)
    .join(' / ')
  await new Promise((resolve) => setTimeout(resolve, 450))
  appendMessage(
    'assistant',
    \`这是本地模拟回复。已收到问题“\${request.query}”，并结合 \${contextSummary || '当前页面上下文'} 处理。真实项目可在这里调用现有对话 API。\`,
  )
}

function openAssistantPanel() {
  panelOpen.value = true
}

function handleManualSubmit(value: string) {
  const content = value.trim()
  if (!content) return
  draft.value = ''
  void sendMockRequest({
    source: 'chat',
    query: content,
    prompt: content,
    context: { source: 'chat', text: content },
  })
}

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['.qa-demo__page'],
    selection: { maxTextLength: 240 },
    getContext: () => ({
      product: '云服务器',
      section: '创建实例',
      tenantId: 'tenant-demo-4812',
    }),
    sanitizeContext: (context) => ({
      ...context,
      businessContext: {
        ...context.businessContext,
        tenantId: '[已脱敏]',
      },
    }),
    adapter: {
      submit: (request) => {
        panelOpen.value = true
        return sendMockRequest(request)
      },
    },
    onEvent: (event) => {
      if (event.type === 'error') console.error('[QuickAssist]', event.stage, event.error)
    },
  })
})

onBeforeUnmount(() => quickAssist?.destroy())
<\/script>

<style scoped>
.qa-demo {
  color: var(--vp-c-text-1, #213547);
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 360px);
  gap: 18px;
  min-height: 430px;
  height: 560px;
  max-height: 560px;
  padding: 18px;
  border: 1px solid var(--vp-c-divider, #dfe3e8);
  border-radius: 12px;
  background: var(--vp-c-bg, #fff);
}

.qa-demo__page {
  min-width: 0;
  min-height: 0;
  overflow: auto;
  line-height: 1.75;
}

.qa-demo__page h3,
.qa-demo__assistant h3 {
  margin: 0 0 10px;
  font-size: 16px;
}

.qa-demo__page p {
  margin: 0 0 14px;
}

.qa-demo__page [data-sensitive],
.qa-demo__page [data-ai-selection='false'] {
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--vp-c-warning-soft, #fff4e5);
  color: var(--vp-c-warning-1, #744c12);
}

.qa-demo__open {
  padding: 8px 12px;
  border: 1px solid var(--vp-c-border, #cbd3dd);
  border-radius: 6px;
  background: var(--vp-c-bg, #fff);
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.qa-demo__assistant {
  display: flex;
  min-height: 390px;
  min-width: 0;
  max-height: 100%;
  overflow: hidden;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--vp-c-divider, #dfe3e8);
  border-radius: 10px;
  background: var(--vp-c-bg-soft, #fafbfc);
}

.qa-demo__assistant-head {
  display: flex;
  flex-shrink: 0;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}

.qa-demo__assistant-head p {
  margin: 0;
  color: var(--vp-c-text-2, #697586);
  font-size: 12px;
}

.qa-demo__badge {
  flex: none;
  padding: 3px 7px;
  border-radius: 999px;
  background: var(--vp-c-brand-soft, #e8f2ff);
  color: var(--vp-c-brand-1, #1768ac);
  font-size: 11px;
}

.qa-demo__messages {
  min-height: 0;
  flex: 1;
  overflow: auto;
}

.qa-demo__empty {
  color: var(--vp-c-text-2, #697586);
  font-size: 13px;
}

.qa-demo__context {
  max-height: 150px;
  flex-shrink: 0;
  overflow: auto;
  font-size: 12px;
}

.qa-demo__context pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.qa-demo__assistant > :last-child {
  flex-shrink: 0;
}

@media (max-width: 700px) {
  .qa-demo {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) minmax(0, 2fr);
    height: 900px;
    max-height: 900px;
  }

  .qa-demo__assistant {
    min-height: 0;
  }
}

.qa-demo__open:hover {
  border-color: var(--vp-c-brand-1, #2175c4);
}
.qa-demo__open:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #2175c4);
  outline-offset: 2px;
}
</style>
`,G="/tiny-robot/alpha/assets/vanilla.global.C0LLowbR.js",U={class:"qa-theme-demo"},H=JSON.parse('{"title":"QuickAssist 智能帮助","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/quick-assist.md","filePath":"components/quick-assist.md"}'),$={name:"components/quick-assist.md"},K=Object.assign($,{setup(z){const m=g();c(async()=>{m.value=(await k(async()=>{const{default:a}=await import("./chunks/lifecycle.DNVNV6Fr.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const v=g();c(async()=>{v.value=(await k(async()=>{const{default:a}=await import("./chunks/monaco.WbtuP6vb.js");return{default:a}},__vite__mapDeps([3,2,1]))).default});const b=g();c(async()=>{b.value=(await k(async()=>{const{default:a}=await import("./chunks/activation.CTIQHTqW.js");return{default:a}},__vite__mapDeps([4,2,1]))).default});const f=g();c(async()=>{f.value=(await k(async()=>{const{default:a}=await import("./chunks/selection-scope.CBWMoQB8.js");return{default:a}},__vite__mapDeps([5,1,2]))).default});const F=g();c(async()=>{F.value=(await k(async()=>{const{default:a}=await import("./chunks/context.hG45-5ey.js");return{default:a}},__vite__mapDeps([6,1,2]))).default});const x=g();c(async()=>{x.value=(await k(async()=>{const{default:a}=await import("./chunks/suggestion-validation.Bbp_95pf.js");return{default:a}},__vite__mapDeps([7,2,1]))).default});const A=g();c(async()=>{A.value=(await k(async()=>{const{default:a}=await import("./chunks/remote-recommendations.BqLxRdYG.js");return{default:a}},__vite__mapDeps([8,2,1]))).default});const C=g();c(async()=>{C.value=(await k(async()=>{const{default:a}=await import("./chunks/recommendations.CbB7l5mA.js");return{default:a}},__vite__mapDeps([9,1,2]))).default});const q=g();c(async()=>{q.value=(await k(async()=>{const{default:a}=await import("./chunks/direction-placement.DdkT5dq_.js");return{default:a}},__vite__mapDeps([10,2,1]))).default});const _=g();c(async()=>{_.value=(await k(async()=>{const{default:a}=await import("./chunks/trigger-delay.D74aTNHL.js");return{default:a}},__vite__mapDeps([11,1,2]))).default});const t=S(!0),B=g();return c(async()=>{B.value=(await k(async()=>{const{default:a}=await import("./chunks/vue-chat.DEl2cDmz.js");return{default:a}},__vite__mapDeps([12,13,2,1]))).default}),typeof window<"u"&&(window.__tinyRobotVanillaDemoGlobalUrl=G),(a,s)=>{const l=D("ClientOnly");return w(),T("div",null,[s[13]||(s[13]=h(`<h1 id="quickassist-智能帮助" tabindex="-1">QuickAssist 智能帮助 <a class="header-anchor" href="#quickassist-智能帮助" aria-label="Permalink to &quot;QuickAssist 智能帮助&quot;">​</a></h1><p>QuickAssist 是一个与框架无关的智能帮助组件，可以用在需要在页面中进行轻量AI交互的场景。当前提供了“划词”和主动 API 两种触发方式，以及输入交互，用户选中页面中的文字后，可以查看推荐问题、编辑问题，并把问题和有限上下文交给应用已有的 AI 对话面板。它只负责划词触发和输入交互，不包含回答展示、模型调用或完整聊天界面。</p><h2 id="安装与引入" tabindex="-1">安装与引入 <a class="header-anchor" href="#安装与引入" aria-label="Permalink to &quot;安装与引入&quot;">​</a></h2><h3 id="npm-方式" tabindex="-1">NPM 方式 <a class="header-anchor" href="#npm-方式" aria-label="Permalink to &quot;NPM 方式&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot</span></span></code></pre></div><p>从 TinyRobot NPM 包的<code>/vanilla</code> 子路径导入，并显式加载组件样式：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { createQuickAssist } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla/style.css&#39;</span></span></code></pre></div><p>QuickAssist 的运行时代码不依赖 Vue、Angular 等框架或其他界面组件。可以在任何技术栈项目中单独使用该组件，且产物不会包含任何框架运行时。</p><h3 id="cdn-方式" tabindex="-1">CDN 方式 <a class="header-anchor" href="#cdn-方式" aria-label="Permalink to &quot;CDN 方式&quot;">​</a></h3><p>通过 CDN 加载脚本后，使用 <code>window.TinyRobotVanilla</code> 创建组件，无需单独引入样式。将 <code>VERSION</code> 替换为包含 <code>vanilla.global.js</code> 的已发布 TinyRobot 版本号：</p><div class="language-html vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">html</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> src</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot@VERSION/dist/vanilla/vanilla.global.js&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> quickAssist</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> window.TinyRobotVanilla.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    adapter: {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">      submit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">request</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        openAssistantAndSend</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(request.prompt, request.context)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p>也可以将 npm 包中的 <code>dist/vanilla/vanilla.global.js</code> 部署到自己的 CDN 或静态资源目录，再替换上面的脚本地址。此文件是整个无框架组件集合的入口，提供 <code>createQuickAssist</code>、<code>configureVanillaTheme</code> 等 API。</p><p>CDN 方式会在创建实例时自动注入组件样式。如果页面的内容安全策略禁止动态注入 <code>&lt;style&gt;</code>，可以使用 npm 方式并显式加载 CSS。</p><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基础用法" tabindex="-1">基础用法 <a class="header-anchor" href="#基础用法" aria-label="Permalink to &quot;基础用法&quot;">​</a></h3><p>使用 <code>createQuickAssist</code> 可以创建选词智能帮助的UI实例。支持通过传入参数来进行各类自定义配置。<br><code>adapter</code> 参数负责连接应用现有的 AI 对话能力，例如用户发送问题后或者点击推荐问题后显示下一步AI对话窗口。提交时应处理 <code>prompt</code> 和 <code>context</code>；只发送 <code>query</code> 会丢掉推荐问题和页面上下文。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { createQuickAssist } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla/style.css&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> quickAssist</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  include: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;#app&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  adapter: {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    submit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">request</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">      // 替换为应用自己的“打开面板并自动发送”逻辑。</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      assistantPanel.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">open</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      assistantChat.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">send</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        content: request.prompt,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        context: request.context,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  onEvent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">event</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 可在宿主接入埋点；事件不包含默认选区文本或完整上下文。</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">debug</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;[QuickAssist]&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, event.type)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 单页应用在路由离开当前页面时调用 quickAssist.close()。</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 页面/应用销毁时调用：</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// quickAssist.destroy()</span></span></code></pre></div><p><code>adapter</code> 收到的 <code>AIRequest</code> 包含 <code>source</code>、<code>query</code>、<code>prompt</code> 和脱敏后的 <code>context</code>；点击推荐项时还包含 <code>suggestion</code>。组件先关闭划词界面，再调用 <code>adapter</code>；异步提交失败会通过 <code>error</code> 事件报告，不会重新打开已关闭的界面。</p><p>下面的示例使用 TinyRobot 的 <code>TrBubbleList</code> 与 <code>TrSender</code> 呈现对话界面，并用本地模拟回复代替后端。QuickAssist 的 <code>adapter</code> 会打开面板，并把 <code>prompt</code> 与脱敏后的 <code>context</code> 一起交给对话函数。</p>`,19)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"Vue 对话面板接入",description:"划词后打开 TinyRobot 对话面板，并自动提交 prompt 与脱敏上下文。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{t.value=!1}),vueCode:n(O)},u({_:2},[B.value?{name:"vue",fn:e(()=>[i(n(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[14]||(s[14]=E("h3",{id:"html-接入",tabindex:"-1"},[y("HTML 接入 "),E("a",{class:"header-anchor",href:"#html-接入","aria-label":'Permalink to "HTML 接入"'},"​")],-1)),s[15]||(s[15]=E("p",null,"下面的 HTML 示例把请求对象安全地显示在模拟对话面板中，不连接实际模型服务。",-1)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"HTML 接入",description:"划词后查看提交给应用的请求内容。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[1]||(s[1]=()=>{t.value=!1}),htmlCode:n(j)},null,8,["htmlCode"])]),_:1}),s[16]||(s[16]=E("h3",{id:"延迟显示入口",tabindex:"-1"},[y("延迟显示入口 "),E("a",{class:"header-anchor",href:"#延迟显示入口","aria-label":'Permalink to "延迟显示入口"'},"​")],-1)),s[17]||(s[17]=E("p",null,[y("设置 "),E("code",null,"trigger.showDelay"),y(" 可在选区稳定后延迟显示划词入口，单位为毫秒；默认 "),E("code",null,"0"),y("，保持立即显示。连续拖选时从最后一次有效选区重新计时，并等待鼠标松开；选区失效、关闭、停用或销毁时会取消待显示的入口。延迟只影响入口，不影响点击后打开输入浮层。")],-1)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"延迟显示划词入口",description:"切换立即显示与延迟 300 毫秒，对比划词体验。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[2]||(s[2]=()=>{t.value=!1}),vueCode:n(X)},u({_:2},[_.value?{name:"vue",fn:e(()=>[i(n(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[18]||(s[18]=h(`<h3 id="划词方向与入口位置" tabindex="-1">划词方向与入口位置 <a class="header-anchor" href="#划词方向与入口位置" aria-label="Permalink to &quot;划词方向与入口位置&quot;">​</a></h3><p>默认仅正向划词触发入口，设置 <code>selection.forwardOnly: false</code> 可允许双向划词。方向按文档顺序判断，跨行向后选择仍视为正向，即使结束位置在起始位置左侧；键盘 Shift 选词采用相同规则。自定义 <code>selection.validate</code> 不会覆盖方向限制。此规则面向横排中文等常规阅读场景，不按 RTL 或竖排文字的视觉方向判断。</p><p>入口默认显示在最后一行选中文字的右下方，入口左边缘对齐文字右边缘。<code>top</code> 系列位置使用第一行，<code>bottom</code> 系列使用最后一行；同一行的多个内联文本片段合并计算。<code>start</code> 表示入口向文字左侧展开（入口右边缘对齐文字左边缘），<code>end</code> 表示入口向文字右侧展开（入口左边缘对齐文字右边缘），不带后缀则居中；<code>auto</code> 优先在末行下方居中。空间不足时会翻转到另一侧，并使用对应的首行或末行，必要时向视口内调整。</p><p>点击入口后，输入浮层直接相对选区使用同一套 <code>placement</code> / <code>offset</code> 规则，默认间距为 8px；根据浮层自身尺寸进行翻转和视口避让。输入框聚焦和输入期间，原划词范围保留灰色高亮，关闭或提交后清除。高亮通过 CSS Custom Highlight API 绘制，不修改原文 DOM；不支持该 API 的浏览器仍可使用划词帮助，但不显示保留高亮。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> quickAssist</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  adapter,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  selection: { forwardOnly: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  trigger: { placement: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;bottom-end&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, offset: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">8</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// updateOptions 中提供的嵌套配置会整体替换原分组。</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">quickAssist.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">updateOptions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  selection: { forwardOnly: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  trigger: { placement: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;top-start&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div>`,5)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"划词方向与首末行定位",description:"切换方向限制和入口位置，跨行选中文字观察入口对齐。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[3]||(s[3]=()=>{t.value=!1}),vueCode:n(N)},u({_:2},[q.value?{name:"vue",fn:e(()=>[i(n(q))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[19]||(s[19]=h(`<div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  adapter,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  trigger: { showDelay: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">300</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><h3 id="推荐问题" tabindex="-1">推荐问题 <a class="header-anchor" href="#推荐问题" aria-label="Permalink to &quot;推荐问题&quot;">​</a></h3><p>选中示例中的文字后点击划词入口，可以先看到静态推荐，再看到异步返回的推荐；点击任一推荐可查看提交结果。</p>`,3)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"静态与异步推荐",description:"查看推荐加载、合并和点击后直接提交的效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[4]||(s[4]=()=>{t.value=!1}),vueCode:n(V)},u({_:2},[C.value?{name:"vue",fn:e(()=>[i(n(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[20]||(s[20]=h('<p>通过 <code>suggestions</code> 配置的问题称为“静态问题”，可包含根据选区生成文案的模板；与组件内置的默认推荐问题区分。QuickAssist 支持四种推荐模式：</p><table tabindex="0"><thead><tr><th>配置方式</th><th>打开输入浮层后的行为</th></tr></thead><tbody><tr><td>省略 <code>suggestions</code> 与 <code>getSuggestions</code></td><td>立即显示“解释”和“适用场景”两个默认模板</td></tr><tr><td>仅配置 <code>suggestions</code></td><td>立即显示静态推荐；显式传 <code>[]</code> 表示不显示默认模板</td></tr><tr><td>仅配置 <code>getSuggestions</code></td><td>不显示内置默认模板；立即打开输入区，推荐区域显示加载状态，返回后只展示远程结果</td></tr><tr><td>两者都配置</td><td>先显示静态模板，再合并异步推荐；默认静态在前、远程追加，按 <code>id</code> 保留首次出现项，最后由 <code>maxSuggestions</code> 裁剪；可用 <code>mergeSuggestions</code> 自定义覆盖策略</td></tr></tbody></table><p><code>Suggestion</code> 包含稳定的 <code>id</code>、展示用 <code>label</code> 和提交用 <code>prompt</code>。点击推荐项会直接提交，无须再次点击发送。手动输入则把编辑后的内容作为 <code>query</code>；可用 <code>buildPrompt</code> 自定义最终发送内容。</p><h4 id="远程推荐覆盖静态问题" tabindex="-1">远程推荐覆盖静态问题 <a class="header-anchor" href="#远程推荐覆盖静态问题" aria-label="Permalink to &quot;远程推荐覆盖静态问题&quot;">​</a></h4><p>如果问题全部由远程接口提供，只需配置 <code>getSuggestions</code>，省略 <code>suggestions</code>，内置的“解释”和“适用场景”模板就不会显示。如果希望加载期间先显示静态问题，远程返回后整体替换，可显式提供静态模板，并通过 <code>mergeSuggestions</code> 只返回远程结果。</p><p>下面的示例可切换“仅远程推荐”“远程整体替换”“空结果回退”和“远程优先”四种策略，以及成功、空数组、失败三种响应。示例用延迟模拟远程请求，无需后端即可运行；展开示例源码可查看完整配置。接入业务接口时，将 <code>getSuggestions</code> 中的模拟逻辑替换为 <code>fetch</code>，传入 <code>signal</code> 并返回 <code>Suggestion[]</code> 即可。</p>',6)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"远程推荐与覆盖策略",description:"切换策略和响应后重新划词，观察加载期间的静态问题及远程返回后的结果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[5]||(s[5]=()=>{t.value=!1}),vueCode:n(Z)},u({_:2},[A.value?{name:"vue",fn:e(()=>[i(n(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[21]||(s[21]=h('<p>“远程整体替换”会在远程成功返回空数组时清空静态推荐；“空结果回退”则保留静态问题。“远程优先”示例中远程与静态的解释问题具有相同 <code>id</code>，可以观察远程问题如何覆盖静态问题，同时保留未重复的静态问题。</p><p>请求失败时不会调用 <code>mergeSuggestions</code>，会保留已显示的静态问题并展示加载失败状态，同时触发 <code>stage: &#39;suggestions&#39;</code> 的错误事件。仅配置远程推荐时没有静态问题可回退，用户仍可手动输入提交。</p><h4 id="自定义合并策略-mergesuggestions" tabindex="-1">自定义合并策略 <code>mergeSuggestions</code> <a class="header-anchor" href="#自定义合并策略-mergesuggestions" aria-label="Permalink to &quot;自定义合并策略 `mergeSuggestions`&quot;">​</a></h4><p><code>mergeSuggestions(base, incoming, context)</code> 是同步回调，在远程推荐成功返回并通过校验后调用。<code>base</code> 是静态推荐经模板求值、按 <code>id</code> 去重并按 <code>maxSuggestions</code> 裁剪后的结果；<code>incoming</code> 是过滤无效项后、尚未去重或裁剪的远程推荐数组；<code>context</code> 是本次推荐使用的脱敏上下文。回调必须返回 <code>Suggestion[]</code>。</p><p>默认策略相当于 <code>[...base, ...incoming]</code>：静态项优先，同 <code>id</code> 的远程项不会覆盖静态项；静态项占满数量上限时，远程项可能不展示。可以按业务需要返回不同顺序：</p><table tabindex="0"><thead><tr><th>目标</th><th>回调返回值</th></tr></thead><tbody><tr><td>远程整体替换静态问题</td><td><code>incoming</code></td></tr><tr><td>远程有结果时替换，否则保留静态问题</td><td><code>incoming.length ? incoming : base</code></td></tr><tr><td>远程优先，保留未重复的静态问题</td><td><code>[...incoming, ...base]</code></td></tr><tr><td>静态优先，追加未重复的远程问题（默认）</td><td><code>[...base, ...incoming]</code></td></tr></tbody></table><p>自定义回调返回后，组件仍会校验推荐格式、按 <code>id</code> 保留首次出现项，并应用 <code>maxSuggestions</code> 上限（默认 <code>3</code>）。因此，远程优先策略也可以用来覆盖静态同 <code>id</code> 的问题。</p><h4 id="远程问题校验-validatesuggestion" tabindex="-1">远程问题校验 <code>validateSuggestion</code> <a class="header-anchor" href="#远程问题校验-validatesuggestion" aria-label="Permalink to &quot;远程问题校验 `validateSuggestion`&quot;">​</a></h4><p>组件先检查远程响应是否为数组，再逐项检查 <code>id</code>、<code>label</code>、<code>prompt</code> 是否为非空字符串（纯空白也无效）。格式无效项会被过滤，不影响同批其他有效问题。静态问题及自定义合并结果也会进行格式校验，配置或合并结果无效时会报错。</p><p>可选的同步回调 <code>validateSuggestion(suggestion, context): boolean</code> 在基础校验后、合并前逐项执行，仅用于远程问题：</p><table tabindex="0"><thead><tr><th>参数或返回值</th><th>含义</th></tr></thead><tbody><tr><td><code>suggestion</code></td><td>已通过基础格式校验的单条推荐副本，包含 <code>id</code>、<code>label</code>、<code>prompt</code> 和可选 <code>meta</code>；该回调用于判断是否保留，不用于修改推荐内容</td></tr><tr><td><code>context</code></td><td>本次推荐使用的脱敏上下文，可读取 <code>text</code>、页面、附近文本和业务字段</td></tr><tr><td>返回 <code>true</code> / <code>false</code></td><td>保留 / 丢弃该问题</td></tr></tbody></table><p>下面的独立示例并列展示远程原始问题、逐项过滤原因和最终展示问题。选中“竞价计费”后打开智能帮助，查看同一批问题的校验结果；切换“启用业务校验”后重新划词，可对比哪些问题被保留。基础格式校验始终执行，不受该开关影响。</p>',12)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"远程问题校验前后对比",description:"对比原始问题与最终问题，查看空白、超长、不相关问题的过滤原因，以及全部无效时的静态回退。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[6]||(s[6]=()=>{t.value=!1}),vueCode:n(P)},u({_:2},[x.value?{name:"vue",fn:e(()=>[i(n(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[22]||(s[22]=h('<p>示例业务规则限制标题不超过 40 字、问题不超过 1000 字，并要求问题包含选中文字，可按产品需要替换；组件本身不设置文字长度上限。切换为“全部异常问题”可观察全部无效时的静态问题回退，展开源码可查看完整的 <code>validateSuggestion</code> 配置。</p><p>响应不是数组、非空响应全部被过滤、回调抛出异常或返回非布尔值（包括 <code>Promise</code>）时，整批远程推荐失败，不会调用 <code>mergeSuggestions</code>，会保留静态问题并触发 <code>stage: &#39;suggestions&#39;</code> 的错误事件。仅远程模式仍可手动输入提交。接口主动返回 <code>[]</code> 则属于成功的空结果，继续按合并策略处理，与全部被过滤的情况区分。</p><p><code>ValidateSuggestion</code> 类型可从 <code>@opentiny/tiny-robot/vanilla</code> 导入。AI 原始输出的 JSON 解析、字段映射和缺失 <code>id</code> 的生成应在业务 <code>getSuggestions</code> 中完成，组件接收统一的 <code>Suggestion[]</code>。</p><h3 id="页面上下文与敏感数据" tabindex="-1">页面上下文与敏感数据 <a class="header-anchor" href="#页面上下文与敏感数据" aria-label="Permalink to &quot;页面上下文与敏感数据&quot;">​</a></h3><p>选中示例中的虚构租户编号并提交，可查看选区文本、附近文本和业务字段中的编号被统一脱敏后的上下文。另一个标为敏感的区域不能触发划词，也不会进入附近文本。</p>',5)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"上下文与脱敏",description:"选中文字并提交，查看允许交给应用的上下文。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[7]||(s[7]=()=>{t.value=!1}),vueCode:n(Q)},u({_:2},[F.value?{name:"vue",fn:e(()=>[i(n(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[23]||(s[23]=h(`<p>默认上下文包含：</p><ul><li><code>source: &#39;selection&#39;</code>、<code>text</code> 和 <code>selection.text</code>；</li><li>页面标题与 URL；URL 只包含域名和路径，不采集查询参数或片段标识；</li><li>限长的 <code>nearbyText</code>，从选区附近的有限语义块提取；找不到语义块时最多退回选中文字。</li></ul><p>可以通过 <code>getContext</code> 添加业务字段，通过 <code>getNearbyContext</code> 定制附近文本，并通过 <code>sanitizeContext</code> 返回最终允许外发的完整上下文。<code>sanitizeContext</code> 在业务上下文构造后执行；脱敏完成前不会调用推荐函数或 <code>adapter</code>。</p><ul><li><code>sanitizeContext</code> 返回值必须保留 <code>source</code>、<code>text</code> 两个字符串字段，其余字段可删除。</li><li>上下文中不要放函数、DOM 对象或共享内存数据，否则会报错并阻止提交。</li><li>推荐函数和 <code>buildPrompt</code> 收到上下文副本，修改副本不会改变最终提交的上下文。</li></ul><p>下面使用虚构租户编号演示脱敏。输入框可能保留选中的原文，因此还需通过 <code>buildPrompt</code> 对最终发送的问题脱敏；此例的宿主仅发送 <code>prompt</code> 和 <code>context</code>。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> tenantId</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;tenant-demo-4812&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> redactTenant</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">text</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> text.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">replaceAll</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(tenantId, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;[redacted]&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> quickAssist</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  adapter,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  getContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ({ product: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;云服务器&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, section: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;创建实例&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, tenantId }),</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  sanitizeContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">context</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ({</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    ...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">context,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    text: </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">redactTenant</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(context.text),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    selection: context.selection </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">context.selection, text: </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">redactTenant</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(context.selection.text) } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    nearbyText: context.nearbyText </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> redactTenant</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(context.nearbyText) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> undefined</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    businessContext: {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      ...</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">context.businessContext,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      tenantId: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;[redacted]&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }),</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  buildPrompt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: ({ </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">query</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">suggestion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> redactTenant</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(suggestion?.prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">??</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> query),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>默认采集不会读取整页 <code>body.innerText</code> 或表单值。选区与附近文本会跳过常见编辑区和敏感标记，但通用规则不能识别所有业务秘密。请通过 <code>sanitizeContext</code> 删除访问密钥、令牌、用户或租户 ID、订单数据等，并在页面上为敏感区域添加 <code>data-sensitive</code> 或 <code>data-ai-selection=&quot;false&quot;</code>。不要把 DOM、<code>Range</code> 或选区快照序列化后传给模型。</p><h3 id="生效范围与选择长度" tabindex="-1">生效范围与选择长度 <a class="header-anchor" href="#生效范围与选择长度" aria-label="Permalink to &quot;生效范围与选择长度&quot;">​</a></h3><p>试着选择示例中允许的文字、排除区域，以及超过长度限制的句子，比较划词入口是否出现。</p>`,9)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"可选择区域与长度限制",description:"仅指定区域和有效长度的选区会显示划词入口。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[8]||(s[8]=()=>{t.value=!1}),vueCode:n(M)},u({_:2},[f.value?{name:"vue",fn:e(()=>[i(n(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[24]||(s[24]=h(`<div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> quickAssist</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  adapter,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  include: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;#app&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">], </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 配置后，选区中的每个文本节点都必须位于匹配区域</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  exclude: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;[data-qa-ignore]&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;.private-value&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">], </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 在内置排除项上追加</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  selection: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    maxTextLength: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">300</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    validate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">snapshot</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> snapshot.text.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">trim</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">length</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>默认拒绝空白、纯数字、纯标点/符号、明显 URL、UUID 和超出长度的选区；不会用固定最短长度过滤 <code>ECS</code>、<code>VPC</code>、<code>QoS</code> 等短技术词。<code>selection.validate</code> 自定义文本判断，但仍不能绕过最大长度、<code>include</code> / <code>exclude</code>、编辑器和敏感区域检查。超长选区会被拒绝，不会悄悄截断后发送。</p><p>默认排除 <code>input</code>、<code>textarea</code>、<code>select</code>、可编辑的 <code>contenteditable</code> 区域、Monaco、CodeMirror、QuickAssist 自身界面，以及 <code>[data-ai-selection=&quot;false&quot;]</code>、<code>[data-sensitive]</code>、<code>[data-secret]</code>、<code>[data-password]</code> 等标记。普通只读 <code>contenteditable=&quot;false&quot;</code> 区域可以划词；若它位于可编辑祖先或其他排除区域内，仍会被排除。</p><div class="tip custom-block"><p class="custom-block-title">支持范围</p><p>当前版本暂不支持移动端长按选择，以及 iframe 和 Shadow DOM 内的选区。</p></div><h3 id="主动激活-按钮与自定义选区" tabindex="-1">主动激活：按钮与自定义选区 <a class="header-anchor" href="#主动激活-按钮与自定义选区" aria-label="Permalink to &quot;主动激活：按钮与自定义选区&quot;">​</a></h3><p>通过 <code>activate()</code> 可以主动提供文本和锚点，复用“智能帮助入口 → 输入浮层 → 推荐与提交”的流程。默认先展示入口；传入 <code>open: &#39;popover&#39;</code> 可跳过入口，直接打开并聚焦输入框。它不会直接显示 AI 答案。</p><p>示例默认勾选“直接显示输入框”：点击术语按钮直接提问，悬停或键盘聚焦指标卡片可查看指标专属推荐；浮层打开后可移入其中操作。取消勾选即可对比先显示入口的流程。提交后，下方展示实际收到的内容与来源。</p>`,7)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"主动激活与自定义定位",description:"点击与悬停触发，切换直接输入，并对比实例默认推荐和本次专属推荐。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[9]||(s[9]=()=>{t.value=!1}),vueCode:n(W)},u({_:2},[b.value?{name:"vue",fn:e(()=>[i(n(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[25]||(s[25]=h(`<p>最简单的方式是传入一个 DOM 元素作为锚点：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> explainButton</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> document.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">querySelector</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">HTMLButtonElement</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;#explain&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">explainButton.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addEventListener</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;click&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  quickAssist.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">activate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    text: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;需要解释的代码或业务术语&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    anchor: explainButton,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    open: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;popover&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 直接打开输入框；省略时先显示智能帮助入口</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // source 默认是 manual；可选 meta 会进入上下文脱敏管道。</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    meta: { feature: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;code-explanation&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p><code>open: &#39;popover&#39;</code> 立即进入输入浮层，跳过 <code>trigger.showDelay</code>，不产生 <code>trigger_show</code> 或 <code>trigger_click</code> 事件，仍产生 <code>selection</code> 和 <code>popover_show</code>。上下文构造或脱敏未完成时可以编辑，但暂不能发送。<code>open</code> 只影响本次激活，普通页面划词不变。</p><p><strong>为本次激活单独提供推荐</strong>，无需 <code>updateOptions()</code>，也不影响其他区域：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">quickAssist.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">activate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  source: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;editor&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  text: selectedCode,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  anchor: codeElement,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  open: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;popover&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  suggestions: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      id: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;explain-code&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">      getLabel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;解释这段代码&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">      getPrompt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">context</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`请解释以下代码：</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\\n</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">context</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">text</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      id: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;review-code&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">      getLabel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;检查潜在问题&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">      getPrompt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">context</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`请检查以下代码是否存在潜在问题：</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\\n</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">context</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">text</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><table tabindex="0"><thead><tr><th>本次激活参数</th><th>行为</th></tr></thead><tbody><tr><td>不传 <code>suggestions</code> / <code>getSuggestions</code></td><td>使用实例默认推荐配置</td></tr><tr><td><code>suggestions: [...]</code></td><td>替换本次的静态推荐；不调用实例的远程推荐</td></tr><tr><td><code>suggestions: []</code></td><td>不显示推荐，保留手动提问</td></tr><tr><td><code>getSuggestions: fn</code></td><td>使用本次的异步推荐函数，可与本次静态推荐一起配置</td></tr><tr><td><code>getSuggestions: null</code></td><td>本次禁用远程推荐，静态推荐仍按对应配置展示</td></tr></tbody></table><p>推荐项的结构与实例级 <code>suggestions</code> 一致，支持固定问题与 <code>getLabel</code> / <code>getPrompt</code> 工厂。工厂与远程函数均在上下文脱敏后执行，数量限制、远程校验、合并策略仍使用实例配置；关闭或新激活会中止旧请求、忽略旧结果。固定项在激活时复制，后续不会因原数组被修改而变化。</p><p>元素移除、祖先隐藏或尺寸塌缩时会清理当前会话；实例停用或销毁后调用 <code>activate()</code> 不生效。显式再次调用可以重新打开已关闭的内容。</p><p>需要将入口放在编辑器选区、图表或自定义画布旁时，使用完整形式：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">quickAssist.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">activate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  source: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;editor&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  text: selectedCode,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  anchorElement: editorContainer,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  getRect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getCurrentSelectionRect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(),</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  verify</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> isCapturedSelectionStillValid</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(),</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  getNearbyText</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> capturedNearbyCode,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  onInvalidate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">notify</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // notify 表示需要复检；verify 与 getRect 有效则重定位，否则关闭。</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> subscribeToSelectionAndLayoutChanges</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(notify)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  meta: { language: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;typescript&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, fileName: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;price.ts&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p><code>getCurrentSelectionRect</code> 等函数由宿主实现，以上是接口示意。矩形使用<strong>相对浏览器视口的 CSS 像素坐标</strong>，与 <code>getBoundingClientRect()</code> 一致；选区不可见或失效时返回 <code>null</code>，零宽但有高度的 caret 矩形也有效。编辑器的内部坐标需要加上容器的视口坐标，并由宿主判断编辑器自身的裁剪范围。</p><p><code>onInvalidate</code> 从接受激活时开始订阅，覆盖 <code>showDelay</code>、入口和输入浮层阶段，关闭时调用返回的清理函数。未提供该订阅时，仅在滚动、窗口 resize、延迟显示等检查时发现失效；模型或布局变化需由宿主通知，或主动 <code>close()</code>。</p><p><code>text</code>、<code>meta</code> 和 <code>getNearbyText()</code> 的结果在激活时捕获；附近文本受 <code>nearbyContext.maxLength</code> 限制，业务上下文和脱敏仍在打开输入浮层后执行。<code>meta</code> 仅放可 JSON 序列化的业务字段。不要传 DOM、编辑器实例、Range 或访问密钥。</p><p>主动激活遵循非空、最大文本长度和几何校验；<code>include</code> / <code>exclude</code>、<code>selection.forwardOnly</code>、旧的 <code>selection.validate</code> 与 <code>getNearbyContext</code> 仅作用于原生 DOM 划词。宿主应自行决定哪些自定义区域可以激活。代码场景可通过 <code>selection.validateActivation</code> 替换默认的纯数字/符号/URL 等文本规则，但不能绕过长度和几何限制：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">quickAssist.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">updateOptions</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  selection: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    maxTextLength: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2000</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    validateActivation</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: ({ </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">text</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> text.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">trim</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">length</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><h3 id="monaco-选中代码后主动解释" tabindex="-1">Monaco 选中代码后主动解释 <a class="header-anchor" href="#monaco-选中代码后主动解释" aria-label="Permalink to &quot;Monaco 选中代码后主动解释&quot;">​</a></h3><p>这个示例使用真实 Monaco 编辑器。鼠标拖选并松开，或用 Shift + 方向键完成选区后，页面自动读取编辑器模型并调用 <code>activate()</code>，把“智能帮助”入口定位到选区末端；点击入口后可发送“解释这段代码”。关闭后，同一选区不会因无关 keyup 立即重开，清空后重新选择即可再次触发。代码解释和问题检查通过本次 <code>activate({ suggestions })</code> 配置，实例继续使用默认推荐。下方示例助手显示实际收到的请求，本例不调用模型。</p>`,17)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"Monaco 主动选区解释",description:"选词完成后自动调用通用 API，不依赖编辑器桥接器。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[10]||(s[10]=()=>{t.value=!1}),vueCode:n(R)},u({_:2},[v.value?{name:"vue",fn:e(()=>[i(n(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[26]||(s[26]=h(`<p>核心接线如下，完整可运行代码见示例源码。Monaco 需要由应用自行安装，并在浏览器挂载后创建：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> lastIdentity</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> undefined</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> explainSelection</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> selection</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> editor.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getSelection</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> model</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> editor.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getModel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> container</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> editor.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getDomNode</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">selection </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">||</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> selection.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">isEmpty</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">||</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> !</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">model </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">||</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> !</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">container) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">return</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> text</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> model.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getValueInRange</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(selection)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> version</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> model.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getVersionId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> identity</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">model</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">uri</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}:\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">version</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}:\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">selection</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">selectionStartLineNumber</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}:\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">selection</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">selectionStartColumn</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}:\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">selection</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">positionLineNumber</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}:\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">selection</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">positionColumn</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}\`</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (identity </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> lastIdentity) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">return</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  lastIdentity </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> identity</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> end</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> selection.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getEndPosition</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  quickAssist.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">activate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    source: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;monaco&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    text,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    suggestions: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        id: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;explain-code&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        getLabel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;解释这段代码&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        getPrompt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">context</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`请解释以下代码：</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">\\n</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">context</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">text</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    anchorElement: container,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    meta: { language: model.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getLanguageId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    verify</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> editor.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getModel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> model </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> model.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getVersionId</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">===</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> version,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    getRect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> position</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> editor.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getScrolledVisiblePosition</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(end)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> layout</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> editor.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getLayoutInfo</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        !</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">container.isConnected </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">||</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        !</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">container.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getClientRects</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">length</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ||</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        !</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">position </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">||</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        position.left </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> layout.contentLeft </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">||</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        position.left </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> layout.contentLeft </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> layout.contentWidth </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">||</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        position.top </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> ||</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        position.top </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> position.height </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> layout.height</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      )</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">        return</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> box</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> container.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getBoundingClientRect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">      return</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> DOMRect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(box.left </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> position.left, box.top </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">+</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> position.top, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, position.height)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 选择完成后调度，让 Monaco 先处理完事件；自动调用对相同选区去重。</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> activateWhenSettled</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> requestAnimationFrame</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> explainSelection</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">())</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 简化接线。完整示例还处理拖选期间的门控、指针取消和卸载时取消调度。</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> disposables</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  editor.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onMouseUp</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(activateWhenSettled),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  editor.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onKeyUp</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">event</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">event.browserEvent.isComposing) </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">activateWhenSettled</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  editor.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onDidChangeCursorSelection</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    if</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (editor.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getSelection</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()?.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">isEmpty</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()) lastIdentity </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> undefined</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    quickAssist.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">close</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  editor.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onDidChangeModelContent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> quickAssist.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">close</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  editor.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onDidScrollChange</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> quickAssist.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">close</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  editor.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onDidLayoutChange</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> quickAssist.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">close</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 卸载时 disposables.forEach(item =&gt; item.dispose())，并销毁助手、编辑器和模型。</span></span></code></pre></div><p>普通页面仍默认排除 Monaco、CodeMirror 和输入框；主动调用不依赖解除这些过滤规则。此处的自动激活由示例页面接线实现，当前未提供官方 Monaco / CodeMirror 自动桥接器。</p><h3 id="生命周期与路由" tabindex="-1">生命周期与路由 <a class="header-anchor" href="#生命周期与路由" aria-label="Permalink to &quot;生命周期与路由&quot;">​</a></h3><p>以下示例可直接启用或停用划词，并模拟路由切换时调用 <code>close()</code>；组件卸载时应调用 <code>destroy()</code>。</p>`,5)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"启停与关闭会话",description:"通过按钮控制划词功能，并模拟页面切换。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[11]||(s[11]=()=>{t.value=!1}),vueCode:n(I)},u({_:2},[m.value?{name:"vue",fn:e(()=>[i(n(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[27]||(s[27]=h(`<h4 id="angular" tabindex="-1">Angular <a class="header-anchor" href="#angular" aria-label="Permalink to &quot;Angular&quot;">​</a></h4><p>在视图创建后初始化实例，并在组件销毁时调用 <code>destroy()</code>。QuickAssist 会自动响应浏览器 <code>popstate</code> 与 <code>hashchange</code>；Angular Router 通常通过 <code>pushState</code> 导航，不一定产生这两个事件，因此应在路由导航开始时调用 <code>close()</code>。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { AfterViewInit, Component, OnDestroy, inject } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@angular/core&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { NavigationStart, Router } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@angular/router&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { filter, Subscription } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;rxjs&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { createQuickAssist } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla/style.css&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { QuickAssistInstance } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">@</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">Component</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ selector: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;app-shell&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, template: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;&lt;main id=&quot;app&quot;&gt;...&lt;/main&gt;&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> })</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">export</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AppShellComponent</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> implements</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AfterViewInit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">OnDestroy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  private</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> readonly</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> router</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> inject</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(Router)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  private</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> routeSubscription</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Subscription</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  private</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> quickAssist</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> QuickAssistInstance</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  ngAfterViewInit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.quickAssist </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      include: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;#app&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      adapter: {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        submit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">request</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">          this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openAssistantAndSend</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(request.prompt, request.context)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    })</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.routeSubscription </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.router.events</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">pipe</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">filter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">event</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;"> event</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> is</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> NavigationStart</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> event </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">instanceof</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> NavigationStart</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">))</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      .</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">subscribe</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.quickAssist?.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">close</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">())</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  ngOnDestroy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.routeSubscription?.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">unsubscribe</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.quickAssist?.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">destroy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  private</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> openAssistantAndSend</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">prompt</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">context</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 接入应用已有面板与发送方法；不要只把 prompt 留在输入框里。</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>如果 Angular 应用启用 SSR，请只在浏览器生命周期中创建实例。<code>root</code> 可传入 <code>Document</code>，不能传 <code>ShadowRoot</code>。</p><h4 id="vue" tabindex="-1">Vue <a class="header-anchor" href="#vue" aria-label="Permalink to &quot;Vue&quot;">​</a></h4><p>在 <code>onMounted</code> 中创建，在卸载前 <code>destroy()</code>。Vue Router 的 SPA 导航也建议用 <code>afterEach</code> 或路由监听调用 <code>close()</code>。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { onBeforeUnmount, onMounted } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { useRouter } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue-router&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { createQuickAssist } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla/style.css&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> router</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useRouter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> quickAssist</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> ReturnType</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">typeof</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> createQuickAssist&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> undefined</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> removeAfterEach</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> undefined</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onMounted</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  quickAssist </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ adapter })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  removeAfterEach </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> router.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">afterEach</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> quickAssist?.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">close</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">())</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">onBeforeUnmount</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  removeAfterEach</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">?.()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  quickAssist?.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">destroy</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>在全局布局组件统一创建可覆盖多页面；如果 QuickAssist 只属于某个视图，则在该视图的挂载/卸载边界创建和销毁。</p><h3 id="主题配置" tabindex="-1">主题配置 <a class="header-anchor" href="#主题配置" aria-label="Permalink to &quot;主题配置&quot;">​</a></h3><p>独立入口内置亮暗配色，默认跟随 <code>html[data-tr-color-mode]</code>，识别 <code>light</code>、<code>dark</code>，属性缺失或无效时使用亮色。已有 TinyRobot <code>ThemeProvider</code> 默认无需额外配置。</p><p>其他系统只需在应用初始化时指定主题来源，无需向组件传入 <code>theme</code>：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { configureVanillaTheme } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configureVanillaTheme</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  source: { type: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;attribute&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, attribute: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;data-cf-theme&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p><code>source</code> 支持以下配置，来源元素须在调用时存在：</p><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>type</code></td><td><code>&#39;attribute&#39; | &#39;class&#39;</code></td><td>必填</td><td>按属性值或 class 判断主题；省略整个 <code>source</code> 时默认使用属性来源</td></tr><tr><td><code>selector</code></td><td><code>string</code></td><td><code>&#39;html&#39;</code></td><td>主题来源元素的 CSS 选择器，取首个匹配元素</td></tr><tr><td><code>attribute</code></td><td><code>string</code></td><td><code>&#39;data-tr-color-mode&#39;</code></td><td>仅 <code>attribute</code> 类型：监听的属性名</td></tr><tr><td><code>values.light</code></td><td><code>string</code></td><td><code>&#39;light&#39;</code></td><td>仅 <code>attribute</code> 类型：亮色对应的属性值</td></tr><tr><td><code>values.dark</code></td><td><code>string</code></td><td><code>&#39;dark&#39;</code></td><td>仅 <code>attribute</code> 类型：暗色对应的属性值</td></tr><tr><td><code>darkClass</code></td><td><code>string</code></td><td><code>&#39;dark&#39;</code></td><td>仅 <code>class</code> 类型：暗色 class 名，按完整 token 匹配</td></tr><tr><td><code>lightClass</code></td><td><code>string</code></td><td>—</td><td>仅 <code>class</code> 类型：可选亮色 class 名；亮暗同时存在时暗色优先</td></tr><tr><td><code>defaultMode</code></td><td><code>&#39;light&#39; | &#39;dark&#39;</code></td><td><code>&#39;light&#39;</code></td><td>属性值未知、class 均未匹配或来源元素被移除时的回退模式</td></tr></tbody></table>`,14)),E("div",U,[o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"主题切换",description:"切换亮色、暗色或跟随系统，再选中文字查看入口和浮层；本示例使用独立文档，不影响其他示例。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[12]||(s[12]=()=>{t.value=!1}),htmlCode:n(L)},null,8,["htmlCode"])]),_:1})]),s[28]||(s[28]=h(`<p>也可以跟随 class，或直接指定颜色模式：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configureVanillaTheme</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ source: { type: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;class&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } }) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 跟随 html.dark，否则亮色</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configureVanillaTheme</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ colorMode: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;dark&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 固定暗色，也支持 light</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configureVanillaTheme</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ colorMode: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;auto&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 跟随操作系统</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configureVanillaTheme</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({}) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 恢复默认 TinyRobot 主题来源</span></span></code></pre></div><p>配置按 <code>Document</code> 共享，对已有及后续组件生效，主题变化不会清空正在编辑的问题。每次调用与内置默认值合并，不累积上次配置；<code>source</code> 与 <code>colorMode</code> 不能同时设置。</p><p>CDN 方式使用相同 API，脚本加载完成后调用即可：</p><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">TinyRobotVanilla.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configureVanillaTheme</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  source: { type: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;attribute&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, attribute: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;data-cf-theme&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>配色优先级为：<strong>组件变量覆盖 → 宿主 <code>--tr-*</code> 变量 → 内置配色</strong>。如果加载了 TinyRobot 全量样式，需同步其颜色模式；只使用组件自带配色时，加载 Vanilla CSS 即可（CDN 方式自动注入）。</p><p>浮层挂载在 <code>body</code> 下，局部主题来源只同步亮暗状态，不会复制局部品牌变量。自定义变量应放在 <code>html</code>、<code>body</code> 或组件根节点的全局样式中。iframe 需通过 <code>configureVanillaTheme(config, iframeDocument)</code> 配置其自身文档。</p><h2 id="交互与限制" tabindex="-1">交互与限制 <a class="header-anchor" href="#交互与限制" aria-label="Permalink to &quot;交互与限制&quot;">​</a></h2><ul><li>划词默认仅正向触发；入口默认出现在选区末行右下方，空间不足时会翻转或调整位置；打开输入浮层后仍会跟随入口对应的首末行位置。</li><li>点击入口后输入框立即打开并聚焦，默认填入选中文字；按 Enter 发送，按 Shift+Enter 换行，输入法组合期间不会误发。</li><li>等待业务上下文构造或脱敏时，仍可编辑输入，但暂时不能提交；脱敏完成前不会调用推荐函数。</li><li>点击推荐项或手动发送后，组件先关闭划词界面，再调用 <code>adapter</code>。</li><li>新选区会替换旧会话。点击外部、按 Esc、锚点失效、显著滚动、路由变化或调用生命周期方法时，会清理当前界面。</li><li>浏览器的 <code>popstate</code> 和 <code>hashchange</code> 会自动关闭界面；其他单页应用导航应由路由钩子调用 <code>close()</code>。</li></ul><div class="tip custom-block"><p class="custom-block-title">功能边界</p><p>输入浮层不显示 AI 答案，也不提供流式渲染、重试、多轮对话或模型管理；这些仍由应用已有的 AI 面板负责。</p></div><h2 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h2><table tabindex="0"><thead><tr><th>属性名</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>root</code></td><td><code>Document</code></td><td><code>document</code></td><td>所在文档；不接受 <code>ShadowRoot</code></td></tr><tr><td><code>enabled</code></td><td><code>boolean</code></td><td><code>true</code></td><td>是否启用划词监听</td></tr><tr><td><code>adapter</code></td><td><code>AIAdapter</code></td><td>—</td><td>必填；由 <code>submit(request)</code> 交给应用已有的对话能力</td></tr><tr><td><code>include</code></td><td><code>string[]</code></td><td>—</td><td>限定可触发的页面区域</td></tr><tr><td><code>exclude</code></td><td><code>string[]</code></td><td>—</td><td>在内置排除规则上追加页面区域</td></tr><tr><td><code>selection.maxTextLength</code></td><td><code>number</code></td><td><code>300</code></td><td>可选文字的最大长度，必须为正整数</td></tr><tr><td><code>selection.forwardOnly</code></td><td><code>boolean</code></td><td><code>true</code></td><td>仅正向选词触发；设为 false 允许双向选择</td></tr><tr><td><code>selection.validateActivation</code></td><td><code>(view: QuickAssistActivationView) =&gt; boolean</code></td><td>默认文本规则</td><td>仅自定义激活的文本校验，不接收 DOM Range</td></tr><tr><td><code>selection.validate</code></td><td><code>(snapshot) =&gt; boolean</code></td><td>内置校验</td><td>替代默认的文本内容校验</td></tr><tr><td><code>trigger.label</code></td><td><code>string</code></td><td><code>智能帮助</code></td><td>划词入口文案</td></tr><tr><td><code>trigger.showDelay</code></td><td><code>number</code></td><td><code>0</code></td><td>选区稳定后延迟显示入口，单位为毫秒，须为非负整数</td></tr><tr><td><code>trigger.offset</code></td><td><code>number</code></td><td><code>8</code></td><td>入口及输入浮层与选区的间距，单位为像素</td></tr><tr><td><code>trigger.placement</code></td><td><code>&#39;auto&#39; | &#39;top&#39; | &#39;bottom&#39; | &#39;top-start&#39; | &#39;top-end&#39; | &#39;bottom-start&#39; | &#39;bottom-end&#39;</code></td><td><code>&#39;bottom-end&#39;</code></td><td>入口及输入浮层的优先位置；上方按首行、下方按末行，空间不足时调整</td></tr><tr><td><code>nearbyContext.maxLength</code></td><td><code>number</code></td><td><code>500</code></td><td>附近文本的最大字符数</td></tr><tr><td><code>nearbyContext.blockSelectors</code></td><td><code>string[]</code></td><td>内置选择器</td><td>在默认语义块之外增加候选块</td></tr><tr><td><code>getNearbyContext</code></td><td><code>(snapshot) =&gt; string | undefined</code></td><td>—</td><td>自定义附近文本；<code>snapshot</code> 含 DOM <code>Range</code></td></tr><tr><td><code>getContext</code></td><td><code>(context, signal) =&gt; Record | Promise&lt;Record&gt;</code></td><td>—</td><td>返回业务字段，合并到 <code>businessContext</code></td></tr><tr><td><code>sanitizeContext</code></td><td><code>(context, signal) =&gt; QuickAssistContext | Promise&lt;QuickAssistContext&gt;</code></td><td>—</td><td>返回最终允许外发的完整上下文</td></tr><tr><td><code>suggestions</code></td><td><code>QuickAssistSuggestionInput[]</code></td><td>默认推荐</td><td>静态推荐或推荐生成函数</td></tr><tr><td><code>getSuggestions</code></td><td><code>(context, signal) =&gt; Suggestion[] | Promise&lt;Suggestion[]&gt;</code></td><td>—</td><td>使用脱敏后的上下文获取异步推荐</td></tr><tr><td><code>validateSuggestion</code></td><td><code>(suggestion: Suggestion, context: QuickAssistContext) =&gt; boolean</code></td><td>基础格式校验</td><td>可选业务校验，仅过滤远程问题，在合并前执行，见<a href="#远程问题校验-validatesuggestion">远程问题校验</a></td></tr><tr><td><code>mergeSuggestions</code></td><td><code>(base, incoming, context) =&gt; Suggestion[]</code></td><td>静态优先追加</td><td>远程成功返回后同步合并；可整体替换或远程优先；最终按 <code>id</code> 保留首次出现项并受数量上限约束，见<a href="#自定义合并策略-mergesuggestions">自定义合并策略</a></td></tr><tr><td><code>maxSuggestions</code></td><td><code>number</code></td><td><code>3</code></td><td>最多展示的推荐数，必须为正整数</td></tr><tr><td><code>buildPrompt</code></td><td><code>(input) =&gt; string</code></td><td>内置构造</td><td>自定义提交内容</td></tr><tr><td><code>attrs</code></td><td><code>QuickAssistAttrs</code></td><td>—</td><td>为组件内部元素追加安全的 DOM 属性</td></tr><tr><td><code>messages</code></td><td><code>QuickAssistMessages</code></td><td>内置中文文案</td><td>覆盖界面文案和默认推荐的展示文字</td></tr><tr><td><code>onEvent</code></td><td><code>(event) =&gt; void</code></td><td>—</td><td>事件回调；回调异常不会打断组件清理</td></tr></tbody></table><p><code>attrs.suggestion</code> 可以是属性对象，也可以是按推荐项返回属性对象的函数。事件处理器、<code>style</code>、写入 HTML 的属性、<code>value</code>、<code>disabled</code>、<code>type</code>、<code>id</code> 等会被忽略；<code>class</code> 只能追加，不能覆盖组件内部行为。</p><h2 id="methods" tabindex="-1">Methods <a class="header-anchor" href="#methods" aria-label="Permalink to &quot;Methods&quot;">​</a></h2><table tabindex="0"><thead><tr><th>方法名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>activate</code></td><td><code>QuickAssistActivationInput | QuickAssistAnchorShortcut</code></td><td>提供文本和锚点，显示智能帮助入口；详见主动激活示例</td></tr><tr><td><code>registerSource</code></td><td><code>QuickAssistSelectionSource</code></td><td>注册自动来源，返回注销函数，随实例启停联动</td></tr><tr><td><code>enable</code></td><td>—</td><td>启动划词和全局事件监听；重复调用无副作用</td></tr><tr><td><code>disable</code></td><td>—</td><td>关闭当前输入浮层并停止监听；之后可再次调用 <code>enable()</code></td></tr><tr><td><code>close</code></td><td>—</td><td>关闭当前会话，不销毁实例</td></tr><tr><td><code>updateOptions</code></td><td><code>partial: Partial&lt;QuickAssistOptions&gt;</code></td><td>关闭当前会话、废弃旧异步结果并重建配置；顶层浅合并，嵌套对象整体替换</td></tr><tr><td><code>destroy</code></td><td>—</td><td>关闭并释放监听器与 DOM；重复调用无副作用</td></tr></tbody></table><p><code>registerSource()</code> 是已实现的高级接口，用于多个自定义事件源的统一启停、注销和来源级去重；它不会自动读取编辑器选区或生成坐标。上面的按钮、指标和 Monaco 示例直接使用 <code>activate()</code>，无需注册来源。没有多来源管理需求时，不必使用此方法。</p><p><code>root</code> 创建后不可更换；<code>updateOptions({ root: anotherDocument })</code> 会抛出错误，应先销毁旧实例再创建新实例。更新时省略 <code>enabled</code> 会保留实例当前启用/停用状态；显式传入时使用新值。</p><p>例如，原来配置 <code>trigger: { label: &#39;帮助&#39;, offset: 12 }</code>，随后调用 <code>updateOptions({ trigger: { showDelay: 200 } })</code> 会把标签和偏移恢复到默认值。若要保留它们，需要传入完整分组：<code>updateOptions({ trigger: { label: &#39;帮助&#39;, offset: 12, showDelay: 200 } })</code>。<code>selection</code>、<code>nearbyContext</code>、<code>messages</code> 和 <code>attrs</code> 同样遵循整体替换语义。</p><h2 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h2><table tabindex="0"><thead><tr><th>事件名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>selection</code></td><td>—</td><td>接受新的合法选区</td></tr><tr><td><code>trigger_show</code></td><td>—</td><td>展示划词入口</td></tr><tr><td><code>trigger_click</code></td><td>—</td><td>点击入口</td></tr><tr><td><code>popover_show</code></td><td>—</td><td>展示输入浮层</td></tr><tr><td><code>suggestion_click</code></td><td><code>suggestionId</code></td><td>点击推荐项</td></tr><tr><td><code>submit</code></td><td>—</td><td>提交请求；事件不包含选区文字或发送内容</td></tr><tr><td><code>close</code></td><td><code>reason</code></td><td><code>outside</code>、<code>escape</code>、<code>scroll</code>、<code>anchor-invalid</code>、<code>route</code>、<code>submit</code>、<code>disable</code>、<code>destroy</code>、<code>update</code>、<code>manual</code> 或 <code>reselection</code></td></tr><tr><td><code>error</code></td><td><code>stage</code>、<code>error</code></td><td>异步上下文、推荐、提交内容构造、适配器或配置发生错误</td></tr></tbody></table><p><code>sessionId</code> 是组件实例内的划词会话编号：每次接受新的有效选区时递增，同一次划词从入口显示到关闭的事件使用相同编号，便于关联事件。它不是登录会话、用户 ID 或跨实例持久化的业务标识。配置错误发生在划词前，此时 <code>sessionId</code> 为 <code>0</code>。表中只列出部分事件的其他字段。事件不包含选区原文、<code>query</code>、<code>prompt</code> 或完整上下文；错误对象由应用按自己的日志规则处理。</p><h2 id="css-变量" tabindex="-1">CSS 变量 <a class="header-anchor" href="#css-变量" aria-label="Permalink to &quot;CSS 变量&quot;">​</a></h2><p>QuickAssist 组件支持以下 CSS 变量来自定义样式，可在 <code>.tr-quick-assist</code> 上覆盖。部分默认值使用 TinyRobot 主题变量，未提供主题变量时使用 <code>var()</code> 中的回退值。</p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th><th>默认值</th></tr></thead><tbody><tr><td><code>--tr-quick-assist-bg</code></td><td>入口、输入浮层及按钮的基础背景色</td><td><code>var(--tr-container-bg-default, #fff)</code></td></tr><tr><td><code>--tr-quick-assist-bg-subtle</code></td><td>入口悬停时背景色</td><td><code>var(--tr-container-bg-default-2, #fafafa)</code></td></tr><tr><td><code>--tr-quick-assist-text</code></td><td>主要文字及发送按钮颜色</td><td><code>var(--tr-text-primary, #191919)</code></td></tr><tr><td><code>--tr-quick-assist-muted</code></td><td>输入框占位文字及状态提示文字颜色</td><td><code>var(--tr-text-secondary, #595959)</code></td></tr><tr><td><code>--tr-quick-assist-border</code></td><td>边框及滚动条颜色</td><td><code>#e6e6e6</code></td></tr><tr><td><code>--tr-quick-assist-border-hover</code></td><td>弹窗及按钮悬停时的边框颜色</td><td><code>color-mix(in srgb, var(--tr-quick-assist-bg) 65%, var(--tr-quick-assist-muted))</code></td></tr><tr><td><code>--tr-quick-assist-accent</code></td><td>发送按钮悬停及键盘聚焦时的强调色</td><td><code>var(--tr-text-primary, #191919)</code></td></tr><tr><td><code>--tr-quick-assist-icon-gradient-start</code></td><td>星光图标渐变起始色（左上）</td><td><code>#7d00ff</code></td></tr><tr><td><code>--tr-quick-assist-icon-gradient-middle</code></td><td>星光图标渐变中间色</td><td><code>#b927ff</code></td></tr><tr><td><code>--tr-quick-assist-icon-gradient-end</code></td><td>星光图标渐变结束色（右下）</td><td><code>#ff6bb5</code></td></tr><tr><td><code>--tr-quick-assist-radius</code></td><td>输入浮层圆角</td><td><code>16px</code></td></tr><tr><td><code>--tr-quick-assist-pill-radius</code></td><td>入口、输入区及推荐问题按钮圆角</td><td><code>var(--tr-radius-full, 9999px)</code></td></tr><tr><td><code>--tr-quick-assist-shadow</code></td><td>入口及输入浮层阴影</td><td><code>0 2px 8px 0 rgba(0, 0, 0, 0.16)</code></td></tr><tr><td><code>--tr-quick-assist-z-index</code></td><td>组件层级</td><td><code>var(--tr-z-index-popover, 1500)</code></td></tr></tbody></table>`,24))])}}});export{H as __pageData,K as default};
