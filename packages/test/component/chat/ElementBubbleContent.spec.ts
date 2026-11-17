import { expect, test } from '@playwright/experimental-ct-vue'
import Bubble from './ElementBubbleContent.fixture.vue'
import type { ChatBubbleContentRendererContext, TrChatUIHTMLElement } from '../../../chat/src/experimental'

for (const kind of ['chat', 'ui'] as const) {
  test(`${kind} Bubble 正文沿用默认渲染并交付原消息与内容索引`, async ({ mount, page }) => {
    await mount(Bubble, { props: { kind } })
    const host = page.locator('[data-bubble-host]')
    await expect(host.locator('.tr-bubble-list')).toBeVisible()
    await host.evaluate((element) => {
      element.addEventListener('bubble-event', (event) => {
        if ((event as CustomEvent).detail[0].name === 'product-open')
          element.setAttribute('data-event', JSON.stringify((event as CustomEvent).detail[0]))
      })
      element.addEventListener('bubble-state-change', (event) => {
        element.setAttribute('data-state', JSON.stringify((event as CustomEvent).detail[0]))
      })
      Reflect.set(element, 'bubbleRenderers', {
        contentRendererMatches: [
          {
            find: (_message: unknown, content: { type: string }) => content.type === 'product-card',
            attributes: { 'data-card-outlet': 'true' },
            renderer: (scope: ChatBubbleContentRendererContext, { signal }: { signal: AbortSignal }) => {
              const button = document.createElement('button')
              button.textContent = String(scope.content.title)
              button.dataset.product = ''
              button.addEventListener(
                'click',
                () => {
                  scope.emit({ name: 'product-open', payload: scope.content.title })
                  scope.setState('selected', true)
                },
                { signal },
              )
              return button
            },
          },
        ],
      })
    })
    await expect(host.locator('[data-product]')).toHaveText(['产品 0', '第二张卡片'])
    await expect(host.getByText('卡片后的默认内容', { exact: true })).toBeVisible()
    await expect(host.locator('strong')).toHaveText('保留')
    await host.getByRole('button', { name: '第二张卡片', exact: true }).click()
    await expect.poll(() => host.getAttribute('data-event')).toContain('"messageIndex":2')
    await expect.poll(() => host.getAttribute('data-state')).toContain('"contentIndex":0')
    expect(JSON.parse((await host.getAttribute('data-state'))!)).toMatchObject({
      messageIndex: 2,
      contentIndex: 0,
      key: 'selected',
      value: true,
    })
    await page.getByRole('button', { name: '更新正文', exact: true }).click()
    await expect(host.getByRole('button', { name: '产品 1', exact: true })).toBeVisible()
    await page.getByRole('button', { name: '追加内容字段', exact: true }).click()
    await expect(host.getByRole('button', { name: '流式卡片', exact: true })).toBeVisible()
    await host.evaluate((element) => {
      ;(element as TrChatUIHTMLElement).bubbleRenderers = undefined
    })
    await expect(host.getByText('卡片后的默认内容', { exact: true })).toBeVisible()
    await expect(host.locator('[data-product]')).toHaveCount(0)
  })
}

for (const kind of ['chat', 'ui'] as const) {
  test(`${kind} 正文替换与异常恢复清理旧调用，split 保留内容索引`, async ({ mount, page }) => {
    await mount(Bubble, { props: { kind } })
    const host = page.locator('[data-bubble-host]')
    await expect(host.locator('.tr-bubble-list')).toBeVisible()
    await host.evaluate((element) => {
      element.addEventListener('renderer-error', (event) =>
        element.setAttribute('data-error', JSON.stringify((event as CustomEvent).detail[0])),
      )
      element.addEventListener('bubble-event', (event) =>
        element.setAttribute('data-event', JSON.stringify((event as CustomEvent).detail[0])),
      )
      const ui = Reflect.get(element, 'ui')
      Reflect.set(element, 'ui', {
        ...ui,
        bubble: {
          bubbleList: {
            contentRenderMode: 'split',
            groupStrategy: (messages: { role?: string }[]) =>
              messages.map((message, index) => ({ role: message.role, messages: [message], messageIndexes: [index] })),
            contentResolver: (message: { content: unknown }) =>
              typeof message.content === 'string'
                ? message.content
                : [{ type: 'text', text: '转换后的首项' }, ...(message.content as object[])],
          },
        },
      })
      Reflect.set(element, 'bubbleRenderers', {
        contentRendererMatches: [
          {
            find: (_message: unknown, content: { type: string }) => content.type === 'product-card',
            renderer: (scope: ChatBubbleContentRendererContext, { signal }: { signal: AbortSignal }) => {
              const button = document.createElement('button')
              button.textContent = `内容 ${scope.contentIndex}`
              button.dataset.contentIndex = String(scope.contentIndex)
              // A retained DOM handler must lose its operations when its invocation ends.
              button.onclick = () => scope.emit({ name: 'open', payload: scope.content.title })
              signal.addEventListener('abort', () => button.setAttribute('data-retired', 'true'), { once: true })
              return button
            },
          },
        ],
      })
    })
    await expect(host.locator('[data-content-index]')).toHaveText(['内容 1', '内容 1'])
    await host.locator('[data-content-index]').last().click()
    expect(JSON.parse((await host.getAttribute('data-event'))!)).toMatchObject({
      name: 'open',
      messageIndex: 2,
      contentIndex: 1,
    })
    const retired = await host.locator('[data-content-index]').first().elementHandle()
    await host.evaluate((element) => {
      Reflect.set(element, 'bubbleRenderers', {
        contentRendererMatches: [
          {
            find: (_: unknown, content: { type: string }) => content.type === 'product-card',
            renderer: () => {
              throw new Error('卡片渲染失败')
            },
          },
        ],
      })
    })
    await expect(host).toHaveAttribute('data-error', /bubble-content/)
    expect(await retired!.getAttribute('data-retired')).toBe('true')
    await host.evaluate((element) => element.setAttribute('data-event', '旧调用结束'))
    await retired!.evaluate((button: HTMLButtonElement) => button.click())
    await expect(host).toHaveAttribute('data-event', '旧调用结束')
    await host.evaluate((element) =>
      Reflect.set(element, 'bubbleRenderers', {
        fallbackContentRenderer: (scope: ChatBubbleContentRendererContext) => `恢复：${scope.content.type}`,
      }),
    )
    await expect(host.getByText('恢复：product-card', { exact: true })).toHaveCount(2)
    await expect(host.getByText('恢复：text', { exact: true })).toHaveCount(4)
  })
}

