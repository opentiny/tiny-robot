<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, shallowRef, triggerRef } from 'vue'
import {
  TrBubbleList,
  TrBubbleProvider,
  TrHistory,
  TrLayout,
  TrPrompts,
  TrSender,
  TrWelcome,
  type BubbleMessage,
  type HistoryMenuItem,
  type PromptProps,
} from '@opentiny/tiny-robot'
import { IconNewSession } from '@opentiny/tiny-robot-svgs'
import type { ChatProcessingState, ChatRequestState } from '../../src'
import { createDemoReply } from '../scenario'

/** Basic 直接使用原子组件，因此在页面内声明组件所需的数据结构。 */
type DemoSession = {
  id: string
  title: string
  createdAt: number
  updatedAt: number
}

type DemoMessage = BubbleMessage & {
  id: string
}

/** 固定 UI 配置不参与业务状态变化，可以安全地定义在响应式状态之外。 */
const DEFAULT_SESSION_TITLE = '新对话'
const historyMenuItems: HistoryMenuItem[] = [
  { id: 'rename', text: '重命名' },
  { id: 'delete', text: '删除' },
]
const promptItems: PromptProps[] = [
  { id: 'basic-intro', label: '介绍一下 TinyRobot Chat' },
  { id: 'basic-vue', label: '生成一个 Vue 组件示例' },
  { id: 'basic-runtime', label: '解释 runtime 和 ui 的职责' },
]
const bubbleRoleConfigs = {
  user: { placement: 'end' as const },
  assistant: { placement: 'start' as const },
}

/** 页面源状态：会话、消息、输入草稿和请求生命周期都由 Basic 自己维护。 */
const sessions = shallowRef<DemoSession[]>([])
const messagesBySession = reactive<Record<string, DemoMessage[]>>({})
const currentSessionId = shallowRef<string | null>(null)
const inputValue = shallowRef('')
const requestState = shallowRef<ChatRequestState>('idle')
const processingState = shallowRef<ChatProcessingState | undefined>()
const loading = shallowRef(false)
const error = shallowRef<unknown | null>(null)
const isMobile = shallowRef(false)
const leftAsideOpen = shallowRef(true)

/** 非响应式控制对象只用于管理浏览器监听和当前模拟请求。 */
let mediaQuery: MediaQueryList | null = null
let idSeed = 0
let activeRequestToken = 0
let pendingAbortController: AbortController | null = null

/** 派生状态将页面源数据转换成各原子组件直接消费的值。 */
const historyItems = computed(() => [...sessions.value].sort((left, right) => right.updatedAt - left.updatedAt))
const currentSession = computed<DemoSession | null>(() => {
  if (!currentSessionId.value) {
    return null
  }

  for (const item of sessions.value) {
    if (item.id === currentSessionId.value) {
      return item
    }
  }

  return null
})
const currentMessages = computed(() => {
  if (!currentSessionId.value) {
    return []
  }

  return messagesBySession[currentSessionId.value] ?? []
})
const isEmpty = computed(() => currentMessages.value.length === 0)
const submitDisabled = computed(() => loading.value || inputValue.value.trim().length === 0)
const layoutProps = computed(() => ({
  class: 'basic-demo',
  mode: 'normal' as const,
  leftAside: {
    mode: isMobile.value ? ('drawer' as const) : ('dock' as const),
    open: leftAsideOpen.value,
    expandedWidth: isMobile.value ? 280 : 260,
  },
  onLeftAsideOpenChange: handleLeftAsideOpenChange,
}))
const currentTitle = computed(() => currentSession.value?.title ?? 'Basic')
const welcomeProps = computed(() => ({
  title: 'Basic',
  description: '直接组合 Layout / History / BubbleList / Sender 的单文件教学基线。',
}))

/** 基础工具负责生成演示数据，并同步桌面与移动端布局状态。 */
function createId(prefix: string) {
  idSeed += 1
  return `${prefix}-${Date.now()}-${idSeed}`
}

function applyViewport(matches: boolean) {
  isMobile.value = matches
  leftAsideOpen.value = !matches
}

function handleMediaQueryChange(event: MediaQueryListEvent) {
  applyViewport(event.matches)
}

