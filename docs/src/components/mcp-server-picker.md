---
outline: deep
---

# MCP Server Picker 插件选择器

一个功能完整的插件管理组件，支持已安装插件和插件市场两个面板。提供插件的安装、卸载、启用禁用、工具管理等完整功能。

## 代码示例

### 基本用法

最基础的使用方式，包含已安装插件和市场插件两个面板。

<demo vue="../../demos/mcp-server-picker/basic-usage.vue" />

### 加载状态

支持独立控制两个面板的加载状态，以及刷新功能。

<demo vue="../../demos/mcp-server-picker/loading-states.vue" />

## API

### McpServerPickerProps

插件选择器组件属性配置。

#### 数据源
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `installedPlugins` | `PluginInfo[]` | `[]` | 已安装插件列表 |
| `marketPlugins` | `PluginInfo[]` | `[]` | 市场插件列表 |

#### 搜索功能
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enableSearch` | `boolean` | `true` | 是否启用搜索功能 |
| `searchPlaceholder` | `string` | `'搜索插件'` | 搜索框占位符 |

#### 面板控制
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `visible` | `boolean` | `true` | 是否显示整个组件面板 |
| `defaultActiveTab` | `'installed' \| 'market'` | `'installed'` | 默认激活的标签页 |
| `showInstalledTab` | `boolean` | `true` | 是否显示已安装标签页 |
| `showMarketTab` | `boolean` | `true` | 是否显示市场标签页 |
| `showHeader` | `boolean` | `true` | 是否显示组件头部 |
| `showSearch` | `boolean` | `true` | 是否显示搜索栏 |
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

#### 加载状态
| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `loading` | `boolean` | `false` | 已安装插件加载状态 |
| `marketLoading` | `boolean` | `false` | 市场插件加载状态 |

### McpServerPickerEmits

插件选择器组件事件定义。

#### 搜索事件
| 事件名 | 参数 | 说明 |
|--------|------|------|
| `search` | `(query: string, tab: 'installed' \| 'market')` | 搜索输入变化 |

#### 标签页事件
| 事件名 | 参数 | 说明 |
|--------|------|------|
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

#### 其他事件
| 事件名 | 参数 | 说明 |
|--------|------|------|
| `custom-add` | `()` | 自定义添加按钮点击 |
| `custom-plugin-add` | `(formData: AddPluginFormData)` | 自定义插件添加完成 |
| `refresh` | `(tab: 'installed' \| 'market')` | 刷新请求 |
| `active-count-change` | `(count: number)` | 激活插件数量变化 |

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