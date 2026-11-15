import { expect, test } from '@playwright/experimental-ct-vue'
import ElementsFixture from './Elements.fixture.vue'

type ComposerElement = HTMLElement & {
  setInputValue(value: string): void
  clearInput(): void
  focusInput(): Promise<boolean>
  inputValue?: string
  isEmpty?: boolean
  ui?: object
  renderers?: object
}

for (const tag of ['tr-chat', 'tr-chat-ui'] as const) {
  test.describe(`${tag} native public parity`, () => {
    test.beforeEach(async ({ mount, page }) => {
      await mount(ElementsFixture)
      await page.evaluate(async (tag) => {
        const api = window.__trChatElements
        api.defineTrChatElements()
        const element = document.createElement(tag) as HTMLElement & { runtimeOptions?: object; data?: object }
        element.id = 'parity-element'
        const prefix = document.createElement('span')
        prefix.slot = 'input-prefix'
        prefix.dataset.hostPrefix = 'true'
        prefix.textContent = 'Project context'
        element.append(prefix)
        const messages = [{ role: 'assistant', content: 'Existing conversation' }]
        if (tag === 'tr-chat') {
          element.runtimeOptions = {
            autoSaveMessages: false,
            initialMessages: messages,
            storage: {
              loadConversations: () => [],
              loadMessages: () => [],
              saveConversation() {},
              saveMessages() {},
              deleteConversation() {},
            },
            responseProvider: async () => ({
              id: 'parity',
              object: 'chat.completion',
              created: 1,
              model: 'local',
              choices: [],
            }),
          }
        } else element.data = { bubble: { messages } }
        document.body.append(element)
        await api.whenTrChatReady(element)
        if (tag === 'tr-chat') {
          await (element as unknown as { getRuntime(): { actions: { createConversation(): Promise<unknown> } } })
            .getRuntime()
            .actions.createConversation()
        }
      }, tag)
    })

    test.afterEach(async ({ page }) => {
      await page.locator(`${tag}#parity-element`).evaluate((element) => element.remove())
    })

    test('sets and clears the native draft and focuses the available composer', async ({ page }) => {
      const element = page.locator(`${tag}#parity-element`)
      const methods = await element.evaluate((host) => {
        const composer = host as ComposerElement
        return [typeof composer.setInputValue, typeof composer.clearInput, typeof composer.focusInput]
      })
      expect(methods).toEqual(['function', 'function', 'function'])
      await element.evaluate((host) => (host as ComposerElement).setInputValue('Draft from host'))
      await expect(element.locator('.tr-sender-editor')).toHaveText('Draft from host')
      expect(await element.evaluate((host) => (host as ComposerElement).focusInput())).toBe(true)
      await expect(element.locator('.tr-sender-editor')).toBeFocused()
      await element.evaluate((host) => (host as ComposerElement).clearInput())
      await expect(element.locator('.tr-sender-editor')).toHaveText('')
      await element.evaluate((host) => {
        ;(host as ComposerElement).ui = { sender: false }
      })
      await expect(element.locator('.tr-chat-ui')).toBeVisible()
      await expect(element.locator('.tr-sender-editor')).toHaveCount(0)
      expect(await element.evaluate((host) => (host as ComposerElement).focusInput())).toBe(false)
    })

    test('forwards native sender interaction payloads and preserves cancellation', async ({ page }) => {
      const result = await page.locator(`${tag}#parity-element`).evaluate((host) => {
        const sender = host.querySelector<HTMLElement>('.tr-sender')!
        const editor = host.querySelector<HTMLElement>('.tr-sender-editor')!
        const received: Array<{
          name: string
          sameEvent: boolean
          sameTarget: boolean
          text: string
          canceled: boolean
        }> = []
        for (const [domName, name] of [
          ['dragenter', 'sender-drag-enter'],
          ['dragover', 'sender-drag-over'],
          ['dragleave', 'sender-drag-leave'],
          ['drop', 'sender-drop'],
          ['paste', 'sender-paste'],
        ]) {
          const data = new DataTransfer()
          data.setData('text/plain', 'Host attachment payload')
          const original =
            domName === 'paste'
              ? new ClipboardEvent(domName, { clipboardData: data, bubbles: true, cancelable: true })
              : new DragEvent(domName, { dataTransfer: data, bubbles: true, cancelable: true })
          host.addEventListener(
            name,
            (event) => {
              const detail = (event as CustomEvent).detail
              const native = domName === 'paste' ? detail : detail.event
              native.preventDefault()
              received.push({
                name,
                sameEvent: native === original,
                sameTarget: domName === 'paste' ? native.target === editor : detail.target === sender,
                text: (native.clipboardData ?? native.dataTransfer).getData('text/plain'),
                canceled: native.defaultPrevented,
              })
            },
            { once: true },
          )
          editor.dispatchEvent(original)
        }
        return received
      })
      expect(result).toEqual(
        ['sender-drag-enter', 'sender-drag-over', 'sender-drag-leave', 'sender-drop', 'sender-paste'].map((name) => ({
          name,
          sameEvent: true,
          sameTarget: true,
          text: 'Host attachment payload',
          canceled: true,
        })),
      )
    })

    test('normalizes boolean empty-state attributes to typed DOM properties', async ({ page }) => {
      const element = page.locator(`${tag}#parity-element`)
      await element.evaluate((host) => host.setAttribute('is-empty', ''))
      await expect.poll(() => element.evaluate((host) => (host as ComposerElement).isEmpty)).toBe(true)
      await element.evaluate((host) => {
        const element = host as ComposerElement
        element.isEmpty = !element.isEmpty
      })
      await expect.poll(() => element.evaluate((host) => (host as ComposerElement).isEmpty)).toBe(false)
      await element.evaluate((host) => host.setAttribute('is-empty', ''))
      await expect.poll(() => element.evaluate((host) => (host as ComposerElement).isEmpty)).toBe(true)
      await element.evaluate((host) => host.removeAttribute('is-empty'))
      await expect.poll(() => element.evaluate((host) => (host as ComposerElement).isEmpty)).toBeUndefined()
    })

    test('renders host input-prefix content inside the native sender', async ({ page }) => {
      const element = page.locator(`${tag}#parity-element`)
      await expect(element.locator('.tr-sender [data-host-prefix]')).toHaveText('Project context')
    })

    test('honors true, false, and automatic empty-state properties with existing messages', async ({ page }) => {
      const element = page.locator(`${tag}#parity-element`)
      await element.evaluate((host) => {
        ;(host as ComposerElement).renderers = {
          'layout-header': (context: { isEmpty: boolean }) => {
            const output = document.createElement('output')
            output.dataset.emptyState = String(context.isEmpty)
            output.textContent = context.isEmpty ? 'Host welcome' : 'Conversation header'
            return output
          },
        }
      })
      await expect(element.locator('[data-empty-state="false"]')).toHaveText('Conversation header')
      await element.evaluate((host) => {
        ;(host as ComposerElement).isEmpty = true
      })
      await expect(element.locator('[data-empty-state="true"]')).toHaveText('Host welcome')
      await element.evaluate((host) => {
        ;(host as ComposerElement).isEmpty = false
      })
      await expect(element.locator('[data-empty-state="false"]')).toHaveText('Conversation header')
      await element.evaluate((host) => {
        ;(host as ComposerElement).isEmpty = undefined
      })
      await expect(element.locator('[data-empty-state="false"]')).toHaveText('Conversation header')
      await element.evaluate(async (host) => {
        const element = host as ComposerElement & {
          data?: object
          getRuntime?: () => { actions: { clearActiveConversation(): unknown } }
        }
        if (element.getRuntime) await element.getRuntime().actions.clearActiveConversation()
        else element.data = { bubble: { messages: [] } }
      })
      await expect(element.locator('[data-empty-state="true"]')).toHaveText('Host welcome')
      await element.evaluate((host) => {
        ;(host as ComposerElement).isEmpty = false
      })
      await expect(element.locator('[data-empty-state="false"]')).toHaveText('Conversation header')
    })
  })
}

