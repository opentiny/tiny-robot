---
outline: [1, 3]
---

# McpServerPicker 迁移指南

从 v0.5.1 升级到 v1.0 时，`McpServerPicker` 自 v1.0 起弃用，未来会移除。新功能请使用 [`ExtensionManager`](/components/extension-manager)。旧组件在兼容期仍可使用，API 见 [McpServerPicker](/components/mcp-server-picker)。

`McpServerPicker` 将 MCP 列表、弹出容器、自定义添加表单和工具开关集中在一个组件中。`ExtensionManager` 只负责通用 Extension 的浏览、筛选、分区和操作事件；弹出容器、MCP 表单、工具详情及数据更新由应用实现。

## 从 McpServerPicker 迁移到 ExtensionManager

### 数据与操作映射

| `McpServerPicker`                                         | `ExtensionManager`                                            | 迁移说明                                                                                                                                                      |
| --------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `installedPlugins`、`marketPlugins`                       | 一个或多个 `ExtensionManagerTab` 的 `items`                   | 将同类 MCP 合并到同一标签页；使用 `item.installed` 区分“已安装”和“可安装”，并保证 `item.id` 唯一。                                                            |
| `installedSearchFn`、`marketSearchFn`、搜索开关及占位文案 | 内置的名称和描述关键词搜索                                    | 当前公共 API 不能关闭搜索、修改占位文案或替换匹配规则。预过滤 `tabs` 仍会与内置搜索叠加；必须保留旧搜索体验时，由应用组合自己的管理界面。 |
| `marketCategoryOptions`、分类开关及占位文案               | `item.tags`，或应用自建的分类控件与预过滤层                   | 内置标签筛选把 tag 值同时用作显示文案。分类值与文案相同时可直接迁移；否则不要传 `item.tags`，由应用保留 value 与 label 映射并预过滤 `tabs`。                  |
| `PluginInfo.enabled`                                      | `ExtensionCardSwitchAction.checked`                           | 应用处理 `action.id` 对应的开关操作，并使用 `action.checked` 更新外部 MCP 数据。                                                                              |
| `plugin-add`、`plugin-delete`                             | `action` 事件中的自定义 action id                             | 应用完成安装或卸载后更新 `item.installed` 和 `actions`，组件随后重新分区。                                                                                    |
| `addState`、`loading`                                     | `item.progress`、action 的 `disabled`，以及应用自己的请求状态 | `ExtensionManager` 不执行请求，也不自动改变安装状态。                                                                                                         |
| `visible`、`popupConfig`                                  | 应用提供的页面、Dialog、Drawer 或其他宿主                     | `ExtensionManager` 是内容管理面板，不负责遮罩、定位、焦点陷阱和滚动锁定。                                                                                     |
| `plugin-create`                                           | 应用实现的 MCP 表单；完成后更新 `tabs`                        | `ExtensionManager` 不包含 MCP 创建表单。`McpAddForm` 仍是独立的公共入口，未标记弃用。                                                               |
| `tools`、`tool-toggle`                                    | 应用提供的详情界面或 `item` 插槽                              | 通用 Card 不推断 MCP 工具层级；自定义内容需要自行承担事件、键盘和 ARIA 语义。                                                                                 |

`McpServerPicker` 的“已安装”和“市场”是两个固定标签页；`ExtensionManager.tabs` 表示 Extension 类型或应用定义的分类，每个标签页内部再根据 `installed` 自动生成“已安装”和“可安装”分区。迁移时不要直接把两组旧列表分别当成两个 `ExtensionManagerTab`，否则每个标签页仍会额外生成两个分区。

### 最小迁移示例

旧组件分别接收已安装和市场列表，并自行承载弹出面板：

```vue
<McpServerPicker
  v-model:visible="visible"
  :installed-plugins="installedPlugins"
  :market-plugins="marketPlugins"
  @plugin-toggle="handlePluginToggle"
  @plugin-add="handlePluginAdd"
/>
```

迁移后，将两组数据映射为同一个 MCP 标签页中的条目；安装状态由 `installed` 决定。弹出面板由应用已有的 Dialog、Drawer 或页面承载：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TrExtensionManager } from '@opentiny/tiny-robot'
import type { ExtensionManagerActionEvent, ExtensionManagerTab } from '@opentiny/tiny-robot'

const tabs = ref<ExtensionManagerTab[]>([{
  id: 'mcp',
  label: 'MCP',
  items: [
    {
      id: 'github',
      name: 'GitHub',
      installed: true,
      actions: [
        { id: 'enabled', type: 'switch', label: '启用 GitHub', checked: true },
        { id: 'uninstall', type: 'button', label: '卸载' },
      ],
    },
    {
      id: 'filesystem',
      name: '文件系统',
      installed: false,
      actions: [{ id: 'install', type: 'button', label: '安装' }],
    },
  ],
}])

function handleAction(event: ExtensionManagerActionEvent) {
  const item = tabs.value.find((tab) => tab.id === event.tabId)?.items.find((entry) => entry.id === event.itemId)
  if (!item) return

  if (event.action.type === 'switch' && event.action.id === 'enabled') {
    const action = item.actions?.find((entry) => entry.id === 'enabled')
    if (action?.type === 'switch' && typeof event.action.checked === 'boolean') {
      action.checked = event.action.checked
    }
  }

  // 安装、卸载应在应用请求成功后更新 item.installed 和 actions。
}
</script>

<template>
  <TrExtensionManager :tabs="tabs" @action="handleAction" />
</template>
```

这个示例只演示数据形态和开关事件。安装、卸载、添加表单与详情界面的完整组合见 [MCP 与 Skill 扩展管理实践](/best-practices/extension-manager-integration)。

操作事件也从多个 MCP 专用事件合并为一个通用 `action` 事件。应用需要为安装、卸载和开关配置稳定的 action id，再根据 `tabId`、`sectionKey`、`itemId` 和 `action` 更新原始数据。完整的数据和事件示例见 [ExtensionManager 快速开始](/components/extension-manager#快速开始)及[处理操作事件](/components/extension-manager#处理操作事件)。

### 迁移时需要保留的应用职责

- 使用应用现有的 Dialog、Drawer 或页面承载 `ExtensionManager`，并处理打开、关闭和焦点返回。
- 在 MCP 表单提交成功后，将结果转换为 `ExtensionManagerItem` 并更新对应标签页。
- 将工具列表和工具级开关放入详情界面；若通过 `item` 插槽直接展示，需要补齐默认 Card 不再提供的交互和可访问性行为。
- 在安装、卸载、启用或禁用请求期间更新 `progress`、action `disabled` 和最终数据；组件只发出用户操作意图。
