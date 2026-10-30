import { computed, ref, shallowRef } from 'vue'
import type {
  ExtensionCardAction,
  ExtensionManagerActionEvent,
  ExtensionManagerNameClickEvent,
  ExtensionManagerTab,
  ExtensionManagerTabChangeEvent,
} from '@opentiny/tiny-robot'
import type {
  ChatMcpAddServerPayload,
  ChatMcpCreateServerPayload,
  ChatMcpRemoveServerPayload,
  ChatMcpServerEnabledChangePayload,
  ChatMcpServerView,
  ChatMcpToolEnabledChangePayload,
  ChatMcpToolMap,
  ChatUIData,
  ChatUIOptions,
} from '@opentiny/tiny-robot-chat'

function createInstalledSkillActions(name: string, checked = true): ExtensionCardAction[] {
  return [
    { id: 'toggle', type: 'switch', label: `启用${name}`, checked },
    { id: 'uninstall', type: 'button', label: '卸载', danger: true },
  ]
}

function createSkillInstallAction(): ExtensionCardAction[] {
  return [{ id: 'install', type: 'button', label: '安装' }]
}

const initialSkills: ExtensionManagerTab[] = [
  {
    id: 'skills',
    label: 'Skills',
    items: [
      {
        id: 'concise-answer',
        name: '简洁回答',
        description: '随应用内置，让回答保持简短并突出结论。',
        installed: true,
        actions: createInstalledSkillActions('简洁回答'),
      },
      {
        id: 'release-notes',
        name: '发布说明',
        description: '根据变更记录生成发布说明。',
        installed: false,
        actions: createSkillInstallAction(),
      },
    ],
  },
]

const initialMcpServers: ChatMcpServerView[] = [
  {
    id: 'project-search',
    name: '项目检索',
    description: '检索项目代码和文档。',
    installed: true,
    enabled: true,
  },
]

const initialMcpTools: ChatMcpToolMap = {
  'project-search': [{ id: 'search-code', name: '搜索代码', description: '按关键词搜索项目代码。', enabled: true }],
}

export function useExtensionTabsDemo() {
  const tabs = shallowRef<ExtensionManagerTab[]>(initialSkills)
  const mcpServers = shallowRef<ChatMcpServerView[]>(initialMcpServers)
  const mcpTools = shallowRef<ChatMcpToolMap>(initialMcpTools)
  const overlayOpen = ref(false)
  const overlayTitle = ref('')
  const overlayDescription = ref('')
  const status = ref('当前显示 Skills 页签。')

  const data = computed<ChatUIData>(() => ({
    conversation: { title: '扩展能力演示' },
    bubble: {
      messages: [
        {
          role: 'assistant',
          content: '通过 ui.extensions.tabs，可以向扩展管理器注册 Skills 等更多应用页签。',
        },
      ],
    },
    mcp: {
      servers: mcpServers.value,
      tools: mcpTools.value,
    },
  }))

  const ui = computed<ChatUIOptions>(() => ({
    layout: { leftAside: false, rightAside: { width: 320 } },
    extensions: {
      defaultActiveTab: 'skills',
      tabs: tabs.value,
      overlayOpen: overlayOpen.value,
    },
  }))

  function handleExtensionAction(payload: ExtensionManagerActionEvent) {
    tabs.value = tabs.value.map((tab) =>
      tab.id !== payload.tabId
        ? tab
        : {
            ...tab,
            items: tab.items.map((item) => {
              if (item.id !== payload.itemId) return item

              if (payload.action.type === 'switch' && typeof payload.action.checked === 'boolean') {
                return {
                  ...item,
                  actions: item.actions?.map((action) =>
                    action.id === payload.action.id && action.type === 'switch'
                      ? { ...action, checked: payload.action.checked! }
                      : action,
                  ),
                }
              }

              if (payload.action.id === 'install') {
                return {
                  ...item,
                  installed: true,
                  actions: createInstalledSkillActions(item.name),
                }
              }

              if (payload.action.id === 'uninstall') {
                return {
                  ...item,
                  installed: false,
                  actions: createSkillInstallAction(),
                }
              }

              return item
            }),
          },
    )

    status.value = `已处理 ${payload.itemId} 的 ${payload.action.id} 操作。`
  }

  function handleMcpAddServer(payload: ChatMcpAddServerPayload) {
    updateMcpServer(payload.serverId, (server) => ({ ...server, installed: true, enabled: true }))
    status.value = `已安装并启用 MCP：${payload.serverId}。`
  }

  function handleMcpCreateServer(payload: ChatMcpCreateServerPayload) {
    const id = `custom-mcp-${mcpServers.value.length + 1}`
    mcpServers.value = [
      ...mcpServers.value,
      {
        id,
        name: payload.config.name,
        description: payload.config.description,
        icon: payload.config.thumbnail ?? undefined,
        installed: true,
        enabled: true,
      },
    ]
    status.value = `已添加并启用 MCP：${payload.config.name}。`
  }

  function handleMcpRemoveServer(payload: ChatMcpRemoveServerPayload) {
    updateMcpServer(payload.serverId, (server) => ({ ...server, installed: false, enabled: false }))
    status.value = `已卸载 MCP：${payload.serverId}。`
  }

  function handleMcpServerEnabledChange(payload: ChatMcpServerEnabledChangePayload) {
    updateMcpServer(payload.serverId, (server) => ({ ...server, enabled: payload.enabled }))
    status.value = `MCP ${payload.serverId} 已${payload.enabled ? '启用' : '停用'}。`
  }

  function handleMcpToolEnabledChange(payload: ChatMcpToolEnabledChangePayload) {
    mcpTools.value = {
      ...mcpTools.value,
      [payload.serverId]: (mcpTools.value[payload.serverId] ?? []).map((tool) =>
        tool.id === payload.toolId ? { ...tool, enabled: payload.enabled } : tool,
      ),
    }
    status.value = `工具 ${payload.toolId} 已${payload.enabled ? '启用' : '停用'}。`
  }

  function updateMcpServer(serverId: string, update: (server: ChatMcpServerView) => ChatMcpServerView) {
    mcpServers.value = mcpServers.value.map((server) => (server.id === serverId ? update(server) : server))
  }

  function openImport() {
    overlayTitle.value = '导入 Skill'
    overlayDescription.value = '这里可以放置 SkillImportForm，导入成功后更新 extensions.tabs。'
    overlayOpen.value = true
  }

  function openSkillDetail(payload: ExtensionManagerNameClickEvent) {
    const item = tabs.value
      .find((tab) => tab.id === payload.tabId)
      ?.items.find((candidate) => candidate.id === payload.itemId)

    overlayTitle.value = item?.name ?? payload.itemId
    overlayDescription.value = item?.description ?? '这里可以放置扩展详情组件。'
    overlayOpen.value = true
  }

  function closeOverlay() {
    overlayOpen.value = false
  }

  function handleTabChange(payload: ExtensionManagerTabChangeEvent) {
    status.value = `已切换到 ${payload.tabId} 页签。`
  }

  return {
    closeOverlay,
    data,
    handleExtensionAction,
    handleMcpAddServer,
    handleMcpCreateServer,
    handleMcpRemoveServer,
    handleMcpServerEnabledChange,
    handleMcpToolEnabledChange,
    handleTabChange,
    openImport,
    openSkillDetail,
    overlayDescription,
    overlayOpen,
    overlayTitle,
    status,
    ui,
  }
}
