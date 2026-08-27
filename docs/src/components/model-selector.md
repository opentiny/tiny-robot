---
outline: [1, 3]
---

# ModelSelector 模型选择器

ModelSelector 是一个模型下拉选择器，用于在一组模型中选择当前模型。它内置搜索、分组、禁用项、键盘操作、浮层定位、思考强度和内容插槽。

组件只负责渲染与选择交互。DeepSeek、Qwen 等 Provider 的模型目录、请求参数、价格、上下文长度等业务数据仍由消费层维护；ModelSelector 只消费传入的 `models` 字段。

模型图标也由每个模型的 `icon` 字段传入。可以使用 `@opentiny/tiny-robot-svgs` 提供的 Provider 图标，也可以传入任意 Vue 组件；ModelSelector 本身不包含 `providerId -> icon` 的自动映射。

::: tip 组件边界
按 Provider 筛选、决定实际向哪个模型发请求、把思考强度转换为 Provider 请求参数，都应该在组件外处理。组件只根据每个模型的 `reasoningEfforts` 字段展示可选的思考强度，并通过事件把用户选择通知出去。
:::

## 代码示例

### 基础用法

组件的最小模型项只需要 `value` 与 `label`。下例通过 `v-model` 和 `v-model:reasoning-effort` 控制模型与推理强度，并演示外部图标及一个自定义 reasoning effort 配置。

<demo vue="../../demos/model-selector/basic.vue" title="基础用法" description="最小模型数据、受控模型与推理强度，以及外部 Provider 图标。" />

#### 模型数据怎么配置

推荐把完整模型目录与选择器要显示的数据分开。上下文长度、最大输出、模态、价格和 Provider 请求参数可以留在业务侧模型目录中；传给 ModelSelector 时，只映射当前 UI 需要展示或搜索的字段。

| 字段层级 | 字段                                                  | 什么时候配置                         |
| -------- | ----------------------------------------------------- | ------------------------------------ |
| 必需     | `value`、`label`                                      | 每个模型都需要，用于标识和显示       |
| 常用展示 | `icon`、`description`、`disabled`                     | 需要图标、描述或禁用模型时配置       |
| 进阶能力 | `group`、`groupLabel`、`keywords`、`reasoningEfforts` | 需要分组、补充搜索词或思考强度时配置 |

简单来说，组件不读取模型目录里的业务字段，也不会推断 Provider 能力；它只按 `ModelSelectorOption` 渲染你传入的列表。

### 受控选择

`v-model` 控制当前模型。外部设置不存在的值时，组件保留原值并显示 `placeholder`，不会擅自选择第一项。这样可以避免模型列表异步更新时，组件悄悄替用户换模型。浮层的 `open` 受控行为和模型列表动态更新规则见下方“状态规则”。

<demo vue="../../demos/model-selector/controlled.vue" :vueFiles="['../../demos/model-selector/controlled.vue', '../../demos/model-selector/demo-models.ts']" title="受控选择" description="使用 v-model 修改当前模型，并观察无效值的 placeholder 行为。" />

### 外观与尺寸

组件提供 `outline`、`ghost`、`muted` 三种外观，以及 `small`、`normal`、`large` 三种尺寸。这个案例只展示外观和尺寸，不涉及插槽或状态控制。

<demo vue="../../demos/model-selector/variants.vue" :vueFiles="['../../demos/model-selector/variants.vue', '../../demos/model-selector/demo-models.ts']" title="外观与尺寸" description="对比三种 variant 和三种 size。" />

### 插槽定制

通过 `trigger`、`panel-header`、`group-label`、`item`、`empty` 和 `footer` 插槽调整显示内容，不改变组件的选择、搜索和键盘交互。这个案例保留了更完整的面板层次和 effort 操作区，适合查看每个插槽能拿到哪些数据，以及如何替换默认展示。

