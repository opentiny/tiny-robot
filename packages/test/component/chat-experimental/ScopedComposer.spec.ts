import { expect, test } from '@playwright/experimental-ct-vue'
import ElementsFixture from './Elements.fixture.vue'
import ScopedComposerNative from './ScopedComposerNative.fixture.vue'

type SenderContext = {
  disabled: boolean
  loading: boolean
  hasContent: boolean
  focus(): Promise<boolean>
  blur(): void
  insert(text: string): void
  append(text: string): void
  replace(text: string): void
}
type WelcomeContext = { renderComposer?: () => HTMLElement | null }
type ScopeRecord = { name: string; context: SenderContext; signal: AbortSignal }
type TestHost = HTMLElement & {
  renderers: Record<string, unknown>
  ui: { sender?: false | { mode: string }; layout?: object }
  inputValue?: string
  data?: object
  runtime?: object
  runtimeOptions?: object
  attachments?: object[]
  setInputValue(value: string): void
  focusInput(): Promise<boolean>
}
declare global {
  interface Window {
    __scopedComposer: {
      host: TestHost
      renderers: Record<string, unknown>
      scopes: ScopeRecord[]
      stale?: ScopeRecord
      welcome?: { context: WelcomeContext; signal: AbortSignal }
      oldWelcome?: { context: WelcomeContext; signal: AbortSignal }
      requests: string[]
      toolClicks: number
      focused?: boolean
      composerIdempotent?: boolean
      submit?: { text: string; attachments?: unknown[] }
    }
  }
}

