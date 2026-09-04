---
outline: [1, 3]
---

# ModelSelector 模型选择器

ModelSelector 用于从一组 AI 模型中选择当前模型。组件内置搜索、分组、禁用状态、思考强度、浮层定位和键盘操作，也支持通过插槽定制触发器与选项面板。

适合聊天输入区、模型配置表单或工作流工具栏等场景。模型目录、Provider 路由、价格、上下文长度和请求参数属于应用层业务逻辑。

::: tip 组件边界
ModelSelector 只展示传入的 `models` 并通知选择结果。它不会请求模型列表、判断模型能力，也不会把思考强度转换为 Provider 请求参数。
:::

## 基础用法

`models` 提供候选模型，`v-model` 绑定当前模型。每个模型最少包含唯一的 `value` 和用于展示的 `label`。

<demo vue="../../demos/model-selector/basic.vue" title="基础用法" description="models 与 v-model 的基础选择。" />

### 模型选项

模型选项仅承载界面所需字段。价格、密钥和 Provider 参数等数据属于请求层业务逻辑。

| 字段               | 必需 | 说明                         |
| ------------------ | ---- | ---------------------------- |
| `value`            | 是   | 模型的稳定且唯一的标识       |
| `label`            | 是   | 模型名称                     |
| `description`      | 否   | 模型能力、适用场景等辅助说明 |
| `icon`             | 否   | Vue 组件或图片 URL           |
| `disabled`         | 否   | 是否保留展示但禁止选择       |
| `group`            | 否   | 分组标识和分组标题           |
| `reasoningEfforts` | 否   | 当前模型支持的思考强度       |

面板会根据选项内容收缩或展开，至少与触发器同宽，并受视口可用宽度限制。名称和描述所在文字列的默认最大宽度为 320px；面板打开期间可随更宽内容增长，不会因搜索过滤而收缩。

## 搜索与分组

模型数量较多时，`searchable` 可显示搜索框，`group` 可组织模型分组。禁用项仍会显示，但无法被选择。

<demo vue="../../demos/model-selector/search-and-group.vue" title="搜索与分组" description="名称、描述、分组搜索与禁用状态。" />

默认搜索不区分大小写，会匹配 `label`、`value`、`description` 和 `group`。未设置 `group` 的选项进入无标题分组。

`filterMethod(query, option)` 可承载拼音、标签或其他业务搜索规则，并会完全替代内置搜索逻辑。

```ts
import type { ModelSelectorFilterMethod } from '@opentiny/tiny-robot'

const filterMethod: ModelSelectorFilterMethod = (query, option) => {
  return option.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
}
```

## 思考强度

`reasoningEfforts` 描述模型支持的思考强度，组件会在面板底部显示对应选项。`v-model:reasoning-effort` 绑定当前值。

<demo vue="../../demos/model-selector/reasoning-effort.vue" title="思考强度" description="内置选项、自定义选项与不支持思考强度的模型。" />

示例设置了 `:close-on-select="false"`，切换模型后面板保持打开，可继续选择思考强度。该属性只控制模型选择后的关闭行为，不会根据模型是否支持思考强度做隐式判断。

- `true` 对应内置的 `Low`、`Medium`、`High`。
- 选项数组支持自定义 `value`、`label` 和 `disabled`。
- `false`、`undefined` 或空数组表示不显示思考强度。

思考强度是独立状态。切换到不支持当前值的模型时，组件会保留该值，但不会在触发器或面板中显示为有效选项；切回支持它的模型后会恢复显示。组件不会自行清空业务状态。

::: tip 切换模型时不会重置
不同模型具有不同默认思考强度的场景，可由消费层监听模型变化并更新 `reasoningEffort`。
:::

## 尺寸与外观

`size` 支持 `small`、`normal` 和 `large`；`variant` 控制触发器外观，支持 `outline`、`ghost` 和 `muted`。尺寸会改变触发器、字号与间距，不会将面板宽度固定为对应档位。

<demo vue="../../demos/model-selector/variants.vue" title="尺寸与外观" description="三种尺寸与三种外观的展示效果。" />

## 自定义内容

