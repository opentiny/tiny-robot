import { expect, test } from '@playwright/experimental-ct-vue'
import SenderHeader from './SenderHeader.fixture.vue'

for (const mode of ['single', 'multiple'] as const) {
  test(`${mode}: omits structurally empty headers and preserves valid VNodes`, async ({ mount }) => {
    const component = await mount(SenderHeader, { props: { mode } })
    for (const name of ['comment', 'fragment', 'whitespace', 'empty']) {
      await component.getByRole('button', { name, exact: true }).click()
      await expect(component.locator('.tr-sender-header')).toHaveCount(0)
    }
    for (const name of ['zero', 'element', 'component']) {
      await component.getByRole('button', { name, exact: true }).click()
      await expect(component.locator('.tr-sender-header')).toHaveCount(1)
    }
    await component.getByRole('button', { name: 'zero', exact: true }).click()
    await expect(component.locator('.tr-sender-header')).toHaveText('0')
  })
}
