export interface DemoPathInfo {
  id: 'built-in-kit' | 'existing-kit' | 'custom-runtime'
  index: 'A' | 'B' | 'C'
  path: string
  aliases: string[]
  title: string
  description: string
  api: string
  ownership: string
}

export const demoPathInfo = {
  builtInKit: {
    id: 'built-in-kit',
    index: 'A',
    path: '/built-in-kit',
    aliases: ['/', '/basic', '/local-runtime', '/kit-quick-start'],
    title: 'Built-in Kit Runtime',
    description: '由 Chat 创建并装配 Kit 会话状态，适合新项目快速接入。',
    api: 'useLocalChatRuntime()',
    ownership: 'TinyRobot Kit 托管状态',
  },
  existingKit: {
    id: 'existing-kit',
    index: 'B',
    path: '/existing-kit',
    aliases: ['/kit-runtime', '/kit-existing-runtime'],
    title: 'Existing Kit Runtime',
    description: '复用已有 useConversation() 实例，只迁移到 TrChat UI。',
    api: 'useKitChatRuntime(conversation)',
    ownership: '已有 Kit 实例持有状态',
  },
  customRuntime: {
    id: 'custom-runtime',
    index: 'C',
    path: '/custom-runtime',
    aliases: ['/external-runtime'],
    title: 'Custom Runtime',
    description: '将用户自有消息、会话和请求生命周期适配为 ChatRuntime。',
    api: 'custom ChatRuntime',
    ownership: '用户自有数据层持有状态',
  },
} as const satisfies Record<string, DemoPathInfo>

export const demoPaths = Object.values(demoPathInfo)
