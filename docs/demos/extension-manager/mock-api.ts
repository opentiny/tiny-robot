import type { SkillResolver } from '@opentiny/tiny-robot'
import type { ExtensionDefinition } from './catalog'

// 内置定义由应用代码提供；installed 只是无存储记录时的初始值。
// source + id 在同一类型内保持稳定，version 升级时递增。
export const getBuiltInExtensions = (): ExtensionDefinition[] => [
  {
    kind: 'mcp',
    source: 'builtin',
    id: 'weather',
    version: 1,
    installed: true,
    data: {
      value: {
        name: '天气服务',
        description: '内置的天气查询和预警。',
        type: 'streamableHttp',
        url: 'https://example.com/builtin-weather',
      },
      tools: [
        { id: 'forecast', name: '天气预报', enabled: true },
        { id: 'alert', name: '天气预警', enabled: true },
      ],
    },
  },
  {
    kind: 'mcp',
    source: 'builtin',
    id: 'local-search',
    version: 1,
    installed: false,
    data: {
      value: {
        name: '内置资料检索',
        description: '按需安装的内置 MCP。',
        type: 'sse',
        url: 'https://example.com/builtin-search',
      },
      tools: [{ id: 'search', name: '检索资料', enabled: true }],
    },
  },
  {
    kind: 'skill',
    source: 'builtin',
    id: 'notes',
    version: 1,
    installed: true,
    data: {
      name: '会议纪要',
      description: '将会议记录整理成摘要和行动项。',
      instructions: '按议题归纳结论，并列出负责人和行动项。',
      resources: [
        {
          path: 'references/meeting.md',
          kind: 'text',
          resourceId: 'references/meeting.md',
          text: '# 会议纪要格式\n结论、负责人、行动项。',
        },
      ],
    },
  },
]

/** 远程目录只返回定义；安装状态由应用仓库决定。真实业务在这里换成异步目录 API。 */
export const fetchRemoteExtensions = async (): Promise<ExtensionDefinition[]> => {
  await new Promise((resolve) => setTimeout(resolve, 120))

  return [
    {
      kind: 'mcp',
      source: 'remote',
      id: 'weather-service',
      version: 1,
      data: {
        value: {
          name: '天气服务',
          description: '从远程目录安装的天气服务。',
          type: 'streamableHttp',
          url: 'https://example.com/remote-weather',
        },
        tools: [
          { id: 'forecast', name: '天气预报', enabled: true },
          { id: 'air-quality', name: '空气质量', enabled: true },
        ],
      },
    },
    {
      kind: 'skill',
      source: 'remote',
      id: 'document-summary',
      version: 1,
      data: {
        name: '文档摘要',
        description: '提取文档的关键内容。',
        instructions: '列出三条关键内容。',
        resources: [
          {
            path: 'references/summary.md',
            kind: 'text',
            resourceId: 'references/summary.md',
            text: '# 摘要参考\n按要点归纳。',
          },
        ],
      },
    },
  ]
}

/** 安装进度的异步 mock；真实业务在这里调用安装 API，并把进度回传给卡片。 */
export const prepareExtensionInstall = async (onProgress: (progress: number) => void): Promise<void> => {
  for (const progress of [15, 45, 80]) {
    await new Promise((resolve) => setTimeout(resolve, 160))
    onProgress(progress)
  }
}

// Skill 解析器只产生定义；是否安装取决于应用是否成功保存该定义。
export const resolveExampleSkill: SkillResolver = async (input) => {
  await Promise.resolve()
  if (input.source !== 'github') throw new Error('请选择 GitHub 来源')
  return {
    name: 'demo-skill',
    description: '本地 mock 解析出的示例 Skill。',
    instructions: `根据 ${input.path} 中的说明整理要点。`,
    resources: [
      {
        path: 'references/demo.md',
        kind: 'text',
        resourceId: 'references/demo.md',
        text: '# 示例资料\n用于演示资源清单。',
      },
    ],
  }
}
