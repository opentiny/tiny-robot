import { expect, test } from '@playwright/experimental-ct-vue'
import ChatExtensionTabsFixture from './ChatExtensionTabs.fixture.vue'

test('keeps the MCP-only sender entry compatible', async ({ mount }) => {
  const component = await mount(ChatExtensionTabsFixture, { props: { withSkills: false } })

  const mcpEntry = component.getByRole('button', { name: 'MCP', exact: true })
  await expect(mcpEntry).toBeVisible()
  await expect(component.getByRole('button', { name: '扩展', exact: true })).toHaveCount(0)

  await mcpEntry.click()
  await expect(component.locator('.extension-manager__title')).toHaveText('MCP')
  await expect(component.getByRole('tab', { name: 'MCP', exact: true })).toHaveCount(0)
  await expect(component.getByRole('button', { name: 'Search MCP', exact: true })).toBeVisible()
})

for (const [width, height] of [
  [640, 400],
  [1280, 720],
]) {
  test(`can close extensions inside a narrow floating chat at a ${width}px viewport`, async ({ mount, page }) => {
    await page.setViewportSize({ width, height })
    await mount(ChatExtensionTabsFixture, { props: { withSkills: false, floatingWidth: 420 } })

    const entry = page.getByRole('button', { name: 'MCP', exact: true })
    await entry.click()

    const close = page.getByRole('button', { name: '关闭详情' })
    await close.click()
    await expect(close).toBeHidden()
    await expect(entry).toBeVisible()
  })
}

test('fits custom sidebar widths and keeps the active extension open while resizing the floating chat', async ({
  mount,
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 720 })
  const layout = { leftAside: { width: 300, defaultOpen: true }, rightAside: { width: 760, maxWidth: 640 } }
  const component = await mount(ChatExtensionTabsFixture, { props: { floatingWidth: 1260, layout } })
  await page.getByRole('button', { name: '扩展', exact: true }).click()
  await page.getByRole('tab', { name: 'Skills', exact: true }).click()

  const panel = page.locator('.tr-layout__aside--right')
  const skill = page.getByRole('button', { name: 'Concise Answer', exact: true })
  await expect(panel).toHaveClass(/tr-layout__aside--dock/)

  await component.update({ props: { floatingWidth: 1000, layout } })
  await expect(panel).toHaveClass(/tr-layout__aside--drawer/)
  await expect(skill).toBeVisible()

  await component.update({ props: { floatingWidth: 1260, layout } })
  await expect(panel).toHaveClass(/tr-layout__aside--dock/)
  await expect(skill).toBeVisible()

  await component.update({ props: { floatingWidth: 1000, layout } })
  const close = page.getByRole('button', { name: '关闭详情' })
  await close.click()
  await expect(close).toBeHidden()
})

test('accounts for the CSS main minimum and the current docked left sidebar width', async ({ mount, page }) => {
  await page.setViewportSize({ width: 1440, height: 720 })
  const props = { floatingWidth: 1000, mainMinWidth: 'calc(300px + 100px)' }
  const component = await mount(ChatExtensionTabsFixture, {
    props: { ...props, layout: { leftAside: { open: true }, rightAside: { width: 320 } } },
  })
  await page.getByRole('button', { name: '扩展', exact: true }).click()

  const panel = page.locator('.tr-layout__aside--right')
  await expect(panel).toHaveClass(/tr-layout__aside--drawer/)

  await component.update({
    props: { ...props, layout: { leftAside: { open: false }, rightAside: { width: 320 } } },
  })
  await expect(panel).toHaveClass(/tr-layout__aside--dock/)

  await component.update({
    props: {
      ...props,
      floatingWidth: 800,
      layout: { leftAside: { open: false }, rightAside: { width: 320 } },
    },
  })
  await expect(page.locator('.tr-layout--floating')).toHaveCSS('width', '800px')
  await expect(panel).toHaveClass(/tr-layout__aside--dock/)
  await expect(page.getByRole('button', { name: '关闭详情' })).toBeVisible()
})

test('uses one extension entry for built-in MCP and registered tabs', async ({ mount }) => {
  const component = await mount(ChatExtensionTabsFixture)

  const extensionEntry = component.getByRole('button', { name: '扩展', exact: true })
  await expect(extensionEntry).toBeVisible()
  await expect(extensionEntry).toContainText('1')
  await expect(component.getByRole('button', { name: 'MCP', exact: true })).toHaveCount(0)

  await extensionEntry.click()
  await expect(component.getByRole('tab', { name: 'MCP', exact: true })).toBeVisible()
  await expect(component.getByRole('tab', { name: 'Skills', exact: true })).toBeVisible()
})

test('shows registered tabs when MCP is not configured', async ({ mount }) => {
  const component = await mount(ChatExtensionTabsFixture, { props: { withMcp: false } })

  await component.getByRole('button', { name: '扩展', exact: true }).click()
  await expect(component.locator('.extension-manager__title')).toHaveText('扩展')
  await expect(component.getByRole('tab', { name: 'MCP', exact: true })).toHaveCount(0)
  await expect(component.getByRole('tab', { name: 'Skills', exact: true })).toHaveCount(0)
  await expect(component.getByRole('button', { name: 'Concise Answer', exact: true })).toBeVisible()
})

test('forwards registered tab actions, name clicks, and header actions', async ({ mount }) => {
  const component = await mount(ChatExtensionTabsFixture)

  await component.getByRole('button', { name: '扩展', exact: true }).click()
  await component.getByRole('tab', { name: 'Skills', exact: true }).click()
  await expect(component.getByTestId('event')).toHaveText('{"kind":"tab-change","tabId":"skills"}')
  await expect(component.getByRole('button', { name: 'Import Skill', exact: true })).toBeVisible()

  await component.getByRole('switch', { name: 'Enable Concise Answer', exact: true }).click()
  await expect(component.getByTestId('event')).toHaveText(
    '{"kind":"action","tabId":"skills","sectionKey":"installed","itemId":"concise-answer","action":{"id":"toggle","type":"switch","checked":false}}',
  )

  await component.getByRole('button', { name: 'Concise Answer', exact: true }).click()
  await expect(component.getByTestId('event')).toHaveText(
    '{"kind":"name-click","tabId":"skills","sectionKey":"installed","itemId":"concise-answer"}',
  )

  await component.getByRole('button', { name: 'Import Skill', exact: true }).click()
  await expect(component.getByTestId('extension-overlay')).toHaveText('skills overlay')
  await expect(component.getByRole('tab', { name: 'Skills', exact: true })).toHaveCount(0)
})

test('shows the application secondary panel instead of MCP detail', async ({ mount }) => {
  const component = await mount(ChatExtensionTabsFixture)

  await component.getByRole('button', { name: '扩展', exact: true }).click()
  await component.getByRole('button', { name: 'Search MCP', exact: true }).click()
  await expect(component.getByRole('heading', { name: 'Search MCP', exact: true })).toBeVisible()

  await component.getByTestId('open-extension-overlay').click()

  await expect(component.getByTestId('extension-overlay')).toHaveText('mcp overlay')
  await expect(component.getByRole('heading', { name: 'Search MCP', exact: true })).toHaveCount(0)
})
