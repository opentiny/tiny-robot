---
outline: [1, 3]
---

# Anchor 锚点

用于长内容区域和长对话场景的目录导航。

## 代码示例

### BubbleList 场景

<demo
  vue="../../demos/anchor/controlled-search.vue"
  :vueFiles="['../../demos/anchor/controlled-search.vue', '../../demos/anchor/controlled-search.messages.ts', '../../demos/anchor/demo-shell.css']"
/>

使用要点：

1. 目录项 `id` 与目标节点上的 `data-anchor-id` 保持一致。
2. 如果 `BubbleList` 本身承担滚动，可直接将它的 ref 作为 `scrollContainer` 来源。
3. 目录显示文案和搜索文案通过 `label / searchText / tooltipText` 配置。
4. 需要搜索时传入 `searchOptions`；需要外部同步搜索词时使用 `v-model:searchQuery`。
5. 需要点击反馈时，使用 `targetFeedbackClass / targetFeedbackDuration`。
6. 紧凑会话场景建议让 `activeOffset` 与目标节点的 `scroll-margin-top` 保持一致，避免目录激活项提前切换。

### 普通内容场景

<demo
  vue="../../demos/anchor/basic-source.vue"
  :vueFiles="['../../demos/anchor/basic-source.vue', '../../demos/anchor/basic-source.messages.ts', '../../demos/anchor/demo-shell.css']"
/>

使用要点：

- 章节节点直接设置 `data-anchor-id`。
- 容器内滚动场景传入 `scrollContainer`。
- 建议让 `activeOffset` 与章节节点的 `scroll-margin-top` 保持一致。
- `expanded` 仅在 `expandTrigger="manual"` 时生效。

## Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `items` | [`AnchorItem[]`](#anchor-item) | - | 目录项列表。组件默认使用 `item.id` 匹配 `[data-anchor-id="<id>"]`，并滚动到对应节点 |
| `scrollContainer` | `HTMLElement \| null` | `null` | 滚动容器。传入后在该容器内解析目标节点并监听其滚动；未传入时回退到页面文档滚动 |
| `activeOffset` | `number` | `120` | 激活项判定时距离滚动容器顶部的偏移量 |
| `searchQuery` | `string` | 非受控 | 搜索词。传入后进入受控模式 |
| `searchOptions` | [`AnchorSearchOptions`](#anchor-search-options) | - | 搜索区配置。不传时不显示搜索区 |
| `tooltipDelay` | `number` | `260` | tooltip 显示延迟，避免展开动画过程中短文本被误判为截断 |
| `activeId` | `string` | 非受控 | 当前激活项。传入后进入受控模式 |
| `expanded` | `boolean` | `false` | 展开状态。仅在 `expandTrigger="manual"` 时生效 |
| `placement` | `'left' \| 'right'` | `'right'` | 停靠位置 |
| `expandTrigger` | `'hover' \| 'manual'` | `'hover'` | 展开方式。`hover` 为自动展开，`manual` 为不自动展开 |
| `targetFeedbackClass` | `string` | - | 点击目录项后追加到目标节点上的样式类名 |
| `targetFeedbackDuration` | `number` | `700` | 目标节点样式类名保留时间，单位为毫秒 |
| `emptyText` | `string` | `'No matching items'` | 搜索无结果文案 |

## Slots

| 插槽 | 参数 | 说明 |
| --- | --- | --- |
| `item` | `{ item, segments, active, expanded, highlighted }` | 自定义目录项内容 |
| `marker` | `{ item, active }` | 自定义目录点 |
| `search` | `{ searchQuery, setSearchQuery, searchOptions }` | 自定义搜索区 |
| `empty` | - | 自定义空结果内容 |

## Events

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `update:activeId` | `value: string \| undefined` | 当前激活项变化 |
| `update:expanded` | `value: boolean` | 展开状态变化 |
| `update:searchQuery` | `value: string` | 搜索词变化 |
| `select` | item: [`AnchorItem`](#anchor-item) | 目录项被选中时触发 |

## Types

### AnchorItem {#anchor-item}

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 唯一标识，同时用于匹配目标节点 |
| `label` | `string` | 目录显示文本 |
| `searchText` | `string` | 搜索时额外匹配的文本 |
| `tooltipText` | `string` | 自定义 tooltip 文案 |
| `meta` | `Record<string, unknown>` | 自定义透传数据 |

### AnchorSearchOptions {#anchor-search-options}

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `placeholder` | `string` | 搜索框占位文案 |
| `matcher` | [`AnchorSearchMatcher`](#anchor-search-matcher) | 自定义搜索匹配逻辑 |
| `clearOnCollapse` | `boolean` | 收起时是否清空搜索词 |

### AnchorSearchMatcher {#anchor-search-matcher}

```ts
type AnchorSearchMatcher = (
  item: AnchorItem,
  searchQuery: string,
) => false | AnchorHighlightSegment[]
```

返回 `false` 表示当前项不匹配；返回高亮片段数组表示匹配成功，并使用返回结果渲染高亮内容。

## CSS 变量

| CSS 变量 | 说明 |
| --- | --- |
| `--tr-anchor-width-collapsed` | 折叠态宽度 |
| `--tr-anchor-width-expanded` | 展开态宽度 |
| `--tr-anchor-surface-radius` | 面板圆角 |
| `--tr-anchor-item-radius` | 目录项圆角 |
| `--tr-anchor-marker-width` | 目录点宽度 |
| `--tr-anchor-marker-height` | 目录点高度 |
| `--tr-anchor-marker-radius` | 目录点圆角 |
| `--tr-anchor-marker-track-size` | 目录点轨道尺寸 |
| `--tr-anchor-bg` | 面板背景色 |
| `--tr-anchor-border` | 面板边框色 |
| `--tr-anchor-shadow` | 面板阴影 |
| `--tr-anchor-item-color` | 目录项文本色 |
| `--tr-anchor-item-color-active` | 激活目录项文本色 |
| `--tr-anchor-item-bg-hover` | 目录项 hover 背景色 |
| `--tr-anchor-marker-color` | 默认目录点颜色 |
| `--tr-anchor-marker-color-active` | 激活目录点颜色 |
| `--tr-anchor-tooltip-bg` | tooltip 背景色 |
| `--tr-anchor-tooltip-color` | tooltip 文本色 |
| `--tr-anchor-tooltip-shadow` | tooltip 阴影 |
| `--tr-anchor-search-bg` | 搜索框背景色 |
| `--tr-anchor-search-color` | 搜索框文本色 |
| `--tr-anchor-search-border` | 搜索框边框色 |
| `--tr-anchor-search-border-focus` | 搜索框聚焦边框色 |
| `--tr-anchor-search-focus-ring` | 搜索框聚焦外环 |
| `--tr-anchor-search-radius` | 搜索框圆角 |
| `--tr-anchor-empty-color` | 空结果文本色 |
| `--tr-anchor-focus-ring` | 目录项聚焦外环 |
| `--tr-anchor-highlight-color` | 搜索高亮色 |
