import { expect, test } from '@playwright/experimental-ct-vue'
import ProtocolFixture from './Protocol.fixture.vue'

test.describe('experimental Custom Element registration', () => {
  test('does not register on import and registers the default constructors explicitly', async ({ mount, page }) => {
    await mount(ProtocolFixture)

    const result = await page.evaluate(() => {
      const protocol = window.__trChatProtocol
      const before = [customElements.get('tr-chat'), customElements.get('tr-chat-ui')]

      protocol.defineTrChatElements()

      return {
        before: before.map(Boolean),
        chatMatches: customElements.get('tr-chat') === protocol.TrChatElement,
        uiMatches: customElements.get('tr-chat-ui') === protocol.TrChatUIElement,
      }
    })

    expect(result).toEqual({ before: [false, false], chatMatches: true, uiMatches: true })
  })

  test('is idempotent for the same constructors and rejects a conflicting constructor', async ({ mount, page }) => {
    await mount(ProtocolFixture)

    const result = await page.evaluate(() => {
      const protocol = window.__trChatProtocol
      protocol.defineTrChatElements()
      protocol.defineTrChatElements()

      const sameConstructor = customElements.get('tr-chat') === protocol.TrChatElement
      let conflictMessage = ''

      try {
        protocol.defineTrChatElements({
          chat: class extends HTMLElement {},
          chatUI: protocol.TrChatUIElement,
        })
      } catch (error) {
        conflictMessage = error instanceof Error ? error.message : String(error)
      }

      return { sameConstructor, conflictMessage }
    })

    expect(result.sameConstructor).toBe(true)
    expect(result.conflictMessage).toMatch(/tr-chat.*already defined/i)
  })

  test('upgrades a connected controlled element once and preserves properties assigned before upgrade', async ({
    mount,
    page,
  }) => {
    await mount(ProtocolFixture)

    const result = await page.evaluate(async () => {
      const protocol = window.__trChatProtocol
      const element = document.createElement('tr-chat-ui') as HTMLElement & {
        data: object
        ui: object
        inputValue: string
        rightAsideOpen: boolean
      }
      const data = {
        conversation: { items: [], activeId: null, title: 'upgrade' },
        bubble: { messages: [] },
        sender: { submitDisabled: true },
      }
      const ui = {
        layout: { leftAside: false, rightAside: { panels: [{ id: 'preview', title: 'Preview' }] } },
        welcome: false,
        prompts: false,
        model: false,
      }

      element.data = data
      element.ui = ui
      element.setAttribute('input-value', 'draft')
      element.setAttribute('right-aside-open', '')
      let rightAsideOpenBeforeUpdate: boolean | undefined
      element.addEventListener('right-aside-open-update', (event) => {
        rightAsideOpenBeforeUpdate ??= element.rightAsideOpen
        element.rightAsideOpen = (event as CustomEvent<boolean>).detail
      })
      const ready = protocol.whenTrChatReady(element)
      document.body.append(element)
      protocol.defineTrChatElements()
      await ready

      return {
        dataPreserved: element.data === data,
        inputValue: element.inputValue,
        rightAsideOpen: element.rightAsideOpen,
        rightAsideOpenBeforeUpdate,
        layoutCount: element.querySelectorAll('.tr-layout').length,
      }
    })

    expect(result).toEqual({
      dataPreserved: true,
      inputValue: 'draft',
      rightAsideOpen: false,
      rightAsideOpenBeforeUpdate: true,
      layoutCount: 1,
    })
  })
})

test.describe('experimental DOM events and readiness', () => {
  test('normalizes event names and dispatches direct detail with DOM defaults', async ({ mount, page }) => {
    await mount(ProtocolFixture)

    const result = await page.evaluate(() => {
      const host = document.createElement('div')
      const parent = document.createElement('section')
      const detail = { value: 'updated' }
      let received: CustomEvent | undefined
      parent.append(host)
      document.body.append(parent)
      parent.addEventListener('input-value-update', (event) => {
        received = event as CustomEvent
      })

      const dispatched = window.__trChatProtocol.dispatchExperimentalEvent(host, 'update:inputValue', detail)

      return {
        dispatched,
        sameDetail: received?.detail === detail,
        bubbles: received?.bubbles,
        composed: received?.composed,
        cancelable: received?.cancelable,
      }
    })

    expect(result).toEqual({ dispatched: true, sameDetail: true, bubbles: true, composed: true, cancelable: false })
  })

  test('returns false when a cancelable event is prevented', async ({ mount, page }) => {
    await mount(ProtocolFixture)

    const dispatched = await page.evaluate(() => {
      const host = document.createElement('div')
      host.addEventListener('before-send', (event) => event.preventDefault())
      return window.__trChatProtocol.dispatchExperimentalEvent(
        host,
        'beforeSend',
        { value: 'draft' },
        { cancelable: true },
      )
    })

    expect(dispatched).toBe(false)
  })

  test('emits ready exactly once and resolves readiness both before and after the event', async ({ mount, page }) => {
    await mount(ProtocolFixture)

    const result = await page.evaluate(async () => {
      const protocol = window.__trChatProtocol
      protocol.defineTrChatElements()
      const element = document.createElement('tr-chat-ui')
      let readyCount = 0
      element.addEventListener('ready', () => readyCount++)
      const before = protocol.whenTrChatReady(element)

      document.body.append(element)
      await before
      await protocol.whenTrChatReady(element)
      element.remove()
      document.body.append(element)
      await new Promise((resolve) => setTimeout(resolve, 0))

      return { readyCount }
    })

    expect(result.readyCount).toBe(1)
  })
})

