import type { WebMcpContext, WebMcpToolDescriptor } from '@opentiny/tiny-robot-chat'
import assert from 'node:assert/strict'
// eslint-disable-next-line test/no-import-node-test
import test from 'node:test'
import { waitForPageTools } from '../src/tiny-robot-chat/webmcp-tools'

class TestContext extends EventTarget {
  tools: WebMcpToolDescriptor[] = []

  async getTools() {
    return this.tools
  }

  registerTool(name: string) {
    this.tools.push({ name })
    this.dispatchEvent(new Event('toolchange'))
  }
}

test('waits until all tools for the target route are registered', async () => {
  const context = new TestContext()
  const ready = waitForPageTools(context as unknown as WebMcpContext, '/vue-pro/role/allRole', 100)

  context.registerTool('add-role')
  context.registerTool('bind-menu-for-role')

  assert.deepEqual(await ready, ['add-role', 'bind-menu-for-role'])
})

test('returns immediately for routes without page tools', async () => {
  const context = new TestContext()

  assert.deepEqual(await waitForPageTools(context as unknown as WebMcpContext, '/vue-pro/overview'), [])
})

test('times out when the target page does not register its tools', async () => {
  const context = new TestContext()

  await assert.rejects(
    waitForPageTools(context as unknown as WebMcpContext, '/vue-pro/role/allRole', 10),
    /页面工具尚未就绪：add-role, bind-menu-for-role/,
  )
})
