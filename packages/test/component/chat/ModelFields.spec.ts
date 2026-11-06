import { expect, test } from '@playwright/experimental-ct-vue'
import ModelFields from './ModelFields.fixture.vue'

test('renders defaults, validates operations and emits ordered independent snapshots', async ({ mount, page }) => {
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
    ['update', { mode: 'high', lookup: false, locked: false }],
    [
      'change',
      {
        modelId: 'a',
        key: 'mode',
        previousValue: 'off',
        value: 'high',
        values: { mode: 'high', lookup: false, locked: false },
      },
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
  expect(events[1][1].values.lookup).toBe(false)
  expect(events[3][1].values.lookup).toBe(true)
})

test('external values, model changes and controlled rejection do not emit changes', async ({ mount, page }) => {
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
  await expect(component.getByTestId('events')).toHaveText(events)
  await component.update({ props: { external: true, modelId: 'a', accept: false } })
  await expect(page.getByRole('switch', { name: '查询', exact: true })).toHaveAttribute('aria-checked', 'true')
  await expect(component.getByTestId('events')).toHaveText(events)
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
  expect(JSON.parse(events)[1][1]).toMatchObject({ key: 'lookup', value: true })
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
      key: 'mode',
      previousValue: 'off',
      value: 'high',
      values: { mode: 'high', lookup: false, locked: false },
    },
    {
      modelId: 'a',
      key: 'lookup',
      previousValue: false,
      value: true,
      values: { mode: 'high', lookup: true, locked: false },
    },
  ])
  await page.getByRole('option', { name: 'Model B' }).click()
  await component.getByRole('button', { name: 'Model B', exact: true }).first().click()
  await page.getByRole('option', { name: 'Model A' }).click()
  await component.getByRole('button', { name: 'Model A 高', exact: true }).first().click()
  await expect(page.getByRole('switch', { name: '查询', exact: true })).toHaveAttribute('aria-checked', 'true')
  await expect(component.getByTestId('events')).toHaveText(JSON.stringify(events))
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