<demo vue="../../demos/model-selector/slots.vue" title="完整插槽组合" description="自定义 Trigger、面板头、分组标题、模型项、空状态和 footer。" />

#### 图标 Trigger

`trigger` 插槽可以在桌面端显示图标与模型名称，在移动端只显示图标。插槽只替换按钮内容，组件仍然保留外层按钮的打开关闭、键盘操作和 ARIA 语义；没有图标时应回退到 `label`，避免出现空按钮。由于插槽会替换默认内容，示例同时自行渲染下拉箭头。

<demo vue="../../demos/model-selector/icon-trigger.vue" title="响应式图标 Trigger" description="桌面端显示模型名称，移动端仅显示模型图标。" />

## 状态规则

### 受控与非受控

- 传入 `v-model` / `modelValue` 时，当前模型由外部维护；否则组件使用 `defaultValue` 作为初始值，并在用户选择后自己更新。
- 传入 `v-model:reasoning-effort` / `reasoningEffort` 时，思考强度由外部维护；否则组件使用 `defaultReasoningEffort` 作为初始值，并在用户选择后自己更新。
- 传入 `open` 时，浮层开关由外部维护；否则组件使用 `defaultOpen` 作为初始开关，并在用户交互后自己更新。
- 同一个组件实例生命周期内不要在受控与非受控之间切换。开发环境会对此给出警告。
- 受控模式下，消费方需要响应对应的 `update:modelValue`、`update:reasoningEffort` 或 `update:open` 并回写状态；未回写时组件不会自行修改受控值。

### 值与事件语义

| 场景                            | 结果                                            |
| ------------------------------- | ----------------------------------------------- |
| 未提供初始值                    | 显示 `placeholder`，不会默认选择第一项          |
| 初始化、外部赋值、更新 `models` | 不触发 `change`                                 |
| 当前值不存在或对应项被移除      | 保留原值，显示 `placeholder`，不自动回退        |
| 用户选择新项                    | 依次请求更新 value、触发 `change`、请求关闭浮层 |
| 用户重复选择当前项              | 只请求关闭，不重复触发 value 更新或 `change`    |
| `models` 存在重复 `value`       | 仅第一项参与渲染；开发环境输出警告              |
| 当前项或组件被禁用              | 禁止选择；组件禁用时浮层保持关闭                |

`ModelSelectorOption.value` 应在列表中保持唯一。组件通过 value 判断选中状态，因此不要把 label 当作稳定标识。

## 搜索与分组

默认搜索会进行不区分大小写的包含匹配，搜索文本由以下字段共同组成：

- `label`
- `value`
- `description`
- `group`
- `groupLabel`
- `keywords`

传入 `filterMethod(query, option)` 后将完全使用自定义过滤函数。设置 `searchable=false` 会隐藏搜索框并直接展示全部选项。

`searchable` 默认为 `false`；需要搜索时应显式设置为 `true`。

`group` 用作分组键，并在未提供 `groupLabel` 时同时作为显示名称；仅当稳定分组键与显示文案不同时才需要 `groupLabel`。未设置分组字段的模型会进入无标题分组。

`keywords` 只需补充其他字段中不存在的别名。模型名称、版本、描述和分组已经自动参与搜索，不需要在 `keywords` 中重复。

## 思考强度

每个模型通过 `ModelSelectorOption.reasoningEfforts` 声明自己支持的推理强度：

- `true` 使用内置的 `Low`、`Medium`、`High` 三个选项；
- 自定义数组可定义任意 `value`、`label`，并通过 `disabled` 禁用单个选项；
- `false`、`undefined` 或空数组表示当前模型不提供 effort；
- 自定义数组中的重复 `value` 只保留第一项，开发环境会输出警告。

`reasoningEffort` / `defaultReasoningEffort` 保存的是用户选择过的值，并在切换模型时保持不变。组件不会因为新模型不支持该值而自动清空，也不会在模型切换时触发 reasoning effort 事件：

