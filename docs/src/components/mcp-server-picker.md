---
outline: deep
---

# MCP Server Picker 插件选择器

MCP Server Picker 组件是一个用于展示和管理插件的组件，支持已安装插件和插件市场两个标签页，可以进行插件的添加、删除和启用/禁用操作。

## 基础用法

<demo vue="../../demos/mcp-server-picker/basic-usage.vue" />

## 弹出方式

> MCP Server Picker 组件支持两种弹出方式， 即 `Fixed` 模式和 `Drawer` 模式，通过 `popupConfig` 配置对象统一管理

<demo vue="../../demos/mcp-server-picker/popup-config.vue" />


## API

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
| `popupConfig` | `PopupConfig` | `{ type: 'fixed', position: {}, drawer: { direction: 'right' } }` | 弹出配置对象 |


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

#### 状态控制
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `loading` | `boolean` | `false` | 已安装插件加载状态 |
| `marketLoading` | `boolean` | `false` | 市场插件加载状态 |

### Events

#### 搜索与筛选
| 事件名 | 参数 | 默认 | 说明 |
|--------|------|------|------|
| `market-category-change` | `(category: string)` | 无 | 市场分类筛选变化 |
| `installedSearchFn` | `(query: string, item: PluginInfo) => boolean` | `默认按 name 包含匹配` | 已添加插件搜索函数 |
| `marketSearchFn` | `(query: string, item: PluginInfo) => boolean` | `默认按 name 包含匹配` | 市场插件搜索函数 |

#### 面板控制
| 事件名 | 参数 | 说明 |
|--------|------|------|
| `update:visible` | `(visible: boolean)` | 面板显示状态变化 |
| `update:activeCount` | `(count: number)` | 激活插件数量变化 |
| `tab-change` | `(activeTab: 'installed' \| 'market')` | 标签页切换 |

#### 插件操作
| 事件名 | 参数 | 说明 |
|--------|------|------|
| `plugin-toggle` | `(plugin: PluginInfo, enabled: boolean)` | 插件启用/禁用 |
| `plugin-delete` | `(plugin: PluginInfo)` | 删除插件 |
| `plugin-add` | `(plugin: PluginInfo, added: boolean)` | 市场插件添加/取消添加 |
| `plugin-create` | `(type: 'form' \| 'code', data: PluginCreationData)` | 插件创建 |

#### 工具操作
| 事件名 | 参数 | 说明 |
|--------|------|------|
| `tool-toggle` | `(plugin: PluginInfo, toolId: string, enabled: boolean)` | 工具启用/禁用 |

#### 其他
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
  enabled: boolean       // 是否启用
  expanded?: boolean      // 是否展开
  tools: PluginTool[]    // 工具列表
  added?: boolean         // 市场插件添加状态(可选)
  category?: string       // 插件分类(可选，用于市场分类筛选)
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

#### PluginFormData

表单方式添加插件数据类型：

```typescript
interface PluginFormData {
  name: string            // 插件名称
  description: string     // 插件描述
  type: 'sse' | 'streamableHttp'  // 插件类型, sse 或 streamableHttp
  url: string             // 插件 URL
  headers: string         // 请求头（JSON 格式字符串）
  thumbnail?: File | null // 缩略图文件（可选）
}
```

#### PluginCreationData

PluginCreationData 类型是 PluginFormData 或 string 的联合类型，用于表示插件创建的数据。

```typescript
type PluginCreationData = PluginFormData | string
```

#### PopupConfig

弹窗配置类型：

```typescript
interface PopupConfig {
  type: 'fixed' | 'drawer'
  // fixed模式配置
  position?: {
    top?: string | number
    left?: string | number
    right?: string | number
    bottom?: string | number
  }
  // drawer模式配置
  drawer?: {
    direction: 'left' | 'right'
  }
}
```