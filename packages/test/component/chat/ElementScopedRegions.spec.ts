import { expect, test } from '@playwright/experimental-ct-vue'
import Baseline from './ElementBaseline.fixture.vue'

for (const kind of ['chat', 'ui'] as const) {
  test(`${kind} 消息和输入区 Scoped Slot 与普通 Slot 共存`, async ({ mount, page }) => {
    await mount(Baseline, { props: { variant: 'adapted', kind, ordinarySlot: true } })
    const host = page.locator('[data-baseline]')
    await expect(host.locator('[contenteditable=true]')).toBeVisible()
    await host.evaluate(async (element, kind) => {
      const renderers: Record<string, unknown> = {
        'composer-before': (context: { value: string }) => {
          const label = document.createElement('p')
          label.dataset.composerValue = ''
          label.textContent = `草稿：${context.value}`
          return label
        },
        'composer-after': () => '自定义输入区说明',
      }
      for (const name of ['bubble-prefix', 'bubble-suffix', 'bubble-after', 'bubble-content-footer']) {
        renderers[name] = (context: { role: string; messageIndexes: number[] }) => {
          const label = document.createElement('small')
          label.dataset.bubblePosition = name
          label.textContent = `${context.role}:${context.messageIndexes.join(',')}`
          return label
        }
      }
      Reflect.set(element, 'renderers', renderers)
      Reflect.set(element, 'isEmpty', false)
      if (kind === 'ui')
        Reflect.set(element, 'data', {
          bubble: {
            messages: [
              { id: 'q', role: 'user', content: '如何接入？' },
              { id: 'a', role: 'assistant', content: '按文档配置。' },
            ],
          },
        })
      else await Reflect.get(element, 'send')({ text: '如何接入？' })
    }, kind)
    for (const name of ['bubble-prefix', 'bubble-suffix', 'bubble-after', 'bubble-content-footer']) {
      await expect(host.locator(`[data-bubble-position="${name}"]`)).toHaveText(['user:0', 'assistant:1'])
    }
    await expect(host.getByText('自定义输入区说明', { exact: true })).toBeVisible()
    await expect(host.locator('.tr-sender-header [slot=sender-header]')).toHaveText('宿主输入区提示')
    await host.evaluate((element) => Reflect.get(element, 'setInputValue')('上下文更新'))
    await expect(host.locator('[data-composer-value]')).toHaveText('草稿：上下文更新')
  })
}

test('侧栏 Scoped Slot 交付历史与面板上下文', async ({ mount, page }) => {
  await mount(Baseline, { props: { variant: 'adapted', kind: 'ui' } })
  const host = page.locator('[data-baseline]')
  await expect(host.locator('[contenteditable=true]')).toBeVisible()
  await host.evaluate((element) => {
    Reflect.set(element, 'renderers', {
      'layout-left-aside-brand': () => '自定义品牌',
      'layout-left-aside-history-item-prefix': (context: { item: { title: string } }) => `历史：${context.item.title}`,
      'layout-right-aside-title': (context: { panelId: string }) => `面板：${context.panelId}`,
      'layout-right-aside-panel': (context: {
        panelId: string
        isRightAsideOpen: boolean
        closeRightAside(): void
      }) => {
        const button = document.createElement('button')
        button.textContent = `关闭 ${context.panelId}`
        button.dataset.panelOpen = String(context.isRightAsideOpen)
        button.onclick = () => context.closeRightAside()
        return button
      },
    })
    const ui = Reflect.get(element, 'ui')
    Reflect.set(element, 'ui', {
      ...ui,
      layout: { ...ui.layout, rightAside: { panels: [{ id: 'details', title: '详情' }] } },
    })
    Reflect.get(element, 'openRightAside')('details')
  })
  await expect(host.getByText('自定义品牌', { exact: true })).toBeVisible()
  await expect(host.getByText('历史：历史条目', { exact: true })).toBeVisible()
  await expect(host.getByText('面板：details', { exact: true })).toBeVisible()
  await host.getByRole('button', { name: '关闭 details', exact: true }).click()
  await expect(host.getByRole('button', { name: '关闭 details', exact: true })).toHaveAttribute(
    'data-panel-open',
    'false',
  )
})

test('Sender 普通内容与同名 Renderer 按优先级切换', async ({ mount, page }) => {
  await mount(Baseline, { props: { variant: 'adapted', kind: 'ui' } })
  const host = page.locator('[data-baseline]')
  await expect(host.locator('[contenteditable=true]')).toBeVisible()
  await host.evaluate((element) => {
    const footer = document.createElement('span')
    footer.slot = 'sender-footer'
    footer.textContent = '普通底部内容'
    const right = document.createElement('span')
    right.slot = 'sender-footer-right'
    right.textContent = '普通底部右侧'
    element.append(footer, right)
  })
  await expect(host.locator('.tr-sender [slot=sender-footer]')).toHaveText('普通底部内容')
  await expect(host.locator('.tr-sender [slot=sender-footer-right]')).toHaveText('普通底部右侧')
  await host.evaluate((element) => Reflect.set(element, 'renderers', { 'sender-footer': () => '上下文底部内容' }))
  await expect(host.getByText('上下文底部内容', { exact: true })).toBeVisible()
  await expect(host.getByText('普通底部内容', { exact: true })).toHaveCount(0)
  await host.evaluate((element) => Reflect.set(element, 'renderers', {}))
  await expect(host.locator('.tr-sender [slot=sender-footer]')).toHaveText('普通底部内容')
})
