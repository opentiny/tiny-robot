<script setup lang="ts">
import { defineCustomElement, effectScope, onBeforeUnmount, onMounted, ref } from 'vue'
import Chat from '../../../chat/src/Chat.vue'
import ChatUI from '../../../chat/src/ChatUI.vue'
import { useChatRuntime } from '../../../chat/src'
import { defineTrChatElements, whenTrChatReady } from '../../../chat/src/experimental'
import type { TrChatHTMLElement, TrChatUIHTMLElement } from '../../../chat/src/experimental'

const props = withDefaults(
  defineProps<{
    variant: 'direct' | 'adapted'
    kind?: 'chat' | 'ui'
    controlled?: boolean
    defaultOpen?: boolean
    floating?: boolean
    delayed?: boolean
  }>(),
  { kind: 'chat', controlled: false, defaultOpen: false, floating: false, delayed: false },
)
const mountPoint = ref<HTMLElement | null>(null)
const events = ref<{ name: string; detail: unknown[] }[]>([])
const connected = ref(false)
const readiness = ref('尚未等待')
const makeRuntime = (name: string) => {
  const scope = effectScope()
  const runtime = scope.run(() =>
    useChatRuntime({
      conversation: {
        autoSaveMessages: false,
        useMessageOptions: {
          responseProvider: async () => ({
            id: name,
            object: 'chat.completion',
            created: 1,
            model: 'local',
            system_fingerprint: null,
            choices: [
              {
                index: 0,
                message: { role: 'assistant', content: `回复 ${name}` },
                delta: undefined,
                logprobs: null,
                finish_reason: 'stop',
              },
            ],
          }),
        },
      },
    }),
  )!
  return {
    runtime,
    release() {
      void runtime.actions.abort?.()
      scope.stop()
    },
  }
}
const first = makeRuntime('A')
const second = makeRuntime('B')
let element: TrChatHTMLElement | TrChatUIHTMLElement
let listener: EventListener
let active = first.runtime
function setRuntime() {
  active = connected.value ? second.runtime : first.runtime
  ;(element as TrChatHTMLElement).runtime = active
  connected.value = true
}
function reconnect() {
  element.remove()
  setTimeout(() => mountPoint.value?.append(element), 0)
}
async function waitUntilReady() {
  readiness.value = '等待首次就绪'
  await whenTrChatReady(element)
  element.setInputValue('就绪后的草稿')
  readiness.value = '已就绪'
}
onMounted(() => {
  defineTrChatElements()
  for (const [tag, component] of [
    ['baseline-direct-chat', Chat],
    ['baseline-direct-ui', ChatUI],
  ] as const) {
    if (!customElements.get(tag)) customElements.define(tag, defineCustomElement(component, { shadowRoot: false }))
  }
  const tag =
    props.variant === 'adapted' ? (props.kind === 'chat' ? 'tr-chat' : 'tr-chat-ui') : `baseline-direct-${props.kind}`
  element = document.createElement(tag) as typeof element
  element.setAttribute('data-baseline', '')
  element.title = '基线标题'
  element.ui = {
    layout: {
      surface: { mode: props.floating ? 'floating' : 'normal' },
      leftAside: props.floating ? false : { open: true, width: 220 },
      rightAside: props.floating ? false : { width: 260 },
    },
    welcome: { title: '基线欢迎' },
    prompts: false,
    model: false,
    mcp: false,
    extensions: {
      tabs: [{ id: 'skills', label: '基线扩展', items: [{ id: 'local', name: '本地能力', installed: true }] }],
    },
    sender: { mode: 'multiple', placeholder: '基线输入' },
  }
  element.defaultRightAsideOpen = props.defaultOpen
  element.defaultActiveRightAsidePanelId = 'mcp'
  if (props.controlled) {
    element.rightAsideOpen = false
    element.activeRightAsidePanelId = 'mcp'
  }
  if (props.floating)
    element.floatingState = { placement: 'top-left', width: 640, height: 480, offsetX: 24, offsetY: 32 }
  if (props.kind === 'chat') {
    if (!props.delayed) {
      ;(element as TrChatHTMLElement).runtime = first.runtime
      connected.value = true
    }
    ;(element as TrChatHTMLElement).historyData = [{ group: '历史分组', items: [{ id: 'record', title: '历史条目' }] }]
  } else {
    const ui = element as TrChatUIHTMLElement
    ui.data = {
      conversation: {
        title: '界面标题',
        history: [{ group: '历史分组', items: [{ id: 'record', title: '历史条目' }] }],
      },
    }
    ui.defaultInputValue = '初始草稿'
    if (props.controlled) ui.inputValue = '受控初值'
  }
  listener = (event) => events.value.push({ name: event.type, detail: (event as CustomEvent).detail })
  for (const name of [
    'ready',
    'update:inputValue',
    'update:input-value',
    'input-value-update',
    'submit',
    'update:right-aside-open',
    'right-aside-open-update',
    'update:active-right-aside-panel-id',
    'active-right-aside-panel-id-update',
    'history-action',
  ])
    element.addEventListener(name, listener)
  mountPoint.value!.append(element)
})
onBeforeUnmount(() => {
  element?.remove()
  first.release()
  second.release()
})
</script>
<template>
  <button @click="active.actions.send = async () => false">拒绝后续发送</button
  ><button @click="setRuntime">接入或替换 Runtime</button><button @click="reconnect">重连同一元素</button>
  <button @click="waitUntilReady">等待就绪并设置草稿</button>
  <output data-testid="baseline-readiness">{{ readiness }}</output>
  <output data-testid="baseline-events">{{ JSON.stringify(events) }}</output>
  <div ref="mountPoint" style="width: 1200px; height: 760px" />
</template>
