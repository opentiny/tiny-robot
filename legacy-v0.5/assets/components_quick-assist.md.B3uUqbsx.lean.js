const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/events.ByIMO2ZB.js","assets/chunks/framework.Dw8jt1Jz.js","assets/chunks/style.aApEKVpH.js","assets/chunks/lifecycle.BZyVgEx1.js","assets/chunks/monaco.DvmNRM1v.js","assets/chunks/activation.DD8rUZsu.js","assets/chunks/build-prompt.kzHqfTTZ.js","assets/chunks/context.DDrOW8dr.js","assets/chunks/suggestion-validation.CRhSIkfG.js","assets/chunks/remote-recommendations.BfAMUYZl.js","assets/chunks/recommendations.DyOG7w1h.js","assets/chunks/input.DOtA68P5.js","assets/chunks/trigger-delay.DFceHaLP.js","assets/chunks/direction-placement.D81SIvyD.js","assets/chunks/selection-scope.DcrLfGQA.js","assets/chunks/vue-chat.D0Mzp6b7.js","assets/chunks/theme.MY0DDsqj.js","assets/chunks/basic.BxowUFA8.js"])))=>i.map(i=>d[i]);
import{aD as h,aZ as S,aL as j,v as L,H as c,bL as o,bB as l,J as t,bk as s,bJ as i,G as k,w as y,I as m,aU as R,b7 as u,bQ as g}from"./chunks/framework.Dw8jt1Jz.js";import{L as r,N as p}from"./chunks/index.DDu3Iq4c.js";const W="/tiny-robot/legacy-v0.5/images/quick-assist-flow.svg",Q=`<!doctype html>
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
`,I=`<template>
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
`,N=`<template>
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
`,V=`<template>
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
`,P=`<template>
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
`,G=`<template>
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
`,U=`<template>
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
`,z=`<template>
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
`,Y=`<template>
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
`,J=`<template>
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
`,O=`<template>
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
`,H=`<template>
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
`,$=`<!doctype html>
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
`,te="/tiny-robot/legacy-v0.5/assets/vanilla.global.CZ4nztEO.js",se={class:"qa-theme-demo"},oe=JSON.parse('{"title":"QuickAssist 智能帮助","description":"","frontmatter":{"outline":[2,3]},"headers":[],"relativePath":"components/quick-assist.md","filePath":"components/quick-assist.md"}'),ne={name:"components/quick-assist.md"},le=Object.assign(ne,{setup(ie){const E=u();h(async()=>{E.value=(await g(async()=>{const{default:a}=await import("./chunks/events.ByIMO2ZB.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const v=u();h(async()=>{v.value=(await g(async()=>{const{default:a}=await import("./chunks/lifecycle.BZyVgEx1.js");return{default:a}},__vite__mapDeps([3,2,1]))).default});const b=u();h(async()=>{b.value=(await g(async()=>{const{default:a}=await import("./chunks/monaco.DvmNRM1v.js");return{default:a}},__vite__mapDeps([4,1,2]))).default});const f=u();h(async()=>{f.value=(await g(async()=>{const{default:a}=await import("./chunks/activation.DD8rUZsu.js");return{default:a}},__vite__mapDeps([5,1,2]))).default});const x=u();h(async()=>{x.value=(await g(async()=>{const{default:a}=await import("./chunks/build-prompt.kzHqfTTZ.js");return{default:a}},__vite__mapDeps([6,2,1]))).default});const F=u();h(async()=>{F.value=(await g(async()=>{const{default:a}=await import("./chunks/context.DDrOW8dr.js");return{default:a}},__vite__mapDeps([7,2,1]))).default});const A=u();h(async()=>{A.value=(await g(async()=>{const{default:a}=await import("./chunks/suggestion-validation.CRhSIkfG.js");return{default:a}},__vite__mapDeps([8,1,2]))).default});const q=u();h(async()=>{q.value=(await g(async()=>{const{default:a}=await import("./chunks/remote-recommendations.BfAMUYZl.js");return{default:a}},__vite__mapDeps([9,1,2]))).default});const C=u();h(async()=>{C.value=(await g(async()=>{const{default:a}=await import("./chunks/recommendations.DyOG7w1h.js");return{default:a}},__vite__mapDeps([10,2,1]))).default});const _=u();h(async()=>{_.value=(await g(async()=>{const{default:a}=await import("./chunks/input.DOtA68P5.js");return{default:a}},__vite__mapDeps([11,1,2]))).default});const w=u();h(async()=>{w.value=(await g(async()=>{const{default:a}=await import("./chunks/trigger-delay.DFceHaLP.js");return{default:a}},__vite__mapDeps([12,2,1]))).default});const B=u();h(async()=>{B.value=(await g(async()=>{const{default:a}=await import("./chunks/direction-placement.D81SIvyD.js");return{default:a}},__vite__mapDeps([13,1,2]))).default});const D=u();h(async()=>{D.value=(await g(async()=>{const{default:a}=await import("./chunks/selection-scope.DcrLfGQA.js");return{default:a}},__vite__mapDeps([14,2,1]))).default});const T=u();h(async()=>{T.value=(await g(async()=>{const{default:a}=await import("./chunks/vue-chat.D0Mzp6b7.js");return{default:a}},__vite__mapDeps([15,16,1,2]))).default});const n=R(!0),M=u();return h(async()=>{M.value=(await g(async()=>{const{default:a}=await import("./chunks/basic.BxowUFA8.js");return{default:a}},__vite__mapDeps([17,2,1]))).default}),typeof window<"u"&&(window.__tinyRobotVanillaDemoGlobalUrl=te),(a,e)=>{const d=S("ClientOnly");return j(),L("div",null,[e[17]||(e[17]=c("",24)),o(t(s(r),null,null,512),[[l,n.value]]),t(d,null,{default:i(()=>[t(s(p),{title:"基础用法",description:"从左向右选中文字并提交，观察 adapter.submit(request) 收到的核心字段。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{n.value=!1}),vueCode:s(ee)},k({_:2},[M.value?{name:"vue",fn:i(()=>[t(s(M))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[18]||(e[18]=c("",3)),o(t(s(r),null,null,512),[[l,n.value]]),t(d,null,{default:i(()=>[t(s(p),{title:"Vue 对话面板接入",description:"划词后打开 TinyRobot 对话面板，并自动提交 prompt 与脱敏上下文。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{n.value=!1}),vueCode:s(K)},k({_:2},[T.value?{name:"vue",fn:i(()=>[t(s(T))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[19]||(e[19]=y("h3",{id:"example-html",tabindex:"-1"},[m("HTML 接入 "),y("a",{class:"header-anchor",href:"#example-html","aria-label":'Permalink to "HTML 接入 {#example-html}"'},"​")],-1)),e[20]||(e[20]=y("p",null,[m("下面的原生 HTML 示例通过全局脚本 "),y("code",null,"window.TinyRobotVanilla"),m(" 接入，并将提交的请求对象展示在模拟对话面板中。迁移到独立项目时，在 "),y("code",null,"<head>"),m(" 中先通过 "),y("code",null,'<script src=".../vanilla.global.js"><\/script>'),m(" 引入构建产物或已发布 CDN 脚本即可——示例中若检测到已存在 "),y("code",null,"window.TinyRobotVanilla"),m(" 会自动跳过文档站预览加载器（也可直接删除注释第 1 段的预览适配代码）。")],-1)),o(t(s(r),null,null,512),[[l,n.value]]),t(d,null,{default:i(()=>[t(s(p),{title:"HTML 接入",description:"通过全局脚本接入，划词后查看提交给应用的完整请求内容。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{n.value=!1}),htmlCode:s($)},null,8,["htmlCode"])]),_:1}),e[21]||(e[21]=c("",5)),o(t(s(r),null,null,512),[[l,n.value]]),t(d,null,{default:i(()=>[t(s(p),{title:"可选择区域与长度限制",description:"仅指定区域内的有效选区显示入口，超限后禁用并提供字数提示。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[3]||(e[3]=()=>{n.value=!1}),vueCode:s(X)},k({_:2},[D.value?{name:"vue",fn:i(()=>[t(s(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[22]||(e[22]=c("",5)),o(t(s(r),null,null,512),[[l,n.value]]),t(d,null,{default:i(()=>[t(s(p),{title:"划词方向与首末行定位",description:"切换方向限制和入口位置，跨行选中文字观察入口对齐。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[4]||(e[4]=()=>{n.value=!1}),vueCode:s(H)},k({_:2},[B.value?{name:"vue",fn:i(()=>[t(s(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[23]||(e[23]=c("",5)),o(t(s(r),null,null,512),[[l,n.value]]),t(d,null,{default:i(()=>[t(s(p),{title:"延迟显示划词入口",description:"切换立即显示与延迟 300 毫秒，对比划词体验。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[5]||(e[5]=()=>{n.value=!1}),vueCode:s(O)},k({_:2},[w.value?{name:"vue",fn:i(()=>[t(s(w))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[24]||(e[24]=y("h2",{id:"输入与推荐",tabindex:"-1"},[m("输入与推荐 "),y("a",{class:"header-anchor",href:"#输入与推荐","aria-label":'Permalink to "输入与推荐"'},"​")],-1)),e[25]||(e[25]=y("h3",{id:"example-input",tabindex:"-1"},[m("输入区配置 "),y("a",{class:"header-anchor",href:"#example-input","aria-label":'Permalink to "输入区配置 {#example-input}"'},"​")],-1)),o(t(s(r),null,null,512),[[l,n.value]]),t(d,null,{default:i(()=>[t(s(p),{title:"输入区配置",description:"调整实例配置并划词体验，再用下方按钮对比实例默认与单次预填覆盖。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[6]||(e[6]=()=>{n.value=!1}),vueCode:s(J)},k({_:2},[_.value?{name:"vue",fn:i(()=>[t(s(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[26]||(e[26]=c("",4)),o(t(s(r),null,null,512),[[l,n.value]]),t(d,null,{default:i(()=>[t(s(p),{title:"静态与异步推荐",description:"查看静态推荐与异步推荐的加载、合并与直接提交效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[7]||(e[7]=()=>{n.value=!1}),vueCode:s(Y)},k({_:2},[C.value?{name:"vue",fn:i(()=>[t(s(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[27]||(e[27]=c("",6)),o(t(s(r),null,null,512),[[l,n.value]]),t(d,null,{default:i(()=>[t(s(p),{title:"远程推荐与覆盖策略",description:"切换策略和模拟响应后重新划词，观察静态回退与合并效果。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[8]||(e[8]=()=>{n.value=!1}),vueCode:s(z)},k({_:2},[q.value?{name:"vue",fn:i(()=>[t(s(q))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[28]||(e[28]=c("",8)),o(t(s(r),null,null,512),[[l,n.value]]),t(d,null,{default:i(()=>[t(s(p),{title:"远程问题校验前后对比",description:"对比原始问题与最终问题，查看空白、超长、不相关问题的过滤原因，以及全部无效时的静态回退。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[9]||(e[9]=()=>{n.value=!1}),vueCode:s(U)},k({_:2},[A.value?{name:"vue",fn:i(()=>[t(s(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[29]||(e[29]=c("",8)),o(t(s(r),null,null,512),[[l,n.value]]),t(d,null,{default:i(()=>[t(s(p),{title:"上下文与脱敏",description:"选中虚构租户编号并提交，查看脱敏后的 prompt 与 context。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[10]||(e[10]=()=>{n.value=!1}),vueCode:s(G)},k({_:2},[F.value?{name:"vue",fn:i(()=>[t(s(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[30]||(e[30]=c("",13)),o(t(s(r),null,null,512),[[l,n.value]]),t(d,null,{default:i(()=>[t(s(p),{title:"自定义发送内容",description:"对比手动输入与推荐项提交时的 query、prompt 和 context.text。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[11]||(e[11]=()=>{n.value=!1}),vueCode:s(P)},k({_:2},[x.value?{name:"vue",fn:i(()=>[t(s(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[31]||(e[31]=c("",4)),o(t(s(r),null,null,512),[[l,n.value]]),t(d,null,{default:i(()=>[t(s(p),{title:"主动激活与自定义定位",description:"点击按钮或指标卡片主动触发，切换直接输入与悬停入口，对比默认推荐与本次专属推荐。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[12]||(e[12]=()=>{n.value=!1}),vueCode:s(V)},k({_:2},[f.value?{name:"vue",fn:i(()=>[t(s(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[32]||(e[32]=c("",10)),o(t(s(r),null,null,512),[[l,n.value]]),t(d,null,{default:i(()=>[t(s(p),{title:"Monaco 主动选区解释",description:"选词完成后通过通用 activate() 接口定位到选区末端并展示代码专属推荐。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[13]||(e[13]=()=>{n.value=!1}),vueCode:s(N)},k({_:2},[b.value?{name:"vue",fn:i(()=>[t(s(b))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[33]||(e[33]=c("",9)),o(t(s(r),null,null,512),[[l,n.value]]),t(d,null,{default:i(()=>[t(s(p),{title:"启停与关闭会话",description:"通过按钮控制划词启停状态，并模拟路由切换关闭当前会话。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[14]||(e[14]=()=>{n.value=!1}),vueCode:s(Z)},k({_:2},[v.value?{name:"vue",fn:i(()=>[t(s(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[34]||(e[34]=c("",10)),o(t(s(r),null,null,512),[[l,n.value]]),t(d,null,{default:i(()=>[t(s(p),{title:"事件监听与会话日志",description:"观察完整交互事件、会话编号、关闭原因和模拟提交错误。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[15]||(e[15]=()=>{n.value=!1}),vueCode:s(I)},k({_:2},[E.value?{name:"vue",fn:i(()=>[t(s(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[35]||(e[35]=c("",6)),y("div",se,[o(t(s(r),null,null,512),[[l,n.value]]),t(d,null,{default:i(()=>[t(s(p),{title:"主题切换",description:"切换亮色、暗色或跟随系统，选中文字查看入口和浮层；独立项目预先引入 vanilla.global.js 后会自动复用全局对象。",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[16]||(e[16]=()=>{n.value=!1}),htmlCode:s(Q)},null,8,["htmlCode"])]),_:1})]),e[36]||(e[36]=c("",51))])}}});export{oe as __pageData,le as default};
