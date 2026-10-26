import { expect, test } from '@playwright/test'
import { fileURLToPath } from 'node:url'
import type { AIRequest, QuickAssistInstance, QuickAssistOptions } from '../../components/src/vanilla'

declare global {
  interface Window {
    browserBundle: {
      ready: boolean
      error?: string
      requests: AIRequest[]
      api: typeof import('../../components/src/vanilla')
      options: QuickAssistOptions
      qa: QuickAssistInstance
      second?: QuickAssistInstance
      originalDefine: unknown
      originalAmd: unknown
      originalRequire: unknown
      laterModule: boolean
      selectLines: () => void
    }
  }
}

for (const mode of ['global', 'umd', 'global-amd', 'global-monaco-amd', 'umd-amd']) {
  test(`${mode} loads the real bundle and completes an interaction`, async ({ page, context }, testInfo) => {
    const errors: string[] = []
    // Serve installed AMD assets verbatim: Vite's ESM injection breaks classic worker importScripts.
    await context.route('**/monaco-editor/min/vs/**', async (route) => {
      const url = new URL(route.request().url())
      if (url.searchParams.has('url')) return route.continue()
      const suffix = url.pathname.split('/monaco-editor/min/vs/')[1]
      await route.fulfill({
        path: fileURLToPath(new URL(`../node_modules/monaco-editor/min/vs/${suffix}`, import.meta.url)),
      })
    })
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('requestfailed', (request) => errors.push(`${request.url()}: ${request.failure()?.errorText}`))
    page.on('response', (response) => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`)
    })
    await page.goto(`/quick-assist/browser-bundles.html?mode=${mode}`)
    await expect.poll(() => page.evaluate(() => window.browserBundle?.error ?? window.browserBundle?.ready)).toBe(true)
    await expect(page.locator('style[data-tr-vanilla-style]')).toHaveCount(1)
    if (mode.endsWith('-amd')) {
      expect(
        await page.evaluate(() => {
          const state = window.browserBundle
          const host = window as unknown as { define: { amd: unknown }; require: unknown }
          return {
            define: host.define === state.originalDefine,
            amd: host.define.amd === state.originalAmd,
            require: host.require === state.originalRequire,
            laterModule: state.laterModule,
            globalApi: typeof window.TinyRobotVanilla?.createQuickAssist,
          }
        }),
      ).toEqual({
        define: true,
        amd: true,
        require: true,
        laterModule: true,
        globalApi: mode.startsWith('global') ? 'function' : 'undefined',
      })
      await expect(page.locator('.monaco-editor')).toBeVisible()
      await page.evaluate(() => window.browserBundle.selectLines())
    } else {
      await page.locator('#term').evaluate((element) => {
        const range = document.createRange()
        range.selectNodeContents(element)
        window.getSelection()!.removeAllRanges()
        window.getSelection()!.addRange(range)
        document.dispatchEvent(new Event('selectionchange'))
      })
    }
    await page.locator('.tr-quick-assist__trigger').click()
    const input = page.locator('.tr-quick-assist__popover textarea')
    const text = mode.endsWith('-amd') ? 'apiVersion: apps/v1\nkind: Deployment' : '浏览器产物智能帮助'
    await expect(input).toHaveValue(text)
    await testInfo.attach(`${mode}-popover`, { body: await page.screenshot(), contentType: 'image/png' })
    await input.fill('解释选中的内容')
    await input.press('Enter')
    await expect.poll(() => page.evaluate(() => window.browserBundle.requests.length)).toBe(1)
    expect(
      await page.evaluate(() => {
        const request = window.browserBundle.requests[0]
        return { prompt: request.prompt, text: request.context.selection?.text }
      }),
    ).toEqual({ prompt: '解释选中的内容', text })
    await expect(page.locator('.tr-quick-assist')).toHaveCount(0)

    await page.evaluate(() => {
      const state = window.browserBundle
      state.second = state.api.createQuickAssist(state.options)
      state.qa.destroy()
    })
    await expect(page.locator('style[data-tr-vanilla-style]')).toHaveCount(1)
    await page.evaluate(() => {
      window.browserBundle.second!.destroy()
      window.browserBundle.second!.destroy()
    })
    await expect(page.locator('style[data-tr-vanilla-style]')).toHaveCount(0)
    expect(errors).toEqual([])
  })
}
