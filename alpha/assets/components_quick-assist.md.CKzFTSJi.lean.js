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
`,G="/tiny-robot/alpha/assets/vanilla.global.C0LLowbR.js",U={class:"qa-theme-demo"},H=JSON.parse('{"title":"QuickAssist 智能帮助","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/quick-assist.md","filePath":"components/quick-assist.md"}'),$={name:"components/quick-assist.md"},K=Object.assign($,{setup(z){const m=g();c(async()=>{m.value=(await k(async()=>{const{default:a}=await import("./chunks/lifecycle.DNVNV6Fr.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const v=g();c(async()=>{v.value=(await k(async()=>{const{default:a}=await import("./chunks/monaco.WbtuP6vb.js");return{default:a}},__vite__mapDeps([3,2,1]))).default});const b=g();c(async()=>{b.value=(await k(async()=>{const{default:a}=await import("./chunks/activation.CTIQHTqW.js");return{default:a}},__vite__mapDeps([4,2,1]))).default});const f=g();c(async()=>{f.value=(await k(async()=>{const{default:a}=await import("./chunks/selection-scope.CBWMoQB8.js");return{default:a}},__vite__mapDeps([5,1,2]))).default});const F=g();c(async()=>{F.value=(await k(async()=>{const{default:a}=await import("./chunks/context.hG45-5ey.js");return{default:a}},__vite__mapDeps([6,1,2]))).default});const x=g();c(async()=>{x.value=(await k(async()=>{const{default:a}=await import("./chunks/suggestion-validation.Bbp_95pf.js");return{default:a}},__vite__mapDeps([7,2,1]))).default});const A=g();c(async()=>{A.value=(await k(async()=>{const{default:a}=await import("./chunks/remote-recommendations.BqLxRdYG.js");return{default:a}},__vite__mapDeps([8,2,1]))).default});const C=g();c(async()=>{C.value=(await k(async()=>{const{default:a}=await import("./chunks/recommendations.CbB7l5mA.js");return{default:a}},__vite__mapDeps([9,1,2]))).default});const q=g();c(async()=>{q.value=(await k(async()=>{const{default:a}=await import("./chunks/direction-placement.DdkT5dq_.js");return{default:a}},__vite__mapDeps([10,2,1]))).default});const _=g();c(async()=>{_.value=(await k(async()=>{const{default:a}=await import("./chunks/trigger-delay.D74aTNHL.js");return{default:a}},__vite__mapDeps([11,1,2]))).default});const t=S(!0),B=g();return c(async()=>{B.value=(await k(async()=>{const{default:a}=await import("./chunks/vue-chat.DEl2cDmz.js");return{default:a}},__vite__mapDeps([12,13,2,1]))).default}),typeof window<"u"&&(window.__tinyRobotVanillaDemoGlobalUrl=G),(a,s)=>{const l=D("ClientOnly");return w(),T("div",null,[s[13]||(s[13]=h("",19)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"Vue 对话面板接入",description:"划词后打开 TinyRobot 对话面板，并自动提交 prompt 与脱敏上下文。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[0]||(s[0]=()=>{t.value=!1}),vueCode:n(O)},u({_:2},[B.value?{name:"vue",fn:e(()=>[i(n(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[14]||(s[14]=E("h3",{id:"html-接入",tabindex:"-1"},[y("HTML 接入 "),E("a",{class:"header-anchor",href:"#html-接入","aria-label":'Permalink to "HTML 接入"'},"​")],-1)),s[15]||(s[15]=E("p",null,"下面的 HTML 示例把请求对象安全地显示在模拟对话面板中，不连接实际模型服务。",-1)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"HTML 接入",description:"划词后查看提交给应用的请求内容。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[1]||(s[1]=()=>{t.value=!1}),htmlCode:n(j)},null,8,["htmlCode"])]),_:1}),s[16]||(s[16]=E("h3",{id:"延迟显示入口",tabindex:"-1"},[y("延迟显示入口 "),E("a",{class:"header-anchor",href:"#延迟显示入口","aria-label":'Permalink to "延迟显示入口"'},"​")],-1)),s[17]||(s[17]=E("p",null,[y("设置 "),E("code",null,"trigger.showDelay"),y(" 可在选区稳定后延迟显示划词入口，单位为毫秒；默认 "),E("code",null,"0"),y("，保持立即显示。连续拖选时从最后一次有效选区重新计时，并等待鼠标松开；选区失效、关闭、停用或销毁时会取消待显示的入口。延迟只影响入口，不影响点击后打开输入浮层。")],-1)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"延迟显示划词入口",description:"切换立即显示与延迟 300 毫秒，对比划词体验。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[2]||(s[2]=()=>{t.value=!1}),vueCode:n(X)},u({_:2},[_.value?{name:"vue",fn:e(()=>[i(n(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[18]||(s[18]=h("",5)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"划词方向与首末行定位",description:"切换方向限制和入口位置，跨行选中文字观察入口对齐。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[3]||(s[3]=()=>{t.value=!1}),vueCode:n(N)},u({_:2},[q.value?{name:"vue",fn:e(()=>[i(n(q))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[19]||(s[19]=h("",3)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"静态与异步推荐",description:"查看推荐加载、合并和点击后直接提交的效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[4]||(s[4]=()=>{t.value=!1}),vueCode:n(V)},u({_:2},[C.value?{name:"vue",fn:e(()=>[i(n(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[20]||(s[20]=h("",6)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"远程推荐与覆盖策略",description:"切换策略和响应后重新划词，观察加载期间的静态问题及远程返回后的结果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[5]||(s[5]=()=>{t.value=!1}),vueCode:n(Z)},u({_:2},[A.value?{name:"vue",fn:e(()=>[i(n(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[21]||(s[21]=h("",12)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"远程问题校验前后对比",description:"对比原始问题与最终问题，查看空白、超长、不相关问题的过滤原因，以及全部无效时的静态回退。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[6]||(s[6]=()=>{t.value=!1}),vueCode:n(P)},u({_:2},[x.value?{name:"vue",fn:e(()=>[i(n(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[22]||(s[22]=h("",5)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"上下文与脱敏",description:"选中文字并提交，查看允许交给应用的上下文。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[7]||(s[7]=()=>{t.value=!1}),vueCode:n(Q)},u({_:2},[F.value?{name:"vue",fn:e(()=>[i(n(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[23]||(s[23]=h("",9)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"可选择区域与长度限制",description:"仅指定区域和有效长度的选区会显示划词入口。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[8]||(s[8]=()=>{t.value=!1}),vueCode:n(M)},u({_:2},[f.value?{name:"vue",fn:e(()=>[i(n(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[24]||(s[24]=h("",7)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"主动激活与自定义定位",description:"点击与悬停触发，切换直接输入，并对比实例默认推荐和本次专属推荐。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[9]||(s[9]=()=>{t.value=!1}),vueCode:n(W)},u({_:2},[b.value?{name:"vue",fn:e(()=>[i(n(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[25]||(s[25]=h("",17)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"Monaco 主动选区解释",description:"选词完成后自动调用通用 API，不依赖编辑器桥接器。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[10]||(s[10]=()=>{t.value=!1}),vueCode:n(R)},u({_:2},[v.value?{name:"vue",fn:e(()=>[i(n(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[26]||(s[26]=h("",5)),o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"启停与关闭会话",description:"通过按钮控制划词功能，并模拟页面切换。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[11]||(s[11]=()=>{t.value=!1}),vueCode:n(I)},u({_:2},[m.value?{name:"vue",fn:e(()=>[i(n(m))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[27]||(s[27]=h("",14)),E("div",U,[o(i(n(p),null,null,512),[[d,t.value]]),i(l,null,{default:e(()=>[i(n(r),{title:"主题切换",description:"切换亮色、暗色或跟随系统，再选中文字查看入口和浮层；本示例使用独立文档，不影响其他示例。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:s[12]||(s[12]=()=>{t.value=!1}),htmlCode:n(L)},null,8,["htmlCode"])]),_:1})]),s[28]||(s[28]=h("",24))])}}});export{H as __pageData,K as default};