for (const tag of ['tr-chat', 'tr-chat-ui'] as const) {
  test.describe(`${tag} DOM composer customization`, () => {
    test.beforeEach(async ({ mount, page }) => {
      await mount(ElementsFixture)
      await page.evaluate(async (tag) => {
        const api = window.__trChatElements
        api.defineTrChatElements()
        const host = document.createElement(tag) as TestHost
        host.id = 'scoped-composer'
        host.style.cssText = 'display:block;height:700px;--tr-layout-height:100%'
        const state = (window.__scopedComposer = {
          host,
          scopes: [] as ScopeRecord[],
          renderers: {} as Record<string, unknown>,
          requests: [] as string[],
          toolClicks: 0,
        })
        const attachment = { id: 'note', name: 'note.txt', status: 'success', rawFile: new File(['note'], 'note.txt') }
        host.ui = {
          layout: { leftAside: false, rightAside: false },
          sender: {
            mode: 'multiple',
            toolbar: [{ type: 'custom', id: 'existing', label: 'Existing tool', onClick: () => state.toolClicks++ }],
          },
        } as TestHost['ui']
        if (tag === 'tr-chat') {
          host.attachments = [attachment]
          host.runtimeOptions = {
            autoSaveMessages: false,
            storage: {
              loadConversations: () => [],
              loadMessages: () => [],
              saveConversation() {},
              saveMessages() {},
              deleteConversation() {},
            },
            responseProvider: async () => ({
              id: 'scoped-local',
              object: 'chat.completion',
              created: 1,
              model: 'local',
              system_fingerprint: null,
              choices: [
                {
                  index: 0,
                  message: { role: 'assistant', content: 'Local reply' },
                  delta: undefined,
                  logprobs: null,
                  finish_reason: 'stop',
                },
              ],
            }),
          }
        } else {
          host.inputValue = ''
          host.data = { sender: { attachments: [attachment] }, bubble: { messages: [] } }
          host.addEventListener('input-value-update', (event) => {
            const value = (event as CustomEvent<string>).detail
            state.requests.push(value)
            host.inputValue = value
          })
          host.addEventListener('submit', (event: Event) => {
            window.__scopedComposer.submit = (event as CustomEvent).detail
          })
        }
        const legacy = document.createElement('span')
        legacy.slot = 'sender-footer'
        legacy.dataset.legacyFooter = ''
        legacy.textContent = 'Legacy footer'
        host.append(legacy)
        for (const name of ['sender-actions-inline', 'sender-footer', 'sender-footer-right']) {
          state.renderers[name] = (context: SenderContext, { signal }: { signal: AbortSignal }) => {
            state.scopes.push({ name, context, signal })
            const group = document.createElement('div')
            group.dataset.senderRenderer = name
            group.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;max-width:100%'
            for (const action of ['replace', 'insert', 'append', 'focus', 'blur'] as const) {
              const button = document.createElement('button')
              button.textContent = action
              button.setAttribute('aria-label', `${name}:${action}`)
              button.type = 'button'
              button.disabled = context.disabled
              button.addEventListener('mousedown', (event) => event.preventDefault(), { signal })
              button.addEventListener(
                'click',
                () => {
                  if (action === 'focus')
                    void context.focus().then((value) => {
                      window.__scopedComposer.focused = value
                    })
                  else if (action === 'blur') context.blur()
                  else context[action](action === 'replace' ? 'base' : action === 'insert' ? 'X' : 'tail')
                },
                { signal },
              )
              group.append(button)
            }
            return group
          }
        }
        host.renderers = state.renderers
        document.body.append(host)
        await api.whenTrChatReady(host)
      }, tag)
    })
    test.afterEach(async ({ page }) => {
      await page.locator(`${tag}#scoped-composer`).evaluate((host) => host.remove())
    })

    test('action and footer renderers operate on the native editor and retain built-in actions', async ({ page }) => {
      const host = page.locator(`${tag}#scoped-composer`)
      const editor = host.locator('.tr-sender-editor')
      for (const name of ['sender-actions-inline', 'sender-footer', 'sender-footer-right']) {
        await expect(host.locator(`[data-sender-renderer="${name}"]`)).toBeVisible()
      }
      await expect(host.locator('[data-legacy-footer]')).toHaveCount(0)
      await host.getByRole('button', { name: 'sender-footer:replace', exact: true }).click()
      await expect(editor).toHaveText('base')
      await expect(editor).toBeFocused()
      await editor.evaluate(async (element) => {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
        const text = element.querySelector('p')!.firstChild!
        const range = document.createRange()
        range.setStart(text, 1)
        range.setEnd(text, 3)
        const selection = window.getSelection()!
        selection.removeAllRanges()
        selection.addRange(range)
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
      })
      expect(await page.evaluate(() => window.getSelection()?.toString())).toBe('as')
      await host.getByRole('button', { name: 'sender-actions-inline:insert', exact: true }).click()
      await expect(editor).toHaveText('bX e')
      await host.getByRole('button', { name: 'sender-footer-right:append', exact: true }).click()
      expect(await editor.textContent()).toBe('bX etail')
      await host.getByRole('button', { name: 'sender-footer:focus', exact: true }).click()
      await expect.poll(() => page.evaluate(() => window.__scopedComposer.focused)).toBe(true)
      await expect(editor).toBeFocused()
      await expect(host.getByText('note.txt', { exact: true })).toBeVisible()
      await expect(host.getByRole('button', { name: '添加附件', exact: true })).toBeVisible()
      await host.getByRole('button', { name: 'Existing tool', exact: true }).click()
      expect(await page.evaluate(() => window.__scopedComposer.toolClicks)).toBe(1)
      const exposesEditor = await page.evaluate(() =>
        window.__scopedComposer.scopes.some(({ context }) => 'editor' in context),
      )
      expect(exposesEditor).toBe(false)
      if (tag === 'tr-chat-ui')
        expect(await page.evaluate(() => window.__scopedComposer.requests.at(-1))).toContain('tail')
    })

    test('renderer replacement retires scopes and restores the static footer fallback', async ({ page }) => {
      const host = page.locator(`${tag}#scoped-composer`)
      await expect(host.locator('[data-sender-renderer="sender-footer"]')).toBeVisible()
      await host.evaluate((host) => (host as TestHost).setInputValue('Keep draft'))
      await expect(host.locator('.tr-sender-editor')).toHaveText('Keep draft')
      await page.evaluate(() => {
        const state = window.__scopedComposer
        state.stale = state.scopes.filter((scope) => scope.name === 'sender-footer').at(-1)
        state.host.renderers = { ...state.renderers, 'sender-footer': () => 'Replacement footer' }
      })
      await expect(host.getByText('Replacement footer', { exact: true })).toBeVisible()
      await page.evaluate(() => {
        window.__scopedComposer.host.renderers = {}
      })
      await expect(host.locator('[data-legacy-footer]')).toHaveText('Legacy footer')
      const stale = await page.evaluate(async () => {
        const { stale } = window.__scopedComposer
        stale!.context.replace('Wrong stale draft')
        return { aborted: stale!.signal.aborted, focused: await stale!.context.focus() }
      })
      expect(stale).toEqual({ aborted: true, focused: false })
      await expect(host.locator('.tr-sender-editor')).toHaveText('Keep draft')
    })

    test('disabled native composer rejects direct renderer edit operations', async ({ page }) => {
      const host = page.locator(`${tag}#scoped-composer`)
      await expect(host.locator('[data-sender-renderer="sender-footer"]')).toBeVisible()
      await page.evaluate(() => {
        const { host } = window.__scopedComposer
        if (host.runtimeOptions) host.runtimeOptions = { ...host.runtimeOptions, composer: { disabled: true } }
        else host.data = { sender: { disabled: true }, bubble: { messages: [] } }
      })
      await expect(host.locator('.tr-sender')).toHaveClass(/is-disabled/)
      await expect(host.getByRole('button', { name: 'sender-footer:replace', exact: true })).toBeDisabled()
      expect(
        await page.evaluate(async () => {
          const scope = window.__scopedComposer.scopes.filter((scope) => scope.name === 'sender-footer').at(-1)!
          scope.context.insert('Blocked')
          scope.context.append('Blocked')
          scope.context.replace('Blocked')
          return scope.context.focus()
        }),
      ).toBe(false)
      await expect(host.locator('.tr-sender-editor')).toHaveText('')
    })

    test('custom welcome renderer reuses one native composer and preserves draft on replacement and transition', async ({
      page,
    }) => {
      const host = page.locator(`${tag}#scoped-composer`)
      await page.evaluate(() => {
        const state = window.__scopedComposer
        state.host.renderers = {
          ...state.renderers,
          'layout-empty-state': (context: WelcomeContext, { signal }: { signal: AbortSignal }) => {
            state.welcome = { context, signal }
            const welcome = document.createElement('section')
            welcome.dataset.customWelcome = ''
            welcome.append('Custom welcome')
            const target = context.renderComposer?.()
            state.composerIdempotent = Boolean(target && target === context.renderComposer?.())
            if (target) welcome.append(target)
            return welcome
          },
        }
      })
      await expect(host.locator('[data-custom-welcome] .tr-sender-editor')).toHaveCount(1)
      expect(await page.evaluate(() => window.__scopedComposer.composerIdempotent)).toBe(true)
      await host.evaluate((host) => (host as TestHost).setInputValue('Welcome draft'))
      await expect(host.locator('.tr-sender-editor')).toHaveText('Welcome draft')
      expect(await host.evaluate((host) => (host as TestHost).focusInput())).toBe(true)
      await expect(host.locator('.tr-sender-editor')).toBeFocused()
      await host
        .locator('.tr-sender-editor')
        .evaluate((editor) => editor.setAttribute('data-editor-identity', 'active'))
      await host.locator('.tr-sender-editor').dispatchEvent('compositionstart', { data: '中' })
      await host.evaluate((host) => {
        const element = host as TestHost
        element.ui = {
          ...element.ui,
          sender: { mode: 'multiple', placeholder: 'Updated placeholder' },
        } as TestHost['ui']
      })
      await expect(host.locator('.tr-sender-editor')).toHaveAttribute('data-editor-identity', 'active')
      await expect(host.locator('.tr-sender-editor')).toHaveText('Welcome draft')
      await expect(host.locator('.tr-sender-editor')).toBeFocused()
      await host.locator('.tr-sender-editor').press('Enter')
      await expect(host.locator('[data-custom-welcome] .tr-sender-editor')).toHaveCount(1)
      await expect(host.locator('.tr-sender-editor')).toHaveText('Welcome draft')
      if (tag === 'tr-chat-ui') expect(await page.evaluate(() => window.__scopedComposer.submit)).toBeUndefined()
      await host.locator('.tr-sender-editor').dispatchEvent('compositionend', { data: '中' })
      if (tag === 'tr-chat') {
        await host.evaluate((host) => {
          const element = host as TestHost
          element.attachments = [
            ...(element.attachments ?? []),
            { id: 'more', name: 'more.txt', status: 'success', rawFile: new File(['more'], 'more.txt') },
          ]
        })
        await expect(host.getByText('more.txt', { exact: true })).toBeVisible()
        await expect(host.locator('.tr-sender-editor')).toHaveAttribute('data-editor-identity', 'active')
        expect(await page.evaluate(() => window.__scopedComposer.welcome?.signal.aborted)).toBe(false)
      }
      await page.evaluate(() => {
        const state = window.__scopedComposer
        state.oldWelcome = state.welcome
        state.host.renderers = {
          ...state.renderers,
          'layout-empty-state': (context: WelcomeContext) => {
            const result = document.createElement('section')
            result.dataset.customWelcome = ''
            const target = context.renderComposer?.()
            if (target) result.append(target)
            return result
          },
        }
      })
      await expect(host.locator('[data-custom-welcome] .tr-sender-editor')).toHaveText('Welcome draft')
      expect(
        await page.evaluate(() => ({
          aborted: window.__scopedComposer.oldWelcome!.signal.aborted,
          staleTarget: window.__scopedComposer.oldWelcome!.context.renderComposer?.(),
        })),
      ).toEqual({ aborted: true, staleTarget: null })
      await host.evaluate((host) => {
        ;(host as TestHost).renderers = { ...window.__scopedComposer.renderers }
      })
      await expect(host.locator('.tr-sender-editor')).toHaveCount(1)
      await expect(host.locator('.tr-sender-editor')).toHaveText('Welcome draft')
      await expect(host.getByText('note.txt', { exact: true })).toBeVisible()
    })

    test('welcome replacement restores the exact native draft including consecutive spaces', async ({ page }) => {
      const host = page.locator(`${tag}#scoped-composer`)
      await page.evaluate(() => {
        const state = window.__scopedComposer
        state.host.renderers = { 'layout-empty-state': (context: WelcomeContext) => context.renderComposer?.() ?? null }
      })
      await host.locator('.tr-sender-editor').fill('Keep  draft  spaces')
      await expect(host.locator('.tr-sender-editor')).toHaveText('Keep  draft  spaces', { useInnerText: true })
      await page.evaluate(() => {
        const state = window.__scopedComposer
        state.host.renderers = {
          'layout-empty-state': (context: WelcomeContext) => {
            const container = document.createElement('section')
            container.dataset.whitespaceReplacement = ''
            const composer = context.renderComposer?.()
            if (composer) container.append(composer)
            return container
          },
        }
      })
      await expect(host.locator('[data-whitespace-replacement] .tr-sender-editor')).toHaveCount(1)
      expect(await host.locator('.tr-sender-editor').textContent()).toBe('Keep  draft  spaces')
    })

    test('single-line actions use the same native operations', async ({ page }) => {
      const host = page.locator(`${tag}#scoped-composer`)
      await host.evaluate((host) => {
        const element = host as TestHost
        element.ui = { ...element.ui, sender: { mode: 'single' } }
      })
      await expect(host.locator('.tr-sender')).toHaveClass(/tr-sender--single/)
      await host.getByRole('button', { name: 'sender-actions-inline:replace', exact: true }).click()
      await expect(host.locator('.tr-sender-editor')).toHaveText('base')
      await expect(host.locator('.tr-sender-editor')).toHaveCount(1)
    })

    test('welcome native submit preserves attachments and reaches the owning host', async ({ page }) => {
      const host = page.locator(`${tag}#scoped-composer`)
      await page.evaluate(() => {
        const state = window.__scopedComposer
        state.host.renderers = {
          ...state.renderers,
          'layout-empty-state': (context: WelcomeContext) => {
            const result = document.createElement('section')
            result.dataset.customWelcome = ''
            const target = context.renderComposer?.()
            if (target) result.append(target)
            return result
          },
        }
      })
      await expect(host.locator('[data-custom-welcome] .tr-sender-editor')).toHaveCount(1)
      await host.locator('.tr-sender-editor').fill('Send from custom welcome')
      await host.locator('.tr-sender-submit-button').click()
      if (tag === 'tr-chat') {
        await expect(host.getByText('Local reply', { exact: true })).toBeVisible()
        await expect(host.locator('[data-custom-welcome]')).toHaveCount(0)
        await expect(host.locator('.tr-sender-editor')).toHaveCount(1)
      } else {
        await expect
          .poll(() => page.evaluate(() => window.__scopedComposer.submit?.text))
          .toBe('Send from custom welcome')
        expect(await page.evaluate(() => window.__scopedComposer.submit?.attachments?.length)).toBe(1)
      }
    })

    test('omitted, disabled, and failed welcome targets never mount a hidden editor', async ({ page }) => {
      const host = page.locator(`${tag}#scoped-composer`)
      await page.evaluate(() => {
        const state = window.__scopedComposer
        state.host.renderers = {
          'layout-empty-state': (context: WelcomeContext) => {
            context.renderComposer?.()
            return 'Composer deliberately omitted'
          },
        }
      })
      await expect(host.getByText('Composer deliberately omitted')).toBeVisible()
      await expect(host.locator('.tr-sender-editor')).toHaveCount(0)
      expect(await host.evaluate((host) => (host as TestHost).focusInput())).toBe(false)
      await page.evaluate(() => {
        const state = window.__scopedComposer
        state.host.ui = { ...state.host.ui, sender: false }
        state.host.renderers = {
          'layout-empty-state': (context: WelcomeContext) => String(context.renderComposer?.() === null),
        }
      })
      await expect(host.getByText('true', { exact: true })).toBeVisible()
      await expect(host.locator('.tr-sender-editor')).toHaveCount(0)
      await page.evaluate(() => {
        const state = window.__scopedComposer
        state.host.ui = { ...state.host.ui, sender: { mode: 'multiple' } }
        state.host.renderers = {
          'layout-empty-state': (context: WelcomeContext) => {
            context.renderComposer?.()
            throw new Error('Welcome failed')
          },
        }
      })
      await expect(host.locator('[data-tr-chat-renderer]')).toHaveCount(1)
      await expect(host.locator('.tr-sender-editor')).toHaveCount(0)
      expect(await host.evaluate((host) => (host as TestHost).focusInput())).toBe(false)
    })
  })
}

