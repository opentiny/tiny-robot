---
outline: [1, 3]
badge: deprecated
---

# MCP Server Picker 插件选择器

> [!WARNING]
> `McpServerPicker` 已弃用，仅为兼容现有代码而保留，并计划在未来的主版本中移除。新功能请使用 [`ExtensionManager`](./extension-manager.md)。两者的 API 并非一一对应，迁移前请先确认下面的数据映射和职责变化。

`McpServerPicker` 将 MCP 列表、弹出容器、自定义添加表单和工具开关集中在一个组件中。`ExtensionManager` 只负责通用 Extension 的浏览、筛选、分区和操作事件；弹出容器、MCP 表单、工具详情及数据更新由应用实现。

## 迁移到 ExtensionManager

### 数据与操作映射

| `McpServerPicker`                                         | `ExtensionManager`                                            | 迁移说明                                                                                                                                                      |
| --------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `installedPlugins`、`marketPlugins`                       | 一个或多个 `ExtensionManagerTab` 的 `items`                   | 将同类 MCP 合并到同一标签页；使用 `item.installed` 区分“已安装”和“可安装”，并保证 `item.id` 唯一。                                                            |
| `installedSearchFn`、`marketSearchFn`、搜索开关及占位文案 | 内置的名称和描述关键词搜索                                    | 当前公共 API 不能关闭搜索、修改占位文案或替换匹配规则。预过滤 `tabs` 仍会与内置搜索叠加；必须保留旧搜索体验时，需要先扩展组件 API，或改用应用自己的管理界面。 |
| `marketCategoryOptions`、分类开关及占位文案               | `item.tags`，或应用自建的分类控件与预过滤层                   | 内置标签筛选把 tag 值同时用作显示文案。分类值与文案相同时可直接迁移；否则不要传 `item.tags`，由应用保留 value 与 label 映射并预过滤 `tabs`。                  |
| `PluginInfo.enabled`                                      | `ExtensionCardSwitchAction.checked`                           | 应用处理 `action.id` 对应的开关操作，并使用 `action.checked` 更新外部 MCP 数据。                                                                              |
| `plugin-add`、`plugin-delete`                             | `action` 事件中的自定义 action id                             | 应用完成安装或卸载后更新 `item.installed` 和 `actions`，组件随后重新分区。                                                                                    |
| `addState`、`loading`                                     | `item.progress`、action 的 `disabled`，以及应用自己的请求状态 | `ExtensionManager` 不执行请求，也不自动改变安装状态。                                                                                                         |
| `visible`、`popupConfig`                                  | 应用提供的页面、Dialog、Drawer 或其他宿主                     | `ExtensionManager` 是内容管理面板，不负责遮罩、定位、焦点陷阱和滚动锁定。                                                                                     |
| `plugin-create`                                           | 应用实现的 MCP 表单；完成后更新 `tabs`                        | `ExtensionManager` 不包含 MCP 创建表单。`McpAddForm` 在当前版本仍是独立的公共入口，未标记弃用。                                                               |
| `tools`、`tool-toggle`                                    | 应用提供的详情界面或 `item` 插槽                              | 通用 Card 不推断 MCP 工具层级；自定义内容需要自行承担事件、键盘和 ARIA 语义。                                                                                 |

`McpServerPicker` 的“已安装”和“市场”是两个固定标签页；`ExtensionManager.tabs` 表示 Extension 类型或应用定义的分类，每个标签页内部再根据 `installed` 自动生成“已安装”和“可安装”分区。迁移时不要直接把两组旧列表分别当成两个 `ExtensionManagerTab`，否则每个标签页仍会额外生成两个分区。

