import { expect, test, type LayoutFloatingHandle } from '../helpers'

const placementCases = [
  { marker: 'placement-top-left', xCheck: 'left', yCheck: 'top', edgeOffset: { x: 16, y: 16 } },
  { marker: 'placement-top-right', xCheck: 'right', yCheck: 'top', edgeOffset: { x: 20, y: 36 } },
  { marker: 'placement-bottom-left', xCheck: 'left', yCheck: 'bottom', edgeOffset: { x: 28, y: 44 } },
  { marker: 'placement-bottom-right', xCheck: 'right', yCheck: 'bottom', edgeOffset: { x: 32, y: 32 } },
  { marker: 'placement-center', xCheck: 'center', yCheck: 'center' },
] as const

const resizeCases: Array<{
  handle: LayoutFloatingHandle
  deltaX: number
  deltaY: number
  assert: (
    before: { x: number; y: number; width: number; height: number },
    after: { x: number; y: number; width: number; height: number },
  ) => void
}> = [
  {
    handle: 'e',
    deltaX: 80,
    deltaY: 0,
    assert: (before, after) => {
      expect(after.width).toBeGreaterThan(before.width)
      expect(Math.abs(after.x - before.x)).toBeLessThanOrEqual(2)
    },
  },
  {
    handle: 'w',
    deltaX: 80,
    deltaY: 0,
    assert: (before, after) => {
      expect(after.width).toBeLessThan(before.width)
      expect(after.x).toBeGreaterThan(before.x)
    },
  },
  {
    handle: 's',
    deltaX: 0,
    deltaY: 80,
    assert: (before, after) => {
      expect(after.height).toBeGreaterThan(before.height)
      expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(2)
    },
  },
  {
    handle: 'ne',
    deltaX: 80,
    deltaY: 80,
    assert: (before, after) => {
      expect(after.width).toBeGreaterThan(before.width)
      expect(after.height).toBeLessThan(before.height)
      expect(after.y).toBeGreaterThan(before.y)
    },
  },
  {
    handle: 'nw',
    deltaX: 80,
    deltaY: 80,
    assert: (before, after) => {
      expect(after.width).toBeLessThan(before.width)
      expect(after.height).toBeLessThan(before.height)
      expect(after.x).toBeGreaterThan(before.x)
      expect(after.y).toBeGreaterThan(before.y)
    },
  },
  {
    handle: 'se',
    deltaX: 80,
    deltaY: 80,
    assert: (before, after) => {
      expect(after.width).toBeGreaterThan(before.width)
      expect(after.height).toBeGreaterThan(before.height)
    },
  },
  {
    handle: 'sw',
    deltaX: 80,
    deltaY: 80,
    assert: (before, after) => {
      expect(after.width).toBeLessThan(before.width)
      expect(after.height).toBeGreaterThan(before.height)
      expect(after.x).toBeGreaterThan(before.x)
    },
  },
] as const

