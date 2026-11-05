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
    expect(await getToken(resumeButton, '--tv-Button-bg-color-active-primary')).toBe(
      await getToken(resumeButton, '--tr-text-secondary'),
    )
    expect(await getToken(rejectButton, '--tv-Button-bg-color-default')).toBe(
      await getToken(rejectButton, '--tr-container-bg-default'),
    )

    const getResolvedTokenColor = (button: typeof resumeButton, token: string) =>
      button.evaluate((element, name) => {
        const probe = document.createElement('span')
        probe.style.color = getComputedStyle(element).getPropertyValue(name)
        document.body.append(probe)
        const color = getComputedStyle(probe).color
        probe.remove()
        return color
      }, token)

    await resumeButton.hover()
    const lightHoverColor = await resumeButton.evaluate((element) => getComputedStyle(element).backgroundColor)
    expect(lightHoverColor).not.toBe(await getResolvedTokenColor(resumeButton, '--tr-color-primary'))

    await approvalBubble.evaluate((element) => element.setAttribute('data-tr-color-mode', 'dark'))

    const darkPrimary = await getToken(resumeButton, '--tv-Button-bg-color-primary')
    expect(darkPrimary).toBe(await getToken(resumeButton, '--tr-text-primary'))
    expect(darkPrimary).not.toBe(lightPrimary)
    expect(await getToken(resumeButton, '--tv-Button-bg-color-active-primary')).toBe(
      await getToken(resumeButton, '--tr-text-secondary'),
    )
    expect(await getToken(rejectButton, '--tv-Button-bg-color-default')).toBe(
      await getToken(rejectButton, '--tr-container-bg-default'),
    )

    const darkPrimaryColor = await getResolvedTokenColor(resumeButton, '--tr-color-primary')
    await resumeButton.hover()
    const darkHoverColor = await resumeButton.evaluate((element) => getComputedStyle(element).backgroundColor)
    expect(darkHoverColor).not.toBe(darkPrimaryColor)
  })

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
