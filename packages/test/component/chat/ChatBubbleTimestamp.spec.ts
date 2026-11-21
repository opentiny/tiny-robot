import { expect, test } from '@playwright/experimental-ct-vue'
import ChatBubbleTimestampFixture from './ChatBubbleTimestamp.fixture.vue'

const message = {
  id: 'assistant-1',
  role: 'assistant',
  content: 'Answer',
  streamState: 'finished' as const,
  metadata: { completedAt: 1_800_000_000 },
}

test('timestamp follows action order, stays text and uses the configured format', async ({ mount }) => {
  const component = await mount(ChatBubbleTimestampFixture, {
    props: {
      message,
      customFormat: true,
      actions: {
        user: false,
        assistant: ['copy', { type: 'slot', id: 'share' }, { type: 'slot', id: 'feedback' }, 'timestamp'],
      },
    },
  })
  const actions = component.locator('.tr-chat-bubble-actions')
  expect(
    await actions
      .locator(':scope > *')
      .evaluateAll((elements) =>
        elements.map((element) => element.getAttribute('data-action') ?? element.tagName.toLowerCase()),
      ),
  ).toEqual(['copy', 'share', 'feedback', 'time'])
  await expect(actions.locator('time')).toHaveText('assistant-1: 1800000000')
  await expect(actions.locator('time')).toHaveAttribute('datetime', new Date(1_800_000_000_000).toISOString())
  await expect(actions.getByRole('button')).toHaveCount(3)
  await component.update({ props: { actions: { user: false, assistant: ['timestamp', 'copy'] } } })
  await expect(actions.locator(':scope > :first-child')).toHaveText('assistant-1: 1800000000')
})

test('format options do not enable timestamp and empty or invalid timestamp groups disappear', async ({ mount }) => {
  const component = await mount(ChatBubbleTimestampFixture, {
    props: { message, customFormat: true, actions: { assistant: ['copy'] } },
  })
  await expect(component.locator('time')).toHaveCount(0)
  await component.update({ props: { actions: { user: false, assistant: ['timestamp'] } } })
  await expect(component.locator('time')).toBeVisible()
  await expect(component.getByRole('button')).toHaveCount(0)
  for (const nextMessage of [
    { ...message, streamState: 'streaming' as const },
    { ...message, metadata: {} },
    { ...message, role: 'user' },
  ]) {
    await component.update({
      props: { message: nextMessage, actions: { user: ['timestamp'], assistant: ['timestamp'] } },
    })
    await expect(component.locator('.tr-chat-bubble-actions')).toHaveCount(0)
  }
  await component.update({ props: { message, actions: false } })
  await expect(component.locator('.tr-chat-bubble-actions')).toHaveCount(0)
})

test('timestamp shares latest, hover, always and hidden action group rules', async ({ mount }) => {
  const component = await mount(ChatBubbleTimestampFixture, {
    props: { message, actions: { user: false, assistant: ['timestamp'] } },
  })
  const actions = component.locator('.tr-chat-bubble-actions')
  await expect(actions).toHaveCSS('opacity', '1')
  await component.update({ props: { historical: true } })
  await expect(actions).toHaveCSS('opacity', '0')
  await component.getByText('Answer', { exact: true }).hover()
  await expect(actions).toHaveCSS('opacity', '1')
  await component.getByText('Next question', { exact: true }).hover()
  await expect(actions).toHaveCSS('opacity', '0')
  await component.update({ props: { actions: { user: false, assistant: ['timestamp'], display: 'always' } } })
  await expect(actions).toHaveCSS('opacity', '1')
  await component.update({ props: { actions: { assistant: ['timestamp'], visible: false } } })
  await expect(actions).toHaveCount(0)
})

test('formatter errors hide only the timestamp and recover without breaking other actions', async ({ mount, page }) => {
  const errors: Error[] = []
  page.on('pageerror', (error) => errors.push(error))
  const component = await mount(ChatBubbleTimestampFixture, {
    props: { message, throwFormat: true, actions: { user: false, assistant: ['copy', 'timestamp'] } },
  })
  await expect(component.getByText('Answer', { exact: true })).toBeVisible()
  await expect(component.getByRole('button', { name: '复制', exact: true })).toBeVisible()
  await expect(component.locator('time')).toHaveCount(0)
  await component.update({ props: { throwFormat: false, customFormat: true } })
  await expect(component.locator('time')).toHaveText('assistant-1: 1800000000')
  expect(errors).toEqual([])
})

test('timestamp updates automatically at local midnight across a year boundary', async ({ mount, page }) => {
  const now = await page.evaluate(() => new Date(2026, 11, 31, 23, 59, 59).getTime())
  await page.clock.install({ time: now })
  await page.clock.pauseAt(now)
  const component = await mount(ChatBubbleTimestampFixture, {
    props: {
      message: { ...message, metadata: { completedAt: now / 1000 } },
      actions: { user: false, assistant: ['timestamp'] },
    },
  })
  await expect(component.locator('time')).toHaveText('23:59')
  await page.clock.runFor(1000)
  await expect(component.locator('time')).toHaveText('2026年12月31日 23:59')
})
