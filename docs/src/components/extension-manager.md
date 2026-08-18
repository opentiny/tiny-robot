---
outline: [1, 3]
---

# ExtensionManager 扩展管理组件

`ExtensionManager` 提供一组可组合的扩展管理原语，适合管理 MCP、Skill 以及后续扩展 kind。对于新的 Extension Manager API，包根公开 `ExtensionManager`、`useExtensionContext` 和相关类型；新的 Root、Filter、List、Card、MCP 详情与表单都通过 `ExtensionManager` namespace 使用。

## 最小组合

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type { ExtensionInput } from '@opentiny/tiny-robot'
import { ExtensionManager } from '@opentiny/tiny-robot'

const extensions = ref<ExtensionInput[]>([
  {
    id: 'map-service',
    kind: 'mcp',
    name: 'Map service',
    version: '1.0.0',
    installed: true,
    config: { enabled: true },
    metadata: { tools: [{ id: 'search', name: 'Search maps' }] },
  },
  {
    id: 'summary-skill',
    kind: 'skill',
    name: 'Summary skill',
    installed: false,
    tags: ['writing'],
  },
])
</script>

<template>
  <ExtensionManager.Root :extensions="extensions">
    <ExtensionManager.Filter />
    <TabsAndSections />
  </ExtensionManager.Root>
</template>
```

`Root` 提供目录规范化、展示投影、操作状态和 intent context。Tabs、Sections、详情面板、表单以及 Dialog/Drawer 仍由业务宿主组合和管理。

## 目录模型和规范化

Root 接收可以省略 `installed` 的 `ExtensionInput[]`，并向后代提供始终包含 `installed` 的 `Extension[]`：

```ts
type ExtensionKind = string & {}

interface ExtensionInput<TConfig = unknown, TMetadata = unknown> {
  id: string
  kind: ExtensionKind
  name: string
  version?: string
  icon?: string
  description?: string
  tags?: string[]
  installed?: boolean
  config?: TConfig
  metadata?: TMetadata
}

interface Extension<TConfig = unknown, TMetadata = unknown> extends Omit<
  ExtensionInput<TConfig, TMetadata>,
  'installed' | 'config'
> {
  installed: boolean
  config?: TConfig
}
```

规范化规则：

- `installed: true` 表示 Installed Extension；`false` 或省略表示 Available Extension。
- `config` 只在 `installed: true` 时保留。Available Extension 的配置会被丢弃，避免把未安装记录误当成运行时状态。
- `config.enabled` 是可选的运行参与设置。缺少它表示当前 kind 不支持该开关，不等同于 `false`。
- `metadata` 保存描述和发现信息；MCP 工具描述放在 `metadata.tools`，用户的工具偏好放在 `config.tools`。
- `kind` 是开放字符串，kind 选项按目录中的首次出现顺序发现。

Root 会从同一份目录派生两个展示 scope：`installed` 和 `available`。业务层应更新目录记录，组件不会把安装中的记录提前标记为 Installed。

## Filter、displayItems 和 List/Card

Filter 是 Root 下唯一的视图投影器。它从完整目录收集 kind/tag 选项，并按 kind、tag、搜索条件依次过滤：

```text
extensions/catalog
  -> ExtensionManager.Filter
  -> displayItems: { installed, available }
  -> ExtensionManager.List(scope="installed" | "available")
  -> ExtensionManager.Card
```

一个 Root 最多挂载一个 `ExtensionManager.Filter`。没有 Filter 时，Root 使用未过滤的安装投影；Filter 卸载后也会恢复该投影。List 不读取 Filter 状态，只接收 `items` 和 `scope`。

```vue
<!-- TabsAndSections.vue：Root 的后代组件可以消费 public context。 -->
<script setup lang="ts">
import { ExtensionManager, useExtensionContext } from '@opentiny/tiny-robot'

const { displayItems } = useExtensionContext()
</script>

<template>
  <ExtensionManager.List :items="displayItems.installed" scope="installed">
    <ExtensionManager.Card v-for="item in displayItems.installed" :key="item.id" :item="item" />
  </ExtensionManager.List>

  <ExtensionManager.List :items="displayItems.available" scope="available">
    <ExtensionManager.Card v-for="item in displayItems.available" :key="item.id" :item="item" />
  </ExtensionManager.List>
</template>
```

`ExtensionManager.List` 提供布局、加载/错误/空状态和按 scope 推导的默认 Card 操作：Installed scope 提供删除，并且只在 `config.enabled` 是 boolean 时提供启停；Available scope 提供安装。`ExtensionManager.Card` 接收一个必需的 canonical `Extension` `item`，不再接收重复的顶层展示字段或独立的记录模型。独立使用的 Card 没有默认扩展操作。

## 宿主拥有操作状态和业务流程

组件只展示目录和发出稳定身份的 intent。宿主拥有权限、确认、异步请求、目录持久化、配置清理和成功后的目录替换。安装、删除、启停、编辑、刷新和重试等短暂状态通过外部 `ExtensionOperationStatusMap` 传给 Root：

```ts
type ExtensionOperation = 'install' | 'create' | 'toggle' | 'edit' | 'delete' | 'refresh' | 'tool-toggle'