| 当前模型状态                               | 解析结果                                                                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| 支持当前 reasoning effort 值               | 默认 Trigger 显示对应 label，默认 Footer 激活该项，插槽收到对应 `reasoningEffort` 与 `reasoningEffortOption` |
| 声明了 reasoningEfforts，但不支持当前值    | 用户选择过的值继续保留；默认 Trigger 不显示 reasoning effort，默认 Footer 无激活项，插槽收到 `null` / `null` |
| 未声明 reasoningEfforts                    | 用户选择过的值继续保留；不渲染默认 reasoning effort Footer，Trigger 与插槽中的有效 reasoning effort 均为空   |
| 后续切回支持同一 reasoning effort 值的模型 | 该值重新显示为激活项，不额外触发 `update:reasoningEffort` 或 `reasoning-effort-change`                       |

用户通过默认 Footer 或 `footer` 插槽的 `setReasoningEffort()` 选择新值时，依次触发 `update:reasoningEffort` 和 `reasoning-effort-change`，不会关闭浮层。重复选择当前值、选择未声明值、禁用项，或当前模型处于禁用状态时不会触发事件；`setReasoningEffort(null)` 可清空保存的 reasoning effort。

提供 `footer` 插槽后会完整替换默认 reasoning effort Footer，而不是追加内容。插槽会收到当前模型可选的 `reasoningEfforts`、当前真正可用的 `reasoningEffort` / `reasoningEffortOption`，以及已经内置禁用和去重规则的 `setReasoningEffort()`，因此不需要在消费层重复维护选项列表或选择规则。

## 主题与挂载位置

大多数情况下不需要配置挂载位置。Panel 默认挂载到当前 ShadowRoot 或 `document.body`，同时会把最近 `ThemeProvider` 注入的 `theme` 与解析后的 color mode 同步到浮层外层节点，因此局部主题切换仍会作用于浮层。

嵌套使用 `ThemeProvider` 时，应为不同 Provider 配置各自的 `targetElement`。多个嵌套 Provider 同时使用默认 `html` 目标会竞争同一组属性，这是当前 ThemeProvider 的独立契约限制。

如果主题不是通过 `ThemeProvider` 注入，而是仅在某个局部容器上覆盖 CSS 变量，需要把 `appendTo` 指向该局部作用域内的元素；默认挂载到 `document.body` 时，这类局部 CSS 变量不会自动跨越 DOM 边界。

## 键盘与可访问性

| 位置                 | 按键                    | 行为                                                     |
| -------------------- | ----------------------- | -------------------------------------------------------- |
| Trigger              | `Enter` / `Space`       | 通过原生按钮行为打开或关闭                               |
| Trigger              | `ArrowDown` / `ArrowUp` | 打开并从首项或末项开始导航；已打开时移动高亮             |
| Trigger / Panel      | `Escape`                | 关闭浮层，并在键盘关闭或选择后恢复 Trigger 焦点          |
| 搜索框 / Listbox     | `ArrowDown` / `ArrowUp` | 跳过禁用项移动高亮                                       |
| 非搜索模式的 Listbox | `Home` / `End`          | 跳到首个或末个可用项；搜索框始终保留原生文本编辑语义     |
| 搜索框 / Listbox     | `Enter`                 | 选择高亮项；输入法组合期间不会误选                       |
| Listbox              | `Space`                 | 选择高亮项                                               |
| Effort 按钮          | `Enter` / `Space`       | 通过原生按钮行为切换 effort，不关闭浮层                  |
| Panel                | `Tab` / `Shift+Tab`     | 按 Teleport 后的 DOM 顺序原生移动；焦点离开 Panel 后关闭 |

