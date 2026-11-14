import { expect, test } from '@playwright/experimental-ct-vue'
import type { Locator } from '@playwright/test'
import SenderContentRegistrationFixture from './fixtures/SenderContentRegistration.fixture.vue'

async function removeDefaultExternalSources(component: { getByTestId: (id: string) => Locator }): Promise<void> {
  await component.getByTestId('toggle-attachments').click()
  await component.getByTestId('toggle-registration-a').click()
}

test.describe('Sender external content registration', () => {
  test('EXT-01 allows hasExternalContent to submit empty editor text without a clear button', async ({ mount }) => {
    const component = await mount(SenderContentRegistrationFixture)
    await removeDefaultExternalSources(component)
    await component.getByTestId('toggle-has-external').click()

    await expect(component.getByTestId('sender-root').locator('.tr-sender-submit-button')).toBeVisible()
    await expect(
      component.getByTestId('sender-root').locator('.tr-action-buttons-group .tr-action-button'),
    ).toHaveCount(0)
    await component.getByTestId('sender-root').locator('.tr-sender-submit-button').click()
    await expect(component.getByTestId('last-submit')).toHaveText('["",null]')
  })

  test('COMPACT-EXT-EMPTY submits a Ref string then excludes empty string array and object', async ({ mount }) => {
    const component = await mount(SenderContentRegistrationFixture)
    await component.getByTestId('toggle-attachments').click()
    await expect(component.getByTestId('registration-a')).toBeVisible()
    await expect(component.getByTestId('sender-root').locator('.tr-sender-submit-button')).toBeVisible()
    await component.getByTestId('sender-root').locator('.tr-sender-submit-button').click()
    await expect(component.getByTestId('last-submit')).toHaveText(
      '["",null,{"externalPayloads":[{"source":"source-a","payload":"registered"}]}]',
    )

    await component.getByTestId('set-mode-a-empty').click()
    await expect(component.getByTestId('sender-root').locator('.tr-sender-submit-button')).toHaveCount(0)
    await component.getByTestId('set-mode-a-array-empty').click()
    await expect(component.getByTestId('sender-root').locator('.tr-sender-submit-button')).toHaveCount(0)
    await component.getByTestId('set-mode-a-object-empty').click()
    await expect(component.getByTestId('sender-root').locator('.tr-sender-submit-button')).toHaveCount(0)
  })

  test('EXT-04 treats a non-empty array as a valid payload', async ({ mount }) => {
    const component = await mount(SenderContentRegistrationFixture)
    await component.getByTestId('toggle-attachments').click()
    await component.getByTestId('set-mode-a-array').click()
    await component.getByTestId('sender-root').locator('.tr-sender-submit-button').click()

    await expect(component.getByTestId('last-submit')).toHaveText(
      '["",null,{"externalPayloads":[{"source":"source-a","payload":["item"]}]}]',
    )
  })

  test('EXT-05 treats a non-empty object and finite zero as valid payloads', async ({ mount }) => {
    const component = await mount(SenderContentRegistrationFixture)
    await component.getByTestId('toggle-attachments').click()
    await component.getByTestId('set-mode-a-object').click()
    await component.getByTestId('sender-root').locator('.tr-sender-submit-button').click()
    await expect(component.getByTestId('last-submit')).toHaveText(
      '["",null,{"externalPayloads":[{"source":"source-a","payload":{"id":"object"}}]}]',
    )

    await component.getByTestId('set-mode-a-zero').click()
    await component.getByTestId('sender-root').locator('.tr-sender-submit-button').click()
    await expect(component.getByTestId('last-submit')).toHaveText(
      '["",null,{"externalPayloads":[{"source":"source-a","payload":0}]}]',
    )
  })

  test('EXT-06 keeps multiple registrations independent even when their source names match', async ({ mount }) => {
    const component = await mount(SenderContentRegistrationFixture)
    await component.getByTestId('toggle-attachments').click()
    await component.getByTestId('toggle-registration-b').click()
    await component.getByTestId('set-mode-b-number').click()
    await component.getByTestId('set-source-b-same').click()
    await component.getByTestId('sender-root').locator('.tr-sender-submit-button').click()

    await expect(component.getByTestId('last-submit')).toHaveText(
      '["",null,{"externalPayloads":[{"source":"source-a","payload":"registered"},{"source":"source-a","payload":42}]}]',
    )
  })

  test('EXT-08 unregisters one source without removing another registration', async ({ mount }) => {
    const component = await mount(SenderContentRegistrationFixture)
    await component.getByTestId('toggle-attachments').click()
    await component.getByTestId('toggle-registration-b').click()
    await component.getByTestId('set-mode-b-number').click()
    await component.getByTestId('unregister-a').click()
    await component.getByTestId('sender-root').locator('.tr-sender-submit-button').click()

    await expect(component.getByTestId('last-submit')).toHaveText(
      '["",null,{"externalPayloads":[{"source":"source-b","payload":42}]}]',
    )
  })

  test('EXT-09 submits real Attachments payload and clears it after item removal and unmount', async ({ mount }) => {
    const component = await mount(SenderContentRegistrationFixture)
    await component.getByTestId('toggle-registration-a').click()
    const sender = component.getByTestId('sender-root')

    await sender.locator('.tr-sender-submit-button').click()
    await expect
      .poll(async () => JSON.parse((await component.getByTestId('last-submit').textContent())!))
      .toEqual([
        '',
        null,
        {
          externalPayloads: [
            {
              source: 'attachments',
              payload: [
                {
                  id: 'attachment-1',
                  name: 'note.txt',
                  url: 'https://example.com/note.txt',
                  status: 'success',
                  message: '',
                  fileType: 'other',
                },
              ],
            },
          ],
        },
      ])
    await component.getByTestId('clear-attachments').click()
    await expect(sender.locator('.tr-sender-submit-button')).toHaveCount(0)
    await component.getByTestId('toggle-attachments').click()
    await expect(sender.locator('.tr-sender-submit-button')).toHaveCount(0)
    await expect(component.getByTestId('submit-count')).toHaveText('1')
  })
})
