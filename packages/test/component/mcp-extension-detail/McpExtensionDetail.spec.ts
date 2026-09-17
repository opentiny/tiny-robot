import { expect, test } from '@playwright/experimental-ct-vue'
import McpExtensionDetailFixture from './McpExtensionDetail.fixture.vue'

test.describe('McpExtensionDetail', () => {
  test('renders metadata and emits controlled tool-toggle intent', async ({ mount }) => {
    const component = await mount(McpExtensionDetailFixture)
    const detail = component.getByTestId('detail')

    await expect(detail).toContainText('名称：GenUI MCP')
    await expect(detail).toContainText('描述：生成 OpenTiny GenUI schema.json 时使用的 MCP。')
    await expect(detail).toContainText('3 个工具')
    await expect(detail).toContainText('更新于 2026-07-10')

    const searchToggle = detail.getByRole('switch', { name: '启用 webSearch' })
    await expect(searchToggle).not.toBeChecked()
    await searchToggle.click()
    await expect(component.getByTestId('toggle-output')).toHaveText(JSON.stringify({ toolId: 'search', enabled: true }))
    await expect(searchToggle).not.toBeChecked()

    await expect(detail.getByRole('switch', { name: '启用 restrictedTool' })).toBeDisabled()
  })

  test('renders an empty tool state without blank metadata', async ({ mount }) => {
    const component = await mount(McpExtensionDetailFixture)
    const detail = component.getByTestId('empty-detail')

    await expect(detail).toContainText('名称：Empty MCP')
    await expect(detail).toContainText('描述：暂无描述')
    await expect(detail).toContainText('0 个工具')
    await expect(detail).toContainText('暂无可用工具')
    await expect(detail.getByText(/更新于/)).toHaveCount(0)
  })
})
