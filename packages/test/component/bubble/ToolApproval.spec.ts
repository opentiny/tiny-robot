import { expect, test } from '@playwright/experimental-ct-vue'
import ToolApprovalFixture from './ToolApproval.fixture.vue'

test.describe('Tool approval renderer', () => {
  test('should show approval actions only when a tool awaits approval', async ({ mount }) => {
    const component = await mount(ToolApprovalFixture)
    const approvalBubble = component.getByTestId('approval-bubble')
    const completedBubble = component.getByTestId('completed-bubble')

    await expect(approvalBubble.getByRole('button', { name: '同意' })).toBeVisible()
    await expect(approvalBubble.getByRole('button', { name: '拒绝' })).toBeVisible()
    await expect(completedBubble.getByRole('button', { name: '同意' })).toHaveCount(0)
    await expect(completedBubble.getByRole('button', { name: '拒绝' })).toHaveCount(0)
  })

  test('should emit a resume event with the tool call id when approval is accepted', async ({ mount }) => {
    const component = await mount(ToolApprovalFixture)
    const approvalBubble = component.getByTestId('approval-bubble')

    await approvalBubble.getByRole('button', { name: '同意' }).click()

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
})
