import { expect, test } from '@playwright/experimental-ct-vue'
import WebMcpIntegrationFixture from './WebMcpIntegration.fixture.vue'

test.describe('WebMCP Adapter browser integration', () => {
  test('uses the official SDK and coexists with a normal MCP adapter', async ({ mount }) => {
    const component = await mount(WebMcpIntegrationFixture)

    await expect(component.getByTestId('server-ids')).toHaveText('page-webmcp,normal-mcp')
    await expect(component.getByTestId('webmcp-tool-count')).toHaveText('2')
    await expect(component.getByTestId('registration-error')).toHaveText('')

    await component.getByTestId('call-page-tool').click()
    await expect(component.getByTestId('call-result')).toHaveText('section:overview')

    await component.getByTestId('add-dynamic-tool').click()
    await expect(component.getByTestId('webmcp-tool-count')).toHaveText('3')
    await expect(component.getByTestId('dynamic-tool-state')).toHaveText('added')

    await component.getByTestId('remove-dynamic-tool').click()
    await expect(component.getByTestId('webmcp-tool-count')).toHaveText('2')
    await expect(component.getByTestId('dynamic-tool-state')).toHaveText('removed')

    const pageTool = component.getByRole('checkbox', { name: 'Enable get-page-info' })
    await expect(pageTool).toBeChecked()
    await pageTool.click()
    await expect(pageTool).not.toBeChecked()

    await component.getByTestId('toggle-server').click()
    await expect(component.getByTestId('webmcp-server-enabled')).toHaveText('disabled')
    await component.getByTestId('toggle-server').click()
    await expect(component.getByTestId('webmcp-server-enabled')).toHaveText('enabled')
  })
})