/** 请求上下文集中处理切换或删除会话时的取消和状态复位。 */
function cancelActiveRequestContext() {
  if (!pendingAbortController) {
    return
  }

  activeRequestToken += 1
  pendingAbortController.abort()
  pendingAbortController = null
  loading.value = false
  requestState.value = 'idle'
  processingState.value = undefined
  error.value = null
}

function getSessionMessages(sessionId: string) {
  const current = messagesBySession[sessionId]

  if (current) {
    return current
  }

  const next: DemoMessage[] = []
  messagesBySession[sessionId] = next
  return next
}

/** 会话动作直接修改本地数据，对应后续 ChatRuntime 的 conversations actions。 */
function createConversation(title = DEFAULT_SESSION_TITLE) {
  const now = Date.now()
  const session: DemoSession = {
    id: createId('session'),
    title,
    createdAt: now,
    updatedAt: now,
  }

  sessions.value = [session, ...sessions.value]
  messagesBySession[session.id] = []
  currentSessionId.value = session.id
  inputValue.value = ''
  requestState.value = 'idle'
  processingState.value = undefined
  error.value = null
  return session
}

function switchConversation(id: string) {
  if (!messagesBySession[id]) {
    return
  }

  if (loading.value && currentSessionId.value !== id) {
    cancelActiveRequestContext()
  }

  currentSessionId.value = id
  requestState.value = 'idle'
  processingState.value = undefined
  error.value = null
}

function renameConversation(id: string, title: string) {
  let session: DemoSession | null = null

  for (const item of sessions.value) {
    if (item.id === id) {
      session = item
      break
    }
  }

  if (!session) {
    return
  }

  session.title = title.trim() || DEFAULT_SESSION_TITLE
  session.updatedAt = Date.now()
  triggerRef(sessions)
}

function deleteConversation(id: string) {
  if (loading.value && currentSessionId.value === id) {
    cancelActiveRequestContext()
  }

  delete messagesBySession[id]
  sessions.value = sessions.value.filter((item) => item.id !== id)

  if (currentSessionId.value === id) {
    currentSessionId.value = sessions.value[0]?.id ?? null
    requestState.value = 'idle'
    processingState.value = undefined
    error.value = null
  }
}

function setInputValue(value: string) {
  inputValue.value = value
}

/** 发送动作完整演示建会话、追加消息、请求状态、响应和异常收敛。 */
function ensureCurrentSession() {
  return currentSession.value ?? createConversation()
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      signal.removeEventListener('abort', handleAbort)
      resolve()
    }, ms)

    function handleAbort() {
      window.clearTimeout(timer)
      signal.removeEventListener('abort', handleAbort)
      reject(new DOMException('The operation was aborted.', 'AbortError'))
    }

    if (signal.aborted) {
      handleAbort()
      return
    }

    signal.addEventListener('abort', handleAbort)
  })
}

function isAbortError(value: unknown) {
  return value instanceof DOMException && value.name === 'AbortError'
}

async function send(text: string, structuredData?: unknown) {
  const content = text.trim()

  if (!content || loading.value) {
    return
  }

  const session = ensureCurrentSession()
  const sessionMessages = getSessionMessages(session.id)
  const replyMessage: DemoMessage = {
    id: createId('message'),
    role: 'assistant',
    content: '',
    loading: true,
  }
  const userMessage: DemoMessage = {
    id: createId('message'),
    role: 'user',
    content,
    state: structuredData ? { structuredData } : undefined,
  }
  const requestToken = ++activeRequestToken
  const abortController = new AbortController()

  if (sessionMessages.length === 0 && session.title === DEFAULT_SESSION_TITLE) {
    session.title = content.slice(0, 20) || DEFAULT_SESSION_TITLE
  }

  session.updatedAt = Date.now()
  triggerRef(sessions)
  sessionMessages.push(userMessage, replyMessage)
  currentSessionId.value = session.id
  inputValue.value = ''
  loading.value = true
  requestState.value = 'processing'
  processingState.value = 'requesting'
  error.value = null
  pendingAbortController = abortController

  try {
    await wait(220, abortController.signal)

    if (requestToken === activeRequestToken) {
      processingState.value = 'completing'
    }

    await wait(360, abortController.signal)

    replyMessage.loading = false
    replyMessage.content = createDemoReply('Basic Demo', content)

    if (requestToken === activeRequestToken) {
      requestState.value = 'completed'
    }
  } catch (reason) {
    const messageIndex = sessionMessages.findIndex((item) => item.id === replyMessage.id)

    if (messageIndex !== -1) {
      sessionMessages.splice(messageIndex, 1)
    }

    if (requestToken === activeRequestToken) {
      if (isAbortError(reason)) {
        requestState.value = 'aborted'
      } else {
        error.value = reason
        requestState.value = 'error'
      }
    }
  } finally {
    if (pendingAbortController === abortController) {
      pendingAbortController = null
    }

    if (requestToken !== activeRequestToken) {
      return
    }

    loading.value = false
    processingState.value = undefined
  }
}

