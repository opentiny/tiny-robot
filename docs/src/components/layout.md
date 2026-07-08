---
outline: [1, 3]
---

# Layout 布局

`Layout` 是面向 AI 应用页面的通用布局组件，适合搭建聊天页、工作台和多面板操作界面。

它提供以下能力：

- 页面骨架：统一组织头部、主区、底部与左右侧栏
- 侧栏交互：支持展开、收起、拖拽改宽和 `drawer` 覆盖
- 浮层布局：支持定位、拖拽和缩放
- 主区滚动代理：适用于内容列居中或限宽后，原生滚动条偏离主区右边界的场景

## 基础布局

`Layout` 提供 `left-aside`、`header`、`main`、`footer` 和 `right-aside` 五个区域插槽，用于编排页面结构。

<demo vue="../../demos/layout/basic.vue" title="基础布局" description="最小布局示例。" />

## 布局模式

`mode` 控制 `Layout` 的整体形态，默认值为 `normal`。

- `normal`：普通页面骨架，参与文档流布局
- `floating`：悬浮布局，脱离文档流，支持用作悬浮工作区或可拖拽窗口

<demo vue="../../demos/layout/mode.vue" title="布局模式" description="切换 normal 和 floating 查看布局形态差异。" />

## 侧栏

侧栏由 `leftAside` / `rightAside` 控制，类型为 [`LayoutAsideOptions`](#layout-aside-options)。

侧栏内容通过 `left-aside` / `right-aside` 插槽提供。配置和内容分开后，可以只调整行为配置，而不影响插槽里的渲染结构。

### 展示形态

`LayoutAsideOptions.mode` 控制侧栏展示形态，默认值为 `dock`。

- `dock`：占据页面空间
- `drawer`：覆盖在内容上方

`drawer` 的宽度优先通过 `--tr-layout-drawer-width` 控制，未设置时回退到侧栏展开宽度。

<demo vue="../../demos/layout/aside-modes.vue" title="显示模式" description="左侧占据页面空间，右侧覆盖在内容上方。" />

### 收起行为

`collapsedWidth` 控制收起后还保留多少宽度，仅 `dock` 模式生效；`collapseEffect` 控制收起时的动画效果。

- `collapsedWidth > 0`：收起后保留一条窄栏
- `collapsedWidth = 0`：收起后完全隐藏
- `overlay`：侧栏外框保留，内容层不跟随宽度滑动
- `slide`：侧栏内容随宽度一起滑出

<demo
  vue="../../demos/layout/aside-collapse-effect.vue"
  title="收起行为"
  description="对比 overlay 和 slide 两种收起动画。"
/>

### 宽度调整

`resizable` 可以开启 `dock` 侧栏的拖拽改宽，宽度范围由 `minExpandedWidth` 和 `maxExpandedWidth` 控制。

<demo vue="../../demos/layout/aside-resizable.vue" title="宽度调整" description="拖动分隔线查看当前宽度和边界。" />

### 侧栏受控

`open` 和 `expandedWidth` 是受控值，状态变化后需要通过事件同步外部状态。

`defaultOpen` 和 `defaultExpandedWidth` 只提供初始值，适合不需要外部持续控制的场景。

<demo
  vue="../../demos/layout/aside-controlled.vue"
  title="侧栏受控"
  description="外部控制侧栏开关和宽度。"
/>

## 浮层

浮层相关配置和交互只在浮层模式下生效。

- `defaultFloatingState`：非受控初始状态，只在首次挂载时读取
- `floatingState`：受控状态，由外部维护当前位置和尺寸
- `floatingOptions`：浮层行为配置，用于拖拽、缩放和尺寸约束，不参与状态控制

> `defaultFloatingState` 和 `floatingState` 不要同时传入

### 非受控浮层

非受控浮层通过 `defaultFloatingState` 设置初始位置和尺寸。

<demo
  vue="../../demos/layout/floating.vue"
  title="非受控浮层"
  description="只设置初始位置和大小，后续由组件内部维护。"
/>

### 受控浮层

受控浮层以 `floatingState` 作为唯一状态源，组件始终按外部状态渲染；

后续通过 `update:floatingState` 通知外部同步。

<demo
  vue="../../demos/layout/floating-controlled.vue"
  title="受控浮层"
  description="由外部维护位置和尺寸状态。"
/>

### 浮层模式下的侧栏

浮层里同样可以放入侧栏、头部和主区。

<demo
  vue="../../demos/layout/floating-panels.vue"
  title="浮层模式下的侧栏"
  description="在浮层里组合常驻侧栏和按需抽屉。"
/>

## 代理滚动条

`Layout.ProxyScrollbar` 是代理滚动条，适合消息流、长内容阅读流和工作台主区。

常见于内容列居中或限宽后，原生滚动条偏离主区右边界的场景。

- 将实际承担滚动的元素传给 `scrollTarget`。
- 为使代理滚动条正确生效，该滚动元素需要具备以下基础样式。

```css
.scroll-host {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: auto;
}
```

<demo
  vue="../../demos/layout/main-scroll.vue"
  :vueFiles="[
    '../../demos/layout/main-scroll.vue',
    '../../demos/layout/main-scroll-bubble.vue',
    '../../demos/layout/main-scroll-div.vue'
  ]"
  title="代理滚动条"
  description="内容区居中后，滚动条仍固定在主区右侧。"
