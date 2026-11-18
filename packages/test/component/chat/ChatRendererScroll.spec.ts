import { expect, test } from '@playwright/experimental-ct-vue'
import type { Locator } from '@playwright/test'
import ChatRenderContext from './ChatRenderContext.fixture.vue'
import ChatRendererScroll from './ChatRendererScroll.fixture.vue'

const distance = (root: Locator) => root.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop)
const atBottom = (root: Locator) => expect.poll(() => distance(root)).toBeLessThanOrEqual(1)
const settle = (root: Locator) =>
  root.evaluate(
    () => new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))),
  )
const settleRendererRecovery = (root: Locator) =>
  root.evaluate(
    () =>
      new Promise<void>((resolve) => {
        let frames = 0
        const nextFrame = () => {
          if (++frames === 5) {
            resolve()
            return
          }
          requestAnimationFrame(nextFrame)
        }
        requestAnimationFrame(nextFrame)
      }),
  )
const resize = (probe: Locator, action = 'expand') => probe.getByTestId(action).dispatchEvent('click')

test.use({ launchOptions: { args: ['--enable-smooth-scrolling'] } })

test('renderer expansion preserves the viewport through subsequent growth and upward scrolling', async ({ mount }) => {
  const component = await mount(ChatRenderContext)
  const root = component.locator('.chat-main-scroll-host')
  await atBottom(root)
  const before = await root.evaluate((el) => el.scrollTop)
  const height = await root.evaluate((el) => el.scrollHeight)
  await resize(component.locator('.context-probe').last())
  await expect.poll(() => root.evaluate((el) => el.scrollHeight)).toBeGreaterThan(height + 1000)
  await settle(root)
  await expect(root).toHaveJSProperty('scrollTop', before)
  await component.getByTestId('grow').click()
  await settle(root)
  await expect(root).toHaveJSProperty('scrollTop', before)
  await root.evaluate((el) => {
    el.scrollTop -= 100
  })
  await settle(root)
  await component.getByTestId('grow').click()
  await settle(root)
  await expect(root).toHaveJSProperty('scrollTop', before - 100)
})

for (const steps of [1, 3]) {
  test(`renderer pause resumes after ${steps} downward scrolls into the bottom range`, async ({ mount }) => {
    const component = await mount(ChatRenderContext)
    const root = component.locator('.chat-main-scroll-host')
    await atBottom(root)
    await resize(component.locator('.context-probe').last())
    await settle(root)
    for (let step = steps; step > 0; step--) {
      await root.evaluate((el, remaining) => {
        el.scrollTop = el.scrollHeight - el.clientHeight - (remaining === 1 ? 40 : remaining * 100)
      }, step)
      await settle(root)
    }
    await atBottom(root)
    await component.getByTestId('grow').click()
    await atBottom(root)
  })
}

test('the existing back-to-bottom button clears renderer pause', async ({ mount }) => {
  const component = await mount(ChatRenderContext)
  const root = component.locator('.chat-main-scroll-host')
  await atBottom(root)
  await resize(component.locator('.context-probe').last())
  await settle(root)
  await root.evaluate((el) => {
    el.scrollTop -= 1
  })
  await component.locator('.tr-chat-scroll-to-bottom').click()
  await atBottom(root)
  await component.getByTestId('grow').click()
  await atBottom(root)
})

test('End clears anchor pause so the next renderer expansion can pause following', async ({ mount, page }) => {
  await page.setViewportSize({ width: 1200, height: 800 })
  const component = await mount(ChatRenderContext)
  const root = component.locator('.chat-main-scroll-host')
  await atBottom(root)
  await component.locator('.tr-anchor__item').first().click()
  await expect.poll(() => root.evaluate((el) => el.scrollTop)).toBeLessThan(30)
  await root.evaluate((el) => {
    el.tabIndex = 0
  })
  await root.press('End')
  await atBottom(root)
  await component.getByTestId('grow').click()
  await atBottom(root)
  const before = await root.evaluate((el) => el.scrollTop)
  await resize(component.locator('.context-probe').last())
  await settle(root)
  await expect(root).toHaveJSProperty('scrollTop', before)
  await component.getByTestId('grow').click()
  await settle(root)
  await expect(root).toHaveJSProperty('scrollTop', before)
})

