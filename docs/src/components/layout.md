---
outline: [1, 3]
---

# Layout 布局

`Layout` 用来组织带有头部、主内容区、底部和左右侧栏的页面。

它覆盖五类核心使用模型：

- 页面骨架：通过 `left-aside`、`header`、`main`、`footer`、`right-aside` 组织区域内容
- 布局模式：通过 `mode` 在普通布局和浮层布局之间切换
- 侧栏配置：通过 `leftAside` / `rightAside` 控制侧栏行为
- 浮层状态：通过 `defaultFloatingState` 或 `floatingState` 控制浮层位置和尺寸
- 主区滚动：通过 `Layout.ProxyScrollbar` 将滚动条固定在主区边界

## 基础布局

`Layout` 用于定义页面结构，各区域的具体内容通过插槽提供。

<demo vue="../../demos/layout/basic.vue" title="基础布局" description="最小布局示例。" />

## 布局模式

`mode` 控制 `Layout` 的整体形态。

- `normal`：普通页面骨架，参与原始页面布局
- `floating`：悬浮工作区，脱离原始页面布局并挂载到 `body`

普通页面不需要显式传 `mode`。需要临时面板、悬浮工作台或可拖拽窗口时，再使用 `mode="floating"`。

## 侧栏

侧栏由 `leftAside` / `rightAside` 控制，类型为 [`LayoutAsideProps`](#layout-aside-props)。

侧栏内容通过 `left-aside` / `right-aside` 插槽提供。配置和内容分开后，业务可以只调整行为配置，而不影响插槽里的渲染结构。

### 展示形态

- `dock`：占据页面空间
- `drawer`：覆盖在内容上方

`drawer` 的宽度优先通过 `--tr-layout-drawer-width` 控制，未设置时回退到侧栏展开宽度。

<demo vue="../../demos/layout/aside-modes.vue" title="显示模式" description="左侧占据页面空间，右侧覆盖在内容上方。" />

### 收起行为

`collapsedWidth` 控制收起后还保留多少宽度，`collapseEffect` 控制收起时的动画效果。

- `collapsedWidth > 0`：收起后保留一条窄栏
- `collapsedWidth = 0`：收起后完全隐藏
- `overlay`：内容留在原位
- `slide`：内容跟着一起移动

<demo
  vue="../../demos/layout/aside-collapse-effect.vue"
  title="收起行为"
  description="对比 overlay 和 slide 两种收起动画。"
/>

### 宽度调整

`resizable` 可以开启 `dock` 侧栏的拖拽改宽，宽度范围由 `minExpandedWidth` 和 `maxExpandedWidth` 控制。

<demo vue="../../demos/layout/aside-resizable.vue" title="宽度调整" description="拖动分隔线查看当前宽度和边界。" />

### 状态控制

`open` 和 `expandedWidth` 是受控值，状态变化后需要通过事件同步外部状态。

`defaultOpen` 和 `defaultExpandedWidth` 只提供初始值，适合不需要外部持续控制的场景。

<demo
  vue="../../demos/layout/aside-slot-props.vue"
  title="状态控制"
  description="用开关和滑块展示 leftAside、rightAside 和事件同步。"
/>

## 浮层

浮层只在 `mode="floating"` 时生效，适合临时面板、悬浮工作区或对话面板。

`defaultFloatingState` 和 `floatingState` 不要同时传入：

- `defaultFloatingState`：非受控初始状态，只在首次挂载时读取
- `floatingState`：受控状态，由外部维护当前位置和尺寸

### 非受控浮层

非受控浮层通过 `defaultFloatingState` 设置初始位置和尺寸。拖动或缩放后，状态由组件内部维护，适合展示 `placement`、`offsetX`、`offsetY`、`draggable` 和 `resizable`。

<demo
  vue="../../demos/layout/floating.vue"
  title="非受控浮层"
  description="打开时通过 defaultFloatingState 设置初始位置和大小。"
/>

### 受控浮层

受控浮层以 `floatingState` 作为唯一状态源，组件按传入状态渲染；拖拽或缩放产生变化时，通过 `update:floatingState` 通知外部同步。位置固定或由外部规则决定时，建议关闭 `draggable`。

<demo
  vue="../../demos/layout/floating-controlled.vue"
  title="受控浮层"
  description="通过 floatingState 控制位置和大小，并回显当前状态。"
/>

### 浮层工作区

浮层里同样可以放入侧栏、头部和主区。常见用法是把左右两侧都做成按需展开的 drawer。

<demo
  vue="../../demos/layout/floating-panels.vue"
  title="浮层工作区"
  description="在浮层里组合左右 drawer，适合临时工作区、对话面板或侧边操作台。"
/>

## 主区滚动

`Layout.ProxyScrollbar` 用来代理主区滚动条，适合消息流、长内容阅读流和工作台主区。

它解决的是“内容列居中后，原生滚动条跟着内容列移动，不再贴近主区右边界”的问题。使用时应让外层作为真实滚动宿主；如果内容需要居中或限宽，再交给内层容器处理。

- `scrollTarget` 传实际滚动元素，或对应组件实例的 `ref`
- 滚动宿主需自行设置尺寸、`box-sizing` 和滚动样式
- `Layout.ProxyScrollbar` 会自动隐藏滚动宿主的原生滚动条

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
  title="主区滚动"
  description="演示内容区居中后，滚动条仍固定在主区右侧。"
/>

## Layout.AsideToggle

`Layout.AsideToggle` 是内置侧栏开关按钮，只能在 `Layout` 内部使用，通常放在 `left-aside` / `right-aside` 插槽中。

它适合让侧栏内容自己控制展开和收起，默认插槽提供 `{ isOpen }`。自定义按钮内容时，应保留可读文本或补充 `aria-label`。

## Props

### Layout {#layout-props}

| 属性名 | 说明 | 类型 | 默认值 |
| ------ | ---- | ---- | ------ |
| `mode` | 布局模式；`normal` 参与普通布局，`floating` 会脱离普通布局，不占原来的位置空间 | `'normal' \| 'floating'` | `'normal'` |
| `leftAside` | 左侧栏配置 | [`LayoutAsideProps`](#layout-aside-props) | `-` |
| `rightAside` | 右侧栏配置 | [`LayoutAsideProps`](#layout-aside-props) | `-` |
| `floatingState` | 受控浮层状态，需配合 `update:floatingState` 同步外部状态；不要和 `defaultFloatingState` 同时传入 | [`LayoutFloatingState`](#layout-floating-state) | `-` |
| `defaultFloatingState` | 非受控浮层初始状态，仅首次挂载读取一次；不要和 `floatingState` 同时传入 | [`LayoutFloatingState`](#layout-floating-state) | `-` |
| `floatingOptions` | 浮层拖拽、缩放和尺寸约束配置 | [`LayoutFloatingOptions`](#layout-floating-options) | `-` |

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

### LayoutAsideProps {#layout-aside-props}

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

`Layout` 嵌入卡片、小容器或文档 demo 时，常需要把 `--tr-layout-main-min-width` 设为 `0`，否则主区默认最小宽度 `320px` 可能撑开布局。

| 变量名 | 说明 |
| ------ | ---- |
| `--tr-layout-main-min-width` | 主区最小宽度 |
| `--tr-layout-drawer-width` | drawer 展示宽度 |
| `--tr-layout-main-scrollbar-width` | 滚动条宽度 |
| `--tr-layout-main-scrollbar-thumb-bg` | 滚动条滑块颜色 |
| `--tr-layout-main-scrollbar-thumb-bg-hover` | 滑块悬停颜色 |
| `--tr-layout-main-scrollbar-thumb-bg-active` | 滑块激活颜色 |