插槽只替换显示内容，选择、搜索、键盘操作和浮层定位仍由组件处理。

### 自定义触发器

`trigger` 插槽用于调整按钮内容，并提供当前选项、展示文本、展开状态和当前模型支持的思考强度。

<demo vue="../../demos/model-selector/icon-trigger.vue" title="自定义触发器" description="模型标识、展开箭头与窄屏表现的定制效果。" />

插槽会完整替换默认内容，因此图标、文本和展开状态均由插槽渲染。外层已经是真实的 `button`；内部嵌套按钮、链接或输入框会形成无效的交互元素结构。

### 自定义选项面板

`header`、`item`、`empty` 和 `footer` 分别对应面板头部、模型项、空状态和底部区域。

<demo vue="../../demos/model-selector/slots.vue" title="自定义选项面板" description="面板标题、模型项、空状态和底部操作区的定制效果。" />

`item` 位于 `role="option"` 内，适合非交互内容。`header` 和 `footer` 支持按钮、链接或表单控件；作用域中的 `close()` 用于关闭面板。

`footer` 插槽会完整替换默认的思考强度区域。自定义 Footer 可通过 `reasoningEfforts`、`reasoningEffortOption` 和 `setReasoningEffort()` 保留思考强度选择能力。

## 控制选中值与面板开关

组件既支持初始值模式，也支持由消费层完全控制状态。状态模式在实例创建时确定，生命周期内切换模式会在开发环境触发警告。

### 初始状态

`defaultValue`、`defaultReasoningEffort` 和 `defaultOpen` 只在初始化时使用。后续交互由组件维护内部状态。

```vue
<TrModelSelector
  :models="models"
  default-value="general-model"
  default-reasoning-effort="medium"
  :default-open="false"
/>
```

### 完全控制状态

`v-model` 和 `v-model:open` 对应完全受控模式，选中值和面板开关由消费层保存。`v-model` 会自动响应对应的 `update:*` 事件。

```vue
<script setup lang="ts">
import { shallowRef } from 'vue'

const model = shallowRef<string | null>('general-model')
const open = shallowRef(false)
</script>

<template>
  <TrModelSelector v-model="model" v-model:open="open" :models="models" />
</template>
```

未传入初始值时，组件显示 `placeholder`，不会自动选择第一项。当前值不存在或对应模型被移除时，组件保留原值并显示 `placeholder`，避免模型列表异步变化时替用户选择其他模型。

## 键盘操作与无障碍

| 位置           | 按键                    | 行为                                                                |
| -------------- | ----------------------- | ------------------------------------------------------------------- |
| 触发器         | `Enter`                 | 打开面板                                                            |
| 触发器         | `Space`                 | 通过按钮原生点击行为打开或关闭面板                                  |
| 面板           | `Escape`                | 关闭面板并恢复触发器焦点                                            |
| 搜索框或列表   | `ArrowDown` / `ArrowUp` | 跳过禁用项移动高亮                                                  |
| 非搜索模式列表 | `Home` / `End`          | 跳到首个或末个可用项                                                |
| 搜索框或列表   | `Enter`                 | 选择高亮项；是否关闭由 `closeOnSelect` 决定；输入法组合期间不会误选 |
| 非搜索模式列表 | `Space`                 | 选择高亮项；是否关闭由 `closeOnSelect` 决定                         |
| 思考强度按钮   | `Enter` / `Space`       | 选择思考强度，不关闭面板                                            |

组件使用真实按钮以及 `combobox`、`listbox`、`option` 等 ARIA 语义。它不会拦截 `Tab` 或重排焦点；面板 Teleport 后，Tab 顺序由实际 DOM 位置决定。

自定义 `trigger` 和 `item` 适合非交互内容。`header` 或 `footer` 中新增控件的可访问名称与键盘行为由消费层提供。

## API

### Props

#### 选中值与开关状态