test('End in an independently scrollable message region does not move the chat container', async ({ mount }) => {
  const component = await mount(ChatRendererScroll)
  const root = component.getByTestId('first-root')
  const inner = component.locator('[data-testid="inner-scroll"]').last()
  await atBottom(root)
  await inner.focus()
  await root.evaluate((el) => {
    el.style.scrollBehavior = 'auto'
    el.scrollTop -= 200
  })
  await settle(root)
  const before = await root.evaluate((el) => el.scrollTop)
  await inner.press('End')
  await expect(inner).toHaveJSProperty('scrollTop', 160)
  await expect(root).toHaveJSProperty('scrollTop', before)
})

test('End consumed by a message control preserves its selection behavior and renderer pause', async ({ mount }) => {
  const component = await mount(ChatRendererScroll)
  const root = component.getByTestId('first-root')
  const probe = component.locator('.context-probe').last()
  const listbox = probe.getByRole('listbox')
  await atBottom(root)
  await listbox.focus()
  await resize(probe)
  await settle(root)
  const before = await root.evaluate((el) => el.scrollTop)
  await expect(listbox.getByRole('option', { name: 'Option A' })).toHaveAttribute('aria-selected', 'true')
  await listbox.press('End')
  await expect(listbox.getByRole('option', { name: 'Option B' })).toHaveAttribute('aria-selected', 'true')
  await expect(root).toHaveJSProperty('scrollTop', before)
  await root.evaluate((el) => {
    el.scrollTop -= 100
    // 等待滚动停止后的修正，避免只验证事件分发当帧而漏掉延迟回底。
    return new Promise((resolve) => setTimeout(resolve, 500))
  })
  await expect(root).toHaveJSProperty('scrollTop', before - 100)
  await component.getByTestId('grow').click()
  await settle(root)
  await expect(root).toHaveJSProperty('scrollTop', before - 100)
})

test('End in the sender input does not clear a renderer pause', async ({ mount }) => {
  const component = await mount(ChatRendererScroll)
  const root = component.getByTestId('first-root')
  await atBottom(root)
  await component.locator('.context-probe').last().getByTestId('expand').click()
  await settle(root)
  const before = await root.evaluate((el) => el.scrollTop)
  const input = component.getByTestId('sender-input')
  await input.press('End')
  await settle(root)
  await expect(root).toHaveJSProperty('scrollTop', before)
  await root.evaluate((el) => {
    el.scrollTop -= 100
    return new Promise((resolve) => setTimeout(resolve, 500))
  })
  await expect(root).toHaveJSProperty('scrollTop', before - 100)
  await component.getByTestId('grow').click()
  await settle(root)
  await expect(root).toHaveJSProperty('scrollTop', before - 100)
})

for (const action of ['resume', 'up', 'leave-range', 'growth'] as const) {
  test(`downward scrolling during an animation rechecks recovery after ${action}`, async ({ mount }) => {
    const component = await mount(ChatRendererScroll)
    const root = component.getByTestId('first-root')
    const probe = component.locator('.context-probe')
    await atBottom(root)
    await probe.evaluate((el) => {
      el.animate([{ opacity: 0.99 }, { opacity: 1 }], 10_000)
    })
    await resize(probe)
    await settle(root)
    await root.evaluate((el) => {
      el.scrollTop = el.scrollHeight - el.clientHeight - 30
    })
    await settle(root)
    await expect.poll(() => distance(root)).toBe(30)
    if (action === 'up' || action === 'leave-range') {
      await root.evaluate(
        (el, offset) => {
          el.scrollTop -= offset
        },
        action === 'up' ? 10 : 40,
      )
    } else if (action === 'growth') {
      await component.getByTestId('grow').click()
    }
    await settle(root)
    const before = await root.evaluate((el) => el.scrollTop)
    await probe.evaluate((el) => {
      el.getAnimations().forEach((animation) => animation.finish())
    })
    await settle(root)
    if (action === 'resume') await atBottom(root)
    else await expect(root).toHaveJSProperty('scrollTop', before)
    await component.getByTestId('grow').click()
    await settle(root)
    if (action === 'resume') await atBottom(root)
    else await expect(root).toHaveJSProperty('scrollTop', before)
  })
}

