import { expect, test } from '@playwright/experimental-ct-vue'
import ElementsFixture from './Elements.fixture.vue'

const expectedChatEvents = [
  'update:floating-state',
  'floating-drag-start',
  'floating-drag',
  'floating-drag-end',
  'floating-resize-start',
  'floating-resize',
  'floating-resize-end',
  'runtime-action-error',
  'history-action',
  'mcp-create-server',
  'prompt-click',
  'bubble-state-change',
  'bubble-event',
  'left-aside-open-change',
  'right-aside-open-change',
  'update:right-aside-open',
  'update:active-right-aside-panel-id',
] as const

const expectedUIEvents = [
  'update:floating-state',
  'floating-drag-start',
  'floating-drag',
  'floating-drag-end',
  'floating-resize-start',
  'floating-resize',
  'floating-resize-end',
  'update:inputValue',
  'submit',
  'cancel',
  'clear',
  'create-conversation',
  'switch-conversation',
  'rename-conversation',
  'history-action',
  'prompt-click',
  'bubble-state-change',
  'bubble-event',
  'model-select',
  'model-feature-change',
  'model-reasoning-effort-change',
  'mcp-add-server',
  'mcp-create-server',
  'mcp-remove-server',
  'mcp-server-enabled-change',
  'mcp-tool-enabled-change',
  'left-aside-open-change',
  'right-aside-open-change',
  'update:right-aside-open',
  'update:active-right-aside-panel-id',
] as const

test.describe('experimental element event contract', () => {
  test('keeps the complete Chat and ChatUI event inventories and forwards direct detail', async ({ mount, page }) => {
    await mount(ElementsFixture)

    const result = await page.evaluate(
      ({ chatEvents, uiEvents }) => {
        const api = window.__trChatElements
        const host = document.createElement('div')
        const received: Array<{ detailMatches: boolean }> = []

        for (const name of uiEvents) {
          const detail = { source: name }
          const domName = name.startsWith('update:')
            ? `${name
                .slice('update:'.length)
                .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
                .toLowerCase()}-update`
            : name
          host.addEventListener(domName, (event) => {
            received.push({ detailMatches: (event as CustomEvent).detail === detail })
          })
          api.forwardElementEvent(host, name, detail)
        }

        return {
          chatInventory: api.TR_CHAT_EVENT_NAMES,
          uiInventory: api.TR_CHAT_UI_EVENT_NAMES,
          directDetails: received.every(({ detailMatches }) => detailMatches),
          receivedCount: received.length,
          expectedChatCount: chatEvents.length,
        }
      },
      { chatEvents: expectedChatEvents, uiEvents: expectedUIEvents },
    )

    expect(result.chatInventory).toEqual(expectedChatEvents)
    expect(result.uiInventory).toEqual(expectedUIEvents)
    expect(result.directDetails).toBe(true)
    expect(result.receivedCount).toBe(expectedUIEvents.length)
    expect(result.expectedChatCount).toBe(expectedChatEvents.length)
  })

  test('bridges canceled history-action back to the Vue payload', async ({ mount, page }) => {
    await mount(ElementsFixture)

    const result = await page.evaluate(() => {
      const host = document.createElement('div')
      let payloadPrevented = false
      const payload = {
        action: { id: 'delete', text: 'Delete' },
        conversation: { id: 'one', title: 'One' },
        defaultPrevented: false,
        preventDefault() {
          payloadPrevented = true
        },
      }
      host.addEventListener('history-action', (event) => event.preventDefault())

      const dispatched = window.__trChatElements.forwardElementEvent(host, 'history-action', payload)
      return { dispatched, payloadPrevented }
    })

    expect(result).toEqual({ dispatched: false, payloadPrevented: true })
  })
})

