import { expect, test } from '@playwright/test'
import { createSenderTestHelper } from '../../helpers'

test('smoke empty-text attachment submit and post-removal state', async ({ page }) => {
  await page.goto('/')
  await page.click('text=Sender 组件')
  const helper = createSenderTestHelper(page)

  await helper.toggleMode()
  await helper.toggleAttachmentsSource()
  await helper.clickSubmit()

  const submitted = await helper.getSubmitDetail()
  expect(submitted).toEqual({
    argsLength: 3,
    textContent: '',
    structuredData: null,
    extra: {
      externalPayloads: [
        {
          source: 'attachments',
          payload: [
            {
              id: 'sender-attachment',
              name: 'sender-note.txt',
              status: 'success',
              fileType: 'other',
              message: '',
              url: 'https://example.com/files/sender-note.txt',
            },
          ],
        },
      ],
    },
  })

  await helper.clearAttachmentsSourceItems()
  await helper.expectSubmitButtonVisible(false)
  expect(await helper.getSubmitDetail()).toEqual(submitted)
})
