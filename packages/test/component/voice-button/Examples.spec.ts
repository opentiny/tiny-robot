import { expect, test } from '@playwright/experimental-ct-vue'
import ExamplesFixture from './Examples.fixture.vue'

test.describe('示例', () => {
  test('空输入框语音结束立即提交', async ({ mount, page }) => {
    await page.clock.install({ time: 0 })
    await page.clock.pauseAt(1000)
    const component = await mount(ExamplesFixture, { props: { example: 'ui' } })
    await component.locator('.tr-action-button').click()
    await page.clock.runFor(1000)
    await component.locator('.tr-action-button').click()
    await expect(component.getByText('已提交：你好', { exact: true })).toBeVisible()
  })

  test('系统取消触摸后隐藏浮层，丢弃迟到结果且不提交', async ({ mount, page }) => {
    await page.clock.install({ time: 0 })
    await page.clock.pauseAt(1000)
    const component = await mount(ExamplesFixture, { props: { example: 'ui', delayedStop: true } })
    await component.locator('.tiptap').fill('原输入')
    await component.locator('.tiny-switch').click()
    await component.locator('.press-to-talk-area').dispatchEvent('mousedown', { clientY: 100 })
    await page.clock.runFor(1000)
    await component.locator('.chat-input-container').dispatchEvent('touchcancel')
    expect(await component.locator('.mobile-voice-overlay').count()).toBe(0)
    await expect(component.locator('.press-to-talk-area')).toBeVisible()
    await expect(component.locator('.tiny-switch')).toHaveAttribute('aria-disabled', 'true')
    await page.clock.runFor(100)
    await expect(component.getByText('已提交：', { exact: true })).toBeVisible()
    await component.locator('.tiny-switch').click()
    await expect(component.locator('.tiptap')).toHaveText('原输入')
    await component.locator('.tr-action-button').click()
    await page.clock.runFor(1000)
    await component.locator('.tr-action-button').click()
    await page.clock.runFor(100)
    await expect(component.getByText('已提交：你好停止后的结果', { exact: true })).toBeVisible()
  })

  test('移动端空输入接收特殊文本并提交原文', async ({ mount, page }) => {
    await page.clock.install({ time: 0 })
    await page.clock.pauseAt(1000)
    const stopText = '  A  B <tag>demo</tag> &amp;\n下一行  '
    const component = await mount(ExamplesFixture, { props: { example: 'ui', delayedStop: true, stopText } })
    await component.locator('.tiny-switch').click()
    await component.locator('.press-to-talk-area').dispatchEvent('mousedown', { clientY: 100 })
    await page.clock.runFor(1000)
    await component.locator('.chat-input-container').dispatchEvent('mouseup')
    await page.clock.runFor(100)
    expect(await component.locator('p[aria-live]').textContent()).toBe(`已提交：你好${stopText}`)
    await component.locator('.tiny-switch').click()
    expect(await component.locator('.tiptap').textContent()).toBe(`你好${stopText}`)
  })

  for (const example of ['mock', 'serviceMock'] as const) {
    test(`${example} 手动停止只结束一次，可以再次启动`, async ({ mount, page }) => {
      await page.clock.install()
      const component = await mount(ExamplesFixture, { props: { example } })
      await component.getByRole('button', { name: 'start', exact: true }).click()
      await expect(component.getByTestId('recording')).toHaveText('true')
      await page.clock.runFor(1000)
      await component.getByRole('button', { name: 'stop', exact: true }).click()
      await component.getByRole('button', { name: 'stop', exact: true }).click()
      await expect(component.getByTestId('recording')).toHaveText('false')
      await expect(component.getByTestId('ends')).toHaveText('1')
      await expect(component.getByTestId('text')).toHaveText('你好')
      await component.getByRole('button', { name: 'start', exact: true }).click()
      await page.clock.runFor(3000)
      await expect(component.getByTestId('recording')).toHaveText('false')
      await expect(component.getByTestId('ends')).toHaveText('2')
      await expect(component.getByTestId('text')).toHaveText('你好你好这是第二句话。')
    })
  }

  test('三种模式演示在录音时禁用切换', async ({ mount, page }) => {
    await page.clock.install()
    const component = await mount(ExamplesFixture, { props: { example: 'input' } })
    await component.getByRole('radio', { name: '替换', exact: true }).check()
    await component.locator('.tiptap').fill('原输入')
    await component.locator('.tr-action-button').click()
    await expect(component.getByRole('radio', { name: '追加', exact: true })).toBeDisabled()
    await page.clock.runFor(3000)
    await expect(component.locator('.tiptap')).toHaveText('你好你好这是第二句话。')
    await expect(component.getByRole('radio', { name: '追加', exact: true })).toBeEnabled()
  })

  test('自定义服务演示保留相同分句', async ({ mount, page }) => {
    await page.clock.install()
    const component = await mount(ExamplesFixture, { props: { example: 'custom' } })
    await component.locator('.tr-action-button').click()
    await page.clock.runFor(3000)
    await expect(component.locator('.tiptap')).toHaveText('你好 你好 这是第二句话。 ')
  })

  for (const cancel of [false, true]) {
    test(`移动端控制实例可用，${cancel ? '取消后丢弃迟到 final' : '正常结束等待 final 再提交'}`, async ({
      mount,
      page,
    }) => {
      await page.clock.install()
      const component = await mount(ExamplesFixture, { props: { example: 'ui', delayedStop: true } })
      await component.locator('.tiptap').fill('原输入')
      await component.locator('.tiny-switch').click()
      const area = component.locator('.press-to-talk-area')
      await area.dispatchEvent('mousedown', { clientY: 100 })
      await page.clock.runFor(1000)
      if (cancel) await component.locator('.chat-input-container').dispatchEvent('mousemove', { clientY: 10 })
      await component.locator('.chat-input-container').dispatchEvent('mouseup')
      await expect(component.getByText('已提交：', { exact: true })).toBeVisible()
      await page.clock.runFor(100)
      if (cancel) {
        await expect(component.getByText('已提交：', { exact: true })).toBeVisible()
      } else {
        await expect(component.getByText('已提交：你好停止后的结果', { exact: true })).toBeVisible()
      }
      await component.locator('.tiny-switch').click()
      await expect(component.locator('.tiptap')).toHaveText(cancel ? '原输入' : '你好停止后的结果')
    })
  }
})