操作事件也从多个 MCP 专用事件合并为一个通用 `action` 事件。应用需要为安装、卸载和开关配置稳定的 action id，再根据 `tabId`、`sectionKey`、`itemId` 和 `action` 更新原始数据。完整的数据和事件示例见 [ExtensionManager 用法示例](./extension-manager.md#用法示例)及[处理操作事件](./extension-manager.md#处理操作事件)。

### 迁移时需要保留的应用职责

- 使用应用现有的 Dialog、Drawer 或页面承载 `ExtensionManager`，并处理打开、关闭和焦点返回。
- 在 MCP 表单提交成功后，将结果转换为 `ExtensionManagerItem` 并更新对应标签页。
- 将工具列表和工具级开关放入详情界面；若通过 `item` 插槽直接展示，需要补齐默认 Card 不再提供的交互和可访问性行为。
- 在安装、卸载、启用或禁用请求期间更新 `progress`、action `disabled` 和最终数据；组件只发出用户操作意图。

## 旧组件用法（兼容期）

下面的示例仅用于维护尚未迁移的现有代码，新功能不要继续接入 `McpServerPicker`。

<demo vue="../../demos/mcp-server-picker/basic-usage.vue" />

### 插件添加状态

市场插件支持三种添加状态，提供更好的用户体验：

- **idle**: 未添加状态，显示"添加"按钮，用户可以点击添加
- **loading**: 添加中状态，显示"添加中"按钮，按钮不可点击，适用于网络请求等异步操作
- **added**: 已添加状态，显示"已添加"按钮，按钮不可点击

通过 `addState` 属性控制插件的添加状态，开发者可以在添加插件的异步过程中动态更新状态，提升用户体验。

#### 状态控制示例

```typescript
const handlePluginAdd = (plugin: PluginInfo) => {
  const targetPlugin = marketPlugins.value.find((p) => p.id === plugin.id)!

  // 设置为加载状态
  targetPlugin.addState = 'loading'

  // 异步添加插件
  addPluginToServer(plugin)
    .then(() => {
      // 添加成功
      targetPlugin.addState = 'added'
      // 添加到已安装列表
      installedPlugins.value.push(newPlugin)
    })
    .catch(() => {
      // 添加失败，重置为idle状态，用户可以重新尝试
      targetPlugin.addState = 'idle'
    })
}
```

## 旧组件弹出方式（兼容期）

> MCP Server Picker 组件支持两种弹出方式， 即 `Fixed` 模式和 `Drawer` 模式，通过 `popupConfig` 配置对象统一管理

<demo vue="../../demos/mcp-server-picker/popup-config.vue" />

## 旧组件 API（兼容期）

### Props

| 属性                       | 类型                                           | 默认值                                                            | 说明                                         |
| -------------------------- | ---------------------------------------------- | ----------------------------------------------------------------- | -------------------------------------------- |
| installedPlugins           | `PluginInfo[]`                                 | `[]`                                                              | 已安装插件列表                               |
| marketPlugins              | `PluginInfo[]`                                 | `[]`                                                              | 市场插件列表                                 |
| enableSearch               | `boolean`                                      | `true`                                                            | 是否启用搜索功能                             |
| searchPlaceholder          | `string`                                       | `'搜索插件'`                                                      | 搜索框占位符                                 |
| installedSearchFn          | `(query: string, item: PluginInfo) => boolean` | —                                                                 | 已安装插件的自定义搜索函数                   |
| marketSearchFn             | `(query: string, item: PluginInfo) => boolean` | —                                                                 | 市场插件的自定义搜索函数                     |
| enableMarketCategoryFilter | `boolean`                                      | `true`                                                            | 是否启用市场分类筛选功能                     |
| marketCategoryOptions      | `MarketCategoryOption[]`                       | `[]`                                                              | 市场分类选项列表                             |
| marketCategoryPlaceholder  | `string`                                       | `'按照分类筛选'`                                                  | 分类筛选下拉框占位符                         |
| visible                    | `boolean`                                      | `false`                                                           | 是否显示整个组件面板（支持 v-model:visible） |
| activeCount                | `number`                                       | -                                                                 | 激活插件数量（支持 v-model:activeCount）     |
| defaultActiveTab           | `'installed' \| 'market'`                      | `'installed'`                                                     | 默认激活的标签页                             |
| showInstalledTab           | `boolean`                                      | `true`                                                            | 是否显示已安装标签页                         |
| showMarketTab              | `boolean`                                      | `true`                                                            | 是否显示市场标签页                           |
| installedTabTitle          | `string`                                       | `'已安装插件'`                                                    | 已安装标签页标题                             |
| marketTabTitle             | `string`                                       | `'市场'`                                                          | 市场标签页标题                               |
| popupConfig                | `PopupConfig`                                  | `{ type: 'fixed', position: {}, drawer: { direction: 'right' } }` | 弹出配置对象                                 |
| title                      | `string`                                       | `'插件'`                                                          | 组件标题                                     |
| showCustomAddButton        | `boolean`                                      | `true`                                                            | 是否显示自定义添加按钮                       |
| customAddButtonText        | `string`                                       | `'自定义添加'`                                                    | 自定义添加按钮文本                           |
| allowPluginToggle          | `boolean`                                      | `true`                                                            | 是否允许切换插件状态                         |
| allowToolToggle            | `boolean`                                      | `true`                                                            | 是否允许切换工具状态                         |
| allowPluginDelete          | `boolean`                                      | `true`                                                            | 是否允许删除插件                             |
| allowPluginAdd             | `boolean`                                      | `true`                                                            | 是否允许添加插件                             |
| loading                    | `boolean`                                      | `false`                                                           | 已安装插件加载状态                           |
| marketLoading              | `boolean`                                      | `false`                                                           | 市场插件加载状态                             |

### Slots

| 插槽名称         | 描述               | 默认内容 |
| ---------------- | ------------------ | -------- |
| `header-actions` | 头部右侧操作区插槽 | 无       |

### Events

| 事件名                 | 说明             | 回调参数                                                 |
| ---------------------- | ---------------- | -------------------------------------------------------- |
| market-category-change | 市场分类筛选变化 | `(category: string)`                                     |
| update:visible         | 面板显示状态变化 | `(visible: boolean)`                                     |
| update:activeCount     | 激活插件数量变化 | `(count: number)`                                        |
| tab-change             | 标签页切换       | `(activeTab: 'installed' \| 'market')`                   |
| plugin-toggle          | 插件启用/禁用    | `(plugin: PluginInfo, enabled: boolean)`                 |
| plugin-delete          | 删除插件         | `(plugin: PluginInfo)`                                   |
| plugin-add             | 市场插件添加     | `(plugin: PluginInfo)`                                   |
| plugin-create          | 插件创建         | `(type: 'form' \| 'code', data: PluginCreationData)`     |
| tool-toggle            | 工具启用/禁用    | `(plugin: PluginInfo, toolId: string, enabled: boolean)` |
| refresh                | 刷新请求         | `(tab: 'installed' \| 'market')`                         |

### Types

**PluginInfo**

插件信息类型：

```typescript
type PluginAddState = 'idle' | 'loading' | 'added'

interface PluginInfo {
  id: string // 插件唯一标识
  name: string // 插件名称
  icon: string // 插件图标URL
  description: string // 插件描述
  enabled: boolean // 是否启用
  expanded?: boolean // 是否展开
  tools: PluginTool[] // 工具列表
  addState?: PluginAddState // 市场插件添加状态(可选): 'idle' - 未添加, 'loading' - 添加中, 'added' - 已添加
  category?: string // 插件分类(可选，用于市场分类筛选)
}
```

**PluginTool**

插件工具类型：

```typescript
interface PluginTool {
  id: string // 工具唯一标识
  name: string // 工具名称
  description: string // 工具描述
  enabled: boolean // 是否启用
}
```

**MarketCategoryOption**

市场分类选项类型：

```typescript
interface MarketCategoryOption {
  value: string // 分类值
  label: string // 分类显示名称
}
```

**PluginFormData**

表单方式添加插件数据类型：

```typescript
interface PluginFormData {
  name: string // 插件名称
  description: string // 插件描述
  type: 'sse' | 'streamableHttp' // 插件类型, sse 或 streamableHttp
  url: string // 插件 URL
  headers: string // 请求头（JSON 格式字符串）
  thumbnail?: File | null // 缩略图文件（可选）
}
```

**PluginCreationData**

PluginCreationData 类型是 PluginFormData 或 string 的联合类型，用于表示插件创建的数据。

```typescript
type PluginCreationData = PluginFormData | string
```

**PopupConfig**

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

## McpAddForm

`McpAddForm` 在当前版本仍是独立的公共入口，未标记弃用。它可以继续用于现有 MCP 添加流程；迁移到 `ExtensionManager` 后，应用需要在表单确认时把结果转换为 Extension 数据并更新 `tabs`。

<!--@include: ./mcp-add-form.md-->
