import { expect, test } from '@playwright/experimental-ct-vue'
import type { Locator } from '@playwright/test'
import ChatToolbarFixture from './ChatToolbar.fixture.vue'

async function expectToolbarOrder(toolbar: Locator, names: string[]) {
  const buttons = toolbar.getByRole('button')
  await expect(buttons).toHaveCount(names.length)
  for (const [index, name] of names.entries()) {
    await expect(buttons.nth(index)).toHaveAccessibleName(name)
  }
}

for (const entry of ['ui', 'runtime'] as const) {
  test.describe(`Chat toolbar (${entry})`, () => {
    test('keeps default feature buttons across model changes and blocks unsupported features', async ({ mount }) => {
      const component = await mount(ChatToolbarFixture, { props: { entry } })
      const toolbar = component.locator('.tr-chat-toolbar')
      await expectToolbarOrder(toolbar, ['深度思考', '联网搜索', 'Supported model', 'MCP'])
      await component.update({ props: { entry, modelId: 'unsupported' } })
      await expectToolbarOrder(toolbar, ['深度思考', '联网搜索', 'Unsupported model', 'MCP'])
      await expect(toolbar.getByRole('button', { name: '深度思考', exact: true })).toBeDisabled()
      await expect(toolbar.getByRole('button', { name: '联网搜索', exact: true })).toBeDisabled()
      await toolbar.getByRole('button', { name: '联网搜索', exact: true }).dispatchEvent('click')
      await expect(component.getByTestId('feature-changes')).toHaveText('0')
      await component.update({ props: { entry, modelId: null } })
      await expect(toolbar.getByRole('button', { name: '联网搜索', exact: true })).toBeDisabled()
      await expect(toolbar.getByRole('button')).toHaveCount(4)
    })

    test('mixes builtin and custom actions and preserves their state when hidden', async ({ mount }) => {
      const component = await mount(ChatToolbarFixture, { props: { entry, preset: 'mixed' } })
      const toolbar = component.locator('.tr-chat-toolbar')
      await expectToolbarOrder(toolbar, ['MCP', 'Generate UI', 'Supported model', '联网搜索', '深度思考'])
      await toolbar.getByRole('button', { name: 'Generate UI', exact: true }).click()
      await expect(toolbar.getByRole('button', { name: 'Generate UI', exact: true })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      await toolbar.getByRole('button', { name: '联网搜索', exact: true }).click()
      await expect(component.getByTestId('feature-changes')).toHaveText('1')
      await component.update({ props: { entry, preset: 'hidden' } })
      await expect(toolbar).toHaveCount(0)
      await expect(component.getByTestId('feature-state')).toHaveText('{"thinking":true,"search":true}')
      await component.update({ props: { entry, preset: 'mixed' } })
      await expect(toolbar.getByRole('button', { name: 'Generate UI', exact: true })).toHaveAttribute(
        'aria-pressed',
        'true',
      )
      await expect(component.getByTestId('custom-clicks')).toHaveText('1')
    })

    test('appends custom actions to defaults with reactive state and disabled guards', async ({ mount }) => {
      const component = await mount(ChatToolbarFixture, { props: { entry, preset: 'append' } })
      const toolbar = component.locator('.tr-chat-toolbar')
      await expectToolbarOrder(toolbar, ['深度思考', '联网搜索', 'Supported model', 'MCP', 'Generate UI'])
      const custom = toolbar.getByRole('button', { name: 'Generate UI', exact: true })
      await custom.click()
      await expect(custom).toHaveAttribute('aria-pressed', 'true')
      await component.update({ props: { entry, preset: 'append', itemDisabled: true } })
      await expect(custom).toBeDisabled()
      await custom.dispatchEvent('click')
      await expect(component.getByTestId('custom-clicks')).toHaveText('1')
      await component.update({ props: { entry, preset: 'append', itemDisabled: false, disabled: true } })
      await expect(toolbar.locator('button:disabled')).toHaveCount(5)
      await component.update({
        props: { entry, preset: 'append', disabled: false, modelVisible: false, mcpVisible: false },
      })
      await expectToolbarOrder(toolbar, ['Generate UI'])
    })

    test('updates toolbar context at the container breakpoint without resizing the viewport', async ({
      mount,
      page,
    }) => {
      const component = await mount(ChatToolbarFixture, { props: { entry, preset: 'responsive' } })
      const footer = component.locator('.chat-footer')
      const custom = component.getByRole('button', { name: 'Generate UI', exact: true })
      const wideOnly = component.getByRole('button', { name: 'Wide only', exact: true })
      const viewport = page.viewportSize()

      for (const width of [641, 640, 639, 641]) {
        await footer.evaluate((element, value) => {
          element.style.width = `${value}px`
        }, width)
        await expect(custom.locator('.tr-chat-toolbar-button__icon')).toHaveCount(width <= 640 ? 0 : 1)
        await expect(custom.locator('.tr-chat-toolbar-button__label')).toBeVisible()
        await expect(wideOnly).toHaveCount(width <= 640 ? 0 : 1)
      }

      expect(page.viewportSize()).toEqual(viewport)
      await custom.click()
      await expect(component.getByTestId('custom-clicks')).toHaveText('1')
      await expect(component.locator('.tr-sender')).not.toHaveAttribute('is-narrow')
    })

    test('measures an initially narrow container and restores icons when expanded', async ({ mount }) => {
      const component = await mount(ChatToolbarFixture, {
        props: { entry, preset: 'responsive', hostWidth: 600 },
      })
      const custom = component.getByRole('button', { name: 'Generate UI', exact: true })
      await expect(custom.locator('.tr-chat-toolbar-button__icon')).toHaveCount(0)
      await expect(custom.locator('.tr-chat-toolbar-button__label')).toBeVisible()
      await expect(component.getByRole('button', { name: 'Wide only', exact: true })).toHaveCount(0)

      await component.update({ props: { entry, preset: 'responsive', hostWidth: 900 } })
      await expect(custom.locator('.tr-chat-toolbar-button__icon')).toHaveCount(1)
      await expect(component.getByRole('button', { name: 'Wide only', exact: true })).toBeVisible()
    })

    test('transforms defaults before applying visibility, duplicate and capability rules', async ({ mount }) => {
      const component = await mount(ChatToolbarFixture, { props: { entry, preset: 'transform' } })
      const toolbar = component.locator('.tr-chat-toolbar')
      await expectToolbarOrder(toolbar, ['MCP', 'Supported model', '深度思考', 'Generate UI'])
      await component.update({ props: { entry, preset: 'transform', modelId: 'unsupported' } })
      const thinking = toolbar.getByRole('button', { name: '深度思考', exact: true })
      await expect(thinking).toBeDisabled()
      await thinking.dispatchEvent('click')
      await expect(component.getByTestId('feature-changes')).toHaveText('0')
      await expect(component.getByTestId('feature-state')).toHaveText('{"thinking":true,"search":false}')
      await component.update({ props: { entry, preset: 'transform', modelId: 'supported', itemDisabled: true } })
      await expect(toolbar.locator('button:disabled')).toHaveCount(4)
      await component.update({ props: { entry, preset: 'default', itemDisabled: false } })
      await expectToolbarOrder(toolbar, ['深度思考', '联网搜索', 'Supported model', 'MCP'])
    })

    test('hides the toolbar for an empty callback result and restores defaults', async ({ mount }) => {
      const component = await mount(ChatToolbarFixture, { props: { entry, preset: 'callback-empty' } })
      const toolbar = component.locator('.tr-chat-toolbar')
      await expect(toolbar).toHaveCount(0)
      await expect(component.getByTestId('legacy-footer')).toBeVisible()
      await expect(component.getByTestId('legacy-footer-right')).toBeVisible()
      await component.update({ props: { entry, preset: 'default' } })
      await expectToolbarOrder(toolbar, ['深度思考', '联网搜索', 'Supported model', 'MCP'])
    })

    test('disables all actions for sender and item configuration, including synthetic clicks', async ({ mount }) => {
      const component = await mount(ChatToolbarFixture, { props: { entry, preset: 'mixed', disabled: true } })
      const toolbar = component.locator('.tr-chat-toolbar')
      await expect(toolbar.locator('button:disabled')).toHaveCount(5)
      await expect(component.getByTestId('panel-changes')).toHaveText('0')
      await toolbar.getByRole('button', { name: 'Generate UI', exact: true }).dispatchEvent('click')
      await toolbar.getByRole('button', { name: 'MCP', exact: true }).dispatchEvent('click')
      await expect(component.getByTestId('custom-clicks')).toHaveText('0')
      await expect(component.getByTestId('panel-changes')).toHaveText('0')
      await component.update({ props: { entry, preset: 'mixed', disabled: false, itemDisabled: true } })
      await expect(toolbar.locator('button:disabled')).toHaveCount(5)
      await component.update({ props: { entry, preset: 'mixed', disabled: false, itemDisabled: false } })
      await expect(toolbar.locator('button:disabled')).toHaveCount(0)
      await toolbar.getByRole('button', { name: 'MCP', exact: true }).click()
      await expect(component.getByTestId('panel-changes')).toHaveText('1')
    })

    test('preserves pending and required thinking restrictions', async ({ mount }) => {
      const component = await mount(ChatToolbarFixture, { props: { entry, thinkingRequired: true } })
      const thinking = component.getByRole('button', { name: '深度思考', exact: true })
      const search = component.getByRole('button', { name: '联网搜索', exact: true })
      await expect(thinking).toBeDisabled()
      await expect(thinking).toHaveAttribute('aria-pressed', 'true')
      await expect(search).toBeEnabled()
      await component.update({ props: { entry, pending: true, thinkingRequired: false } })
      if (entry === 'runtime') {
        await thinking.click()
        await search.click()
      }
      await expect(thinking).toBeDisabled()
      await expect(search).toBeDisabled()
      await thinking.dispatchEvent('click')
      await search.dispatchEvent('click')
      await expect(component.getByTestId('feature-changes')).toHaveText('0')
    })

    test('supports custom-only toolbars without a model and keeps legacy slots', async ({ mount }) => {
      const component = await mount(ChatToolbarFixture, { props: { entry, preset: 'custom-only', hasModel: false } })
      await expect(component.locator('.tr-chat-toolbar').getByRole('button')).toHaveText(['Generate UI'])
      await component.getByRole('button', { name: 'Generate UI', exact: true }).click()
      await expect(component.getByTestId('custom-clicks')).toHaveText('1')
      await component.update({ props: { entry, preset: 'empty' } })
      await expect(component.locator('.tr-chat-toolbar')).toHaveCount(0)
      await expect(component.getByTestId('legacy-footer')).toBeVisible()
      await expect(component.getByTestId('legacy-footer-right')).toBeVisible()
    })

    test('respects model and MCP region visibility and never forwards toolbar to the DOM', async ({ mount }) => {
      const component = await mount(ChatToolbarFixture, {
        props: { entry, preset: 'mixed', modelVisible: false, mcpVisible: false },
      })
      await expect(component.locator('.tr-chat-toolbar').getByRole('button')).toHaveText(['Generate UI'])
      await expect(component.locator('.tr-sender')).not.toHaveAttribute('toolbar')
    })
  })
}
