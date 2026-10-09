import { expect, test } from '@playwright/experimental-ct-vue'
import AskUserInvalidFixture from './AskUserInvalid.fixture.vue'
import AskUserFixture from './AskUser.fixture.vue'
import AskUserMultipleFixture from './AskUserMultiple.fixture.vue'

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

    await expect(bubble.getByText('请填写项目配置，完成后提交。')).toBeVisible()
    await expect(bubble.getByRole('button', { name: '跳过' })).toBeVisible()
    await bubble.getByRole('button', { name: '跳过' }).click()

    await expect(bubble.getByRole('heading', { name: '框架' })).toBeVisible()
    await expect(component.getByTestId('last-event')).toHaveText('ask-user:step-change')
    await expect(component.getByTestId('last-step-id')).toHaveText('framework')
  })

  test('can submit after skipping a step', async ({ mount }) => {
    const component = await mount(AskUserFixture)
    const bubble = component.getByTestId('ask-user-bubble')

    await bubble.getByRole('button', { name: '跳过' }).click()
    await bubble.getByRole('button', { name: '提交' }).click()

    await expect(component.getByTestId('last-event')).toHaveText('ask-user:submit')
    await expect(bubble.locator('[aria-label="提交结果"]')).toContainText('项目名称：已跳过')
  })

  test('isolates state between multiple AskUser contents', async ({ mount }) => {
    const component = await mount(AskUserMultipleFixture)
    const askUsers = component.locator('[data-type="ask-user"]')

    await expect(askUsers).toHaveCount(2)
    await askUsers.nth(0).getByRole('button', { name: '跳过' }).click()

    await expect(askUsers.nth(1).getByRole('heading', { name: '第二个问题' })).toBeVisible()
    await expect(askUsers.nth(1).getByRole('button', { name: '跳过' })).toBeVisible()
  })

  test('assigns a legacy single state to only the first AskUser', async ({ mount }) => {
    const component = await mount(AskUserMultipleFixture, {
      props: {
        initialState: {
          askUser: {
            status: 'submitted',
            currentStep: 0,
            answers: { 'first-step': 'legacy answer' },
            completedStepIds: ['first-step'],
          },
        },
      },
    })
    const askUsers = component.locator('[data-type="ask-user"]')

    await expect(askUsers.nth(0).locator('[aria-label="提交结果"]')).toBeVisible()
    await expect(askUsers.nth(1).getByRole('button', { name: '跳过' })).toBeVisible()
  })

  test('isolates state between AskUser contents resolved by contentResolver', async ({ mount }) => {
    const component = await mount(AskUserMultipleFixture, { props: { useResolver: true } })
    const askUsers = component.locator('[data-type="ask-user"]')

    await expect(askUsers).toHaveCount(2)
    await askUsers.nth(0).getByRole('button', { name: '跳过' }).click()

    await expect(askUsers.nth(1).getByRole('heading', { name: '第二个问题' })).toBeVisible()
    await expect(askUsers.nth(1).getByRole('button', { name: '跳过' })).toBeVisible()
  })

  test('falls back for invalid AskUser content', async ({ mount }) => {
    const component = await mount(AskUserInvalidFixture)

    await expect(component.getByTestId('fallback-content-renderer')).toBeVisible()
    await expect(component.locator('[data-type="ask-user"]')).toHaveCount(0)
  })

  test('falls back for AskUser content with malformed steps', async ({ mount }) => {
    const component = await mount(AskUserInvalidFixture, { props: { malformed: true } })

    await expect(component.getByTestId('fallback-content-renderer')).toBeVisible()
    await expect(component.locator('[data-type="ask-user"]')).toHaveCount(0)
  })

  test('falls back for AskUser content with malformed options', async ({ mount }) => {
    const component = await mount(AskUserInvalidFixture, { props: { malformedOptions: true } })

    await expect(component.getByTestId('fallback-content-renderer')).toBeVisible()
    await expect(component.locator('[data-type="ask-user"]')).toHaveCount(0)
  })

  test('falls back for AskUser content with an empty step id', async ({ mount }) => {
    const component = await mount(AskUserInvalidFixture, { props: { emptyStepId: true } })

    await expect(component.getByTestId('fallback-content-renderer')).toBeVisible()
    await expect(component.locator('[data-type="ask-user"]')).toHaveCount(0)
  })

  test('falls back for AskUser content with duplicate step ids', async ({ mount }) => {
    const component = await mount(AskUserInvalidFixture, { props: { duplicateStepIds: true } })

    await expect(component.getByTestId('fallback-content-renderer')).toBeVisible()
    await expect(component.locator('[data-type="ask-user"]')).toHaveCount(0)
  })

  test('falls back for AskUser content with an empty content id', async ({ mount }) => {
    const component = await mount(AskUserInvalidFixture, { props: { emptyContentId: true } })

    await expect(component.getByTestId('fallback-content-renderer')).toBeVisible()
    await expect(component.locator('[data-type="ask-user"]')).toHaveCount(0)
  })

  test('falls back for AskUser contents with duplicate content ids', async ({ mount }) => {
    const component = await mount(AskUserInvalidFixture, { props: { duplicateContentIds: true } })

    await expect(component.getByTestId('fallback-content-renderer')).toHaveCount(2)
    await expect(component.locator('[data-type="ask-user"]')).toHaveCount(0)
  })
})
