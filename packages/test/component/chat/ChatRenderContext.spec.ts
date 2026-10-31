import { expect, test } from '@playwright/experimental-ct-vue'
import ChatRenderContext from './ChatRenderContext.fixture.vue'

test('Renderer context preserves identity through copies and exposes the real scroll root', async ({ mount }) => {
  const component = await mount(ChatRenderContext)
  const probes = component.locator('.context-probe')
  const last = probes.last()
  await expect(last).toHaveAttribute('data-state', 'streaming')
  await expect(last).toHaveAttribute('data-root', 'true')
  await expect(probes.first()).toHaveAttribute('data-index', '0')
  await expect(probes.nth(1)).toHaveAttribute('data-index', '1')
  await expect(probes.nth(2)).toHaveAttribute('data-state', 'finished')
  const key = await last.getAttribute('data-key')
  const instance = await last.getAttribute('data-instance')
  await component.getByTestId('grow').click()
  await expect(last).toHaveAttribute('data-key', key!)
  await expect(last).toHaveAttribute('data-instance', instance!)
  await component.getByTestId('finish').click()
  await expect(last).toHaveAttribute('data-state', 'finished')
  await component.getByTestId('thread').click()
  await expect(last).toHaveAttribute('data-thread', 'thread-b')
  await expect(last).not.toHaveAttribute('data-key', key!)
})

test('Renderer context infers automatic streaming only from a tracked request', async ({ mount }) => {
  const component = await mount(ChatRenderContext)
  await component.getByTestId('auto-start').click()
  const automatic = component.locator('.context-probe').filter({ hasText: 'first' })
  await expect(automatic).toHaveAttribute('data-state', 'streaming')
  const instance = await automatic.getAttribute('data-instance')
  await component.getByTestId('auto-grow').click()
  await expect(automatic).toContainText('first update')
  await expect(automatic).toHaveAttribute('data-instance', instance!)
  await expect(automatic).toHaveAttribute('data-state', 'streaming')
  await component.getByTestId('auto-table').click()
  await expect(automatic).toContainText('column')
  await expect(automatic).toHaveAttribute('data-state', 'streaming')
  await component.getByTestId('auto-finish').click()
  await expect(automatic).toHaveAttribute('data-state', 'finished')
  await component.getByTestId('auto-switch').click()
  await expect(component.locator('.context-probe').filter({ hasText: 'other' })).toHaveAttribute(
    'data-state',
    'unknown',
  )
})

test('Anchor uses display questions, targets only the first split and retains caller attributes', async ({
  mount,
  page,
}) => {
  await page.setViewportSize({ width: 1200, height: 800 })
  const component = await mount(ChatRenderContext)
  const items = component.locator('.tr-anchor__item')
  await expect(items).toHaveCount(6)
  await expect(items.first()).toContainText('Displayed question 0')
  const userBubbles = component.locator('.tr-bubble[data-role="user"]')
  await expect(userBubbles.first().locator('.tr-chat-anchor-target[data-anchor-id]')).toHaveCount(1)
  await expect(userBubbles.first().locator('[data-business="kept"]')).toHaveCount(2)
  await expect(userBubbles.first().locator('.business-box')).toHaveCount(2)
  await expect(userBubbles.first().locator('.business-box').first()).toHaveCSS('border-top-width', '3px')
  await expect(userBubbles.first().locator('[data-business-content="kept"]')).toHaveCount(2)
})

test('Anchor reuses caller target IDs and preserves callbacks for every split', async ({ mount, page }) => {
  await page.setViewportSize({ width: 1200, height: 800 })
  const component = await mount(ChatRenderContext, { props: { callerAnchors: true } })
  const user = component.locator('.tr-bubble[data-role="user"]').first()
  await expect(user.locator('[data-anchor-id="business-user-0-0"]')).toHaveCount(1)
  await expect(user.locator('[data-anchor-id="business-user-0-1"]')).toHaveCount(1)
  await expect(component.locator('.tr-anchor__item').first()).toHaveAttribute('data-item-id', 'business-user-0-0')
  await expect(user.locator('[data-business-index="0"]')).toHaveCount(1)
  await expect(user.locator('[data-business-index="1"]')).toHaveCount(1)
  await component.locator('.tr-anchor__item').first().click()
  await expect(user.locator('[data-anchor-id="business-user-0-0"]')).toHaveClass(/tr-chat-anchor-target-active/)
})

