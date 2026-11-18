import { ref } from 'vue'
import type { WebMcpContext, WebMcpToolDescriptor } from '@opentiny/tiny-robot-chat'

export function createDemoPageTools() {
  const section = ref('overview')
  const statusToolAdded = ref(false)
  const listeners = new Set<() => void>()
  const tools: WebMcpToolDescriptor[] = [
    {
      name: 'get-page-info',
      description: '读取当前页面的标题和页面区域。',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'set-page-section',
      description: '切换当前页面展示区域。',
      inputSchema: {
        type: 'object',
        properties: { section: { type: 'string' } },
        required: ['section'],
      },
    },
  ]

  const context: WebMcpContext = {
    getTools: async () => tools,
    executeTool: async (tool, input) => {
      const args = JSON.parse(input || '{}') as Record<string, unknown>

      if (tool.name === 'get-page-info') {
        return {
          content: [{ type: 'text', text: JSON.stringify({ title: 'WebMCP Demo', section: section.value }) }],
        }
      }

      if (tool.name === 'set-page-section') {
        section.value = typeof args.section === 'string' ? args.section : section.value
        return {
          content: [{ type: 'text', text: `页面区域已切换为：${section.value}` }],
        }
      }

      if (tool.name === 'get-demo-status') {
        return {
          content: [{ type: 'text', text: `当前页面区域：${section.value}` }],
        }
      }

      throw new Error(`未知页面工具：${tool.name}`)
    },
    addEventListener: (type, listener) => {
      if (type === 'toolchange') listeners.add(listener)
    },
    removeEventListener: (type, listener) => {
      if (type === 'toolchange') listeners.delete(listener)
    },
  }

  return {
    context,
    section,
    statusToolAdded,
    addStatusTool() {
      if (tools.some((tool) => tool.name === 'get-demo-status')) return
      tools.push({
        name: 'get-demo-status',
        description: '读取当前 Demo 状态。',
        inputSchema: { type: 'object', properties: {} },
      })
      statusToolAdded.value = true
      listeners.forEach((listener) => listener())
    },
    resetTools() {
      const index = tools.findIndex((tool) => tool.name === 'get-demo-status')
      if (index === -1) return
      tools.splice(index, 1)
      statusToolAdded.value = false
      listeners.forEach((listener) => listener())
    },
  }
}