test('collapse at the actual bottom restores following', async ({ mount }) => {
  const component = await mount(ChatRenderContext)
  const root = component.locator('.chat-main-scroll-host')
  const probe = component.locator('.context-probe').last()
  await atBottom(root)
  await resize(probe)
  await settle(root)
  await resize(probe, 'collapse')
  await settle(root)
  await atBottom(root)
  await component.getByTestId('grow').click()
  await atBottom(root)
})

for (const action of ['expand-short', 'rapid']) {
  test(`${action} does not leave content shorter than the viewport paused`, async ({ mount }) => {
    const component = await mount(ChatRenderContext, { props: { shortContent: true } })
    const root = component.locator('.chat-main-scroll-host')
    const probe = component.locator('.context-probe').last()
    await settle(root)
    if (action === 'rapid') {
      await probe.evaluate((el) => {
        for (const id of ['expand', 'collapse', 'expand', 'collapse']) {
          el.querySelector<HTMLElement>(`[data-testid="${id}"]`)!.click()
        }
      })
    } else {
      await resize(probe, action)
    }
    await settle(root)
    await expect(root).toHaveJSProperty('scrollTop', 0)
    await component.getByTestId('grow').click()
    await expect.poll(() => root.evaluate((el) => el.scrollHeight - el.clientHeight)).toBeGreaterThan(100)
    await atBottom(root)
  })
}

test('collapse within 50px of the bottom preserves a historical reading position', async ({ mount }) => {
  const component = await mount(ChatRenderContext)
  const root = component.locator('.chat-main-scroll-host')
  const probe = component.locator('.context-probe').last()
  await atBottom(root)
  const collapsedBottom = await root.evaluate((el) => el.scrollTop)
  await resize(probe)
  await settle(root)
  await root.evaluate((el, top) => {
    el.scrollTop = top - 30
  }, collapsedBottom)
  await settle(root)
  await resize(probe, 'collapse')
  await settle(root)
  await expect.poll(() => distance(root)).toBe(30)
  await component.getByTestId('grow').click()
  await settle(root)
  await expect(root).toHaveJSProperty('scrollTop', collapsedBottom - 30)
})

for (const anchorFirst of [true, false]) {
  test(`anchor pause stays persistent with renderer pause ${anchorFirst ? 'after' : 'before'} it`, async ({
    mount,
    page,
  }) => {
    await page.setViewportSize({ width: 1200, height: 800 })
    const component = await mount(ChatRenderContext)
    const root = component.locator('.chat-main-scroll-host')
    const probe = component.locator('.context-probe').last()
    await atBottom(root)
    if (!anchorFirst) await resize(probe)
    await component.locator('.tr-anchor__item').first().click()
    await expect.poll(() => root.evaluate((el) => el.scrollTop)).toBeLessThan(30)
    if (anchorFirst) await resize(probe)
    await resize(probe, 'collapse')
    await root.evaluate((el) => {
      el.scrollTop = el.scrollHeight
    })
    await settle(root)
    const before = await root.evaluate((el) => el.scrollTop)
    await component.getByTestId('grow').click()
    await settle(root)
    await expect(root).toHaveJSProperty('scrollTop', before)
    await expect.poll(() => distance(root)).toBeGreaterThan(100)
  })
}

