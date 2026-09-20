---
outline: [1, 3]
pageClass: demo-container-page-bg
---

# 在应用中管理 MCP 与 Skill 扩展

一个扩展目录可能同时包含随应用发布的 MCP/Skill、远程目录中的 MCP/Skill，以及用户手动添加的扩展。本示例用 `ExtensionManager` 展示目录，用 MCP/Skill 专用组件完成添加和详情，再由应用把目录定义与已安装记录合并。安装通过异步流程显示进度；启用和卸载都要等待存储成功后才更新列表。

## 完整示例

初始目录包含内置 MCP/Skill 和尚未安装的远程 MCP/Skill。切换 MCP 与 Skills 标签，尝试安装、启用或禁用、卸载，再观察条目如何在“已安装”和“可安装”之间移动。

点击名称会打开原生 `<dialog>` 详情弹窗。点击顶部“添加”按钮，可选择添加 MCP、上传本地 Skill 技能包或从 GitHub 导入 Skill。相应表单在弹窗中打开；点击弹窗外侧或关闭按钮可关闭。应用保存成功后才切换到详情，保存失败时仍保留表单和错误提示。点击“安装”可以看到异步进度，点击“重置示例”可恢复初始状态。示例没有真实网络请求，刷新页面也会清空内存数据。

<demo
  vue="../../demos/extension-manager/integrated.vue"
  :vueFiles="[
    '../../demos/extension-manager/integrated.vue',
    '../../demos/extension-manager/ExtensionAddMenu.vue',
    '../../demos/extension-manager/ExtensionAddIcon.vue',
    '../../demos/extension-manager/use-extension-catalog.ts',
    '../../demos/extension-manager/use-extension-dialog.ts',
    '../../demos/extension-manager/mock-api.ts',
    '../../demos/extension-manager/catalog.ts',
    '../../demos/extension-manager/skill-options-storage.ts',
  ]"
  title="内置与远程扩展管理"
  description="异步安装并查看进度，启用、卸载、添加及查看扩展，最后重置示例。"
/>

示例源码从 `integrated.vue` 开始：`use-extension-catalog.ts` 使用公开的 MCP 内存存储 和 kit `createMemorySkillStorage()` 保存需要持久化的已安装定义；默认已安装的内置项直接来自应用代码。`use-extension-dialog.ts` 管理原生弹窗；`catalog.ts` 只处理目录身份和版本选择，`skill-options-storage.ts` 保存应用的 Skill 启用偏好。`mock-api.ts` 集中提供异步目录和安装进度，方便替换为真实 API。

## 替换目录和存储

目录请求负责返回定义，不代表已安装。把 `mock-api.ts` 中的 `fetchRemoteExtensions()` 换成应用的异步请求；保持 MCP 的 `source + id` 稳定，并在定义变更时增加 `version`。Skill 以 `name` 为身份，版本写入 `SkillDefinition.metadata.extensionVersion`。同名 Skill 只保留一个；较高版本更新定义，已保存的启用配置仍保留。同名 MCP 可以共存，但示例在启用其中一个时会禁用其他已安装的同名 MCP。远程目录失败时，应用仍可展示存储中的已安装快照。

```ts
import type { ExtensionDefinition } from './catalog'

// mock-api.ts：这里接入实际目录 API；解析响应后再交给目录合并逻辑。
export async function fetchRemoteExtensions(): Promise<ExtensionDefinition[]> {
  const response = await fetch('/api/extensions/catalog')
  if (!response.ok) throw new Error(`目录请求失败：${response.status}`)
  return (await response.json()) as ExtensionDefinition[]
}
```

MCP 使用同一个存储实例分别处理定义和配置。示例用 `createMemoryMcpExtensionStorage()`；生产应用可以用 `createMcpExtensionStorage({ adapter, parseBusinessOptions })`。`adapter` 以完整 JSON 文档为单位异步读写，适合接入 IndexedDB 或服务端接口。应用应在边界校验服务端响应，并处理跨客户端并发。

```ts
import { createMcpExtensionStorage } from '@opentiny/tiny-robot'

const mcpStorage = createMcpExtensionStorage({
  namespace: 'my-app',
  adapter: {
    async read(key) {
      const response = await fetch(`/api/mcp-storage/${encodeURIComponent(key)}`)
      if (response.status === 404) return null
      if (!response.ok) throw new Error(`读取失败：${response.status}`)
      return response.text()
    },
    async write(key, value) {
      const response = await fetch(`/api/mcp-storage/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: value,
      })
      if (!response.ok) throw new Error(`保存失败：${response.status}`)
    },
  },
  parseBusinessOptions(value) {
    if (typeof value !== 'object' || value === null || !('enabled' in value) || typeof value.enabled !== 'boolean') {
      throw new Error('MCP 配置无效')
    }
    return { enabled: value.enabled }
  },
})
```

Skill 定义和资源仍使用 kit 的 `SkillStorage`。Demo 使用 `createMemorySkillStorage()`，需要浏览器持久化时可替换为 `createIndexedDBSkillStorage({ databaseName: 'my-app-skills' })`。kit 会保存 Skill 资源内容；卸载调用 `delete(name)`。启用偏好属于应用配置，Demo 将它按 Skill 名称另存，并在卸载时保留。下面是用 `localStorage` 替换 Demo 内存配置的最小实现：

```ts
import type { SkillOptionsStorage } from './skill-options-storage'

const prefix = 'my-app:skill-options:'
export const skillOptions: SkillOptionsStorage = {
  async get(name) {
    const raw = localStorage.getItem(prefix + name)
    if (raw === null) return undefined
    const value: unknown = JSON.parse(raw)
    if (typeof value !== 'object' || value === null || !('enabled' in value) || typeof value.enabled !== 'boolean') {
      throw new Error('Skill 配置无效')
    }
    return { enabled: value.enabled }
  },
  async set(name, options) {
    localStorage.setItem(prefix + name, JSON.stringify(options))
  },
}
```

安装流程在 `use-extension-catalog.ts` 中：先异步准备并更新进度，需要校验 MCP 联通性时在代码注释标出的位置插入调用；成功后保存定义，再刷新列表。默认已安装的内置项只允许禁用；默认未安装的内置项和远程项可以安装、卸载。卸载删除定义但保留配置，再次安装同一身份会恢复整体开关和工具开关。应用收到表单提交后负责保存，成功才打开详情弹窗；详情组件不管理弹窗标题、关闭或焦点恢复。

组件行为和完整 API 分别见 [ExtensionManager](/components/extension-manager)、[MCP 扩展添加与详情](/components/mcp-extension) 和 [Skill 扩展导入与详情](/components/skill-extension)。
