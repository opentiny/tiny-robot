---
outline: [1, 3]
---

# Trace 轨迹

Trace 是一个与框架无关的单轴轨迹组件，使用原生 DOM 展示按时间排列的执行记录。它适合展示 Agent 执行步骤、任务流程、请求过程和操作日志等内容。

组件上方是由各条记录颜色组成的时间轴，下方每条记录包含标签、消息和可选的时长。

## 概览

### 适用场景

- 展示 Agent 或任务的执行步骤和耗时。
- 展示请求、工具调用、数据处理等按时间排列的过程。
- 在原生 HTML 或任意框架宿主中嵌入轻量级轨迹视图。

## 安装与引入

### NPM / ESM

```bash
npm install @opentiny/tiny-robot
```

```ts
import { createTrace } from '@opentiny/tiny-robot/vanilla'
import '@opentiny/tiny-robot/vanilla/style.css'
```

Trace 的运行时不依赖 Vue、React 或其他框架。

### CDN

```html
<div id="trace"></div>
<p id="trace-event"></p>
<script src="https://cdn.jsdelivr.net/npm/@opentiny/tiny-robot@VERSION/dist/vanilla/vanilla.global.js"></script>
<script>
  const trace = window.TinyRobotVanilla.createTrace({
    container: document.querySelector('#trace'),
    items: [
      {
        id: 'prepare',
        type: 'info',
        label: 'Prepare',
        message: 'Prepare the execution environment',
        startTime: 0,
        endTime: 420,
      },
    ],
    onEvent(event) {
      if (event.type === 'select') {
        document.querySelector('#trace-event').textContent = `Selected: ${event.itemId}`
      }
    },
  })
</script>
```

将 `VERSION` 替换为实际发布版本。UMD 脚本提供 `window.TinyRobotVanilla.createTrace` 和 `window.TinyRobotVanilla.createTrajectory`。

## 用法示例

### 基础用法

下面的 Demo 展示最小配置和运行效果，源码面板中可以查看完整实现。

<demo vue="../../demos/trace/basic.vue" title="基础轨迹" description="使用最小配置渲染两条轨迹记录。" />