test('Anchor gives every message in a consecutive user group its own target', async ({ mount, page }) => {
  await page.setViewportSize({ width: 1200, height: 800 })
  const component = await mount(ChatRenderContext, { props: { consecutiveUsers: true } })
  const items = component.locator('.tr-anchor__item')
  const targets = component.locator('.tr-chat-anchor-target[data-anchor-id]')

  await expect(items).toHaveCount(2)
  await expect(targets).toHaveCount(2)
  expect(await items.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-item-id')))).toEqual(
    await targets.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-anchor-id'))),
  )
})

test('Anchor uses actual custom group results for targets', async ({ mount, page }) => {
  await page.setViewportSize({ width: 1200, height: 800 })
  const component = await mount(ChatRenderContext, { props: { consecutiveUsers: true, customConsecutiveUsers: true } })
  const items = component.locator('.tr-anchor__item')
  const targets = component.locator('.tr-chat-anchor-target[data-anchor-id]')
  await expect(items).toHaveCount(2)
  await expect(targets).toHaveCount(2)
  await items.nth(1).click()
  await expect(targets.nth(1)).toHaveClass(/tr-chat-anchor-target-active/)
})

test('Anchor navigates every user message grouped by an assistant divider', async ({ mount, page }) => {
  await page.setViewportSize({ width: 1200, height: 800 })
  const component = await mount(ChatRenderContext, { props: { consecutiveUsers: true, assistantDivider: true } })
  const items = component.locator('.tr-anchor__item')
  const targets = component.locator('.tr-chat-anchor-target[data-anchor-id]')
  const scrollRoot = component.locator('.chat-main-scroll-host')

  await expect(items).toHaveCount(2)
  await expect(targets).toHaveCount(2)
  expect(await items.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-item-id')))).toEqual(
    await targets.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-anchor-id'))),
  )

  await scrollRoot.evaluate((element) => {
    element.scrollTop = element.scrollHeight
  })
  const initialScrollTop = await scrollRoot.evaluate((element) => element.scrollTop)
  expect(initialScrollTop).toBeGreaterThan(0)

  await items.nth(1).click()
  await expect(targets.nth(1)).toHaveClass(/tr-chat-anchor-target-active/)
  await expect.poll(() => scrollRoot.evaluate((element) => element.scrollTop)).toBeLessThan(initialScrollTop)
})

test('Anchor combines callback attributes and injects only the first split target', async ({ mount, page }) => {
  await page.setViewportSize({ width: 1200, height: 800 })
  const component = await mount(ChatRenderContext, { props: { callbackAttributes: true } })
  const user = component.locator('.tr-bubble[data-role="user"]').first()
  await expect(user.locator('.tr-chat-anchor-target[data-anchor-id]')).toHaveCount(1)
  await expect(user.locator('.business-box')).toHaveCount(2)
  await expect(user.locator('[data-business-index="1"]')).toHaveCount(1)
})

test('disabled Anchor leaves box attributes unchanged', async ({ mount }) => {
  const component = await mount(ChatRenderContext, { props: { anchor: false } })
  await expect(component.locator('.tr-chat-anchor-target')).toHaveCount(0)
  await expect(component.locator('.tr-chat-anchor-target[data-anchor-id]')).toHaveCount(0)
  await expect(component.locator('.business-box')).toHaveCount(18)
})

