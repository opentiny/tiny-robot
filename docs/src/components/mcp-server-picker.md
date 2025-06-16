---
outline: deep
---

# MCP Server Picker 插件选择器

一个功能完整的插件管理组件，支持已安装插件和插件市场两个面板。提供插件的安装、卸载、启用禁用、工具管理等完整功能。支持两种插件添加方式：可视化表单创建和代码编辑器创建，适用于插件管理平台、开发工具、应用商店等场景。

## 代码示例

### 基础用法

最基础的使用方式，包含已安装插件和市场插件两个面板。

<demo vue="../../demos/mcp-server-picker/basic-usage.vue" />

### 插件创建弹窗交互流程

组件内置了两种插件创建方式，用户可以在可视化表单和代码编辑器之间无缝切换：

1. **可视化表单创建**：点击"自定义添加"按钮，打开表单弹窗，填写插件信息
2. **代码编辑器创建**：在表单弹窗中点击代码编辑器图标，切换到代码编辑模式
3. **数据提交**：两种方式分别触发 `plugin-form-add` 和 `plugin-code-add` 事件

## API 说明

### Props

#### 数据源配置
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `installedPlugins` | `PluginInfo[]` | `[]` | 已安装插件列表 |
| `marketPlugins` | `PluginInfo[]` | `[]` | 市场插件列表 |

#### 搜索与筛选
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enableSearch` | `boolean` | `true` | 是否启用搜索功能 |
| `searchPlaceholder` | `string` | `'搜索插件'` | 搜索框占位符 |
| `enableMarketCategoryFilter` | `boolean` | `true` | 是否启用市场分类筛选功能 |
| `marketCategoryOptions` | `MarketCategoryOption[]` | `[]` | 市场分类选项列表 |
| `marketCategoryPlaceholder` | `string` | `'按照分类筛选'` | 分类筛选下拉框占位符 |

#### 面板控制
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visible` | `boolean` | `false` | 是否显示整个组件面板（支持 v-model:visible） |
| `activeCount` | `number` | - | 激活插件数量（支持 v-model:activeCount） |
| `defaultActiveTab` | `'installed' \| 'market'` | `'installed'` | 默认激活的标签页 |
| `showInstalledTab` | `boolean` | `true` | 是否显示已安装标签页 |
| `showMarketTab` | `boolean` | `true` | 是否显示市场标签页 |
| `installedTabTitle` | `string` | `'已安装插件'` | 已安装标签页标题 |
| `marketTabTitle` | `string` | `'市场'` | 市场标签页标题 |

#### 头部配置
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `title` | `string` | `'插件'` | 组件标题 |
| `showCustomAddButton` | `boolean` | `true` | 是否显示自定义添加按钮 |
| `customAddButtonText` | `string` | `'自定义添加'` | 自定义添加按钮文本 |

#### 行为控制
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `allowPluginToggle` | `boolean` | `true` | 是否允许切换插件状态 |
| `allowToolToggle` | `boolean` | `true` | 是否允许切换工具状态 |
| `allowPluginDelete` | `boolean` | `true` | 是否允许删除插件 |
| `allowPluginAdd` | `boolean` | `true` | 是否允许添加插件 |
| `enableParentChildSync` | `boolean` | `true` | 是否启用父子级联动 |

#### 状态控制
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `loading` | `boolean` | `false` | 已安装插件加载状态 |
| `marketLoading` | `boolean` | `false` | 市场插件加载状态 |

### Events

#### 搜索与筛选事件
| 事件名 | 参数 | 说明 |
|--------|------|------|
| `search` | `(query: string, tab: 'installed' \| 'market')` | 搜索输入变化 |
| `market-category-change` | `(category: string)` | 市场分类筛选变化 |

#### 面板控制事件
| 事件名 | 参数 | 说明 |
|--------|------|------|
| `update:visible` | `(visible: boolean)` | 面板显示状态变化 |
| `update:activeCount` | `(count: number)` | 激活插件数量变化 |
| `tab-change` | `(activeTab: 'installed' \| 'market')` | 标签页切换 |

#### 插件操作事件
| 事件名 | 参数 | 说明 |
|--------|------|------|
| `plugin-toggle` | `(plugin: PluginInfo, enabled: boolean)` | 插件启用/禁用 |
| `plugin-delete` | `(plugin: PluginInfo)` | 删除插件 |
| `plugin-add` | `(plugin: PluginInfo, added: boolean)` | 市场插件添加/取消添加 |
| `plugin-expand` | `(plugin: PluginInfo, expanded: boolean)` | 插件展开/折叠 |

#### 工具操作事件
| 事件名 | 参数 | 说明 |
|--------|------|------|
| `tool-toggle` | `(plugin: PluginInfo, toolId: string, enabled: boolean)` | 工具启用/禁用 |

#### 插件创建事件
| 事件名 | 参数 | 说明 |
|--------|------|------|
| `plugin-form-add` | `(data: AddPluginFormData)` | 表单方式添加插件 |
| `plugin-code-add` | `(data: AddPluginCodeData)` | 代码方式添加插件 |
| `custom-add` | `()` | 自定义添加按钮点击 |

#### 其他事件
| 事件名 | 参数 | 说明 |
|--------|------|------|
| `refresh` | `(tab: 'installed' \| 'market')` | 刷新请求 |

### Types

#### PluginInfo

插件信息类型：

```typescript
interface PluginInfo {
  id: string              // 插件唯一标识
  name: string            // 插件名称
  icon: string            // 插件图标URL
  description: string     // 插件描述
  toolCount?: number      // 工具数量（可选）
  enabled?: boolean       // 是否启用（可选）
  expanded?: boolean      // 是否展开（可选）
  tools?: PluginTool[]    // 工具列表（可选）
  added?: boolean         // 市场插件添加状态（可选）
  category?: string       // 插件分类（可选，用于市场分类筛选）
}
```

#### PluginTool

插件工具类型：

```typescript
interface PluginTool {
  id: string              // 工具唯一标识
  name: string            // 工具名称
  description: string     // 工具描述
  enabled: boolean        // 是否启用
}
```

#### MarketCategoryOption

市场分类选项类型：

```typescript
interface MarketCategoryOption {
  value: string           // 分类值
  label: string           // 分类显示名称
}
```

#### AddPluginFormData

表单方式添加插件数据类型：

```typescript
interface AddPluginFormData {
  name: string            // 插件名称
  description: string     // 插件描述
  types: string[]         // 插件类型数组，可选值：'stdio'、'sse'、'streamableHttp'
  url: string             // 插件 URL
  headers: string         // 请求头（JSON 格式字符串）
  thumbnail?: File | null // 缩略图文件（可选）
}
```

#### AddPluginCodeData

代码方式添加插件数据类型：

```typescript
interface AddPluginCodeData {
  aiPlugin: string        // AI 插件配置
  openapi: string         // OpenAPI 配置
}
```