test('conversation changes and sending a message clear renderer pause', async ({ mount }) => {
  const component = await mount(ChatRenderContext)
  const root = component.locator('.chat-main-scroll-host')
  await atBottom(root)
  await resize(component.locator('.context-probe').last())
  await component.getByTestId('thread').click()
  await atBottom(root)
  await component.getByTestId('grow').click()
  await atBottom(root)
  await resize(component.locator('.context-probe').last())
  await component.getByTestId('send').click()
  await atBottom(root)
})

test('renderer recovery never scrolls with autoScroll disabled', async ({ mount }) => {
  const props = { shortContent: true, autoScroll: false }
  const component = await mount(ChatRenderContext, { props })
  const root = component.locator('.chat-main-scroll-host')
  await resize(component.locator('.context-probe').last(), 'expand-short')
  await settle(root)
  await component.getByTestId('grow').click()
  await settle(root)
  await expect(root).toHaveJSProperty('scrollTop', 0)
  await component.update({ props: { ...props, autoScroll: true } })
  await root.evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })
  await settle(root)
  await component.getByTestId('grow').click()
  await atBottom(root)
})

test('renderer pauses remain local to each chat instance', async ({ mount }) => {
  const component = await mount(ChatRenderContext, { props: { instances: 2 } })
  const roots = component.locator('.chat-main-scroll-host')
  await atBottom(roots.nth(0))
  await atBottom(roots.nth(1))
  const before = await roots.nth(0).evaluate((el) => el.scrollTop)
  await resize(roots.nth(0).locator('.context-probe').last())
  await component.getByTestId('grow').click()
  await settle(roots.nth(0))
  await expect(roots.nth(0)).toHaveJSProperty('scrollTop', before)
  await atBottom(roots.nth(1))
})

test('renderer pause cancels an in-flight smooth scroll at its actual position', async ({ mount }) => {
  const component = await mount(ChatRenderContext)
  const root = component.locator('.chat-main-scroll-host')
  await atBottom(root)
  await root.evaluate((el) => {
    el.scrollTop = 0
  })
  await settle(root)
  await root.evaluate((el) => {
    const interrupt = () => {
      if (el.scrollTop <= 0 || el.scrollHeight - el.clientHeight - el.scrollTop <= 100) return
      el.removeEventListener('scroll', interrupt)
      el.querySelectorAll<HTMLElement>('[data-testid="expand"]')
        .item(el.querySelectorAll('[data-testid="expand"]').length - 1)
        .click()
      el.setAttribute('data-paused-at', String(el.scrollTop))
    }
    el.addEventListener('scroll', interrupt)
  })
  await component.locator('.tr-chat-scroll-to-bottom').click()
  await expect(root).toHaveAttribute('data-paused-at', /\d+/)
  const stoppedAt = Number(await root.getAttribute('data-paused-at'))
  await component.getByTestId('grow').click()
  await root.evaluate(() => new Promise((resolve) => setTimeout(resolve, 600)))
  await expect(root).toHaveJSProperty('scrollTop', stoppedAt)
  await expect.poll(() => distance(root)).toBeGreaterThan(500)
})

test('renderer pause cancels automatic scrolling already queued by content growth', async ({ mount }) => {
  const component = await mount(ChatRenderContext)
  const root = component.locator('.chat-main-scroll-host')
  await atBottom(root)
  const before = await root.evaluate((el) => el.scrollTop)
  await root.evaluate((el) => {
    const content = el.querySelector<HTMLElement>('.chat-panel-content--main')!
    const height = content.offsetHeight
    const observer = new ResizeObserver(() => {
      if (content.offsetHeight <= height) return
      observer.disconnect()
      const buttons = el.querySelectorAll<HTMLElement>('[data-testid="expand"]')
      buttons.item(buttons.length - 1).click()
      el.setAttribute('data-paused-at', String(el.scrollTop))
    })
    observer.observe(content)
  })
  await component.getByTestId('grow').click()
  await expect(root).toHaveAttribute('data-paused-at', String(before))
  await settle(root)
  await expect.poll(() => distance(root)).toBeGreaterThan(1200)
  await expect(root).toHaveJSProperty('scrollTop', before)
})

