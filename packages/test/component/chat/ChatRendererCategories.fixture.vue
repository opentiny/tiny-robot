<script setup lang="ts">
import { computed, ref } from 'vue'
import ChatUI from '../../../chat/src/ChatUI.vue'
import type { ChatUIData, ChatUIOptions } from '../../../chat/src/types'

type Scenario =
  | 'header'
  | 'left-legacy'
  | 'left-granular'
  | 'left-history-prefix'
  | 'empty'
  | 'empty-vue-composer'
  | 'composer'
  | 'bubbles'
  | 'right-parts'
  | 'right-full'

const props = defineProps<{ scenario: Scenario }>()
const chatUI = ref<InstanceType<typeof ChatUI>>()

const data = computed<ChatUIData>(() => ({
  conversation: {
    title: 'Renderer categories',
    activeId: 'conversation-1',
    items: [{ id: 'conversation-1', title: 'Conversation one' }],
  },
  bubble: {
    messages: props.scenario.startsWith('empty')
      ? []
      : [{ id: 'message-1', role: 'assistant', content: [{ type: 'text', text: 'Rendered response' }] }],
  },
  sender: { loading: false, disabled: false, submitDisabled: false },
  request: { state: 'idle' },
}))

const ui = computed<ChatUIOptions>(() => ({
  layout: {
    leftAside: props.scenario.startsWith('left') ? { open: true } : false,
    rightAside: props.scenario.startsWith('right') ? { panels: [{ id: 'details', title: 'Details' }] } : false,
  },
}))

function node(name: string, text: string) {
  const element = document.createElement('div')
  element.dataset.testid = name
  element.textContent = text
  return element
}

const renderers = computed(() => {
  switch (props.scenario) {
    case 'header':
      return {
        'layout-header': (context: { title: string; isEmpty: boolean }) =>
          node('layout-header-renderer', `${context.title}|empty:${context.isEmpty}`),
      }
    case 'left-legacy':
      return {
        'layout-left-aside': (context: { conversation: { title?: string } }) =>
          node('layout-left-aside-renderer', context.conversation.title ?? ''),
        'layout-left-aside-brand': () => node('layout-left-aside-brand-renderer', 'must-not-render'),
      }
    case 'left-granular':
      return {
        'layout-left-aside-brand': () => node('layout-left-aside-brand-renderer', 'brand'),
        'layout-left-aside-actions': () => node('layout-left-aside-actions-renderer', 'actions'),
        'layout-left-aside-content': (context: { history?: readonly unknown[] }) =>
          node('layout-left-aside-content-renderer', `history:${context.history?.length ?? 0}`),
        'layout-left-aside-footer': () => node('layout-left-aside-footer-renderer', 'footer'),
        'layout-left-aside-rail': () => node('layout-left-aside-rail-renderer', 'rail'),
        'layout-left-aside-history-item-prefix': (context: { item: { id: string } }) =>
          node('layout-left-aside-history-prefix-renderer', context.item.id),
      }
    case 'left-history-prefix':
      return {
        'layout-left-aside-history-item-prefix': (context: { item: { id: string } }) =>
          node('layout-left-aside-history-prefix-renderer', context.item.id),
      }
    case 'empty':
      return {
        'layout-empty-state': (context: Record<string, unknown>) =>
          node(
            'layout-empty-state-renderer',
            `empty:${String(context.isEmpty)}|composer:${String('renderComposer' in context)}`,
          ),
      }
    case 'empty-vue-composer':
      return {
        'composer-before': (context: { value: string }) => node('composer-before-renderer', `before:${context.value}`),
        'layout-footer': (context: { loading: boolean }) =>
          node('layout-footer-renderer', `loading:${context.loading}`),
        'composer-after': (context: { submitDisabled: boolean }) =>
          node('composer-after-renderer', `disabled:${context.submitDisabled}`),
      }
    case 'composer':
      return {
        'composer-before': (context: { value: string }) => node('composer-before-renderer', `before:${context.value}`),
        'layout-footer': (context: { loading: boolean }) =>
          node('layout-footer-renderer', `loading:${context.loading}`),
        'composer-after': (context: { submitDisabled: boolean }) =>
          node('composer-after-renderer', `disabled:${context.submitDisabled}`),
      }
    case 'bubbles':
      return {
        'bubble-prefix': (context: { role?: string; messageIndexes: readonly number[] }) =>
          node('bubble-prefix-renderer', `${context.role}:${context.messageIndexes.join(',')}`),
        'bubble-suffix': (context: { role?: string; messageIndexes: readonly number[] }) =>
          node('bubble-suffix-renderer', `${context.role}:${context.messageIndexes.join(',')}`),
        'bubble-after': (context: { role?: string; messageIndexes: readonly number[] }) =>
          node('bubble-after-renderer', `${context.role}:${context.messageIndexes.join(',')}`),
        'bubble-content-footer': (context: {
          role?: string
          messageIndexes: readonly number[]
          contentIndex?: number
        }) =>
          node(
            'bubble-content-footer-renderer',
            `${context.role}:${context.messageIndexes.join(',')}:${context.contentIndex}`,
          ),
      }
    case 'right-parts':
      return {
        'layout-right-aside-title': (context: { panelId?: string }) =>
          node('layout-right-aside-title-renderer', `title:${context.panelId}`),
        'layout-right-aside-panel': (context: { panelId?: string; isRightAsideOpen: boolean }) =>
          node('layout-right-aside-panel-renderer', `panel:${context.panelId}|open:${context.isRightAsideOpen}`),
      }
    case 'right-full':
      return {
        'layout-right-aside': (context: { panelId?: string; isRightAsideOpen: boolean }) =>
          node('layout-right-aside-renderer', `full:${context.panelId}|open:${context.isRightAsideOpen}`),
        'layout-right-aside-panel': () => node('layout-right-aside-panel-renderer', 'must-not-render'),
      }
    default:
      return {}
  }
})
</script>

<template>
  <div style="width: 1080px; height: 700px">
    <ChatUI
      ref="chatUI"
      :data="data"
      :ui="ui"
      :renderers="renderers"
      :default-right-aside-open="props.scenario.startsWith('right')"
      :default-active-right-aside-panel-id="props.scenario.startsWith('right') ? 'details' : undefined"
    >
      <template v-if="props.scenario === 'empty-vue-composer'" #layout-empty-state="{ renderComposer }">
        <component :is="renderComposer()" />
      </template>
    </ChatUI>
  </div>
</template>
