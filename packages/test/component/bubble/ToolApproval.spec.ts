import { expect, test } from '@playwright/experimental-ct-vue'
import ToolApprovalFixture from './ToolApproval.fixture.vue'

test.describe('Tool approval renderer', () => {
  test('should show approval actions only when a tool awaits approval', async ({ mount }) => {
    const component = await mount(ToolApprovalFixture)
    const approvalBubble = component.getByTestId('approval-bubble')
    const completedBubble = component.getByTestId('completed-bubble')

    await expect(approvalBubble.getByRole('button', { name: '允许' })).toBeVisible()
    await expect(approvalBubble.getByRole('button', { name: '拒绝' })).toBeVisible()
    await expect(completedBubble.getByRole('button', { name: '允许' })).toHaveCount(0)
    await expect(completedBubble.getByRole('button', { name: '拒绝' })).toHaveCount(0)
  })

  test('should emit a resume event with the tool call id when approval is accepted', async ({ mount }) => {
    const component = await mount(ToolApprovalFixture)
    const approvalBubble = component.getByTestId('approval-bubble')

    await approvalBubble.getByRole('button', { name: '允许' }).click()

    await expect(component.getByTestId('last-event')).toHaveText(
      JSON.stringify({
        name: 'tool-call:resume',
        payload: { toolCallId: 'call-tool-approval-test' },
        contentIndex: 0,
        messageIndex: 0,
      }),
    )
  })

  test('should emit a reject event with the tool call id when approval is declined', async ({ mount }) => {
    const component = await mount(ToolApprovalFixture)

    await component.getByTestId('approval-bubble').getByRole('button', { name: '拒绝' }).click()

    await expect(component.getByTestId('last-event')).toHaveText(
      JSON.stringify({
        name: 'tool-call:reject',
        payload: { toolCallId: 'call-tool-approval-test' },
        contentIndex: 0,
        messageIndex: 0,
      }),
    )
  })

  test('approval buttons should follow TinyRobot light and dark color tokens', async ({ mount }) => {
    const component = await mount(ToolApprovalFixture)
    const approvalBubble = component.getByTestId('approval-bubble')
    const resumeButton = approvalBubble.getByRole('button', { name: '允许' })
    const rejectButton = approvalBubble.getByRole('button', { name: '拒绝' })
    const getToken = (button: typeof resumeButton, token: string) =>
      button.evaluate((element, name) => getComputedStyle(element).getPropertyValue(name).trim(), token)

    const lightPrimary = await getToken(resumeButton, '--tv-Button-bg-color-primary')
    const lightThemeText = await getToken(resumeButton, '--tr-text-primary')
    expect(lightPrimary).toBe(lightThemeText)
    expect(await getToken(rejectButton, '--tv-Button-bg-color-default')).toBe(
      await getToken(rejectButton, '--tr-container-bg-default'),
    )

    await approvalBubble.evaluate((element) => element.setAttribute('data-tr-color-mode', 'dark'))

    const darkPrimary = await getToken(resumeButton, '--tv-Button-bg-color-primary')
    expect(darkPrimary).toBe(await getToken(resumeButton, '--tr-text-primary'))
    expect(darkPrimary).not.toBe(lightPrimary)
    expect(await getToken(rejectButton, '--tv-Button-bg-color-default')).toBe(
      await getToken(rejectButton, '--tr-container-bg-default'),
    )
  })
})
