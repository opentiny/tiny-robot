import { test as base, expect } from '@playwright/test'

export const test = base.extend<{ browserErrors: void }>({
  browserErrors: [
    async ({ page }, use) => {
      const errors: string[] = []
      page.on('pageerror', (error) => errors.push(error.message))
      await use()
      expect(errors, '浏览器应正常完成整个交互过程').toEqual([])
    },
    { auto: true },
  ],
})
export { expect }