test('a pending renderer recovery cannot clear a newer anchor pause', async ({ mount }) => {
  const component = await mount(ChatRendererScroll)
  const root = component.getByTestId('first-root')
  await atBottom(root)
  await component.evaluate((el) => {
    for (const id of ['expand', 'collapse', 'anchor']) {
      el.querySelector<HTMLElement>(`[data-testid="${id}"]`)!.click()
    }
  })
  await settle(root)
  const before = await root.evaluate((el) => el.scrollTop)
  await component.getByTestId('grow').click()
  await settle(root)
  await expect(root).toHaveJSProperty('scrollTop', before)
  await expect.poll(() => distance(root)).toBeGreaterThan(100)
})

for (const actualBottom of [true, false]) {
  test(`container growth ${actualBottom ? 'resumes at the actual bottom' : 'does not resume within 50px'}`, async ({
    mount,
  }) => {
    const component = await mount(ChatRendererScroll)
    const root = component.getByTestId('first-root')
    await atBottom(root)
    await resize(component.locator('.context-probe'))
    await settle(root)
    await root.evaluate((el, atBottom) => {
      el.style.height = `${el.clientHeight + 1200 - (atBottom ? 0 : 30)}px`
    }, actualBottom)
    await settle(root)
    if (actualBottom) await atBottom(root)
    else await expect.poll(() => distance(root)).toBe(30)
    const before = await root.evaluate((el) => el.scrollTop)
    await component.getByTestId('grow').click()
    await settle(root)
    if (actualBottom) await atBottom(root)
    else await expect(root).toHaveJSProperty('scrollTop', before)
  })
}

test('changing the scroll root invalidates pending recovery and rebinds it to the current container', async ({
  mount,
}) => {
  const component = await mount(ChatRendererScroll)
  const first = component.getByTestId('first-root')
  const second = component.getByTestId('second-root')
  await atBottom(first)
  await component.evaluate((el) => {
    el.querySelector<HTMLElement>('[data-testid="expand"]')!.click()
    el.querySelector<HTMLElement>('[data-testid="switch-root"]')!.click()
  })
  await atBottom(second)
  await second.evaluate((el) => {
    el.scrollTop -= 200
    el.dispatchEvent(new Event('scroll'))
  })
  await expect.poll(() => distance(second)).toBeGreaterThanOrEqual(200)
  await settle(second)
  await resize(component.locator('.context-probe'))
  await settle(second)
  await settleRendererRecovery(second)
  const before = await second.evaluate((el) => el.scrollTop)
  await first.evaluate((el) => {
    el.scrollTop = el.scrollHeight
    el.dispatchEvent(new Event('scroll'))
  })
  await component.getByTestId('grow').click()
  await settle(second)
  await expect(second).toHaveJSProperty('scrollTop', before)
  await second.evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })
  await settle(second)
  await component.getByTestId('grow').click()
  await atBottom(second)
})

for (const position of ['bottom', 'history', 'anchor'] as const) {
  test(`changing the scroll root while disabled preserves recovery at ${position}`, async ({ mount }) => {
    const component = await mount(ChatRendererScroll)
    const first = component.getByTestId('first-root')
    const second = component.getByTestId('second-root')
    await atBottom(first)
    await resize(component.locator('.context-probe'))
    if (position === 'anchor') await component.getByTestId('anchor').click()
    await component.getByTestId('toggle-enabled').click()
    await component.getByTestId('switch-root').click()
    await settle(second)
    await settle(second)
    await expect(second).toHaveJSProperty('scrollTop', 0)
    if (position !== 'history') {
      await second.evaluate((el) => {
        el.scrollTop = el.scrollHeight
      })
      await settle(second)
    }
    const before = await second.evaluate((el) => el.scrollTop)
    await component.getByTestId('toggle-enabled').click()
    await settle(second)
    await component.getByTestId('grow').click()
    await settle(second)
    if (position === 'bottom') await atBottom(second)
    else {
      await expect(second).toHaveJSProperty('scrollTop', before)
      await expect.poll(() => distance(second)).toBeGreaterThan(100)
    }
    if (position === 'anchor') return
    if (position === 'history') {
      await second.evaluate((el) => {
        el.scrollTop = el.scrollHeight - el.clientHeight - 30
      })
      await atBottom(second)
    }
    await component.getByTestId('grow').click()
    await atBottom(second)
  })
}

