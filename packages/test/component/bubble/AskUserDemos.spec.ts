import { expect, test } from '@playwright/experimental-ct-vue'
import AskUserChoiceDemo from '../../../../docs/demos/bubble/ask-user-choice.vue'
import AskUserMultipleDemo from '../../../../docs/demos/bubble/ask-user-multiple.vue'
import AskUserTextConfirmDemo from '../../../../docs/demos/bubble/ask-user-text-confirm.vue'

test.describe('AskUser demos', () => {
  test('starts a new single-choice interaction after submission', async ({ mount }) => {
    const component = await mount(AskUserChoiceDemo)
    const askUser = component.locator('[data-type="ask-user"]')
    const relaunchButton = component.getByRole('button', { name: '再次发起' })

    await expect(relaunchButton).toBeDisabled()

    await askUser.getByText('预发布环境', { exact: true }).click()
    await askUser.getByRole('button', { name: '提交' }).click()
    await expect(askUser.locator('[aria-label="提交结果"]')).toContainText('预发布环境')

    await expect(relaunchButton).toBeEnabled()
    await relaunchButton.click()

    await expect(askUser.getByRole('radio', { name: '预发布环境' })).not.toBeChecked()
    await expect(askUser.getByRole('button', { name: '提交' })).toBeVisible()
  })

  test('starts a new multiple-choice interaction after submission', async ({ mount }) => {
    const component = await mount(AskUserMultipleDemo)
    const askUser = component.locator('[data-type="ask-user"]')
    const relaunchButton = component.getByRole('button', { name: '再次发起' })

    await expect(relaunchButton).toBeDisabled()

    await askUser.getByText('订单服务', { exact: true }).click()
    await askUser.getByText('支付服务', { exact: true }).click()
    await askUser.getByRole('button', { name: '提交' }).click()
    await expect(askUser.locator('[aria-label="提交结果"]')).toContainText('订单服务、支付服务')

    await expect(relaunchButton).toBeEnabled()
    await relaunchButton.click()

    await expect(askUser.getByRole('checkbox', { name: '订单服务' })).not.toBeChecked()
    await expect(askUser.getByRole('checkbox', { name: '支付服务' })).not.toBeChecked()
  })

  test('relaunches a text interaction at the first question', async ({ mount }) => {
    const component = await mount(AskUserTextConfirmDemo)
    const askUser = component.locator('[data-type="ask-user"]')
    const textbox = askUser.getByRole('textbox')
    const relaunchButton = component.getByRole('button', { name: '再次发起' })

    await expect(relaunchButton).toBeDisabled()

    await textbox.fill('降低发布风险')
    await askUser.getByRole('button', { name: '下一步' }).click()
    await expect(askUser.getByRole('radio', { name: '需要', exact: true })).toBeVisible()
    await expect(relaunchButton).toBeDisabled()
    await askUser.getByText('需要', { exact: true }).click()
    await askUser.getByRole('button', { name: '提交' }).click()
    await expect(relaunchButton).toBeEnabled()

    await relaunchButton.click()

    await expect(askUser.getByRole('heading', { name: '请简要说明本次变更的目的。' })).toBeVisible()
    await expect(textbox).toHaveValue('')
  })
})
