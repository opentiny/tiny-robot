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
