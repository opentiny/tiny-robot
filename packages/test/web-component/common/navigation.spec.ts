import { expect, test } from '../support/test'

const paths = [
  { title: '属性与事件', path: '/basic/props' },
  { title: 'Runtime 接入', path: '/basic/runtime' },
  { title: '浮窗状态', path: '/basic/floating' },
]

test('能力导航支持直达、刷新和浏览器前进后退', async ({ page }) => {
  await page.goto('/#/basic/runtime')
  const nav = page.getByRole('navigation', { name: '能力导航' })
  await expect(nav).toBeVisible()
  for (const item of paths)
    await expect(nav.getByRole('link', { name: item.title, exact: true })).toHaveAttribute('href', `#${item.path}`)
  await expect(nav.getByRole('link', { name: 'Runtime 接入', exact: true })).toHaveAttribute('aria-current', 'page')
  await expect(page.getByTestId('demo-title')).toHaveText('Runtime 接入')
  await expect(page.getByTestId('ready-state')).toHaveText('已就绪')
  await page.reload()
  await expect(page.getByTestId('demo-title')).toHaveText('Runtime 接入')
  await nav.getByRole('link', { name: '属性与事件', exact: true }).click()
  await expect(page.getByTestId('demo-title')).toHaveText('属性与事件')
  await page.goBack()
  await expect(page.getByTestId('demo-title')).toHaveText('Runtime 接入')
  await page.goForward()
  await expect(page.getByTestId('demo-title')).toHaveText('属性与事件')
  await expect(page.getByTestId('ready-state')).toHaveText('已就绪')
})

test('切换能力销毁浮窗，重新进入使用独立初始状态', async ({ page }) => {
  await page.goto('/#/basic/props')
  await page.getByLabel('标题', { exact: true }).fill('这个标题只属于属性页')
  await page.getByRole('button', { name: '应用标题', exact: true }).click()
  await expect(page.locator('tr-chat').getByText('这个标题只属于属性页', { exact: true })).toBeVisible()
  const nav = page.getByRole('navigation', { name: '能力导航' })
  await nav.getByRole('link', { name: '浮窗状态', exact: true }).click()
  await expect(page.locator('.tr-layout--floating')).toHaveCSS('width', '500px')
  await nav.getByRole('link', { name: 'Runtime 接入', exact: true }).click()
  await expect(page.getByTestId('demo-title')).toHaveText('Runtime 接入')
  await expect(page.locator('.tr-layout--floating')).toHaveCount(0)
  await expect(page.getByTestId('event-log').getByText('ready []', { exact: true })).toHaveCount(1)
  await nav.getByRole('link', { name: '属性与事件', exact: true }).click()
  await expect(page.getByLabel('标题', { exact: true })).toHaveValue('我的助手')
  await expect(page.locator('tr-chat').getByText('我的助手', { exact: true })).toBeVisible()
  await expect(page.getByTestId('event-log').getByText('ready []', { exact: true })).toHaveCount(1)
})

test('未知能力地址回到默认能力并保留查询参数', async ({ page }) => {
  await page.goto('/?source=bookmark#/missing')
  await expect(page).toHaveURL(/\?source=bookmark#\/basic\/props$/)
  await expect(page.getByTestId('demo-title')).toHaveText('属性与事件')
  await expect(
    page.getByRole('navigation', { name: '能力导航' }).getByRole('link', { name: '属性与事件', exact: true }),
  ).toHaveAttribute('aria-current', 'page')
  await expect(page.getByTestId('ready-state')).toHaveText('已就绪')
})

test('窄屏可以从导航切换能力且没有横向溢出', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#/basic/props')
  await page
    .getByRole('navigation', { name: '能力导航' })
    .getByRole('link', { name: 'Runtime 接入', exact: true })
    .click()
  await expect(page.getByTestId('demo-title')).toHaveText('Runtime 接入')
  await page.getByRole('button', { name: '延后接入', exact: true }).click()
  await expect(page.getByTestId('ready-state')).toHaveText('等待 Runtime')
  await page.getByRole('button', { name: '接入 Runtime', exact: true }).click()
  await expect(page.getByTestId('ready-state')).toHaveText('已就绪')
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
})

test('浏览器暂存并恢复页面后仍保留视图且可以切换能力', async ({ page }) => {
  await page.goto('/#/basic/props')
  await expect(page.getByTestId('ready-state')).toHaveText('已就绪')
  await page.getByLabel('标题', { exact: true }).fill('缓存恢复后的页面')
  await page.getByRole('button', { name: '应用标题', exact: true }).click()
  await expect(page.locator('tr-chat').getByText('缓存恢复后的页面', { exact: true })).toBeVisible()
  // 使用浏览器公开生命周期事件验证文档暂存契约，独立于测试浏览器是否启用历史缓存。
  await page.evaluate(() => {
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }))
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
  })
  await expect(page.getByLabel('标题', { exact: true })).toHaveValue('缓存恢复后的页面')
  await page.locator('tr-chat [contenteditable="true"]').fill('缓存恢复后继续聊天')
  await page.locator('tr-chat .tr-sender-submit-button').click()
  await expect(page.locator('tr-chat').getByText('你好，我是本地演示助手。', { exact: true })).toBeVisible()
  await page
    .getByRole('navigation', { name: '能力导航' })
    .getByRole('link', { name: 'Runtime 接入', exact: true })
    .click()
  await expect(page.getByTestId('demo-title')).toHaveText('Runtime 接入')
  await expect(page.getByTestId('ready-state')).toHaveText('已就绪')
})