test('changing the scroll root preserves persistent anchor pause', async ({ mount }) => {
  const component = await mount(ChatRendererScroll)
  const first = component.getByTestId('first-root')
  const second = component.getByTestId('second-root')
  await atBottom(first)
  await component.getByTestId('anchor').click()
  await component.getByTestId('switch-root').click()
  await resize(component.locator('.context-probe'))
  await second.evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })
  await settle(second)
  const before = await second.evaluate((el) => el.scrollTop)
  await component.getByTestId('grow').click()
  await settle(second)
  await expect(second).toHaveJSProperty('scrollTop', before)
  await expect.poll(() => distance(second)).toBeGreaterThan(100)
})

test('rapid expansion, collapse and conversation switching cannot resume a newer renderer pause', async ({ mount }) => {
  const component = await mount(ChatRenderContext)
  const root = component.locator('.chat-main-scroll-host')
  await atBottom(root)
  await component.evaluate((el) => {
    for (const id of ['expand', 'collapse', 'thread']) {
      const buttons = el.querySelectorAll<HTMLElement>(`[data-testid="${id}"]`)
      buttons.item(buttons.length - 1).click()
    }
  })
  await atBottom(root)
  const before = await root.evaluate((el) => el.scrollTop)
  await resize(component.locator('.context-probe').last())
  await settle(root)
  await component.getByTestId('grow').click()
  await settle(root)
  await expect(root).toHaveJSProperty('scrollTop', before)
  await expect.poll(() => distance(root)).toBeGreaterThan(1200)
})

test('disabling auto scroll while recovery is pending keeps the reading position', async ({ mount }) => {
  const component = await mount(ChatRendererScroll)
  const root = component.getByTestId('first-root')
  await atBottom(root)
  await component.evaluate((el) => {
    for (const id of ['expand', 'collapse', 'toggle-enabled']) {
      el.querySelector<HTMLElement>(`[data-testid="${id}"]`)!.click()
    }
  })
  await settle(root)
  const before = await root.evaluate((el) => el.scrollTop)
  await component.getByTestId('grow').click()
  await settle(root)
  await expect(root).toHaveJSProperty('scrollTop', before)
})

test('unmounting cancels pending recovery and further movement of the old container', async ({ mount, page }) => {
  const errors: Error[] = []
  page.on('pageerror', (error) => errors.push(error))
  const component = await mount(ChatRendererScroll)
  const root = component.getByTestId('first-root')
  await atBottom(root)
  await component.evaluate((el) => {
    el.querySelector<HTMLElement>('[data-testid="expand"]')!.click()
    el.querySelector<HTMLElement>('[data-testid="detach"]')!.click()
    requestAnimationFrame(() => {
      const root = el.querySelector<HTMLElement>('[data-testid="first-root"]')!
      root.scrollTop = 100
      root.setAttribute('data-unmounted-at', String(root.scrollTop))
    })
  })
  await expect(component.locator('.context-probe')).toHaveCount(0)
  await settle(root)
  await expect(root).toHaveAttribute('data-unmounted-at', '100')
  await expect(root).toHaveJSProperty('scrollTop', 100)
  expect(errors).toEqual([])
})

