import { expect, type Locator, type Page } from '@playwright/test'
import { layoutSelectors } from '../selectors'

type ScopedTarget = Page | Locator

export type LayoutSide = 'left' | 'right'
export type LayoutMode = 'normal' | 'floating'
export type LayoutAsideMode = 'dock' | 'drawer'
export type LayoutCollapseEffect = 'overlay' | 'slide'
export type LayoutAsideState = 'open' | 'rail' | 'closed'
export type LayoutEventPhase = 'start' | 'progress' | 'end'
export type LayoutFloatingHandle = 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'
export type LayoutFloatingPlacement = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'

export interface LayoutAsideResizeLogEntry {
  phase: LayoutEventPhase
  side: LayoutSide
  expandedWidth: number
}

export interface LayoutFloatingDragLogEntry {
  phase: LayoutEventPhase
  placement?: LayoutFloatingPlacement
  offsetX?: number
  offsetY?: number
  width?: number
  height?: number
}

export interface LayoutFloatingResizeLogEntry {
  phase: LayoutEventPhase
  handle: LayoutFloatingHandle
  placement?: LayoutFloatingPlacement
  offsetX?: number
  offsetY?: number
  width: number
  height: number
}

export interface LayoutHarnessSnapshot {
  metrics: {
    leftResizeStart: number
    leftResizeEnd: number
    rightResizeStart: number
    rightResizeEnd: number
    floatingDragStart: number
    floatingDrag: number
    floatingDragEnd: number
    floatingResizeStartByHandle: Record<LayoutFloatingHandle, number>
    floatingResizeEndByHandle: Record<LayoutFloatingHandle, number>
    leftToggleActions: number
    rightToggleActions: number
    modeToggleActions: number
  }
  widths: {
    left: number
    right: number
    floating: number
  }
  messagesCount: number
  logs: {
    asideResize: LayoutAsideResizeLogEntry[]
    floatingDrag: LayoutFloatingDragLogEntry[]
    floatingResize: LayoutFloatingResizeLogEntry[]
  }
}

function within(scope: ScopedTarget, selector: string): Locator {
  return scope.locator(selector)
}

function isPage(scope: ScopedTarget): scope is Page {
  return 'goto' in scope
}

