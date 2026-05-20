import { expect, test, type Page } from '@playwright/test'

test.describe('Attachments 组件测试', () => {
  test.beforeEach(async ({ page }: { page: Page }) => {
    await page.goto('/')
    await page.click('text=Attachments 组件')
    await expect(page.getByRole('heading', { level: 2, name: 'Attachments 组件测试' })).toBeVisible()
  })

  test('应支持仅传入 url 的远程附件', async ({ page }) => {
    const section = page.locator('[data-testid="url-only-section"]')

    await expect(section.locator('.tr-file-card')).toHaveCount(1)
    await expect(section.locator('.tr-file-card__name')).toContainText('project-summary.pdf')
    await expect(section.locator('.tr-file-card__file-size')).toHaveCount(0)
  })

  test('应保留用户显式传入的 fileType', async ({ page }) => {
    const section = page.locator('[data-testid="custom-type-section"]')
    const card = section.locator('[data-file-type="md"]')

    await expect(card).toHaveCount(1)
    await expect(card.locator('.tr-file-card__file-type')).toContainText('MD')
  })

  test('无后缀 url 时应优先使用 name 推断文件类型', async ({ page }) => {
    const section = page.locator('[data-testid="name-priority-section"]')
    const card = section.locator('[data-file-type="word"]')

    await expect(card).toHaveCount(1)
    await expect(card.locator('.tr-file-card__name')).toContainText('meeting-notes.docx')
    await expect(card.locator('.tr-file-card__file-type')).toContainText('WORD')
  })

  test('应从 query filename 参数中提取文件名和类型', async ({ page }) => {
    const section = page.locator('[data-testid="query-filename-section"]')
    const card = section.locator('[data-file-type="pdf"]')

    await expect(card).toHaveCount(1)
    await expect(card.locator('.tr-file-card__name')).toContainText('quarterly-report.pdf')
    await expect(card.locator('.tr-file-card__file-type')).toContainText('PDF')
  })

  test('应正确处理带 query 和 hash 的资源 url', async ({ page }) => {
    const section = page.locator('[data-testid="query-hash-url-section"]')
    const card = section.locator('[data-file-type="image"]')

    await expect(card).toHaveCount(1)
    await expect(card.locator('.tr-file-card__name')).toContainText('image-cover.png')
    await expect(card.locator('.tr-file-card__file-type')).toContainText('IMAGE')
  })

  test('本地文件给全量字段时仍应优先按 rawFile 识别类型', async ({ page }) => {
    const section = page.locator('[data-testid="local-full-fields-section"]')
    const card = section.locator('[data-file-type="word"]')

    await expect(card).toHaveCount(1)
    await expect(card.locator('.tr-file-card__name')).toContainText('contract.docx')
    await expect(card.locator('.tr-file-card__file-type')).toContainText('WORD')
  })

  test('rawFile 搭配预览 url 时应优先保留本地文件信息', async ({ page }) => {
    const section = page.locator('[data-testid="local-file-section"]')

    await expect(section.locator('.tr-file-card')).toHaveCount(1)
    await expect(section.locator('.tr-file-card__name')).toContainText('notes.txt')
  })

  test('父级清空 items 后应同步清空附件列表', async ({ page }) => {
    const section = page.locator('[data-testid="url-only-section"]')

    await expect(section.locator('.tr-file-card')).toHaveCount(1)
    await page.getByTestId('url-only-clear').click()
    await expect(section.locator('.tr-file-card')).toHaveCount(0)
  })
})
