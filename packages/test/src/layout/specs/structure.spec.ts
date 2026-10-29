import { expect, test } from '../helpers'

test.describe('Layout 组件测试 - 结构', () => {
  test('Slots: header / footer / left-aside / right-aside - 应正确渲染', async ({ layout }) => {
    await expect(layout.page.getByTestId('layout-header-slot')).toBeVisible()
    await expect(layout.page.getByTestId('layout-footer-slot')).toBeVisible()
    await expect(layout.page.getByTestId('left-aside-slot')).toBeVisible()
    await expect(layout.page.getByTestId('right-aside-slot')).toBeHidden()

    await layout.toggleAside('right')
    await expect(layout.page.getByTestId('right-aside-slot')).toBeVisible()
  })

  test('Stable structure - 应能稳定识别关键区域和侧栏状态', async ({ layout }) => {
    await expect(layout.surface).toBeVisible()
    await expect(layout.main).toBeVisible()
    await expect(layout.getAside('left')).toHaveClass(/tr-layout__aside--left/)
    await expect(layout.getAside('right')).toHaveClass(/tr-layout__aside--right/)
    await layout.expectAsideState('left', 'open')
    await layout.expectAsideState('right', 'closed')
  })

  test('Layout.AsideToggle slot - 应能拿到 isOpen', async ({ layout }) => {
    await expect(layout.page.getByTestId('left-toggle-slot')).toHaveText('left-open')
    await layout.page.getByTestId('left-aside-toggle').click()
    await expect(layout.page.getByTestId('left-toggle-slot')).toHaveText('left-close')
  })

  test('Fallthrough attrs: class / id / data-* - 应始终落在 surface', async ({ layout }) => {
    const { surface } = layout

    await expect(surface).toHaveAttribute('id', 'layout-demo-surface')
    await expect(surface).toHaveAttribute('data-surface-marker', 'layout-demo-surface')
    await expect(surface).toHaveClass(/layout-demo__layout--surface-marker/)

    await layout.setMode('floating')

    await expect(surface).toHaveAttribute('id', 'layout-demo-surface')
    await expect(surface).toHaveAttribute('data-surface-marker', 'layout-demo-surface')
    await expect(surface).toHaveClass(/layout-demo__layout--surface-marker/)
  })

  test('Conditional slot declarations: omitted header / left-aside - should not keep shell or resize trigger', async ({
    layout,
  }) => {
    await layout.omitConditionalSlots()

    await expect(layout.page.locator('.tr-layout__header')).toHaveCount(0)
    await expect(layout.getAside('left')).toHaveCount(0)
    await expect(layout.getResizeTrigger('left')).toHaveCount(0)
  })
})
