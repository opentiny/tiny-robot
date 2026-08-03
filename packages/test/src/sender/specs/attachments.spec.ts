import { expect, test, type Page } from '@playwright/test'
import { createSenderTestHelper } from '../helpers'

test.describe('Sender attachments external payloads', () => {
  let page: Page
  let helper: ReturnType<typeof createSenderTestHelper>

  test.beforeEach(async ({ page: currentPage }) => {
    page = currentPage
    await page.goto('/')
    await page.click('text=Sender 组件')
    helper = createSenderTestHelper(page)
    await helper.clearContent()
  })

  test('ignores uploading and error attachments as submit payloads', async () => {
    const nonSuccessStatuses = ['uploading', 'error'] as const

    for (const status of nonSuccessStatuses) {
      const textContent = `text with ${status} attachment`

      await helper.setSenderAttachmentStatus(status)
      await helper.toggleAttachmentsSource()
      await helper.expectSubmitButtonVisible(false)

      await helper.typeContent(textContent)
      await helper.clickSubmit()

      const detail = await helper.getSubmitDetail()
      expect(detail).toMatchObject({
        argsLength: 2,
        textContent,
        structuredData: null,
        meta: null,
      })

      await helper.toggleAttachmentsSource()
      await helper.clearContent()
    }
  })
})
