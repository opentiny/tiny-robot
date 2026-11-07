import { expect, test } from '@playwright/experimental-ct-vue'
import SenderSubmitFixture from './SenderSubmit.fixture.vue'

test.describe('Sender 同步提交校验', () => {
  for (const scenario of [
    { name: '空输入写入后可提交', initial: '', text: '你好', allowed: true },
    { name: '清空后不可提交', initial: '原输入', text: '', allowed: false },
    { name: '超限后不可提交', initial: 'A', text: 'AB', maxLength: 1, allowed: false },
    { name: '从超限恢复后可提交', initial: 'AB', text: 'A', maxLength: 1, allowed: true },
    { name: '长度按字素计算', initial: '', text: '👨‍👩‍👧‍👦', maxLength: 1, allowed: true },
    { name: '空白不可提交', initial: '', text: '   ', allowed: false },
  ]) {
    test(scenario.name, async ({ mount, page }) => {
      await mount(SenderSubmitFixture, { props: { initial: scenario.initial, maxLength: scenario.maxLength } })
      await page.evaluate((text) => window.senderSubmitFixture.setAndSubmit(text), scenario.text)
      const submissions = await page.evaluate(() => window.senderSubmitFixture.snapshot())
      expect(submissions.map(([text]) => text)).toEqual(scenario.allowed ? [scenario.text] : [])
    })
  }

  for (const gate of ['disabled', 'loading', 'submitDisabled'] as const) {
    test(`${gate} 阻止程序化提交`, async ({ mount, page }) => {
      await mount(SenderSubmitFixture, { props: { initial: 'A', [gate]: true } })
      await page.evaluate(() => window.senderSubmitFixture.setAndSubmit('B'))
      expect(await page.evaluate(() => window.senderSubmitFixture.snapshot())).toEqual([])
    })
  }

  test('外部内容允许空文本提交', async ({ mount, page }) => {
    await mount(SenderSubmitFixture, { props: { hasExternalContent: true } })
    await page.evaluate(() => window.senderSubmitFixture.setAndSubmit(''))
    expect(await page.evaluate(() => window.senderSubmitFixture.snapshot())).toEqual([['', undefined]])
  })

  test('注册内容允许空文本提交并保留载荷', async ({ mount, page }) => {
    await mount(SenderSubmitFixture, { props: { payload: '附件' } })
    await page.evaluate(() => window.senderSubmitFixture.setAndSubmit(''))
    expect(await page.evaluate(() => window.senderSubmitFixture.snapshot())).toEqual([
      ['', undefined, { externalPayloads: [{ source: 'test', payload: '附件' }] }],
    ])
  })
})
