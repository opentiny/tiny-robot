---
schema_version: article-hub.article.v2
title: 侧边导航一步到位：TinyVue TreeMenu 树型菜单实战指南
summary: 从文档站点侧边栏到权限树，介绍 TinyVue TreeMenu 的静态数据、搜索过滤、懒加载与折叠能力，帮助中后台项目快速落地层级导航。
project: tiny-vue
article_type: practical-guide
style_profile: release-promotional
article_date: 2026-07-13
created_at: 2026-07-13T16:50:00+08:00
updated_at: 2026-07-13T16:50:00+08:00
author: OpenTiny
approval_snapshot:
  url: https://github.com/opentiny/tiny-vue/local-draft-tree-menu
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
# 侧边导航一步到位：TinyVue TreeMenu 树型菜单实战指南

中后台项目里，侧边栏几乎是最先被用户感知的导航入口。菜单层级一多，团队往往要在「静态配置」「服务端下发」「搜索过滤」「折叠收起」之间反复权衡；如果每个项目都从零封装，维护成本会迅速堆高。

TinyVue 的 `TreeMenu`（树型菜单）把这类常见需求收敛到一个组件里：支持静态与服务端数据、内置搜索过滤、懒加载、勾选与拖拽，还能配合侧边折叠按钮适配窄屏布局。下面从典型接入场景出发，说明如何用它快速搭出可用的层级导航。

## 30 秒上手：静态树形菜单

`TreeMenu` 通过 `data` 属性接收树形数据，节点需包含唯一标识 `id` 与展示文本 `label`，子节点放在 `children` 数组中。组件名在模板中使用 `tiny-tree-menu` 前缀。

```vue
<template>
  <tiny-tree-menu placeholder="输入关键字搜索" :data="treeData" />
</template>

<script setup>
import { TinyTreeMenu } from '@opentiny/vue'
import { ref } from 'vue'

const treeData = ref([
  { id: 100, label: '组件总览' },
  {
    id: 200,
    label: '使用指南',
    children: [
      { id: 201, label: '环境准备' },
      { id: 202, label: '安装' },
      {
        id: 203,
        label: '引入组件',
        children: [
          { id: 20301, label: '按需引入' },
          { id: 20302, label: '完整引入' }
        ]
      }
    ]
  }
])
</script>
```

这段代码已经具备文档站点侧边栏的骨架：层级清晰、开箱即用。若后端字段名不是 `label` / `children`，可通过 `props` 做字段映射，无需改接口结构。

## 内置搜索：大型菜单也能快速定位

菜单节点上百个时，逐层展开找入口并不现实。`TreeMenu` 默认开启 `show-filter`，顶部会渲染搜索框；输入关键字后自动过滤可见节点。

需要更精细的控制时，可以组合以下属性：

- `highlight-query`：在匹配节点中高亮搜索文字，便于扫读。
- `filter-node-method`：自定义过滤逻辑，例如从精确匹配切换为前缀匹配。
- `clearable`：允许一键清空搜索框。

```vue
<tiny-tree-menu
  :data="treeData"
  :highlight-query="true"
  placeholder="搜索菜单"
/>
```

对文档站、配置中心、运维控制台这类「节点多、层级深」的场景，内置搜索能显著降低用户找功能的成本，也减少业务侧自研过滤逻辑。

## 懒加载：大树数据不必一次拉全

权限树、组织架构树往往节点规模很大，首屏全量加载既慢又占内存。开启 `lazy` 后，配合 `load` 方法按层请求子节点即可：

```vue
<template>
  <tiny-tree-menu :data="[]" lazy :load="loadNode" />
</template>

<script setup>
import { TinyTreeMenu } from '@opentiny/vue'

function loadNode(node, resolve) {
  if (node.level === 0) {
    return resolve([{ label: '华东区' }, { label: '华南区' }])
  }
  // 根据 node.data 请求子节点，完成后调用 resolve(children)
  fetchChildren(node.data).then((children) => resolve(children))
}
</script>
```

懒加载与静态 `data` 可以按模块拆分使用：首屏菜单走静态配置，动态权限树走懒加载，同一套组件 API 覆盖两种数据源。

## 折叠、勾选与拖拽：从导航延伸到管理

`TreeMenu` 不只服务于「点选跳转」。以下能力在中后台里同样高频：

| 能力 | 关键属性 | 典型场景 |
| --- | --- | --- |
| 侧边折叠 | `menu-collapsible` | 窄屏下收起侧栏，保留图标位 |
| 手风琴展开 | `accordion` | 同级只展开一个分组，减少视觉噪音 |
| 节点勾选 | `show-checkbox`、`default-checked-keys` | 权限分配、批量授权 |
| 节点拖拽 | `draggable`、`allow-drag`、`allow-drop` | 菜单排序、目录结构调整 |
| 服务端数据 | `get-menu-data-sync` | 菜单由后端统一维护 |

勾选场景下，`check-strictly` 可控制父子节点是否联动；`only-check-children` 则限制父级只能展开、不可选中，适合「目录不可授权、叶子才可授权」的权限模型。

## 选型建议：TreeMenu 适合什么场景

- **文档站 / 开发者门户侧边栏**：静态 `data` + 搜索过滤 + `default-expanded-keys` 高亮当前章节。
- **中后台模块导航**：配合 `url` 字段与路由跳转，或用 `node-click` / `current-change` 事件驱动 SPA 路由。
- **权限与组织树**：懒加载 + 勾选 + `node-key` 管理选中状态，通过 `getCurrentKey` / `setCurrentKey` 与表单联动。

若你需要顶栏水平导航或带 Logo 的工具栏位，可以看看同系列的 `NavMenu`；`TreeMenu` 更专注「纵向层级 + 侧栏」这一形态，API 也更贴近树形数据本身。

## 小结

`TreeMenu` 把中后台最常见的层级导航需求——数据接入、搜索、懒加载、折叠、勾选、拖拽——收敛到统一组件，减少每个项目重复造轮子的成本。接入时建议先确定数据源形态（静态 / 服务端 / 懒加载），再按需打开搜索与折叠；权限类场景提前规划 `node-key` 与勾选策略，后续与表单、路由的联动会更顺畅。

## 关于 OpenTiny

OpenTiny 是面向企业级应用的前端开发解决方案，TinyVue 作为核心 UI 组件库，支持 Vue 2、Vue 3 及 PC / Mobile 多端场景，提供 100+ 高质量组件，开箱即用。

欢迎体验 TinyVue 组件库：[opentiny.design/tiny-vue](https://opentiny.design/tiny-vue/zh-CN/overview)

TinyVue 代码仓库：[github.com/opentiny/tiny-vue](https://github.com/opentiny/tiny-vue)（欢迎 Star ⭐）

添加微信小助手 **opentiny-official**，一起交流前端技术～
