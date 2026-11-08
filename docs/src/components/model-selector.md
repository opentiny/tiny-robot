---
outline: [1, 3]
---

# ModelSelector 模型选择器

ModelSelector 用于选择 AI 模型，并根据 `features` 展示开关和选项。组件支持搜索、分组、禁用状态、浮层定位、键盘操作和自定义插槽。

适合聊天输入区、模型配置表单或工作流工具栏等场景。模型目录、Provider 路由、价格、上下文长度和请求参数属于应用层业务逻辑。

::: tip 组件边界
应用提供模型列表和每个模型支持的设置项。ModelSelector 展示这些设置，并在用户操作时通知应用。应用可以根据所选模型和设置值生成请求参数。
:::

## 基础用法

`models` 提供候选模型，`v-model` 绑定当前模型。每个模型最少包含唯一的 `id` 和用于展示的 `label`。

<demo vue="../../demos/model-selector/basic.vue" title="基础用法" description="models 与 v-model 的基础选择。" />

### 模型选项

模型选项仅承载界面所需字段。价格、密钥和 Provider 参数等数据属于请求层业务逻辑。

| 字段          | 必需 | 说明                                       |
| ------------- | ---- | ------------------------------------------ |
| `id`          | 是   | 模型的稳定且唯一的标识                     |
| `label`       | 是   | 模型名称                                   |
| `description` | 否   | 模型能力、适用场景等辅助说明               |
| `icon`        | 否   | Vue 组件或图片 URL                         |
| `disabled`    | 否   | 是否保留展示但禁止选择                     |
| `group`       | 否   | 分组标识和分组标题                         |
| `features`    | 否   | 当前模型的开关和选择字段；空数组不展示字段 |

面板会根据选项内容收缩或展开，至少与触发器同宽，并受视口可用宽度限制。名称和描述所在文字列的默认最大宽度为 320px；面板打开期间可随更宽内容增长，不会因搜索过滤而收缩。

## 搜索与分组

模型数量较多时，`searchable` 可显示搜索框，`group` 可组织模型分组。禁用项仍会显示，但无法被选择。

<demo vue="../../demos/model-selector/search-and-group.vue" title="搜索与分组" description="名称、描述、分组搜索与禁用状态。" />

默认搜索不区分大小写，会匹配 `label`、`id`、`description` 和 `group`。未设置 `group` 的选项进入无标题分组。

`filterMethod(query, option)` 可承载拼音、标签或其他业务搜索规则，并会完全替代内置搜索逻辑。

```ts
import type { ModelSelectorFilterMethod } from '@opentiny/tiny-robot'

const filterMethod: ModelSelectorFilterMethod = (query, option) => {
  return option.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
}
```

## 模型特性字段

通过 `models[].features` 声明模型支持的设置，例如思考强度或联网搜索。切换模型时，相同 `key` 的设置会沿用新模型支持的值。

<demo vue="../../demos/model-selector/reasoning-effort.vue" title="模型特性字段" description="切换模型或修改设置，查看当前模型的设置值（featureValues）。" />