test('Anchor navigation pauses growth following and back-to-bottom resumes it', async ({ mount, page }) => {
  await page.setViewportSize({ width: 1200, height: 800 })
  const component = await mount(ChatRenderContext)
  const root = component.locator('.chat-main-scroll-host')
  const distance = () => root.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop)
  await expect.poll(distance).toBeLessThanOrEqual(2)
  await component.locator('.tr-anchor__item').first().click()
  await expect(component.locator('.tr-chat-anchor-target-active')).toHaveCount(1)
  await expect.poll(() => root.evaluate((el) => el.scrollTop)).toBeLessThan(30)
  await component.getByTestId('grow').click()
  await expect.poll(distance).toBeGreaterThan(500)
  await component.locator('.tr-chat-scroll-to-bottom').click()
  await expect.poll(distance).toBeLessThanOrEqual(2)
  await component.getByTestId('grow').click()
  await expect.poll(distance).toBeLessThanOrEqual(2)
})

test('Anchor follows the viewport rule and stays absent with custom main or disabled configuration', async ({
  mount,
  page,
}) => {
  await page.setViewportSize({ width: 767, height: 800 })
  const component = await mount(ChatRenderContext)
  await expect(component.locator('.tr-anchor')).toHaveCount(0)
  await page.setViewportSize({ width: 768, height: 800 })
  await expect(component.locator('.tr-anchor')).toHaveCount(1)
  await component.update({ props: { customMain: true } })
  await expect(component.locator('.tr-anchor')).toHaveCount(0)
  await component.update({ props: { customMain: false, anchor: false } })
  await expect(component.locator('.tr-anchor')).toHaveCount(0)
})

for (const theme of ['light', 'dark'] as const) {
  test(`Anchor uses the documented 1.8s flash in ${theme} mode`, async ({ mount, page }) => {
    await page.setViewportSize({ width: 1200, height: 800 })
    await page.evaluate((mode) => document.documentElement.setAttribute('data-tr-color-mode', mode), theme)
    const component = await mount(ChatRenderContext)
    const target = component.locator('.tr-chat-anchor-target').first()
    const restingColor = await target.evaluate((el) => getComputedStyle(el).backgroundColor)
    await page.clock.install()
    await component.locator('.tr-anchor__item').first().click()
    await expect(target).toHaveClass(/tr-chat-anchor-target-active/)
    await expect(target).toHaveCSS('animation-duration', '1.8s')
    await expect(target).toHaveCSS('animation-timing-function', 'ease-out')
    await expect(target).toHaveCSS('outline-style', 'none')
    const frames = await target.evaluate((el) => {
      const effect = el.getAnimations()[0]?.effect
      if (!(effect instanceof KeyframeEffect)) throw new Error('Expected a keyframe animation on the anchor target')
      return effect.getKeyframes()
    })
    expect(frames.map((frame) => frame.offset)).toEqual([0, 0.25, 0.45, 0.65, 0.85, 1])
    expect(frames[0].backgroundColor).not.toBe(restingColor)
    expect(frames[2].backgroundColor).toBe(restingColor)
    expect(frames[5].backgroundColor).toBe(restingColor)
    await page.clock.fastForward(900)
    await expect(target).toHaveClass(/tr-chat-anchor-target-active/)
    await page.clock.fastForward(1000)
    await expect(target).not.toHaveClass(/tr-chat-anchor-target-active/)
  })
}