interface ExtensionOperationStatus {
  status: 'pending' | 'success' | 'error'
  progress?: number
  error?: unknown
  retryable?: boolean
}

type ExtensionOperationStatusMap = Record<string, Partial<Record<ExtensionOperation, ExtensionOperationStatus>>>
```

```vue
<script setup lang="ts">
import { ref } from 'vue'
import type {
  ExtensionInput,
  ExtensionIntent,
  ExtensionOperationStatusMap,
  ExtensionToggleIntent,
} from '@opentiny/tiny-robot'
import { ExtensionManager } from '@opentiny/tiny-robot'

const extensions = ref<ExtensionInput[]>([])
const operationStates = ref<ExtensionOperationStatusMap>({})

const installExtension = (_intent: ExtensionIntent) => {}
const toggleExtension = (_intent: ExtensionToggleIntent) => {}
const deleteExtension = (_intent: ExtensionIntent) => {}
</script>

<template>
  <ExtensionManager.Root
    :extensions="extensions"
    :operation-states="operationStates"
    @install="installExtension"
    @toggle="toggleExtension"
    @delete="deleteExtension"
  >
    <ExtensionManager.Filter />
    <TabsAndSections />
  </ExtensionManager.Root>
</template>
```

没有 operation entry 就表示 idle。Root/List 会把状态投影到安装按钮和进度条，但不会修改 `extensions` 或 `operationStates`。只有宿主在业务操作成功后把 `installed` 和 `config` 写回目录，Available Extension 才会进入 Installed scope。

Root 的公开 context 是 `useExtensionContext()`，包括 `allExtensions`、`displayItems`、`installedItems`、`availableItems`、`operationStates`，以及 `requestInstall`、`requestCreate(kind)`、`requestToggle`、`requestDetail`、`requestEdit`、`requestDelete`、`requestToolToggle` 和 `requestRefresh`。这些方法只发出 intent，不执行异步操作。

## MCP 详情和表单

### MCP 详情

使用 `ExtensionManager.McpDetail` 展示 `metadata.tools`，并从 `config.tools` 读取每个工具的偏好。它不修改 Extension，也不拥有弹窗状态：

```vue
<ExtensionManager.McpDetail :item="mcpExtension" @tool-toggle="handleToolToggle" />
```

工具切换 intent 的形状是：

```ts
interface ExtensionToolToggleIntent {
  id: string
  kind: ExtensionKind
  toolId: string
  enabled: boolean
}
```

父 Extension 的 `config.enabled` 和工具的 `config.tools[toolId].enabled` 相互独立。没有 `config.enabled` 时，详情不会渲染父级启停开关。

### MCP 表单

`ExtensionManager.McpForm` 只负责本地字段编辑和提交，不包含 Dialog/Drawer。它使用独立的 `McpDefinition`、`McpFormPayload` 合约：

```ts
interface McpDefinition {
  name: string
  description: string
  transport: 'sse' | 'streamableHttp'
  url: string
  headers: Record<string, string>
}

type McpFormPayload = { mode: 'form'; data: McpDefinition } | { mode: 'code'; data: string }
```

```vue
<ExtensionManager.McpForm :definition="definition" @submit="saveMcp" @cancel="closeForm" />
```

### 公共 MCP API 和旧组件边界

新的 MCP 组件只通过 `ExtensionManager.McpDetail` 和 `ExtensionManager.McpForm` 使用。`McpServerPicker` 和 `McpAddForm` 是独立保留的 legacy 组件；它们的专属页面继续描述各自的旧数据模型，不应作为 Extension Manager 组合式 API 的示例。

## 公共 API

```ts
import { ExtensionManager, useExtensionContext } from '@opentiny/tiny-robot'
import type {
  Extension,
  ExtensionInput,
  ExtensionKind,
  ExtensionOperationStatusMap,
  McpConfig,
  McpDefinition,
  McpFormPayload,
  McpMetadata,
} from '@opentiny/tiny-robot'
```

可用的 namespace 成员：

- `ExtensionManager.Root`：规范化目录并创建 Extension context。
- `ExtensionManager.Filter`：在 Root 下创建唯一的 kind/tag/search 投影。
- `ExtensionManager.List`：按 `scope="installed"` 或 `scope="available"` 展示一组 items。
- `ExtensionManager.Card`：展示一个 canonical `item` 并发出卡片操作事件。
- `ExtensionManager.McpDetail`：展示 MCP 工具并发出 tool-toggle intent。
- `ExtensionManager.McpForm`：编辑 MCP 表单或 JSON，并发出 `McpFormPayload`。

`ExtensionManager` 自身仍提供一个方便的预制 facade，适合不需要自定义 Sections 的页面；需要完全控制布局时，使用上面的 Root 组合式 API。
