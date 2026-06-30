import { expect, test } from '../helpers'

test.describe('Layout 组件测试 - Aside', () => {
  test('Props: leftAside / rightAside mode - 应支持 dock 与 drawer 切换', async ({ layout }) => {
    await layout.setAsideMode('left', 'drawer')
    await layout.expectAsideMode('left', 'drawer')

    await layout.setAsideMode('left', 'dock')
    await layout.expectAsideMode('left', 'dock')

    await layout.setAsideMode('right', 'dock')
    await layout.expectAsideMode('right', 'dock')

    await layout.setAsideMode('right', 'drawer')
    await layout.expectAsideMode('right', 'drawer')
  })

  test('Controlled state: 外部 open 改变后 UI 应同步', async ({ layout }) => {
    await layout.toggleAside('left')
    let harness = await layout.readHarness()
    expect(harness.metrics.leftToggleActions).toBe(1)
    await layout.expectAsideState('left', 'rail')

    await layout.toggleAside('right')
    harness = await layout.readHarness()
    expect(harness.metrics.rightToggleActions).toBe(1)
    await layout.expectAsideState('right', 'open')
  })

  test('Drawer: backdrop - 应正确打开和关闭右侧 drawer', async ({ layout }) => {
    await layout.setAsideMode('right', 'drawer')
    await layout.toggleAside('right')

    await layout.expectBackdropState('open')
    await layout.backdrop.click()
    await layout.expectBackdropState('closed')
  })

  test('Props: collapseEffect - slide 时 aside-content 应暴露稳定效果契约', async ({ layout }) => {
    await layout.setCollapseEffect('left', 'slide')
    await layout.collapseAside('left')
    await layout.expectCollapseEffect('left', 'slide')

    await layout.setAsideMode('right', 'dock')
    await layout.setCollapseEffect('right', 'slide')
    await layout.collapseAside('right')
    await layout.expectCollapseEffect('right', 'slide')
  })

  test('Props: resizable / Emits: aside-resize* - 改宽应生效，并保证 end 与最后一次 progress 对齐', async ({
    layout,
  }) => {
    await layout.setAsideMode('left', 'dock')
    await layout.setAsideMode('right', 'dock')
    await layout.toggleAside('right')
    await layout.expectAsideState('left', 'open')
    await layout.expectAsideState('right', 'open')
    await expect(layout.getResizeTrigger('left')).toBeVisible()
    await expect(layout.getResizeTrigger('right')).toBeVisible()

    const beforeLeft = (await layout.readHarness()).widths.left
    await layout.resizeAside('left', 160)

    let harness = await layout.readHarness()
    const leftLogs = harness.logs.asideResize.filter((entry) => entry.side === 'left')
    const leftProgressLogs = leftLogs.filter((entry) => entry.phase === 'progress')
    const leftEndLog = leftLogs.at(-1)

    expect(harness.metrics.leftResizeStart).toBe(1)
    expect(harness.metrics.leftResizeEnd).toBe(1)
    expect(harness.widths.left).toBeGreaterThanOrEqual(beforeLeft)
    expect(leftLogs[0]?.phase).toBe('start')
    expect(leftEndLog?.phase).toBe('end')
    expect(leftEndLog?.expandedWidth).toBe(leftProgressLogs.at(-1)?.expandedWidth)

    const beforeRight = harness.widths.right
    await layout.resizeAside('right', -160)

    harness = await layout.readHarness()
    const rightLogs = harness.logs.asideResize.filter((entry) => entry.side === 'right')
    const rightProgressLogs = rightLogs.filter((entry) => entry.phase === 'progress')
    const rightEndLog = rightLogs.at(-1)

    expect(harness.metrics.rightResizeStart).toBe(1)
    expect(harness.metrics.rightResizeEnd).toBe(1)
    expect(harness.widths.right).toBeGreaterThanOrEqual(beforeRight)
    expect(rightLogs[0]?.phase).toBe('start')
    expect(rightEndLog?.phase).toBe('end')
    expect(rightEndLog?.expandedWidth).toBe(rightProgressLogs.at(-1)?.expandedWidth)
  })

  test('Dock: main min width - 双侧展开时主区不应被压穿', async ({ layout }) => {
    await layout.setAsideMode('right', 'dock')
    await layout.toggleAside('right')

    await expect
      .poll(async () => {
        const box = await layout.main.boundingBox()
        return box?.width ?? 0
      })
      .toBeGreaterThanOrEqual(320)
  })

  test('Rail: collapsedWidth=0 - 收起后应完全隐藏', async ({ layout }) => {
    await layout.setLeftCollapsedWidthZero()
    await layout.collapseAside('left')

    await layout.expectAsideState('left', 'closed')
    await expect(layout.getAside('left')).toHaveAttribute('inert', '')
  })

  test('Props: resizable=false - 应隐藏 resize trigger', async ({ layout }) => {
    await layout.disableAsideResizable('left')
    await layout.setAsideMode('right', 'dock')
    await layout.disableAsideResizable('right')

    await expect(layout.getResizeTrigger('left')).toHaveCount(0)
    await expect(layout.getResizeTrigger('right')).toHaveCount(0)
    await expect(layout.getAside('left')).not.toHaveAttribute('data-resizable', '')
    await expect(layout.getAside('right')).not.toHaveAttribute('data-resizable', '')
  })

  test('Controlled props: open - 受控父级不回写时应只发事件，不自改 UI', async ({ layout }) => {
    await layout.showAsideFixtures()

    const fixture = layout.blockedAsideFixture

    await expect(fixture.getByTestId('blocked-open-state')).toHaveText('open')
    await fixture.getByTestId('blocked-toggle').click()

    await expect(layout.page.getByTestId('blocked-open-events')).toHaveText('1')
    await expect(layout.page.getByTestId('blocked-last-open')).toHaveText('false')
    await expect(fixture.getByTestId('blocked-open-state')).toHaveText('open')
    await layout.expectAsideState('left', 'open', fixture)
  })

  test('Controlled props: expandedWidth - 受控父级不回写时应只发事件，并保持 prop 宽度优先', async ({ layout }) => {
    await layout.showAsideFixtures()

    const fixture = layout.blockedAsideFixture
    const leftAside = layout.getAside('left', fixture)

    const beforeWidth = await layout.getWidth(leftAside)
    expect(beforeWidth).toBeGreaterThanOrEqual(256)
    expect(beforeWidth).toBeLessThanOrEqual(264)

    await layout.resizeAside('left', 160, fixture)

    await expect
      .poll(async () => Number(await layout.page.getByTestId('blocked-width-events').textContent()))
      .toBeGreaterThan(0)
    await expect
      .poll(async () => Number(await layout.page.getByTestId('blocked-last-width').textContent()))
      .toBeGreaterThan(260)

    const afterWidth = await layout.getWidth(leftAside)
    expect(Math.abs(afterWidth - beforeWidth)).toBeLessThan(2)
  })

  test('Default props: defaultOpen / defaultExpandedWidth - 非受控 aside 应以内建状态启动', async ({ layout }) => {
    await layout.showAsideFixtures()

    const fixture = layout.uncontrolledAsideFixture
    const leftAside = layout.getAside('left', fixture)

    await expect(fixture.getByTestId('uncontrolled-open-state')).toHaveText('open')

    await layout.expectAsideState('left', 'open', fixture)

    const width = await layout.getWidth(leftAside)
    expect(width).toBeGreaterThanOrEqual(286)
    expect(width).toBeLessThanOrEqual(294)
  })

  test('Default props: defaultOpen / collapsedWidth - 非受控 aside 收起后应保留 rail', async ({ layout }) => {
    await layout.showAsideFixtures()

    const fixture = layout.uncontrolledAsideFixture
    const leftAside = layout.getAside('left', fixture)

    await fixture.getByTestId('uncontrolled-toggle').click()

    await expect(layout.page.getByTestId('uncontrolled-open-events')).toHaveText('1')
    await expect(fixture.getByTestId('uncontrolled-open-state')).toHaveText('closed')
    await layout.expectAsideState('left', 'rail', fixture)

    await expect.poll(async () => await layout.getWidth(leftAside)).toBeGreaterThanOrEqual(48)
    await expect.poll(async () => await layout.getWidth(leftAside)).toBeLessThanOrEqual(56)
  })

  test('Default props: 初始化后更新 defaultOpen / defaultExpandedWidth 不应重新同步', async ({ layout }) => {
    await layout.showAsideFixtures()

    const fixture = layout.uncontrolledAsideFixture
    const leftAside = layout.getAside('left', fixture)
    const beforeWidth = await layout.getWidth(leftAside)

    await expect(fixture.getByTestId('uncontrolled-open-state')).toHaveText('open')
    await fixture.getByTestId('uncontrolled-default-update-btn').click()

    await expect(fixture.getByTestId('uncontrolled-open-state')).toHaveText('open')
    await layout.expectAsideState('left', 'open', fixture)

    const afterWidth = await layout.getWidth(leftAside)
    expect(Math.abs(afterWidth - beforeWidth)).toBeLessThan(2)
  })

  test('Default props: defaultExpandedWidth / minExpandedWidth / maxExpandedWidth - 非受控 resize 应更新内部宽度并 obey clamp', async ({
    layout,
  }) => {
    await layout.showAsideFixtures()

    const fixture = layout.uncontrolledAsideFixture
    const leftAside = layout.getAside('left', fixture)

    await layout.resizeAside('left', 200, fixture)
    await expect
      .poll(async () => Number(await layout.page.getByTestId('uncontrolled-width-events').textContent()))
      .toBeGreaterThan(0)

    const maxClampedWidth = await layout.getWidth(leftAside)
    expect(maxClampedWidth).toBeGreaterThanOrEqual(336)
    expect(maxClampedWidth).toBeLessThanOrEqual(344)

    await layout.resizeAside('left', -400, fixture)
    const minClampedWidth = await layout.getWidth(leftAside)
    expect(minClampedWidth).toBeGreaterThanOrEqual(236)
    expect(minClampedWidth).toBeLessThanOrEqual(244)
  })

  test('Controlled 判定: open / expandedWidth = undefined 时应退回 default* 非受控语义', async ({ layout }) => {
    await layout.showAsideFixtures()

    const fixture = layout.page.getByTestId('undefined-aside-fixture')
    const leftAside = layout.getAside('left', fixture)

    await expect(fixture.getByTestId('undefined-open-state')).toHaveText('open')
    await expect(fixture.getByTestId('undefined-last-open')).toHaveText('open')

    const beforeWidth = await layout.getWidth(leftAside)
    expect(beforeWidth).toBeGreaterThanOrEqual(302)
    expect(beforeWidth).toBeLessThanOrEqual(310)

    await fixture.getByTestId('undefined-toggle').click()

    await expect(fixture.getByTestId('undefined-open-state')).toHaveText('closed')
    await expect(fixture.getByTestId('undefined-last-open')).toHaveText('closed')
    await layout.expectAsideState('left', 'rail', fixture)
  })

  test('CSS vars: drawer width - 应按实例变量生效，且双 drawer 打开时保持互斥', async ({ layout }) => {
    await layout.showAsideFixtures()

    const fixture = layout.drawerAsideFixture
    const leftAside = layout.getAside('left', fixture)
    const rightAside = layout.getAside('right', fixture)

    await fixture.getByTestId('drawer-left-toggle').click()
    await expect(fixture.getByTestId('drawer-left-state')).toHaveText('open')
    await layout.expectBackdropState('open', fixture)
    await layout.expectAsideState('left', 'open', fixture)

    const leftWidth = await layout.getWidth(leftAside)
    expect(leftWidth).toBeGreaterThanOrEqual(340)
    expect(leftWidth).toBeLessThanOrEqual(348)

    await fixture.getByTestId('drawer-right-toggle').evaluate((element: HTMLButtonElement) => element.click())
    await expect(fixture.getByTestId('drawer-right-state')).toHaveText('open')
    await expect(fixture.getByTestId('drawer-left-state')).toHaveText('closed')
    await layout.expectAsideState('left', 'closed', fixture)
    await layout.expectAsideState('right', 'open', fixture)
    await expect(leftAside).toHaveAttribute('inert', '')

    const rightWidth = await layout.getWidth(rightAside)
    expect(rightWidth).toBeGreaterThanOrEqual(340)
    expect(rightWidth).toBeLessThanOrEqual(348)
  })
})
