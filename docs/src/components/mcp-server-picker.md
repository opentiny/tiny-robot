---
outline: deep
---

# MCP Server Picker 插件选择器

MCP Server Picker 组件是一个用于展示和管理插件的组件，支持已安装插件和插件市场两个标签页，可以进行插件的添加、删除和启用/禁用操作。

## 基础用法

基础的插件选择器组件用法，支持两种弹出方式：fixed（固定位置）和 drawer（抽屉）。

<demo vue="../../demos/mcp-server-picker/basic-usage.vue" />

## 弹出方式

MCP Server Picker 组件支持两种弹出方式，通过 `popupConfig` 配置对象统一管理：

### Fixed 模式

Fixed 模式下，组件会以固定位置的弹窗形式展示，可以通过 `position` 属性配置弹窗的位置。

```vue
<template>
  <McpServerPicker
    v-model:visible="showFixedPanel"
    :popup-config="{
      type: 'fixed',
      position: { top: '10%', right: '10%' },
      zIndex: 1000
    }"
    title="Fixed模式弹窗"
  />
</template>
```

### Drawer 模式

Drawer 模式下，组件会以抽屉的形式从页面的左侧或右侧滑出，可以通过 `drawer` 属性配置抽屉的方向和宽度。

```vue
<template>
  <!-- 左侧抽屉 -->
  <McpServerPicker
    v-model:visible="showDrawerLeftPanel"
    :popup-config="{
      type: 'drawer',
      drawer: { direction: 'left', width: 400 },
      zIndex: 1000
    }"
    title="左侧抽屉"
  />
  
  <!-- 右侧抽屉 -->
  <McpServerPicker
    v-model:visible="showDrawerRightPanel"
    :popup-config="{
      type: 'drawer',
      drawer: { direction: 'right', width: 450 }
    }"
    title="右侧抽屉"
  />
</template>
```

## API

### Props

| 属性名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| installedPlugins | PluginInfo[] | [] | 已安装的插件列表 |
| marketPlugins | PluginInfo[] | [] | 市场插件列表 |
| visible | boolean | false | 是否显示面板，支持 v-model:visible |
| popupConfig | PopupConfig | { type: 'fixed', position: {}, drawer: { direction: 'right', width: 482 }, zIndex: 1000 } | 弹出配置对象 |
| searchPlaceholder | string | '搜索插件' | 搜索框占位文本 |
| enableSearch | boolean | true | 是否启用搜索功能 |
| marketCategoryOptions | MarketCategoryOption[] | [] | 市场分类选项 |
| marketCategoryPlaceholder | string | '按照分类筛选' | 市场分类选择器占位文本 |
| enableMarketCategoryFilter | boolean | true | 是否启用市场分类筛选 |
| defaultActiveTab | 'installed' \| 'market' | 'installed' | 默认激活的标签页 |
| showInstalledTab | boolean | true | 是否显示已安装标签页 |
| showMarketTab | boolean | true | 是否显示市场标签页 |
| activeCount | number | - | 已激活的插件数量，支持 v-model:activeCount |
| installedTabTitle | string | '已安装插件' | 已安装标签页标题 |
| marketTabTitle | string | '市场' | 市场标签页标题 |
| title | string | '插件' | 面板标题 |
| showCustomAddButton | boolean | true | 是否显示自定义添加按钮 |
| customAddButtonText | string | '自定义添加' | 自定义添加按钮文本 |
| allowPluginToggle | boolean | true | 是否允许切换插件状态 |
| allowToolToggle | boolean | true | 是否允许切换工具状态 |
| allowPluginDelete | boolean | true | 是否允许删除插件 |
| allowPluginAdd | boolean | true | 是否允许添加插件 |
| enableParentChildSync | boolean | true | 是否启用父子级联动 |
| loading | boolean | false | 已安装插件列表加载状态 |
| marketLoading | boolean | false | 市场插件列表加载状态 |

### Events

| 事件名 | 说明 | 参数 |
| --- | --- | --- |
| update:visible | 面板显示状态变化 | (visible: boolean) |
| update:activeCount | 激活插件数量变化 | (count: number) |
| search | 搜索事件 | (query: string, tab: 'installed' \| 'market') |
| market-category-change | 市场分类变化 | (category: string) |
| tab-change | 标签页切换 | (activeTab: 'installed' \| 'market') |
| plugin-toggle | 插件状态切换 | (plugin: PluginInfo, enabled: boolean) |
| plugin-delete | 删除插件 | (plugin: PluginInfo) |
| plugin-add | 添加插件 | (plugin: PluginInfo, added: boolean) |
| plugin-expand | 展开/收起插件 | (plugin: PluginInfo, expanded: boolean) |
| tool-toggle | 工具状态切换 | (plugin: PluginInfo, toolId: string, enabled: boolean) |
| custom-add | 点击自定义添加按钮 | - |
| plugin-form-add | 表单方式添加插件 | (data: AddPluginFormData) |
| plugin-code-add | 代码方式添加插件 | (data: AddPluginCodeData) |
| refresh | 刷新事件 | (tab: 'installed' \| 'market') |

### 类型定义

```ts
// 弹出配置
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
    width?: string | number
  }
  // 通用配置
  zIndex?: number
}

// 插件信息
interface PluginInfo {
  id: string
  name: string
  icon: string
  description: string
  toolCount?: number
  enabled?: boolean
  expanded?: boolean
  tools?: PluginTool[]
  added?: boolean
  category?: string
}

// 插件工具
interface PluginTool {
  id: string
  name: string
  description: string
  enabled: boolean
}

// 市场分类选项
interface MarketCategoryOption {
  value: string
  label: string
}

// 添加插件表单数据
interface AddPluginFormData {
  name: string
  description: string
  types: string[]
  url: string
  headers: string
  thumbnail?: File | null
}

// 添加插件代码数据
interface AddPluginCodeData {
  aiPlugin: string
  openapi: string
}
```