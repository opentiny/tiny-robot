import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readClientEnv } from './env.mjs'

test('应用配置按进程变量、.env.local、.env优先级读取', () => {
  const root = mkdtempSync(join(tmpdir(), 'tr-chat-env-'))
  try {
    writeFileSync(
      join(root, '.env'),
      'VITE_QWEN_API_URL="https://example.test/v1?name=one"\nVITE_DEEPSEEK_API_KEY="file-key"\nVITE_ALIYUN_DASHSCOPE_KEY="qwen-file-key"\n',
    )
    writeFileSync(join(root, '.env.local'), 'VITE_DEEPSEEK_API_KEY="local-key"\n')
    const result = readClientEnv(root, { VITE_QWEN_API_URL: 'https://proxy.test/v1' })
    assert.equal(result.VITE_QWEN_API_URL, 'https://proxy.test/v1')
    assert.equal(result.VITE_DEEPSEEK_API_KEY, 'local-key')
    assert.equal(result.VITE_ALIYUN_DASHSCOPE_KEY, 'qwen-file-key')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
test('缺少.env时提供空配置，服务端专用变量不会进入客户端配置', () => {
  const root = mkdtempSync(join(tmpdir(), 'tr-chat-env-'))
  try {
    const result = readClientEnv(root, { DATABASE_PASSWORD: 'server-only-value' })
    assert.deepEqual(result, {
      VITE_QWEN_API_URL: '',
      VITE_DEEPSEEK_API_URL: '',
      VITE_ALIYUN_DASHSCOPE_KEY: '',
      VITE_DEEPSEEK_API_KEY: '',
    })
    assert.equal(Object.hasOwn(result, 'DATABASE_PASSWORD'), false)
    assert.equal(JSON.stringify(result).includes('server-only-value'), false)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