test('native Vue slots retain precedence over shared DOM sender renderers', async ({ mount }) => {
  const component = await mount(ScopedComposerNative)
  await expect(component.locator('[data-native-welcome-renderer] .tr-sender-editor')).toHaveCount(1)
  await expect(component.locator('[data-native-footer]')).toHaveText('Native Vue footer')
})

test('borrowed Runtime replacement retires sender scopes even with equal empty views', async ({ mount, page }) => {
  await mount(ElementsFixture)
  await page.evaluate(async () => {
    const api = window.__trChatElements
    api.defineTrChatElements()
    const options = {
      autoSaveMessages: false,
      storage: {
        loadConversations: () => [],
        loadMessages: () => [],
        saveConversation() {},
        saveMessages() {},
        deleteConversation() {},
      },
      responseProvider: async () => ({
        id: 'local',
        object: 'chat.completion' as const,
        created: 1,
        model: 'local',
        choices: [],
        system_fingerprint: null,
      }),
    }
    const first = api.createChatRuntime(options)
    const second = api.createChatRuntime(options)
    const element = document.createElement('tr-chat') as TestHost
    element.id = 'borrowed-composer'
    element.runtime = first.runtime
    element.ui = { layout: { leftAside: false }, sender: { mode: 'multiple' } }
    const scopes: ScopeRecord[] = []
    element.renderers = {
      'sender-footer': (context: SenderContext, { signal }: { signal: AbortSignal }) => {
        scopes.push({ name: 'footer', context, signal })
        return 'Borrowed runtime footer'
      },
    }
    document.body.append(element)
    await api.whenTrChatReady(element)
    Object.assign(window, { __borrowedComposer: { first, second, element, scopes, stale: scopes.at(-1) } })
  })
  const host = page.locator('tr-chat#borrowed-composer')
  await expect(host.getByText('Borrowed runtime footer', { exact: true })).toBeVisible()
  await page.evaluate(() => {
    const state = (
      window as unknown as {
        __borrowedComposer: {
          element: TestHost
          second: { runtime: object }
          scopes: ScopeRecord[]
          stale?: ScopeRecord
        }
      }
    ).__borrowedComposer
    state.stale = state.scopes.at(-1)
    state.element.runtime = state.second.runtime
  })
  const aborted = () =>
    page.evaluate(
      () =>
        (window as unknown as { __borrowedComposer: { stale: ScopeRecord } }).__borrowedComposer.stale.signal.aborted,
    )
  await expect.poll(aborted).toBe(true)
  const focused = await page.evaluate(async () => {
    const state = (window as unknown as { __borrowedComposer: { stale: ScopeRecord } }).__borrowedComposer
    state.stale.context.replace('Wrong runtime draft')
    return state.stale.context.focus()
  })
  expect(focused).toBe(false)
  await expect(host.locator('.tr-sender-editor')).toHaveText('')
  await page.evaluate(async () => {
    const state = (
      window as unknown as {
        __borrowedComposer: {
          element: TestHost
          first: { dispose(): Promise<void> }
          second: { dispose(): Promise<void> }
        }
      }
    ).__borrowedComposer
    state.element.remove()
    await state.first.dispose()
    await state.second.dispose()
  })
})

