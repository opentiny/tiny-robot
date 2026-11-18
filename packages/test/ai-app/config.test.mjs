import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createChatConfig as angular } from '../../../examples/tr-chat-app-angular/src/chat/config.ts'
import { createChatConfig as react } from '../../../examples/tr-chat-app-react/src/chat/config.ts'
for (const [host, create] of [
  ['angular', angular],
  ['react', react],
]) {
  test(`${host} 未配置服务时不创建不可用的模型选项`, () => {
    assert.equal(create({}, 'http://localhost:3000').modelProviders.length, 0)
  })
  test(`${host} 相对代理地址与预设模型可直接使用`, () => {
    const config = create({ VITE_QWEN_API_URL: '/api/qwen' }, 'http://localhost:3000')
    assert.equal(config.modelProviders.length, 1)
    assert.equal(config.modelProviders[0].apiUrl, 'http://localhost:3000/api/qwen')
    assert.deepEqual(
      config.modelProviders[0].models.map((model) => model.id),
      ['qwen3.7-flash', 'qwen3.7-plus', 'qwen3.7-max'],
    )
    assert.equal(Boolean(config.modelProviders[0].apiKey), false)
    assert.equal(config.mcpServers[1].baseUrl, 'http://localhost:3000/modelcontextprotocol-mcp')
  })
}
