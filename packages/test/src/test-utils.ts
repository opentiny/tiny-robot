import type { Page, Locator } from '@playwright/test'

export interface TestUtilsOptions {
  defaultTimeout?: number
  screenshotPath?: string
}

/**
 * 创建轻量级测试辅助工具
 */
export function createTestUtils(page: Page, options: TestUtilsOptions = {}) {
  const { defaultTimeout = 2000, screenshotPath = 'test-results' } = options

  /** 点击元素（自动等待可见） */
  const click = async (selector: string, timeout = defaultTimeout) => {
    await page.locator(selector).waitFor({ state: 'visible', timeout })
    await page.click(selector)
  }

  /** 点击元素并等待可见 */
  const clickWhenVisible = async (selector: string, timeout = defaultTimeout) => {
    await click(selector, timeout)
  }

  /** 等待元素包含指定文本 */
  const waitForText = async (selector: string, text: string, timeout = defaultTimeout) => {
    await page.locator(selector).filter({ hasText: text }).waitFor({ timeout })
  }

  /** 检查元素属性是否符合预期 */
  const expectAttribute = async (
    selector: string,
    attribute: string,
    expectedValue: string,
    timeout = defaultTimeout,
  ) => {
    const locator = page.locator(selector)
    await locator.waitFor({ timeout })
    const actualValue = await locator.getAttribute(attribute)
    if (actualValue !== expectedValue) {
      throw new Error(`Expected ${attribute}="${expectedValue}", but got "${actualValue}"`)
    }
  }

  /** 批量填写表单 */
  const fillForm = async (fields: Record<string, string>) => {
    for (const [selector, value] of Object.entries(fields)) {
      await page.fill(selector, value)
    }
  }

  /** 截图元素 */
  const screenshotElement = async (selector: string, name: string) => {
    await page.locator(selector).screenshot({ path: `${screenshotPath}/${name}.png` })
  }

  /** 检查控制台错误 */
  const checkConsoleErrors = async (): Promise<string[]> => {
    const errors: string[] = []
    // eslint-disable-next-line
    const errorListener = (msg: any) => {
      if (msg.type() === 'error') errors.push(msg.text())
    }

    page.on('console', errorListener)
    await page.waitForTimeout(100)
    page.removeListener('console', errorListener)

    return errors
  }

  /** 获取元素定位器 */
  const getLocator = (selector: string): Locator => {
    return page.locator(selector)
  }

  /** 等待元素存在 */
  const waitForElement = async (selector: string, timeout = defaultTimeout) => {
    await page.locator(selector).waitFor({ timeout })
  }

  /** 等待页面加载完成 */
  const waitForPageLoad = async (url = '/') => {
    await page.goto(url)
    // 等待页面基本加载完成
    await page.waitForLoadState('networkidle')
  }

  return {
    click,
    clickWhenVisible,
    waitForText,
    expectAttribute,
    fillForm,
    screenshotElement,
    checkConsoleErrors,
    getLocator,
    waitForElement,
    waitForPageLoad,
  }
}
