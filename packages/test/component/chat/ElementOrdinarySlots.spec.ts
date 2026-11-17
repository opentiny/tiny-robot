import { expect, test } from '@playwright/experimental-ct-vue'
import Baseline from './ElementBaseline.fixture.vue'
import type { TrChatUIHTMLElement } from '../../../chat/src/experimental'

test.use({ viewport: { width: 1440, height: 1000 } })
for (const kind of ['chat', 'ui'] as const) {
  test(`${kind} 未提供普通 Slot 时保留默认输入区布局`, async ({ mount, page }) => {
    await mount(Baseline, { props: { variant: 'adapted', kind } })
    const host = page.locator('[data-baseline]')
    await expect(host.locator('[contenteditable=true]')).toBeVisible()
    await expect(host.locator('.tr-sender-header, .tr-sender-input-prefix')).toHaveCount(0)
  })
  test(`${kind} 运行时增删普通 Slot 会同步输入区布局`, async ({ mount, page }) => {
    await mount(Baseline, { props: { variant: 'adapted', kind } })
    const host = page.locator('[data-baseline]')
    await expect(host.locator('[contenteditable=true]')).toBeVisible()
    await host.evaluate((element) => {
      const header = document.createElement('div')
      header.slot = 'sender-header'
      header.textContent = '动态提示'
      element.append(header)
    })
    await expect(host.locator('.tr-sender-header [slot=sender-header]')).toHaveText('动态提示')
    await host.evaluate((element) => {
      const earlier = document.createElement('div')
      earlier.slot = 'sender-header'
      earlier.textContent = '前置提示'
      element.insertBefore(earlier, element.querySelector('[slot=sender-header]'))
    })
    await expect(host.locator('.tr-sender-header [slot=sender-header]')).toHaveText(['前置提示', '动态提示'])
    const earlier = await host.locator('[slot=sender-header]').first().elementHandle()
    await earlier!.evaluate((node) => node.removeAttribute('slot'))
    await expect(host.locator('.tr-sender-header')).toHaveText('动态提示')
    await earlier!.evaluate((node) => node.setAttribute('slot', 'sender-header'))
    await expect(host.locator('.tr-sender-header [slot=sender-header]')).toHaveText(['前置提示', '动态提示'])
    await earlier!.evaluate((node) => node.remove())
    await host.evaluate((element) => {
      element.removeChild(element.querySelector('[slot=sender-header]')!)
    })
    await expect(host.locator('.tr-sender-header')).toHaveCount(0)
    await host.evaluate((element) => {
      const header = document.createElement('div')
      header.slot = 'sender-header'
      header.textContent = '重新提供的提示'
      element.append(header)
    })
    await expect(host.locator('.tr-sender-header [slot=sender-header]')).toHaveText('重新提供的提示')
  })
  test(`${kind} 未匹配的 Slot 内容保持未分配状态`, async ({ mount, page }) => {
    await mount(Baseline, {
      props: { variant: 'adapted', kind, ordinarySlot: true, ordinarySlotName: 'unknown-slot' },
    })
    const host = page.locator('[data-baseline]')
    await expect(host.locator('[contenteditable=true]')).toBeVisible()
    await expect(host.getByText('宿主输入区提示', { exact: true })).toHaveCount(0)
  })
  test(`${kind} 支持直接提供 SVG Slot 内容`, async ({ mount, page }) => {
    await mount(Baseline, { props: { variant: 'adapted', kind } })
    const host = page.locator('[data-baseline]')
    await expect(host.locator('[contenteditable=true]')).toBeVisible()
    await host.evaluate((element) => {
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      icon.setAttribute('slot', 'input-prefix')
      icon.setAttribute('aria-label', '助手图标')
      element.append(icon)
    })
    await expect(host.locator('.tr-sender-input-prefix svg[slot=input-prefix]')).toHaveAttribute(
      'aria-label',
      '助手图标',
    )
    await host.locator('svg[slot=input-prefix]').evaluate((node) => node.remove())
    await expect(host.locator('.tr-sender-input-prefix')).toHaveCount(0)
  })
  test(`${kind} 仅提供 sender-header，支持就绪、更新和同元素重连`, async ({ mount, page }) => {
    await mount(Baseline, { props: { variant: 'adapted', kind, delayed: true, ordinarySlot: true } })
    const host = page.locator('[data-baseline]')
    if (kind === 'chat') await page.getByRole('button', { name: '接入或替换 Runtime' }).click()
    const content = host.locator('.tr-sender-header [slot=sender-header]')
    await expect(content).toHaveText('宿主输入区提示')
    await expect(host.locator('.tr-sender-input-prefix')).toHaveCount(0)
    await host.evaluate((element) => {
      ;(element as TrChatUIHTMLElement).isEmpty = true
    })
    await expect(content).toHaveText('宿主输入区提示')
    await page.getByRole('button', { name: '重连同一元素' }).click()
    await expect(content).toHaveText('宿主输入区提示')
    await page.getByRole('button', { name: '等待就绪并设置草稿' }).click()
    await expect(host.locator('[contenteditable=true]')).toHaveText('就绪后的草稿')
  })
}