| 属性名                   | 类型                             | 默认值      | 说明                                             |
| ------------------------ | -------------------------------- | ----------- | ------------------------------------------------ |
| `models`                 | `readonly ModelSelectorOption[]` | `[]`        | 模型列表                                         |
| `modelValue`             | `string \| null`                 | `undefined` | 受控选中值；通过 `update:modelValue` 同步        |
| `defaultValue`           | `string \| null`                 | `null`      | 非受控初始选中值                                 |
| `reasoningEffort`        | `string \| null`                 | `undefined` | 受控思考强度；通过 `update:reasoningEffort` 同步 |
| `defaultReasoningEffort` | `string \| null`                 | `null`      | 非受控初始思考强度                               |
| `open`                   | `boolean`                        | `undefined` | 受控面板开关；通过 `update:open` 同步            |
| `defaultOpen`            | `boolean`                        | `false`     | 非受控初始面板开关                               |
| `closeOnSelect`          | `boolean`                        | `true`      | 选择模型后是否自动关闭面板                       |
| `disabled`               | `boolean`                        | `false`     | 禁用组件并保持面板关闭                           |

#### 搜索与文案

| 属性名                 | 类型                        | 默认值           | 说明                         |
| ---------------------- | --------------------------- | ---------------- | ---------------------------- |
| `searchable`           | `boolean`                   | `false`          | 是否显示搜索框               |
| `placeholder`          | `string`                    | `'选择模型'`     | 没有匹配选中项时的触发器文本 |
| `searchPlaceholder`    | `string`                    | `'搜索模型'`     | 搜索框占位文本               |
| `emptyText`            | `string`                    | `'暂无可用模型'` | 默认空状态文本               |
| `filterMethod`         | `ModelSelectorFilterMethod` | 内置包含匹配     | 自定义搜索过滤函数           |
| `reasoningEffortLabel` | `string`                    | `'Thinking'`     | 默认思考强度区域的可见标题   |

#### 外观与浮层

| 属性名       | 类型                      | 默认值                             | 说明                                        |
| ------------ | ------------------------- | ---------------------------------- | ------------------------------------------- |
| `variant`    | `ModelSelectorVariant`    | `'outline'`                        | 触发器外观                                  |
| `size`       | `ModelSelectorSize`       | `'normal'`                         | 触发器和面板尺寸                            |
| `placement`  | `Placement`               | `'bottom-start'`                   | Floating UI 浮层位置                        |
| `offset`     | `number`                  | `8`                                | 触发器与浮层的间距                          |
| `appendTo`   | `string \| HTMLElement`   | 当前 ShadowRoot 或 `document.body` | Teleport 目标；选择器未命中时回退到默认目标 |
| `panelClass` | `ModelSelectorPanelClass` | —                                  | 附加到面板根元素的 class                    |

### Events

| 事件名                    | 参数                                                   | 说明                                   |
| ------------------------- | ------------------------------------------------------ | -------------------------------------- |
| `update:modelValue`       | `(value: string \| null)`                              | 用户选择不同模型时请求更新选中值       |
| `change`                  | `(option: ModelSelectorOption)`                        | 用户选择不同模型后触发，返回完整选项   |
| `update:reasoningEffort`  | `(value: string \| null)`                              | 用户选择或清空思考强度时请求更新当前值 |
| `reasoning-effort-change` | `(option: ModelSelectorReasoningEffortOption \| null)` | 思考强度请求变化后触发                 |
| `update:open`             | `(open: boolean)`                                      | 请求更新面板开关                       |

事件只响应用户交互，初始化、外部赋值和更新 `models` 不会触发 `change`。选择不同模型时依次触发 `update:modelValue` 和 `change`；`closeOnSelect` 为 `true` 时随后触发 `update:open(false)` 并关闭面板，为 `false` 时面板保持打开。选择思考强度时依次触发 `update:reasoningEffort` 和 `reasoning-effort-change`，并保持面板打开。

### Slots

| 插槽名    | 作用域参数                                                                              | 说明                     |
| --------- | --------------------------------------------------------------------------------------- | ------------------------ |
| `trigger` | `{ option, label, open, reasoningEffortOption }`                                        | 替换触发器按钮内容       |
| `item`    | `{ option, selected, highlighted }`                                                     | 自定义模型项内容         |
| `empty`   | `{ query }`                                                                             | 自定义空状态             |
| `header`  | `{ option, query, close }`                                                              | 自定义面板头部           |
| `footer`  | `{ option, query, close, reasoningEfforts, reasoningEffortOption, setReasoningEffort }` | 完整替换默认思考强度区域 |

