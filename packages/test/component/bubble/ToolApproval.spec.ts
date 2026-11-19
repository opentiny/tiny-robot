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

  for (const scope of ['page', 'bubble'] as const) {
    test(`approval buttons render contrasting colors when the ${scope} theme changes`, async ({ mount, page }) => {
      const component = await mount(ToolApprovalFixture)
      const approvalBubble = component.getByTestId('approval-bubble')
      const resumeButton = approvalBubble.getByRole('button', { name: '允许' })
      const rejectButton = approvalBubble.getByRole('button', { name: '拒绝' })
      const themeTarget = scope === 'page' ? page.locator('html') : approvalBubble

      for (const mode of ['light', 'dark', 'light'] as const) {
        const colors =
          mode === 'dark'
            ? {
                primary: 'rgb(255, 255, 255)',
                onPrimary: 'rgb(25, 25, 25)',
                primaryHover: 'rgb(230, 230, 230)',
                default: 'rgb(25, 25, 25)',
                onDefault: 'rgb(255, 255, 255)',
                defaultHover: 'rgb(51, 51, 51)',
              }
            : {
                primary: 'rgb(25, 25, 25)',
                onPrimary: 'rgb(255, 255, 255)',
                primaryHover: 'rgb(89, 89, 89)',
                default: 'rgb(255, 255, 255)',
                onDefault: 'rgb(25, 25, 25)',
                defaultHover: 'rgb(245, 245, 245)',
              }

        await themeTarget.evaluate((element, value) => element.setAttribute('data-tr-color-mode', value), mode)
        await page.mouse.move(0, 0)
        await expect(resumeButton).toHaveCSS('background-color', colors.primary)
        await expect(resumeButton).toHaveCSS('color', colors.onPrimary)
        await expect(resumeButton).toHaveCSS('border-top-color', colors.primary)
        await expect(rejectButton).toHaveCSS('background-color', colors.default)
        await expect(rejectButton).toHaveCSS('color', colors.onDefault)

        await resumeButton.hover()
        await expect(resumeButton).toHaveCSS('background-color', colors.primaryHover)
        await expect(resumeButton).toHaveCSS('color', colors.onPrimary)
        await rejectButton.hover()
        await expect(rejectButton).toHaveCSS('background-color', colors.defaultHover)
        await expect(rejectButton).toHaveCSS('color', colors.onDefault)
      }
    })
  }

  test('shows a theme-aware focus ring when navigating approval buttons with the keyboard', async ({ mount, page }) => {
    const component = await mount(ToolApprovalFixture)
    const approvalBubble = component.getByTestId('approval-bubble')
    const resumeButton = approvalBubble.locator('.tool-actions .tiny-button--primary')
    const rejectButton = approvalBubble.locator('.tool-actions .tiny-button--default')
    const getThemeColor = (button: typeof rejectButton) =>
      button.evaluate((element) => {
        const probe = document.createElement('span')
        probe.style.color = getComputedStyle(element).getPropertyValue('--tr-text-primary')
        document.body.append(probe)
        const color = getComputedStyle(probe).color
        probe.remove()
        return color
      })

    await page.keyboard.press('Tab')
    await expect(resumeButton).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(rejectButton).toBeFocused()
    expect(await rejectButton.evaluate((element) => element.matches(':focus-visible'))).toBe(true)
    await expect(rejectButton).toHaveCSS('outline-style', 'solid')
    await expect(rejectButton).toHaveCSS('outline-width', '2px')
    await expect(rejectButton).toHaveCSS('outline-color', await getThemeColor(rejectButton))

    await approvalBubble.evaluate((element) => element.setAttribute('data-tr-color-mode', 'dark'))
    await page.keyboard.press('Shift+Tab')
    await expect(resumeButton).toBeFocused()
    await page.keyboard.press('Tab')
    await expect(rejectButton).toBeFocused()
    expect(await rejectButton.evaluate((element) => element.matches(':focus-visible'))).toBe(true)
    await expect(rejectButton).toHaveCSS('outline-color', await getThemeColor(rejectButton))
  })
})
