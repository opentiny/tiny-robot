import { expect, test } from '../support/test'

for (const viewport of [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]) {
  test(`${viewport.width}px 视口内右侧独立滚动，导航与页头保持固定`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/#/basic/methods')
    await expect(page.getByTestId('ready-state')).toHaveText('已就绪')
    const nav = page.getByRole('navigation', { name: '能力导航' })
    const main = page.getByRole('main', { name: '公开方法', exact: true })
    const heading = page.getByRole('heading', { level: 1 })
    const navBefore = await nav.boundingBox()
    const headingBefore = await heading.boundingBox()
    expect(await page.evaluate(() => document.documentElement.scrollHeight)).toBeLessThanOrEqual(viewport.height)
    await page.getByTestId('demo-title').hover()
    await page.mouse.wheel(0, 500)
    await expect.poll(() => main.evaluate((element) => element.scrollTop)).toBeGreaterThan(100)
    expect(await nav.boundingBox()).toEqual(navBefore)
    expect(await heading.boundingBox()).toEqual(headingBefore)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
    const contentBounds = await main.boundingBox()
    expect(contentBounds!.y + contentBounds!.height).toBeLessThanOrEqual(viewport.height)
    expect(contentBounds!.y + contentBounds!.height).toBeGreaterThanOrEqual(viewport.height - 40)
    await expect(nav.getByRole('link', { name: 'Runtime 接入', exact: true })).toBeInViewport()
    await nav.getByRole('link', { name: 'Runtime 接入', exact: true }).click()
    await expect(page.getByTestId('demo-title')).toHaveText('Runtime 接入')
    await expect(page.getByTestId('ready-state')).toHaveText('已就绪')
    await expect(page.getByTestId('demo-title')).toBeInViewport()
  })
}

test('内容区可通过键盘滚动到底部，长导航独立滚动', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/#/basic/methods')
  await expect(page.getByTestId('ready-state')).toHaveText('已就绪')
  const main = page.getByRole('main', { name: '公开方法', exact: true })
  const nav = page.getByRole('navigation', { name: '能力导航' })
  await main.focus()
  await page.keyboard.press('End')
  await expect(main.getByRole('heading', { name: 'DOM 事件', exact: true })).toBeInViewport()
  await expect
    .poll(() => main.evaluate((element) => element.scrollHeight - element.clientHeight - element.scrollTop))
    .toBeLessThanOrEqual(1)
  const contentScroll = await main.evaluate((element) => element.scrollTop)
  await nav.evaluate((element) => {
    for (let index = 0; index < 40; index++) {
      const item = document.createElement('a')
      item.href = '#/basic/methods'
      item.textContent = `能力条目 ${index + 1}`
      element.append(item)
    }
  })
  await nav.hover({ position: { x: 80, y: 60 } })
  await page.mouse.wheel(0, 800)
  await expect.poll(() => nav.evaluate((element) => element.scrollTop)).toBeGreaterThan(100)
  expect(await main.evaluate((element) => element.scrollTop)).toBe(contentScroll)
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})