`close()` 关闭面板并恢复触发器焦点。使用受控 `open` 时，消费层需要同步更新值。`reasoningEffortOption` 只返回当前模型真正支持的选项；已保存但不受支持的值会解析为 `null`。

### Types

以下类型均从 `@opentiny/tiny-robot` 导出：

```ts
import type { Placement } from '@floating-ui/dom'
import type { Component, VNode } from 'vue'

export type ModelSelectorVariant = 'outline' | 'ghost' | 'muted'
export type ModelSelectorSize = 'small' | 'normal' | 'large'
export type ModelSelectorPanelClass = string | readonly string[] | Record<string, boolean>

export interface ModelSelectorReasoningEffortOption {
  readonly value: string
  readonly label: string
  readonly disabled?: boolean
}

export type ModelSelectorReasoningEfforts = boolean | readonly ModelSelectorReasoningEffortOption[]

export interface ModelSelectorOption {
  value: string
  label: string
  description?: string
  icon?: Component | string
  disabled?: boolean
  group?: string
  reasoningEfforts?: ModelSelectorReasoningEfforts
}

export type ModelSelectorFilterMethod = (query: string, option: ModelSelectorOption) => boolean

export interface ModelSelectorProps {
  models?: readonly ModelSelectorOption[]
  modelValue?: string | null
  defaultValue?: string | null
  reasoningEffort?: string | null
  defaultReasoningEffort?: string | null
  open?: boolean
  defaultOpen?: boolean
  closeOnSelect?: boolean
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
  panelClass?: ModelSelectorPanelClass
  reasoningEffortLabel?: string
}

export interface ModelSelectorTriggerSlotProps {
  option: ModelSelectorOption | null
  label: string
  open: boolean
  reasoningEffortOption: ModelSelectorReasoningEffortOption | null
}

export interface ModelSelectorItemSlotProps {
  option: ModelSelectorOption
  selected: boolean
  highlighted: boolean
}

export interface ModelSelectorEmptySlotProps {
  query: string
}

export interface ModelSelectorSlotProps {
  option: ModelSelectorOption | null
  query: string
  close: () => void
}

export interface ModelSelectorFooterSlotProps extends ModelSelectorSlotProps {
  reasoningEfforts: readonly ModelSelectorReasoningEffortOption[]
  reasoningEffortOption: ModelSelectorReasoningEffortOption | null
  setReasoningEffort: (value: string | null) => void
}

export interface ModelSelectorSlots {
  trigger?: (props: ModelSelectorTriggerSlotProps) => VNode | VNode[]
  item?: (props: ModelSelectorItemSlotProps) => VNode | VNode[]
  empty?: (props: ModelSelectorEmptySlotProps) => VNode | VNode[]
  header?: (props: ModelSelectorSlotProps) => VNode | VNode[]
  footer?: (props: ModelSelectorFooterSlotProps) => VNode | VNode[]
}

export interface ModelSelectorEmits {
  (event: 'update:modelValue', value: string | null): void
  (event: 'change', option: ModelSelectorOption): void
  (event: 'update:reasoningEffort', value: string | null): void
  (event: 'reasoning-effort-change', option: ModelSelectorReasoningEffortOption | null): void
  (event: 'update:open', open: boolean): void
}
```

### CSS 变量

面板默认通过 Teleport 挂载，定义在组件宿主元素上的局部变量不会自动继承到面板。`panelClass` 附加的类可承载单实例面板变量。