export class LayoutTestPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  get surface() {
    return this.page.locator('#layout-demo-surface')
  }

  get root() {
    return this.surface
  }

  get main() {
    return this.page.locator(layoutSelectors.main)
  }

  get scrollTarget() {
    return this.page.locator(layoutSelectors.scrollTarget)
  }

  get scrollbar() {
    return this.page.locator(layoutSelectors.scrollbar)
  }

  get scrollbarThumb() {
    return this.page.locator(layoutSelectors.scrollbarThumb)
  }

  get backdrop() {
    return this.page.locator(layoutSelectors.backdrop)
  }

  get blockedAsideFixture() {
    return this.page.getByTestId('blocked-aside-fixture')
  }

  get uncontrolledAsideFixture() {
    return this.page.getByTestId('uncontrolled-aside-fixture')
  }

  get drawerAsideFixture() {
    return this.page.getByTestId('drawer-aside-fixture')
  }

  get blockedFloatingSurface() {
    return this.page.locator('#blocked-floating-surface')
  }

  get uncontrolledFloatingSurface() {
    return this.page.locator('#uncontrolled-floating-surface')
  }

  getFloatingSurfaceByMarker(marker: string) {
    return this.page.locator(`[data-surface-marker="${marker}"]`)
  }

  async open() {
    await this.page.goto('/')
    await this.page.getByRole('link', { name: 'Layout 组件' }).click()
    await expect(this.page.getByRole('heading', { level: 2, name: 'Layout 组件测试' })).toBeVisible()
  }

  getAside(side: LayoutSide, scope: ScopedTarget = this.page) {
    return within(scope, side === 'left' ? layoutSelectors.leftAside : layoutSelectors.rightAside)
  }

  getAsideContent(side: LayoutSide, scope: ScopedTarget = this.page) {
    return within(scope, side === 'left' ? layoutSelectors.leftAsideContent : layoutSelectors.rightAsideContent)
  }

  getResizeTrigger(side: LayoutSide, scope: ScopedTarget = this.page) {
    return within(scope, side === 'left' ? layoutSelectors.leftResizeTrigger : layoutSelectors.rightResizeTrigger)
  }

  getFloatingResizeTrigger(handle: LayoutFloatingHandle, scope: ScopedTarget = this.surface) {
    const selectorMap: Record<LayoutFloatingHandle, string> = {
      s: layoutSelectors.floatingResizeTriggerS,
      e: layoutSelectors.floatingResizeTriggerE,
      w: layoutSelectors.floatingResizeTriggerW,
      ne: layoutSelectors.floatingResizeTriggerNE,
      nw: layoutSelectors.floatingResizeTriggerNW,
      se: layoutSelectors.floatingResizeTriggerSE,
      sw: layoutSelectors.floatingResizeTriggerSW,
    }

    return within(scope, selectorMap[handle])
  }

  getFloatingDragBar(scope: ScopedTarget = this.surface) {
    return within(scope, layoutSelectors.floatingDragBar)
  }

  getBackdrop(scope: ScopedTarget = this.page) {
    return within(scope, layoutSelectors.backdrop)
  }

  async showAsideFixtures() {
    await this.page.getByTestId('show-aside-state-fixtures-btn').click()
    await expect(this.blockedAsideFixture).toBeVisible()
    await expect(this.uncontrolledAsideFixture).toBeVisible()
    await expect(this.drawerAsideFixture).toBeVisible()
  }

  async showFloatingFixtures() {
    await this.page.getByTestId('show-floating-state-fixtures-btn').click()
    await expect(this.blockedFloatingSurface).toBeVisible()
    await expect(this.uncontrolledFloatingSurface).toBeVisible()
  }

  async showFloatingPlacementFixtures() {
    await this.showFloatingFixtures()
    await this.page.getByTestId('show-floating-placement-fixtures-btn').click()
    await expect(this.getFloatingSurfaceByMarker('placement-top-left')).toBeVisible()
  }

  async showCssVarFixtures() {
    await this.page.getByTestId('show-css-var-fixtures-btn').click()
    await expect(this.page.getByTestId('css-vars-normal-surface')).toBeVisible()
  }

  async setMode(mode: LayoutMode) {
    await this.page.getByTestId(`mode-${mode}-btn`).click()
  }

  async setAsideMode(side: LayoutSide, mode: LayoutAsideMode) {
    await this.page.getByTestId(`${side}-mode-${mode}-btn`).click()
  }

  async toggleAside(side: LayoutSide) {
    await this.page.getByTestId(`${side}-toggle-btn`).click()
  }

  async collapseAside(side: LayoutSide) {
    await this.page.getByTestId(`${side}-collapse-btn`).click()
  }

  async setCollapseEffect(side: LayoutSide, effect: LayoutCollapseEffect) {
    await this.page.getByTestId(`${side}-effect-${effect}-btn`).click()
  }

  async disableAsideResizable(side: LayoutSide) {
    await this.page.getByTestId(`${side}-resizable-off-btn`).click()
  }

  async setLeftCollapsedWidthZero() {
    await this.page.getByTestId('left-collapsed-width-zero-btn').click()
  }

  async appendMessages() {
    await this.page.getByTestId('append-messages-btn').click()
  }

  async resetMessagesToShortList() {
    await this.page.getByTestId('short-messages-btn').click()
  }

  async omitConditionalSlots() {
    await this.page.getByTestId('conditional-slots-omit-btn').click()
  }

  async disableFloatingResizable() {
    await this.page.getByTestId('floating-resizable-off-btn').click()
  }

  async disableFloatingDraggable() {
    await this.page.getByTestId('floating-draggable-off-btn').click()
  }

  async resetFloating() {
    await this.page.getByTestId('reset-floating-btn').click()
  }

  async expectSurfaceMode(mode: LayoutMode, scope: ScopedTarget = this.page) {
    const target = isPage(scope) ? this.root : scope
    const floatingClassPattern = /(^|\s)tr-layout--floating(\s|$)/

    if (mode === 'floating') {
      await expect(target).toHaveClass(floatingClassPattern)
      return
    }

    await expect(target).not.toHaveClass(floatingClassPattern)
  }

  async expectAsideMode(side: LayoutSide, mode: LayoutAsideMode, scope: ScopedTarget = this.page) {
    await expect(this.getAside(side, scope)).toHaveClass(new RegExp(`tr-layout__aside--${mode}`))
  }

  async expectAsideState(side: LayoutSide, state: LayoutAsideState, scope: ScopedTarget = this.page) {
    const target = this.getAside(side, scope)

    await expect
      .poll(async () =>
        target.evaluate((element) => {
          if (element.classList.contains('tr-layout__aside--expanded')) {
            return 'open'
          }

          if (element.classList.contains('tr-layout__aside--rail')) {
            return 'rail'
          }

          return 'closed'
        }),
      )
      .toBe(state)
  }

  async expectCollapseEffect(side: LayoutSide, effect: LayoutCollapseEffect, scope: ScopedTarget = this.page) {
    await expect(this.getAside(side, scope)).toHaveClass(new RegExp(`tr-layout__aside--effect-${effect}`))
  }

  async expectBackdropState(state: 'open' | 'closed', scope: ScopedTarget = this.page) {
    if (state === 'open') {
      await expect(this.getBackdrop(scope)).toBeVisible()
      return
    }

    await expect(this.getBackdrop(scope)).toHaveCount(0)
  }

  async readHarness() {
    await expect.poll(async () => this.page.evaluate(() => Boolean(window.__TR_LAYOUT_HARNESS__))).toBe(true)
    return this.page.evaluate(() => window.__TR_LAYOUT_HARNESS__!) as Promise<LayoutHarnessSnapshot>
  }

  async getBox(locator: Locator) {
    const box = await locator.boundingBox()

    if (!box) {
      throw new Error('Missing bounding box')
    }

    return box
  }

  async getWidth(locator: Locator) {
    const box = await this.getBox(locator)
    return box.width
  }

  async dragSurface(deltaX: number, deltaY: number, scope: ScopedTarget = this.surface) {
    await this.dragBy(this.getFloatingDragBar(scope), deltaX, deltaY)
  }

  async resizeSurface(handle: LayoutFloatingHandle, deltaX: number, deltaY = 0, scope: ScopedTarget = this.surface) {
    await this.dragFloatingResizeHandle(this.getFloatingResizeTrigger(handle, scope), handle, deltaX, deltaY)
  }

  async resizeAside(side: LayoutSide, deltaX: number, scope: ScopedTarget = this.page) {
    await this.dragResizeHandle(this.getResizeTrigger(side, scope), side, deltaX)
  }

  async dragBy(locator: Locator, deltaX: number, deltaY = 0) {
    await expect(locator).toBeVisible()
    await locator.hover()
    const box = await locator.boundingBox()

    if (!box) {
      throw new Error('Missing drag target')
    }

    const startX = box.x + box.width / 2
    const startY = box.y + box.height / 2

    await this.page.mouse.move(startX, startY)
    await this.page.mouse.down()
    await this.page.mouse.move(startX + deltaX, startY + deltaY, { steps: 20 })
    await this.page.mouse.up()
  }

  async dragResizeHandle(locator: Locator, side: LayoutSide, deltaX: number) {
    await expect(locator).toBeVisible()
    await locator.hover()
    const box = await locator.boundingBox()

    if (!box) {
      throw new Error('Missing resize handle')
    }

    const startX = side === 'left' ? box.x + box.width - 1 : box.x + box.width - 1
    const startY = box.y + box.height / 2

    await this.page.mouse.move(startX, startY)
    await this.page.mouse.down()
    await this.page.mouse.move(startX + deltaX, startY, { steps: 24 })
    await this.page.mouse.up()
  }

  async dragFloatingResizeHandle(locator: Locator, handle: LayoutFloatingHandle, deltaX: number, deltaY: number) {
    await expect(locator).toBeVisible()
    await locator.hover()
    const box = await locator.boundingBox()

    if (!box) {
      throw new Error('Missing surface resize handle')
    }

    const startX = handle.includes('w')
      ? box.x + box.width - 1
      : handle.includes('e')
        ? box.x + 1
        : box.x + box.width / 2
    const startY = handle.includes('n')
      ? box.y + box.height - 1
      : handle.includes('s')
        ? box.y + 1
        : box.y + box.height / 2

    await this.page.mouse.move(startX, startY)
    await this.page.mouse.down()
    await this.page.mouse.move(startX + deltaX, startY + deltaY, { steps: 24 })
    await this.page.mouse.up()
  }
}
