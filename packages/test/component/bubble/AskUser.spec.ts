import { expect, test } from '@playwright/experimental-ct-vue'
import AskUserInvalidFixture from './AskUserInvalid.fixture.vue'
import AskUserFixture from './AskUser.fixture.vue'
import AskUserMultipleFixture from './AskUserMultiple.fixture.vue'
import AskUserRadioIsolationFixture from './AskUserRadioIsolation.fixture.vue'
import AskUserToolCallFixture from './AskUserToolCall.fixture.vue'

test.describe('AskUser renderer', () => {
  test('focuses the custom answer input after selecting other', async ({ mount }) => {
    const component = await mount(AskUserFixture, { props: { withOther: true } })
    const bubble = component.getByTestId('ask-user-bubble')
    await bubble.getByRole('button', { name: '下一步' }).click()

    await bubble.getByText('其他', { exact: true }).click()

    await expect(bubble.locator('.tr-bubble__ask-user-other-input')).toBeFocused()
  })

  test('renders AskUser directly from tool_calls when content is omitted', async ({ mount }) => {
    const component = await mount(AskUserToolCallFixture)
    const bubble = component.getByTestId('ask-user-tool-call-bubble')

    await expect(bubble.getByRole('heading', { name: '工具调用问题', exact: true })).toBeVisible()
    await expect(bubble.getByRole('radio', { name: '预发布' })).toBeVisible()
    await expect(bubble.getByRole('button', { name: '跳过' })).toHaveCount(0)
    await expect(bubble.getByRole('button', { name: '下一步' })).toHaveCount(0)
    await expect(bubble.getByRole('button', { name: '提交' })).toBeVisible()
    await bubble.getByText('生产', { exact: true }).click()
    await expect(bubble.getByRole('radio', { name: '生产' })).toBeChecked()
    await bubble.getByRole('button', { name: '提交' }).click()

    await expect(bubble.locator('[aria-label="提交结果"]')).toContainText('生产')
  })

  test('does not duplicate AskUser when content and an ask_user tool call coexist', async ({ mount }) => {
    const component = await mount(AskUserToolCallFixture, { props: { withText: true } })
    const bubble = component.getByTestId('ask-user-tool-call-bubble')

    await expect(bubble).toContainText('请确认模型返回的发布环境。')
    await expect(bubble.locator('[data-type="ask-user"]')).toHaveCount(1)
  })

  test('renders each ask_user tool call once', async ({ mount }) => {
    const component = await mount(AskUserToolCallFixture, { props: { askUserCount: 2 } })
    const bubble = component.getByTestId('ask-user-tool-call-bubble')

    await expect(bubble.locator('[data-type="ask-user"]')).toHaveCount(2)
    await expect(bubble.getByRole('heading', { name: '工具调用问题', exact: true })).toBeVisible()
    await expect(bubble.getByRole('heading', { name: '工具调用问题 2' })).toBeVisible()
  })

  test('renders an ask_user tool call once in BubbleList', async ({ mount }) => {
    const component = await mount(AskUserToolCallFixture, { props: { inList: true, withText: true } })
    const list = component.getByTestId('ask-user-tool-call-list')

    await expect(list).toContainText('请确认模型返回的发布环境。')
    await expect(list.locator('[data-type="ask-user"]')).toHaveCount(1)
  })

  test('forwards content attributes to AskUser rendered from a tool call', async ({ mount }) => {
    const component = await mount(AskUserToolCallFixture, { props: { withContentAttributes: true } })

    await expect(component.getByTestId('synthetic-ask-user')).toHaveAttribute('data-type', 'ask-user')
  })

  test('does not duplicate content attributes when AskUser and ordinary tools render together', async ({ mount }) => {
    const component = await mount(AskUserToolCallFixture, {
      props: { withContentAttributes: true, withOrdinaryTool: true },
    })
    const bubble = component.getByTestId('ask-user-tool-call-bubble')

    await expect(bubble.getByTestId('synthetic-ask-user')).toHaveCount(1)
    await expect(bubble.locator('.tr-bubble__tools')).not.toHaveAttribute('data-testid')
    await expect(bubble.locator('[data-type="tool-call"]')).toHaveCount(1)
  })

  test('shows malformed ask_user calls in the tool list', async ({ mount }) => {
    const component = await mount(AskUserToolCallFixture, { props: { malformedAskUser: true } })
    const bubble = component.getByTestId('ask-user-tool-call-bubble')

    await expect(bubble.locator('[data-type="ask-user"]')).toHaveCount(0)
    await expect(bubble.locator('[data-type="tool-call"]')).toHaveCount(1)
    await expect(bubble.locator('[data-type="tool-call"] .title')).toHaveText('ask_user')
  })

  test('preserves an unsubmitted draft when equivalent state is replaced', async ({ mount }) => {
    const component = await mount(AskUserFixture)
    const bubble = component.getByTestId('ask-user-bubble')
    const textarea = bubble.getByRole('textbox')

    await textarea.fill('draft project')
    await component.getByTestId('replace-state').click()

    await expect(textarea).toHaveValue('draft project')
  })

  test('uses question summaries in progress while showing the full question below', async ({ mount }) => {
    const component = await mount(AskUserFixture)
    const bubble = component.getByTestId('ask-user-bubble')

    await expect(bubble.locator('.tr-bubble__ask-user-progress-label')).toHaveText(['项目名称', '技术选型'])
    await expect(bubble.getByRole('heading', { name: '请输入项目名称。' })).toBeVisible()

    await bubble.getByRole('button', { name: '下一步' }).click()
    await expect(bubble.getByRole('heading', { name: '请选择前端框架。' })).toBeVisible()
  })

  test('skip ends the interaction, preserves entered answers, and skips unanswered steps', async ({ mount }) => {
    const component = await mount(AskUserFixture)
    const bubble = component.getByTestId('ask-user-bubble')

    await expect(bubble.getByRole('heading', { name: '项目配置' })).toBeVisible()
    await bubble.getByRole('textbox').fill('OpenTiny')
    await bubble.getByRole('button', { name: '跳过' }).click()

    await expect(component.getByTestId('last-event')).toHaveText('ask-user:submit')
    await expect(bubble.locator('[aria-label="提交结果"]')).toContainText('请输入项目名称。：OpenTiny')
    await expect(bubble.locator('[aria-label="提交结果"]')).toContainText('请选择前端框架。：已跳过')
  })

  test('can submit unanswered steps after advancing', async ({ mount }) => {
    const component = await mount(AskUserFixture)
    const bubble = component.getByTestId('ask-user-bubble')

    await expect(bubble.getByRole('button', { name: '跳过' })).toBeVisible()
    await expect(bubble.getByRole('button', { name: '下一步' })).toBeVisible()
    await expect(bubble.getByRole('button', { name: '提交' })).toHaveCount(0)
    await bubble.getByRole('button', { name: '下一步' }).click()
    await expect(bubble.getByRole('button', { name: '下一步' })).toHaveCount(0)
    await expect(bubble.getByRole('button', { name: '提交' })).toBeVisible()
    await expect(bubble.getByRole('button', { name: '跳过' })).toBeVisible()
    await bubble.getByRole('button', { name: '提交' }).click()

    await expect(component.getByTestId('last-event')).toHaveText('ask-user:submit')
    await expect(bubble.locator('[aria-label="提交结果"]')).toContainText('请输入项目名称。：已跳过')
    await expect(bubble.locator('[aria-label="提交结果"]')).toContainText('请选择前端框架。：已跳过')
  })

  test('skip on the last step preserves its answer and submits the interaction', async ({ mount }) => {
    const component = await mount(AskUserFixture)
    const bubble = component.getByTestId('ask-user-bubble')

    await bubble.getByRole('button', { name: '下一步' }).click()
    await bubble.getByText('Vue', { exact: true }).click()
    await expect(bubble.getByRole('radio', { name: 'Vue' })).toBeChecked()
    await bubble.getByRole('button', { name: '跳过' }).click()

    await expect(component.getByTestId('last-event')).toHaveText('ask-user:submit')
    await expect(bubble.locator('[aria-label="提交结果"]')).toContainText('请输入项目名称。：已跳过')
    await expect(bubble.locator('[aria-label="提交结果"]')).toContainText('请选择前端框架。：Vue')
  })

  test('removes the back button while keeping progress navigation', async ({ mount }) => {
    const component = await mount(AskUserFixture)
    const bubble = component.getByTestId('ask-user-bubble')
    const textarea = bubble.getByRole('textbox')

    await textarea.fill('OpenTiny')
    await bubble.getByRole('button', { name: '下一步' }).click()

    await expect(bubble.getByRole('button', { name: '上一步' })).toHaveCount(0)
    await bubble.locator('.tr-bubble__ask-user-progress-step').first().click()
    await expect(bubble.getByRole('heading', { name: '项目配置' })).toBeVisible()
    await expect(textarea).toHaveValue('OpenTiny')
  })

  test('hides retry for non-retryable errors', async ({ mount }) => {
    const component = await mount(AskUserFixture, {
      props: {
        initialState: {
          askUser: {
            status: 'error',
            currentStep: 0,
            answers: {},
            completedStepIds: [],
            error: '请求已取消',
            retryable: false,
          },
        },
      },
    })

    await expect(component.getByRole('alert')).toContainText('请求已取消')
    await expect(component.getByRole('button', { name: '重试' })).toHaveCount(0)
  })

  test('isolates state between multiple AskUser contents', async ({ mount }) => {
    const component = await mount(AskUserMultipleFixture)
    const askUsers = component.locator('[data-type="ask-user"]')

    await expect(askUsers).toHaveCount(2)
    await askUsers.nth(0).getByRole('button', { name: '提交' }).click()

    await expect(askUsers.nth(0).locator('[aria-label="提交结果"]')).toBeVisible()
    await expect(askUsers.nth(1).getByRole('heading', { name: '第二个问题' })).toBeVisible()
    await expect(askUsers.nth(1).getByRole('button', { name: '提交' })).toBeVisible()
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
    await expect(askUsers.nth(1).getByRole('button', { name: '提交' })).toBeVisible()
  })

  test('isolates state between AskUser contents resolved by contentResolver', async ({ mount }) => {
    const component = await mount(AskUserMultipleFixture, { props: { useResolver: true } })
    const askUsers = component.locator('[data-type="ask-user"]')

    await expect(askUsers).toHaveCount(2)
    await askUsers.nth(0).getByRole('button', { name: '提交' }).click()

    await expect(askUsers.nth(0).locator('[aria-label="提交结果"]')).toBeVisible()
    await expect(askUsers.nth(1).getByRole('heading', { name: '第二个问题' })).toBeVisible()
    await expect(askUsers.nth(1).getByRole('button', { name: '提交' })).toBeVisible()
  })

  test('isolates radio groups between AskUser renderer instances', async ({ mount }) => {
    const component = await mount(AskUserRadioIsolationFixture)
    const askUsers = component.locator('[data-type="ask-user"]')

    await askUsers.nth(0).getByText('Vue', { exact: true }).click()
    await askUsers.nth(1).getByText('React', { exact: true }).click()

    await expect(askUsers.nth(0).getByRole('radio', { name: 'Vue' })).toBeChecked()
    await expect(askUsers.nth(1).getByRole('radio', { name: 'React' })).toBeChecked()
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

  test('falls back for AskUser content with duplicate normalized option labels', async ({ mount }) => {
    const component = await mount(AskUserInvalidFixture, { props: { duplicateOptionLabels: true } })

    await expect(component.getByTestId('fallback-content-renderer')).toBeVisible()
    await expect(component.locator('[data-type="ask-user"]')).toHaveCount(0)
  })

  test('falls back for AskUser content with a question id outside the Kit protocol', async ({ mount }) => {
    const component = await mount(AskUserInvalidFixture, { props: { unsafeQuestionId: true } })

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

  test('falls back when a generated AskUser id collides with an explicit content id', async ({ mount }) => {
    const component = await mount(AskUserInvalidFixture, { props: { generatedIdCollision: true } })

    await expect(component.getByTestId('fallback-content-renderer')).toHaveCount(2)
    await expect(component.locator('[data-type="ask-user"]')).toHaveCount(0)
  })

  test('falls back for AskUser content without steps', async ({ mount }) => {
    const component = await mount(AskUserInvalidFixture, { props: { emptySteps: true } })

    await expect(component.getByTestId('fallback-content-renderer')).toBeVisible()
    await expect(component.locator('[data-type="ask-user"]')).toHaveCount(0)
  })
})
