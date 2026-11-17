import { expect, test } from '@playwright/experimental-ct-vue'
import Baseline from './ElementBaseline.fixture.vue'
import type { TrChatHTMLElement, TrChatUIHTMLElement } from '../../../chat/src/experimental'

test.use({ viewport: { width: 1440, height: 1000 } })
for (const variant of ['direct', 'adapted'] as const) {
  for (const kind of ['chat', 'ui'] as const) {
    test(`${variant} ${kind} 保留输入方法与焦点返回值`, async ({ mount, page }) => {
      await mount(Baseline, { props: { variant, kind } })
      const host = page.locator('[data-baseline]')
      await expect
        .poll(() => host.evaluate((element) => typeof (element as TrChatUIHTMLElement).setInputValue))
        .toBe('function')
      await host.evaluate((element) => (element as TrChatUIHTMLElement).setInputValue('方法设置的草稿'))
      await expect(host.locator('[contenteditable=true]')).toHaveText('方法设置的草稿')
      expect(await host.evaluate((element) => (element as TrChatUIHTMLElement).focusInput())).toBe(true)
      await expect(host.locator('[contenteditable=true]')).toBeFocused()
      await host.evaluate((element) => (element as TrChatUIHTMLElement).clearInput())
      await expect(host.locator('[contenteditable=true]')).toHaveText('')
      await host.evaluate((element) => {
        const chat = element as TrChatUIHTMLElement
        chat.ui = { ...chat.ui, sender: false }
      })
      expect(await host.evaluate((element) => (element as TrChatUIHTMLElement).focusInput())).toBe(false)
    })
    test(`${variant} ${kind} 侧栏方法保留开合、面板结果与原事件`, async ({ mount, page }) => {
      const fixture = await mount(Baseline, { props: { variant, kind } })
      const host = page.locator('[data-baseline]')
      await expect
        .poll(() => host.evaluate((element) => typeof (element as TrChatUIHTMLElement).activateRightAsidePanel))
        .toBe('function')
      expect(await host.evaluate((element) => (element as TrChatUIHTMLElement).activateRightAsidePanel('mcp'))).toBe(
        true,
      )
      expect(
        await host.evaluate((element) => (element as TrChatUIHTMLElement).activateRightAsidePanel('missing')),
      ).toBe(false)
      await host.evaluate((element) => (element as TrChatUIHTMLElement).openRightAside('mcp'))
      await expect(host.locator('.tr-layout__aside--right')).toHaveJSProperty('inert', false)
      await expect(fixture.getByTestId('baseline-events')).toContainText(
        '"name":"update:right-aside-open","detail":[true]',
      )
      await host.evaluate((element) => (element as TrChatUIHTMLElement).closeRightAside())
      await expect(host.locator('.tr-layout__aside--right')).toHaveJSProperty('inert', true)
      await host.evaluate((element) => (element as TrChatUIHTMLElement).toggleRightAside('mcp'))
      await expect(host.locator('.tr-layout__aside--right')).toHaveJSProperty('inert', false)
    })
    test(`${variant} ${kind} 普通配置、历史数组、空状态和侧栏属性保持可用`, async ({ mount, page }) => {
      await mount(Baseline, { props: { variant, kind, controlled: true, defaultOpen: true } })
      const host = page.locator('[data-baseline]')
      await expect(host.getByText('历史条目', { exact: true })).toBeVisible()
      await expect(host.locator('.tr-layout__aside--right')).toHaveJSProperty('inert', true)
      await host.evaluate((element) => {
        const chat = element as TrChatUIHTMLElement
        chat.rightAsideOpen = true
        chat.activeRightAsidePanelId = 'mcp'
        chat.isEmpty = true
      })
      await expect(host.locator('.tr-layout__aside--right')).toHaveJSProperty('inert', false)
      await expect(host.getByText('基线欢迎', { exact: true })).toBeVisible()
      await host.evaluate((element) => {
        const chat = element as TrChatUIHTMLElement
        chat.isEmpty = false
        chat.ui = { ...chat.ui, header: false }
      })
      await expect(host.getByText('基线欢迎', { exact: true })).toHaveCount(0)
      await expect(host.locator('.chat-header')).toHaveCount(0)
      if (kind === 'chat') {
        await host.evaluate(
          (element) => ((element as TrChatHTMLElement).historyData = [{ id: 'new', title: '替换后的历史' }]),
        )
        await expect(host.getByText('替换后的历史', { exact: true })).toBeVisible()
      } else {
        await host.evaluate((element) => {
          const chat = element as TrChatUIHTMLElement
          chat.inputValue = '受控草稿'
          chat.data = { conversation: { title: '更新数据标题' } }
          chat.ui = { ...chat.ui, header: undefined }
        })
        await expect(host.locator('[contenteditable=true]')).toHaveText('受控草稿')
        await expect(host.getByText('更新数据标题', { exact: true })).toBeVisible()
      }
    })
    test(`${variant} ${kind} 默认侧栏初值保持可用`, async ({ mount, page }) => {
      await mount(Baseline, { props: { variant, kind, defaultOpen: true } })
      await expect
        .poll(async () => (await page.locator('[data-baseline] .tr-layout__aside--right').boundingBox())?.width)
        .toBe(260)
    })
    test(`${variant} ${kind} 浮窗初值及运行更新保持可用`, async ({ mount, page }) => {
      await mount(Baseline, { props: { variant, kind, defaultOpen: true, floating: true } })
      const floating = page.locator('.tr-layout--floating')
      await expect(floating).toHaveCSS('width', '640px')
      await expect(floating).toHaveCSS('left', '24px')
      await page.locator('[data-baseline]').evaluate(
        (element) =>
          ((element as TrChatUIHTMLElement).floatingState = {
            placement: 'top-right',
            width: 700,
            height: 500,
            offsetX: 40,
            offsetY: 48,
          }),
      )
      await expect(floating).toHaveCSS('width', '700px')
      await expect(floating).toHaveCSS('height', '500px')
      await expect(floating).toHaveCSS('left', '700px')
      await expect(floating).toHaveCSS('top', '48px')
    })
  }
  test(`${variant} chat send 返回值、草稿恢复与 Runtime 替换`, async ({ mount, page }) => {
    await mount(Baseline, { props: { variant } })
    const host = page.locator('[data-baseline]')
    await expect.poll(() => host.evaluate((element) => typeof (element as TrChatHTMLElement).send)).toBe('function')
    await host.evaluate((element) => (element as TrChatHTMLElement).setInputValue('发送前草稿'))
    expect(await host.evaluate((element) => (element as TrChatHTMLElement).send({ text: ' 第一条消息 ' }))).toBe(true)
    await expect(host.getByText('第一条消息', { exact: true })).toBeVisible()
    await expect(host.getByText('回复 A', { exact: true })).toBeVisible()
    await expect(host.locator('[contenteditable=true]')).toHaveText('')
    await page.getByRole('button', { name: '接入或替换 Runtime' }).click()
    expect(await host.evaluate((element) => (element as TrChatHTMLElement).send({ text: '第二条消息' }))).toBe(true)
    await expect(host.getByText('回复 B', { exact: true })).toBeVisible()
    await host.evaluate((element) => (element as TrChatHTMLElement).setInputValue('拒绝后保留草稿'))
    await page.getByRole('button', { name: '拒绝后续发送' }).click()
    expect(await host.evaluate((element) => (element as TrChatHTMLElement).send({ text: '拒绝消息' }))).toBe(false)
    await expect(host.locator('[contenteditable=true]')).toHaveText('拒绝后保留草稿')
  })
}

