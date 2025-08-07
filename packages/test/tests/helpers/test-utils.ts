import { Page, expect } from '@playwright/test'

/**
 * 测试辅助工具类
 */
export class TestUtils {
  constructor(protected page: Page) {}

  /**
   * 等待元素可见并点击
   */
  async clickWhenVisible(selector: string, timeout = 5000) {
    const element = this.page.locator(selector)
    await expect(element).toBeVisible({ timeout })
    await element.click()
  }

  /**
   * 等待文本内容出现
   */
  async waitForText(selector: string, text: string, timeout = 5000) {
    const element = this.page.locator(selector)
    await expect(element).toContainText(text, { timeout })
  }

  /**
   * 检查元素是否具有特定属性值
   */
  async expectAttribute(selector: string, attribute: string, value: string) {
    const element = this.page.locator(selector)
    await expect(element).toHaveAttribute(attribute, value)
  }

  /**
   * 填写表单字段
   */
  async fillForm(fields: Record<string, string>) {
    for (const [selector, value] of Object.entries(fields)) {
      await this.page.fill(selector, value)
    }
  }

  /**
   * 截取指定元素的截图
   */
  async screenshotElement(selector: string, name: string) {
    const element = this.page.locator(selector)
    await element.screenshot({ path: `test-results/${name}.png` })
  }

  /**
   * 等待网络请求完成
   */
  async waitForNetworkIdle(timeout = 5000) {
    await this.page.waitForLoadState('networkidle', { timeout })
  }

  /**
   * 模拟键盘操作
   */
  async pressKeys(keys: string[]) {
    for (const key of keys) {
      await this.page.keyboard.press(key)
    }
  }

  /**
   * 检查控制台错误
   */
  async checkConsoleErrors() {
    const errors: string[] = []

    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    return errors
  }

  /**
   * 等待动画完成
   */
  async waitForAnimation(selector: string, timeout = 3000) {
    const element = this.page.locator(selector)
    await element.waitFor({ state: 'visible', timeout })

    // 等待可能的 CSS 过渡动画
    await this.page.waitForTimeout(300)
  }

  /**
   * 检查元素的可访问性属性
   */
  async checkAccessibility(selector: string) {
    const element = this.page.locator(selector)

    // 检查是否有 aria-label 或其他可访问性属性
    const ariaLabel = await element.getAttribute('aria-label')
    const role = await element.getAttribute('role')
    const tabindex = await element.getAttribute('tabindex')

    return {
      ariaLabel,
      role,
      tabindex,
      hasAccessibilityInfo: !!(ariaLabel || role),
    }
  }
}

/**
 * Container 组件专用测试辅助类
 */
export class ContainerTestHelper extends TestUtils {
  /**
   * 显示容器
   */
  async showContainer() {
    await this.clickWhenVisible('[data-testid="show-container-btn"]')
    await expect(this.page.getByTestId('test-container')).toBeVisible()
  }

  /**
   * 隐藏容器
   */
  async hideContainer() {
    await this.clickWhenVisible('[data-testid="hide-container-btn"]')
    await expect(this.page.getByTestId('test-container')).not.toBeVisible()
  }

  /**
   * 切换全屏模式
   */
  async toggleFullscreen() {
    await this.clickWhenVisible('[data-testid="toggle-fullscreen-btn"]')
  }

  /**
   * 检查容器状态
   */
  async expectContainerStatus(visible: boolean, fullscreen: boolean) {
    await expect(this.page.getByTestId('container-status')).toHaveText(visible ? '显示' : '隐藏')
    await expect(this.page.getByTestId('fullscreen-status')).toHaveText(fullscreen ? '全屏' : '普通')
  }

  /**
   * 检查操作日志
   */
  async expectLogContains(message: string) {
    await expect(this.page.getByTestId('action-log')).toContainText(message)
  }

  /**
   * 清空操作日志
   */
  async clearLogs() {
    await this.clickWhenVisible('[data-testid="clear-logs-btn"]')
    await this.expectLogContains('日志已清空')
  }

  /**
   * 测试容器内的交互
   */
  async testContainerInteraction(inputText: string) {
    await this.page.fill('[data-testid="demo-input"]', inputText)
    await expect(this.page.getByTestId('demo-input-value')).toContainText(`输入值: ${inputText}`)
  }
}

/**
 * 创建测试辅助实例
 */
export function createTestUtils(page: Page) {
  return new TestUtils(page)
}

/**
 * 创建 Container 测试辅助实例
 */
export function createContainerTestHelper(page: Page) {
  return new ContainerTestHelper(page)
}
