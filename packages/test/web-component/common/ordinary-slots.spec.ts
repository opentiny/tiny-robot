import { expect, test } from '../support/test'

const destinations = {
  'welcome-footer': '.tr-welcome',
  'prompts-footer': '.tr-prompts',
  'sender-header': '.tr-sender-header',
  'input-prefix': '.tr-sender-input-prefix',
}
for (const kind of ['chat', 'ui']) {
  test(`${kind} 普通 Slot 区域分配与宿主视图`, async ({ page }) => {
    await page.goto('/#/content/ordinary-slots')
    await page.getByRole('combobox', { name: '组件', exact: true }).selectOption(kind)
    const host = page.locator('[data-slot-host]')
    await expect(host).toHaveJSProperty('tagName', kind === 'chat' ? 'TR-CHAT' : 'TR-CHAT-UI')
    await expect(host.locator('[contenteditable=true]')).toBeVisible()
    const counts = await Promise.all(
      Object.entries(destinations).map(async ([name, destination]) => [
        name,
        await host.locator(`${destination} [slot="${name}"]`).count(),
      ]),
    )
    await test.info().attach('普通 Slot 区域分配', { body: JSON.stringify(counts), contentType: 'application/json' })
    expect(counts).toEqual(Object.keys(destinations).map((name) => [name, 1]))
    const welcome = host.locator('.tr-welcome [slot=welcome-footer]')
    const refresh = host
      .locator('.tr-prompts [slot=prompts-footer]')
      .getByRole('button', { name: '换一组问题', exact: true })
    const topic = host.locator('.tr-sender-header [slot=sender-header] strong')
    const assistant = host.locator('.tr-sender-input-prefix [slot=input-prefix]')
    await expect(welcome).toHaveText('支持产品咨询、接入指导与问题排查。')
    await expect(topic).toHaveText('产品接入')
    await expect(assistant).toHaveText('AI')
    await expect(host.getByText('如何接入聊天组件？', { exact: true })).toBeVisible()
    await refresh.click()
    await expect(host.getByText('如何使用普通 Slot？', { exact: true })).toBeVisible()
    const overflow = await host
      .locator('.tr-sender-editor-scroll')
      .evaluate((element) => element.scrollHeight - element.clientHeight)
    expect(overflow, '空输入区应容纳助手标识').toBeLessThanOrEqual(1)
    const visibility = page.getByRole('checkbox', { name: '显示 Slot 内容', exact: true })
    await expect(visibility).toBeChecked()
    await page.getByLabel('咨询主题', { exact: true }).fill('账号管理')
    await expect(topic).toHaveText('账号管理')
    await visibility.uncheck()
    for (const name of Object.keys(destinations)) await expect(host.locator(`[slot="${name}"]`)).toHaveCount(0)
    await expect(host.locator('.tr-sender-header, .tr-sender-input-prefix')).toHaveCount(0)
    await page.getByLabel('咨询主题', { exact: true }).fill('重新显示的主题')
    await visibility.check()
    await expect(welcome).toHaveText('支持产品咨询、接入指导与问题排查。')
    await expect(topic).toHaveText('重新显示的主题')
    await expect(assistant).toHaveText('AI')
    await refresh.click()
    await expect(host.getByText('如何接入聊天组件？', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: '切换空状态', exact: true }).click()
    await expect(host.locator('.chat-panel-content--footer [slot=sender-header] strong')).toHaveText('重新显示的主题')
    await page.getByLabel('咨询主题', { exact: true }).fill('切换期间更新')
    await page.getByRole('button', { name: '切换空状态', exact: true }).click()
    await expect(topic).toHaveText('切换期间更新')
    await expect(welcome).toBeVisible()
    await expect(refresh).toBeVisible()
    await expect(assistant).toBeVisible()
    const old = await host.elementHandle()
    await page.getByRole('button', { name: '卸载元素', exact: true }).click()
    await expect(host).toHaveCount(0)
    await expect.poll(() => old!.evaluate((element) => element.childElementCount)).toBe(0)
    await page.getByRole('button', { name: '挂载元素', exact: true }).click()
    await expect(topic).toHaveText('切换期间更新')
    await refresh.click()
    await expect(host.getByText('如何使用普通 Slot？', { exact: true })).toBeVisible()
    await test.info().attach('普通 Slot 页面', { body: await page.screenshot(), contentType: 'image/png' })
    await page
      .getByRole('navigation', { name: '能力导航' })
      .getByRole('link', { name: '公开方法', exact: true })
      .click()
    await expect(host).toHaveCount(0)
    await expect(page.getByTestId('ready-state')).toHaveText('已就绪')
  })
}