test('adapted ui 同时保留原更新事件、Vue连字符名与项目别名，单一监听只收到一次', async ({ mount, page }) => {
  const fixture = await mount(Baseline, { props: { variant: 'adapted', kind: 'ui' } })
  const input = page.locator('[data-baseline] [contenteditable=true]')
  await expect(input).toHaveText('初始草稿')
  await input.fill('更新文字')
  await expect
    .poll(async () =>
      JSON.parse((await fixture.getByTestId('baseline-events').textContent()) ?? '[]').filter(
        (event: { name: string }) =>
          ['update:inputValue', 'update:input-value', 'input-value-update'].includes(event.name),
      ),
    )
    .toHaveLength(3)
  const records = JSON.parse((await fixture.getByTestId('baseline-events').textContent()) ?? '[]')
  for (const name of ['update:inputValue', 'update:input-value', 'input-value-update'])
    expect(records.filter((item: { name: string }) => item.name === name)).toEqual([{ name, detail: ['更新文字'] }])
})

test('adapted chat 方法在 ready 回调可用并在同元素重连后调用当前实例', async ({ mount, page }) => {
  await mount(Baseline, { props: { variant: 'adapted', delayed: true } })
  const host = page.locator('[data-baseline]')
  await expect
    .poll(() => host.evaluate((element) => typeof (element as TrChatHTMLElement).setInputValue))
    .toBe('function')
  expect(
    await host.evaluate((element) => {
      try {
        ;(element as TrChatHTMLElement).setInputValue('未就绪输入')
        return '没有报错'
      } catch (error) {
        return String(error)
      }
    }),
  ).toContain('not ready')
  await host.evaluate((element) => {
    element.addEventListener(
      'ready',
      () => {
        ;(element as TrChatHTMLElement).setInputValue('ready 回调草稿')
      },
      { once: true },
    )
  })
  await page.getByRole('button', { name: '接入或替换 Runtime' }).click()
  await expect(host.locator('[contenteditable=true]')).toHaveText('ready 回调草稿')
  const cached = await host.evaluateHandle((element) => (element as TrChatHTMLElement).setInputValue)
  await page.getByRole('button', { name: '重连同一元素' }).click()
  await expect(host.locator('[contenteditable=true]')).toBeVisible()
  await cached.evaluate((setInput) => setInput('重连后的草稿'))
  await expect(host.locator('[contenteditable=true]')).toHaveText('重连后的草稿')
  await page.getByRole('button', { name: '接入或替换 Runtime' }).click()
  await cached.evaluate((setInput) => setInput('替换后的草稿'))
  await expect(host.locator('[contenteditable=true]')).toHaveText('替换后的草稿')
  const events = JSON.parse((await page.getByTestId('baseline-events').textContent()) ?? '[]')
  expect(events.filter((event: { name: string }) => event.name === 'ready')).toEqual([{ name: 'ready', detail: [] }])
})

