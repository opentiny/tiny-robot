import type { Locator } from '@playwright/test'
import { expect, test } from '../helpers'
import { layoutSelectors } from '../selectors'

async function readStyle(locator: Locator, prop: string) {
  return locator.evaluate((el, name) => getComputedStyle(el).getPropertyValue(name).trim(), prop)
}

async function getBox(locator: Locator) {
  const box = await locator.boundingBox()

  if (!box) {
    throw new Error('Missing bounding box')
  }

  return box
}

test.describe('Layout 组件测试 - CSS Variables', () => {
  test.beforeEach(async ({ layout }) => {
    await layout.showCssVarFixtures()
    await layout.expectSurfaceMode('floating', layout.page.getByTestId('css-vars-floating-surface'))
  })

  test('公开变量: --tr-layout-height / --tr-layout-bg - 应影响 surface 实际高度和背景', async ({ page }) => {
    const surface = page.getByTestId('css-vars-normal-surface')
    const body = surface.locator(layoutSelectors.body)
    const box = await getBox(surface)

    expect(box.height).toBeGreaterThanOrEqual(418)
    expect(box.height).toBeLessThanOrEqual(422)
    await expect.poll(async () => readStyle(body, 'background-color')).toBe('rgb(244, 246, 251)')
  })

  test('公开变量: 区域背景和分隔线颜色 - 应作用于 left/right/header/main/footer', async ({ page }) => {
    const surface = page.getByTestId('css-vars-normal-surface')
    const leftAside = surface.locator(layoutSelectors.leftAside)
    const rightAside = surface.locator(layoutSelectors.rightAside)
    const header = surface.locator(layoutSelectors.header)
    const main = surface.locator(layoutSelectors.main)
    const footer = surface.locator(layoutSelectors.footer)

    await expect.poll(async () => readStyle(leftAside, 'background-color')).toBe('rgb(255, 244, 229)')
    await expect.poll(async () => readStyle(rightAside, 'background-color')).toBe('rgb(232, 245, 255)')
    await expect.poll(async () => readStyle(header, 'background-color')).toBe('rgb(224, 242, 254)')
    await expect.poll(async () => readStyle(main, 'background-color')).toBe('rgb(245, 250, 255)')
    await expect.poll(async () => readStyle(footer, 'background-color')).toBe('rgb(232, 245, 233)')
    await expect.poll(async () => readStyle(leftAside, 'border-right-color')).toBe('rgb(123, 134, 156)')
    await expect.poll(async () => readStyle(rightAside, 'border-left-color')).toBe('rgb(123, 134, 156)')
  })

  test('公开变量: --tr-layout-main-min-width - 应保护主区最小宽度', async ({ page }) => {
    const surface = page.getByTestId('css-vars-main-min-surface')
    const main = surface.locator(layoutSelectors.main)
    const box = await getBox(main)

    expect(box.width).toBeGreaterThanOrEqual(300)
  })

  test('公开变量: overlay / panel-shadow - 应作用于右侧 drawer，且不影响左侧 dock', async ({ page }) => {
    const surface = page.getByTestId('css-vars-right-drawer-surface')
    const leftDock = surface.locator(layoutSelectors.leftAside)
    const rightDrawer = surface.locator(layoutSelectors.rightAside)
    const backdrop = surface.locator(layoutSelectors.backdrop)

    await expect(rightDrawer).toBeVisible()

    const leftDockBox = await getBox(leftDock)
    const rightDrawerBox = await getBox(rightDrawer)

    expect(leftDockBox.width).toBeGreaterThanOrEqual(310)
    expect(leftDockBox.width).toBeLessThanOrEqual(314)
    expect(rightDrawerBox.width).toBeGreaterThanOrEqual(366)
    expect(rightDrawerBox.width).toBeLessThanOrEqual(370)
    await expect.poll(async () => readStyle(backdrop, 'background-color')).toBe('rgba(10, 20, 30, 0.45)')
    await expect.poll(async () => readStyle(rightDrawer, 'box-shadow')).toContain('rgb(17, 34, 51)')
  })

  test('公开变量: --tr-layout-drawer-width - 应作用于左侧 drawer', async ({ page }) => {
    const surface = page.getByTestId('css-vars-left-drawer-surface')
    const leftDrawer = surface.locator(layoutSelectors.leftAside)

    await expect(leftDrawer).toBeVisible()

    const box = await getBox(leftDrawer)
    expect(box.width).toBeGreaterThanOrEqual(334)
    expect(box.width).toBeLessThanOrEqual(338)
  })

  test('公开变量: floating surface - 应作用于圆角、阴影、层级和背景', async ({ page }) => {
    const surface = page.getByTestId('css-vars-floating-surface')
    const body = surface.locator(layoutSelectors.body)

    await expect.poll(async () => readStyle(body, 'background-color')).toBe('rgb(252, 248, 240)')
    await expect.poll(async () => readStyle(surface, 'border-top-left-radius')).toBe('18px')
    await expect.poll(async () => readStyle(surface, 'box-shadow')).toContain('rgb(11, 22, 33)')
    await expect.poll(async () => readStyle(surface, 'z-index')).toBe('2048')
  })

  test('公开变量: scrollbar - 应作用于轨道宽度和 thumb 默认/hover/active 颜色', async ({ page }) => {
    const surface = page.getByTestId('css-vars-scrollbar-surface')
    const scrollTarget = surface.locator(layoutSelectors.scrollTarget)
    const scrollbar = surface.locator(layoutSelectors.scrollbar)
    const thumb = surface.locator(layoutSelectors.scrollbarThumb)

    await scrollTarget.hover()
    await expect(scrollbar).toBeVisible()
    await expect.poll(async () => readStyle(scrollbar, 'width')).toBe('14px')
    await expect.poll(async () => readStyle(thumb, 'background-color')).toBe('rgb(120, 130, 150)')

    await thumb.hover()
    await expect.poll(async () => readStyle(thumb, 'background-color')).toBe('rgb(90, 100, 120)')

    const thumbBox = await getBox(thumb)
    const centerX = thumbBox.x + thumbBox.width / 2
    const centerY = thumbBox.y + thumbBox.height / 2

    await page.mouse.move(centerX, centerY)
    await page.mouse.down()
    await expect.poll(async () => readStyle(thumb, 'background-color')).toBe('rgb(60, 70, 90)')
    await page.mouse.up()
  })

  test('guard: 旧变量不应再作为公开契约生效', async ({ page }) => {
    const surface = page.getByTestId('css-vars-legacy-surface')
    const leftAside = surface.locator(layoutSelectors.leftAside)
    const header = surface.locator(layoutSelectors.header)

    const leftBox = await getBox(leftAside)

    expect(leftBox.width).toBeGreaterThanOrEqual(278)
    expect(leftBox.width).toBeLessThanOrEqual(282)
    await expect.poll(async () => readStyle(header, 'padding-left')).toBe('0px')
    await expect.poll(async () => readStyle(surface, 'border-top-left-radius')).toBe('0px')
    await expect.poll(async () => readStyle(surface, 'box-shadow')).toBe('none')
  })
})