组件已内置常见键盘操作和 ARIA 属性。除非你在插槽中放入复杂内容，一般不需要额外处理。Trigger 是真实的 `button`，Panel 使用 `combobox`、`listbox` 和 `option` 表达选择状态。未显式传入时，`ariaLabel`、`searchAriaLabel` 与 `reasoningEffortAriaLabel` 分别回退到对应的 `placeholder`、`searchPlaceholder` 与 `reasoningEffortLabel`；`listAriaLabel` 依次回退到 `ariaLabel` 和 `placeholder`，仍可通过 ARIA props 单独覆盖。

组件不会拦截 `Tab` 或重排页面焦点。由于 Panel 可能 Teleport 到 `document.body` 末尾，离开 Panel 后的目标由 Teleport 后的实际 DOM 顺序决定，不保证是 Trigger 在源布局中的前一个或后一个可聚焦元素。如业务需要严格的局部 Tab 顺序，可通过 `appendTo` 把 Panel 放到合适的局部容器。

::: warning 插槽中的交互元素
`trigger` 只替换内部真实 `button` 的内容，不要在其中嵌套 button、link、input 等交互元素。`item` 位于 `role="option"` 内，也只应渲染非交互内容。

`panel-header` 与 `footer` 可以放置按钮、链接或表单控件。组件会保留这些控件的 Enter、Space 和 Tab 行为，不会将它们误判为模型选择。
:::

## Props

| 属性名                     | 类型                                                     | 默认值                             | 说明                                                 |
| -------------------------- | -------------------------------------------------------- | ---------------------------------- | ---------------------------------------------------- |
| `models`                   | `readonly ModelSelectorOption[]`                         | `[]`                               | 模型列表；每项可通过 `reasoningEfforts` 声明推理强度 |
| `modelValue`               | `string \| null`                                         | `undefined`                        | 受控选中值；传入后需响应 `update:modelValue`         |
| `defaultValue`             | `string \| null`                                         | `null`                             | 非受控初始值，仅初始化时使用                         |
| `reasoningEffort`          | `string \| null`                                         | `undefined`                        | 受控推理强度；传入后需响应 `update:reasoningEffort`  |
| `defaultReasoningEffort`   | `string \| null`                                         | `null`                             | 非受控 reasoning effort 初始值，仅初始化时使用       |
| `open`                     | `boolean`                                                | `undefined`                        | 受控开关；传入后需响应 `update:open`                 |
| `defaultOpen`              | `boolean`                                                | `false`                            | 非受控初始开关                                       |
| `disabled`                 | `boolean`                                                | `false`                            | 是否禁用组件                                         |
| `searchable`               | `boolean`                                                | `false`                            | 是否显示搜索框                                       |
| `placeholder`              | `string`                                                 | `'Select model'`                   | 无匹配选中项时的 Trigger 文本                        |
| `searchPlaceholder`        | `string`                                                 | `'Search models'`                  | 搜索框占位文本                                       |
| `emptyText`                | `string`                                                 | `'No models found.'`               | 默认空状态文本                                       |
| `filterMethod`             | `ModelSelectorFilterMethod`                              | 内置包含匹配                       | 自定义搜索过滤函数                                   |
| `variant`                  | `'outline' \| 'ghost' \| 'muted'`                        | `'outline'`                        | Trigger 外观                                         |
| `size`                     | `'small' \| 'normal' \| 'large'`                         | `'normal'`                         | Trigger 与 Panel 尺寸                                |
| `placement`                | `Placement`                                              | `'bottom-start'`                   | Floating UI 浮层位置                                 |
| `offset`                   | `number`                                                 | `8`                                | Trigger 与浮层的间距                                 |
| `appendTo`                 | `string \| HTMLElement`                                  | 当前 ShadowRoot 或 `document.body` | Teleport 目标；选择器未命中时回退到默认目标          |
| `matchTriggerWidth`        | `boolean`                                                | `true`                             | Panel 最小宽度是否匹配 Trigger                       |
| `contentClass`             | `string \| readonly string[] \| Record<string, boolean>` | -                                  | 附加到 Panel 根元素的 class                          |
| `contentStyle`             | `StyleValue`                                             | -                                  | 附加到 Panel 根元素的内联样式                        |
| `ariaLabel`                | `string`                                                 | `placeholder`                      | Trigger 可访问名称前缀                               |
| `searchAriaLabel`          | `string`                                                 | `searchPlaceholder`                | 搜索框可访问名称                                     |
| `listAriaLabel`            | `string`                                                 | `ariaLabel` 或 `placeholder`       | Listbox 可访问名称                                   |
| `reasoningEffortLabel`     | `string`                                                 | `'Thinking'`                       | 默认 reasoning effort Footer 的可见标题              |
| `reasoningEffortAriaLabel` | `string`                                                 | `reasoningEffortLabel`             | reasoning effort 选项组及 Trigger 状态的可访问名称   |

