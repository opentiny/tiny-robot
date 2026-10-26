import { expect, test } from '@playwright/experimental-ct-vue'
import ChatMcpPanelFixture from './ChatMcpPanel.fixture.vue'

test('opens installed MCP details and forwards a tool switch', async ({ mount }) => {
  const component = await mount(ChatMcpPanelFixture)

  await component.getByRole('button', { name: 'Installed Server' }).click()
  await component.getByRole('switch', { name: '启用 Search Tool' }).click()

  await expect(component.getByTestId('event')).toHaveText(
    '{"kind":"tool","serverId":"installed","toolId":"search","enabled":false}',
  )
})

test('submits a normalized custom MCP configuration with its input source', async ({ mount }) => {
  const component = await mount(ChatMcpPanelFixture)

  await component.getByRole('button', { name: '自定义添加' }).click()
  await component.getByRole('button', { name: '返回列表' }).click()
  await component.getByRole('button', { name: '自定义添加' }).click()
  await component.getByRole('textbox', { name: '名称' }).fill('Custom Server')
  await component.getByRole('textbox', { name: 'URL', exact: true }).fill('https://example.com/mcp')
  await component.getByRole('button', { name: '确定' }).click()

  await expect(component.getByTestId('event')).toHaveText(
    '{"kind":"create","config":{"name":"Custom Server","type":"sse","url":"https://example.com/mcp"},"source":"form"}',
  )
})

test('forwards install, enable, and remove requests for the selected server', async ({ mount }) => {
  const component = await mount(ChatMcpPanelFixture)

  await component.locator('[data-card-id="available"]').getByRole('button', { name: '安装' }).click()
  await expect(component.getByTestId('event')).toHaveText('{"kind":"add","id":"available"}')

  await component.locator('[data-card-id="installed"]').getByRole('switch').click()
  await expect(component.getByTestId('event')).toHaveText('{"kind":"server","id":"installed","enabled":false}')

  await component.locator('[data-card-id="installed"]').getByRole('button', { name: '更多操作' }).click()
  const removeButton = component.getByRole('button', { name: '卸载' })
  await expect(removeButton).toHaveText('卸载')
  await removeButton.click()
  await expect(component.getByTestId('event')).toHaveText('{"kind":"remove","id":"installed"}')
})