| 变量名                                             | 默认值                                                         | 说明                           |
| -------------------------------------------------- | -------------------------------------------------------------- | ------------------------------ |
| `--tr-model-selector-trigger-text-color`           | `var(--tr-text-primary)`                                       | 触发器文本颜色                 |
| `--tr-model-selector-trigger-icon-color`           | `var(--tr-text-secondary)`                                     | 触发器图标与箭头颜色           |
| `--tr-model-selector-trigger-effort-color`         | `var(--tr-text-tertiary)`                                      | 触发器思考强度文本颜色         |
| `--tr-model-selector-trigger-outline-bg`           | `var(--tr-container-bg-default)`                               | outline 背景                   |
| `--tr-model-selector-trigger-outline-border`       | `var(--tr-border-color-default)`                               | outline 边框                   |
| `--tr-model-selector-trigger-ghost-bg`             | `transparent`                                                  | ghost 背景                     |
| `--tr-model-selector-trigger-ghost-border`         | `transparent`                                                  | ghost 边框                     |
| `--tr-model-selector-trigger-muted-bg`             | `var(--tr-container-bg-default-2)`                             | muted 背景                     |
| `--tr-model-selector-trigger-muted-border`         | `transparent`                                                  | muted 边框                     |
| `--tr-model-selector-trigger-hover-bg`             | `var(--tr-container-bg-hover)`                                 | 触发器 hover/open 背景         |
| `--tr-model-selector-trigger-hover-border`         | `var(--tr-border-color-hover)`                                 | 触发器 hover/open 边框         |
| `--tr-model-selector-trigger-disabled-color`       | `var(--tr-text-disabled)`                                      | 触发器禁用颜色                 |
| `--tr-model-selector-panel-bg`                     | `var(--tr-dropdown-menu-bg-color)`                             | 面板背景                       |
| `--tr-model-selector-panel-border`                 | `var(--tr-border-color-default)`                               | 面板边框                       |
| `--tr-model-selector-panel-shadow`                 | `var(--tr-dropdown-menu-box-shadow)`                           | 面板阴影                       |
| `--tr-model-selector-divider-color`                | `var(--tr-border-color-default)`                               | Header、搜索框与 Footer 分隔线 |
| `--tr-model-selector-item-color`                   | `var(--tr-dropdown-menu-item-color)`                           | 选项文本颜色                   |
| `--tr-model-selector-item-description-color`       | `var(--tr-text-tertiary)`                                      | 选项描述颜色                   |
| `--tr-model-selector-option-text-max-width`        | `320px`                                                        | 名称与描述所在文字列的最大宽度 |
| `--tr-model-selector-item-hover-bg`                | `var(--tr-dropdown-menu-item-hover-bg-color)`                  | 选项 hover/highlight 背景      |
| `--tr-model-selector-item-selected-color`          | `var(--tr-color-primary)`                                      | 选中项强调色                   |
| `--tr-model-selector-item-disabled-color`          | `var(--tr-text-disabled)`                                      | 禁用项颜色                     |
| `--tr-model-selector-group-title-color`            | `var(--tr-text-tertiary)`                                      | 分组标题颜色                   |
| `--tr-model-selector-empty-color`                  | `var(--tr-text-secondary)`                                     | 空状态颜色                     |
| `--tr-model-selector-scrollbar-color`              | `var(--tr-dropdown-menu-scrollbar-thumb-color)`                | 列表滚动条颜色                 |
| `--tr-model-selector-effort-label-color`           | `var(--tr-text-secondary)`                                     | 思考强度标题颜色               |
| `--tr-model-selector-effort-option-color`          | `var(--tr-text-secondary)`                                     | 思考强度选项文字颜色           |
| `--tr-model-selector-effort-option-border`         | `var(--tr-border-color-default)`                               | 思考强度选项边框               |
| `--tr-model-selector-effort-option-bg`             | `transparent`                                                  | 思考强度选项背景               |
| `--tr-model-selector-effort-option-hover-bg`       | `var(--tr-container-bg-hover)`                                 | 思考强度选项 hover 背景        |
| `--tr-model-selector-effort-option-active-color`   | `var(--tr-color-primary)`                                      | 思考强度激活文字颜色           |
| `--tr-model-selector-effort-option-active-border`  | `var(--tr-color-primary)`                                      | 思考强度激活边框               |
| `--tr-model-selector-effort-option-active-bg`      | `color-mix(in srgb, var(--tr-color-primary) 12%, transparent)` | 思考强度激活背景               |
| `--tr-model-selector-effort-option-disabled-color` | `var(--tr-text-disabled)`                                      | 思考强度禁用文字颜色           |