async function abort() {
  pendingAbortController?.abort()
}

/** 事件 handler 把原子组件事件连接到本地动作，是 Basic 中主要的事件胶水。 */
function handleCreateConversation() {
  if (loading.value) {
    cancelActiveRequestContext()
  }

  createConversation()
}

function handleHistoryItemClick(item: DemoSession) {
  switchConversation(item.id)
}

function handleHistoryItemTitleChange(title: string, item: DemoSession) {
  renameConversation(item.id, title)
}

function handleHistoryItemAction(action: HistoryMenuItem, item: DemoSession) {
  if (action.id === 'delete') {
    deleteConversation(item.id)
  }
}

function handleLeftAsideOpenChange(detail: { open: boolean }) {
  leftAsideOpen.value = detail.open
}

function handleBubbleStateChange() {}

function handleBubbleEvent() {}

function handlePromptItemClick(_: MouseEvent, item: PromptProps) {
  if (item.disabled) {
    return
  }

  setInputValue(item.label)
}

function handleSenderUpdateModelValue(value: string) {
  setInputValue(value)
}

function handleSenderSubmit(text: string, structuredData?: unknown) {
  return send(text, structuredData)
}

function handleSenderCancel() {
  return abort()
}

function handleSenderInput(value: string) {
  if (value !== inputValue.value) {
    setInputValue(value)
  }
}

function handleSenderFocus() {}

function handleSenderBlur() {}

function handleSenderClear() {
  setInputValue('')
}

/** computed props 将状态和 handler 组装成每个原子组件的公开输入。 */
const historyProps = computed(() => ({
  data: historyItems.value,
  selected: currentSessionId.value ?? undefined,
  menuItems: historyMenuItems,
  onItemClick: handleHistoryItemClick,
  onItemTitleChange: handleHistoryItemTitleChange,
  onItemAction: handleHistoryItemAction,
}))

const promptsProps = computed(() => ({
  items: promptItems,
  wrap: true,
  onItemClick: handlePromptItemClick,
}))

const bubbleListProps = computed(() => ({
  class: 'basic-demo__bubble-list',
  messages: currentMessages.value,
  roleConfigs: bubbleRoleConfigs,
  autoScroll: true,
  onStateChange: handleBubbleStateChange,
  onBubbleEvent: handleBubbleEvent,
}))

const senderProps = computed(() => ({
  modelValue: inputValue.value,
  mode: 'multiple' as const,
  clearable: true,
  loading: loading.value,
  placeholder: '输入消息验证 Basic 单文件基线',
  defaultActions: {
    submit: {
      disabled: submitDisabled.value,
    },
  },
  'onUpdate:modelValue': handleSenderUpdateModelValue,
  onSubmit: handleSenderSubmit,
  onCancel: handleSenderCancel,
  onInput: handleSenderInput,
  onFocus: handleSenderFocus,
  onBlur: handleSenderBlur,
  onClear: handleSenderClear,
}))

/** 页面生命周期只负责浏览器媒体查询和模拟请求资源的建立与释放。 */
onMounted(() => {
  mediaQuery = window.matchMedia('(max-width: 768px)')
  applyViewport(mediaQuery.matches)
  mediaQuery.addEventListener('change', handleMediaQueryChange)

  if (sessions.value.length === 0) {
    createConversation()
  }
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', handleMediaQueryChange)
  pendingAbortController?.abort()
})
</script>