## Events

| 事件名                    | 参数                                                   | 说明                                             |
| ------------------------- | ------------------------------------------------------ | ------------------------------------------------ |
| `update:modelValue`       | `(value: string \| null)`                              | 用户选择不同模型时请求更新 value                 |
| `change`                  | `(option: ModelSelectorOption)`                        | 用户选择不同模型后触发，返回完整选项             |
| `update:reasoningEffort`  | `(value: string \| null)`                              | 用户选择或清空 reasoning effort 时请求更新当前值 |
| `reasoning-effort-change` | `(option: ModelSelectorReasoningEffortOption \| null)` | reasoning effort 请求变化后触发，返回对应选项    |
| `update:open`             | `(open: boolean)`                                      | 用户交互或组件状态变化请求更新浮层开关           |

用户选择新模型时，事件顺序为 `update:modelValue` → `change` → `update:open(false)`；选择新 reasoning effort 时，事件顺序为 `update:reasoningEffort` → `reasoning-effort-change`。初始化、外部赋值、`models` 更新和模型切换时的 reasoning effort 重新解析都不会触发对应 change 事件。

## Slots

| 插槽名         | 作用域参数                                                                                                      | 说明                                 |
| -------------- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `trigger`      | `{ value, option, label, open, disabled, reasoningEffort, reasoningEffortOption }`                              | 替换内部 Trigger 按钮的内容          |
| `item`         | `{ option, selected, highlighted, disabled }`                                                                   | 自定义选项内容                       |
| `group-label`  | `{ group, label, models }`                                                                                      | 自定义分组标题                       |
| `empty`        | `{ query }`                                                                                                     | 自定义空状态                         |
| `panel-header` | `{ value, option, query, close }`                                                                               | Panel 顶部扩展区                     |
| `footer`       | `{ value, option, query, close, reasoningEfforts, reasoningEffort, reasoningEffortOption, setReasoningEffort }` | 完整替换默认 reasoning effort Footer |

`close()` 会请求关闭浮层并恢复 Trigger 焦点。`trigger` 和 `footer` 中的 `reasoningEffort` 是当前模型真正可用的值：保存的值不受支持时为 `null`，对应的 `reasoningEffortOption` 也为 `null`。`setReasoningEffort(value)` 复用默认 UI 的校验和事件语义。

## Types