for (const layout of [
  { name: 'desktop', viewport: 1200, props: { contentMaxWidth: 640 } },
  { name: 'mobile', viewport: 600, props: { width: 420 } },
  { name: 'CSS override', viewport: 1200, props: { contentMaxWidth: 640, contentPaddingInline: '37px' } },
  { name: 'floating', viewport: 1200, props: { floating: true, width: 600 } },
] as const) {
  test(`${layout.name}: messages, Sender and back-to-bottom share their content edges`, async ({ mount, page }) => {
    await page.setViewportSize({ width: layout.viewport, height: 800 })
    const props = layout.props
    const component = await mount(ChatRenderContext, { props: { anchor: false, ...props } })
    const chat = page.locator('.tr-chat-ui')
    const root = chat.locator('.chat-main-scroll-host')
    const button = chat.locator('.tr-chat-scroll-to-bottom')
    await expect
      .poll(() => root.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop))
      .toBeLessThanOrEqual(2)
    await root.evaluate((el) => {
      el.scrollTop = 0
    })
    await expect(button).toBeVisible()

    const aligned = async () => {
      const list = (await chat.locator('.tr-bubble-list__content').boundingBox())!
      const sender = (await chat.locator('.tr-sender').boundingBox())!
      const action = (await button.boundingBox())!
      const composer = (await chat.locator('.chat-footer').boundingBox())!
      expect(Math.abs(list.x - sender.x)).toBeLessThanOrEqual(1)
      expect(Math.abs(list.x + list.width - sender.x - sender.width)).toBeLessThanOrEqual(1)
      expect(Math.abs(action.x + action.width - sender.x - sender.width)).toBeLessThanOrEqual(1)
      expect(Math.abs(composer.y - action.y - action.height - 8)).toBeLessThanOrEqual(1)
    }
    await expect(aligned).toPass()

    const composerHeight = (await chat.locator('.chat-footer').boundingBox())!.height
    await component.getByTestId('sender-header').dispatchEvent('click')
    await expect
      .poll(async () => (await chat.locator('.chat-footer').boundingBox())!.height)
      .toBeGreaterThan(composerHeight)
    await expect(aligned).toPass()
    if ('floating' in props) {
      await component.update({ props: { anchor: false, ...props, width: 420 } })
      await expect(chat).toHaveCSS('width', '420px')
      await expect(aligned).toPass()
    }
  })
}

test('back-to-bottom remains available when the Sender is hidden', async ({ mount }) => {
  const component = await mount(ChatRenderContext, { props: { hideSender: true, anchor: false } })
  const root = component.locator('.chat-main-scroll-host')
  await expect
    .poll(() => root.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop))
    .toBeLessThanOrEqual(2)
  await root.evaluate((el) => {
    el.scrollTop = 0
  })
  await expect(component.locator('.chat-scroll-actions--main .tr-chat-scroll-to-bottom')).toBeVisible()
  await component.locator('.tr-chat-scroll-to-bottom').click()
  await expect
    .poll(() => root.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop))
    .toBeLessThanOrEqual(2)
})

for (const hideSender of [false, true]) {
  test(`CSS controls back-to-bottom alignment ${hideSender ? 'without' : 'with'} a Sender`, async ({ mount }) => {
    const props = { anchor: false, hideSender, contentMaxWidth: 640, contentPaddingInline: '37px' }
    const component = await mount(ChatRenderContext, { props })
    const root = component.locator('.chat-main-scroll-host')
    const button = component.locator('.tr-chat-scroll-to-bottom')
    await expect
      .poll(() => root.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop))
      .toBeLessThanOrEqual(2)
    await root.evaluate((el) => {
      el.scrollTop = 0
    })
    await expect(button).toBeVisible()

    for (const scrollButtonAlign of ['flex-start', 'center', 'flex-end', undefined] as const) {
      await component.update({ props: { ...props, scrollButtonAlign } })
      await expect(async () => {
        const content = (await component.locator('.tr-bubble-list__content').boundingBox())!
        const action = (await button.boundingBox())!
        const expectedX =
          scrollButtonAlign === 'flex-start'
            ? content.x
            : scrollButtonAlign === 'center'
              ? content.x + (content.width - action.width) / 2
              : content.x + content.width - action.width
        expect(Math.abs(action.x - expectedX)).toBeLessThanOrEqual(1)
      }).toPass()
    }
    await button.click()
    await expect
      .poll(() => root.evaluate((el) => el.scrollHeight - el.clientHeight - el.scrollTop))
      .toBeLessThanOrEqual(2)
  })
}
