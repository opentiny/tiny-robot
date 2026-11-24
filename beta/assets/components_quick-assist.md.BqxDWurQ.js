const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/events.Ciztql6R.js","assets/chunks/framework.BbEZp8Li.js","assets/chunks/style.aApEKVpH.js","assets/chunks/lifecycle.BGB5oNFO.js","assets/chunks/monaco.BNyzlquN.js","assets/chunks/activation.BNFcr8ZC.js","assets/chunks/build-prompt.BSvf0xl0.js","assets/chunks/context.0SAKlpbv.js","assets/chunks/suggestion-validation.BsQp3Vjj.js","assets/chunks/remote-recommendations.DekbnNhO.js","assets/chunks/recommendations.D0bkbW5Z.js","assets/chunks/input.DrsasVMz.js","assets/chunks/trigger-delay.N79RSKXy.js","assets/chunks/direction-placement.Db8U5oE-.js","assets/chunks/selection-scope.BceQtZlG.js","assets/chunks/vue-chat.DimnNtKC.js","assets/chunks/theme.Dr0TxOS0.js","assets/chunks/basic.5a8U7SVZ.js"])))=>i.map(i=>d[i]);
import{aD as h,bQ as k,aZ as R,aL as Q,v as I,H as c,bL as d,bB as l,J as t,bk as s,bJ as i,G as u,w as y,I as m,b7 as g,aU as L}from"./chunks/framework.BbEZp8Li.js";import{L as r,N as p}from"./chunks/index.CeN9MIXy.js";const M="/tiny-robot/beta/images/quick-assist-flow.svg",W=`<!doctype html>
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
        // === 1. 文档站预览适配：如独立项目已通过 <script src=".../vanilla.global.js"> 引入，可整体删除本段 ===
        // 文档的 HTML 预览会复制宿主样式；移除副本以展示组件自带的配色。
        document.querySelectorAll('style[replace="true"], link[as="style"]').forEach((element) => element.remove())
        if (!window.TinyRobotVanilla) {
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
            script.onerror = () => reject(new Error('组件加载失败，请先引入 vanilla.global.js 或构建 TinyRobot'))
            document.head.append(script)
          })
        }

        // === 2. 主题配置与 QuickAssist 接入代码 ===
        const root = document.documentElement
        const select = document.querySelector('#theme-mode')
        const status = document.querySelector('#theme-status')
        const system = window.matchMedia('(prefers-color-scheme: dark)')
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
`,P=`<template>
  <div class="qa-events-demo">
    <div class="qa-events-demo__controls">
      <label><input v-model="failSubmit" type="checkbox" /> 模拟提交失败</label>
      <button type="button" @click="logs = []">清空日志</button>
    </div>
    <p id="qa-events-text">云服务器支持按需计费。选中这段文字，点击智能帮助，再点击推荐问题或手动发送。</p>
    <p class="qa-events-demo__hint">按 Esc 可观察关闭事件；勾选“模拟提交失败”后提交，可观察 adapter 错误事件。</p>
    <p class="qa-events-demo__status" role="status">{{ status }}</p>
    <div class="qa-events-demo__log" role="region" aria-label="事件日志" tabindex="0" data-ai-selection="false">
      <table v-if="logs.length">
        <thead>
          <tr>
            <th>序号</th>
            <th>sessionId</th>
            <th>事件</th>
            <th>附加字段</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in logs" :key="entry.id">
            <td>{{ entry.id }}</td>
            <td>{{ entry.sessionId }}</td>
            <td>
              <code>{{ entry.type }}</code>
            </td>
            <td>{{ entry.detail || '—' }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else>暂无事件，请选中上方文字开始操作。</p>
    </div>
    <p class="qa-events-demo__hint">按发生顺序保留最近 40 条事件，仅显示事件元数据，不记录选区或发送内容。</p>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import type { QuickAssistEvent, QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'

const failSubmit = ref(false)
const status = ref('等待划词操作。')
const logs = ref<Array<{ id: number; sessionId: number; type: QuickAssistEvent['type']; detail: string }>>([])
let nextId = 0
let quickAssist: QuickAssistInstance | undefined

function onEvent(event: QuickAssistEvent) {
  let detail = ''
  if (event.type === 'suggestion_click') detail = \`suggestionId: \${event.suggestionId}\`
  if (event.type === 'close') detail = \`reason: \${event.reason}\`
  // 本例只展示自己构造的模拟错误；业务中应按应用的日志规则处理错误对象。
  if (event.type === 'error') detail = \`stage: \${event.stage}; error: \${event.error.message}\`
  logs.value = [...logs.value, { id: ++nextId, sessionId: event.sessionId, type: event.type, detail }].slice(-40)
  status.value = \`最近事件：\${event.type}，会话 \${event.sessionId}\${detail ? \`，\${detail}\` : ''}\`
}

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['#qa-events-text'],
    onEvent,
    adapter: {
      async submit() {
        if (failSubmit.value) throw new Error('模拟提交失败')
        // 接入应用时，在此发送 request.prompt 与 request.context。
      },
    },
  })
})

onBeforeUnmount(() => quickAssist?.destroy())
<\/script>

<style scoped>
.qa-events-demo {
  padding: 18px;
  border: 1px solid var(--vp-c-divider, #dfe3e8);
  border-radius: 10px;
  background: var(--vp-c-bg, #fff);
  color: var(--vp-c-text-1, #213547);
  line-height: 1.7;
}
.qa-events-demo__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.qa-events-demo__controls label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
input {
  appearance: auto;
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
button:hover {
  border-color: var(--vp-c-brand-1, #2175c4);
}
button:focus-visible,
input:focus-visible,
.qa-events-demo__log:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #2175c4);
  outline-offset: 2px;
}
#qa-events-text {
  padding: 14px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft, #f5f7fa);
}
.qa-events-demo__hint,
.qa-events-demo__status {
  color: var(--vp-c-text-2, #536171);
  font-size: 13px;
}
.qa-events-demo__log {
  max-height: 300px;
  overflow: auto;
}
.qa-events-demo__log table {
  min-width: 500px;
  margin: 0;
  font-size: 13px;
}
.qa-events-demo__log th,
.qa-events-demo__log td:nth-child(-n + 3) {
  white-space: nowrap;
}
.qa-events-demo__log td {
  overflow-wrap: anywhere;
}
</style>
`,Z=`<template>
  <div class="qa-feature-demo">
    <div class="qa-feature-demo__controls">
      <button type="button" :aria-pressed="isEnabled" @click="enable">启用划词</button>
      <button type="button" :aria-pressed="!isEnabled" @click="disable">停用划词</button>
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

const isEnabled = ref(true)
const status = ref('划词已启用')
let quickAssist: QuickAssistInstance | undefined

function enable() {
  quickAssist?.enable()
  isEnabled.value = true
  status.value = '划词已启用，可以重新选中文字'
}

function disable() {
  quickAssist?.disable()
  isEnabled.value = false
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
button[aria-pressed='true'] {
  border-color: var(--vp-c-brand-1, #2175c4);
  background: var(--vp-c-brand-soft, #e8f2ff);
}
button:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #2175c4);
  outline-offset: 2px;
}
</style>
`,V=`<template>
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

  // 选词完成后由应用代码调用通用 activate() API 接入。
  quickAssist?.activate({
    source: 'monaco',
    autoFill: false, // 本次不预填代码，保留上下文，不修改实例默认设置。
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
    // 挂载后加载核心与语法着色；文档由 Vite 打包，Playground 通过 import map 加载。
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
`,N=`<template>
  <section id="qa-manual-activation" class="qa-activation-demo">
    <div class="qa-activation-demo__settings">
      <label class="qa-activation-demo__setting">
        <input v-model="directOpen" type="checkbox" @change="closeCurrent" />
        点击时直接显示输入框（跳过“智能帮助”按钮）
      </label>
      <label class="qa-activation-demo__setting">
        <input v-model="hoverTrigger" type="checkbox" @change="closeCurrent" />
        悬停指标时自动显示入口
      </label>
    </div>
    <div class="qa-activation-demo__example">
      <h4>按钮作为锚点</h4>
      <p>点击按钮解释指定术语，使用实例的默认推荐；上方开关控制是否直接显示输入框。</p>
      <button type="button" @click="activateButton">解释“按需计费”</button>
    </div>
    <div class="qa-activation-demo__example">
      <h4>点击指标，自定义内容与推荐</h4>
      <p>
        默认点击指标卡片按数值定位并提供专属推荐；勾选“悬停指标时自动显示入口”后，也可悬停先显示入口，避免浏览页面时误抢焦点。
      </p>
      <div class="qa-activation-demo__metrics">
        <button
          v-for="metric in metrics"
          :key="metric.id"
          type="button"
          class="qa-activation-demo__metric"
          :aria-pressed="selectedMetric === metric.id"
          @pointerenter="activateMetric($event, metric)"
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
const hoverTrigger = ref(false)
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
  const isHover = event.type === 'pointerenter'
  if (isHover && (!hoverTrigger.value || (event as PointerEvent).pointerType === 'touch')) return
  // 当前指标会话仍活跃或正在切换激活时不重复触发悬停；关闭后会清空 selectedMetric，再次进入可重新唤起。
  if (isHover && (switchingActivation || selectedMetric.value === metric.id)) return
  const button = event.currentTarget as HTMLButtonElement
  const value = button.querySelector<HTMLElement>('[data-metric-value]')!
  selectedMetric.value = metric.id
  lastRequest.value = undefined
  activate({
    source: 'dashboard',
    // 悬停时仅展示入口，避免在浏览页面时突然抢占输入焦点。
    open: isHover ? 'trigger' : directOpen.value ? 'popover' : 'trigger',
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
    // 此 Demo 只演示 API 激活；selection.validate 仅作用于原生 DOM 划词。
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
    onEvent: (event) => {
      if (event.type === 'close' && !switchingActivation) {
        selectedMetric.value = ''
      }
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
.qa-activation-demo__settings {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
  margin-bottom: 20px;
}
.qa-activation-demo__setting {
  display: inline-flex;
  align-items: center;
  gap: 8px;
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
`,X=`<template>
  <div class="qa-feature-demo">
    <div id="qa-build-prompt-text" class="qa-feature-demo__text">
      <p>云服务器支持多种<span id="qa-build-prompt-term">计费模式</span>，可根据业务负载选择包年包月或按需计费。</p>
    </div>
    <p class="qa-feature-demo__hint">
      选中“计费模式”后打开智能帮助：输入“如何选择？”并发送，或直接点击“解释
      计费模式”。两种方式都会补充选中内容和业务上下文。
    </p>
    <div v-if="submitted" class="qa-prompt-result" aria-live="polite">
      <p>发送方式：{{ submitted.suggestion ? '点击推荐项' : '手动输入' }}</p>
      <dl>
        <div>
          <dt>query · 展示的问题</dt>
          <dd>
            <pre class="qa-prompt-result__value">{{ submitted.query }}</pre>
          </dd>
        </div>
        <div>
          <dt>prompt · 最终发送内容</dt>
          <dd>
            <pre class="qa-prompt-result__value">{{ submitted.prompt }}</pre>
          </dd>
        </div>
        <div>
          <dt>context.text · 选中内容</dt>
          <dd>
            <pre class="qa-prompt-result__value">{{ submitted.context.text }}</pre>
          </dd>
        </div>
      </dl>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
import type { AIRequest, QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'

const submitted = ref<AIRequest>()
let quickAssist: QuickAssistInstance | undefined

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['#qa-build-prompt-text'],
    getContext: () => ({ product: '云服务器', scenario: '生产环境' }),
    suggestions: [
      {
        id: 'explain',
        getLabel: (context) => \`解释 \${context.text}\`,
        getPrompt: (context) => \`请解释“\${context.text}”的含义，并比较常见选项。\`,
      },
    ],
    // 两种发送入口共用此钩子；query 保留展示文案，只加工最终 prompt。
    buildPrompt: ({ query, context, suggestion }) => {
      const question = suggestion?.prompt ?? query
      return [
        \`产品：\${context.businessContext?.product}\`,
        \`业务场景：\${context.businessContext?.scenario}\`,
        \`参考内容：\${context.text}\`,
        \`用户问题：\${question}\`,
      ].join('\\n\\n')
    },
    adapter: {
      submit(request) {
        // 实际接入时用 query 展示用户问题，用 prompt 调用模型。
        submitted.value = request
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
.qa-prompt-result dl {
  display: grid;
  gap: 16px;
  margin: 0;
}
.qa-prompt-result dt {
  margin: 0;
  font-weight: 600;
}
.qa-prompt-result dd {
  margin: 6px 0 0;
}
.qa-prompt-result__value {
  margin: 0;
  padding: 12px 14px;
  border: 1px solid var(--vp-c-divider, #dfe3e8);
  border-radius: 8px;
  background: var(--vp-c-bg-soft, #f5f7fa);
  color: var(--vp-c-text-1, #213547);
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  overflow: visible;
}
</style>
`,O=`<template>
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
    // 用户手动输入或开启 input.autoFill 预填的内容可能含敏感信息，发送前仍需对最终 prompt 脱敏。
    buildPrompt: ({ query, suggestion }) => redactTenant(suggestion?.prompt ?? query),
    adapter: {
      submit(request) {
        submitted.value = JSON.stringify({ prompt: request.prompt, context: request.context }, null, 2)
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
`,j=`<template>
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
    <p id="qa-validation-scope" class="qa-validation-demo__text">
      请选中本段中的任意词语（例如
      <strong id="qa-validation-text">竞价计费</strong>）并打开智能帮助，观察校验前后的问题变化。
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
    include: ['#qa-validation-scope'],
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
      displayed.value = valid.slice(0, 2)
      finished.value = true
      status.value = \`远程返回 \${incoming.value.length} 条，保留 \${valid.length} 条，过滤 \${incoming.value.length - valid.length} 条，最多展示 2 条。\`
      return valid
    },
    maxSuggestions: 2,
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
          {
            query: request.query,
            prompt: request.prompt,
            suggestion: request.suggestion?.label ?? null,
          },
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
`,G=`<template>
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
  // 切换演示策略时重建实例以重置本地演示状态；实际业务也可通过 updateOptions 显式传入 undefined 清除可选字段。
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
    maxSuggestions: mode === 'remote-first' ? 3 : 2,
    onEvent(event) {
      if (event.type === 'error' && event.stage === 'suggestions') {
        status.value = '远程请求失败，已有静态问题会保留，仍可手动输入提交。'
      }
      if (event.type === 'close') status.value = '会话已关闭，可重新选择文字。'
    },
    adapter: {
      submit(request) {
        submitted.value = JSON.stringify(
          {
            query: request.query,
            prompt: request.prompt,
            suggestion: request.suggestion?.label ?? null,
          },
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
`,z=`<template>
  <div class="qa-feature-demo">
    <div id="qa-recommendations-text" class="qa-feature-demo__text">
      <p>包年包月适合长期稳定的工作负载，按需计费适合短期或波动较大的任务。</p>
      <p>选中一种计费方式，打开智能帮助，观察推荐问题按默认最多两条合并异步内容。</p>
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
    suggestions: [{ id: 'explain', label: '解释这个概念', prompt: '请解释选中的计费方式' }],
    getSuggestions: async (context, signal) => {
      await new Promise((resolve) => setTimeout(resolve, 700))
      if (signal.aborted) return []
      return [{ id: 'risk', label: '查看注意事项', prompt: \`请说明“\${context.text}”的注意事项\` }]
    },
    adapter: {
      submit(request) {
        submitted.value = JSON.stringify(
          {
            query: request.query,
            prompt: request.prompt,
            suggestion: request.suggestion?.label ?? null,
          },
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
`,U=`<template>
  <section class="qa-input-demo">
    <fieldset class="qa-input-demo__settings">
      <legend>实例配置</legend>
      <div class="qa-input-demo__controls">
        <label>最大显示行数 <input v-model.number="maxRows" type="number" min="1" max="6" @change="configure" /></label>
        <label><input v-model="limited" type="checkbox" @change="configure" />限制为 50 个字符</label>
        <label><input v-model="autoFill" type="checkbox" @change="configure" />预填选中文字</label>
      </div>
    </fieldset>
    <section class="qa-input-demo__group">
      <h4>划词体验</h4>
      <p id="qa-input-demo-selection" class="qa-input-demo__selection">{{ selectionText }}</p>
      <p class="qa-input-demo__hint">
        勾选“限制为 50 个字符”和“预填选中文字”，再从左向右选中整段文字，可观察超限计数和发送禁用效果。
      </p>
    </section>
    <section class="qa-input-demo__group">
      <h4>命令式调用</h4>
      <div class="qa-input-demo__controls">
        <button type="button" @click="open($event)">按实例配置打开</button>
        <button type="button" @click="open($event, true)">本次预填</button>
        <button type="button" @click="open($event, false)">本次留空</button>
      </div>
    </section>
    <aside v-if="request" class="qa-input-demo__result" aria-live="polite">
      <p>已提交：{{ request.query }}</p>
      <p>保留的上下文：{{ request.context.text }}</p>
    </aside>
  </section>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import type { AIRequest, QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'

const maxRows = ref(2)
const limited = ref(false)
const autoFill = ref(false)
const exampleText = '查看系统盘使用率'
const selectionText =
  '云服务器运行一段时间后，系统盘使用率持续升高。请结合日志增长、临时文件、应用缓存和磁盘分区情况，分析空间占用的主要原因，并给出清理顺序、容量扩展建议以及操作前需要确认的事项。'
const request = shallowRef<AIRequest>()
let assist: QuickAssistInstance | undefined

function configure() {
  maxRows.value = Math.max(1, Math.min(6, Math.trunc(Number(maxRows.value)) || 2))
  assist?.updateOptions({
    input: { maxRows: maxRows.value, maxLength: limited.value ? 50 : null, autoFill: autoFill.value },
  })
}

function open(event: MouseEvent, prefill?: boolean) {
  request.value = undefined
  assist?.activate({
    text: exampleText,
    anchor: event.currentTarget as HTMLButtonElement,
    open: 'popover',
    ...(prefill === undefined ? {} : { autoFill: prefill }),
  })
}

onMounted(() => {
  assist = createQuickAssist({
    include: ['#qa-input-demo-selection'],
    input: { maxRows: maxRows.value, maxLength: limited.value ? 50 : null, autoFill: autoFill.value },
    adapter: {
      submit: (value) => {
        request.value = value
      },
    },
  })
})

onBeforeUnmount(() => assist?.destroy())
<\/script>

<style scoped>
.qa-input-demo {
  color: var(--vp-c-text-1, #213547);
  background: var(--vp-c-bg, #fff);
  display: grid;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.qa-input-demo__settings {
  min-width: 0;
  margin: 0;
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.qa-input-demo__settings legend {
  padding: 0 6px;
  font-size: 14px;
  font-weight: 600;
}
.qa-input-demo__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.qa-input-demo__settings label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.qa-input-demo__settings input[type='number'] {
  width: 56px;
}
.qa-input-demo__group h4 {
  margin: 0 0 8px;
  font-size: 14px;
}
.qa-input-demo__selection {
  margin: 0;
  padding: 12px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}
.qa-input-demo__hint {
  margin: 8px 0 0;
  color: var(--vp-c-text-2, #536171);
  font-size: 13px;
  line-height: 1.6;
}
.qa-input-demo button,
.qa-input-demo input[type='number'] {
  padding: 4px 8px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
}
.qa-input-demo__result {
  overflow-wrap: anywhere;
}
</style>
`,$=`<template>
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
`,Y=`<template>
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
`,J=`<template>
  <div class="qa-feature-demo">
    <div id="qa-scope-allowed" class="qa-feature-demo__allowed">
      <p>可选择区域：ECS、VPC 和 QoS 都是有效的短技术词。</p>
      <p>这段文字明显超过本示例设置的二十四字上限，整句选中时入口置灰，同时显示字数提示。</p>
      <p data-qa-ignore>排除区域：即使文字很短，也不会出现智能帮助入口。</p>
    </div>
    <p class="qa-feature-demo__outside">范围外：这里的文字没有包含在生效区域内。</p>
    <p class="qa-feature-demo__hint">分别选择短词、整句和排除区域，对比正常入口、超限提示与排除效果。</p>
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
`,H=`<!doctype html>
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
        --qa-muted: #595959;
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
        --qa-muted: #b3b3b3;
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
        // === 1. 文档站预览适配：如独立项目已通过 <script src=".../vanilla.global.js"> 引入，可整体删除本段 ===
        const previewRoot = document.documentElement
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
          previewRoot.dataset.theme = dark ? 'dark' : 'light'
          // 文档预览会向 iframe 复制 TinyRobot 共享样式，保持其主题属性与自定义主题来源同步。
          previewRoot.dataset.trColorMode = previewRoot.dataset.theme
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

        // 已预先加载 window.TinyRobotVanilla 时直接复用，跳过文档预览回退脚本加载。
        if (!window.TinyRobotVanilla) {
          const localGlobalUrl = new URL('../../../packages/components/dist/vanilla/vanilla.global.js', document.baseURI)
          const script = document.createElement('script')
          script.src = previewGlobalUrl ?? localGlobalUrl.href
          await new Promise((resolve, reject) => {
            script.onload = resolve
            script.onerror = () => reject(new Error('无框架组件脚本加载失败，请先通过 <script> 引入 vanilla.global.js'))
            document.head.appendChild(script)
          })
        }

        // === 2. QuickAssist 核心接入代码 ===
        const output = document.querySelector('#request-output')
        const panel = document.querySelector('#assistant-panel')
        const status = document.querySelector('#event-status')
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
`,K=`<template>
  <div class="qa-demo-container">
    <div class="qa-demo">
      <section class="qa-demo__page" aria-labelledby="qa-page-title">
        <h3 id="qa-page-title">创建云服务器：选择一段文字试试</h3>
        <p>
          计费模式决定了云服务器资源的付费方式。包年包月适合长期、稳定运行的业务，按需计费适合临时或波动的工作负载。
        </p>
        <p>
          竞价计费通过使用闲置计算资源降低成本，但实例可能因资源供需变化而被回收。请结合业务中断容忍度、数据持久性和预算来选择。
        </p>
        <p>
          网络安全组用于控制云服务器的入站和出站访问规则。生产环境中应遵循最小权限原则，只开放业务必需的端口和来源地址。
        </p>
        <p data-sensitive="true">演示敏感区域：tenantId=tenant-demo-4812（此处不应触发 QuickAssist）。</p>
        <p data-ai-selection="false">这个区域通过 data-ai-selection 标记排除。</p>
        <p class="qa-demo__note">本示例将最大划词长度设为 240 字，并脱敏业务上下文中的租户编号。</p>
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
          <pre>{{
            JSON.stringify(
              {
                query: latestRequest.query,
                prompt: latestRequest.prompt,
                context: latestRequest.context,
                suggestion: latestRequest.suggestion,
              },
              null,
              2,
            )
          }}</pre>
        </details>

        <TrSender v-model="draft" mode="multiple" placeholder="也可以在这里输入问题" @submit="handleManualSubmit" />
      </aside>

      <div v-else class="qa-demo__placeholder" aria-label="AI 对话面板占位提示">
        <p class="qa-demo__placeholder-title">AI 对话面板未打开</p>
        <p class="qa-demo__placeholder-desc">
          在示例正文中选中一段文字并提交问题，或点击“打开 AI 对话”按钮，模拟对话面板会在此处展开。
        </p>
      </div>
    </div>
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
.qa-demo-container {
  container-type: inline-size;
}

.qa-demo {
  color: var(--vp-c-text-1, #213547);
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(280px, 360px);
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

@container (max-width: 760px) {
  .qa-demo {
    grid-template-columns: minmax(0, 1.1fr) minmax(240px, 0.9fr);
    gap: 14px;
    padding: 14px;
  }

  .qa-demo__assistant {
    padding: 12px;
  }
}

@container (max-width: 540px) {
  .qa-demo {
    grid-template-columns: 1fr;
    grid-template-rows: minmax(0, 1fr) minmax(0, 2fr);
    height: 860px;
    max-height: 900px;
  }

  .qa-demo__assistant {
    min-height: 0;
  }
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

.qa-demo__note {
  color: var(--vp-c-text-2, #536171);
  font-size: 13px;
}

.qa-demo__placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 24px;
  border: 1px dashed var(--vp-c-divider, #dfe3e8);
  border-radius: 10px;
  background: var(--vp-c-bg-soft, #fafbfc);
  text-align: center;
}

.qa-demo__placeholder-title {
  margin: 0;
  color: var(--vp-c-text-1, #213547);
  font-size: 14px;
  font-weight: 600;
}

.qa-demo__placeholder-desc {
  margin: 0;
  max-width: 26ch;
  color: var(--vp-c-text-2, #536171);
  font-size: 13px;
  line-height: 1.6;
}

.qa-demo__open:hover {
  border-color: var(--vp-c-brand-1, #2175c4);
}
.qa-demo__open:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #2175c4);
  outline-offset: 2px;
}
</style>
`,ee=`<template>
  <div class="qa-basic-demo">
    <div id="qa-basic-text" class="qa-basic-demo__article">
      <p>
        云服务器支持按需计费与包年包月两种常见计费模式。请从左向右选中任意词语（例如“按需计费”），点击“智能帮助”入口，输入问题或直接点击推荐问题即可提交。
      </p>
    </div>

    <div v-if="latestRequest" class="qa-basic-demo__result" aria-live="polite">
      <p class="qa-basic-demo__result-title">已提交给 adapter.submit(request)：</p>
      <pre>{{
        JSON.stringify(
          {
            source: latestRequest.source,
            query: latestRequest.query,
            prompt: latestRequest.prompt,
            context: {
              text: latestRequest.context.text,
              nearbyText: latestRequest.context.nearbyText,
            },
            suggestion: latestRequest.suggestion,
          },
          null,
          2,
        )
      }}</pre>
    </div>
    <p v-else class="qa-basic-demo__hint">请从左向右选中上方文字体验完整流程（默认仅正向划词触发）。</p>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { createQuickAssist } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
import type { AIRequest, QuickAssistInstance } from '@opentiny/tiny-robot/vanilla'

const latestRequest = shallowRef<AIRequest | null>(null)
let quickAssist: QuickAssistInstance | undefined

onMounted(() => {
  quickAssist = createQuickAssist({
    include: ['#qa-basic-text'],
    adapter: {
      submit(request) {
        // 真实项目中在这里打开应用已有的 AI 对话面板，并将 prompt 与 context 一并发送。
        latestRequest.value = request
      },
    },
  })
})

onBeforeUnmount(() => quickAssist?.destroy())
<\/script>

<style scoped>
.qa-basic-demo {
  color: var(--vp-c-text-1, #213547);
  background: var(--vp-c-bg, #fff);
  padding: 18px;
  border: 1px solid var(--vp-c-divider, #dfe3e8);
  border-radius: 10px;
  line-height: 1.7;
}
.qa-basic-demo__article {
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft, #f5f7fa);
}
.qa-basic-demo__article p {
  margin: 0;
}
.qa-basic-demo__hint {
  margin: 12px 0 0;
  color: var(--vp-c-text-2, #536171);
  font-size: 13px;
}
.qa-basic-demo__result {
  margin-top: 14px;
}
.qa-basic-demo__result-title {
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
}
.qa-basic-demo__result pre {
  margin: 0;
  padding: 12px 14px;
  border-radius: 8px;
  background: var(--vp-c-bg-soft, #f5f7fa);
  font-size: 13px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
</style>
`,te="/tiny-robot/beta/assets/vanilla.global.CZ4nztEO.js",se={class:"qa-theme-demo"},de=JSON.parse('{"title":"QuickAssist 智能帮助","description":"","frontmatter":{"outline":[2,3]},"headers":[],"relativePath":"components/quick-assist.md","filePath":"components/quick-assist.md"}'),ne={name:"components/quick-assist.md"},le=Object.assign(ne,{setup(ie){const E=g();h(async()=>{E.value=(await k(async()=>{const{default:a}=await import("./chunks/events.Ciztql6R.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const v=g();h(async()=>{v.value=(await k(async()=>{const{default:a}=await import("./chunks/lifecycle.BGB5oNFO.js");return{default:a}},__vite__mapDeps([3,2,1]))).default});const b=g();h(async()=>{b.value=(await k(async()=>{const{default:a}=await import("./chunks/monaco.BNyzlquN.js");return{default:a}},__vite__mapDeps([4,1,2]))).default});const f=g();h(async()=>{f.value=(await k(async()=>{const{default:a}=await import("./chunks/activation.BNFcr8ZC.js");return{default:a}},__vite__mapDeps([5,1,2]))).default});const x=g();h(async()=>{x.value=(await k(async()=>{const{default:a}=await import("./chunks/build-prompt.BSvf0xl0.js");return{default:a}},__vite__mapDeps([6,2,1]))).default});const F=g();h(async()=>{F.value=(await k(async()=>{const{default:a}=await import("./chunks/context.0SAKlpbv.js");return{default:a}},__vite__mapDeps([7,2,1]))).default});const A=g();h(async()=>{A.value=(await k(async()=>{const{default:a}=await import("./chunks/suggestion-validation.BsQp3Vjj.js");return{default:a}},__vite__mapDeps([8,1,2]))).default});const q=g();h(async()=>{q.value=(await k(async()=>{const{default:a}=await import("./chunks/remote-recommendations.DekbnNhO.js");return{default:a}},__vite__mapDeps([9,1,2]))).default});const _=g();h(async()=>{_.value=(await k(async()=>{const{default:a}=await import("./chunks/recommendations.D0bkbW5Z.js");return{default:a}},__vite__mapDeps([10,2,1]))).default});const C=g();h(async()=>{C.value=(await k(async()=>{const{default:a}=await import("./chunks/input.DrsasVMz.js");return{default:a}},__vite__mapDeps([11,1,2]))).default});const B=g();h(async()=>{B.value=(await k(async()=>{const{default:a}=await import("./chunks/trigger-delay.N79RSKXy.js");return{default:a}},__vite__mapDeps([12,2,1]))).default});const D=g();h(async()=>{D.value=(await k(async()=>{const{default:a}=await import("./chunks/direction-placement.Db8U5oE-.js");return{default:a}},__vite__mapDeps([13,1,2]))).default});const w=g();h(async()=>{w.value=(await k(async()=>{const{default:a}=await import("./chunks/selection-scope.BceQtZlG.js");return{default:a}},__vite__mapDeps([14,2,1]))).default});const T=g();h(async()=>{T.value=(await k(async()=>{const{default:a}=await import("./chunks/vue-chat.DimnNtKC.js");return{default:a}},__vite__mapDeps([15,16,1,2]))).default});const n=L(!0),S=g();return h(async()=>{S.value=(await k(async()=>{const{default:a}=await import("./chunks/basic.5a8U7SVZ.js");return{default:a}},__vite__mapDeps([17,2,1]))).default}),typeof window<"u"&&(window.__tinyRobotVanillaDemoGlobalUrl=te),(a,e)=>{const o=R("ClientOnly");return Q(),I("div",null,[e[17]||(e[17]=c(`<h1 id="quickassist-智能帮助" tabindex="-1">QuickAssist 智能帮助 <a class="header-anchor" href="#quickassist-智能帮助" aria-label="Permalink to &quot;QuickAssist 智能帮助&quot;">​</a></h1><p>QuickAssist 是一个与框架无关的智能帮助组件，用于为页面提供轻量 AI 触发与输入交互。用户选中页面文字（或由应用主动调用 API）后，可查看推荐问题、编辑提问，并将最终问题与有限上下文（配置 <code>sanitizeContext</code> 后为脱敏上下文）交给应用已有的 AI 对话面板。</p><p>快速跳转：<a href="#example-basic">立即体验</a> · <a href="#安装与引入">安装与引入</a> · <a href="#example-chat-panel">接入对话面板</a> · <a href="#api">API 参考</a> · <a href="#常见问题">常见问题</a></p><h2 id="概览" tabindex="-1">概览 <a class="header-anchor" href="#概览" aria-label="Permalink to &quot;概览&quot;">​</a></h2><h3 id="适用场景" tabindex="-1">适用场景 <a class="header-anchor" href="#适用场景" aria-label="Permalink to &quot;适用场景&quot;">​</a></h3><ul><li>控制台、文档页、详情页等场景，希望用户划词后直接针对所选概念向 AI 提问；</li><li>指标卡片、工具按钮、代码编辑器等场景，希望由应用代码主动触发轻量提问入口；</li><li>需要与框架解耦（Vue、Angular、React 或原生 HTML），并复用应用现有 AI 对话面板与模型服务。</li></ul><h3 id="职责边界与支持范围" tabindex="-1">职责边界与支持范围 <a class="header-anchor" href="#职责边界与支持范围" aria-label="Permalink to &quot;职责边界与支持范围&quot;">​</a></h3><div class="tip custom-block"><p class="custom-block-title">组件边界</p><p>QuickAssist 只负责触发入口、输入浮层、推荐问题和有限上下文采集（业务脱敏需配置 <code>sanitizeContext</code>）；<strong>不负责</strong>展示 AI 回答、流式渲染、重试、多轮对话或模型调用，这些均由应用已有的 AI 对话面板承担。</p></div><table tabindex="0"><thead><tr><th>能力项</th><th>支持情况与说明</th></tr></thead><tbody><tr><td>桌面端原生划词</td><td>支持鼠标拖选与键盘 <code>Shift</code> 选词（默认仅正向划词触发）</td></tr><tr><td>移动端</td><td>暂不支持移动端原生长按划词链路；程序主动调用 <code>activate()</code>（如点击按钮）不受原生划词链路限制</td></tr><tr><td>iframe</td><td>父文档实例不会自动监听子 iframe 内的选区。可在子 iframe 内独立创建实例；同源场景也可由宿主传入该 iframe 的 <code>Document</code> 作为 <code>root</code>，并通过 <code>configureVanillaTheme(config, iframeDocument)</code> 同步主题。跨源 iframe 受同源策略限制</td></tr><tr><td>Shadow DOM</td><td><code>root</code> 仅接受 <code>Document</code>，不接受 <code>ShadowRoot</code>；原生划词监听不穿透 Shadow DOM 选区</td></tr><tr><td>CSP（内容安全策略）</td><td>CDN 方式会自动动态注入 <code>&lt;style&gt;</code>；若页面 CSP 禁止动态样式注入，请改用 NPM 方式并显式引入 CSS</td></tr><tr><td>选区保留高亮</td><td>输入框聚焦期间的原文灰色高亮通过 CSS Custom Highlight API 绘制，不修改原文 DOM；不支持该 API 的浏览器会自动降级为无保留高亮，不影响主流程</td></tr></tbody></table><h2 id="安装与引入" tabindex="-1">安装与引入 <a class="header-anchor" href="#安装与引入" aria-label="Permalink to &quot;安装与引入&quot;">​</a></h2><div class="info custom-block"><p class="custom-block-title">版本支持</p><p>QuickAssist 自 TinyRobot <strong>0.5.2</strong> 版本提供，支持通过 <code>@opentiny/tiny-robot/vanilla</code> 或 <code>dist/vanilla/vanilla.global.js</code> 引入。以下 NPM 与 CDN 示例均使用 <code>0.5.2</code>。</p></div><h3 id="npm-方式" tabindex="-1">NPM 方式 <a class="header-anchor" href="#npm-方式" aria-label="Permalink to &quot;NPM 方式&quot;">​</a></h3><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">npm</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> install</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> @opentiny/tiny-robot@0.5.2</span></span></code></pre></div><p>从 <code>@opentiny/tiny-robot/vanilla</code> 导入，并显式加载组件样式：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { createQuickAssist } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla/style.css&#39;</span></span></code></pre></div><p>QuickAssist 的 <code>/vanilla</code> 运行时代码不依赖 Vue、Angular 等框架运行时，打包产物不会包含框架代码。需要注意：<code>@opentiny/tiny-robot</code> 整包仍声明了 <code>vue</code>、<code>@opentiny/tiny-robot-kit</code>、<code>dompurify</code>、<code>markdown-it</code> 等 <code>peerDependencies</code>；在非 Vue 项目中安装时，包管理器可能会提示或按配置处理这些 peer 依赖，请按所在项目的包管理策略处理。</p><h3 id="cdn-方式" tabindex="-1">CDN 方式 <a class="header-anchor" href="#cdn-方式" aria-label="Permalink to &quot;CDN 方式&quot;">​</a></h3><p>通过 CDN 或自有静态目录加载 <code>vanilla.global.js</code> 后，使用全局对象 <code>window.TinyRobotVanilla</code> 创建实例，组件会自动注入样式，无需单独引入 CSS：</p><div class="language-html vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">html</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> src</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot@0.5.2/dist/vanilla/vanilla.global.js&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> quickAssist</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> window.TinyRobotVanilla.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    adapter: {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">      submit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">request</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">        // 替换为应用自己的“打开 AI 面板并发送”逻辑，同时传入 prompt 与 context</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        console.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">log</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;QuickAssist submit:&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          query: request.query,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          prompt: request.prompt,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">          context: request.context,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p>该脚本是无框架组件集合的统一入口，导出 <code>createQuickAssist</code>、<code>configureVanillaTheme</code> 等 API。</p><h2 id="快速开始" tabindex="-1">快速开始 <a class="header-anchor" href="#快速开始" aria-label="Permalink to &quot;快速开始&quot;">​</a></h2><p><span id="代码示例"></span></p><h3 id="example-basic" tabindex="-1">基础用法 <a class="header-anchor" href="#example-basic" aria-label="Permalink to &quot;基础用法 {#example-basic}&quot;">​</a></h3><p>使用 <code>createQuickAssist</code> 创建实例并传入必填的 <code>adapter.submit(request)</code>。组件会在用户提交后先关闭划词界面，再调用 <code>adapter.submit</code>；若异步提交抛错，会通过 <code>onEvent</code> 发出 <code>stage: &#39;adapter&#39;</code> 的 <code>error</code> 事件，不会重新打开界面。</p>`,24)),d(t(s(r),null,null,512),[[l,n.value]]),t(o,null,{default:i(()=>[t(s(p),{title:"基础用法",description:"从左向右选中文字并提交，观察 adapter.submit(request) 收到的核心字段。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{n.value=!1}),vueCode:s(ee)},u({_:2},[S.value?{name:"vue",fn:i(()=>[t(s(S))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[18]||(e[18]=c('<div class="warning custom-block"><p class="custom-block-title">首次接入必读</p><ul><li><strong>默认 <code>prompt</code> 规则</strong>：默认情况下 <code>request.prompt</code> 等价于 <code>suggestion?.prompt ?? query</code>，<strong>不会自动将选中原文 <code>context.text</code> 拼接进 <code>prompt</code></strong>。接入时应同时消费 <code>request.prompt</code> 与 <code>request.context</code>；若现有对话接口只接受一段文本，请通过 <a href="#example-build-prompt"><code>buildPrompt</code></a> 拼入 <code>context.text</code>。</li><li><strong>脱敏前提</strong>：默认采集仅做内置 DOM 排除（表单、编辑器、<code>[data-sensitive]</code> 等）与限长裁剪，<strong>不会自动识别或替换业务敏感 ID</strong>；业务字段和文本脱敏仅在配置 <a href="#example-context"><code>sanitizeContext</code></a> 后执行。</li><li><strong>生命周期清理</strong>：单页应用在路由离开当前页面时调用 <code>quickAssist.close()</code>，组件或页面销毁时调用 <code>quickAssist.destroy()</code>。</li></ul></div><h3 id="example-chat-panel" tabindex="-1">接入对话面板 <a class="header-anchor" href="#example-chat-panel" aria-label="Permalink to &quot;接入对话面板 {#example-chat-panel}&quot;">​</a></h3><p>下面的示例将 QuickAssist 与 TinyRobot 的 <code>TrBubbleList</code>、<code>TrSender</code> 联动，并用本地模拟回复代替后端：选中示例正文中的文字并提交后，对话面板自动展开并发送 <code>prompt</code> 与经过 <code>sanitizeContext</code> 脱敏后的 <code>context</code>。</p>',3)),d(t(s(r),null,null,512),[[l,n.value]]),t(o,null,{default:i(()=>[t(s(p),{title:"Vue 对话面板接入",description:"划词后打开 TinyRobot 对话面板，并自动提交 prompt 与脱敏上下文。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{n.value=!1}),vueCode:s(K)},u({_:2},[T.value?{name:"vue",fn:i(()=>[t(s(T))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[19]||(e[19]=y("h3",{id:"example-html",tabindex:"-1"},[m("HTML 接入 "),y("a",{class:"header-anchor",href:"#example-html","aria-label":'Permalink to "HTML 接入 {#example-html}"'},"​")],-1)),e[20]||(e[20]=y("p",null,[m("下面的原生 HTML 示例通过全局脚本 "),y("code",null,"window.TinyRobotVanilla"),m(" 接入，并将提交的请求对象展示在模拟对话面板中。迁移到独立项目时，在 "),y("code",null,"<head>"),m(" 中先通过 "),y("code",null,'<script src=".../vanilla.global.js"><\/script>'),m(" 引入构建产物或已发布 CDN 脚本即可——示例中若检测到已存在 "),y("code",null,"window.TinyRobotVanilla"),m(" 会自动跳过文档站预览加载器（也可直接删除注释第 1 段的预览适配代码）。")],-1)),d(t(s(r),null,null,512),[[l,n.value]]),t(o,null,{default:i(()=>[t(s(p),{title:"HTML 接入",description:"通过全局脚本接入，划词后查看提交给应用的完整请求内容。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{n.value=!1}),htmlCode:s(H)},null,8,["htmlCode"])]),_:1}),e[21]||(e[21]=c('<h3 id="交互与上下文数据流" tabindex="-1">交互与上下文数据流 <a class="header-anchor" href="#交互与上下文数据流" aria-label="Permalink to &quot;交互与上下文数据流&quot;">​</a></h3><p><img src="'+M+'" alt="QuickAssist 交互与上下文数据流：触发入口或直接打开输入浮层，准备上下文后手动发送或点击推荐，再构造 prompt 并交给应用对话面板。"></p><h2 id="划词与触发" tabindex="-1">划词与触发 <a class="header-anchor" href="#划词与触发" aria-label="Permalink to &quot;划词与触发&quot;">​</a></h2><h3 id="example-selection-scope" tabindex="-1">划词范围与长度限制 <a class="header-anchor" href="#example-selection-scope" aria-label="Permalink to &quot;划词范围与长度限制 {#example-selection-scope}&quot;">​</a></h3><p>通过 <code>include</code>、<code>exclude</code> 和 <code>selection</code> 控制可触发区域、文本有效性及最大字数上限。试着分别选中允许区域、超限整句、排除区域与范围外文字，对比效果：</p>',5)),d(t(s(r),null,null,512),[[l,n.value]]),t(o,null,{default:i(()=>[t(s(p),{title:"可选择区域与长度限制",description:"仅指定区域内的有效选区显示入口，超限后禁用并提供字数提示。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[3]||(e[3]=()=>{n.value=!1}),vueCode:s(J)},u({_:2},[w.value?{name:"vue",fn:i(()=>[t(s(w))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[22]||(e[22]=c(`<p>核心规则如下：</p><ul><li><strong>生效范围（<code>include</code> / <code>exclude</code>）</strong>：配置 <code>include</code> 后，选区中的所有文本节点都必须位于匹配区域内；<code>exclude</code> 会在内置排除规则基础上追加。</li><li><strong>内置排除区域</strong>：默认排除 <code>input</code>、<code>textarea</code>、<code>select</code>、<code>option</code>、可编辑的 <code>contenteditable</code> 区域、Monaco（<code>.monaco-editor</code>）、CodeMirror（<code>.CodeMirror</code> / <code>.cm-editor</code>）、QuickAssist 自身界面（<code>.tr-quick-assist</code>），以及 <code>[data-ai-selection=&quot;false&quot;]</code>、<code>[data-sensitive]</code>、<code>[data-secret]</code>、<code>[data-password]</code>。普通只读 <code>contenteditable=&quot;false&quot;</code> 区域允许划词，但若位于可编辑祖先或其他排除区域内仍会被排除。</li><li><strong>默认文本校验与自定义校验</strong>：内置规则默认拒绝空白、纯数字、纯标点/符号、明显 URL 和 UUID，不设最短字符限制，因此 <code>ECS</code>、<code>VPC</code>、<code>QoS</code> 等短技术词可正常触发。配置 <code>selection.validate(snapshot)</code> 可替代默认文本内容规则，但<strong>不能绕过</strong>最大长度、<code>include</code> / <code>exclude</code>、编辑器与敏感区域检查。</li><li><strong>划词长度上限（<code>selection.maxTextLength</code>）</strong>：默认为 <strong>8000</strong>（正整数），设为 <code>null</code> 表示不限制。计数先去除首尾空白，再按 Unicode 码点计算（内部空格与换行各计 1，单个补充平面 emoji 计 1，组合 emoji 按实际码点数计数）。该上限独立于输入框的 <code>input.maxLength</code>。</li><li><strong>超限交互</strong>：选区超出上限时，释放鼠标后仍显示置灰禁用的入口，并同步显示“划词字数超出限制 当前字数/上限”（文案可通过 <code>selection.maxTextLengthExceededMessage</code> 配置）。禁用入口不可通过点击、Enter 或程序打开，不会截断文本，也不会触发上下文或推荐请求。此规则同时适用于原生划词、<code>activate()</code> 和 <code>registerSource()</code>。</li></ul><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> quickAssist</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  adapter,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  include: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;#app&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  exclude: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;[data-qa-ignore]&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;.private-value&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  selection: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    maxTextLength: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 不限制划词长度（默认 8000）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    validate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">snapshot</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> snapshot.text.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">trim</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">().</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">length</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><h3 id="example-direction-placement" tabindex="-1">划词方向与入口位置 <a class="header-anchor" href="#example-direction-placement" aria-label="Permalink to &quot;划词方向与入口位置 {#example-direction-placement}&quot;">​</a></h3><p>切换方向限制和优先位置，跨行选中文字观察入口对齐与翻转效果：</p>`,5)),d(t(s(r),null,null,512),[[l,n.value]]),t(o,null,{default:i(()=>[t(s(p),{title:"划词方向与首末行定位",description:"切换方向限制和入口位置，跨行选中文字观察入口对齐。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[4]||(e[4]=()=>{n.value=!1}),vueCode:s(Y)},u({_:2},[D.value?{name:"vue",fn:i(()=>[t(s(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[23]||(e[23]=c('<ul><li><strong>划词方向（<code>selection.forwardOnly</code>）</strong>：默认为 <code>true</code>，仅正向划词触发；设为 <code>false</code> 允许双向划词。方向按文档顺序判断（跨行向后选择仍视为正向，键盘 <code>Shift</code> 选词规则一致），面向横排常规阅读场景，不按 RTL 或竖排视觉方向判断；自定义 <code>selection.validate</code> 不会覆盖方向限制。</li><li><strong>定位基准与翻转（<code>trigger.placement</code> / <code>trigger.offset</code>）</strong>：输入浮层打开后沿用同一套定位与间距规则（默认 <code>offset: 8</code> px），按各自尺寸在空间不足时自动翻转并向视口内避让。</li></ul><table tabindex="0"><thead><tr><th><code>placement</code> 值</th><th>锚定行</th><th>水平对齐方式</th></tr></thead><tbody><tr><td><code>&#39;bottom-end&#39;</code>（默认）</td><td>选中文字最后一行</td><td>入口左边缘对齐文字右边缘（向右下方展开）</td></tr><tr><td><code>&#39;bottom-start&#39;</code></td><td>选中文字最后一行</td><td>入口右边缘对齐文字左边缘（向左下方展开）</td></tr><tr><td><code>&#39;bottom&#39;</code></td><td>选中文字最后一行</td><td>相对末行水平居中</td></tr><tr><td><code>&#39;top-end&#39;</code></td><td>选中文字第一行</td><td>入口左边缘对齐文字右边缘（向右上方展开）</td></tr><tr><td><code>&#39;top-start&#39;</code></td><td>选中文字第一行</td><td>入口右边缘对齐文字左边缘（向左上方展开）</td></tr><tr><td><code>&#39;top&#39;</code></td><td>选中文字第一行</td><td>相对首行水平居中</td></tr><tr><td><code>&#39;auto&#39;</code></td><td>优先最后一行</td><td>优先在末行下方居中，空间不足时自动翻转</td></tr></tbody></table><blockquote><p>同一行内的多个内联文本片段会合并计算边界。调用 <code>updateOptions()</code> 修改 <code>selection</code> 或 <code>trigger</code> 时，提供的嵌套配置对象会整体替换原分组（详见 <a href="#methods"><code>updateOptions</code></a>）。</p></blockquote><h3 id="example-trigger-delay" tabindex="-1">延迟显示入口 <a class="header-anchor" href="#example-trigger-delay" aria-label="Permalink to &quot;延迟显示入口 {#example-trigger-delay}&quot;">​</a></h3><p>设置 <code>trigger.showDelay</code>（非负整数，单位毫秒，默认 <code>0</code>）可在选区稳定后延迟显示划词入口。连续拖选时会从最后一次有效选区重新计时并等待鼠标松开；选区失效、关闭、停用或销毁会取消待显示任务。延迟仅作用于划词入口，不影响点击后打开输入浮层。</p>',5)),d(t(s(r),null,null,512),[[l,n.value]]),t(o,null,{default:i(()=>[t(s(p),{title:"延迟显示划词入口",description:"切换立即显示与延迟 300 毫秒，对比划词体验。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[5]||(e[5]=()=>{n.value=!1}),vueCode:s($)},u({_:2},[B.value?{name:"vue",fn:i(()=>[t(s(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[24]||(e[24]=y("h2",{id:"输入与推荐",tabindex:"-1"},[m("输入与推荐 "),y("a",{class:"header-anchor",href:"#输入与推荐","aria-label":'Permalink to "输入与推荐"'},"​")],-1)),e[25]||(e[25]=y("h3",{id:"example-input",tabindex:"-1"},[m("输入区配置 "),y("a",{class:"header-anchor",href:"#example-input","aria-label":'Permalink to "输入区配置 {#example-input}"'},"​")],-1)),d(t(s(r),null,null,512),[[l,n.value]]),t(o,null,{default:i(()=>[t(s(p),{title:"输入区配置",description:"调整实例配置并划词体验，再用下方按钮对比实例默认与单次预填覆盖。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[6]||(e[6]=()=>{n.value=!1}),vueCode:s(U)},u({_:2},[C.value?{name:"vue",fn:i(()=>[t(s(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[26]||(e[26]=c(`<ul><li><strong>文案与无障碍</strong>：<code>input.placeholder</code> 控制空输入占位文案；<code>input.maxLengthExceededMessage</code> 控制超限提示；<code>input.ariaLabel</code> 标识 <code>textarea</code> 的无障碍名称；<code>input.submitLabel</code> 用作图标发送按钮的无障碍名称与悬停标题；弹层对话框名称使用 <code>trigger.label</code>。</li><li><strong>预填行为（<code>input.autoFill</code>）</strong>：实例默认 <code>false</code>（打开输入框留空），设为 <code>true</code> 时自动预填选中文字。<code>activate({ autoFill })</code> 仅覆盖当次调用，不修改实例默认配置。无论是否预填，选区原文始终保留在 <code>context.text</code> 中。</li><li><strong>自动伸缩（<code>input.maxRows</code>）</strong>：默认 <code>2</code> 行，换行和自动折行都会动态调整高度并在删除后收缩，同时重新定位浮层；超出后内部滚动。</li><li><strong>字数限制（<code>input.maxLength</code>）</strong>：默认不限制且不显示计数（显式设为 <code>null</code> 或省略效果相同）。配置正整数后，从空值起持续显示 <code>当前字数 / 上限</code>（按 Unicode 码点计数）；允许粘贴超限文本，超限时字数变红、发送按钮禁用且 <code>Enter</code> 不可提交，悬停或聚焦发送区域展示超限提示。推荐问题独立提交，不受手动输入超限状态影响。</li></ul><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> assist</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  adapter,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  trigger: { label: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;询问助手&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  input: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    maxRows: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">2</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    maxLength: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">10000</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    autoFill: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">false</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    placeholder: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;告诉 AI 你想做什么&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ariaLabel: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;问题内容&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    submitLabel: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;发送问题&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    maxLengthExceededMessage: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;问题不能超过 10000 个字符&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 单次激活可覆盖本次预填策略，不影响实例默认设置</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">assist.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">activate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ text: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;查看系统盘使用率&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, anchor: element, open: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;popover&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, autoFill: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">true</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> })</span></span></code></pre></div><h3 id="example-suggestions" tabindex="-1">静态与异步推荐 <a class="header-anchor" href="#example-suggestions" aria-label="Permalink to &quot;静态与异步推荐 {#example-suggestions}&quot;">​</a></h3><p>选中示例中的文字并点击入口，可以先看到静态推荐，随后合并异步返回的推荐；点击任一推荐项会直接提交，无需再次点击发送。</p>`,4)),d(t(s(r),null,null,512),[[l,n.value]]),t(o,null,{default:i(()=>[t(s(p),{title:"静态与异步推荐",description:"查看静态推荐与异步推荐的加载、合并与直接提交效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[7]||(e[7]=()=>{n.value=!1}),vueCode:s(z)},u({_:2},[_.value?{name:"vue",fn:i(()=>[t(s(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[27]||(e[27]=c('<p>QuickAssist 支持四种推荐配置模式：</p><table tabindex="0"><thead><tr><th>配置方式</th><th>打开输入浮层后的行为</th></tr></thead><tbody><tr><td>省略 <code>suggestions</code> 与 <code>getSuggestions</code></td><td>立即显示两个内置默认模板：<code>id: &#39;explain&#39;</code>（<code>解释 ${text}</code>）和 <code>id: &#39;use-case&#39;</code>（<code>${text}适用场景</code>）</td></tr><tr><td>仅配置 <code>suggestions</code></td><td>立即显示静态推荐；显式传 <code>[]</code> 表示隐藏默认模板，仅保留手动提问</td></tr><tr><td>仅配置 <code>getSuggestions</code></td><td>不显示内置默认模板；立即打开输入区，推荐区显示加载状态，返回后展示远程结果</td></tr><tr><td>两者都配置</td><td>先展示静态推荐，远程返回后合并；默认静态在前、远程追加，按 <code>id</code> 保留首次出现项，最后受 <code>maxSuggestions</code>（默认 <code>2</code>）裁剪</td></tr></tbody></table><p>每条 <code>Suggestion</code> 包含稳定的 <code>id</code>、展示文案 <code>label</code>、提交内容 <code>prompt</code> 以及可选的 <code>meta</code> 元数据；静态项也支持使用工厂对象 <code>SuggestionFactory</code>（<code>id</code> + <code>getLabel(context)</code> + <code>getPrompt(context)</code>），在上下文准备完成（含可选 <code>sanitizeContext</code> 脱敏）后求值。点击推荐项提交时，<code>AIRequest.query</code> 为推荐项的 <code>label</code>（不受输入框内容影响），<code>AIRequest.suggestion</code> 包含被点击项；手动提交时 <code>query</code> 为去首尾空白的输入内容。</p><h3 id="example-remote-suggestions" tabindex="-1">远程推荐与合并策略 <a class="header-anchor" href="#example-remote-suggestions" aria-label="Permalink to &quot;远程推荐与合并策略 {#example-remote-suggestions}&quot;">​</a></h3><p><span id="自定义合并策略-mergesuggestions"></span></p><p>切换策略与模拟响应后重新划词，观察加载期间静态推荐与远程返回后的合并结果。接入真实接口时，将示例中的模拟延迟替换为 <code>fetch(url, { signal })</code> 并返回 <code>Suggestion[]</code> 即可。</p>',6)),d(t(s(r),null,null,512),[[l,n.value]]),t(o,null,{default:i(()=>[t(s(p),{title:"远程推荐与覆盖策略",description:"切换策略和模拟响应后重新划词，观察静态回退与合并效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[8]||(e[8]=()=>{n.value=!1}),vueCode:s(G)},u({_:2},[q.value?{name:"vue",fn:i(()=>[t(s(q))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[28]||(e[28]=c('<p><code>mergeSuggestions(base, incoming, context)</code> 是同步回调，在远程推荐返回并通过校验后执行：</p><ul><li><code>base</code>：静态推荐经模板求值、按 <code>id</code> 去重并按 <code>maxSuggestions</code> 裁剪后的结果；</li><li><code>incoming</code>：过滤无效项后、尚未去重或裁剪的远程推荐数组；</li><li><code>context</code>：本次推荐使用的上下文副本（若配置了 <code>sanitizeContext</code> 则为脱敏后的上下文）。</li></ul><p>常用合并策略：</p><table tabindex="0"><thead><tr><th>目标</th><th><code>mergeSuggestions</code> 返回值</th></tr></thead><tbody><tr><td>静态优先，追加未重复的远程项（默认）</td><td><code>[...base, ...incoming]</code></td></tr><tr><td>远程整体替换静态问题（远程返回 <code>[]</code> 时清空）</td><td><code>incoming</code></td></tr><tr><td>远程有结果时替换，返回 <code>[]</code> 时保留静态问题</td><td><code>incoming.length ? incoming : base</code></td></tr><tr><td>远程优先，同 <code>id</code> 覆盖静态项，同时保留其他静态项</td><td><code>[...incoming, ...base]</code></td></tr></tbody></table><p>回调返回后，组件仍会执行格式校验、按 <code>id</code> 保留首次出现项并应用 <code>maxSuggestions</code> 上限。远程请求失败时<strong>不会</strong>调用 <code>mergeSuggestions</code>，组件会保留已显示的静态推荐并触发 <code>stage: &#39;suggestions&#39;</code> 的 <code>error</code> 事件；<strong>仅当没有可显示的推荐项时</strong>（如仅配置 <code>getSuggestions</code>），组件内部推荐区才会展示 <code>messages.error</code> 文案（示例页面下方的状态栏为宿主监听 <code>onEvent</code> 自行渲染的提示）。</p><h3 id="远程问题校验-validatesuggestion" tabindex="-1">远程问题校验 <a class="header-anchor" href="#远程问题校验-validatesuggestion" aria-label="Permalink to &quot;远程问题校验 {#远程问题校验-validatesuggestion}&quot;">​</a></h3><p>组件会先检查远程响应是否为数组，再逐项检查 <code>id</code>、<code>label</code>、<code>prompt</code> 是否为非空字符串（纯空白无效），单条无效项会被过滤且不影响同批其他有效项。静态推荐及自定义合并结果若格式无效则会报错。</p><p>在此基础上，可配置同步回调 <code>validateSuggestion(suggestion, context): boolean</code> 对远程推荐进行业务规则校验（在基础校验后、合并前逐项执行）：</p>',8)),d(t(s(r),null,null,512),[[l,n.value]]),t(o,null,{default:i(()=>[t(s(p),{title:"远程问题校验前后对比",description:"对比原始问题与最终问题，查看空白、超长、不相关问题的过滤原因，以及全部无效时的静态回退。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[9]||(e[9]=()=>{n.value=!1}),vueCode:s(j)},u({_:2},[A.value?{name:"vue",fn:i(()=>[t(s(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[29]||(e[29]=c(`<ul><li><strong>入参与返回值</strong>：<code>suggestion</code> 是已通过基础校验的单条推荐副本（用于判断保留与否，不用于修改内容）；<code>context</code> 为本次推荐上下文副本（若配置了 <code>sanitizeContext</code> 则为脱敏后的上下文）；返回 <code>true</code> 保留，<code>false</code> 丢弃。</li><li><strong><code>meta</code> 克隆限制</strong>：推荐项的 <code>meta</code> 会经过结构化深拷贝（支持 <code>Date</code>、<code>Map</code>、<code>Set</code>、TypedArray 及循环引用，不支持函数、DOM 节点、响应式代理或共享内存）。远程项 <code>meta</code> 无法克隆时按无效项过滤。</li><li><strong>整批失败与合法空结果的区别</strong>：响应不是数组、非空响应全部被过滤、回调抛错或返回非布尔值（含 <code>Promise</code>）时，视为整批失败——不调用 <code>mergeSuggestions</code>，保留静态推荐并触发 <code>stage: &#39;suggestions&#39;</code> 错误事件；接口主动返回 <code>[]</code> 则属于成功的空结果，继续走 <code>mergeSuggestions</code>。</li><li>模型原始输出的 JSON 解析、字段映射与缺失 <code>id</code> 生成应在 <code>getSuggestions</code> 内完成，组件统一接收 <code>Suggestion[]</code>。</li></ul><h3 id="example-suggestion-messages" tabindex="-1">推荐状态文案 <a class="header-anchor" href="#example-suggestion-messages" aria-label="Permalink to &quot;推荐状态文案 {#example-suggestion-messages}&quot;">​</a></h3><p><code>messages</code> 仅控制推荐区域的三种状态文案（输入区文案在 <a href="#example-input"><code>input</code></a> 配置；发送错误由 <code>onEvent</code> 的 <code>stage: &#39;adapter&#39;</code> 通知）：</p><table tabindex="0"><thead><tr><th>字段</th><th>默认值</th><th>显示时机</th></tr></thead><tbody><tr><td><code>loading</code></td><td><code>&#39;正在加载推荐…&#39;</code></td><td>远程推荐加载中</td></tr><tr><td><code>empty</code></td><td><code>&#39;暂无推荐&#39;</code></td><td>无可显示推荐时（包含显式配置 <code>suggestions: []</code>）</td></tr><tr><td><code>error</code></td><td><code>&#39;推荐加载失败&#39;</code></td><td>推荐准备或加载失败且无静态推荐可回退时</td></tr></tbody></table><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> quickAssist</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  adapter,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  messages: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    loading: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;正在获取推荐问题…&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    empty: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;暂无推荐问题，可直接输入&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    error: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;无法生成推荐问题&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><h2 id="上下文与自定义发送内容" tabindex="-1">上下文与自定义发送内容 <a class="header-anchor" href="#上下文与自定义发送内容" aria-label="Permalink to &quot;上下文与自定义发送内容&quot;">​</a></h2><h3 id="example-context" tabindex="-1">页面上下文与敏感数据 <a class="header-anchor" href="#example-context" aria-label="Permalink to &quot;页面上下文与敏感数据 {#example-context}&quot;">​</a></h3><p>上下文按 <code>base → nearby → getContext → sanitizeContext</code> 顺序构建。默认采集仅做内置 DOM 排除与限长裁剪，不会自动识别或替换业务敏感字段；配置 <code>sanitizeContext</code> 后，组件会在其完成脱敏后才调用推荐函数或 <code>adapter</code>。选中示例中的虚构租户编号并提交，观察选区文本、附近文本和业务字段被统一脱敏后的结果：</p>`,8)),d(t(s(r),null,null,512),[[l,n.value]]),t(o,null,{default:i(()=>[t(s(p),{title:"上下文与脱敏",description:"选中虚构租户编号并提交，查看脱敏后的 prompt 与 context。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[10]||(e[10]=()=>{n.value=!1}),vueCode:s(O)},u({_:2},[F.value?{name:"vue",fn:i(()=>[t(s(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[30]||(e[30]=c(`<p>默认采集的基础上下文包含：</p><ul><li><code>source</code>（原生划词为 <code>&#39;selection&#39;</code>）、<code>text</code> 和 <code>selection: { text }</code>；</li><li><code>page</code>：页面标题 <code>title</code> 与去除了查询参数（query）和片段标识（hash）的 <code>url</code>；</li><li><code>nearbyText</code>：从选区附近有限语义块中提取的限长文本（默认最多 500 字符）；未匹配到合适语义块时最多退回选中文本，绝不读取整页 <code>body.innerText</code> 或表单值。</li></ul><p>上下文处理注意事项：</p><ul><li><strong>脱敏约束</strong>：<code>sanitizeContext</code> 返回值必须保留 <code>source</code> 与 <code>text</code> 两个字符串字段，其余字段可按需删改；若用户手动输入或开启 <code>input.autoFill</code> 预填了敏感文本，还应在 <code>buildPrompt</code> 中对最终 <code>prompt</code> 做脱敏。</li><li><strong>外发字段</strong>：<code>sanitizeContext</code> 与 <code>buildPrompt</code> 都不会改写 <code>request.query</code>；手动提交时它是去除首尾空白的输入，点击推荐时为推荐项的 <code>label</code>。建议只发送已处理的 <code>prompt</code> 与 <code>context</code>；若需向外部服务转发完整 <code>request</code>，应额外脱敏或省略 <code>query</code>、<code>suggestion</code> 等可能包含敏感信息的字段。</li><li><strong>可克隆约束</strong>：不要在上下文中放入函数、DOM 节点、<code>Range</code>、选区快照或共享内存对象，否则会在拷贝阶段报错并阻止提交。</li><li><strong>只读副本</strong>：推荐函数与 <code>buildPrompt</code> 收到的是上下文副本，修改副本不会影响最终传给 <code>adapter</code> 的上下文。</li><li><strong>双重防护</strong>：请结合页面标记（<code>data-sensitive</code>、<code>data-ai-selection=&quot;false&quot;</code>）与 <code>sanitizeContext</code> 共同拦截密钥、令牌、租户 ID、订单数据等敏感信息。</li></ul><h3 id="example-nearby-context" tabindex="-1">自定义附近文本 <a class="header-anchor" href="#example-nearby-context" aria-label="Permalink to &quot;自定义附近文本 {#example-nearby-context}&quot;">​</a></h3><p>默认附近文本提取会向上查找最近的内置语义块标签（<code>p</code>、<code>li</code>、<code>td</code>、<code>th</code>、<code>label</code>、<code>section</code>、<code>fieldset</code>），并自动跳过隐藏节点（含 <code>display: none</code>、<code>visibility: hidden</code>、<code>[hidden]</code>、<code>[aria-hidden=&quot;true&quot;]</code>）、表单控件、编辑器和敏感排除区域。</p><ul><li>仅需扩展候选容器时，优先配置 <code>nearbyContext.blockSelectors</code>（在内置集合上追加）以复用内置安全提取器；</li><li>需要完全自定义来源时，提供 <code>getNearbyContext(snapshot)</code>，并<strong>优先读取已知安全的业务数据结构或白名单摘要</strong>：</li></ul><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> SAFE_SECTION_SUMMARIES</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">  &#39;ecs-billing&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;云服务器支持包年包月、按需计费与竞价计费三种模式。&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> quickAssist</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  adapter,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  nearbyContext: { maxLength: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">200</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, blockSelectors: [</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;.product-description&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  getNearbyContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">snapshot</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 优先从已知安全的业务摘要读取，避免直接扫描含表单、CSS 隐藏节点或敏感内容的 DOM</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> sectionId</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> snapshot.anchorElement?.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">closest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;[data-section-id]&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)?.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getAttribute</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;data-section-id&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (sectionId </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;&amp;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> SAFE_SECTION_SUMMARIES</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[sectionId]) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">||</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> snapshot.text</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><div class="warning custom-block"><p class="custom-block-title">自定义提取的安全过滤责任</p><p>提供 <code>getNearbyContext</code> 会完全替代内置附近文本提取；组件仅对回调返回的字符串执行 <code>nearbyContext.maxLength</code> 长度裁剪和可选 <code>sanitizeContext</code> 处理，<strong>不会</strong>重新按内置 DOM 规则过滤该字符串。</p><p>切勿直接读取整段容器的 <code>textContent</code>（会读入 <code>display: none</code> / <code>visibility: hidden</code> 等 CSS 隐藏节点、<code>textarea</code> 等表单初始文本以及敏感子节点）。如确需自行扫描 DOM，应遍历原始 DOM，通过 <code>getComputedStyle</code> 排除隐藏节点，并跳过表单控件（<code>input</code>、<code>textarea</code>、<code>select</code>、<code>option</code>）、编辑器、<code>[contenteditable]</code>、<code>[hidden]</code>、<code>[aria-hidden=&quot;true&quot;]</code> 及敏感排除区域。</p></div><h3 id="example-build-prompt" tabindex="-1">自定义发送内容 <a class="header-anchor" href="#example-build-prompt" aria-label="Permalink to &quot;自定义发送内容 {#example-build-prompt}&quot;">​</a></h3><p>默认情况下，提交给 <code>adapter</code> 的 <code>prompt</code> 为：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> defaultPrompt</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> suggestion?.prompt </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">??</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> query</span></span></code></pre></div><p>它<strong>不会自动把选中的原文 <code>context.text</code> 拼进 <code>prompt</code></strong>。如果你的对话后端只接收单段 <code>prompt</code> 文本，或希望统一附加产品、场景与选中原文，可通过同步钩子 <code>buildPrompt({ query, context, suggestion })</code> 构造最终发送内容，同时保留简洁的 <code>query</code> 用于界面展示。</p>`,13)),d(t(s(r),null,null,512),[[l,n.value]]),t(o,null,{default:i(()=>[t(s(p),{title:"自定义发送内容",description:"对比手动输入与推荐项提交时的 query、prompt 和 context.text。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[11]||(e[11]=()=>{n.value=!1}),vueCode:s(X)},u({_:2},[x.value?{name:"vue",fn:i(()=>[t(s(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[31]||(e[31]=c('<h2 id="主动激活与编辑器集成" tabindex="-1">主动激活与编辑器集成 <a class="header-anchor" href="#主动激活与编辑器集成" aria-label="Permalink to &quot;主动激活与编辑器集成&quot;">​</a></h2><h3 id="example-activation" tabindex="-1">主动激活：按钮与自定义选区 <a class="header-anchor" href="#example-activation" aria-label="Permalink to &quot;主动激活：按钮与自定义选区 {#example-activation}&quot;">​</a></h3><p>通过 <code>activate()</code> 可主动提供文本和定位锚点，复用“入口 → 输入浮层 → 推荐与提交”的完整交互流程。传入 <code>open: &#39;popover&#39;</code> 可跳过入口与 <code>trigger.showDelay</code>，直接打开并聚焦输入框（不触发 <code>trigger_show</code> / <code>trigger_click</code>，仍触发 <code>selection</code> 与 <code>popover_show</code>）。</p><p>示例默认点击激活，勾选“悬停指标时自动显示入口”可体验仅展示入口而不抢焦点的悬停触发：</p>',4)),d(t(s(r),null,null,512),[[l,n.value]]),t(o,null,{default:i(()=>[t(s(p),{title:"主动激活与自定义定位",description:"点击按钮或指标卡片主动触发，切换直接输入与悬停入口，对比默认推荐与本次专属推荐。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[12]||(e[12]=()=>{n.value=!1}),vueCode:s(N)},u({_:2},[f.value?{name:"vue",fn:i(()=>[t(s(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[32]||(e[32]=c(`<p><strong>1. 元素锚点快捷形式（适合按钮、徽标、卡片）</strong></p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> explainButton</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> document.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">querySelector</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">HTMLButtonElement</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;#explain&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">explainButton.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addEventListener</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;click&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  quickAssist.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">activate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    text: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;需要解释的业务术语&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    anchor: explainButton,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    open: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;popover&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 省略时默认先展示入口按钮</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    meta: { feature: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;term-explanation&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }, </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// source 默认为 &#39;manual&#39;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    suggestions: [</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        id: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;explain-term&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        getLabel</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;解释这个术语&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        getPrompt</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">context</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> \`请解释：\${</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">context</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">.</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">text</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">}\`</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    ],</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>单次激活支持以下覆盖参数，均只影响本次会话，不改变实例默认配置：</p><table tabindex="0"><thead><tr><th>本次激活参数</th><th>行为</th></tr></thead><tbody><tr><td>不传 <code>suggestions</code> / <code>getSuggestions</code></td><td>沿用实例默认推荐配置</td></tr><tr><td><code>suggestions: [...]</code></td><td>替换本次静态推荐，且默认不再调用实例的 <code>getSuggestions</code></td></tr><tr><td><code>suggestions: []</code></td><td>本次不显示推荐，保留手动提问</td></tr><tr><td><code>getSuggestions: fn</code></td><td>使用本次异步推荐函数，可与本次静态推荐组合使用</td></tr><tr><td><code>getSuggestions: null</code></td><td>本次禁用远程推荐，静态推荐按对应配置展示</td></tr><tr><td><code>autoFill: boolean</code></td><td>覆盖本次输入区预填行为，优先于实例 <code>input.autoFill</code></td></tr><tr><td><code>open: &#39;trigger&#39; | &#39;popover&#39;</code></td><td>决定先展示入口还是直接打开输入浮层（默认 <code>&#39;trigger&#39;</code>）</td></tr></tbody></table><p><strong>2. 完整几何句柄形式（适合代码编辑器、图表、自定义画布）</strong></p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">quickAssist.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">activate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  source: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;editor&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  text: selectedCode,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  anchorElement: editorContainer,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  getRect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> getCurrentSelectionRect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(), </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 返回相对视口的 CSS 像素矩形；不可见或失效返回 null</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  verify</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> isCapturedSelectionStillValid</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(),</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  getNearbyText</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> capturedNearbyCode,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  onInvalidate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">notify</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 覆盖 showDelay、入口与浮层阶段；通知后复检 verify + getRect，有效则重定位，否则关闭</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> subscribeToSelectionAndLayoutChanges</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(notify)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  meta: { language: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;typescript&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, fileName: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;price.ts&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>使用要点：</p><ul><li><strong>坐标规范</strong>：<code>getRect()</code> 须返回相对浏览器视口的 CSS 像素矩形（与 <code>getBoundingClientRect()</code> 一致；零宽但有高度的光标矩形同样有效），编辑器内部坐标需加上容器视口偏移并自行判断是否滚出可视裁剪区。</li><li><strong>快照与启停</strong>：<code>text</code>、<code>meta</code> 和 <code>getNearbyText()</code> 在激活时立即捕获；实例停用或销毁后调用 <code>activate()</code> 不生效。</li><li><strong>失效检测边界（两种形式的区别）</strong>： <ul><li><strong>元素锚点快捷形式（<code>anchor</code>）</strong>：组件内部自动安装 <code>ResizeObserver</code> 与祖先 <code>MutationObserver</code>，元素移除、祖先隐藏或尺寸塌缩时会<strong>自动关闭</strong>当前会话。</li><li><strong>完整几何句柄形式（<code>anchorElement</code> + <code>getRect</code>）</strong>：组件仅在滚动、窗口 <code>resize</code> 及延迟显示到期时复检锚点；不会自动监听元素移除、编辑器模型变化或容器内部布局变化。需通过 <code>onInvalidate(notify)</code> 订阅宿主变化通知（或主动调用 <code>close()</code>），否则锚点移除后浮层会保留到下一次滚动或 <code>resize</code> 复检时才关闭。</li></ul></li><li><strong>校验范围</strong>：主动激活遵循非空、最大长度与几何校验；<code>include</code> / <code>exclude</code>、<code>selection.forwardOnly</code>、原生 DOM 划词校验 <code>selection.validate</code> 与 <code>getNearbyContext</code> 仅作用于原生 DOM 划词。如需放宽主动激活的文本内容规则（例如允许代码符号），可配置 <code>selection.validateActivation</code>。</li></ul><h3 id="example-monaco" tabindex="-1">Monaco 选中代码后主动解释 <a class="header-anchor" href="#example-monaco" aria-label="Permalink to &quot;Monaco 选中代码后主动解释 {#example-monaco}&quot;">​</a></h3><p>普通原生划词默认排除 Monaco、CodeMirror 与输入框；在编辑器中，应用可通过监听编辑器选区事件并调用通用 <code>activate()</code> 接口完成集成，无需解除原生过滤规则。</p>`,10)),d(t(s(r),null,null,512),[[l,n.value]]),t(o,null,{default:i(()=>[t(s(p),{title:"Monaco 主动选区解释",description:"选词完成后通过通用 activate() 接口定位到选区末端并展示代码专属推荐。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[13]||(e[13]=()=>{n.value=!1}),vueCode:s(V)},u({_:2},[b.value?{name:"vue",fn:i(()=>[t(s(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[33]||(e[33]=c(`<p>接入代码编辑器时的关键要点（完整可运行代码可展开上方示例源码查看）：</p><ol><li><strong>拖选门控与防重入</strong>：在 <code>pointerdown</code> 期间暂不激活，待 <code>pointerup</code> 或非输入法组合态的 <code>keyup</code> 后通过 <code>requestAnimationFrame</code> 读取最终选区，并用 <code>uri + version + range</code> 对相同选区去重，避免无关按键反复弹出。</li><li><strong>视口坐标与裁剪判断</strong>：使用 <code>editor.getScrolledVisiblePosition(end)</code> 加上容器 <code>getBoundingClientRect()</code> 换算视口坐标；若选区滚出内容裁剪区域则返回 <code>null</code>。</li><li><strong>快照捕获与一致性校验</strong>：在激活时截取选中代码及前后有限行作为 <code>getNearbyText</code>，并通过 <code>verify()</code> 校验模型实例、文档版本号和选区范围是否一致。</li><li><strong>生命周期联动</strong>：监听选区变化、内容修改、滚动和布局变化及时调用 <code>quickAssist.close()</code>；组件卸载时释放所有监听、<code>quickAssist.destroy()</code> 以及编辑器实例。</li></ol><h3 id="example-register-source" tabindex="-1">注册自定义来源 <a class="header-anchor" href="#example-register-source" aria-label="Permalink to &quot;注册自定义来源 {#example-register-source}&quot;">​</a></h3><p>当页面存在多个自定义触发源，需要随 QuickAssist 实例统一启停、注销并做来源级会话隔离时，可使用高级接口 <code>registerSource()</code>；单个按钮或单编辑器场景直接使用 <code>activate()</code> 即可。</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> button</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> document.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">querySelector</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">HTMLButtonElement</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;#explain-metric&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">!</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> stopListening</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> undefined</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> unregister</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> quickAssist.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">registerSource</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  name: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;metric-click&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  activate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">emit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    const</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> onClick</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">      emit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        source: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;metric-click&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        text: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;实例 CPU 使用率&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">        anchorElement: button,</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        getRect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (button.isConnected </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> button.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">getBoundingClientRect</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">      })</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    button.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">addEventListener</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;click&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, onClick)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    stopListening</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> () </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> button.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">removeEventListener</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;click&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, onClick)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  deactivate</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    stopListening</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">?.()</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    stopListening </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> undefined</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 不再需要该来源时注销，会移除其监听并关闭属于该来源的当前会话</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// unregister()</span></span></code></pre></div><p>实例调用 <code>disable()</code> 或 <code>destroy()</code> 时会自动触发已注册来源的 <code>deactivate()</code>；重新 <code>enable()</code> 时会再次调用 <code>activate()</code>，因此订阅与清理应成对实现。来源需要主动清理自身会话时，可调用 <code>emit(null)</code>。</p><h2 id="生命周期与事件监听" tabindex="-1">生命周期与事件监听 <a class="header-anchor" href="#生命周期与事件监听" aria-label="Permalink to &quot;生命周期与事件监听&quot;">​</a></h2><h3 id="example-lifecycle" tabindex="-1">生命周期与路由 <a class="header-anchor" href="#example-lifecycle" aria-label="Permalink to &quot;生命周期与路由 {#example-lifecycle}&quot;">​</a></h3><p>以下示例演示通过 <code>enable()</code>、<code>disable()</code> 控制划词监听，以及模拟 SPA 路由切换时调用 <code>close()</code>；页面或宿主组件卸载时应调用 <code>destroy()</code>。</p>`,9)),d(t(s(r),null,null,512),[[l,n.value]]),t(o,null,{default:i(()=>[t(s(p),{title:"启停与关闭会话",description:"通过按钮控制划词启停状态，并模拟路由切换关闭当前会话。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[14]||(e[14]=()=>{n.value=!1}),vueCode:s(Z)},u({_:2},[v.value?{name:"vue",fn:i(()=>[t(s(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[34]||(e[34]=c(`<p>QuickAssist 会自动响应浏览器的 <code>popstate</code> 与 <code>hashchange</code> 事件关闭当前界面；使用前端路由库（基于 <code>history.pushState</code>）时，应在路由钩子中手动调用 <code>quickAssist.close()</code>。</p><p><span id="vue"></span></p><p><strong>Vue 集成</strong></p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { onBeforeUnmount, onMounted } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { useRouter } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;vue-router&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { createQuickAssist } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla/style.css&#39;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { QuickAssistInstance } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> router</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> useRouter</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">()</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">let</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> quickAssist</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> QuickAssistInstance</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> undefined</span></span>
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
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p><span id="angular"></span></p><p><strong>Angular 集成</strong></p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { AfterViewInit, Component, OnDestroy, inject } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@angular/core&#39;</span></span>
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
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">        submit</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">request</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> this</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">.</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">openAssistantAndSend</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(request.prompt, request.context),</span></span>
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
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 接入应用已有的 AI 对话面板与发送方法</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><blockquote><p>SSR 环境下请仅在浏览器挂载生命周期内创建实例。如果页面多个模块同时使用 QuickAssist，建议按区域职责划分：优先在全局布局复用单实例，并通过 <code>activate()</code> / <code>registerSource()</code> 接入局部特殊区域；若确需创建多个实例，请使用互不重叠的 <code>include</code> 选择器并在各区域卸载时调用 <code>destroy()</code>，避免同一选区同时触发多个入口。</p></blockquote><h3 id="example-events" tabindex="-1">事件监听 <a class="header-anchor" href="#example-events" aria-label="Permalink to &quot;事件监听 {#example-events}&quot;">​</a></h3><p>通过 <code>onEvent(event)</code> 统一接收交互与错误事件，使用 <code>event.type</code> 区分类型，并用 <code>event.sessionId</code> 关联同一次划词会话。</p>`,10)),d(t(s(r),null,null,512),[[l,n.value]]),t(o,null,{default:i(()=>[t(s(p),{title:"事件监听与会话日志",description:"观察完整交互事件、会话编号、关闭原因和模拟提交错误。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[15]||(e[15]=()=>{n.value=!1}),vueCode:s(P)},u({_:2},[E.value?{name:"vue",fn:i(()=>[t(s(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[35]||(e[35]=c(`<p>提交时会先触发 <code>close</code>（<code>reason: &#39;submit&#39;</code>），再触发 <code>submit</code> 并调用适配器；若适配器抛错或返回被拒绝的 Promise，随后触发 <code>stage: &#39;adapter&#39;</code> 的 <code>error</code>。<code>submit</code> 仅表示请求已交给适配器，不表示模型已完成回答。事件元数据不包含选区原文、<code>query</code>、<code>prompt</code> 或完整上下文；错误对象应按应用自身的日志安全规范处理。</p><h2 id="主题与外观定制" tabindex="-1">主题与外观定制 <a class="header-anchor" href="#主题与外观定制" aria-label="Permalink to &quot;主题与外观定制&quot;">​</a></h2><h3 id="example-theme" tabindex="-1">主题配置 <a class="header-anchor" href="#example-theme" aria-label="Permalink to &quot;主题配置 {#example-theme}&quot;">​</a></h3><p>无框架组件内置亮暗两套配色，默认跟随 <code>html[data-tr-color-mode]</code>（识别 <code>light</code> / <code>dark</code>，缺失或无效时回退亮色）。已使用 TinyRobot <code>ThemeProvider</code> 的项目默认无需额外配置。</p><p>其他系统在应用初始化时调用 <code>configureVanillaTheme()</code> 指定主题来源即可，无需向组件实例传参：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { configureVanillaTheme } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">from</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;@opentiny/tiny-robot/vanilla&#39;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configureVanillaTheme</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  source: { type: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;attribute&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, attribute: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;data-cf-theme&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div>`,6)),y("div",se,[d(t(s(r),null,null,512),[[l,n.value]]),t(o,null,{default:i(()=>[t(s(p),{title:"主题切换",description:"切换亮色、暗色或跟随系统，选中文字查看入口和浮层；独立项目预先引入 vanilla.global.js 后会自动复用全局对象。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[16]||(e[16]=()=>{n.value=!1}),htmlCode:s(W)},null,8,["htmlCode"])]),_:1})]),e[36]||(e[36]=c(`<p>其他常用模式：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configureVanillaTheme</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ source: { type: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;class&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } }) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 跟随 html.dark，否则亮色</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configureVanillaTheme</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ colorMode: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;dark&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 固定暗色（也支持 &#39;light&#39;）</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configureVanillaTheme</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({ colorMode: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;auto&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 跟随操作系统配色</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">configureVanillaTheme</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({}) </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 恢复默认 TinyRobot 主题来源</span></span></code></pre></div><ul><li>配置按 <code>Document</code> 共享，对同一文档中<strong>已有及后续创建的所有 Vanilla 组件</strong>生效，主题切换不会清空正在编辑的问题。</li><li>每次调用均与内置默认值合并，不累积上次配置；<code>source</code> 与 <code>colorMode</code> 互斥，不能同时设置。</li><li>配色优先级：<strong>组件 <code>--tr-quick-assist-*</code> 变量覆盖 → 宿主 <code>--tr-*</code> 主题变量 → 内置默认配色</strong>。浮层挂载在 <code>body</code> 下，自定义变量应写在 <code>html</code>、<code>body</code> 或 <code>.tr-quick-assist</code> 全局样式中。</li></ul><h3 id="example-attrs" tabindex="-1">自定义元素属性 <a class="header-anchor" href="#example-attrs" aria-label="Permalink to &quot;自定义元素属性 {#example-attrs}&quot;">​</a></h3><p>通过 <code>attrs</code> 为组件内部元素追加安全的 DOM 属性（如测试标记、自定义类名、ARIA 关联等）。共支持 6 个目标位置：</p><table tabindex="0"><thead><tr><th>目标键名</th><th>对应的内部元素</th></tr></thead><tbody><tr><td><code>root</code></td><td>组件挂载到 <code>body</code> 下的 <code>.tr-quick-assist</code> 宿主 <code>div</code>（<strong>注意</strong>：不同于配置项 <code>options.root</code> 传入的 <code>Document</code>）</td></tr><tr><td><code>trigger</code></td><td>划词入口按钮（<code>.tr-quick-assist__trigger</code>）</td></tr><tr><td><code>popover</code></td><td>输入浮层容器（<code>.tr-quick-assist__popover</code>）</td></tr><tr><td><code>input</code></td><td>问题输入框（<code>textarea.tr-quick-assist__input</code>）</td></tr><tr><td><code>submit</code></td><td>发送按钮（<code>button.tr-quick-assist__submit</code>）</td></tr><tr><td><code>suggestion</code></td><td>推荐问题按钮，支持属性对象或 <code>(suggestion) =&gt; QuickAssistAttributeMap</code> 回调</td></tr></tbody></table><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> quickAssist</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  adapter,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  attrs: {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    trigger: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;data-testid&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;quick-assist-trigger&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    input: { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;aria-describedby&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;quick-assist-hint&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> },</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">    suggestion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">suggestion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ({ </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;data-suggestion-id&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: suggestion.id }),</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><p>安全过滤规则：</p><ul><li>事件处理器（<code>on*</code>）、<code>innerHTML</code>、<code>outerHTML</code>、<code>textContent</code>、<code>style</code>、<code>value</code>、<code>disabled</code>、<code>readonly</code>、<code>required</code>、<code>type</code>、<code>id</code> 以及非法属性名会被忽略；</li><li><code>class</code> / <code>className</code> 仅追加合法 token，不会覆盖组件内置类名；</li><li>普通属性值为 <code>false</code> / <code>null</code> / <code>undefined</code> 时移除属性，值为 <code>true</code> 时写入布尔存在属性（空字符串）；<code>aria-*</code> 属性则保留 <code>&#39;true&#39;</code> / <code>&#39;false&#39;</code> 语义字符串；</li><li><code>attrs.suggestion</code> 回调抛错时不会中断渲染或提交，会触发 <code>stage: &#39;callback&#39;</code> 的 <code>error</code> 事件。</li></ul><h2 id="交互与限制" tabindex="-1">交互与限制 <a class="header-anchor" href="#交互与限制" aria-label="Permalink to &quot;交互与限制&quot;">​</a></h2><ul><li>点击入口后输入框立即打开并聚焦，默认留空（<code>input.autoFill: true</code> 时预填选中文字）；按 <code>Enter</code> 发送，<code>Shift+Enter</code> 换行，输入法组合（IME）期间不会误提交。</li><li>上下文构造或脱敏尚未完成时，用户仍可输入编辑，但提交按钮与推荐项暂时禁用，完成后自动恢复可用。</li><li>新选区会替换旧会话；点击外部、按 <code>Esc</code>、锚点失效、显著滚动、路由变化或调用生命周期方法都会清理当前界面。</li></ul><h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><p>点击下方表格中的配置项、方法或事件名，可快速跳转到对应说明。</p><h3 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props {#props}&quot;">​</a></h3><p>配置项类型为 <code>QuickAssistOptions</code>，通过 <code>createQuickAssist(options)</code> 传入：</p><table tabindex="0"><thead><tr><th>属性名</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><a href="#example-basic"><code>root</code></a></td><td><code>Document</code></td><td><code>document</code></td><td>监听与挂载所在文档；不接受 <code>ShadowRoot</code></td></tr><tr><td><a href="#example-lifecycle"><code>enabled</code></a></td><td><code>boolean</code></td><td><code>true</code></td><td>创建后是否立即启用划词与全局监听</td></tr><tr><td><a href="#example-basic"><code>adapter</code></a></td><td><code>AIAdapter</code></td><td>—</td><td><strong>必填</strong>；通过 <code>submit(request)</code> 交给应用已有对话能力</td></tr><tr><td><a href="#example-selection-scope"><code>include</code></a></td><td><code>string[]</code></td><td>—</td><td>限定可触发原生划词的页面区域选择器</td></tr><tr><td><a href="#example-selection-scope"><code>exclude</code></a></td><td><code>string[]</code></td><td>—</td><td>在内置排除规则基础上追加的排除选择器</td></tr><tr><td><a href="#example-selection-scope"><code>selection.maxTextLength</code></a></td><td><code>number | null</code></td><td><code>8000</code></td><td>选区最大 Unicode 码点数（正整数）；<code>null</code> 表示不限制，超限显示禁用入口</td></tr><tr><td><a href="#example-selection-scope"><code>selection.maxTextLengthExceededMessage</code></a></td><td><code>string</code></td><td><code>&#39;划词字数超出限制&#39;</code></td><td>选区超限提示前缀，后面自动追加 <code>当前字数/上限</code></td></tr><tr><td><a href="#example-direction-placement"><code>selection.forwardOnly</code></a></td><td><code>boolean</code></td><td><code>true</code></td><td>仅正向划词触发；设为 <code>false</code> 允许双向选择</td></tr><tr><td><a href="#example-selection-scope"><code>selection.validate</code></a></td><td><code>(snapshot: SelectionSnapshot) =&gt; boolean</code></td><td>内置文本规则</td><td>替代原生 DOM 划词的默认文本校验（不能绕过长度、范围与敏感区检查）</td></tr><tr><td><a href="#example-activation"><code>selection.validateActivation</code></a></td><td><code>(view: QuickAssistActivationView) =&gt; boolean</code></td><td>默认文本规则</td><td>替代主动激活与自定义来源的默认文本校验，不接收 DOM <code>Range</code></td></tr><tr><td><a href="#example-input"><code>trigger.label</code></a></td><td><code>string</code></td><td><code>&#39;智能帮助&#39;</code></td><td>划词入口按钮文案及弹层无障碍名称；按钮默认固定宽 <code>88px</code> 超出省略，建议使用简短文案或覆盖 <code>.tr-quick-assist__trigger</code> 宽度样式</td></tr><tr><td><a href="#example-trigger-delay"><code>trigger.showDelay</code></a></td><td><code>number</code></td><td><code>0</code></td><td>选区稳定后延迟显示入口的毫秒数，须为非负整数</td></tr><tr><td><a href="#example-direction-placement"><code>trigger.offset</code></a></td><td><code>number</code></td><td><code>8</code></td><td>入口及输入浮层与选区的间距（px），须为非负数</td></tr><tr><td><a href="#example-direction-placement"><code>trigger.placement</code></a></td><td><code>QuickAssistPlacement</code></td><td><code>&#39;bottom-end&#39;</code></td><td>入口与输入浮层的优先位置；上方按首行、下方按末行，空间不足自动翻转</td></tr><tr><td><a href="#example-input"><code>input.maxRows</code></a></td><td><code>number</code></td><td><code>2</code></td><td>输入区最多可见行数（正整数），超过后内部滚动</td></tr><tr><td><a href="#example-input"><code>input.maxLength</code></a></td><td><code>number | null</code></td><td>不限制</td><td>输入区 Unicode 码点上限（正整数）；省略或 <code>null</code> 不限制，配置后持续显示计数且超限不可发送</td></tr><tr><td><a href="#example-input"><code>input.autoFill</code></a></td><td><code>boolean</code></td><td><code>false</code></td><td>打开输入区时是否自动预填选中/激活文本，不影响 <code>context.text</code></td></tr><tr><td><a href="#example-input"><code>input.placeholder</code></a></td><td><code>string</code></td><td><code>&#39;告诉 AI 你想做什么&#39;</code></td><td>输入为空时的占位文案</td></tr><tr><td><a href="#example-input"><code>input.ariaLabel</code></a></td><td><code>string</code></td><td><code>&#39;请输入问题&#39;</code></td><td><code>textarea</code> 的无障碍名称（弹层标题使用 <code>trigger.label</code>）</td></tr><tr><td><a href="#example-input"><code>input.submitLabel</code></a></td><td><code>string</code></td><td><code>&#39;发送问题&#39;</code></td><td>图标发送按钮的无障碍名称与悬停标题</td></tr><tr><td><a href="#example-input"><code>input.maxLengthExceededMessage</code></a></td><td><code>string</code></td><td><code>&#39;字数超出限制&#39;</code></td><td>超过 <code>input.maxLength</code> 时发送区域显示的提示文案</td></tr><tr><td><a href="#example-nearby-context"><code>nearbyContext.maxLength</code></a></td><td><code>number</code></td><td><code>500</code></td><td>附近文本最大字符数（正整数）</td></tr><tr><td><a href="#example-nearby-context"><code>nearbyContext.blockSelectors</code></a></td><td><code>string[]</code></td><td><code>p, li, td, th, label, section, fieldset</code></td><td>在内置语义块之外追加的候选块选择器</td></tr><tr><td><a href="#example-nearby-context"><code>getNearbyContext</code></a></td><td><code>GetNearbyContext</code></td><td>—</td><td>自定义原生 DOM 划词的附近文本提取，<code>snapshot</code> 含 DOM <code>Range</code></td></tr><tr><td><a href="#example-context"><code>getContext</code></a></td><td><code>GetBusinessContext</code></td><td>—</td><td>异步或同步返回业务字段，合并到 <code>context.businessContext</code></td></tr><tr><td><a href="#example-context"><code>sanitizeContext</code></a></td><td><code>SanitizeContext</code></td><td>—</td><td>返回最终允许外发的脱敏完整上下文</td></tr><tr><td><a href="#example-suggestions"><code>suggestions</code></a></td><td><code>QuickAssistSuggestionInput[]</code></td><td>内置两条默认模板</td><td>静态推荐或模板工厂数组；<code>[]</code> 表示隐藏默认推荐</td></tr><tr><td><a href="#example-remote-suggestions"><code>getSuggestions</code></a></td><td><code>GetSuggestions</code></td><td>—</td><td>使用当前会话上下文（配置 <code>sanitizeContext</code> 后为脱敏上下文）异步获取远程推荐</td></tr><tr><td><a href="#远程问题校验-validatesuggestion"><code>validateSuggestion</code></a></td><td><code>ValidateSuggestion</code></td><td>基础格式校验</td><td>同步业务校验，仅过滤远程推荐，在合并前执行</td></tr><tr><td><a href="#自定义合并策略-mergesuggestions"><code>mergeSuggestions</code></a></td><td><code>MergeSuggestions</code></td><td>静态优先追加</td><td>远程推荐返回后同步合并静态与远程推荐，最终按 <code>id</code> 去重并裁剪</td></tr><tr><td><a href="#example-suggestions"><code>maxSuggestions</code></a></td><td><code>number</code></td><td><code>2</code></td><td>最多展示的推荐条数（正整数）</td></tr><tr><td><a href="#example-build-prompt"><code>buildPrompt</code></a></td><td><code>BuildPrompt</code></td><td><code>suggestion?.prompt ?? query</code></td><td>自定义最终提交的 <code>prompt</code>；默认不自动拼入 <code>context.text</code></td></tr><tr><td><a href="#example-attrs"><code>attrs</code></a></td><td><code>QuickAssistAttrs</code></td><td>—</td><td>为 6 个内部目标元素追加安全 DOM 属性</td></tr><tr><td><a href="#example-suggestion-messages"><code>messages.loading</code></a></td><td><code>string</code></td><td><code>&#39;正在加载推荐…&#39;</code></td><td>推荐加载中状态文案</td></tr><tr><td><a href="#example-suggestion-messages"><code>messages.empty</code></a></td><td><code>string</code></td><td><code>&#39;暂无推荐&#39;</code></td><td>无可显示推荐时的状态文案</td></tr><tr><td><a href="#example-suggestion-messages"><code>messages.error</code></a></td><td><code>string</code></td><td><code>&#39;推荐加载失败&#39;</code></td><td>推荐加载失败且无可回退推荐时的状态文案</td></tr><tr><td><a href="#example-events"><code>onEvent</code></a></td><td><code>(event: QuickAssistEvent) =&gt; void</code></td><td>—</td><td>统一事件回调；回调内抛错不会打断组件清理</td></tr></tbody></table><h3 id="methods" tabindex="-1">Methods <a class="header-anchor" href="#methods" aria-label="Permalink to &quot;Methods {#methods}&quot;">​</a></h3><p><code>createQuickAssist(options)</code> 返回 <code>QuickAssistInstance</code> 实例，提供以下方法：</p><table tabindex="0"><thead><tr><th>方法名</th><th>签名</th><th>说明</th></tr></thead><tbody><tr><td><a href="#example-activation"><code>activate</code></a></td><td><code>(input: QuickAssistActivationInput | QuickAssistAnchorShortcut) =&gt; void</code></td><td>主动提供文本与定位锚点，触发入口或直接打开浮层；实例停用/销毁时忽略</td></tr><tr><td><a href="#example-register-source"><code>registerSource</code></a></td><td><code>(source: QuickAssistSelectionSource) =&gt; () =&gt; void</code></td><td>注册自动触发来源并返回注销函数，随实例启停联动</td></tr><tr><td><a href="#example-lifecycle"><code>enable</code></a></td><td><code>() =&gt; void</code></td><td>启动划词监听、全局监听及已注册来源；重复调用无副作用</td></tr><tr><td><a href="#example-lifecycle"><code>disable</code></a></td><td><code>() =&gt; void</code></td><td>关闭当前界面并停止监听与已注册来源；之后可再次 <code>enable()</code></td></tr><tr><td><a href="#example-lifecycle"><code>close</code></a></td><td><code>() =&gt; void</code></td><td>关闭当前会话，保持监听启停状态不变</td></tr><tr><td><a href="#example-direction-placement"><code>updateOptions</code></a></td><td><code>(partial: Partial&lt;QuickAssistOptions&gt;) =&gt; void</code></td><td>关闭当前会话、作废旧异步任务并更新配置</td></tr><tr><td><a href="#example-lifecycle"><code>destroy</code></a></td><td><code>() =&gt; void</code></td><td>关闭界面并释放所有监听与 DOM；重复调用无副作用</td></tr></tbody></table><p><code>updateOptions</code> 合并与约束规则：</p><ul><li><strong>顶层浅合并、嵌套分组整体替换</strong>：更新 <code>selection</code>、<code>trigger</code>、<code>input</code>、<code>nearbyContext</code>、<code>messages</code>、<code>attrs</code> 中任意分组时，会整体替换该分组，未传入的子字段恢复默认值（例如原配置 <code>trigger: { label: &#39;帮助&#39;, offset: 12 }</code>，调用 <code>updateOptions({ trigger: { showDelay: 200 } })</code> 会把 <code>label</code> 和 <code>offset</code> 恢复默认）。</li><li><strong>清除可选顶层配置</strong>：在顶层显式传入 <code>undefined</code>（如 <code>{ suggestions: undefined, mergeSuggestions: undefined }</code>）可清除该可选配置，恢复省略态。</li><li><strong><code>root</code> 不可更改</strong>：传入不同 <code>Document</code> 会抛错，需先 <code>destroy()</code> 再创建新实例。省略 <code>enabled</code> 时保持当前启停状态。</li></ul><h3 id="configure-vanilla-theme" tabindex="-1">Functions <a class="header-anchor" href="#configure-vanilla-theme" aria-label="Permalink to &quot;Functions {#configure-vanilla-theme}&quot;">​</a></h3><p><code>configureVanillaTheme</code> 用于配置无框架组件的主题，配置类型为 <code>VanillaThemeConfig</code>：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">function</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> configureVanillaTheme</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">config</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VanillaThemeConfig</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">root</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Document</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> void</span></span></code></pre></div><p>按 <code>Document</code> 配置所有 Vanilla 组件（包括 QuickAssist）的主题模式；省略 <code>root</code> 时默认使用当前 <code>document</code>。<code>config</code> 支持三种互斥形态：</p><ul><li><code>{ colorMode: &#39;light&#39; | &#39;dark&#39; | &#39;auto&#39; }</code>：直接指定亮色、暗色或跟随系统；</li><li><code>{ source: VanillaThemeSource }</code>：监听指定元素上的属性或 class（来源元素须在调用时存在）；</li><li><code>{}</code>：恢复默认监听 <code>html[data-tr-color-mode]</code>。</li></ul><p><code>VanillaThemeSource</code> 配置字段：</p><table tabindex="0"><thead><tr><th>字段</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>type</code></td><td><code>&#39;attribute&#39; | &#39;class&#39;</code></td><td>必填</td><td>按属性值或 class 判断主题</td></tr><tr><td><code>selector</code></td><td><code>string</code></td><td><code>&#39;html&#39;</code></td><td>主题来源元素的 CSS 选择器，取首个匹配元素</td></tr><tr><td><code>attribute</code></td><td><code>string</code></td><td><code>&#39;data-tr-color-mode&#39;</code></td><td>仅 <code>attribute</code> 类型：监听的属性名</td></tr><tr><td><code>values.light</code></td><td><code>string</code></td><td><code>&#39;light&#39;</code></td><td>仅 <code>attribute</code> 类型：亮色对应的属性值</td></tr><tr><td><code>values.dark</code></td><td><code>string</code></td><td><code>&#39;dark&#39;</code></td><td>仅 <code>attribute</code> 类型：暗色对应的属性值</td></tr><tr><td><code>darkClass</code></td><td><code>string</code></td><td><code>&#39;dark&#39;</code></td><td>仅 <code>class</code> 类型：暗色 class 名，按完整 token 匹配</td></tr><tr><td><code>lightClass</code></td><td><code>string</code></td><td>—</td><td>仅 <code>class</code> 类型：可选亮色 class 名；亮暗同时存在时暗色优先</td></tr><tr><td><code>defaultMode</code></td><td><code>&#39;light&#39; | &#39;dark&#39;</code></td><td><code>&#39;light&#39;</code></td><td>属性值未知、class 均未匹配或来源元素移除时的回退模式</td></tr></tbody></table><h3 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events {#events}&quot;">​</a></h3><p>所有事件均通过 <code>options.onEvent(event)</code> 回调分发，参数类型为 <code>QuickAssistEvent</code>，统一包含公共字段 <code>{ type, sessionId }</code>：</p><ul><li><code>sessionId: number</code>：实例内划词会话编号，每次接受新选区时递增，用于串联同一次划词从开始到关闭的事件；初始化配置错误发生在划词前，<code>sessionId</code> 为 <code>0</code>。</li></ul><table tabindex="0"><thead><tr><th><code>event.type</code></th><th>附加字段</th><th>触发时机与说明</th></tr></thead><tbody><tr><td><a href="#example-events"><code>selection</code></a></td><td>—</td><td>接受新的合法选区或主动激活</td></tr><tr><td><a href="#example-events"><code>trigger_show</code></a></td><td>—</td><td>展示划词入口</td></tr><tr><td><a href="#example-events"><code>trigger_click</code></a></td><td>—</td><td>点击划词入口</td></tr><tr><td><a href="#example-events"><code>popover_show</code></a></td><td>—</td><td>展示输入浮层</td></tr><tr><td><a href="#example-events"><code>suggestion_click</code></a></td><td><code>suggestionId: string</code></td><td>点击推荐项</td></tr><tr><td><a href="#example-events"><code>submit</code></a></td><td>—</td><td>提交请求（不含选区文本或发送内容）</td></tr><tr><td><a href="#example-events"><code>close</code></a></td><td><code>reason: QuickAssistCloseReason</code></td><td>会话关闭，原因取值为 <code>&#39;outside&#39;</code> | <code>&#39;escape&#39;</code> | <code>&#39;scroll&#39;</code> | <code>&#39;anchor-invalid&#39;</code> | <code>&#39;route&#39;</code> | <code>&#39;submit&#39;</code> | <code>&#39;disable&#39;</code> | <code>&#39;destroy&#39;</code> | <code>&#39;update&#39;</code> | <code>&#39;manual&#39;</code> | <code>&#39;reselection&#39;</code></td></tr><tr><td><a href="#example-events"><code>error</code></a></td><td><code>stage: QuickAssistErrorStage</code>, <code>error: Error</code></td><td>发生可恢复或配置错误，详见下方 <code>stage</code> 枚举</td></tr></tbody></table><p><code>QuickAssistErrorStage</code> 全部取值：</p><table tabindex="0"><thead><tr><th><code>stage</code> 值</th><th>触发场景</th></tr></thead><tbody><tr><td><code>&#39;config&#39;</code></td><td><code>createQuickAssist</code> 或 <code>updateOptions</code> 参数校验失败</td></tr><tr><td><code>&#39;context&#39;</code></td><td><code>getContext</code> 或上下文基础提取异常</td></tr><tr><td><code>&#39;sanitize&#39;</code></td><td><code>sanitizeContext</code> 抛错、返回值缺少必填字段或含不可克隆对象</td></tr><tr><td><code>&#39;suggestions&#39;</code></td><td>静态模板求值异常、<code>getSuggestions</code> 失败、响应无效、<code>validateSuggestion</code> / <code>mergeSuggestions</code> 异常</td></tr><tr><td><code>&#39;prompt&#39;</code></td><td><code>buildPrompt</code> 回调抛错</td></tr><tr><td><code>&#39;adapter&#39;</code></td><td><code>adapter.submit(request)</code> 同步抛错或返回被拒绝的 Promise</td></tr><tr><td><code>&#39;callback&#39;</code></td><td><code>attrs.suggestion</code> 渲染回调抛错</td></tr></tbody></table><h3 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types {#types}&quot;">​</a></h3><p>以下公开类型均从 <code>@opentiny/tiny-robot/vanilla</code> 导入：</p><table tabindex="0"><thead><tr><th>类型名</th><th>用途</th><th>说明</th></tr></thead><tbody><tr><td><code>QuickAssistOptions</code></td><td>配置项</td><td><code>createQuickAssist</code> 入参配置</td></tr><tr><td><code>QuickAssistInstance</code></td><td>实例句柄</td><td><code>createQuickAssist</code> 返回值</td></tr><tr><td><code>AIAdapter</code></td><td>宿主适配器</td><td><code>{ submit: (request: AIRequest) =&gt; void | Promise&lt;void&gt; }</code></td></tr><tr><td><code>AIRequest</code></td><td>提交载荷</td><td>传给 <code>adapter.submit</code> 的冻结请求对象</td></tr><tr><td><code>QuickAssistContext</code></td><td>上下文载荷</td><td>传给推荐、<code>buildPrompt</code> 与 <code>adapter</code> 的上下文对象</td></tr><tr><td><code>Suggestion</code> / <code>SuggestionFactory</code></td><td>推荐项</td><td>静态或远程推荐对象 / 延迟求值工厂对象</td></tr><tr><td><code>QuickAssistSuggestionInput</code></td><td>推荐输入联合类型</td><td><code>Suggestion | SuggestionFactory</code></td></tr><tr><td><code>BuildPromptInput</code></td><td>Prompt 构造入参</td><td><code>{ query: string; context: QuickAssistContext; suggestion?: Suggestion }</code></td></tr><tr><td><code>SelectionSnapshot</code></td><td>原生选区快照</td><td>传给 <code>selection.validate</code> 与 <code>getNearbyContext</code>（含 DOM <code>Range</code>）</td></tr><tr><td><code>QuickAssistActivationInput</code> / <code>QuickAssistAnchorShortcut</code></td><td>主动激活入参</td><td>完整几何句柄形式 / DOM 元素快捷形式</td></tr><tr><td><code>QuickAssistActivationView</code></td><td>主动激活只读视图</td><td>传给 <code>selection.validateActivation</code>（不含 DOM <code>Range</code>）</td></tr><tr><td><code>QuickAssistSelectionSource</code></td><td>自定义触发源</td><td><code>registerSource</code> 入参</td></tr><tr><td><code>QuickAssistAttrs</code></td><td>安全 DOM 属性映射</td><td><code>root</code>、<code>trigger</code>、<code>popover</code>、<code>input</code>、<code>submit</code>、<code>suggestion</code></td></tr><tr><td><code>QuickAssistEvent</code> / <code>QuickAssistCloseReason</code> / <code>QuickAssistErrorStage</code></td><td>事件类型</td><td><code>onEvent</code> 回调载荷与枚举</td></tr><tr><td><code>VanillaThemeConfig</code> / <code>VanillaThemeSource</code> / <code>VanillaColorMode</code></td><td>主题配置</td><td><code>configureVanillaTheme</code> 入参类型</td></tr></tbody></table><p>以下为接入时最常用的核心数据结构完整定义（其余签名见对应 API 表格与 <code>@opentiny/tiny-robot/vanilla</code> 类型声明）：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> AIRequest</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  source</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 手动提交为去首尾空白的输入；点击推荐项为推荐项的 label */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  query</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  prompt</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  context</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> QuickAssistContext</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  suggestion</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Suggestion</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> QuickAssistContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  source</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  text</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 仅包含文本摘要，不含 DOM Range */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  selection</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">text</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  page</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">title</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">url</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  nearbyText</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  businessContext</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  meta</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Suggestion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  label</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  prompt</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 可结构化克隆的元数据，不支持共享内存；仅 Suggestion 支持，SuggestionFactory 无此字段 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  meta</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SuggestionFactory</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  getLabel</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">context</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> QuickAssistContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  getPrompt</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">context</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> QuickAssistContext</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SelectionSnapshot</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  text</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  direction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;forward&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;backward&#39;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">  /** 原生 DOM Range，仅在本地校验/提取阶段使用，切勿序列化后外发 */</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  range</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Range</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  rect</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> DOMRectReadOnly</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  clientRects</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> DOMRectReadOnly</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  anchorElement</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Element</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> null</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  root</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Document</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  createdAt</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> number</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> QuickAssistAttrs</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  root</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> QuickAssistAttributeMap</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  trigger</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> QuickAssistAttributeMap</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  popover</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> QuickAssistAttributeMap</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  input</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> QuickAssistAttributeMap</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  submit</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> QuickAssistAttributeMap</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  suggestion</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> QuickAssistAttributeMap</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> ((</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">suggestion</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Suggestion</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> QuickAssistAttributeMap</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="css-variables" tabindex="-1">CSS Variables <a class="header-anchor" href="#css-variables" aria-label="Permalink to &quot;CSS Variables {#css-variables}&quot;">​</a></h3><p><span id="css-变量"></span></p><p>QuickAssist 支持在 <code>.tr-quick-assist</code> 上覆盖以下 CSS 变量。默认值随 Vanilla 主题变化；未继承宿主 <code>--tr-*</code> 主题变量时使用组件内置默认配色。</p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th><th>默认值（浅色 / 深色）</th></tr></thead><tbody><tr><td><code>--tr-quick-assist-bg</code></td><td>入口背景色及浅色浮层基础背景色</td><td><code>#fff</code> / <code>#262626</code>，可继承 <code>--tr-container-bg-default</code></td></tr><tr><td><code>--tr-quick-assist-popover-bg</code></td><td>输入浮层、输入框及发送按钮背景色</td><td><code>var(--tr-quick-assist-bg)</code> / <code>#1a1a1a</code></td></tr><tr><td><code>--tr-quick-assist-text</code></td><td>主要文字颜色</td><td><code>#191919</code> / <code>#e6e6e6</code>，可继承 <code>--tr-text-primary</code></td></tr><tr><td><code>--tr-quick-assist-muted</code></td><td>入口悬停文字、推荐问题、输入框占位文字及状态提示颜色</td><td><code>#595959</code> / <code>#b3b3b3</code>，可继承 <code>--tr-text-secondary</code></td></tr><tr><td><code>--tr-quick-assist-border</code></td><td>输入框、推荐问题描边及滚动条轨道参考色</td><td><code>#e6e6e6</code> / <code>rgba(255, 255, 255, 0.2)</code>，可继承 <code>--tr-assist-border-color</code></td></tr><tr><td><code>--tr-quick-assist-trigger-border</code></td><td>入口描边颜色，悬停时保持不变</td><td><code>#dbdbdb</code> / <code>rgba(255, 255, 255, 0.2)</code>，可继承 <code>--tr-assist-trigger-border-color</code></td></tr><tr><td><code>--tr-quick-assist-popover-border</code></td><td>输入浮层外描边颜色，悬停时保持不变</td><td><code>var(--tr-quick-assist-trigger-border)</code>（<code>#dbdbdb</code> / <code>rgba(255, 255, 255, 0.2)</code>）</td></tr><tr><td><code>--tr-quick-assist-hover-bg</code></td><td>推荐问题悬停背景色</td><td><code>#f5f5f5</code> / <code>#262626</code>，可继承 <code>--tr-assist-suggestion-bg-hover</code></td></tr><tr><td><code>--tr-quick-assist-suggestion-bg</code></td><td>推荐问题默认背景色</td><td><code>var(--tr-quick-assist-popover-bg)</code>（<code>#fff</code> / <code>#1a1a1a</code>）</td></tr><tr><td><code>--tr-quick-assist-glow-opacity</code></td><td>输入框下沿四色渐变光晕透明度，设为 <code>0</code> 可隐藏</td><td><code>0.16</code> / <code>0.3</code></td></tr><tr><td><code>--tr-quick-assist-scrollbar-thumb</code></td><td>输入框溢出时 4×16px 滚动条滑块颜色</td><td><code>#dbdbdb</code> / <code>#808080</code>（深色可继承 <code>--tr-text-disabled</code>）</td></tr><tr><td><code>--tr-quick-assist-accent</code></td><td>入口、发送按钮及推荐问题键盘聚焦轮廓颜色</td><td><code>#191919</code> / <code>#e6e6e6</code>，可继承 <code>--tr-text-primary</code></td></tr><tr><td><code>--tr-quick-assist-radius</code></td><td>输入浮层圆角</td><td><code>16px</code></td></tr><tr><td><code>--tr-quick-assist-pill-radius</code></td><td>入口及推荐问题按钮圆角</td><td><code>var(--tr-radius-full, 9999px)</code></td></tr><tr><td><code>--tr-quick-assist-shadow</code></td><td>入口及输入浮层阴影</td><td><code>0 2px 8px 0 rgba(0, 0, 0, 0.16)</code> / <code>0 2px 8px 0 rgba(0, 0, 0, 0.48)</code></td></tr><tr><td><code>--tr-quick-assist-z-index</code></td><td>组件层级</td><td><code>var(--tr-z-index-popover, 1500)</code></td></tr><tr><td><code>--tr-quick-assist-popover-width</code></td><td>输入浮层宽度（仍受视口宽度减 <code>16px</code> 限制）</td><td><code>344px</code></td></tr><tr><td><code>--tr-quick-assist-selection-disabled-text</code></td><td>选区超限时禁用入口文字颜色</td><td><code>#c4c4c4</code> / <code>var(--tr-text-disabled, #808080)</code></td></tr><tr><td><code>--tr-quick-assist-selection-disabled-border</code></td><td>选区超限时禁用入口描边颜色</td><td><code>#dbdbdb</code> / <code>var(--tr-quick-assist-trigger-border)</code></td></tr><tr><td><code>--tr-quick-assist-selection-error</code></td><td>选区超限提示中当前字数的警示颜色</td><td><code>#f63737</code> / <code>var(--tr-color-error, #d94838)</code></td></tr></tbody></table><blockquote><p>AI 图标和发送图标使用随深浅主题与禁用状态切换的内置 SVG 资源，不受 <code>--tr-quick-assist-text</code> 或 <code>--tr-quick-assist-accent</code> 控制。</p></blockquote><p>覆盖变量示例（全局样式与深色模式专用覆盖，需置于组件样式之后）：</p><div class="language-css vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">css</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">.tr-quick-assist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-quick-assist-bg</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">#f5f9ff</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-quick-assist-text</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">#183153</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-quick-assist-radius</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">12</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">.tr-quick-assist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">data-tr-vanilla-color-mode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;dark&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">] {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-quick-assist-popover-border</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">transparent</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-quick-assist-glow-opacity</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0.4</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>结合 <code>attrs.popover.class</code> 按实例调整浮层宽度：</p><div class="language-ts vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">ts</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">createQuickAssist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">({</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  adapter,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  attrs: { popover: { class: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;business-quick-assist&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } },</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">})</span></span></code></pre></div><div class="language-css vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">css</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">.business-quick-assist</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-quick-assist-popover-width</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">400</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h2 id="常见问题" tabindex="-1">常见问题 <a class="header-anchor" href="#常见问题" aria-label="Permalink to &quot;常见问题&quot;">​</a></h2><table tabindex="0"><thead><tr><th>常见现象</th><th>可能原因与排查方向</th></tr></thead><tbody><tr><td>划词后没有出现“智能帮助”入口</td><td>① 反向拖选被默认 <code>selection.forwardOnly: true</code> 拦截（可从左向右选择或设为 <code>false</code>）；② 选区超出 <code>include</code> 范围或落在表单、编辑器、<code>[data-sensitive]</code> 等排除区；③ 选区为纯数字、纯标点、URL 或 UUID 被内置文本规则过滤；④ 实例当前处于 <code>disable()</code> 状态；⑤ 移动端长按不触发原生划词链路</td></tr><tr><td>打开浮层后输入框是空的，没有填入选中文字</td><td><code>input.autoFill</code> 默认为 <code>false</code>，但选区原文始终保留在 <code>request.context.text</code> 中；如需预填，可配置 <code>input.autoFill: true</code> 或在单次激活时传 <code>activate({ autoFill: true })</code></td></tr><tr><td>远程推荐已返回，但界面未显示或条数不全</td><td>① 同时配置了 <code>suggestions</code> 与 <code>getSuggestions</code> 时，默认静态优先，静态项占满 <code>maxSuggestions</code>（默认 <code>2</code>）会截断远程项，请配置 <code>mergeSuggestions</code> 或增大 <code>maxSuggestions</code>；② 远程项 <code>id</code>/<code>label</code>/<code>prompt</code> 为空白、<code>meta</code> 含不可克隆对象，或被 <code>validateSuggestion</code> 过滤</td></tr><tr><td>点击推荐或发送后浮层关闭了，但没看到 AI 回答</td><td>QuickAssist 不内置回答区，提交后会先关闭浮层再调用 <code>adapter.submit(request)</code>；请在 <code>adapter.submit</code> 中打开并驱动应用已有的对话面板，并确认后端消费了 <code>request.context</code> 或已通过 <code>buildPrompt</code> 拼入 <code>context.text</code></td></tr><tr><td>提交失败时没有错误提示，浮层也没有重新打开</td><td>组件先关闭浮层再提交，失败不会重开界面；请确保 <code>adapter.submit</code> 同步抛错或返回被拒绝的 <code>Promise</code>（异步函数务必 <code>return</code> Promise），并在 <code>onEvent</code> 中监听 <code>event.type === &#39;error&#39; &amp;&amp; event.stage === &#39;adapter&#39;</code></td></tr></tbody></table>`,51))])}}});export{de as __pageData,le as default};