test('welcome renderers refresh retained history items when the host assigns updated data', async ({ mount, page }) => {
  await mount(ElementsFixture)
  await page.evaluate(async () => {
    const api = window.__trChatElements
    api.defineTrChatElements()
    const host = document.createElement('tr-chat-ui') as TestHost
    host.id = 'retained-history'
    host.ui = { layout: { leftAside: false } }
    const history = [{ id: 'retained', title: 'Old title', createdAt: 1, updatedAt: 1 }]
    host.data = { conversation: { history }, bubble: { messages: [] } }
    host.renderers = {
      'layout-empty-state': (context: { conversation: { history?: readonly { title: string }[] } }) =>
        context.conversation.history?.[0]?.title ?? '',
    }
    document.body.append(host)
    await api.whenTrChatReady(host)
    Object.assign(window, { __retainedHistory: { host, history } })
  })
  const host = page.locator('tr-chat-ui#retained-history')
  await expect(host.getByText('Old title', { exact: true })).toBeVisible()
  for (const clone of [false, true]) {
    await page.evaluate((clone) => {
      const { host, history } = (
        window as unknown as { __retainedHistory: { host: TestHost; history: Array<{ title: string }> } }
      ).__retainedHistory
      history[0].title = clone ? 'Updated cloned history' : 'Updated retained history'
      host.data = { conversation: { history: clone ? [...history] : history }, bubble: { messages: [] } }
    }, clone)
    await expect(
      host.getByText(clone ? 'Updated cloned history' : 'Updated retained history', { exact: true }),
    ).toBeVisible()
  }
  await host.evaluate((host) => host.remove())
})