test.describe('Layout 组件测试 - Floating', () => {
  test('Props: mode - 应支持 normal 与 floating 切换', async ({ layout }) => {
    await layout.setMode('floating')
    let harness = await layout.readHarness()
    expect(harness.metrics.modeToggleActions).toBe(1)
    await layout.expectSurfaceMode('floating')

    await layout.setMode('normal')
    harness = await layout.readHarness()
    expect(harness.metrics.modeToggleActions).toBe(2)
    await layout.expectSurfaceMode('normal')
  })

  test('Props: defaultFloatingState - 5 种 placement 初始化应正确', async ({ layout }) => {
    await layout.showFloatingPlacementFixtures()

    const viewport = layout.page.viewportSize()
    if (!viewport) {
      throw new Error('Missing viewport size')
    }

    for (const placementCase of placementCases) {
      const surface = layout.getFloatingSurfaceByMarker(placementCase.marker)
      const box = await layout.getBox(surface)

      if (placementCase.xCheck === 'left') {
        expect(box.x).toBeLessThan(120)
        expect(Math.abs(box.x - placementCase.edgeOffset.x)).toBeLessThanOrEqual(2)
      } else if (placementCase.xCheck === 'right') {
        expect(box.x + box.width).toBeGreaterThan(viewport.width - 120)
        expect(Math.abs(viewport.width - box.x - box.width - placementCase.edgeOffset.x)).toBeLessThanOrEqual(2)
      } else {
        const centerX = box.x + box.width / 2
        expect(Math.abs(centerX - viewport.width / 2)).toBeLessThanOrEqual(4)
      }

      if (placementCase.yCheck === 'top') {
        expect(box.y).toBeLessThan(120)
        expect(Math.abs(box.y - placementCase.edgeOffset.y)).toBeLessThanOrEqual(2)
      } else if (placementCase.yCheck === 'bottom') {
        expect(box.y + box.height).toBeGreaterThan(viewport.height - 120)
        expect(Math.abs(viewport.height - box.y - box.height - placementCase.edgeOffset.y)).toBeLessThanOrEqual(2)
      } else {
        const centerY = box.y + box.height / 2
        expect(Math.abs(centerY - viewport.height / 2)).toBeLessThanOrEqual(4)
      }
    }
  })

  test('Events: floating-drag* - 拖拽应公开三阶段事件，并保证 end 与最后一次 progress 对齐', async ({ layout }) => {
    await layout.setMode('floating')
    await layout.dragSurface(80, 40)

    const harness = await layout.readHarness()
    const startLog = harness.logs.floatingDrag[0]
    const phases = harness.logs.floatingDrag.map((entry) => entry.phase)
    const progressLogs = harness.logs.floatingDrag.filter((entry) => entry.phase === 'progress')
    const endLog = harness.logs.floatingDrag[harness.logs.floatingDrag.length - 1]
    const lastProgressLog = progressLogs[progressLogs.length - 1]

    expect(phases[0]).toBe('start')
    expect(progressLogs.length).toBeGreaterThan(0)
    expect(startLog?.placement).toBe('top-left')
    expect(startLog?.offsetX).toBe(96)
    expect(startLog?.offsetY).toBe(72)
    expect(endLog?.phase).toBe('end')
    expect(endLog?.placement).toBe('top-left')
    expect(endLog?.offsetX).toBe(lastProgressLog?.offsetX)
    expect(endLog?.offsetY).toBe(lastProgressLog?.offsetY)
    expect(endLog?.width).toBe(lastProgressLog?.width)
    expect(endLog?.height).toBe(lastProgressLog?.height)
    expect(endLog?.offsetX ?? 0).toBeGreaterThan(startLog?.offsetX ?? 0)
    expect(endLog?.offsetY ?? 0).toBeGreaterThan(startLog?.offsetY ?? 0)
    expect(harness.metrics.floatingDragStart).toBe(1)
    expect(harness.metrics.floatingDragEnd).toBe(1)
    expect(harness.metrics.floatingDrag).toBeGreaterThan(0)
  })

  test('Props: draggable - floating 拖拽应更新位置', async ({ layout }) => {
    await layout.setMode('floating')
    const before = await layout.getBox(layout.surface)

    await layout.dragSurface(80, 40)
    const after = await layout.getBox(layout.surface)

    expect(after.x).toBeGreaterThan(before.x)
    expect(after.y).toBeGreaterThan(before.y)
  })

  test('Props: draggable - 外部重置位置后再次拖拽不应使用过期 anchor', async ({ layout }) => {
    await layout.setMode('floating')

    await layout.dragSurface(180, 100)
    await layout.resetFloating()

    const before = await layout.getBox(layout.surface)

    await layout.dragSurface(20, 0)

    const after = await layout.getBox(layout.surface)

    expect(after.x - before.x).toBeGreaterThan(8)
    expect(after.x - before.x).toBeLessThan(40)
    expect(Math.abs(after.y - before.y)).toBeLessThan(8)
  })

  test('Props: draggable=false - drag bar 不应再移动 surface', async ({ layout }) => {
    await layout.setMode('floating')
    await layout.disableFloatingDraggable()

    const before = await layout.getBox(layout.surface)
    await layout.dragSurface(80, 0)
    const after = await layout.getBox(layout.surface)

    expect(Math.abs(after.x - before.x)).toBeLessThan(2)
    expect(Math.abs(after.y - before.y)).toBeLessThan(2)
  })

  test('Interaction lock - resize 时 drag bar 应暂时失去 draggable 状态并在结束后恢复', async ({ layout }) => {
    await layout.setMode('floating')

    const dragBar = layout.getFloatingDragBar()
    const resizeHandle = layout.getFloatingResizeTrigger('e')
    const resizeBox = await layout.getBox(resizeHandle)

    await expect(dragBar).toHaveClass(/tr-layout__drag-bar--draggable/)

    const startX = resizeBox.x + 1
    const startY = resizeBox.y + resizeBox.height / 2

    await layout.page.mouse.move(startX, startY)
    await layout.page.mouse.down()
    await layout.page.mouse.move(startX + 40, startY, { steps: 12 })

    await expect(dragBar).not.toHaveClass(/tr-layout__drag-bar--draggable/)

    await layout.page.mouse.up()

    await expect(dragBar).toHaveClass(/tr-layout__drag-bar--draggable/)
  })

  test('Props: resizable=false - 应隐藏 7 个 floating resize trigger', async ({ layout }) => {
    await layout.setMode('floating')
    await layout.disableFloatingResizable()

    for (const handle of ['s', 'e', 'w', 'ne', 'nw', 'se', 'sw'] as const) {
      await expect(layout.getFloatingResizeTrigger(handle)).toHaveCount(0)
    }
  })

  test('Props: resizable / floating-resize* - 7 方向 resize 应生效，并保证 end 与最后一次 progress 对齐', async ({
    layout,
  }) => {
    await layout.setMode('floating')

    for (const resizeCase of resizeCases) {
      await layout.resetFloating()
      const before = await layout.getBox(layout.surface)

      await layout.resizeSurface(resizeCase.handle, resizeCase.deltaX, resizeCase.deltaY)

      const harness = await layout.readHarness()
      const logs = harness.logs.floatingResize.filter((entry) => entry.handle === resizeCase.handle)
      const progressLogs = logs.filter((entry) => entry.phase === 'progress')
      const endLog = logs[logs.length - 1]
      const lastProgressLog = progressLogs[progressLogs.length - 1]
      const after = await layout.getBox(layout.surface)

      expect(harness.metrics.floatingResizeStartByHandle[resizeCase.handle]).toBeGreaterThan(0)
      expect(harness.metrics.floatingResizeEndByHandle[resizeCase.handle]).toBeGreaterThan(0)
      expect(logs[0]?.phase).toBe('start')
      expect(logs[0]?.placement).toBe('top-left')
      expect(endLog?.phase).toBe('end')
      expect(progressLogs.length).toBeGreaterThan(0)
      expect(endLog?.placement).toBe('top-left')
      expect(endLog?.offsetX).toBe(lastProgressLog?.offsetX)
      expect(endLog?.offsetY).toBe(lastProgressLog?.offsetY)
      expect(endLog?.width).toBe(lastProgressLog?.width)
      expect(endLog?.height).toBe(lastProgressLog?.height)

      resizeCase.assert(before, after)
    }
  })

  test('viewport clamp - 超界拖拽后应被限制在视口内', async ({ layout }) => {
    await layout.setMode('floating')
    await layout.dragSurface(-2000, -2000)

    await expect
      .poll(async () => {
        const box = await layout.surface.boundingBox()
        return box ? box.x >= 0 && box.y >= 0 : false
      })
      .toBe(true)

    await layout.dragSurface(4000, 4000)

    await expect
      .poll(async () => {
        const box = await layout.surface.boundingBox()
        const viewport = layout.page.viewportSize()

        if (!box || !viewport) {
          return false
        }

        return box.x + box.width <= viewport.width && box.y + box.height <= viewport.height
      })
      .toBe(true)
  })

  test('Controlled props: floatingState - 受控父级不回写时应只发事件，不自改位置和尺寸', async ({ layout }) => {
    await layout.showFloatingFixtures()

    const surface = layout.blockedFloatingSurface
    const before = await layout.getBox(surface)

    await layout.dragSurface(140, 40, surface)
    await expect
      .poll(async () => Number(await layout.page.getByTestId('blocked-floating-updates').textContent()))
      .toBeGreaterThan(0)
    await expect
      .poll(async () => layout.page.getByTestId('blocked-floating-last-placement').textContent())
      .toBe('top-left')
    await expect
      .poll(async () => Number(await layout.page.getByTestId('blocked-floating-last-offset-x').textContent()))
      .toBeGreaterThan(64)
    await expect
      .poll(async () => Number(await layout.page.getByTestId('blocked-floating-last-offset-y').textContent()))
      .toBeGreaterThan(96)

    const afterDrag = await layout.getBox(surface)
    expect(Math.abs(afterDrag.x - before.x)).toBeLessThan(2)
    expect(Math.abs(afterDrag.y - before.y)).toBeLessThan(2)

    await layout.resizeSurface('se', 120, 120, surface)
    await expect
      .poll(async () => Number(await layout.page.getByTestId('blocked-floating-last-width').textContent()))
      .toBeGreaterThan(420)
    await expect
      .poll(async () => layout.page.getByTestId('blocked-floating-last-placement').textContent())
      .toBe('top-left')

    const afterResize = await layout.getBox(surface)
    expect(Math.abs(afterResize.width - before.width)).toBeLessThan(2)
    expect(Math.abs(afterResize.height - before.height)).toBeLessThan(2)
  })

  test('Default props: defaultFloatingState - 非受控 floating 应按 placement 初始化，并在交互后更新内部 rect', async ({
    layout,
  }) => {
    await layout.showFloatingFixtures()

    const surface = layout.uncontrolledFloatingSurface
    const before = await layout.getBox(surface)

    await layout.expectSurfaceMode('floating', surface)
    expect(before.width).toBeGreaterThanOrEqual(416)
    expect(before.width).toBeLessThanOrEqual(424)
    expect(before.height).toBeGreaterThanOrEqual(296)
    expect(before.height).toBeLessThanOrEqual(304)

    await layout.dragSurface(-120, 60, surface)
    await expect
      .poll(async () => Number(await layout.page.getByTestId('uncontrolled-floating-updates').textContent()))
      .toBeGreaterThan(0)
    await expect
      .poll(async () => layout.page.getByTestId('uncontrolled-floating-last-placement').textContent())
      .toBe('top-right')
    await expect
      .poll(async () => Number(await layout.page.getByTestId('uncontrolled-floating-last-offset-x').textContent()))
      .toBeGreaterThan(24)
    await expect
      .poll(async () => Number(await layout.page.getByTestId('uncontrolled-floating-last-offset-y').textContent()))
      .toBeGreaterThan(32)

    const after = await layout.getBox(surface)
    expect(after.x).toBeLessThan(before.x - 40)
    expect(after.y).toBeGreaterThan(before.y + 20)
  })

  test('Default props: 初始化后更新 defaultFloatingState 不应重新同步', async ({ layout }) => {
    await layout.showFloatingFixtures()

    const surface = layout.uncontrolledFloatingSurface
    const before = await layout.getBox(surface)

    await layout.page.getByTestId('uncontrolled-default-floating-update-btn').click()

    const after = await layout.getBox(surface)
    expect(Math.abs(after.x - before.x)).toBeLessThan(2)
    expect(Math.abs(after.y - before.y)).toBeLessThan(2)
    expect(Math.abs(after.width - before.width)).toBeLessThan(2)
  })

  test('Controlled 判定: floatingState = undefined 时应退回 defaultFloatingState 非受控语义', async ({ layout }) => {
    await layout.showFloatingFixtures()

    const surface = layout.getFloatingSurfaceByMarker('undefined-floating')
    const before = await layout.getBox(surface)

    await layout.expectSurfaceMode('floating', surface)
    expect(before.width).toBeGreaterThanOrEqual(384)
    expect(before.width).toBeLessThanOrEqual(392)
    expect(before.height).toBeGreaterThanOrEqual(272)
    expect(before.height).toBeLessThanOrEqual(280)

    await layout.dragSurface(-80, -60, surface)

    const after = await layout.getBox(surface)
    expect(after.x).toBeLessThan(before.x - 20)
    expect(after.y).toBeLessThan(before.y - 20)
  })

  test('floatingOptions: minWidth / maxWidth - 非受控 floating resize 应 obey clamp', async ({ layout }) => {
    await layout.showFloatingFixtures()

    const surface = layout.uncontrolledFloatingSurface

    await layout.resizeSurface('w', -240, 0, surface)
    await expect
      .poll(async () => Number(await layout.page.getByTestId('uncontrolled-floating-last-width').textContent()))
      .toBeGreaterThan(420)

    const expanded = await layout.getBox(surface)
    expect(expanded.width).toBeGreaterThanOrEqual(476)
    expect(expanded.width).toBeLessThanOrEqual(484)

    await layout.resizeSurface('w', 400, 0, surface)
    const shrunk = await layout.getBox(surface)
    expect(shrunk.width).toBeGreaterThanOrEqual(316)
    expect(shrunk.width).toBeLessThanOrEqual(324)
  })
})
