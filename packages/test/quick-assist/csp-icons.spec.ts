import { expect, test } from '@playwright/test'
import { readFileSync } from 'node:fs'
import type {} from './main'
import type {} from '../vanilla-theme/main'
import type {} from './browser-bundles.spec'

declare global {
  interface Window {
    qaCspViolations: string[]
  }
}

const aiPath = readFileSync(
  new URL('../../components/src/vanilla/quick-assist/assets/ai-icon-light.svg', import.meta.url),
  'utf8',
).match(/<path[^>]*\sd="([^"]+)"/)![1]
const sendPath = readFileSync(
  new URL('../../components/src/vanilla/quick-assist/assets/send-dark.svg', import.meta.url),
  'utf8',
).match(/<path[^>]*\sd="([^"]+)"/)![1]

const paints = Object.fromEntries(
  ['light', 'dark'].map((mode) => {
    const source = readFileSync(
      new URL(`../../components/src/vanilla/quick-assist/assets/ai-icon-${mode}.svg`, import.meta.url),
      'utf8',
    )
    return [
      mode,
      {
        coordinates: Object.fromEntries(
          ['x1', 'x2', 'y1', 'y2', 'gradientUnits'].map((name) => [
            name,
            source.match(new RegExp(`${name}="([^"]+)"`))![1],
          ]),
        ),
        stops: [...source.matchAll(/<stop\s+([^>]+)\/>/g)].map((match) => ({
          offset: match[1].match(/offset="([^"]+)"/)![1],
          color: match[1].match(/stop-color="([^"]+)"/)![1],
        })),
      },
    ]
  }),
)

for (const entry of ['source', 'esm', 'umd', 'global']) {
  test(`${entry} icons render under img-src self without data URLs`, async ({ page }) => {
    await page.route('**/*.html*', async (route) => {
      const response = await route.fetch()
      await route.fulfill({
        response,
        headers: {
          ...response.headers(),
          'content-security-policy':
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self'; connect-src 'self' ws:; object-src 'none'",
        },
      })
    })
    await page.addInitScript(() => {
      window.qaCspViolations = []
      document.addEventListener('securitypolicyviolation', (event) => {
        window.qaCspViolations.push(`${event.violatedDirective}: ${event.blockedURI}`)
      })
    })
    const url =
      entry === 'source'
        ? '/quick-assist/index.html'
        : entry === 'esm'
          ? '/vanilla-theme/index.html?entry=esm'
          : entry === 'umd'
            ? '/quick-assist/umd.html'
            : '/quick-assist/browser-bundles.html?mode=global'
    await page.goto(url)
    await page.waitForFunction(
      (entry) =>
        entry === 'esm'
          ? !!window.themeFixture?.instances.length
          : entry === 'global'
            ? window.browserBundle?.ready
            : !!window.qa,
      entry,
    )
    await page.evaluate((entry) => {
      const qa =
        entry === 'esm' ? window.themeFixture.instances[0] : entry === 'global' ? window.browserBundle.qa : window.qa
      qa.activate({ text: '严格图片CSP', anchor: document.querySelector('#term')! })
    }, entry)
    const host = page.locator('.tr-quick-assist')
    await expect(host.locator('img')).toHaveCount(0)
    await expect(host.locator('.tr-quick-assist__sparkle svg:visible path')).toHaveAttribute('d', aiPath)
    await host.locator('.tr-quick-assist__trigger').click()
    const input = host.locator('textarea')
    for (const mode of ['light', 'dark']) {
      await page.evaluate((mode) => document.documentElement.setAttribute('data-tr-color-mode', mode), mode)
      const ai = host.locator(`.tr-quick-assist__sparkle .tr-quick-assist__icon--${mode}`)
      await expect(ai).toBeVisible()
      await expect(ai.locator('path')).toHaveAttribute('d', aiPath)
      expect(
        await ai.evaluate((element) => {
          const gradient = element.querySelector('linearGradient')!
          return {
            coordinates: Object.fromEntries(
              ['x1', 'x2', 'y1', 'y2', 'gradientUnits'].map((name) => [name, gradient.getAttribute(name)]),
            ),
            stops: [...gradient.querySelectorAll('stop')].map((stop) => ({
              offset: stop.getAttribute('offset'),
              color: stop.getAttribute('stop-color'),
            })),
          }
        }),
      ).toEqual(paints[mode])
      expect(
        await ai.locator('path').evaluate((element) => (element as SVGGraphicsElement).getBBox().width),
      ).toBeGreaterThan(0)
      expect(
        await ai.evaluate((element) => {
          const id = element.querySelector('linearGradient')!.id
          return element.ownerDocument.getElementById(id) === element.querySelector('linearGradient')
        }),
      ).toBe(true)
      await input.fill('')
      await expect(host.locator('.tr-quick-assist__send .tr-quick-assist__icon--gray')).toBeVisible()
      await input.fill('继续提问')
      const variant = mode === 'dark' ? 'gray' : 'black'
      const send = host.locator(`.tr-quick-assist__send .tr-quick-assist__icon--${variant}`)
      await expect(send).toBeVisible()
      await expect(send.locator('path')).toHaveAttribute('d', sendPath)
      await expect(send.locator('path')).toHaveAttribute('fill', mode === 'dark' ? 'rgb(194,194,194)' : 'rgb(25,25,25)')
    }
    const ids = await host.locator('linearGradient').evaluateAll((gradients) => gradients.map((g) => g.id))
    expect(new Set(ids).size).toBe(ids.length)
    expect(await page.evaluate(() => window.qaCspViolations)).toEqual([])
    await expect(host.locator('img')).toHaveCount(0)
  })
}
