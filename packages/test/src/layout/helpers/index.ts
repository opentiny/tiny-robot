import { expect, test as base } from '@playwright/test'
import { LayoutTestPage } from './LayoutTestPage'

export { expect, LayoutTestPage }
export type {
  LayoutAsideMode,
  LayoutAsideState,
  LayoutCollapseEffect,
  LayoutFloatingHandle,
  LayoutHarnessSnapshot,
  LayoutMode,
  LayoutSide,
} from './LayoutTestPage'

export const test = base.extend<{ layout: LayoutTestPage }>({
  layout: async ({ page }, use) => {
    const layout = new LayoutTestPage(page)
    await layout.open()
    await use(layout)
  },
})
