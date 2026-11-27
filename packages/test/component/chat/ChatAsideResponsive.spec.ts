import { expect, test } from '@playwright/experimental-ct-vue'
import ChatAsideResponsiveFixture from './ChatAsideResponsive.fixture.vue'

test('skips aside transitions when viewport resizing changes ChatUI responsive modes', async ({ mount, page }) => {
  await page.setViewportSize({ width: 1200, height: 900 })
  await mount(ChatAsideResponsiveFixture)

  const surface = page.locator('.tr-layout')
  const leftAside = page.locator('.tr-layout__aside--left')
  const rightAside = page.locator('.tr-layout__aside--right')
  const readTransitions = () =>
    page.evaluate(() => {
      const state = window as typeof window & {
        __responsiveAsideTransitions?: Array<{ target: string; property: string }>
      }
      return state.__responsiveAsideTransitions ?? []
    })
  const clearTransitions = () =>
    page.evaluate(() => {
      const state = window as typeof window & {
        __responsiveAsideTransitions?: Array<{ target: string; property: string }>
      }
      state.__responsiveAsideTransitions = []
    })
  const waitForResponsiveSettle = async () => {
    await page.evaluate(
      () =>
        new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        }),
    )
    await expect(surface).not.toHaveClass(/tr-layout--mode-changing/)
    expect(await readTransitions()).toEqual([])
  }

  await expect(leftAside).toHaveClass(/tr-layout__aside--rail/)
  await expect(leftAside).toHaveClass(/tr-layout__aside--dock/)
  await expect(rightAside).toHaveClass(/tr-layout__aside--expanded/)
  await expect(rightAside).toHaveClass(/tr-layout__aside--dock/)

  await page.evaluate(() => {
    const state = window as typeof window & {
      __responsiveAsideTransitions?: Array<{ target: string; property: string }>
    }
    state.__responsiveAsideTransitions = []
    document.addEventListener(
      'transitionrun',
      (event) => {
        const target = event.target
        if (
          !(target instanceof Element) ||
          !target.matches('.tr-layout__body, .tr-layout__aside, .tr-layout__aside-body')
        ) {
          return
        }
        state.__responsiveAsideTransitions?.push({
          target: String(target.className),
          property: (event as TransitionEvent).propertyName,
        })
      },
      true,
    )
  })

  await page.setViewportSize({ width: 680, height: 900 })
  await expect(rightAside).toHaveClass(/tr-layout__aside--drawer/)
  await expect(rightAside).toHaveClass(/tr-layout__aside--expanded/)
  await expect(leftAside).toHaveClass(/tr-layout__aside--dock/)
  await waitForResponsiveSettle()

  await clearTransitions()
  await page.setViewportSize({ width: 590, height: 900 })
  await expect(surface).toHaveClass(/tr-layout--left-drawer/)
  await expect(surface).toHaveClass(/tr-layout--right-drawer/)
  await expect(leftAside).toHaveClass(/tr-layout__aside--hidden/)
  await expect(rightAside).toHaveClass(/tr-layout__aside--hidden/)
  await waitForResponsiveSettle()

  for (const width of [610, 590, 680, 590, 1200]) {
    await clearTransitions()
    await page.setViewportSize({ width, height: 900 })
    await expect(surface).toHaveClass(/tr-layout--left-(dock|drawer)/)
    await waitForResponsiveSettle()
  }

  await expect(leftAside).toHaveClass(/tr-layout__aside--rail/)
  await expect(rightAside).toHaveClass(/tr-layout__aside--dock/)
  await expect(rightAside).toHaveClass(/tr-layout__aside--hidden/)
})
