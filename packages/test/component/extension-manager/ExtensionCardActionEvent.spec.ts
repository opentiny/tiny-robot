import { expect, test } from '@playwright/experimental-ct-vue'
import ExtensionCardActionEventFixture from './ExtensionCardActionEvent.fixture.vue'

test.describe('standalone ExtensionCard action events', () => {
  test('emits a controlled switch event with the resulting checked value', async ({ mount }) => {
    const component = await mount(ExtensionCardActionEventFixture)
    const toggle = component.getByRole('checkbox', { name: '扩展开关' })

    await expect(toggle).toBeChecked()
    await component.locator('.tr-extension-card-primary-actions__switch-track').click()
    await expect(toggle).not.toBeChecked()
    await expect(component.getByTestId('event-id')).toHaveText('toggle-extension')
    await expect(component.getByTestId('event-type')).toHaveText('switch')
    await expect(component.getByTestId('event-checked')).toHaveText('false')
  })

  test('emits a button action with its presentation type', async ({ mount }) => {
    const component = await mount(ExtensionCardActionEventFixture)

    await component.getByRole('button', { name: '安装' }).click()
    await expect(component.getByTestId('event-id')).toHaveText('install-extension')
    await expect(component.getByTestId('event-type')).toHaveText('button')
  })

  test('emits a custom primary action with its payload', async ({ mount }) => {
    const component = await mount(ExtensionCardActionEventFixture)

    await component.getByRole('button', { name: '检查' }).click()
    await expect(component.getByTestId('event-id')).toHaveText('inspect-extension')
    await expect(component.getByTestId('event-type')).toHaveText('custom')
    await expect(component.getByTestId('event-payload')).toHaveText('{"origin":"fixture"}')
  })

  test('emits an overflow action through the same event shape', async ({ mount }) => {
    const component = await mount(ExtensionCardActionEventFixture)

    await component.getByRole('button', { name: '扩展操作菜单' }).click()
    await component.getByRole('button', { name: '删除' }).click()
    await expect(component.getByTestId('event-id')).toHaveText('delete-extension')
    await expect(component.getByTestId('event-type')).toHaveText('button')
  })
})
