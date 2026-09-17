import { expect, test } from '@playwright/experimental-ct-vue'
import McpExtensionFormFixture from './McpExtensionForm.fixture.vue'

test.describe('McpExtensionForm', () => {
  test('exposes required semantics only for required form fields', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)

    const name = component.getByRole('textbox', { name: '名称' })
    const type = component.getByRole('radiogroup', { name: '类型' })
    const url = component.getByRole('textbox', { name: 'URL', exact: true })

    await expect(name).toHaveAttribute('required', '')
    await expect(type).toHaveAttribute('aria-required', 'true')
    await expect(url).toHaveAttribute('required', '')

    await expect(component.getByRole('textbox', { name: '描述' })).not.toHaveAttribute('required', '')
    await expect(component.getByRole('textbox', { name: '请求头' })).not.toHaveAttribute('required', '')
    await expect(component.getByRole('textbox', { name: '缩略图 URL' })).not.toHaveAttribute('required', '')
  })

  test('reflects a replacement model supplied by the host', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)

    await component.getByTestId('replace-model').click()

    await expect(component.getByRole('textbox', { name: '名称' })).toHaveValue('Updated MCP')
    await expect(component.getByRole('textbox', { name: 'URL', exact: true })).toHaveValue('https://example.com/sse')
    await expect(component.locator('input[type="radio"][value="sse"]')).toBeChecked()
  })

  test('emits complete controlled drafts and preserves both entry modes while switching', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)

    await component.getByRole('textbox', { name: '名称' }).fill('Controlled MCP')
    await component.getByText('代码添加', { exact: true }).click()
    await component.getByRole('textbox', { name: 'MCP JSON 配置' }).fill('{"mcpServers":{}}')
    await component.getByText('表单添加', { exact: true }).click()

    await expect(component.getByRole('textbox', { name: '名称' })).toHaveValue('Controlled MCP')
    await expect(component.getByTestId('model-output')).toContainText('"code":"{\\"mcpServers\\":{}}"')
  })

  test('updates the controlled entry mode and transport type through radio controls', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)

    const codeMode = component.getByRole('radio', { name: '代码添加' })
    await component.getByText('代码添加', { exact: true }).click()
    await expect(codeMode).toBeChecked()
    await expect(component.getByTestId('model-output')).toContainText('"addType":"code"')

    await component.getByText('表单添加', { exact: true }).click()
    const sse = component.getByRole('radio', { name: '服务器发送事件（SSE）' })
    await component.getByText('服务器发送事件（SSE）', { exact: true }).click()
    await expect(sse).toBeChecked()
    await expect(component.getByTestId('model-output')).toContainText('"type":"sse"')
  })

  test('blocks an invalid form submission and focuses the first invalid field', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)

    await component.getByRole('button', { name: '确定' }).click()

    const name = component.getByRole('textbox', { name: '名称' })
    await expect(name).toHaveAttribute('aria-invalid', 'true')
    await expect(name).toBeFocused()
    await expect(component.getByTestId('submit-output')).toBeEmpty()
  })

  test('rejects invalid form fields before submission', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)

    await component.getByRole('textbox', { name: '名称' }).fill('Invalid MCP')
    await component.getByRole('textbox', { name: '描述' }).fill('a'.repeat(1001))
    await component.getByRole('textbox', { name: 'URL', exact: true }).fill('ftp://example.com/mcp')
    await component.getByRole('textbox', { name: '请求头' }).fill('[]')
    await component.getByRole('textbox', { name: '缩略图 URL' }).fill('not-a-url')
    await component.getByRole('button', { name: '确定' }).click()

    const description = component.getByRole('textbox', { name: '描述' })
    await expect(description).toHaveAttribute('aria-invalid', 'true')
    await expect(component.getByRole('textbox', { name: 'URL', exact: true })).toHaveAttribute('aria-invalid', 'true')
    await expect(component.getByRole('textbox', { name: '请求头' })).toHaveAttribute('aria-invalid', 'true')
    await expect(component.getByRole('textbox', { name: '缩略图 URL' })).toHaveAttribute('aria-invalid', 'true')
    await expect(description).toBeFocused()
    await expect(component.getByTestId('submit-output')).toBeEmpty()
  })

  test('clears only the corrected field error after that field becomes valid', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)
    const name = component.getByRole('textbox', { name: '名称' })
    const description = component.getByRole('textbox', { name: '描述' })
    const url = component.getByRole('textbox', { name: 'URL', exact: true })
    const headers = component.getByRole('textbox', { name: '请求头' })
    const thumbnail = component.getByRole('textbox', { name: '缩略图 URL' })

    await description.fill('a'.repeat(1001))
    await url.fill('ftp://example.com/mcp')
    await headers.fill('[]')
    await thumbnail.fill('not-a-url')
    await component.getByRole('button', { name: '确定' }).click()

    await name.fill('   ')
    await expect(name).toHaveAttribute('aria-invalid', 'true')
    await name.fill('Weather MCP')
    await expect(name).toHaveAttribute('aria-invalid', 'false')
    await expect(url).toHaveAttribute('aria-invalid', 'true')

    await description.fill('a'.repeat(1000))
    await expect(description).toHaveAttribute('aria-invalid', 'false')

    await url.fill('https://')
    await expect(url).toHaveAttribute('aria-invalid', 'true')
    await url.fill('https://example.com/mcp')
    await expect(url).toHaveAttribute('aria-invalid', 'false')

    await headers.fill('[1]')
    await expect(headers).toHaveAttribute('aria-invalid', 'true')
    await headers.fill('{}')
    await expect(headers).toHaveAttribute('aria-invalid', 'false')

    await thumbnail.fill('ftp://example.com/icon.svg')
    await expect(thumbnail).toHaveAttribute('aria-invalid', 'true')
    await thumbnail.fill('')
    await expect(thumbnail).toHaveAttribute('aria-invalid', 'false')
  })

  test('submits a normalized form payload after validation succeeds', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)

    await component.getByRole('textbox', { name: '名称' }).fill('  Weather MCP  ')
    await component.getByRole('textbox', { name: '描述' }).fill('Weather tools')
    await component.getByRole('textbox', { name: 'URL', exact: true }).fill('  https://example.com/mcp  ')
    await component.getByRole('textbox', { name: '请求头' }).fill('{"Authorization":"Bearer token","retry":2}')
    await component.getByRole('button', { name: '确定' }).click()

    await expect(component.getByTestId('submit-output')).toHaveText(
      JSON.stringify({
        source: 'form',
        value: {
          name: 'Weather MCP',
          description: 'Weather tools',
          type: 'streamableHttp',
          url: 'https://example.com/mcp',
          headers: { Authorization: 'Bearer token', retry: 2 },
          thumbnail: null,
        },
      }),
    )
  })

  test('requires a top-level JSON object in code mode and submits the original string', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)

    await component.getByText('代码添加', { exact: true }).click()
    const code = component.getByRole('textbox', { name: 'MCP JSON 配置' })
    await code.fill('[]')
    await component.getByRole('button', { name: '确定' }).click()

    await expect(code).toHaveAttribute('aria-invalid', 'true')
    await expect(code).toBeFocused()
    await expect(component.getByTestId('submit-output')).toBeEmpty()

    const raw = '  {"mcpServers":{"weather":{"url":"https://example.com"}}}  '
    await code.fill(raw)
    await component.getByRole('button', { name: '确定' }).click()

    await expect(component.getByTestId('submit-output')).toHaveText(JSON.stringify({ source: 'code', value: raw }))
  })

  test('keeps a code error until the configuration becomes a valid JSON object', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)

    await component.getByText('代码添加', { exact: true }).click()
    const code = component.getByRole('textbox', { name: 'MCP JSON 配置' })
    await code.fill('[]')
    await component.getByRole('button', { name: '确定' }).click()

    await code.fill('{')
    await expect(code).toHaveAttribute('aria-invalid', 'true')
    await code.fill('{}')
    await expect(code).toHaveAttribute('aria-invalid', 'false')
  })

  test('uses the default thumbnail when empty and previews URL edits', async ({ mount, page }) => {
    const thumbnailUrl = 'https://assets.example.test/icon.svg'
    await page.route(thumbnailUrl, async (route) => {
      await route.fulfill({
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"></svg>',
      })
    })

    const component = await mount(McpExtensionFormFixture)
    const thumbnailInput = component.getByRole('textbox', { name: '缩略图 URL' })
    const thumbnail = component.getByRole('img', { name: 'MCP 缩略图' })

    await expect(thumbnailInput).toHaveValue('')
    await expect(thumbnail).toHaveAttribute('src', /^data:image\/svg\+xml/)
    await thumbnailInput.fill(thumbnailUrl)
    await expect(thumbnail).toHaveAttribute('src', thumbnailUrl)
    await expect(component.getByTestId('model-output')).toContainText(`"thumbnail":"${thumbnailUrl}"`)
  })

  test('falls back to the default thumbnail when the URL image cannot load', async ({ mount, page }) => {
    const brokenThumbnailUrl = 'https://assets.example.test/missing.png'
    await page.route(brokenThumbnailUrl, async (route) => route.abort())

    const component = await mount(McpExtensionFormFixture)
    const thumbnailInput = component.getByRole('textbox', { name: '缩略图 URL' })
    const thumbnail = component.getByRole('img', { name: 'MCP 缩略图' })

    await thumbnailInput.fill(brokenThumbnailUrl)
    await expect(component.getByText('图片加载失败，已显示默认缩略图')).toBeVisible()
    await expect(thumbnailInput).toHaveAttribute('aria-invalid', 'true')
    await expect(thumbnailInput).toHaveAttribute('aria-describedby', /thumbnail-load-error$/)
    await expect(thumbnail).toHaveAttribute('src', /^data:image\/svg\+xml/)
  })

  test('emits cancel without resetting and disables interaction while submitting', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)

    await component.getByRole('textbox', { name: '名称' }).fill('Draft MCP')
    await component.getByRole('button', { name: '取消' }).click()
    await expect(component.getByTestId('cancel-count')).toHaveText('1')
    await expect(component.getByRole('textbox', { name: '名称' })).toHaveValue('Draft MCP')

    await component.getByTestId('toggle-submitting').click()
    await expect(component.getByRole('textbox', { name: '名称' })).toBeDisabled()
    await expect(component.getByRole('radio', { name: '表单添加' })).toBeDisabled()
    await expect(component.getByRole('radio', { name: '服务器发送事件（SSE）' })).toBeDisabled()
    await expect(component.getByRole('button', { name: '取消' })).toBeDisabled()
    await expect(component.getByRole('button', { name: '提交中…' })).toBeDisabled()
  })
})
