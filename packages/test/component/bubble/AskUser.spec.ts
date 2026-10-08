import { expect, test } from '@playwright/experimental-ct-vue'
import AskUserFixture from './AskUser.fixture.vue'

test.describe('AskUser renderer', () => {
  test('preserves an unsubmitted draft when equivalent state is replaced', async ({ mount }) => {
    const component = await mount(AskUserFixture)
    const bubble = component.getByTestId('ask-user-bubble')
    const textarea = bubble.getByRole('textbox')

    await textarea.fill('draft project')
    await component.getByTestId('replace-state').click()

    await expect(textarea).toHaveValue('draft project')
  })

  test('allows an optional step to be skipped', async ({ mount }) => {
    const component = await mount(AskUserFixture)
    const bubble = component.getByTestId('ask-user-bubble')

    await expect(bubble.getByRole('button', { name: '跳过' })).toBeVisible()
    await bubble.getByRole('button', { name: '跳过' }).click()

    await expect(bubble.getByRole('heading', { name: '框架' })).toBeVisible()
    await expect(component.getByTestId('last-event')).toHaveText('ask-user:step-change')
  })

  test('can submit after skipping a step', async ({ mount }) => {
    const component = await mount(AskUserFixture)
    const bubble = component.getByTestId('ask-user-bubble')

    await bubble.getByRole('button', { name: '跳过' }).click()
    await bubble.getByRole('button', { name: '提交' }).click()

    await expect(component.getByTestId('last-event')).toHaveText('ask-user:submit')
    await expect(bubble.locator('[aria-label="提交结果"]')).toContainText('项目名称：已跳过')
  })
})
