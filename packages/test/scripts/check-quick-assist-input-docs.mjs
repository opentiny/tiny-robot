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
  expect(parentSection).toBe('代码示例')
  const apiTable = page.locator('h2#props').locator('xpath=following-sibling::table[1]')
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
  const open = () => demo.getByRole('button', { name: '询问“查看系统盘使用率”', exact: true }).click()
  await open()
  await expect(input).toHaveValue('查看系统盘使用率')
  await input.fill('第一行\n第二行\n第三行')
  await expect(input).toHaveCSS('height', '36px')
  await input.fill('单行')
  await expect(page.locator('.tr-quick-assist__composer')).toHaveCSS('height', '40px')
  await input.press('Escape')

  await demo.getByRole('checkbox', { name: '限制为 50 个字符' }).check()
  await demo.getByRole('checkbox', { name: '默认填入上下文' }).uncheck()
  await demo.getByRole('combobox', { name: '本次预填' }).selectOption('enabled')
  await open()
  await expect(input).toHaveValue('查看系统盘使用率')
  await input.press('Escape')
  await demo.getByRole('combobox', { name: '本次预填' }).selectOption('inherit')
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
  expect(errors).toEqual([])
  expect(failedAssets).toEqual([])
  const result = {
    url,
    parentSection,
    documentedKeys: documentedKeys.filter((key) => /^(input|messages)\./u.test(key)),
    checks: [
      'API anchor',
      'default prefill',
      'grow and shrink',
      'Unicode count',
      'length validation',
      'submission context',
      'activation override isolation',
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