<template>
  <!-- Layout 只负责应用壳和区域划分，具体内容由各区域插槽直接装配。 -->
  <TrLayout v-bind="layoutProps">
    <template #left-aside>
      <!-- 会话区域直接绑定本地会话状态和生命周期动作。 -->
      <div class="basic-demo__aside">
        <div class="basic-demo__aside-top">
          <button class="basic-demo__new-button" @click="handleCreateConversation">
            <IconNewSession class="basic-demo__new-button-icon" />
            <span>新建对话</span>
          </button>
        </div>

        <div class="basic-demo__aside-list">
          <TrHistory v-bind="historyProps" />
        </div>
      </div>
    </template>

    <template #header>
      <div class="basic-demo__header">
        <div class="basic-demo__header-left">
          <TrLayout.AsideToggle side="left" />
          <div class="basic-demo__header-copy">
            <strong>{{ currentTitle }}</strong>
            <span>Basic</span>
          </div>
        </div>
        <button class="basic-demo__header-action" @click="handleCreateConversation">新建</button>
      </div>
    </template>

    <template #main>
      <!-- 消息区域根据当前消息切换欢迎页和气泡列表。 -->
      <div class="basic-demo__thread" :class="{ 'basic-demo__thread--empty': isEmpty }">
        <div class="basic-demo__content-shell">
          <div class="basic-demo__main-inner">
            <template v-if="isEmpty">
              <TrWelcome v-bind="welcomeProps" />
              <TrPrompts v-bind="promptsProps" />
            </template>

            <TrBubbleProvider v-else>
              <TrBubbleList v-bind="bubbleListProps" />
            </TrBubbleProvider>
          </div>

          <div class="basic-demo__footer-inner">
            <!-- Sender 的草稿、禁用状态和事件全部由当前页面手动连接。 -->
            <TrSender v-bind="senderProps" />
          </div>
        </div>
      </div>
    </template>
  </TrLayout>
</template>

<style scoped>
.basic-demo {
  --tr-layout-height: 100%;
  --tr-layout-aside-bg: #f7f7f8;
  --tr-layout-left-aside-bg: #fff;
  --tr-layout-header-bg: #fff;
  --tr-layout-main-bg: #fff;
  --tr-layout-footer-bg: #fff;
  --tr-bubble-list-padding: 0;
  --tr-chat-content-max-width: 704px;
  height: 100%;
  border-radius: 8px;
  background: #fff;
}

.basic-demo__aside {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  background: #fff;
}

.basic-demo__aside-top {
  flex-shrink: 0;
  padding: 18px 22px;
}

.basic-demo__new-button,
.basic-demo__header-action {
  border: 1px solid #d6d9e0;
  border-radius: 8px;
  background: #fff;
  color: #172033;
  cursor: pointer;
}

.basic-demo__new-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  min-width: 0;
  height: 32px;
  padding: 0 12px;
}

.basic-demo__new-button-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.basic-demo__aside-list {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 0 12px 16px;
  box-sizing: border-box;
}

.basic-demo__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  height: 56px;
  padding: 0 24px;
  box-sizing: border-box;
}

.basic-demo__header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.basic-demo__header-copy {
  display: grid;
  min-width: 0;
}

.basic-demo__header-copy strong,
.basic-demo__header-copy span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.basic-demo__header-copy span {
  color: #667085;
  font-size: 12px;
}

.basic-demo__header-action {
  flex-shrink: 0;
  height: 32px;
  padding: 0 14px;
}

.basic-demo__thread {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.basic-demo__thread--empty .basic-demo__content-shell {
  justify-content: center;
}

.basic-demo__content-shell {
  display: flex;
  flex: 1;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  min-height: 0;
  padding-inline: clamp(12px, 3vw, 24px);
  box-sizing: border-box;
}

.basic-demo__main-inner,
.basic-demo__footer-inner {
  width: 100%;
  max-width: 704px;
  margin-inline: auto;
}

.basic-demo__main-inner {
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin-top: 24px;
}

.basic-demo__thread:not(.basic-demo__thread--empty) .basic-demo__main-inner {
  flex: 1;
}

.basic-demo__bubble-list {
  width: 100%;
  height: 100%;
  min-height: 0;
  padding-bottom: 12px;
  box-sizing: border-box;
}

.basic-demo__footer-inner {
  position: relative;
  flex-shrink: 0;
  padding: 24px 0;
}

@media (max-width: 768px) {
  .basic-demo__header {
    padding: 0 16px;
  }

  .basic-demo__header-action {
    padding: 0 10px;
  }
}
</style>
