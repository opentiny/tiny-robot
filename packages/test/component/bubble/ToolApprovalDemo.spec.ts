import { expect, test } from '@playwright/experimental-ct-vue'
import ToolApprovalDemo from '../../../../docs/demos/bubble/tool-approval.vue'

test.describe('Bubble tool approval demo', () => {
  test('can replay after approval and complete a rejection flow', async ({ mount }) => {
    const component = await mount(ToolApprovalDemo)

    await expect(component.getByRole('button', { name: '允许' })).toBeVisible()
    await component.getByRole('button', { name: '允许' }).click()
    await expect(component.getByRole('status')).toHaveText('审批流程完成，可再次发起')

    await expect(component.getByRole('button', { name: '再次发起审批' })).toBeVisible()
    await expect(
      component.locator('.tool-approval-demo__messages').getByRole('button', { name: '再次发起审批' }),
    ).toHaveCount(0)
    await component.getByRole('button', { name: '再次发起审批' }).click()
    await expect(component.getByRole('button', { name: '拒绝' })).toBeVisible()
    await component.getByRole('button', { name: '拒绝' }).click()

    await expect(component.getByRole('status')).toHaveText('审批流程完成，可再次发起')
    await expect(component).toContainText('你已拒绝发送邮件，邮件未发送。')
  })
})
