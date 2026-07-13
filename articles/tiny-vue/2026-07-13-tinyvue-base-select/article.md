---
schema_version: article-hub.article.v2
title: 表单筛选利器：TinyVue BaseSelect 基础选择器实战
summary: 从单选多选到远程搜索与虚拟滚动，介绍 BaseSelect 的标签式、配置式写法及企业表单中的常见增强能力。
project: tiny-vue
article_type: practical-guide
style_profile: release-promotional
article_date: 2026-07-13
created_at: 2026-07-13T16:50:00+08:00
updated_at: 2026-07-13T16:50:00+08:00
author: OpenTiny
approval_snapshot:
  url: https://github.com/opentiny/tiny-vue/local-draft-base-select
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
# 表单筛选利器：TinyVue BaseSelect 基础选择器实战

筛选区、编辑表单、弹窗配置——选择器是出现频率最高的表单控件之一。业务侧常常要在单选与多选、本地选项与远程搜索、几十个选项与上万条数据之间切换；如果每种模式各写一套，样式、键盘行为和清空逻辑很难统一。

TinyVue 的 `BaseSelect`（基础选择器）在 `Select` 能力之上提供更完整的表单场景支持：标签式与配置式双写法、多选标签折叠、远程搜索、虚拟滚动、选项缓存等。下面按接入路径说明如何在项目中快速用起来。

## 两种写法：标签式与配置式

**标签式**适合选项模板需要自定义图标的场景，通过 `tiny-option` 子组件声明每一项：

```vue
<template>
  <tiny-base-select v-model="value">
    <tiny-option
      v-for="item in options"
      :key="item.value"
      :label="item.label"
      :value="item.value"
      :icon="item.icon"
    />
  </tiny-base-select>
</template>

<script setup>
import { ref } from 'vue'
import { TinyBaseSelect, TinyOption } from '@opentiny/vue'
import { iconFile } from '@opentiny/vue-icon'

const value = ref('')
const options = ref([
  { value: 'bj', label: '北京', icon: iconFile() },
  { value: 'sh', label: '上海', icon: iconFile() }
])
</script>
```

**配置式**把选项列表交给 `options` 属性，模板更简洁，也便于与后端 JSON 直接对接：

```vue
<tiny-base-select v-model="value" :options="options" />
```

字段名默认 `label` / `value`，可通过 `text-field`、`value-field` 映射后端字段，无需改数据层。

## 多选：标签、必选与数量限制

开启 `multiple` 后，`v-model` 绑定值为数组，选中项以 Tag 形式展示。企业表单里常见的三个增强点：

```vue
<tiny-base-select
  v-model="value"
  multiple
  :multiple-limit="5"
  show-limit-text
  collapse-tags
  :options="options"
/>
```

- `multiple-limit` + `show-limit-text`：限制最多可选个数，并展示「已选 / 上限」提示。
- `required`（在 option 或 options 项上配置）：标记必选项，适合「至少选一个角色」类规则。
- `collapse-tags`：多选时折叠标签，避免输入框被撑爆；可配合 `show-proportion` 显示占比。

多选搜索场景下，`reserve-keyword` 可在选中一项后保留当前搜索词，连续筛选更高效。

## 搜索：本地过滤、面板搜索与远程加载

`BaseSelect` 提供多层搜索能力，按数据来源选用：

| 模式 | 关键属性 | 适用场景 |
| --- | --- | --- |
| 输入框过滤 | `filterable`、`filter-method` | 选项已在本地，边输边筛 |
| 面板内搜索 | `searchable` | 选项多，在下拉面板顶部单独放搜索框 |
| 远程搜索 | `filterable` + `remote` + `remote-method` | 选项来自接口，按关键字分页查询 |

远程搜索示例：

```vue
<template>
  <tiny-base-select
    v-model="value"
    filterable
    remote
    :remote-method="remoteMethod"
    :loading="loading"
    :options="options"
  />
</template>

<script setup>
import { ref } from 'vue'

const value = ref('')
const options = ref([])
const loading = ref(false)

function remoteMethod(query) {
  if (!query) {
    options.value = []
    return
  }
  loading.value = true
  fetchUsers(query).then((list) => {
    options.value = list
    loading.value = false
  })
}
</script>
```

需要允许用户创建不在列表中的条目时，组合 `allow-create` 与 `filterable`；`default-first-option` 则支持按 Enter 快速选中第一个匹配项。

## 大数据量：虚拟滚动

选项达到万级时，普通渲染会导致下拉打开卡顿。配置式下开启 `optimization` 即可启用虚拟滚动：

```vue
<tiny-base-select
  v-model="value"
  :options="largeOptions"
  optimization
/>
```

多选 + 大数据场景建议同时开启 `collapse-tags`，并合理设置 `multiple-limit`，避免一次选中过多 DOM 节点。官方示例中 10 万条选项仍可流畅滚动，适合城市、物料编码等长列表选择。

## 体验细节：清空、缓存与插槽扩展

单选场景下 `clearable` 提供一键清除；`clear-no-match-value` 可在 `v-model` 值在 options 中找不到匹配时自动清空，避免脏数据提交。

配置式还支持 `cache-op` 本地缓存用户常选项，按点击频次或时间排序并在下拉中高亮——适合「最近使用的审批人 / 部门」这类高频字段。

插槽方面，`prefix` 自定义输入框前缀，`footer` 扩展下拉底部（如「新增条目」按钮），`empty` 自定义无数据展示；`top-create` 配合 `@top-create-click` 可在面板顶部放新增入口。

## 与 Dropdown、Select 如何区分

- **BaseSelect**：表单字段，有明确 `v-model` 绑定值，强调选项选择与回显。
- **Dropdown**：动作列表，无表单绑定语义，适合「操作」而非「选值」。
- **Select**：同族选择器；`BaseSelect` 提供更完整的多选、虚拟滚动、缓存等企业级增强，新表单优先评估 `BaseSelect`。

## 小结

`BaseSelect` 把单选、多选、搜索、远程加载、虚拟滚动和选项缓存收敛到同一组件，标签式与配置式满足不同团队的模板习惯。接入建议：小数据量用配置式快速上线；远程字段先打通 `remote-method`；万级选项记得开 `optimization`；多选表单提前规划 `collapse-tags` 与 `multiple-limit`，避免布局与性能问题。

## 关于 OpenTiny

OpenTiny 是面向企业级应用的前端开发解决方案，TinyVue 作为核心 UI 组件库，支持 Vue 2、Vue 3 及 PC / Mobile 多端场景，提供 100+ 高质量组件，开箱即用。

欢迎体验 TinyVue 组件库：[opentiny.design/tiny-vue](https://opentiny.design/tiny-vue/zh-CN/overview)

TinyVue 代码仓库：[github.com/opentiny/tiny-vue](https://github.com/opentiny/tiny-vue)（欢迎 Star ⭐）

添加微信小助手 **opentiny-official**，一起交流前端技术～