由应用将设置值转换为请求参数。[查看 DeepSeek 和百炼 Qwen3.7 的映射示例](../suites/chat-runtime#模型功能)

## 尺寸与外观

`size` 支持 `small`、`normal` 和 `large`；`variant` 控制触发器外观，支持 `outline`、`ghost` 和 `muted`。尺寸会改变触发器、字号与间距，不会将面板宽度固定为对应档位。

<demo vue="../../demos/model-selector/variants.vue" title="尺寸与外观" description="三种尺寸与三种外观的展示效果。" />

## 自定义内容

插槽只替换显示内容，选择、搜索、键盘操作和浮层定位仍由组件处理。

### 自定义触发器文本

用 `renderTriggerText({ model, featureValues })` 自定义按钮文字。返回的文字也用作悬浮提示和无障碍名称。

<demo vue="../../demos/model-selector/trigger-text.vue" title="自定义触发器文本" description="打开「联网搜索」，按钮文字会变为「通用模型 · 联网」。" />

### 自定义触发器

`trigger` 插槽提供当前模型、模型名称、展开状态、有效设置值和 `text`。自定义按钮内容时，可以用 `text` 显示文字，让它与按钮的悬浮提示和无障碍名称一致。

<demo vue="../../demos/model-selector/icon-trigger.vue" title="自定义触发器" description="模型标识、展开箭头与窄屏表现的定制效果。" />

插槽会完整替换默认内容，因此图标、文本和展开状态均由插槽渲染。外层已经是真实的 `button`；内部嵌套按钮、链接或输入框会形成无效的交互元素结构。

### 自定义选项面板

`header`、`item`、`empty` 和 `footer` 分别对应面板头部、模型项、空状态和底部区域。

<demo vue="../../demos/model-selector/slots.vue" title="自定义选项面板" description="面板标题、模型项、空状态和底部操作区的定制效果。" />

`item` 位于 `role="option"` 内，适合非交互内容。`header` 和 `footer` 支持按钮、链接或表单控件；作用域中的 `close()` 用于关闭面板。

`footer` 完整替换默认字段区，提供 `option`、`values`、`setFeatureValue(key, value)`、`disabled` 和 `close()`。字段区位于模型列表之外。

## 控制选中值与面板开关

组件既支持初始值模式，也支持由消费层完全控制状态。状态模式在实例创建时确定，生命周期内切换模式会在开发环境触发警告。

### 初始状态

`defaultValue` 和 `defaultOpen` 只在初始化时使用。后续交互由组件维护内部状态。

```vue
<TrModelSelector :models="models" default-value="general-model" :default-open="false" />
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

### 设置值

切换模型后，原值不可用时采用该设置项的有效默认值。未配置有效默认值时，开关用 `false`，选择框用第一个可用选项。不支持或没有可用值的设置项会从 `featureValues` 中省略。

- 由组件管理时，用 `defaultFeatureValues` 设置初始值。组件会保存用户选择和回退后的值。
- 由应用管理时，传入 `featureValues`，再根据 `change` 事件更新。若要保留其他模型才支持的设置，将 `current.featureValues` 合并到原有设置中。

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
| 字段控件       | `Enter` / `Space`       | 修改字段值                                                          |

组件使用真实按钮以及 `combobox`、`listbox`、`option` 等 ARIA 语义。它不会拦截 `Tab` 或重排焦点；面板 Teleport 后，Tab 顺序由实际 DOM 位置决定。

自定义 `trigger` 和 `item` 适合非交互内容。`header` 或 `footer` 中新增控件的可访问名称与键盘行为由消费层提供。

## API

### Props

#### 选中值与开关状态

| 属性名          | 类型                             | 默认值      | 说明                                           |
| --------------- | -------------------------------- | ----------- | ---------------------------------------------- |
| `models`        | `readonly ModelSelectorOption[]` | `[]`        | 模型列表                                       |
| `featureValues` | `ModelSelectorFeatureValues` | `undefined` | 当前模型的受控功能值 |
| `defaultFeatureValues` | `ModelSelectorFeatureValues` | `{}` | 由组件管理时的初始功能值 |
| `modelValue`    | `string \| null`                 | `undefined` | 受控选中值；通过 `update:modelValue` 同步      |
| `defaultValue`  | `string \| null`                 | `null`      | 非受控初始选中值                               |
| `open`          | `boolean`                        | `undefined` | 受控面板开关；通过 `update:open` 同步          |
| `defaultOpen`   | `boolean`                        | `false`     | 非受控初始面板开关                             |
| `closeOnSelect` | `boolean`                        | `true`      | 选择模型后是否自动关闭面板                     |
| `disabled`      | `boolean`                        | `false`     | 禁用组件并保持面板关闭                         |

#### 搜索与文案

| 属性名              | 类型                        | 默认值           | 说明                         |
| ------------------- | --------------------------- | ---------------- | ---------------------------- |
| `searchable`        | `boolean`                   | `false`          | 是否显示搜索框               |
| `placeholder`       | `string`                    | `'选择模型'`     | 没有匹配选中项时的触发器文本 |
| `searchPlaceholder` | `string`                    | `'搜索模型'`     | 搜索框占位文本               |
| `emptyText`         | `string`                    | `'暂无可用模型'` | 默认空状态文本               |
| `renderTriggerText` | `(context: ModelSelectorTriggerTextContext) => string` | `undefined` | 自定义触发器文字。未传入函数或返回空字符串时显示模型名称 |
| `filterMethod`      | `ModelSelectorFilterMethod` | 内置包含匹配     | 自定义搜索过滤函数           |

#### 外观与浮层

| 属性名       | 类型                      | 默认值                             | 说明                                        |
| ------------ | ------------------------- | ---------------------------------- | ------------------------------------------- |
| `variant`    | `ModelSelectorVariant`    | `'outline'`                        | 触发器外观                                  |
| `size`       | `ModelSelectorSize`       | `'normal'`                         | 触发器和面板尺寸                            |
| `placement`  | `Placement`               | `'bottom-start'`                   | Floating UI 浮层位置                        |
| `offset`     | `number`                  | `8`                                | 触发器与浮层的间距                          |
| `appendTo`   | `string \| HTMLElement`   | 当前 ShadowRoot 或 `document.body` | Teleport 目标；选择器未命中时回退到默认目标 |
| `panelClass` | `ModelSelectorPanelClass` | —                                  | 附加到面板根元素的 class                    |

未设置 `appendTo` 时，floating Layout 中的选择器使用所属窗口的 overlay host；其他场景使用当前 ShadowRoot 或 `document.body`。

### Events

| 事件名                 | 参数                                   | 说明                                              |
| ---------------------- | -------------------------------------- | ------------------------------------------------- |
| `update:modelValue`    | `(value: string \| null)`              | 用户选择不同模型时请求更新选中值                  |
| `change`               | `(current: ModelSelectorSnapshot, previous: ModelSelectorSnapshot)` | 用户切换模型或修改设置时触发，参数依次对应操作后和操作前的选择 |
| `update:open`          | `(open: boolean)`                      | 请求更新面板开关                                  |

`change` 的第一个参数 `current` 对应操作后的选择，第二个参数 `previous` 对应操作前的选择。两者都包含模型 ID（`modelId`）和对应模型的有效设置值（`featureValues`）。

初始化、应用直接赋值或更新 `models` 时，组件不会触发 `change`。用户切换模型时，组件先触发 `update:modelValue`，再触发 `change`。如果 `closeOnSelect` 为 `true`，组件随后通过 `update:open(false)` 请求关闭面板。只修改设置值时，组件触发 `change`。

由应用控制选中模型或设置值时，`current` 表示本次操作请求采用的选择，界面以应用传入的值为准。

### Slots

| 插槽名    | 作用域参数                                                    | 说明               |
| --------- | ------------------------------------------------------------- | ------------------ |
| `trigger` | `{ option, label, open, featureValues, text }`                    | 替换触发器按钮内容 |
| `item`    | `{ option, selected, highlighted }`                           | 自定义模型项内容   |
| `empty`   | `{ query }`                                                   | 自定义空状态       |
| `header`  | `{ option, query, close }`                                    | 自定义面板头部     |
| `footer`  | `{ option, query, close, values, disabled, setFeatureValue }` | 完整替换默认字段区 |

`close()` 关闭面板并恢复触发器焦点。使用受控 `open` 时，消费层需要同步更新值。

### Types

以下类型均从 `@opentiny/tiny-robot` 导出：

```ts
import type { Placement } from '@floating-ui/dom'
import type { Component, VNode } from 'vue'

export type ModelSelectorVariant = 'outline' | 'ghost' | 'muted'
export type ModelSelectorSize = 'small' | 'normal' | 'large'
export type ModelSelectorPanelClass = string | readonly string[] | Record<string, boolean>

export type ModelSelectorFeatureValue = boolean | string
export type ModelSelectorFeatureValues = Readonly<Partial<Record<string, ModelSelectorFeatureValue>>>
export interface ModelSelectorFieldBase {
  key: string
  label: string
  disabled?: boolean
}
export type ModelSelectorField = ModelSelectorFieldBase &
  (
    | { type: 'switch'; defaultValue?: boolean }
    | {
        type: 'select'
        defaultValue?: string
        options: readonly {
          value: string
          label: string
          disabled?: boolean
        }[]
      }
  )
export interface ModelSelectorSnapshot {
  modelId: string | null
  featureValues: ModelSelectorFeatureValues
}

export interface ModelSelectorOption {
  id: string
  label: string
  description?: string
  icon?: Component | string
  disabled?: boolean
  group?: string
  features?: readonly ModelSelectorField[]
}

export type ModelSelectorFilterMethod = (query: string, option: ModelSelectorOption) => boolean

export interface ModelSelectorTriggerTextContext {
  model: ModelSelectorOption
  featureValues: ModelSelectorFeatureValues
}

export interface ModelSelectorProps {
  models?: readonly ModelSelectorOption[]
  featureValues?: ModelSelectorFeatureValues
  defaultFeatureValues?: ModelSelectorFeatureValues
  renderTriggerText?: (context: ModelSelectorTriggerTextContext) => string
  modelValue?: string | null
  defaultValue?: string | null
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
}

export interface ModelSelectorTriggerSlotProps {
  option: ModelSelectorOption | null
  label: string
  open: boolean
  featureValues: ModelSelectorFeatureValues
  text: string
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
  values: ModelSelectorFeatureValues
  disabled: boolean
  setFeatureValue: (key: string, value: ModelSelectorFeatureValue) => void
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
  (event: 'change', current: ModelSelectorSnapshot, previous: ModelSelectorSnapshot): void
  (event: 'update:open', open: boolean): void
}
```

### CSS 变量

面板默认通过 Teleport 挂载，定义在组件宿主元素上的局部变量不会自动继承到面板。`panelClass` 附加的类可承载单实例面板变量。

| 变量名                                             | 默认值                                                         | 说明                           |
| -------------------------------------------------- | -------------------------------------------------------------- | ------------------------------ |
| `--tr-model-selector-trigger-text-color`           | `var(--tr-text-primary)`                                       | 触发器文本颜色                 |
| `--tr-model-selector-trigger-icon-color`           | `var(--tr-text-secondary)`                                     | 触发器图标与箭头颜色           |
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
| `--tr-model-selector-field-label-color`           | `var(--tr-text-secondary)`                                     | 功能字段标题颜色               |
| `--tr-model-selector-field-option-color`          | `var(--tr-text-secondary)`                                     | 功能选项文字颜色           |
| `--tr-model-selector-field-option-border`         | `var(--tr-border-color-default)`                               | 功能选项边框               |
| `--tr-model-selector-field-option-bg`             | `transparent`                                                  | 功能选项背景               |
| `--tr-model-selector-field-option-hover-bg`       | `var(--tr-container-bg-hover)`                                 | 功能选项 hover 背景        |
| `--tr-model-selector-field-option-active-color`   | `var(--tr-color-primary)`                                      | 功能选项激活文字颜色           |
| `--tr-model-selector-field-option-active-border`  | `var(--tr-color-primary)`                                      | 功能选项激活边框               |
| `--tr-model-selector-field-option-active-bg`      | `color-mix(in srgb, var(--tr-color-primary) 12%, transparent)` | 功能选项激活背景               |
| `--tr-model-selector-field-option-disabled-color` | `var(--tr-text-disabled)`                                      | 功能选项禁用文字颜色           |