test.describe('experimental TrChatUI element', () => {
  test('renders the Vue UI, native static slots, and scoped DOM renderers', async ({ mount, page }) => {
    await mount(ElementsFixture)

    const result = await page.evaluate(async () => {
      const api = window.__trChatElements
      api.defineTrChatElements()
      const element = document.createElement('tr-chat-ui') as HTMLElement & Record<string, unknown>
      const notice = document.createElement('span')
      notice.slot = 'header-notice'
      notice.dataset.staticSlot = 'notice'
      notice.textContent = 'Static notice'
      element.append(notice)
      element.data = {
        conversation: { title: 'Prototype', items: [] },
        bubble: { messages: [] },
      }
      element.ui = { layout: { leftAside: false }, welcome: false, sender: false }
      let rendererCalls = 0
      let rendererAborted = false
      element.renderers = {
        'layout-main': (context: { conversation: { title?: string } }, lifecycle: { signal: AbortSignal }) => {
          rendererCalls++
          lifecycle.signal.addEventListener('abort', () => (rendererAborted = true))
          const output = document.createElement('strong')
          output.dataset.renderer = 'main'
          output.textContent = context.conversation.title ?? ''
          return output
        },
      }

      document.body.append(element)
      await api.whenTrChatReady(element)
      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
      const mounted = {
        hasVueUI: Boolean(element.querySelector('.tr-chat-ui')),
        staticText: element.querySelector('[data-static-slot="notice"]')?.textContent,
        rendererText: element.querySelector('[data-renderer="main"]')?.textContent,
        rendererRan: rendererCalls > 0,
      }
      element.data = {
        conversation: { title: 'Updated prototype', items: [] },
        bubble: { messages: [] },
      }
      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
      const updatedRendererText = element.querySelector('[data-renderer="main"]')?.textContent
      element.remove()
      await new Promise((resolve) => setTimeout(resolve, 0))

      return { ...mounted, updatedRendererText, rendererAborted }
    })

    expect(result).toEqual({
      hasVueUI: true,
      staticText: 'Static notice',
      rendererText: 'Prototype',
      rendererRan: true,
      updatedRendererText: 'Updated prototype',
      rendererAborted: true,
    })
  })

  test('exposes aside methods and forwards updates as DOM events', async ({ mount, page }) => {
    await mount(ElementsFixture)

    const result = await page.evaluate(async () => {
      const api = window.__trChatElements
      api.defineTrChatElements()
      const element = document.createElement('tr-chat-ui') as HTMLElement & {
        data: object
        ui: object
        renderers: Record<string, () => string>
        openRightAside(panel?: string): void
        closeRightAside(): void
        activateRightAsidePanel(panel: string): boolean
      }
      element.data = { conversation: { items: [] }, bubble: { messages: [] } }
      element.ui = {
        layout: { leftAside: false, rightAside: { panels: [{ id: 'details', title: 'Details' }] } },
        welcome: false,
        sender: false,
      }
      element.renderers = {
        'layout-right-aside-panel': () => 'Panel content',
      }
      const updates: unknown[] = []
      element.addEventListener('right-aside-open-update', (event) => updates.push((event as CustomEvent).detail))
      document.body.append(element)
      await api.whenTrChatReady(element)
      element.openRightAside('details')
      await Promise.resolve()
      const activated = element.activateRightAsidePanel('details')
      element.closeRightAside()
      await Promise.resolve()
      element.remove()

      return { updates, activated }
    })

    expect(result).toEqual({ updates: [true, false], activated: true })
  })
})

