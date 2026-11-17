<script setup lang="ts">
import { defineComponent, h, markRaw, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { defineTrChatElements } from '../../../chat/src/experimental'
import type { ChatUIData, ChatRuntime } from '../../../chat/src/experimental'
import type { ChatConversation } from '../../../chat/src/types'
const props = defineProps<{ kind: 'chat' | 'ui'; legacy?: boolean }>()
const root = ref<HTMLElement>()
let element: HTMLElement
let revision = 0
const legacyRenderer = markRaw(defineComponent(() => () => h('span', { 'data-legacy-body': '' }, '已有 Vue 正文')))
const roleFallback = markRaw(defineComponent(() => () => h('span', { 'data-role-fallback': '' }, '角色回退')))
const messages = () => [
  { id: 'q', role: 'user', content: '默认 Markdown **保留**' },
  {
    id: 'card',
    role: 'assistant',
    content: [
      { type: 'product-card', title: `产品 ${revision}`, price: 99 },
      { type: 'text', text: '卡片后的默认内容' },
    ],
  },
  { id: 'second', role: 'assistant', content: [{ type: 'product-card', title: '第二张卡片', price: 199 }] },
]
const active = ref<ChatConversation>({ id: 'one', title: '正文适配', messages: messages(), requestState: 'idle' })
const runtime: ChatRuntime = {
  conversations: shallowRef([{ id: 'one', title: '正文适配' }]),
  activeConversation: active,
  composer: {},
  actions: {
    send: async () => true,
    clearActiveConversation() {},
    createConversation() {},
    switchConversation() {},
    renameConversation() {},
    deleteConversation() {},
  },
}
const data = ref<ChatUIData>({ bubble: { messages: messages() } })
function appendContent() {
  for (const item of [active.value.messages[1], data.value.bubble!.messages![1]]) {
    if (Array.isArray(item.content)) item.content[0].title = '流式卡片'
  }
}
function update() {
  revision++
  active.value = { ...active.value, messages: messages() }
  data.value = { bubble: { messages: messages() } }
  Reflect.set(element, 'data', data.value)
}
onMounted(() => {
  defineTrChatElements()
  element = document.createElement(props.kind === 'chat' ? 'tr-chat' : 'tr-chat-ui')
  element.dataset.bubbleHost = ''
  Reflect.set(element, 'ui', {
    layout: { leftAside: false, rightAside: false },
    model: false,
    mcp: false,
    sender: false,
    ...(props.legacy
      ? {
          bubble: {
            bubbleProvider: {
              contentAttributes: { 'data-provider-attr': '保留' },
              contentRendererMatches: [
                {
                  find: (_message: unknown, content: { type: string }) => content.type === 'product-card',
                  priority: 5,
                  renderer: legacyRenderer,
                },
              ],
            },
            bubbleList: { roleConfigs: { assistant: { fallbackContentRenderer: roleFallback } } },
          },
        }
      : {}),
  })
  Reflect.set(element, 'runtime', runtime)
  Reflect.set(element, 'data', data.value)
  root.value!.append(element)
})
onBeforeUnmount(() => element.remove())
</script>
<template>
  <button @click="update">更新正文</button><button @click="appendContent">追加内容字段</button>
  <div ref="root" style="height: 700px" />
</template>