点击时间轴片段或消息可以查看选中状态；事件监听和程序化选中方式见 [Events](#events) 与 [Methods / Expose](#methods-expose)。

数字时间使用毫秒。`Date` 和 ISO 时间字符串也可以直接传入：

```ts
{
  startTime: new Date('2026-11-19T10:00:00.000Z'),
  endTime: '2026-11-19T10:00:01.200Z',
}
```

### 标签与颜色

`type` 用于匹配标签类型的默认样式，组件内置 `info`、`success`、`warning`、`error` 和 `analysis` 类型。

#### 默认标签颜色

只配置 `type`、不配置颜色时，组件使用内置的浅色标签和时间轴颜色。

<demo vue="../../demos/trace/labels-default.vue" title="默认标签颜色" description="只配置 type 时，使用组件内置的浅色标签和时间轴颜色。" />

#### 自定义标签颜色

可以通过 `labels` 增加新的类型，也可以为单条数据覆盖 `color` 和 `textColor`。Demo 的源码面板中可以查看完整配置。

<demo vue="../../demos/trace/labels-custom.vue" title="自定义标签颜色" description="通过 labels 增加自定义类型，并支持渐变背景和渐变文字。" />

#### 颜色优先级

```text
item.color / item.textColor
  > labels[item.type].color / labels[item.type].textColor
  > 内置类型颜色
  > 未知类型的默认灰色
```

颜色值支持普通 CSS 颜色和 CSS 渐变。渐变文字通过 `textColor` 传入 `linear-gradient(...)` 即可。

单轴允许时间区间重叠，重叠记录会自动排列到不同的时间轴层级，保证每条记录都可以从时间轴点击选中。完全位于显式轴范围之外的记录只保留在消息列表中，不显示时间轴片段。

### 时间轴与时长

时间轴范围默认取所有数据的最早开始时间和最晚结束时间。时间轴只展示颜色轨道，不展示时间刻度文字。

#### compact 紧凑格式

适合快速扫描，显示 `420ms`、`1.2s` 和 `1m 5s`。

<demo vue="../../demos/trace/duration-compact.vue" title="compact" description="紧凑显示毫秒、秒和分钟。" />

#### clock 时钟格式

适合需要统一时分秒格式的场景，显示 `00:00:00`。

<demo vue="../../demos/trace/duration-clock.vue" title="clock" description="统一显示 HH:MM:SS。" />

#### none 隐藏时长

适合只关注标签和消息内容的场景，隐藏右侧时长并自动拉伸消息区域。

<demo vue="../../demos/trace/duration-none.vue" title="none" description="不展示时长，消息区域自动占满。" />

## 可访问性与设计约束

### 键盘与焦点

时间轴片段和消息记录使用可聚焦按钮渲染，用户可以通过键盘聚焦并使用 Enter 或 Space 触发选中。选中状态通过 `aria-pressed` 反映。选中后组件会保留当前按钮的键盘焦点，并展开消息内容。

### 响应式与长内容

消息区域默认使用单行省略，标签根据内容自适应并限制最大宽度。点击或使用键盘选中消息后会展开完整内容，触屏设备不依赖鼠标悬停也可以查看全文。

## API

### Props

Trace 是命令式 vanilla 组件，以下 Props 对应 `createTrace(options)` 的 Options。`createTrajectory` 是 `createTrace` 的同义别名。

```ts
const trace = createTrace(options)
```

| 属性名           | 说明                                | 类型                                   | 默认值       | 必填 |
| ---------------- | ----------------------------------- | -------------------------------------- | ------------ | ---- |
| `container`      | 组件挂载容器。                      | `HTMLElement`                          | -            | 是   |
| `items`          | 要展示的轨迹记录数组。              | `readonly TrajectoryItem[]`            | -            | 是   |
| `labels`         | 自定义标签类型、背景色和文字颜色。  | `Record<string, TrajectoryLabelStyle>` | 内置类型     | 否   |
| `axis`           | 指定时间轴范围。                    | `TrajectoryAxisOptions`                | 自动计算     | 否   |
| `durationFormat` | 时长显示格式，`none` 隐藏时长列。   | `'compact' \| 'clock' \| 'none'`       | `'compact'`  | 否   |
| `formatDuration` | 自定义时长文本，`none` 时不会调用。 | `(durationMs, item) => string`         | 内置格式化   | 否   |
| `messages`       | 空状态文案。                        | `{ empty?: string }`                   | `'暂无轨迹'` | 否   |
| `selectedId`     | 初始选中的记录 ID。                 | `string \| null`                       | `null`       | 否   |
| `onEvent`        | 监听选中、更新和错误事件。          | `(event: TrajectoryEvent) => void`     | -            | 否   |

### Events

| 事件名   | 触发时机                       | 回调参数                   |
| -------- | ------------------------------ | -------------------------- |
| `select` | 用户激活记录，或 `select()` / `clearSelection()` 改变选中状态时。 | `{ type: 'select', itemId, source, item? }` |
| `update` | 数据或配置更新完成时。         | `{ type: 'update' }`       |
| `error`  | 数据校验或渲染配置发生错误时。 | `{ type: 'error', error }` |

`select.source` 的值为：

| 值         | 来源             |
| ---------- | ---------------- |
| `timeline` | 点击上方时间轴。 |
| `message`  | 点击下方消息。   |
| `api`      | 调用实例方法。   |

事件行为说明：

- `onEvent` 的事件对象始终包含 `type`。
- 用户重复点击当前记录时仍会触发 `select`，用于表示一次交互激活。
- 通过 `select(id)` 选择已经选中的记录时不会重复触发事件。
- `updateOptions({ selectedId })` 属于配置更新，成功后触发 `update`，不会额外触发 `select`。

### Slots

Trace 是原生 DOM 组件，不提供 Vue Slots。需要扩展内容时，请通过宿主容器或 `meta` 数据实现应用层展示。

### Methods / Expose

| 方法名           | 说明                                             | 签名                                         |
| ---------------- | ------------------------------------------------ | -------------------------------------------- |
| `setItems`       | 替换记录，并重新计算时间轴范围和每条记录的时长。 | `(items: readonly TrajectoryItem[]) => void` |
| `select`         | 选中指定记录，传入 `null` 清除选中。             | `(id: string \| null) => void`               |
| `clearSelection` | 清除当前选中记录。                               | `() => void`                                 |
| `getSelectedId`  | 获取当前选中的记录 ID。                          | `() => string \| null`                       |
| `updateOptions`  | 更新配置并重新渲染。                             | `(options: TrajectoryUpdateOptions) => void` |
| `destroy`        | 移除组件创建的 DOM 和事件监听。                  | `() => void`                                 |

```ts
trace.select('complete')
trace.clearSelection()
trace.setItems(nextItems)
trace.updateOptions({ durationFormat: 'clock' })
trace.destroy()
```

### Types

以下类型从 `@opentiny/tiny-robot/vanilla` 导出。

```ts
type TrajectoryTime = number | Date | string

interface TrajectoryItem {
  readonly id: string
  readonly type: string
  readonly label?: unknown
  readonly message: unknown
  readonly startTime: TrajectoryTime
  readonly endTime: TrajectoryTime
  readonly color?: string
  readonly textColor?: string
  readonly meta?: Record<string, unknown>
}

interface TrajectoryLabelStyle {
  readonly text?: string
  readonly color: string
  readonly textColor?: string
}

interface TrajectoryAxisOptions {
  readonly startTime?: TrajectoryTime
  readonly endTime?: TrajectoryTime
}

type TrajectoryFormatDuration = (durationMs: number, item: TrajectoryItem) => string

type TrajectoryDurationFormat = 'compact' | 'clock' | 'none'

interface TrajectoryMessages {
  readonly empty: string
}

interface TrajectoryOptions {
  readonly container: HTMLElement
  readonly items: readonly TrajectoryItem[]
  readonly labels?: Readonly<Record<string, TrajectoryLabelStyle>>
  readonly axis?: TrajectoryAxisOptions
  readonly durationFormat?: TrajectoryDurationFormat
  readonly formatDuration?: TrajectoryFormatDuration
  readonly messages?: Partial<TrajectoryMessages>
  readonly selectedId?: string | null
  readonly onEvent?: (event: TrajectoryEvent) => void
}

type TrajectoryUpdateOptions = Partial<Omit<TrajectoryOptions, 'container' | 'items'>>

type TrajectorySelectSource = 'timeline' | 'message' | 'api'

type TrajectoryEvent =
  | {
      readonly type: 'select'
      readonly itemId: string | null
      readonly source: TrajectorySelectSource
      readonly item?: TrajectoryItem
    }
  | { readonly type: 'update' }
  | { readonly type: 'error'; readonly error: Error }

interface TrajectoryInstance {
  readonly setItems: (items: readonly TrajectoryItem[]) => void
  readonly select: (id: string | null) => void
  readonly clearSelection: () => void
  readonly getSelectedId: () => string | null
  readonly updateOptions: (options: TrajectoryUpdateOptions) => void
  readonly destroy: () => void
}
```

`label` 和 `message` 支持任意值。字符串、数字和布尔值会直接显示；对象会转换为 JSON 文本。

### CSS Variables

| 变量名                            | 说明                 | 默认值    |
| --------------------------------- | -------------------- | --------- |
| `--tr-trajectory-bg`              | 组件背景颜色。       | `#ffffff` |
| `--tr-trajectory-text`            | 主文字颜色。         | `#191919` |
| `--tr-trajectory-muted`           | 次要文字和时长颜色。 | `#595959` |
| `--tr-trajectory-track`           | 时间轴轨道背景。     | `#eef2f7` |
| `--tr-trajectory-hover`           | hover 背景颜色。     | `#f8fafc` |
| `--tr-trajectory-selected`        | 选中消息背景。       | `#eff6ff` |
| `--tr-trajectory-selected-border` | 选中时间轴边框。     | `#93c5fd` |

文字颜色默认复用项目已有的 Vanilla Theme；暗色主题下轨道、hover 和选中态也会跟随已有主题变量变化。

组件会自动接入 Vanilla Theme。可以通过 `configureVanillaTheme({ colorMode: 'dark' })` 切换主题，也可以在挂载容器上覆盖上述 CSS 变量。

## 交互与限制

- 当前版本是单轴模型；重叠记录会在同一时间轴内分层显示，不支持独立的多轴时间范围。
- `endTime` 必须大于等于 `startTime`；相同时间点会使用最小可见宽度显示。
- `axis` 可以只配置 `startTime` 或 `endTime`；另一侧会根据数据范围计算，数据完全位于边界外时会保留在消息列表中但不显示时间轴片段。
- 当 `axis.startTime` 和 `axis.endTime` 相同时，相交记录会以居中的点标记显示。
- 记录按照传入数组顺序渲染，建议开发者按时间顺序传入数据。
- 时间轴片段颜色来自单条记录或标签类型配置；完全位于显式轴范围之外的记录只保留在消息列表中。
- `none` 模式只隐藏时长列，不影响时间轴的时间计算。
- 组件不依赖任何框架，可以直接在原生 HTML、Vue、React 或其他宿主中使用。
