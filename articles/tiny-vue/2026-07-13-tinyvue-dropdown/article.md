---
schema_version: article-hub.article.v2
title: 操作收纳更优雅：TinyVue Dropdown 下拉菜单上手指南
summary: 覆盖声明式与配置式两种写法，介绍 Dropdown 的触发方式、分割按钮、多级菜单与懒加载，帮助你在表格、工具栏和表单中快速落地操作菜单。
project: tiny-vue
article_type: practical-guide
style_profile: release-promotional
article_date: 2026-07-13
created_at: 2026-07-13T16:50:00+08:00
updated_at: 2026-07-13T16:50:00+08:00
author: OpenTiny
approval_snapshot:
  url: https://github.com/opentiny/tiny-vue/local-draft-dropdown
  approver: local-draft
  plan_comment_id: 1
  approval_comment_id: 2
sources:
  - id: opentiny-tiny-vue
    repository: https://github.com/opentiny/tiny-vue
    commit: 0123456789abcdef0123456789abcdef01234567
    accessed_at: 2026-07-13T16:50:00+08:00
  - id: opentiny-docs
    repository: https://github.com/opentiny/docs
    commit: 0123456789abcdef0123456789abcdef01234567
    accessed_at: 2026-07-13T16:50:00+08:00
generation:
  agent: cursor
  model: composer
  generated_at: 2026-07-13T16:50:00+08:00
---
# 操作收纳更优雅：TinyVue Dropdown 下拉菜单上手指南

表格行操作、工具栏「更多」、右键上下文菜单——这些 UI 模式背后都是同一类需求：在有限空间里收纳一组动作，按需展开。如果每个页面各自实现弹层定位、点击外部关闭、键盘可达性，样式和交互很容易不一致。

TinyVue 的 `Dropdown`（下拉菜单）提供声明式与配置式两种写法，配合 `DropdownMenu`、`DropdownItem` 子组件，或纯 `options` 数据驱动，覆盖从简单列表到多级菜单、分割按钮的常见场景。

## 基本用法：声明式菜单项

最直观的写法是在 `#dropdown` 插槽中放置 `tiny-dropdown-menu`，再用 `tiny-dropdown-item` 定义每一项：

```vue
<template>
  <tiny-dropdown>
    <template #dropdown>
      <tiny-dropdown-menu>
        <tiny-dropdown-item label="编辑" />
        <tiny-dropdown-item label="复制" />
        <tiny-dropdown-item disabled>删除</tiny-dropdown-item>
        <tiny-dropdown-item divided>导出</tiny-dropdown-item>
      </tiny-dropdown-menu>
    </template>
  </tiny-dropdown>
</template>

<script setup>
import { TinyDropdown, TinyDropdownMenu, TinyDropdownItem } from '@opentiny/vue'
</script>
```

`disabled` 禁用单项，`divided` 在项前添加分割线——表格「更多操作」、卡片右上角菜单都能直接复用这套结构。

## 配置式：用数据驱动菜单

菜单项来自后端或需要动态生成时，配置式更合适。有两种入口：

**方式一**：在 `tiny-dropdown` 上使用 `menu-options`（仅使用该组件即可）：

```vue
<template>
  <tiny-dropdown :menu-options="menuOptions" @item-click="onItemClick" />
</template>

<script setup>
import { ref } from 'vue'
import { TinyDropdown } from '@opentiny/vue'
import { iconStarDisable } from '@opentiny/vue-icon'

const menuOptions = ref({
  options: [
    { label: '编辑' },
    { label: '归档', divided: true },
    { label: '删除', disabled: true, icon: iconStarDisable() }
  ]
})

function onItemClick({ itemData }) {
  console.log('选中项：', itemData)
}
</script>
```

**方式二**：在 `tiny-dropdown-menu` 上使用 `options`。若后端字段不是 `label`，通过 `text-field` 指定展示字段即可。

配置式的好处是菜单结构与渲染解耦：权限变更时只改数据，不必动模板结构。

## 分割按钮：主操作与次要操作分离

「保存」是主操作，「另存为 / 导出 / 发布」是次要操作——这类场景适合 `split-button`。左侧按钮可绑定 `@button-click`，右侧箭头展开下拉：

```vue
<template>
  <tiny-dropdown split-button type="primary" @button-click="handleSave">
    保存
    <template #dropdown>
      <tiny-dropdown-menu>
        <tiny-dropdown-item label="另存为" />
        <tiny-dropdown-item label="导出 PDF" />
      </tiny-dropdown-menu>
    </template>
  </tiny-dropdown>
</template>

<script setup>
import { TinyDropdown, TinyDropdownMenu, TinyDropdownItem } from '@opentiny/vue'

function handleSave() {
  // 主按钮逻辑
}
</script>
```

`type`、`size` 等按钮样式属性在 `split-button` 模式下生效，视觉层级与交互语义都更清晰。

## 触发方式与显隐控制

默认 `trigger` 为 `hover`，也支持：

- `click`：点击展开，适合触屏或需要明确意图的场景。
- `contextmenu`：右键唤起，适合画布、表格行等上下文操作。

需要程序控制时，使用 `v-model:visible` 手动管理显隐，优先级高于 `trigger`。`hide-on-click` 控制点击菜单项后是否自动收起，默认为 `true`。

`placement` 可设置弹出位置（如 `bottom-start` / `bottom-end`），`inherit-width` 让下拉面板最小宽度继承触发源，避免窄按钮弹出过宽的菜单。

## 多级菜单与性能优化

二级菜单通过 `options` 里的 `children` 字段定义，配置式下即可生成多级结构，无需嵌套多层模板：

```js
const options = [
  {
    label: '导出',
    children: [
      { label: '导出 Excel' },
      { label: '导出 CSV' }
    ]
  }
]
```

菜单项很多或嵌套复杂时，可开启 `lazy-show-popper`，懒加载下拉面板及内部项，减少首屏 DOM 压力。`tip` 属性支持在菜单项上挂载提示信息，适合需要解释权限或副作用的操作。

## 常见落点与选型

| 场景 | 推荐写法 | 说明 |
| --- | --- | --- |
| 表格行「更多」 | 配置式 `options` + `item-click` | 行数据驱动菜单项显隐 |
| 工具栏批量操作 | `split-button` | 主操作一键触达，次要操作收纳 |
| 画布 / 节点右键 | `trigger="contextmenu"` | 符合用户心智 |
| 图标按钮菜单 | `#default` 插槽自定义触发源 | 搭配 `suffix-icon` 定制图标 |

`Dropdown` 解决的是「短时展开的动作列表」；若需要表单内的值选择，应使用 `BaseSelect` 或 `Select`；若是页面级模块导航，则考虑 `NavMenu` / `TreeMenu`。

## 小结

TinyVue `Dropdown` 用声明式与配置式双轨 API，覆盖从单行「更多」到分割按钮、多级菜单的主流交互。接入时先确定菜单数据来源（静态模板 vs 动态配置），再选择触发方式；表格与工具栏场景优先配置式，便于与权限系统对接。

## 关于 OpenTiny

OpenTiny 是面向企业级应用的前端开发解决方案，TinyVue 作为核心 UI 组件库，支持 Vue 2、Vue 3 及 PC / Mobile 多端场景，提供 100+ 高质量组件，开箱即用。

欢迎体验 TinyVue 组件库：[opentiny.design/tiny-vue](https://opentiny.design/tiny-vue/zh-CN/overview)

TinyVue 代码仓库：[github.com/opentiny/tiny-vue](https://github.com/opentiny/tiny-vue)（欢迎 Star ⭐）

添加微信小助手 **opentiny-official**，一起交流前端技术～