for (const kind of ['chat', 'ui'] as const) {
  test(`${kind} 正文保留既有匹配优先级、属性合并与角色回退`, async ({ mount, page }) => {
    await mount(Bubble, { props: { kind, legacy: true } })
    const host = page.locator('[data-bubble-host]')
    await expect(host.locator('[data-legacy-body]')).toHaveCount(2)
    await host.evaluate((element) =>
      Reflect.set(element, 'bubbleRenderers', {
        contentRendererMatches: [
          {
            find: (_: unknown, content: { type: string }) => content.type === 'product-card',
            priority: 10,
            renderer: () => '宿主低优先级',
          },
        ],
      }),
    )
    await expect(host.locator('[data-legacy-body]')).toHaveCount(2)
    await host.evaluate((element) =>
      Reflect.set(element, 'bubbleRenderers', {
        contentRendererMatches: [
          {
            find: (_: unknown, content: { type: string }) => content.type === 'product-card',
            priority: 0,
            attributes: { 'data-host-attr': '新增' },
            renderer: () => '宿主高优先级',
          },
        ],
      }),
    )
    await expect(host.locator('[data-host-attr]')).toHaveText(['宿主高优先级', '宿主高优先级'])
    await expect(host.locator('[data-host-attr]').first()).toHaveAttribute('data-provider-attr', '保留')
    await host.evaluate((element) =>
      Reflect.set(element, 'bubbleRenderers', { fallbackContentRenderer: () => '宿主 provider 回退' }),
    )
    await expect(host.locator('[data-legacy-body]')).toHaveCount(2)
    await expect(host.locator('[data-role-fallback]')).toHaveText('角色回退')
    await expect(host.getByText('宿主 provider 回退', { exact: true })).toBeVisible()
  })
}

test('切换 Runtime 立即使旧正文操作失效', async ({ mount, page }) => {
  await mount(Bubble, { props: { kind: 'chat' } })
  const host = page.locator('[data-bubble-host]')
  await expect(host.locator('.tr-bubble-list')).toBeVisible()
  await host.evaluate((element) => {
    element.addEventListener('bubble-event', () => element.setAttribute('data-event', '操作已交付'))
    Reflect.set(element, 'bubbleRenderers', {
      contentRendererMatches: [
        {
          find: (_: unknown, content: { type: string }) => content.type === 'product-card',
          renderer: (scope: ChatBubbleContentRendererContext) => {
            const button = document.createElement('button')
            button.dataset.runtimeCard = ''
            button.textContent = String(scope.content.title)
            button.onclick = () => scope.emit({ name: 'open' })
            return button
          },
        },
      ],
    })
  })
  await expect(host.locator('[data-runtime-card]')).toHaveCount(2)
  await host.evaluate((element) => {
    const button = element.querySelector<HTMLButtonElement>('[data-runtime-card]')!
    element.setAttribute('data-event', '尚未交付')
    Reflect.set(element, 'runtime', { ...Reflect.get(element, 'runtime') })
    // The host property changes before Vue has patched the existing message view.
    button.click()
  })
  await expect(host).toHaveAttribute('data-event', '尚未交付')
  await host.locator('[data-runtime-card]').first().click()
  await expect(host).toHaveAttribute('data-event', '操作已交付')
})