test.describe('experimental renderer lifecycle', () => {
  test('renders nodes, node arrays, text, and null without interpreting HTML', async ({ mount, page }) => {
    await mount(ProtocolFixture)

    const result = await page.evaluate(() => {
      const host = document.createElement('div')
      const rendererHost = window.__trChatProtocol.createRendererHost(host)
      const first = document.createElement('strong')
      first.textContent = 'first'
      const second = document.createElement('em')
      second.textContent = 'second'

      rendererHost.render(() => first, {})
      const nodeText = host.textContent
      rendererHost.render(() => [first, second], {})
      const arrayText = host.textContent
      rendererHost.render(() => '<b>text only</b>', {})
      const textResult = { text: host.textContent, childElements: host.children.length }
      rendererHost.render(() => null, {})

      return { nodeText, arrayText, textResult, nullChildren: host.childNodes.length }
    })

    expect(result).toEqual({
      nodeText: 'first',
      arrayText: 'firstsecond',
      textResult: { text: '<b>text only</b>', childElements: 0 },
      nullChildren: 0,
    })
  })

  test('aborts the previous renderer signal and removes its output on replacement', async ({ mount, page }) => {
    await mount(ProtocolFixture)

    const result = await page.evaluate(() => {
      const host = document.createElement('div')
      const rendererHost = window.__trChatProtocol.createRendererHost(host)
      let firstSignal: AbortSignal | undefined

      rendererHost.render((_context, lifecycle) => {
        firstSignal = lifecycle.signal
        const node = document.createElement('span')
        node.dataset.output = 'first'
        return node
      }, {})
      rendererHost.render(() => {
        const node = document.createElement('span')
        node.dataset.output = 'second'
        return node
      }, {})

      return {
        firstAborted: firstSignal?.aborted,
        outputs: Array.from(host.children, (node) => (node as HTMLElement).dataset.output),
      }
    })

    expect(result).toEqual({ firstAborted: true, outputs: ['second'] })
  })

  test('dispatches legacy and unified errors when a renderer throws and keeps the host usable', async ({
    mount,
    page,
  }) => {
    await mount(ProtocolFixture)

    const result = await page.evaluate(() => {
      const host = document.createElement('div')
      const rendererHost = window.__trChatProtocol.createRendererHost(host)
      const existing = document.createElement('span')
      existing.textContent = 'existing'
      host.append(existing)
      let message = ''
      let unified: { source?: string; code?: string; cause?: unknown; recoverable?: boolean } | undefined
      host.addEventListener('experimental-error', (event) => {
        message = String((event as CustomEvent<{ error: Error }>).detail.error.message)
      })
      host.addEventListener('tr-chat-error', (event) => {
        unified = (event as CustomEvent).detail
      })

      rendererHost.render(() => {
        throw new Error('renderer failed')
      }, {})
      rendererHost.render(() => 'recovered', {})

      return {
        message,
        text: host.textContent,
        connected: host instanceof HTMLElement,
        source: unified?.source,
        code: unified?.code,
        recoverable: unified?.recoverable,
        sameCause: unified?.cause instanceof Error && unified.cause.message === 'renderer failed',
      }
    })

    expect(result).toEqual({
      message: 'renderer failed',
      text: 'recovered',
      connected: true,
      source: 'renderer',
      code: 'renderer_failed',
      recoverable: true,
      sameCause: true,
    })
  })

  test('clears and aborts the previous renderer when its replacement throws', async ({ mount, page }) => {
    await mount(ProtocolFixture)

    const result = await page.evaluate(() => {
      const host = document.createElement('div')
      const rendererHost = window.__trChatProtocol.createRendererHost(host)
      let firstSignal: AbortSignal | undefined

      rendererHost.render((_context, lifecycle) => {
        firstSignal = lifecycle.signal
        const node = document.createElement('span')
        node.textContent = 'stale output'
        return node
      }, {})
      rendererHost.render(() => {
        throw new Error('replacement failed')
      }, {})

      return { firstAborted: firstSignal?.aborted, childCount: host.childNodes.length }
    })

    expect(result).toEqual({ firstAborted: true, childCount: 0 })
  })
})

declare global {
  interface Window {
    __trChatProtocol: {
      TrChatElement: CustomElementConstructor
      TrChatUIElement: CustomElementConstructor
      defineTrChatElements: (constructors?: {
        chat: CustomElementConstructor
        chatUI: CustomElementConstructor
      }) => void
      dispatchExperimentalEvent: (target: EventTarget, name: string, detail: unknown, init?: CustomEventInit) => boolean
      whenTrChatReady: (element: HTMLElement) => Promise<void>
      createRendererHost: (host: HTMLElement) => {
        render: (
          renderer: (context: unknown, lifecycle: { signal: AbortSignal }) => Node | Node[] | string | null,
          context: unknown,
        ) => void
      }
    }
  }
}
