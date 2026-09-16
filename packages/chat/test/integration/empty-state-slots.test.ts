import { createSSRApp, h, type Component, type PropType } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@opentiny/tiny-robot', async () => {
  const { defineComponent, h } = await import('vue')

  const TrLayout = Object.assign(
    defineComponent({
      setup(_, { slots }) {
        return () =>
          h('div', { class: 'stub-layout' }, [
            slots['left-aside']?.(),
            slots.header?.(),
            slots.main?.(),
            slots.footer?.(),
            slots['right-aside']?.(),
          ])
      },
    }),
    {
      ProxyScrollbar: defineComponent({
        setup() {
          return () => null
        },
      }),
    },
  )

  return {
    BubbleRenderers: { Markdown: {} },
    TrLayout,
    TrBubbleList: defineComponent({
      props: {
        messages: {
          type: Array as PropType<Array<{ content?: unknown }>>,
          default: () => [],
        },
      },
      setup(props) {
        return () =>
          h(
            'div',
            { class: 'stub-bubble-list' },
            props.messages.map((message) => String(message.content)),
          )
      },
    }),
    TrBubbleProvider: defineComponent({
      props: ['fallbackContentRenderer'],
      setup(_, { slots }) {
        return () => slots.default?.()
      },
    }),
    TrPrompts: defineComponent({
      props: {
        items: {
          type: Array as PropType<Array<{ label?: string; text?: string }>>,
          default: () => [],
        },
      },
      setup(props, { slots }) {
        return () => h('div', [...props.items.map((item) => String(item.label ?? item.text)), slots.footer?.()])
      },
    }),
    TrWelcome: defineComponent({
      props: {
        title: String,
        description: String,
      },
      setup(props, { slots }) {
        return () => h('div', [props.title, props.description, slots.footer?.()])
      },
    }),
    useAutoScroll: () => ({ scrollToBottom: () => undefined }),
  }
})

vi.mock('../../src/ui/messages/ScrollToBottom.vue', async () => {
  const { defineComponent } = await import('vue')

  return {
    default: defineComponent({
      setup() {
        return () => null
      },
    }),
  }
})

vi.mock('../../src/ui/composer/ChatInputRegion.vue', async () => {
  const { defineComponent, h } = await import('vue')

  return {
    default: defineComponent({
      setup(_, { attrs }) {
        return () => h('div', { ...attrs, 'data-test': 'default-composer' }, 'composer')
      },
    }),
  }
})

import Chat from '../../src/Chat.vue'
import ChatUI from '../../src/ChatUI.vue'
import type { ChatEmptyStateSlotProps, ChatUIData } from '../../src/types'
import { createRuntimeFixture } from '../fixtures/runtime'

const baseUi = {
  header: false,
  history: false,
  sender: false,
  layout: {
    leftAside: false,
    rightAside: false,
  },
} as const

const emptyData: ChatUIData = {
  conversation: {
    activeId: 'conversation-1',
    title: 'Conversation 1',
  },
  bubble: {
    messages: [{ role: 'system', content: 'hidden' }],
  },
  request: {
    state: 'processing',
  },
}

async function renderComponent(component: Component, props: Record<string, unknown>, slots = {}) {
  const app = createSSRApp(() => h(component, props, slots))
  return renderToString(app)
}

function renderEmptyState(props: ChatEmptyStateSlotProps) {
  return h(
    'div',
    { 'data-test': 'custom-empty-state' },
    `${props.isEmpty}|${props.messages.length}|${props.request?.state}|${props.conversation.activeId}`,
  )
}

function renderEmptyStateWithComposer(props: ChatEmptyStateSlotProps) {
  return h('div', { 'data-test': 'custom-empty-state-with-composer' }, [
    h('span', { 'data-test': 'custom-empty-state-content' }, 'custom'),
    props.renderComposer(),
  ])
}

