import { chromium, expect } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

const url = process.argv[2] || 'http://127.0.0.1:4173/components/quick-assist.html'
const output = process.argv[3]
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
const errors = []
const failedRequests = []
const failedAssets = []
page.on('pageerror', (error) => errors.push(error.message))
page.on('requestfailed', (request) => failedRequests.push(`${request.url()}: ${request.failure()?.errorText}`))
page.on('response', (response) => {
  if (response.status() >= 400 && ['script', 'stylesheet'].includes(response.request().resourceType())) {
    failedAssets.push(`${response.status()} ${response.url()}`)
  }
})
try {
  await page.goto(url)
  // VitePress serves SSR headings before its asynchronous demo components mount.
  // Wait for hydration before exercising client-side hash navigation.
  await expect(page.locator('.qa-input-demo')).toBeVisible({ timeout: 30000 })
  const heading = page.locator('h3#example-input')
  await expect(heading).toBeVisible()
  const parentSection = await heading.evaluate((element) => {
    let previous = element.previousElementSibling
    while (previous && previous.tagName !== 'H2') previous = previous.previousElementSibling
    const title = previous?.cloneNode(true)
    title?.querySelectorAll('.header-anchor').forEach((anchor) => anchor.remove())
    return title?.textContent?.trim()
  })
  expect(parentSection).toBe('输入与推荐')
  const apiTable = page.locator('#props').locator('xpath=following-sibling::table[1]')
  const documentedKeys = await apiTable.locator('td:first-child').allTextContents()
  for (const key of [
    'input.maxRows',
    'input.maxLength',
    'input.autoFill',
    'input.placeholder',
    'input.ariaLabel',
    'input.submitLabel',
    'input.maxLengthExceededMessage',
    'messages.loading',
    'messages.empty',
    'messages.error',
  ]) {
    expect(documentedKeys).toContain(key)
  }
  expect(documentedKeys.filter((key) => key.startsWith('messages.'))).toEqual([
    'messages.loading',
    'messages.empty',
    'messages.error',
  ])
  expect(documentedKeys.filter((key) => key.startsWith('input.'))).toHaveLength(7)
  // Check the actual API link and rendered heading, rather than only searching Markdown.
  const apiLink = page.locator('td a[href="#example-input"]').filter({ hasText: 'input.maxRows' })
  await apiLink.click()
  await expect.poll(() => new URL(page.url()).hash).toBe('#example-input')
  await expect(heading).toBeInViewport()

  const demo = page.locator('.qa-input-demo')
  const input = page.locator('.tr-quick-assist__input')
  const open = (name = '按实例配置打开') => demo.getByRole('button', { name, exact: true }).click()
  const autoFill = demo.getByRole('checkbox', { name: '预填选中文字', exact: true })
  const selectionText = (await demo.locator('#qa-input-demo-selection').innerText()).trim()
  const selectionLength = Array.from(selectionText).length
  expect(selectionLength).toBeGreaterThan(50)
  const selectAndOpen = async () => {
    await page.evaluate(() => {
      window.getSelection().removeAllRanges()
      document.dispatchEvent(new Event('selectionchange'))
    })
    const text = demo.locator('#qa-input-demo-selection')
    await text.scrollIntoViewIfNeeded()
    await text.evaluate((element) => {
      const range = document.createRange()
      range.selectNodeContents(element)
      window.getSelection().addRange(range)
      document.dispatchEvent(new Event('selectionchange'))
    })
    await page.locator('.tr-quick-assist__trigger').click()
  }
  await expect(demo.getByRole('group', { name: '实例配置' })).toBeVisible()
  await expect(demo.getByRole('heading', { name: '划词体验' })).toBeVisible()
  await expect(demo.getByRole('heading', { name: '命令式调用' })).toBeVisible()
  await expect(demo.getByRole('combobox')).toHaveCount(0)
  await expect(autoFill).not.toBeChecked()
  await selectAndOpen()
  await expect(input).toHaveValue('')
  await input.press('Escape')
  await open()
  await expect(input).toHaveValue('')
  await input.fill('第一行\n第二行\n第三行')
  await expect(input).toHaveCSS('height', '36px')
  await input.fill('单行')
  await expect(page.locator('.tr-quick-assist__composer')).toHaveCSS('height', '40px')
  await input.press('Escape')

  await demo.getByRole('checkbox', { name: '限制为 50 个字符' }).check()
  await open('本次预填')
  await expect(input).toHaveValue('查看系统盘使用率')
  await expect(autoFill).not.toBeChecked()
  await input.press('Escape')
  await open()
  await expect(input).toHaveValue('')
  await expect(page.locator('.tr-quick-assist__counter')).toHaveText('0 / 50')
  await input.fill('😀'.repeat(50))
  await expect(page.locator('.tr-quick-assist__counter')).toHaveText('50 / 50')
  await expect(page.locator('.tr-quick-assist__submit')).toBeEnabled()
  await input.fill('😀'.repeat(51))
  await expect(page.locator('.tr-quick-assist__counter')).toHaveText('51 / 50')
  await expect(page.locator('.tr-quick-assist__submit')).toBeDisabled()
  await page.locator('.tr-quick-assist__submit-wrapper').hover()
  await expect(page.getByRole('tooltip')).toHaveText('字数超出限制')
  if (output) {
    await mkdir(output, { recursive: true })
    await page
      .locator('.tr-quick-assist__popover')
      .screenshot({ path: `${output}/docs-input-limit.png`, animations: 'disabled' })
  }
  await input.fill('解释用量')
  await input.press('Enter')
  await expect(demo.locator('aside')).toContainText('已提交：解释用量')
  await expect(demo.locator('aside')).toContainText('保留的上下文：查看系统盘使用率')
  await demo.getByRole('spinbutton', { name: '最大显示行数' }).fill('3')
  await demo.getByRole('spinbutton', { name: '最大显示行数' }).blur()
  await open()
  await input.fill('第一行\n第二行\n第三行')
  await expect(input).toHaveCSS('height', '54px')
  await input.press('Escape')
  await autoFill.check()
  await selectAndOpen()
  await expect(input).toHaveValue(selectionText)
  await expect(page.locator('.tr-quick-assist__counter')).toHaveText(`${selectionLength} / 50`)
  await expect(page.locator('.tr-quick-assist__submit')).toBeDisabled()
  await input.press('Escape')
  await open('本次留空')
  await expect(input).toHaveValue('')
  await expect(autoFill).toBeChecked()
  await input.fill('留空后提问')
  await input.press('Enter')
  await expect(demo.locator('aside')).toContainText('保留的上下文：查看系统盘使用率')
  await open()
  await expect(input).toHaveValue('查看系统盘使用率')
  await expect(autoFill).toBeChecked()
  await input.press('Escape')
  expect(errors).toEqual([])
  expect(failedAssets).toEqual([])
  const result = {
    url,
    parentSection,
    documentedKeys: documentedKeys.filter((key) => /^(input|messages)\./u.test(key)),
    checks: [
      'API anchor',
      'default empty input',
      'grow and shrink',
      'Unicode count',
      'length validation',
      'submission context',
      'activation override isolation',
      'selection follows instance configuration',
      'long selected text exceeds the configured input limit',
      'grouped direct activation controls',
      'maxRows configuration',
    ],
    pageErrors: errors,
    failedAssets,
  }
  if (output) {
    await demo.screenshot({ path: `${output}/docs-input-demo.png`, animations: 'disabled' })
    await writeFile(`${output}/docs-input-results.json`, JSON.stringify(result, null, 2))
  }
  console.log(JSON.stringify(result, null, 2))
} catch (error) {
  const diagnostics = {
    pageErrors: errors,
    failedRequests,
    failedAssets,
    demoCount: await page.locator('.qa-input-demo').count(),
    body: (await page.locator('body').innerText()).slice(0, 2000),
  }
  console.error(JSON.stringify(diagnostics, null, 2))
  if (output) {
    await mkdir(output, { recursive: true })
    await page.screenshot({ path: `${output}/docs-input-failure.png` })
    await writeFile(`${output}/docs-input-failure.json`, JSON.stringify(diagnostics, null, 2))
  }
  throw error
} finally {
  await browser.close()
}
