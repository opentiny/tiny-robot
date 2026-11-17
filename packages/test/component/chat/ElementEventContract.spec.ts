import { expect, test } from '@playwright/experimental-ct-vue'
import Contract from './ElementEventContract.fixture.vue'

test('ready is a no-argument DOM event', async ({ mount }) => {
  const c = await mount(Contract)
  await expect(c.getByTestId('last-element-event')).toHaveText(JSON.stringify({ name: 'ready', detail: [] }))
})

for (const [button, name, detail] of [
  ['No arguments', 'empty', []],
  ['String argument', 'text', ['message']],
  ['Object argument', 'object', [{ text: 'message' }]],
  ['Array argument', 'array', [['A', 'B']]],
  ['Multiple arguments', 'multiple', ['message', 42, { source: 'test' }]],
  ['Update argument', 'sample-value-update', ['next']],
] as const) {
  test(`element events preserve the argument tuple: ${button}`, async ({ mount }) => {
    const c = await mount(Contract)
    await c.getByRole('button', { name: button, exact: true }).click()
    await expect(c.getByTestId('last-element-event')).toHaveText(JSON.stringify({ name, detail }))
  })
}

test('DOM 事件载荷中的业务取消方法保持可调用', async ({ mount }) => {
  const component = await mount(Contract)
  await component.getByRole('button', { name: 'Object argument', exact: true }).click()
  await expect(component.getByTestId('business-cancelled')).toHaveText('已取消')
})