describe('layout-empty-state slots', () => {
  it('renders the slot on ChatUI with resolved slot props', async () => {
    const html = await renderComponent(
      ChatUI,
      { data: emptyData, ui: baseUi, defaultInputValue: '' },
      { 'layout-empty-state': renderEmptyState },
    )

    expect(html).toContain('data-test="custom-empty-state"')
    expect(html).toContain('true|0|processing|conversation-1')
  })

  it('forwards the slot through Chat', async () => {
    const { runtime } = createRuntimeFixture()
    const html = await renderComponent(
      Chat,
      { runtime, ui: baseUi },
      {
        'layout-empty-state': (props: ChatEmptyStateSlotProps) =>
          h('div', { 'data-test': 'chat-custom-empty-state' }, String(props.isEmpty)),
      },
    )

    expect(html).toContain('data-test="chat-custom-empty-state"')
    expect(html).toContain('>true</div>')
  })

  it('does not render the slot when messages are visible', async () => {
    const html = await renderComponent(
      ChatUI,
      {
        data: {
          ...emptyData,
          bubble: { messages: [{ role: 'assistant', content: 'hello' }] },
        },
        ui: baseUi,
        defaultInputValue: '',
      },
      { 'layout-empty-state': renderEmptyState },
    )

    expect(html).not.toContain('data-test="custom-empty-state"')
    expect(html).toContain('hello')
  })

  it('lets a custom empty state render one Composer in center mode without default centering', async () => {
    const html = await renderComponent(
      ChatUI,
      {
        data: { ...emptyData, bubble: { messages: [] } },
        ui: {
          ...baseUi,
          sender: {},
          layout: { ...baseUi.layout, composer: { welcome: 'center' } },
        },
        defaultInputValue: '',
      },
      { 'layout-empty-state': renderEmptyStateWithComposer },
    )

    expect(html).toContain('data-test="custom-empty-state-with-composer"')
    expect(html).toContain('data-test="default-composer"')
    expect(html.match(/data-test="default-composer"/g)).toHaveLength(1)
    expect(html).not.toContain('chat-panel-content--footer')
    expect(html).not.toContain('chat-empty-content--centered')
  })

  it('does not render a default Composer when a custom empty state does not request one', async () => {
    const html = await renderComponent(
      ChatUI,
      {
        data: { ...emptyData, bubble: { messages: [] } },
        ui: {
          ...baseUi,
          sender: {},
          layout: { ...baseUi.layout, composer: { welcome: 'center' } },
        },
        defaultInputValue: '',
      },
      { 'layout-empty-state': renderEmptyState },
    )

    expect(html).toContain('data-test="custom-empty-state"')
    expect(html).not.toContain('data-test="default-composer"')
    expect(html).not.toContain('chat-panel-content--footer')
    expect(html).not.toContain('chat-empty-content--centered')
  })

  it('lets a custom empty state render one Composer in footer mode without the default footer', async () => {
    const html = await renderComponent(
      ChatUI,
      {
        data: { ...emptyData, bubble: { messages: [] } },
        ui: { ...baseUi, sender: {} },
        defaultInputValue: '',
      },
      { 'layout-empty-state': renderEmptyStateWithComposer },
    )

    expect(html.match(/data-test="default-composer"/g)).toHaveLength(1)
    expect(html).not.toContain('chat-panel-content--footer')
  })

  it('gives layout-main priority over layout-empty-state', async () => {
    const html = await renderComponent(
      ChatUI,
      { data: emptyData, ui: baseUi, defaultInputValue: '' },
      {
        'layout-main': () => h('div', { 'data-test': 'custom-layout-main' }, 'main'),
        'layout-empty-state': renderEmptyState,
      },
    )

    expect(html).toContain('data-test="custom-layout-main"')
    expect(html).not.toContain('data-test="custom-empty-state"')
  })

  it('keeps the default welcome, prompts, and Composer behavior without the slot', async () => {
    const html = await renderComponent(ChatUI, {
      data: { ...emptyData, bubble: { messages: [] } },
      ui: {
        ...baseUi,
        sender: {},
        welcome: { title: 'Default welcome' },
        prompts: { items: [{ label: 'Default prompt' }] },
      },
      defaultInputValue: '',
    })

    expect(html).toContain('Default welcome')
    expect(html).toContain('Default prompt')
    expect(html).toContain('chat-panel-content--footer')
    expect(html).toContain('data-test="default-composer"')

    const centeredHtml = await renderComponent(ChatUI, {
      data: { ...emptyData, bubble: { messages: [] } },
      ui: {
        ...baseUi,
        sender: {},
        welcome: { title: 'Default welcome' },
        layout: {
          ...baseUi.layout,
          composer: { welcome: 'center' },
        },
      },
      defaultInputValue: '',
    })

    expect(centeredHtml).toContain('chat-welcome-composer')
    expect(centeredHtml).not.toContain('chat-panel-content--footer')
  })
})