test.describe('experimental TrChat element runtime ownership', () => {
  test('keeps runtime action failures separate from adapter failures', async ({ mount, page }) => {
    await mount(ElementsFixture)

    const result = await page.evaluate(async () => {
      const api = window.__trChatElements
      api.defineTrChatElements()
      const runtimeError = new Error('runtime send failed')
      const runtime = {
        conversations: { value: [] },
        activeConversation: { value: null },
        composer: {},
        actions: {
          send: async (_payload: unknown) => {
            throw runtimeError
          },
          clearActiveConversation() {},
          createConversation() {},
          switchConversation() {},
          renameConversation() {},
          deleteConversation() {},
        },
      }
      const element = document.createElement('tr-chat') as HTMLElement & {
        runtime: object
        send(payload: { text: string }): Promise<boolean>
      }
      let runtimeDetail: { action?: string; error?: unknown } | undefined
      let experimentalErrors = 0
      element.runtime = runtime
      element.addEventListener('runtime-action-error', (event) => {
        runtimeDetail = (event as CustomEvent).detail
      })
      element.addEventListener('experimental-error', () => experimentalErrors++)
      document.body.append(element)
      await api.whenTrChatReady(element)
      const sent = await element.send({ text: 'fail' })
      element.remove()

      return {
        sent,
        action: runtimeDetail?.action,
        sameError: runtimeDetail?.error === runtimeError,
        experimentalErrors,
      }
    })

    expect(result).toEqual({ sent: false, action: 'send', sameError: true, experimentalErrors: 0 })
  })

  test('uses an injected runtime without taking ownership', async ({ mount, page }) => {
    await mount(ElementsFixture)

    const result = await page.evaluate(async () => {
      const api = window.__trChatElements
      api.defineTrChatElements()
      let sendCalls = 0
      const runtime = {
        conversations: { value: [] },
        activeConversation: { value: null },
        composer: {},
        actions: {
          send: async (_payload: unknown) => {
            sendCalls++
            return true
          },
          clearActiveConversation() {},
          createConversation() {},
          switchConversation() {},
          renameConversation() {},
          deleteConversation() {},
        },
      }
      const element = document.createElement('tr-chat') as HTMLElement & {
        runtime: object
        send(payload: { text: string }): Promise<boolean>
      }
      element.runtime = runtime
      document.body.append(element)
      await api.whenTrChatReady(element)
      const sent = await element.send({ text: 'hello' })
      element.remove()
      await new Promise((resolve) => setTimeout(resolve, 0))

      const runtimeStillUsable = await runtime.actions.send({ text: 'after disconnect' })
      return { sent, sendCalls, runtimeStillUsable }
    })

    expect(result).toEqual({ sent: true, sendCalls: 2, runtimeStillUsable: true })
  })

  test('accepts owned Runtime options assigned immediately after Angular connects the element', async ({
    mount,
    page,
  }) => {
    await mount(ElementsFixture)

    const result = await page.evaluate(async () => {
      const api = window.__trChatElements
      api.defineTrChatElements()
      const element = document.createElement('tr-chat') as HTMLElement & {
        runtimeOptions?: object
        send(payload: { text: string }): Promise<boolean>
      }
      let firstProviderCalls = 0
      let secondProviderCalls = 0
      let secondRequestSignal: AbortSignal | undefined

      document.body.append(element)
      element.runtimeOptions = {
        storage: {
          loadConversations: () => [],
          loadMessages: () => [],
          saveConversation() {},
          saveMessages() {},
          deleteConversation() {},
        },
        responseProvider: async () => {
          firstProviderCalls++
          return {
            id: 'angular-late-property',
            object: 'chat.completion',
            created: 1,
            model: 'mock',
            system_fingerprint: null,
            choices: [
              {
                index: 0,
                message: { role: 'assistant', content: 'Angular property binding works' },
                delta: undefined,
                logprobs: null,
                finish_reason: 'stop',
              },
            ],
          }
        },
      }

      await api.whenTrChatReady(element)
      const sent = await element.send({ text: 'Angular connected first' })
      const hasVueChat = Boolean(element.querySelector('.tr-chat-ui'))
      element.runtimeOptions = {
        storage: {
          loadConversations: () => [],
          loadMessages: () => [],
          saveConversation() {},
          saveMessages() {},
          deleteConversation() {},
        },
        responseProvider: async (_request: unknown, signal: AbortSignal) => {
          secondProviderCalls++
          secondRequestSignal = signal
          await new Promise<void>((resolve) => signal.addEventListener('abort', () => resolve(), { once: true }))
          return {
            id: 'angular-reassigned-property',
            object: 'chat.completion',
            created: 2,
            model: 'mock',
            system_fingerprint: null,
            choices: [],
          }
        },
      }
      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
      const pendingSend = element.send({ text: 'Angular reassigned options' })
      while (!secondRequestSignal) await Promise.resolve()
      element.runtimeOptions = undefined
      await new Promise((resolve) => setTimeout(resolve, 0))
      const disposedAfterClear = secondRequestSignal.aborted
      element.remove()
      await new Promise((resolve) => setTimeout(resolve, 0))
      const sentAfterReassignment = await pendingSend

      return {
        sent,
        hasVueChat,
        sentAfterReassignment,
        firstProviderCalls,
        secondProviderCalls,
        disposedAfterClear,
      }
    })

    expect(result).toEqual({
      sent: true,
      hasVueChat: true,
      sentAfterReassignment: true,
      firstProviderCalls: 1,
      secondProviderCalls: 1,
      disposedAfterClear: true,
    })
  })

  test('flushes owned runtime messages before loading replacement runtime options', async ({ mount, page }) => {
    await mount(ElementsFixture)

    const result = await page.evaluate(async () => {
      const api = window.__trChatElements
      api.defineTrChatElements()
      const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T
      const conversations = new Map<string, { id: string; createdAt: number; updatedAt: number }>()
      const messages = new Map<string, Array<{ role: string; content?: unknown }>>()
      let loadCalls = 0
      let replacementLoadedFinalReply = false
      let markInitialSave!: () => void
      const initialSave = new Promise<void>((resolve) => {
        markInitialSave = resolve
      })
      let blockFinalSave = false
      let markFinalSaveStarted!: () => void
      const finalSaveStarted = new Promise<void>((resolve) => {
        markFinalSaveStarted = resolve
      })
      let releaseFinalSave!: () => void
      const finalSavePending = new Promise<void>((resolve) => {
        releaseFinalSave = resolve
      })
      let markProviderStarted!: () => void
      const providerStarted = new Promise<void>((resolve) => {
        markProviderStarted = resolve
      })
      let resolveCompletion!: (value: object) => void
      const completionPending = new Promise<object>((resolve) => {
        resolveCompletion = resolve
      })
      const storage = {
        loadConversations: () => {
          loadCalls++
          if (loadCalls === 2) {
            replacementLoadedFinalReply = [...messages.values()].some((items) =>
              items.some((message) => message.content === 'complete before replacement'),
            )
          }
          return [...conversations.values()].map((conversation) => clone(conversation))
        },
        loadMessages: (id: string) => clone(messages.get(id) ?? []),
        saveConversation: (conversation: { id: string; createdAt: number; updatedAt: number }) => {
          conversations.set(conversation.id, clone(conversation))
        },
        saveMessages: async (id: string, nextMessages: Array<{ role: string; content?: unknown }>) => {
          const snapshot = clone(nextMessages)
          if (
            snapshot.some((message) => message.content === 'persist before replacement') &&
            !snapshot.some((message) => message.content === 'complete before replacement')
          ) {
            markInitialSave()
          }
          if (blockFinalSave && snapshot.some((message) => message.content === 'complete before replacement')) {
            markFinalSaveStarted()
            await finalSavePending
          }
          messages.set(id, snapshot)
        },
        deleteConversation: (id: string) => {
          conversations.delete(id)
          messages.delete(id)
        },
      }
      const element = document.createElement('tr-chat') as HTMLElement & {
        runtimeOptions: object
        send(payload: { text: string }): Promise<boolean>
      }
      document.body.append(element)
      element.runtimeOptions = {
        storage,
        responseProvider: async () => {
          markProviderStarted()
          return completionPending
        },
      }
      await api.whenTrChatReady(element)

      const sending = element.send({ text: 'persist before replacement' })
      await Promise.race([
        providerStarted,
        new Promise<never>((_resolve, reject) =>
          setTimeout(() => reject(new Error('response provider did not start')), 2_000),
        ),
      ])
      await Promise.race([
        initialSave,
        new Promise<never>((_resolve, reject) =>
          setTimeout(() => reject(new Error('incomplete turn was not persisted first')), 2_000),
        ),
      ])
      resolveCompletion({
        id: 'replacement-flush',
        object: 'chat.completion',
        created: 1,
        model: 'mock',
        system_fingerprint: null,
        choices: [
          {
            index: 0,
            message: { role: 'assistant', content: 'complete before replacement' },
            delta: undefined,
            logprobs: null,
            finish_reason: 'stop',
          },
        ],
      })
      await sending

      blockFinalSave = true
      element.runtimeOptions = {
        storage,
        responseProvider: async () => {
          throw new Error('replacement provider should not run')
        },
      }
      await Promise.race([
        finalSaveStarted,
        new Promise<never>((_resolve, reject) =>
          setTimeout(() => reject(new Error('final save did not start during replacement')), 2_000),
        ),
      ])
      const sentDuringReplacement = await element.send({ text: 'must not use disposed runtime' })
      releaseFinalSave()
      const replacementDeadline = Date.now() + 2_000
      while (loadCalls < 2 && Date.now() < replacementDeadline) {
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
      if (loadCalls < 2) throw new Error('replacement runtime did not load')
      element.remove()
      await new Promise((resolve) => setTimeout(resolve, 0))

      return {
        replacementLoadedFinalReply,
        sentDuringReplacement,
        persistedFinalReply: [...messages.values()].some((items) =>
          items.some((message) => message.content === 'complete before replacement'),
        ),
      }
    })

    expect(result).toEqual({
      replacementLoadedFinalReply: true,
      sentDuringReplacement: false,
      persistedFinalReply: true,
    })
  })

  test('creates and disposes an owned runtime while preserving disconnect/reinsert moves', async ({ mount, page }) => {
    await mount(ElementsFixture)

    const result = await page.evaluate(async () => {
      const api = window.__trChatElements
      api.defineTrChatElements()
      let requestSignal: AbortSignal | undefined
      const element = document.createElement('tr-chat') as HTMLElement & {
        runtimeOptions: object
        send(payload: { text: string }): Promise<boolean>
      }
      element.runtimeOptions = {
        storage: {
          loadConversations: () => [],
          loadMessages: () => [],
          saveConversation() {},
          saveMessages() {},
          deleteConversation() {},
        },
        responseProvider: async (_request: unknown, signal: AbortSignal) => {
          requestSignal = signal
          await new Promise<void>((resolve) => signal.addEventListener('abort', () => resolve(), { once: true }))
          return {
            id: 'aborted',
            object: 'chat.completion',
            created: 1,
            model: 'mock',
            system_fingerprint: null,
            choices: [],
          }
        },
      }
      document.body.append(element)
      await api.whenTrChatReady(element)
      void element.send({ text: 'wait' })
      while (!requestSignal) await Promise.resolve()

      element.remove()
      document.body.append(element)
      await new Promise((resolve) => setTimeout(resolve, 0))
      const survivedMove = !requestSignal.aborted

      element.remove()
      await new Promise((resolve) => setTimeout(resolve, 0))
      return { survivedMove, disposedAfterDisconnect: requestSignal.aborted }
    })

    expect(result).toEqual({ survivedMove: true, disposedAfterDisconnect: true })
  })
})

declare global {
  interface Window {
    __trChatElements: {
      TR_CHAT_EVENT_NAMES: readonly string[]
      TR_CHAT_UI_EVENT_NAMES: readonly string[]
      TrChatElement: CustomElementConstructor
      TrChatUIElement: CustomElementConstructor
      defineTrChatElements: () => void
      forwardElementEvent: (target: EventTarget, name: string, detail: unknown) => boolean
      whenTrChatReady: (element: HTMLElement) => Promise<void>
    }
  }
}