test('Vue expansion transitions preserve the reading position until the user returns to the bottom', async ({
  mount,
}) => {
  const component = await mount(ChatRendererScroll)
  const root = component.getByTestId('first-root')
  const probe = component.locator('.context-probe')
  await atBottom(root)
  const before = await root.evaluate((el) => el.scrollTop)
  const height = await root.evaluate((el) => el.scrollHeight)
  await resize(probe, 'animated-toggle')
  await expect.poll(() => root.evaluate((el) => el.scrollHeight)).toBeGreaterThan(height + 400)
  await expect(root).toHaveJSProperty('scrollTop', before)
  await expect(probe.getByTestId('animated-content')).not.toHaveClass(/probe-expand-enter-active/)
  await component.getByTestId('grow').click()
  await settle(root)
  await expect(root).toHaveJSProperty('scrollTop', before)
  await root.evaluate((el) => {
    el.scrollTop = el.scrollHeight - el.clientHeight - 30
  })
  await atBottom(root)
  await component.getByTestId('grow').click()
  await atBottom(root)
})

for (const actualBottom of [true, false]) {
  test(`animated collapse ${actualBottom ? 'restores following at the actual bottom' : 'preserves a historical position'}`, async ({
    mount,
  }) => {
    const component = await mount(ChatRendererScroll)
    const root = component.getByTestId('first-root')
    const probe = component.locator('.context-probe')
    await atBottom(root)
    const before = await root.evaluate((el) => el.scrollTop)
    await resize(probe, 'animated-toggle')
    await expect(probe.getByTestId('animated-content')).toHaveCSS('height', '1400px')
    if (!actualBottom) {
      await root.evaluate((el, top) => {
        el.scrollTop = top - 30
      }, before)
    }
    await resize(probe, 'animated-toggle')
    await expect(probe.getByTestId('animated-content')).toHaveCount(0)
    await settle(root)
    await component.getByTestId('grow').click()
    await settle(root)
    if (actualBottom) await atBottom(root)
    else {
      await expect(root).toHaveJSProperty('scrollTop', before - 30)
      await expect.poll(() => distance(root)).toBeGreaterThan(100)
    }
  })
}

test('infinite loading animations do not block renderer recovery for short content', async ({ mount }) => {
  const component = await mount(ChatRenderContext, { props: { shortContent: true } })
  const root = component.locator('.chat-main-scroll-host')
  const probe = component.locator('.context-probe')
  await probe.evaluate((el) => {
    el.animate([{ opacity: 0.5 }, { opacity: 1 }], { duration: 1000, iterations: Infinity })
  })
  await resize(probe, 'expand-short')
  await settle(root)
  await settle(root)
  await component.getByTestId('grow').click()
  await expect.poll(() => root.evaluate((el) => el.scrollHeight - el.clientHeight)).toBeGreaterThan(100)
  await atBottom(root)
})

for (const position of ['bottom', 'history', 'anchor'] as const) {
  test(`re-enabling auto scroll rechecks renderer pause at ${position}`, async ({ mount }) => {
    const component = await mount(ChatRendererScroll)
    const root = component.getByTestId('first-root')
    await atBottom(root)
    await component.getByTestId('toggle-enabled').click()
    await resize(component.locator('.context-probe'))
    await settle(root)
    await root.evaluate((el, position) => {
      el.scrollTop = el.scrollHeight - el.clientHeight - (position === 'history' ? 30 : 0)
    }, position)
    await settle(root)
    if (position === 'anchor') await component.getByTestId('anchor').click()
    const before = await root.evaluate((el) => el.scrollTop)
    await component.getByTestId('toggle-enabled').click()
    await settle(root)
    await component.getByTestId('grow').click()
    await settle(root)
    if (position === 'bottom') await atBottom(root)
    else {
      await expect(root).toHaveJSProperty('scrollTop', before)
      await expect.poll(() => distance(root)).toBeGreaterThan(100)
    }
  })
}