/>

## 侧栏开关

`Layout.AsideToggle` 是内置侧栏开关按钮，可以在 `Layout` 内部任意区域使用。

它给侧栏内容提供控制展开和收起的能力，默认插槽提供 `{ isOpen }`。

<demo vue="../../demos/layout/aside-toggle.vue" title="侧栏开关" description="在侧栏内容中使用 AsideToggle 触发当前侧栏开关。" />

## Props

### Layout {#layout-props}

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `mode` | 布局模式；`normal` 参与普通布局，`floating` 会脱离普通布局，不占原来的位置空间 | `'normal' \| 'floating'` | `'normal'` |
| `leftAside` | 左侧栏配置 | [`LayoutAsideOptions`](#layout-aside-options) | `-` |
| `rightAside` | 右侧栏配置 | [`LayoutAsideOptions`](#layout-aside-options) | `-` |
| `floatingState` | 受控浮层状态，需配合 `update:floatingState` 同步外部状态；不要和 `defaultFloatingState` 同时传入 | [`LayoutFloatingState`](#layout-floating-state) | `-` |
| `defaultFloatingState` | 非受控浮层初始状态，仅首次挂载读取一次；不要和 `floatingState` 同时传入 | [`LayoutFloatingState`](#layout-floating-state) | `-` |
| `floatingOptions` | 浮层行为配置，包括拖拽、缩放和尺寸约束；不参与状态控制 | [`LayoutFloatingOptions`](#layout-floating-options) | `-` |

### Layout.ProxyScrollbar {#layout-proxy-scrollbar-props}

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `scrollTarget` | 真实滚动容器的元素，或对应组件实例的 ref | [`LayoutScrollTarget`](#layout-scroll-target) | `-` |

### Layout.AsideToggle {#layout-aside-toggle-props}

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `side` | 控制的侧栏位置 | `'left' \| 'right'` | `-` |

## Slots

### Layout {#layout-slots}

| 插槽名 | 说明 | 作用域参数 |
| ------ | ---- | ---------- |
| `left-aside` | 左侧栏内容 | `-` |
| `header` | 顶部区域 | `-` |
| `main` | 主区内容 | `-` |
| `footer` | 底部区域 | `-` |
| `right-aside` | 右侧栏内容 | `-` |

### Layout.AsideToggle

| 插槽名 | 说明 | 作用域参数 |
| ------ | ---- | ---------- |
| `default` | 自定义切换按钮内容 | `{ isOpen: boolean }` |

## Events

单侧状态同步优先使用 `left/right-*` 事件；统一埋点、日志或聚合处理可使用 `aside-*` 事件；浮层受控同步只使用 `update:floatingState`。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'

const leftOpen = ref(true)

function syncLeftAside(detail: { open: boolean }) {
  leftOpen.value = detail.open
}

function trackAsideChange(detail: { side: 'left' | 'right'; open: boolean }) {
  console.log(detail.side, detail.open)
}
</script>

<template>
  <TrLayout
    :left-aside="{ open: leftOpen }"
    @left-aside-open-change="syncLeftAside"
    @aside-open-change="trackAsideChange"
  />
</template>
```

### Layout {#layout-layout-events}

| 事件名 | 说明 | 回调参数 |
| ------ | ---- | -------- |
| `update:floatingState` | 浮层位置或尺寸变化 | (value: [`LayoutFloatingState`](#layout-floating-state)) |
| `aside-open-change` | 侧栏开关变化 | (detail: [`LayoutAsideOpenDetail`](#layout-aside-open-detail)) |
| `left-aside-open-change` | 左侧栏开关变化 | (detail: [`LayoutAsideOpenValue`](#layout-aside-open-value)) |
| `right-aside-open-change` | 右侧栏开关变化 | (detail: [`LayoutAsideOpenValue`](#layout-aside-open-value)) |
| `aside-resize-start` | 开始调整侧栏宽度 | (detail: [`LayoutAsideResizeDetail`](#layout-aside-resize-detail)) |
| `aside-resize` | 调整侧栏宽度时持续触发 | (detail: [`LayoutAsideResizeDetail`](#layout-aside-resize-detail)) |
| `aside-resize-end` | 结束调整侧栏宽度 | (detail: [`LayoutAsideResizeDetail`](#layout-aside-resize-detail)) |
| `left-aside-resize-start` | 开始调整左侧栏宽度 | (detail: [`LayoutAsideResizeValue`](#layout-aside-resize-value)) |
| `left-aside-resize` | 调整左侧栏宽度时持续触发 | (detail: [`LayoutAsideResizeValue`](#layout-aside-resize-value)) |
| `left-aside-resize-end` | 结束调整左侧栏宽度 | (detail: [`LayoutAsideResizeValue`](#layout-aside-resize-value)) |
| `right-aside-resize-start` | 开始调整右侧栏宽度 | (detail: [`LayoutAsideResizeValue`](#layout-aside-resize-value)) |
| `right-aside-resize` | 调整右侧栏宽度时持续触发 | (detail: [`LayoutAsideResizeValue`](#layout-aside-resize-value)) |
| `right-aside-resize-end` | 结束调整右侧栏宽度 | (detail: [`LayoutAsideResizeValue`](#layout-aside-resize-value)) |
| `floating-drag-start` | 开始拖动浮层 | (detail: [`LayoutFloatingDragDetail`](#layout-floating-drag-detail)) |
| `floating-drag` | 拖动浮层时持续触发 | (detail: [`LayoutFloatingDragDetail`](#layout-floating-drag-detail)) |
| `floating-drag-end` | 结束拖动浮层 | (detail: [`LayoutFloatingDragDetail`](#layout-floating-drag-detail)) |
| `floating-resize-start` | 开始调整浮层尺寸 | (detail: [`LayoutFloatingResizeDetail`](#layout-floating-resize-detail)) |
| `floating-resize` | 调整浮层尺寸时持续触发 | (detail: [`LayoutFloatingResizeDetail`](#layout-floating-resize-detail)) |
| `floating-resize-end` | 结束调整浮层尺寸 | (detail: [`LayoutFloatingResizeDetail`](#layout-floating-resize-detail)) |

## Types {#types}

### LayoutAsideOptions {#layout-aside-options}

| 字段 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `mode` | 侧栏模式 | `'dock' \| 'drawer'` | `'dock'` |
| `open` | 受控开关状态 | `boolean` | `-` |
| `defaultOpen` | 非受控初始开关状态 | `boolean` | `left: true` / `right: false` |
| `expandedWidth` | 受控展开宽度；`drawer` 未设置 `--tr-layout-drawer-width` 时会回退使用该宽度 | `number` | `-` |
| `defaultExpandedWidth` | 非受控初始展开宽度；`drawer` 宽度回退值 | `number` | `left: 300` / `right: 320` |
| `minExpandedWidth` | 最小展开宽度边界 | `number` | `left: 200` / `right: 240` |
| `maxExpandedWidth` | 最大展开宽度边界 | `number` | `left: 560` / `right: 640` |
| `collapsedWidth` | 收起后保留的窄栏宽度，仅 `dock` 生效 | `number` | `0` |
| `collapseEffect` | `dock` 收起到窄栏时的内容动画 | `'overlay' \| 'slide'` | `'overlay'` |
| `resizable` | 是否允许拖拽改宽，仅 `dock` 生效 | `boolean` | `false` |

### LayoutAsideOpenDetail {#layout-aside-open-detail}

| 字段 | 说明 | 类型 |
| ---- | ---- | ---- |
| `side` | 当前侧栏位置 | `'left' \| 'right'` |
| `open` | 当前是否展开 | `boolean` |

### LayoutAsideOpenValue {#layout-aside-open-value}

| 字段 | 说明 | 类型 |
| ---- | ---- | ---- |
| `open` | 当前是否展开 | `boolean` |

### LayoutAsideResizeDetail {#layout-aside-resize-detail}

| 字段 | 说明 | 类型 |
| ---- | ---- | ---- |
| `side` | 当前侧栏位置 | `'left' \| 'right'` |
| `expandedWidth` | 当前侧栏宽度 | `number` |

### LayoutAsideResizeValue {#layout-aside-resize-value}

| 字段 | 说明 | 类型 |
| ---- | ---- | ---- |
| `expandedWidth` | 当前侧栏宽度 | `number` |

### LayoutScrollTarget {#layout-scroll-target}

`HTMLElement | Pick<ComponentPublicInstance, '$el'> | null | undefined`

优先传真实 DOM ref。只有组件根节点本身就是滚动宿主时，才传组件 ref；组件 ref 会被解析为 `$el`。

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { TrLayout } from '@opentiny/tiny-robot'

const scrollEl = ref<HTMLElement | null>(null)
</script>

<template>
  <TrLayout>
    <template #main>
      <div ref="scrollEl" class="scroll-host"></div>
      <TrLayout.ProxyScrollbar :scroll-target="scrollEl" />
    </template>
  </TrLayout>
</template>
```

### LayoutFloatingState {#layout-floating-state}

| 字段 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `placement` | 浮层位置 | `'top-left' \| 'top-right' \| 'bottom-left' \| 'bottom-right' \| 'center'` | `'center'` |
| `offsetX` | 横向偏移；`placement` 为 `center` 时不生效 | `number` | `24` |
| `offsetY` | 纵向偏移；`placement` 为 `center` 时不生效 | `number` | `24` |
| `width` | 浮层宽度；非受控时表示初始值，受控时表示当前值 | `number` | `420` |
| `height` | 浮层高度；非受控时表示初始值，受控时表示当前值 | `number` | `560` |

### LayoutFloatingOptions {#layout-floating-options}

| 字段 | 说明 | 类型 | 默认值 |
| ---- | ---- | ---- | ------ |
| `draggable` | 是否允许拖动浮层 | `boolean` | `true` |
| `resizable` | 是否允许通过浮层边缘手柄调整尺寸 | `boolean` | `false` |
| `minWidth` | 最小宽度 | `number` | `320` |
| `maxWidth` | 最大宽度 | `number` | `视口宽度` |
| `minHeight` | 最小高度 | `number` | `240` |
| `maxHeight` | 最大高度 | `number` | `视口高度` |

### LayoutFloatingDragDetail {#layout-floating-drag-detail}

与 [`LayoutFloatingState`](#layout-floating-state) 一致。

### LayoutFloatingResizeDetail {#layout-floating-resize-detail}

在 [`LayoutFloatingState`](#layout-floating-state) 基础上增加以下字段：

| 字段 | 说明 | 类型 |
| ---- | ---- | ---- |
| `handle` | 当前拖动的边或角 | `'s' \| 'e' \| 'w' \| 'ne' \| 'nw' \| 'se' \| 'sw'` |

## CSS 变量

### 布局基础 {#layout-css-basics}

| 变量名 | 说明 |
| ------ | ---- |
| `--tr-layout-height` | 布局高度 |
| `--tr-layout-bg` | 容器背景 |
| `--tr-layout-left-aside-bg` | 左侧栏背景 |
| `--tr-layout-right-aside-bg` | 右侧栏背景 |
| `--tr-layout-header-bg` | 顶部背景 |
| `--tr-layout-main-bg` | 主区背景 |
| `--tr-layout-footer-bg` | 底部背景 |
| `--tr-layout-divider-color` | 分隔线颜色 |
| `--tr-layout-overlay-bg` | drawer 遮罩颜色 |
| `--tr-layout-panel-shadow` | drawer 阴影 |
| `--tr-layout-floating-radius` | 浮层圆角 |
| `--tr-layout-floating-shadow` | 浮层阴影 |
| `--tr-layout-floating-z-index` | 浮层层级 |

### 内容与交互 {#layout-css-content}

| 变量名 | 说明 |
| ------ | ---- |
| `--tr-layout-main-min-width` | 主区最小宽度 |
| `--tr-layout-drawer-width` | drawer 展示宽度 |
| `--tr-layout-main-scrollbar-width` | 滚动条宽度 |
| `--tr-layout-main-scrollbar-thumb-bg` | 滚动条滑块颜色 |
| `--tr-layout-main-scrollbar-thumb-bg-hover` | 滑块悬停颜色 |
| `--tr-layout-main-scrollbar-thumb-bg-active` | 滑块激活颜色 |
