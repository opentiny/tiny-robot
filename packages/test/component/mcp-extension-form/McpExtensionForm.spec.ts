import { expect, test } from '@playwright/experimental-ct-vue'
import McpExtensionFormFixture from './McpExtensionForm.fixture.vue'

test.describe('McpExtensionForm', () => {
  test('exposes required semantics only for required form fields', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)

    await expect(component.getByRole('textbox', { name: '名称' })).toHaveAttribute('required', '')
    await expect(component.getByRole('radiogroup', { name: '类型' })).toHaveAttribute('aria-required', 'true')
    await expect(component.getByRole('textbox', { name: 'URL', exact: true })).toHaveAttribute('required', '')

    await expect(component.getByRole('textbox', { name: '描述' })).not.toHaveAttribute('required', '')
    await expect(component.getByRole('textbox', { name: '请求头' })).not.toHaveAttribute('required', '')
    await expect(component.getByRole('textbox', { name: '缩略图 URL' })).not.toHaveAttribute('required', '')
  })

  test('reflects a normalized replacement value supplied by the host', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)

    await component.getByTestId('replace-model').click()

    await expect(component.getByRole('textbox', { name: '名称' })).toHaveValue('Updated MCP')
    await expect(component.getByRole('textbox', { name: '描述' })).toHaveValue('Updated by the host.')
    await expect(component.getByRole('textbox', { name: '请求头' })).toHaveValue(
      JSON.stringify({ Authorization: 'Bearer token' }, null, 2),
    )
    await expect(component.getByRole('textbox', { name: 'URL', exact: true })).toHaveValue('https://example.com/sse')
    await expect(component.locator('input[type="radio"][value="sse"]')).toBeChecked()
  })

  test('supports a controlled mode', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)

    await component.getByText('代码添加', { exact: true }).click()
    await expect(component.getByRole('radio', { name: '代码添加' })).toBeChecked()
    await expect(component.getByTestId('mode-output')).toHaveText('code')
  })

  test('syncs the latest model when the host directly switches the controlled mode', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)

    await component.getByTestId('replace-model').click()
    await component.getByRole('textbox', { name: '名称' }).fill('Edited in form')
    await expect(component.getByTestId('model-output')).toContainText('"name":"Edited in form"')

    await component.getByTestId('set-mode-code').click()
    const code = component.getByRole('textbox', { name: 'MCP JSON 配置' })
    await expect(code).toHaveValue(/"Edited in form"/)

    await code.fill(
      JSON.stringify({
        mcpServers: {
          'Edited in code': {
            type: 'sse',
            url: 'https://example.com/code',
          },
        },
      }),
    )
    await expect(component.getByTestId('model-output')).toContainText('"name":"Edited in code"')

    await component.getByTestId('set-mode-form').click()
    await expect(component.getByRole('textbox', { name: '名称' })).toHaveValue('Edited in code')
  })

  test('uses defaultMode when mode is uncontrolled', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture, {
      props: { controlledMode: false, defaultMode: 'code' },
    })

    const code = component.getByRole('textbox', { name: 'MCP JSON 配置' })
    await expect(component.getByRole('radio', { name: '代码添加' })).toBeChecked()
    await expect(code).toHaveValue('')
    await expect(code).toHaveAttribute(
      'placeholder',
      '{\n  "mcpServers": {\n    "mcp-server": {\n      "type": "sse",\n      "url": ""\n    }\n  }\n}',
    )

    await component.getByText('表单添加', { exact: true }).click()
    await component.getByRole('textbox', { name: '名称' }).fill('Weather MCP')
    await component.getByText('代码添加', { exact: true }).click()

    await expect(component.getByRole('radio', { name: '代码添加' })).toBeChecked()
    await expect(code).toHaveValue(
      '{\n  "mcpServers": {\n    "Weather MCP": {\n      "type": "streamableHttp",\n      "url": ""\n    }\n  }\n}',
    )
  })

  test('updates the normalized value from valid form input', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)

    await component.getByRole('textbox', { name: '名称' }).fill('  Weather MCP  ')
    await component.getByRole('textbox', { name: '描述' }).fill('Weather tools')
    await component.getByRole('textbox', { name: 'URL', exact: true }).fill('  https://example.com/mcp  ')
    await component.getByRole('textbox', { name: '请求头' }).fill('{"Authorization":"Bearer token","retry":2}')

    const model = await component
      .getByTestId('model-output')
      .evaluate((element) => JSON.parse(element.textContent ?? ''))
    expect(model).toEqual({
      name: 'Weather MCP',
      description: 'Weather tools',
      type: 'streamableHttp',
      url: 'https://example.com/mcp',
      headers: { Authorization: 'Bearer token', retry: '2' },
    })
  })

  test('preserves invalid headers while propagating representable edits across mode switches', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)
    const name = component.getByRole('textbox', { name: '名称' })
    const headers = component.getByRole('textbox', { name: '请求头' })

    await headers.fill('{"Authorization":"Bearer token"}')
    await headers.fill('{')
    await name.fill('Draft MCP')

    const model = await component
      .getByTestId('model-output')
      .evaluate((element) => JSON.parse(element.textContent ?? ''))
    expect(model).toMatchObject({ name: 'Draft MCP', headers: { Authorization: 'Bearer token' } })

    await component.getByText('代码添加', { exact: true }).click()
    await expect(component.getByRole('textbox', { name: 'MCP JSON 配置' })).toHaveValue(/Draft MCP/)
    await component.getByText('表单添加', { exact: true }).click()

    await expect(name).toHaveValue('Draft MCP')
    await expect(headers).toHaveValue('{')
  })

  test('replaces an invalid form header draft after valid code edits', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)
    const headers = component.getByRole('textbox', { name: '请求头' })

    await component.getByTestId('replace-model').click()
    await headers.fill('{')
    await component.getByText('代码添加', { exact: true }).click()
    await component.getByRole('textbox', { name: 'MCP JSON 配置' }).fill(
      JSON.stringify({
        mcpServers: {
          'Code MCP': {
            type: 'sse',
            url: 'https://example.com/code',
            headers: { Authorization: 'Bearer code' },
          },
        },
      }),
    )
    await expect(component.getByTestId('model-output')).toContainText('"Authorization":"Bearer code"')

    await component.getByText('表单添加', { exact: true }).click()
    await expect(headers).toHaveValue(JSON.stringify({ Authorization: 'Bearer code' }, null, 2))
  })

  test('preserves header names that overlap object prototype properties', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)

    await component.getByRole('textbox', { name: '请求头' }).fill('{"__proto__":"safe","constructor":"ctor"}')

    const modelOutput = component.getByTestId('model-output')
    await expect(modelOutput).toContainText('"__proto__":"safe"')
    await expect(modelOutput).toContainText('"constructor":"ctor"')
  })

  test('blocks invalid form submission and focuses the first invalid field', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)

    await component.getByRole('button', { name: '确定' }).click()

    const name = component.getByRole('textbox', { name: '名称' })
    await expect(name).toHaveAttribute('aria-invalid', 'true')
    await expect(name).toBeFocused()
    await expect(component.getByTestId('submit-output')).toBeEmpty()
  })

  test('rejects invalid optional fields before submission', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)

    await component.getByRole('textbox', { name: '名称' }).fill('Invalid MCP')
    await component.getByRole('textbox', { name: '描述' }).fill('a'.repeat(1001))
    await component.getByRole('textbox', { name: 'URL', exact: true }).fill('https://example.com/mcp')
    await component.getByRole('textbox', { name: '请求头' }).fill('[]')
    await component.getByRole('textbox', { name: '缩略图 URL' }).fill('not-a-url')
    await component.getByRole('button', { name: '确定' }).click()

    const description = component.getByRole('textbox', { name: '描述' })
    await expect(description).toHaveAttribute('aria-invalid', 'true')
    await expect(component.getByRole('textbox', { name: '请求头' })).toHaveAttribute('aria-invalid', 'true')
    await expect(component.getByRole('textbox', { name: '缩略图 URL' })).toHaveAttribute('aria-invalid', 'true')
    await expect(description).toBeFocused()
    await expect(component.getByTestId('submit-output')).toBeEmpty()
  })

  test('applies the description limit after trimming surrounding whitespace', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)
    const description = component.getByRole('textbox', { name: '描述' })

    await component.getByRole('textbox', { name: '名称' }).fill('Weather MCP')
    await description.fill(` ${'a'.repeat(1000)} `)
    await component.getByRole('textbox', { name: 'URL', exact: true }).fill('https://example.com/mcp')
    await component.getByRole('button', { name: '确定' }).click()

    await expect(description).toHaveAttribute('aria-invalid', 'false')
    await expect(component.getByTestId('submit-output')).toContainText(`"description":"${'a'.repeat(1000)}"`)
  })

  test('clears only a corrected field error after that field becomes valid', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)
    const description = component.getByRole('textbox', { name: '描述' })
    const headers = component.getByRole('textbox', { name: '请求头' })

    await description.fill('a'.repeat(1001))
    await headers.fill('[]')
    await component.getByRole('button', { name: '确定' }).click()

    await description.fill('a'.repeat(1000))
    await expect(description).toHaveAttribute('aria-invalid', 'false')
    await expect(headers).toHaveAttribute('aria-invalid', 'true')

    await headers.fill('{}')
    await expect(headers).toHaveAttribute('aria-invalid', 'false')
  })

  test('submits one normalized value and omits empty optional fields', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)

    await component.getByRole('textbox', { name: '名称' }).fill('  Weather MCP  ')
    await component.getByRole('textbox', { name: 'URL', exact: true }).fill('  https://example.com/mcp  ')
    await component.getByRole('button', { name: '确定' }).click()

    await expect(component.getByTestId('submit-output')).toHaveText(
      JSON.stringify({
        value: {
          name: 'Weather MCP',
          type: 'streamableHttp',
          url: 'https://example.com/mcp',
        },
        source: 'form',
      }),
    )
  })

  test('validates code as a single MCP server config and submits the normalized value', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)

    await component.getByText('代码添加', { exact: true }).click()
    const code = component.getByRole('textbox', { name: 'MCP JSON 配置' })
    await code.fill('{"mcpServers":{}}')
    await component.getByRole('button', { name: '确定' }).click()

    await expect(code).toHaveAttribute('aria-invalid', 'true')
    await expect(code).toBeFocused()
    await expect(component.getByTestId('submit-output')).toBeEmpty()

    await code.fill(
      JSON.stringify({
        mcpServers: {
          weather: {
            type: 'http',
            url: ' https://example.com/mcp ',
            headers: { Authorization: 'Bearer token', retry: 2 },
          },
        },
      }),
    )

    const model = await component
      .getByTestId('model-output')
      .evaluate((element) => JSON.parse(element.textContent ?? ''))
    expect(model).toEqual({
      name: 'weather',
      type: 'streamableHttp',
      url: 'https://example.com/mcp',
      headers: { Authorization: 'Bearer token', retry: '2' },
    })

    await component.getByRole('button', { name: '确定' }).click()

    await expect(component.getByTestId('submit-output')).toHaveText(
      JSON.stringify({
        value: {
          name: 'weather',
          type: 'streamableHttp',
          url: 'https://example.com/mcp',
          headers: { Authorization: 'Bearer token', retry: '2' },
        },
        source: 'code',
      }),
    )
  })

  test('keeps a code error until the input becomes one valid server config', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)

    await component.getByText('代码添加', { exact: true }).click()
    const code = component.getByRole('textbox', { name: 'MCP JSON 配置' })
    await code.fill('{"mcpServers":{}}')
    await component.getByRole('button', { name: '确定' }).click()

    await code.fill('{')
    await expect(code).toHaveAttribute('aria-invalid', 'true')
    await code.fill('{"mcpServers":{"weather":{"url":"https://example.com/mcp"}}}')
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

  test('emits cancel without resetting the draft', async ({ mount }) => {
    const component = await mount(McpExtensionFormFixture)

    await component.getByRole('textbox', { name: '名称' }).fill('Draft MCP')
    await component.getByRole('button', { name: '取消' }).click()

    await expect(component.getByTestId('cancel-count')).toHaveText('1')
    await expect(component.getByRole('textbox', { name: '名称' })).toHaveValue('Draft MCP')
  })
})