```typescript
import type { Placement } from '@floating-ui/dom'
import type { Component, StyleValue, VNode } from 'vue'

type ModelSelectorVariant = 'outline' | 'ghost' | 'muted'
type ModelSelectorSize = 'small' | 'normal' | 'large'
type ModelSelectorContentClass = string | readonly string[] | Record<string, boolean>

interface ModelSelectorReasoningEffortOption {
  readonly value: string
  readonly label: string
  readonly disabled?: boolean
}

type ModelSelectorReasoningEfforts = boolean | readonly ModelSelectorReasoningEffortOption[]

interface ModelSelectorOption {
  value: string
  label: string
  description?: string
  icon?: Component
  disabled?: boolean
  group?: string
  groupLabel?: string
  keywords?: readonly string[]
  reasoningEfforts?: ModelSelectorReasoningEfforts
}

type ModelSelectorFilterMethod = (query: string, option: ModelSelectorOption) => boolean

interface ModelSelectorProps {
  models?: readonly ModelSelectorOption[]
  modelValue?: string | null
  defaultValue?: string | null
  reasoningEffort?: string | null
  defaultReasoningEffort?: string | null
  open?: boolean
  defaultOpen?: boolean
  disabled?: boolean
  searchable?: boolean
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  filterMethod?: ModelSelectorFilterMethod
  variant?: ModelSelectorVariant
  size?: ModelSelectorSize
  placement?: Placement
  offset?: number
  appendTo?: string | HTMLElement
  matchTriggerWidth?: boolean
  contentClass?: ModelSelectorContentClass
  contentStyle?: StyleValue
  ariaLabel?: string
  searchAriaLabel?: string
  listAriaLabel?: string
  reasoningEffortLabel?: string
  reasoningEffortAriaLabel?: string
}

interface ModelSelectorTriggerSlotProps {
  value: string | null
  option: ModelSelectorOption | null
  label: string
  open: boolean
  disabled: boolean
  /** The effort supported by the selected model. Unsupported saved values are exposed as null. */
  reasoningEffort: string | null
  reasoningEffortOption: ModelSelectorReasoningEffortOption | null
}

interface ModelSelectorItemSlotProps {
  option: ModelSelectorOption
  selected: boolean
  highlighted: boolean
  disabled: boolean
}

interface ModelSelectorGroupLabelSlotProps {
  group: string
  label: string
  models: readonly ModelSelectorOption[]
}

interface ModelSelectorEmptySlotProps {
  query: string
}

interface ModelSelectorPanelSlotProps {
  value: string | null
  option: ModelSelectorOption | null
  query: string
  close: () => void
}

interface ModelSelectorFooterSlotProps extends ModelSelectorPanelSlotProps {
  reasoningEfforts: readonly ModelSelectorReasoningEffortOption[]
  /** The effort supported by the selected model. Unsupported saved values are exposed as null. */
  reasoningEffort: string | null
  reasoningEffortOption: ModelSelectorReasoningEffortOption | null
  setReasoningEffort: (value: string | null) => void
}

interface ModelSelectorSlots {
  trigger?: (props: ModelSelectorTriggerSlotProps) => VNode | VNode[]
  item?: (props: ModelSelectorItemSlotProps) => VNode | VNode[]
  'group-label'?: (props: ModelSelectorGroupLabelSlotProps) => VNode | VNode[]
  empty?: (props: ModelSelectorEmptySlotProps) => VNode | VNode[]
  'panel-header'?: (props: ModelSelectorPanelSlotProps) => VNode | VNode[]
  footer?: (props: ModelSelectorFooterSlotProps) => VNode | VNode[]
}

interface ModelSelectorEmits {
  (event: 'update:modelValue', value: string | null): void
  (event: 'change', option: ModelSelectorOption): void
  (event: 'update:reasoningEffort', value: string | null): void
  (event: 'reasoning-effort-change', option: ModelSelectorReasoningEffortOption | null): void
  (event: 'update:open', open: boolean): void
}
```

## CSS 变量

