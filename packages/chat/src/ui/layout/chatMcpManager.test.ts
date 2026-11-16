import { describe, expect, it } from 'vitest'
import { createChatMcpManagerTab } from './chatMcpManager'

const labels = {
  mcp: 'MCP',
  mcpInstallServer: '安装',
  mcpRetryServer: '重试',
  mcpRemoveServer: '移除',
}

describe('Chat MCP manager data', () => {
  it('shows each server once in the installed or available section with its available actions', () => {
    const tab = createChatMcpManagerTab(
      {
        servers: [
          { id: 'ready', name: 'Ready', installed: true, enabled: true, category: 'Search' },
          { id: 'new', name: 'New', installed: false, enabled: false, category: 'Search' },
        ],
      },
      labels,
    )

    expect(tab.items).toHaveLength(2)
    expect(tab.items).toMatchObject([
      {
        id: 'ready',
        installed: true,
        tags: ['Search'],
        nameClickable: true,
        actions: [
          { id: 'toggle', type: 'switch', checked: true },
          { id: 'remove', type: 'button' },
        ],
      },
      {
        id: 'new',
        installed: false,
        nameClickable: false,
        actions: [{ id: 'add', type: 'button' }],
      },
    ])
  })

  it('disables actions while the corresponding server request is pending', () => {
    const tab = createChatMcpManagerTab(
      { servers: [{ id: 'busy', name: 'Busy', installed: true, enabled: false, loading: true }] },
      labels,
    )

    expect(tab.items[0]).toMatchObject({
      progress: 'indeterminate',
      nameClickable: false,
      actions: [{ disabled: true }, { disabled: true }],
    })
  })

  it('uses concise action labels for each server card', () => {
    const tab = createChatMcpManagerTab(
      {
        servers: [
          { id: 'first', name: 'First Server', installed: true, enabled: true },
          { id: 'second', name: 'Second Server', installed: true, enabled: false },
          { id: 'third', name: 'Third Server', installed: false, enabled: false },
        ],
      },
      labels,
    )

    expect(
      tab.items.map((item) => item.actions?.filter((action) => action.type === 'button').map((action) => action.label)),
    ).toEqual([['移除'], ['移除'], ['安装']])
  })

  it('shows a retry action and a safe connection error description', () => {
    const tab = createChatMcpManagerTab(
      { servers: [{ id: 'broken', name: 'Broken', installed: true, enabled: false, error: new Error('offline') }] },
      labels,
    )

    expect(tab.items[0]).toMatchObject({
      description: '连接失败：offline',
    })
    expect(tab.items[0].actions?.slice(0, 2)).toMatchObject([
      { id: 'retry', type: 'button', label: '重试' },
      { id: 'toggle', type: 'switch' },
    ])
  })
})