for (const kind of ['chat', 'ui'] as const) {
  test(`adapted ${kind} 首次就绪 Promise 支持初始化等待与就绪后调用`, async ({ mount, page }) => {
    await mount(Baseline, { props: { variant: 'adapted', kind, delayed: true } })
    const host = page.locator('[data-baseline]')
    const wait = page.getByRole('button', { name: '等待就绪并设置草稿' })
    await wait.click()
    if (kind === 'chat') {
      await expect(page.getByTestId('baseline-readiness')).toHaveText('等待首次就绪')
      await expect(host.locator('[contenteditable=true]')).toHaveCount(0)
      await page.getByRole('button', { name: '接入或替换 Runtime' }).click()
    }
    await expect(page.getByTestId('baseline-readiness')).toHaveText('已就绪')
    await expect(host.locator('[contenteditable=true]')).toHaveText('就绪后的草稿')
    await host.evaluate((element) => (element as TrChatUIHTMLElement).clearInput())
    await expect(host.locator('[contenteditable=true]')).toHaveText('')
    await wait.click()
    await expect(host.locator('[contenteditable=true]')).toHaveText('就绪后的草稿')
  })

  test(`adapted ${kind} 布尔属性可读回传入值并恢复可选状态`, async ({ mount, page }) => {
    await mount(Baseline, { props: { variant: 'adapted', kind } })
    const host = page.locator('[data-baseline]')
    for (const value of [true, false, undefined]) {
      await host.evaluate((element, value) => {
        const chat = element as TrChatUIHTMLElement
        chat.isEmpty = value
        chat.rightAsideOpen = value
        chat.defaultRightAsideOpen = value
      }, value)
      await expect
        .poll(() =>
          host.evaluate((element) => {
            const chat = element as TrChatUIHTMLElement
            return [chat.isEmpty, chat.rightAsideOpen, chat.defaultRightAsideOpen]
          }),
        )
        .toEqual([value, value, value])
    }
  })
}

for (const variant of ['direct', 'adapted'] as const) {
  test(`${variant} chat 可重置可选 title 并恢复默认标题`, async ({ mount, page }) => {
    await mount(Baseline, { props: { variant } })
    const host = page.locator('[data-baseline]')
    await expect(host.locator('.chat-header__title')).toHaveText('基线标题')
    await host.evaluate((element) => {
      ;(element as TrChatHTMLElement).title = '修改后的标题'
    })
    await expect(host.locator('.chat-header__title')).toHaveText('修改后的标题')
    await host.evaluate((element) => {
      Reflect.set(element, 'title', undefined)
    })
    await expect(host.locator('.chat-header__title')).toHaveText('新对话')
  })
}
