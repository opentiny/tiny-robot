import { expect, test } from '@playwright/experimental-ct-vue'
import SenderMultiInstanceFixture from './fixtures/SenderMultiInstance.fixture.vue'

test.describe('Sender instance isolation', () => {
  test('ISOLATION-01 keeps two Sender editor values independent', async ({ mount }) => {
    const component = await mount(SenderMultiInstanceFixture, { props: { scenario: 'content' } })
    const senderA = component.getByTestId('sender-a')
    const senderB = component.getByTestId('sender-b')

    await senderA.locator('.ProseMirror').pressSequentially('only A')
    await senderB.locator('.ProseMirror').pressSequentially('only B')
    await expect(component.getByTestId('value-a')).toHaveText('only A')
    await expect(component.getByTestId('value-b')).toHaveText('only B')
  })

  test('ISOLATION-02 keeps submit event counts and payloads on their own Sender', async ({ mount }) => {
    const component = await mount(SenderMultiInstanceFixture, { props: { scenario: 'events' } })
    const senderA = component.getByTestId('sender-a')
    const senderB = component.getByTestId('sender-b')

    await senderA.locator('.ProseMirror').pressSequentially('payload A')
    await senderB.locator('.ProseMirror').pressSequentially('payload B')
    await senderA.locator('.tr-sender-submit-button').click()
    await senderB.locator('.tr-sender-submit-button').click()

    await expect(component.getByTestId('submit-a')).toHaveText('1')
    await expect(component.getByTestId('submit-b')).toHaveText('1')
    await expect(component.getByTestId('last-submit-a')).toHaveText('["payload A",null]')
    await expect(component.getByTestId('last-submit-b')).toHaveText('["payload B",null]')
  })

  test('ISOLATION-03 keeps external attachment payloads on their own Sender', async ({ mount }) => {
    const component = await mount(SenderMultiInstanceFixture, { props: { scenario: 'external' } })
    const senderA = component.getByTestId('sender-a')
    const senderB = component.getByTestId('sender-b')

    await senderA.locator('.tr-sender-submit-button').click()
    await senderB.locator('.tr-sender-submit-button').click()
    await expect(component.getByTestId('last-submit-a')).toContainText('a-file')
    await expect(component.getByTestId('last-submit-b')).toContainText('b-file')
    await expect(component.getByTestId('last-submit-a')).not.toContainText('b-file')
    await expect(component.getByTestId('last-submit-b')).not.toContainText('a-file')
  })

  test('ISOLATION-04 keeps extension state and floating selection ownership per Sender', async ({ mount, page }) => {
    const component = await mount(SenderMultiInstanceFixture, { props: { scenario: 'extension' } })
    const senderA = component.getByTestId('sender-a')
    const senderB = component.getByTestId('sender-b')

    await senderA.locator('.template-select__trigger').first().click()
    await page.locator('.template-select__option').first().click()
    await senderB.locator('.template-select__trigger').first().click()
    await page.locator('.template-select__option').nth(1).click()

    await expect(senderA.locator('.template-select__text').first()).toHaveText('第一项')
    await expect(senderB.locator('.template-select__text').first()).toHaveText('第二项')
    await expect(senderA.locator('.template-select__dropdown')).toHaveCount(0)
    await expect(senderB.locator('.template-select__dropdown')).toHaveCount(0)
  })

  test('ISOLATION-05 clearing one Sender does not clear the other', async ({ mount }) => {
    const component = await mount(SenderMultiInstanceFixture, { props: { scenario: 'clear' } })
    const senderA = component.getByTestId('sender-a')
    const senderB = component.getByTestId('sender-b')

    await senderA.locator('.ProseMirror').pressSequentially('A')
    await senderB.locator('.ProseMirror').pressSequentially('B')
    await senderA.locator('.tr-action-buttons-group .tr-action-button').click()
    await expect(senderA.locator('.ProseMirror')).toHaveText('')
    await expect(senderB.locator('.ProseMirror')).toHaveText('B')
    await expect(component.getByTestId('clear-a')).toHaveText('1')
    await expect(component.getByTestId('clear-b')).toHaveText('0')
  })

  test('ISOLATION-06 removes an unmounted Sender floating layer and keeps the other mounted', async ({
    mount,
    page,
  }) => {
    const component = await mount(SenderMultiInstanceFixture, { props: { scenario: 'unmount' } })
    const senderB = component.getByTestId('sender-b')

    await senderB.locator('.template-select__trigger').first().click()
    await expect(page.locator('.template-select__dropdown')).toBeVisible()
    await component.getByTestId('unmount-second').click()
    await expect(component.getByTestId('sender-b-container')).toHaveCount(0)
    await expect(component.getByTestId('sender-a')).toBeVisible()
    await expect(page.locator('.template-select__dropdown')).toHaveCount(0)
  })
})