| 变量名                                             | 默认值                                                         | 说明                           |
| -------------------------------------------------- | -------------------------------------------------------------- | ------------------------------ |
| `--tr-model-selector-trigger-text-color`           | `var(--tr-text-primary)`                                       | Trigger 文本颜色               |
| `--tr-model-selector-trigger-icon-color`           | `var(--tr-text-secondary)`                                     | Trigger 图标与箭头颜色         |
| `--tr-model-selector-trigger-effort-color`         | `var(--tr-text-tertiary)`                                      | Trigger effort 文本颜色        |
| `--tr-model-selector-trigger-outline-bg`           | `var(--tr-container-bg-default)`                               | outline 背景                   |
| `--tr-model-selector-trigger-outline-border`       | `var(--tr-border-color-default)`                               | outline 边框                   |
| `--tr-model-selector-trigger-ghost-bg`             | `transparent`                                                  | ghost 背景                     |
| `--tr-model-selector-trigger-ghost-border`         | `transparent`                                                  | ghost 边框                     |
| `--tr-model-selector-trigger-muted-bg`             | `var(--tr-container-bg-default-2)`                             | muted 背景                     |
| `--tr-model-selector-trigger-muted-border`         | `transparent`                                                  | muted 边框                     |
| `--tr-model-selector-trigger-hover-bg`             | `var(--tr-container-bg-hover)`                                 | Trigger hover/open 背景        |
| `--tr-model-selector-trigger-hover-border`         | `var(--tr-border-color-hover)`                                 | Trigger hover/open 边框        |
| `--tr-model-selector-trigger-disabled-color`       | `var(--tr-text-disabled)`                                      | Trigger 禁用颜色               |
| `--tr-model-selector-panel-bg`                     | `var(--tr-dropdown-menu-bg-color)`                             | Panel 背景                     |
| `--tr-model-selector-panel-border`                 | `var(--tr-border-color-default)`                               | Panel 边框                     |
| `--tr-model-selector-panel-shadow`                 | `var(--tr-dropdown-menu-box-shadow)`                           | Panel 阴影                     |
| `--tr-model-selector-divider-color`                | `var(--tr-border-color-default)`                               | Header、搜索框与 Footer 分隔线 |
| `--tr-model-selector-item-color`                   | `var(--tr-dropdown-menu-item-color)`                           | 选项文本颜色                   |
| `--tr-model-selector-item-description-color`       | `var(--tr-text-tertiary)`                                      | 选项描述颜色                   |
| `--tr-model-selector-item-hover-bg`                | `var(--tr-dropdown-menu-item-hover-bg-color)`                  | 选项 hover/highlight 背景      |
| `--tr-model-selector-item-selected-color`          | `var(--tr-color-primary)`                                      | 选中项强调色                   |
| `--tr-model-selector-item-disabled-color`          | `var(--tr-text-disabled)`                                      | 禁用项颜色                     |
| `--tr-model-selector-group-label-color`            | `var(--tr-text-tertiary)`                                      | 分组标题颜色                   |
| `--tr-model-selector-empty-color`                  | `var(--tr-text-secondary)`                                     | 空状态颜色                     |
| `--tr-model-selector-scrollbar-color`              | `var(--tr-dropdown-menu-scrollbar-thumb-color)`                | 列表滚动条颜色                 |
| `--tr-model-selector-effort-label-color`           | `var(--tr-text-secondary)`                                     | Effort 标题颜色                |
| `--tr-model-selector-effort-option-color`          | `var(--tr-text-secondary)`                                     | Effort 选项文字颜色            |
| `--tr-model-selector-effort-option-border`         | `var(--tr-border-color-default)`                               | Effort 选项边框                |
| `--tr-model-selector-effort-option-bg`             | `transparent`                                                  | Effort 选项背景                |
| `--tr-model-selector-effort-option-hover-bg`       | `var(--tr-container-bg-hover)`                                 | Effort 选项 hover 背景         |
| `--tr-model-selector-effort-option-active-color`   | `var(--tr-color-primary)`                                      | Effort 激活文字颜色            |
| `--tr-model-selector-effort-option-active-border`  | `var(--tr-color-primary)`                                      | Effort 激活边框                |
| `--tr-model-selector-effort-option-active-bg`      | `color-mix(in srgb, var(--tr-color-primary) 12%, transparent)` | Effort 激活背景                |
| `--tr-model-selector-effort-option-disabled-color` | `var(--tr-text-disabled)`                                      | Effort 禁用文字颜色            |
