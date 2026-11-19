import { expect, test } from '@playwright/experimental-ct-vue'
import ModelFields from './ModelFields.fixture.vue'

test('renders defaults, validates operations and emits independent snapshots', async ({ mount, page }) => {
  const component = await mount(ModelFields)
  const trigger = component.getByRole('button', { name: 'Model A', exact: true })
  await trigger.click()
  await expect(page.getByRole('button', { name: '关闭', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('switch', { name: '查询', exact: true })).toHaveAttribute('aria-checked', 'false')
  await expect(page.getByRole('switch', { name: '锁定', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: '禁用', exact: true })).toBeDisabled()
  await expect(page.locator('.tr-model-selector__field-empty')).toHaveText('—')
  await expect(page.getByRole('listbox').getByRole('switch')).toHaveCount(0)
  await page.getByRole('button', { name: '禁用', exact: true }).dispatchEvent('click')
  await page.getByRole('switch', { name: '锁定', exact: true }).dispatchEvent('click')
  await expect(component.getByTestId('events')).toHaveText('[]')
  await page.getByRole('button', { name: '高', exact: true }).click()
  const expected = [
    [
      'change',
      { modelId: 'a', featureValues: { mode: 'high', lookup: false, locked: false } },
      { modelId: 'a', featureValues: { mode: 'off', lookup: false, locked: false } },
    ],
  ]
  await expect(component.getByTestId('events')).toHaveText(JSON.stringify(expected))
  const activeTrigger = component.getByRole('button', { name: 'Model A 高', exact: true })
  await expect(activeTrigger).toHaveAttribute('title', 'Model A 高')
  await expect(activeTrigger).toHaveText(/Model A\s*高/)
  await page.getByRole('button', { name: '高', exact: true }).click()
  await expect(component.getByTestId('events')).toHaveText(JSON.stringify(expected))
  await page.getByRole('switch', { name: '查询', exact: true }).click()
  const events = JSON.parse(await component.getByTestId('events').innerText())
  expect(events[0][1].featureValues.lookup).toBe(false)
  expect(events[1][1].featureValues.lookup).toBe(true)
})

test('emits user requests while external updates and rejected values follow the parent', async ({ mount, page }) => {
  const component = await mount(ModelFields, { props: { accept: false } })
  await component.getByRole('button', { name: 'Model A', exact: true }).click()
  await page.getByRole('button', { name: '高', exact: true }).click()
  await expect(page.getByRole('button', { name: '关闭', exact: true })).toHaveAttribute('aria-pressed', 'true')
  const events = await component.getByTestId('events').innerText()
  await component.update({ props: { external: true, accept: false } })
  await expect(component.getByRole('button', { name: 'Model A 高', exact: true })).toBeVisible()
  await expect(component.getByTestId('events')).toHaveText(events)
  await page.getByRole('option', { name: 'Model B' }).click()
  await expect(page.getByRole('switch')).toHaveCount(0)
  const afterModelChange = JSON.stringify([
    ...JSON.parse(events),
    [
      'change',
      { modelId: 'b', featureValues: {} },
      { modelId: 'a', featureValues: { mode: 'high', lookup: true, locked: false } },
    ],
  ])
  await expect(component.getByTestId('events')).toHaveText(afterModelChange)
  await component.update({ props: { external: true, modelId: 'a', accept: false } })
  await expect(page.getByRole('switch', { name: '查询', exact: true })).toHaveAttribute('aria-checked', 'true')
  await expect(component.getByTestId('events')).toHaveText(afterModelChange)
})

test('invalid controlled values resolve to field defaults', async ({ mount, page }) => {
  const component = await mount(ModelFields, { props: { invalid: true } })
  await component.getByRole('button', { name: 'Model A', exact: true }).click()
  await expect(page.getByRole('button', { name: '关闭', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page.getByRole('switch', { name: '查询', exact: true })).toHaveAttribute('aria-checked', 'false')
  await expect(component.getByTestId('events')).toHaveText('[]')
})

test('footer replaces fields using the same setter', async ({ mount, page }) => {
  const component = await mount(ModelFields, { props: { footer: true } })
  await component.getByRole('button', { name: 'Model A', exact: true }).click()
  await expect(page.getByRole('switch')).toHaveCount(0)
  await page.getByRole('button', { name: '自定义查询' }).click()
  const events = await component.getByTestId('events').innerText()
  expect(JSON.parse(events)[0][1]).toMatchObject({ featureValues: { lookup: true } })
  await expect(component.getByTestId('events')).toHaveText(events)
})

test('Chat forwards fields and generic events through its runtime', async ({ mount, page }) => {
  const component = await mount(ModelFields, { props: { chat: true } })
  await component.getByRole('button', { name: 'Model A', exact: true }).first().click()
  await page.getByRole('button', { name: '高', exact: true }).click()
  await expect(component.getByRole('button', { name: 'Model A 高', exact: true }).first()).toBeVisible()
  await page.getByRole('switch', { name: '查询', exact: true }).click()
  const events = JSON.parse(await component.getByTestId('events').innerText())
  expect(events.map((event: unknown[]) => event[0])).toEqual(['change', 'change'])
  expect(events.map((event: unknown[]) => event[1])).toEqual([
    {
      modelId: 'a',
      featureKey: 'mode',
      previous: 'off',
      next: 'high',
      featureValues: { mode: 'high', lookup: false, locked: false },
    },
    {
      modelId: 'a',
      featureKey: 'lookup',
      previous: false,
      next: true,
      featureValues: { mode: 'high', lookup: true, locked: false },
    },
  ])
  await page.getByRole('option', { name: 'Model B' }).click()
  await component.getByRole('button', { name: 'Model B', exact: true }).first().click()
  await page.getByRole('option', { name: 'Model A' }).click()
  await component.getByRole('button', { name: 'Model A 高', exact: true }).first().click()
  await expect(page.getByRole('switch', { name: '查询', exact: true })).toHaveAttribute('aria-checked', 'true')
  await expect(component.getByTestId('events')).toHaveText(JSON.stringify(events))
})

test('Chat keeps long trigger text inside the mobile toolbar', async ({ mount, page }) => {
  await page.setViewportSize({ width: 375, height: 850 })
  const component = await mount(ModelFields, { props: { chat: true, longTriggerText: true } })
  const trigger = component.locator('.tr-chat-model-selector .tr-model-selector__trigger')
  await trigger.click()
  await page.getByRole('button', { name: '高', exact: true }).click()
  await expect(trigger).toHaveAccessibleName(/自动生成参考链接/)
  const bounds = await trigger.evaluate((button) => ({
    right: button.getBoundingClientRect().right,
    viewport: window.innerWidth,
  }))
  expect(bounds.right).toBeLessThanOrEqual(bounds.viewport)
})

test('Chat disables a field while its asynchronous update is pending', async ({ mount, page }) => {
  const component = await mount(ModelFields, { props: { chat: true, pending: true } })
  await component.getByRole('button', { name: 'Model A', exact: true }).click()
  const lookup = page.getByRole('switch', { name: '查询', exact: true })
  await lookup.click()
  await expect(lookup).toBeDisabled()
  await expect(lookup).toHaveAttribute('aria-checked', 'false')
  await component.getByTestId('complete-pending-update').dispatchEvent('click')
  await expect(lookup).toBeEnabled()
  await expect(lookup).toHaveAttribute('aria-checked', 'true')
})

test('carries automatic fallbacks across model switches and preserves fields the model lacks', async ({
  mount,
  page,
}) => {
  const component = await mount(ModelFields, { props: { shared: true, uncontrolled: true } })
  await component.getByRole('button', { name: 'Model A', exact: true }).click()
  const selectModel = (id: string) => page.getByRole('option', { name: `Model ${id}`, exact: true }).click()
  const option = (name: string) => page.getByRole('button', { name, exact: true })
  const search = page.getByRole('switch', { name: '查询', exact: true })

  await search.click()
  await option('高').click()
  await selectModel('B')
  await expect(option('高')).toHaveAttribute('aria-pressed', 'true')
  await selectModel('A')
  await option('超高').click()
  await selectModel('B')
  await expect(option('低')).toHaveAttribute('aria-pressed', 'true')
  await expect(component.getByRole('button', { name: 'Model B 低' })).toHaveAttribute('title', 'Model B 低')
  await page.getByRole('switch', { name: '流式输出' }).click()
  await selectModel('A')
  await expect(option('低')).toHaveAttribute('aria-pressed', 'true')
  await expect(search).toHaveAttribute('aria-checked', 'true')

  await selectModel('B')
  await option('高').click()
  const events = JSON.parse(await component.getByTestId('events').innerText())
  expect(events.at(-1)).toEqual([
    'change',
    { modelId: 'b', featureValues: { mode: 'high', stream: true } },
    { modelId: 'b', featureValues: { mode: 'low', stream: true } },
  ])
  await selectModel('A')
  await expect(option('高')).toHaveAttribute('aria-pressed', 'true')
  await expect(search).toHaveAttribute('aria-checked', 'true')
})

test('model and feature interactions emit current and previous model snapshots', async ({ mount, page }) => {
  const component = await mount(ModelFields, { props: { shared: true, external: true } })
  await component.getByRole('button', { name: 'Model A 高', exact: true }).click()
  await page.getByRole('option', { name: 'Model B', exact: true }).click()
  await page.getByRole('button', { name: '低', exact: true }).click()

  expect(JSON.parse(await component.getByTestId('events').innerText())).toEqual([
    [
      'change',
      { modelId: 'b', featureValues: { mode: 'high', stream: false } },
      { modelId: 'a', featureValues: { mode: 'high', lookup: true, locked: false } },
    ],
    [
      'change',
      { modelId: 'b', featureValues: { mode: 'low', stream: false } },
      { modelId: 'b', featureValues: { mode: 'high', stream: false } },
    ],
  ])
})