test('controlled tr-chat-ui composer methods request host-owned draft updates', async ({ mount, page }) => {
  await mount(ElementsFixture)
  await page.evaluate(async () => {
    window.__trChatElements.defineTrChatElements()
    const element = document.createElement('tr-chat-ui') as ComposerElement
    element.id = 'controlled-parity'
    element.inputValue = 'Host draft'
    const requested: string[] = []
    element.addEventListener('input-value-update', (event) => requested.push((event as CustomEvent<string>).detail))
    Object.assign(window, { __requestedDrafts: requested })
    document.body.append(element)
    await window.__trChatElements.whenTrChatReady(element)
  })
  const element = page.locator('tr-chat-ui#controlled-parity')
  expect(await element.evaluate((host) => typeof (host as ComposerElement).setInputValue)).toBe('function')
  await element.evaluate((host) => (host as ComposerElement).setInputValue('Requested draft'))
  await expect(element.locator('.tr-sender-editor')).toHaveText('Host draft')
  await element.evaluate((host) => {
    ;(host as ComposerElement).inputValue = 'Requested draft'
  })
  await expect(element.locator('.tr-sender-editor')).toHaveText('Requested draft')
  await element.evaluate((host) => (host as ComposerElement).clearInput())
  await expect(element.locator('.tr-sender-editor')).toHaveText('Requested draft')
  expect(await page.evaluate(() => (window as unknown as { __requestedDrafts: string[] }).__requestedDrafts)).toEqual([
    'Requested draft',
    '',
  ])
  await element.evaluate((host) => host.remove())
})
