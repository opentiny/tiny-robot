---
outline: [1, 3]
pageClass: demo-container-page-bg
---

# ExtensionManager 扩展管理组件

`ExtensionManager` 用于浏览和管理通用 Extension。组件提供标签页切换、筛选、自动分区和分区展开，并自行维护筛选与分区展开状态。当前标签页既可以由父组件控制，也可以由组件维护。安装、删除、开关状态和详情跳转等操作会触发事件，由应用决定如何更新 Extension 数据或打开后续界面。

## 概览

### 适用场景

- 在一个面板中按标签页浏览 Extension，并按标签和关键词过滤。
- 为已安装和可安装的 Extension 提供一致的卡片、操作和进度反馈。
- 在应用页面、Modal 或 Drawer 中嵌入管理内容。组件本身不控制容器的显示、焦点和滚动。

### 选择建议

`ExtensionManager` 只处理通用的扩展管理功能。`installed` 和 `tags` 用于分区与筛选，不会传入 Card 或 CardGrid 的 `item` 插槽。MCP 工具、表单或详情等特定类型的内容应由应用实现。例如，应用可以在收到 `name-click` 后打开对应的详情界面。

## 快速开始

下面以 MCP 和 Skills 两类 Extension 为例，展示一个可直接运行的管理场景。MCP 已安装并支持启用开关；Skills 可以安装，安装后会移动到“已安装”分区。

<demo vue="../../demos/extension-manager/basic.vue" title="管理 MCP 与 Skills" description="使用两个标签页管理已安装的 MCP 和可安装的 Skills，并在操作后更新开关或安装状态。" />

## 常用用法

### 浏览、筛选和自动分区

组件为当前标签页自动生成标签筛选和关键词搜索。搜索会忽略首尾空白，并匹配 `name` 和 `description`。同时设置标签和关键词时，条目需要同时满足两个条件。每个标签页保存自己的筛选条件。

`installed: true` 的条目归入“已安装”；`installed: false` 或省略 `installed` 的条目归入“可安装”。两段始终显示，即使筛选后没有条目；原始数据的顺序会保留。

<demo vue="../../demos/extension-manager/browse-and-filter.vue" title="浏览、筛选与自动分区" description="切换标签页、选择标签或输入关键词，观察筛选后的已安装和可安装分区。" />

## 状态与反馈

### 进度

Card 的 `progress` 可以是 `0` 至 `100` 的数值，超出范围会被限制；使用 `'indeterminate'` 表示不确定进度。

<demo vue="../../demos/extension-manager/progress.vue" title="卡片进度" description="分别展示确定进度、不确定进度和超出范围数值的限制结果。" />

### 空状态

每个当前标签页都有“已安装”和“可安装”两个可折叠分区。没有匹配项时，`ExtensionManager` 的 `empty` 插槽接收分区标题；没有可显示的标签页时显示 `empty-text`。

<demo vue="../../demos/extension-manager/empty-states.vue" title="分区与管理器空状态" description="分别定制空分区内容，并为没有标签页的管理器提供提示文字。" />

## 交互与状态管理

### 状态所有权

`ExtensionManager` 同时处理外部数据、可由父组件控制的值，以及组件自身的界面状态。接入时需要先明确每项数据由谁更新。用户点击“安装”、切换开关或点击名称时，组件不会直接修改 `tabs` 或条目数据。

| 状态 / 数据                                     | 所有者                                               | 初始值来源                                           | 用户操作后谁更新                        | 相关 API                                                              |
| ----------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------- |
| `tabs`、`item.installed` 和 action 的 `checked` | 应用                                                 | `tabs`                                               | 应用收到 `action` 后更新数据            | `tabs`、`action`                                                      |
| 当前标签页                                      | 提供 `active-tab` 时由父组件管理，否则由组件内部管理 | `active-tab`；非受控时为 `default-active-tab` 或首项 | 受控时由父组件更新；非受控时由组件更新  | `active-tab`、`default-active-tab`、`update:active-tab`、`tab-change` |
| 标签筛选和搜索词                                | 组件                                                 | 空筛选条件                                           | 组件按标签页分别保存                    | —                                                                     |
| 分区展开状态                                    | 组件                                                 | 每个标签页的两个分区默认展开                         | 组件先更新状态，再触发 `section-toggle` | `section-toggle`                                                      |

### 当前标签页

当前标签页同时支持受控和非受控两种使用方式：

| 使用方式 | 当前值来源   | 用户选择标签页                                                            | `default-active-tab`                         | 当前值失效                                                                                                 |
| -------- | ------------ | ------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| 受控     | `active-tab` | 依次触发 `update:active-tab` 和 `tab-change`；父组件需要更新 `active-tab` | 不生效                                       | 组件显示第一个可用标签页并触发 `update:active-tab`；没有标签页时参数为 `undefined`，不触发 `tab-change`    |
| 非受控   | 组件内部状态 | 组件先更新内部状态，再依次触发 `update:active-tab` 和 `tab-change`        | 仅作为初始值；未提供或无效时使用第一个标签页 | `tabs` 变化导致当前值失效时，组件自动切换到新的第一个标签页并触发 `update:active-tab`，不触发 `tab-change` |

非受控模式初始化时，即使 `default-active-tab` 无效并改用第一个标签页，也不会额外触发 `update:active-tab`。父组件直接修改受控的 `active-tab` 也不会触发 `tab-change`，因为 `tab-change` 只表示用户选择了标签页。

<demo vue="../../demos/extension-manager/controlled-events.vue" title="由父组件控制当前标签页" description="使用 v-model:active-tab 保存当前标签页，并显示父组件收到的最新值。" />

### 处理操作事件

快速开始中的 MCP 开关和 Skills 安装按钮展示了应用如何根据 `action` 更新数据。`action` 和 `name-click` 只说明用户执行了什么操作，不表示组件已经修改 `tabs`。例如，switch action 的 `action.checked` 是用户选择的新状态。Card 仍会显示传入的 `checked`，因此应用需要更新对应 action。用户点击安装或删除按钮时，组件同样只触发事件。操作完成后，应用需要更新 `item.installed` 或移除对应条目，组件随后会按照新的 `tabs` 重新分区。

分区展开状态按标签页和分区分别保存。组件会先更新展开状态，再触发 `section-toggle`。事件中的 `expanded` 是更新后的值，应用不需要再同步这个状态，可以按需监听该事件。

## 组合与定制

### 定制 ExtensionManager 区域

`header-actions`、`tab`、`item` 和 `empty` 分别用于定制头部操作区、标签内容、条目和空状态。定制 `tab` 时，建议调用作用域中的 `select()` 选择标签页，不要依赖内部 DOM。

`item` 插槽会替换默认 Card。`ExtensionManager` 仍负责外层列表和条目顺序，并使用 `item.id` 标识条目，但不再提供默认 Card 的 `action`、`name-click`、键盘交互和 ARIA 语义。如果自定义条目需要这些功能，开发者需要在插槽内自行实现。插槽中的 `item` 是 `ExtensionCardGridItem`，不包含 `ExtensionManager` 使用的 `installed` 和 `tags`。

<demo vue="../../demos/extension-manager/manager-slots.vue" title="替换管理器区域" description="在不依赖内部 DOM 的前提下定制头部、标签、条目和空分区。" />

### 独立组合 Card 与 CardGrid

`ExtensionManager.Card` 和 `ExtensionManager.CardGrid` 可以独立使用，也分别以 `TrExtensionCard` 和 `TrExtensionCardGrid` 导出。Card 直接接收 `name`、`description` 和 `actions` 等 Prop，不接收 `item` Prop。CardGrid 则接收带有稳定 `id` 的条目数组。

Card 会先过滤 `hidden: true` 的 action，再按数组顺序和 `primary-actions-limit` 划分主操作与更多操作。`disabled` action 不会被过滤，仍会占据原来的位置，但用户无法触发它。

`primary-action` 插槽只会处理位于主操作区域的 custom action。调用 `trigger(payload)` 后，Card 会触发标准 `action` 事件，并将参数放入 `event.payload`。`action.data` 是 action 自身的数据，不会自动复制到 `event.payload`。没有提供插槽时，custom action 会显示为普通按钮；进入更多操作菜单的 custom action 也使用默认菜单项。

<demo vue="../../demos/extension-manager/card-and-grid.vue" title="独立使用 Card 与 CardGrid" description="在独立 Card 中定制主操作并展示更多操作，同时使用 CardGrid 的 item 插槽替换条目内容。" />

## 可访问性与设计约束

### 键盘与焦点

标签页使用原生按钮和 tab 语义。焦点位于标签页时，使用 `ArrowLeft`、`ArrowRight` 循环选择并聚焦相邻标签页，使用 `Home` 或 `End` 跳到首个或末个标签页；`Enter` 和 `Space` 也可以激活标签页。

Card 名称默认可以点击，并支持 `Enter` 和 `Space`。设置 `name-clickable="false"` 后，名称显示为普通文本，不再进入 Tab 顺序。分区标题、switch、更多操作按钮、筛选控件和清空搜索按钮均保留对应原生控件的键盘行为。系统启用“减少动态效果”后，活动标签指示条不再播放过渡动画。

### 响应式与长内容

筛选区域根据 `ExtensionManager` 自身的容器宽度调整布局，不依赖浏览器视口宽度。容器宽度不超过 `480px` 时，标签选择和搜索框由两列变为单列。

CardGrid 根据自身容器宽度自动调整列数。每列默认至少为 `320px`，可以通过 `--tr-extension-card-grid-card-min-width` 调整。Card 名称和描述过长时会在单行内省略，完整内容保留在 `title` 中。

<demo vue="../../demos/extension-manager/responsive-layout.vue" title="容器响应式布局" description="切换宽窄容器，观察筛选控件和 CardGrid 如何根据组件容器宽度调整布局。" />

## API

以下组件和类型均从 `@opentiny/tiny-robot` 导出：

```ts
import { TrExtensionCard, TrExtensionCardGrid, TrExtensionManager } from '@opentiny/tiny-robot'
import type {
  ExtensionCardAction,
  ExtensionCardGridItem,
  ExtensionManagerItem,
  ExtensionManagerTab,
} from '@opentiny/tiny-robot'
```

### ExtensionManager Props

| 属性名               | 说明                                                                                                                     | 类型                    | 默认值       | 必填 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------- | ------------ | ---- |
| `tabs`               | 标签页及其 Extension 数据；每个 tab 和 item 的 `id` 应稳定且唯一。                                                       | `ExtensionManagerTab[]` | —            | 是   |
| `active-tab`         | 当前标签页，优先于 `default-active-tab`。无效值会显示第一个可用标签页，并触发 `update:active-tab` 通知父组件更新当前值。 | `string`                | —            | 否   |
| `default-active-tab` | 未设置 `active-tab` 时使用的初始标签页；无效值会自动改为第一个标签页。                                                   | `string`                | —            | 否   |
| `title`              | 头部标题；与 `header-actions` 都未提供时不渲染头部。                                                                     | `string`                | —            | 否   |
| `empty-text`         | 没有可显示的标签页时显示的提示文字。                                                                                     | `string`                | `'暂无内容'` | 否   |

### ExtensionManager Events

`update:active-tab` 和 `tab-change` 在受控、非受控模式下的更新方式不同，详见“交互与状态管理”。其他事件的状态变化和应用处理方式如下。

| 事件名              | 触发时机                                                                                                          | 回调参数                                              |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `update:active-tab` | 用户选择不同标签页，或当前标签页因 `active-tab` / `tabs` 变化而改用其他标签页时。非受控模式初始化不会触发该事件。 | `(tabId: string \| undefined) => void`                |
| `tab-change`        | 用户选择不同标签页后；在 `update:active-tab` 之后触发。                                                           | `(event: ExtensionManagerTabChangeEvent) => void`     |
| `section-toggle`    | 组件更新分区展开状态后触发；`expanded` 是更新后的值，应用不需要再同步该状态。                                     | `(event: ExtensionManagerSectionToggleEvent) => void` |
| `action`            | 默认 Card 的操作被触发时触发；组件不会修改 `tabs`，应用需要处理操作并更新数据。                                   | `(event: ExtensionManagerActionEvent) => void`        |
| `name-click`        | 默认 Card 名称被鼠标、Enter 或 Space 激活时触发；应用根据该事件决定如何打开详情。                                 | `(event: ExtensionManagerNameClickEvent) => void`     |

### ExtensionManager Slots

| 插槽名           | 用途                                                                                                                             | 作用域参数                                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `header-actions` | 扩展标题右侧的操作区。                                                                                                           | `—`                                                                                                                |
| `tab`            | 替换单个标签的内容。建议调用 `select()` 选择标签页，不要依赖内部 DOM。                                                           | `{ tab: ExtensionManagerTab; active: boolean; select: () => void }`                                                |
| `item`           | 替换默认 Card。组件仍负责外层列表和条目顺序，并使用 `item.id` 标识条目；插槽内容需要自行实现 Card 的事件、键盘交互和 ARIA 语义。 | `{ tab: ExtensionManagerTab; sectionKey: ExtensionManagerSectionKey; item: ExtensionCardGridItem; index: number }` |
| `empty`          | 替换当前标签页内空分区的内容。                                                                                                   | `{ tab: ExtensionManagerTab; sectionKey: ExtensionManagerSectionKey; title: string }`                              |

### CardGrid Props

以下 Card 配置按 `item` 字段、CardGrid Prop、Card 默认值的顺序生效。`0` 和 `false` 都是有效配置，不会继续使用下一层默认值。

| 属性名                     | 说明                                                                                                      | 类型                                 | 有效默认值     | 必填 |
| -------------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------ | -------------- | ---- |
| `items`                    | 要渲染的卡片数据；每项都必须有稳定且唯一的 `id`。                                                         | `ExtensionCardGridItem[]`            | —              | 是   |
| `empty-text`               | `items` 为空且未提供 `empty` 插槽时的提示。                                                               | `string`                             | `'暂无内容'`   | 否   |
| `primary-actions-limit`    | item 未设置同名字段时，每个 Card 放入主操作区域的 action 数量。`0` 会将所有可见 action 放入更多操作菜单。 | `number`                             | `1`            | 否   |
| `name-clickable`           | item 未设置同名字段时，Card 名称是否可以点击和键盘激活。                                                  | `boolean`                            | `true`         | 否   |
| `overflow-menu-label`      | item 未设置同名字段时，更多操作按钮的可访问名称和 `title`。                                               | `string`                             | `'更多操作'`   | 否   |
| `overflow-menu-placement`  | item 未设置同名字段时，更多操作菜单的首选位置。空间不足时，组件可能切换到另一方向。                       | `ExtensionCardOverflowMenuPlacement` | `'bottom-end'` | 否   |
| `overflow-menu-show-icons` | item 未设置同名字段时，更多操作菜单是否显示 action 图标。                                                 | `boolean`                            | `true`         | 否   |

### CardGrid Events

| 事件名       | 触发时机                                                    | 回调参数                                           |
| ------------ | ----------------------------------------------------------- | -------------------------------------------------- |
| `action`     | 默认 Card 的 action 被触发时，事件包含所属条目的 `itemId`。 | `(event: ExtensionCardGridActionEvent) => void`    |
| `name-click` | 默认 Card 名称被激活时，事件包含所属条目的 `itemId`。       | `(event: ExtensionCardGridNameClickEvent) => void` |

### CardGrid Slots

| 插槽名  | 用途                                                                                                                             | 作用域参数                                       |
| ------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| `item`  | 替换默认 Card。Grid 仍负责外层列表和条目顺序，并使用 `item.id` 标识条目；插槽内容不会自动触发 Grid 的 `action` 或 `name-click`。 | `{ item: ExtensionCardGridItem; index: number }` |
| `empty` | 替换空列表提示，优先于 `empty-text`。                                                                                            | `—`                                              |

### Card Props

| 属性名                     | 说明                                                                                                                                        | 类型                                 | 默认值         | 必填 |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | -------------- | ---- |
| `name`                     | 卡片名称，也是图片 icon 的替代文本和进度条可访问名称。                                                                                      | `string`                             | —              | 是   |
| `description`              | 名称下方的单行描述。                                                                                                                        | `string`                             | —              | 否   |
| `icon`                     | 图片 URL 或 Vue 组件；缺省时显示名称首字母占位。                                                                                            | `string \| Component`                | —              | 否   |
| `actions`                  | action 列表。Card 先过滤 `hidden` 项，再划分主操作和更多操作。`disabled` 项保留原排列位置，但不会触发事件。action id 应在同一 Card 内唯一。 | `ExtensionCardAction[]`              | `[]`           | 否   |
| `primary-actions-limit`    | 可见 action 中放入主操作区域的数量。负数按 `0` 处理，小数向下取整；`0` 表示所有可见 action 都进入更多操作菜单。                             | `number`                             | `1`            | 否   |
| `progress`                 | 数值进度会限制在 0–100；`'indeterminate'` 显示不确定进度。                                                                                  | `number \| 'indeterminate'`          | —              | 否   |
| `name-clickable`           | 是否将名称显示为可通过键盘激活的按钮。                                                                                                      | `boolean`                            | `true`         | 否   |
| `overflow-menu-label`      | 溢出菜单按钮的可访问名称和 title。                                                                                                          | `string`                             | `'更多操作'`   | 否   |
| `overflow-menu-placement`  | 更多操作菜单的首选位置，支持 `'bottom-end'` 和 `'top-end'`。首选方向空间不足时，组件可能切换到另一方向。                                    | `ExtensionCardOverflowMenuPlacement` | `'bottom-end'` | 否   |
| `overflow-menu-show-icons` | 是否在更多操作菜单中显示 action 图标。设为 `true` 且至少一个 action 有图标时，菜单会为所有 action 保留统一的图标列。                        | `boolean`                            | `true`         | 否   |

### Card Events

| 事件名       | 触发时机                                                                                                                                         | 回调参数                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| `action`     | 可见且未禁用的 action 被触发时。switch 的 `checked` 是新值；只有 `primary-action` 插槽调用 `trigger(payload)` 时，参数才会进入事件的 `payload`。 | `(event: ExtensionCardActionEvent) => void`    |
| `name-click` | 可点击名称被鼠标、Enter 或 Space 激活时。                                                                                                        | `(event: MouseEvent \| KeyboardEvent) => void` |

### Card Slots

| 插槽名           | 用途                                                                                                                                                                    | 作用域参数                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| `primary-action` | 自定义主操作区域中 `type: 'custom'` 的 action。调用 `trigger(payload)` 会触发标准 `action` 事件；未提供插槽时显示普通按钮。该插槽不处理更多操作菜单中的 custom action。 | `{ action: ExtensionCardCustomAction; trigger: (payload?: unknown) => void }` |

### Types

| 类型名 | 类型或签名 | 说明 | 导出入口 |
| --- | --- | --- |
| `ExtensionCardAction` | union | Card 的 switch、button 和 custom action。 | `@opentiny/tiny-robot` |
| `ExtensionCardActionBase` | interface | 所有 Card action 共有的标识、文案、图标和禁用字段。 | `@opentiny/tiny-robot` |
| `ExtensionCardSwitchAction` | interface | `checked` 值由应用提供的 switch action。 | `@opentiny/tiny-robot` |
| `ExtensionCardButtonAction` | interface | 普通 button action。 | `@opentiny/tiny-robot` |
| `ExtensionCardCustomAction` | interface | 可由 `primary-action` 插槽渲染的 custom action。 | `@opentiny/tiny-robot` |
| `ExtensionCardRenderableAction` | union | 从每种 `ExtensionCardAction` 中移除 `hidden` 字段后得到的联合类型。 | `@opentiny/tiny-robot` |
| `ExtensionCardActionEvent` | interface | Card 触发 action 事件时提供的数据。 | `@opentiny/tiny-robot` |
| `ExtensionCardProps` | interface | Card 的公开 Props 类型。 | `@opentiny/tiny-robot` |
| `ExtensionCardEmits` | interface | Card 的公开事件类型。 | `@opentiny/tiny-robot` |
| `ExtensionCardSlots` | interface | Card 的公开插槽类型。 | `@opentiny/tiny-robot` |
| `ExtensionCardGridItem` | type | 带 `id` 的 Card 数据。 | `@opentiny/tiny-robot` |
| `ExtensionCardGridActionEvent` | interface | 包含 `itemId` 和 Card action 的事件数据。 | `@opentiny/tiny-robot` |
| `ExtensionCardGridNameClickEvent` | interface | 包含 `itemId` 和 Card name-click 原生事件的数据。 | `@opentiny/tiny-robot` |
| `ExtensionCardGridProps` | interface | CardGrid 的公开 Props 类型。 | `@opentiny/tiny-robot` |
| `ExtensionCardGridEmits` | interface | CardGrid 的公开事件类型。 | `@opentiny/tiny-robot` |
| `ExtensionCardGridSlots` | interface | CardGrid 的公开插槽类型。 | `@opentiny/tiny-robot` |
| `ExtensionManagerItem` | type | `ExtensionManager` 接收的条目；在 Grid item 基础上增加分区和筛选字段。 | `@opentiny/tiny-robot` |
| `ExtensionManagerTab` | interface | `ExtensionManager` 的标签页数据。 | `@opentiny/tiny-robot` |
| `ExtensionManagerSectionKey` | union | `'installed' \| 'available'`。 | `@opentiny/tiny-robot` |
| `ExtensionManagerTagOption` | interface | 组件根据当前数据生成的标签选项结构。 | `@opentiny/tiny-robot` |
| `ExtensionManagerTabChangeEvent` | interface | 标签切换事件数据。 | `@opentiny/tiny-robot` |
| `ExtensionManagerSectionToggleEvent` | interface | 分区折叠事件数据。 | `@opentiny/tiny-robot` |
| `ExtensionManagerActionEvent` | interface | 包含标签页、分区、条目和 Card action 的事件数据。 | `@opentiny/tiny-robot` |
| `ExtensionManagerNameClickEvent` | interface | 包含标签页、分区、条目和 Card name-click 原生事件的数据。 | `@opentiny/tiny-robot` |
| `ExtensionManagerProps` | interface | `ExtensionManager` 的公开 Props 类型。 | `@opentiny/tiny-robot` |
| `ExtensionManagerEmits` | interface | `ExtensionManager` 的公开事件类型。 | `@opentiny/tiny-robot` |
| `ExtensionManagerSlots` | interface | `ExtensionManager` 的公开插槽类型。 | `@opentiny/tiny-robot` |
| `ExtensionCardOverflowMenuPlacement` | union | `'bottom-end' \| 'top-end'`。 | `@opentiny/tiny-robot` |

```ts
import type { Component } from 'vue'

export interface ExtensionCardActionBase {
  id: string
  label: string
  icon?: Component
  hidden?: boolean
  disabled?: boolean
  danger?: boolean
}

export interface ExtensionCardSwitchAction extends ExtensionCardActionBase {
  type: 'switch'
  checked: boolean
}

export interface ExtensionCardButtonAction extends ExtensionCardActionBase {
  type: 'button'
}

export interface ExtensionCardCustomAction extends ExtensionCardActionBase {
  type: 'custom'
  data?: unknown
}

export type ExtensionCardAction = ExtensionCardSwitchAction | ExtensionCardButtonAction | ExtensionCardCustomAction

export interface ExtensionCardActionEvent {
  id: string
  type: ExtensionCardAction['type']
  checked?: boolean
  payload?: unknown
}

export type ExtensionCardGridItem = ExtensionCardProps & { id: string }

export type ExtensionManagerItem = ExtensionCardGridItem & {
  installed?: boolean
  tags?: string[]
}

export type ExtensionManagerSectionKey = 'installed' | 'available'

export interface ExtensionManagerTab {
  id: string
  label: string
  items: ExtensionManagerItem[]
}

export interface ExtensionCardGridActionEvent {
  itemId: string
  action: ExtensionCardActionEvent
}

export interface ExtensionCardGridNameClickEvent {
  itemId: string
  event: MouseEvent | KeyboardEvent
}

export interface ExtensionManagerTabChangeEvent {
  tabId: string
}

export interface ExtensionManagerSectionToggleEvent {
  tabId: string
  sectionKey: ExtensionManagerSectionKey
  expanded: boolean
}

export interface ExtensionManagerActionEvent {
  tabId: string
  sectionKey: ExtensionManagerSectionKey
  itemId: string
  action: ExtensionCardActionEvent
}

export interface ExtensionManagerNameClickEvent {
  tabId: string
  sectionKey: ExtensionManagerSectionKey
  itemId: string
  event: MouseEvent | KeyboardEvent
}
```

`ExtensionCardRenderableAction` 是从每种 `ExtensionCardAction` 中移除 `hidden` 字段后得到的联合类型。`ExtensionCardActionBase`、`ExtensionCardSwitchAction`、`ExtensionCardButtonAction` 和 `ExtensionCardCustomAction` 也从包根导出，字段与上面的完整 action 定义一致。`ExtensionManager` 的 `action` 通过 `tabId`、`sectionKey` 和 `itemId` 标记操作来自哪个条目，嵌套的 `action` 使用 Card 的完整事件结构。`name-click` 会提供原生鼠标或键盘事件，应用可以根据该事件打开详情或处理焦点。

### CSS Variables

下表仅列出当前作为公共定制接口的 CSS Variables。将这些变量设置在 Card、CardGrid 或其父级元素上，即可调整对应样式。未列出的组件内部变量不属于公共定制接口，不应依赖。

| 变量名                                        | 说明                                    | 默认值                    |
| --------------------------------------------- | --------------------------------------- | ------------------------- |
| `--tr-extension-card-bg-color`                | Card 背景色。                           | `#f8f8f8`                 |
| `--tr-extension-card-bg-color-hover`          | Card 悬停背景及默认操作背景。           | `rgba(0, 0, 0, 0.04)`     |
| `--tr-extension-card-focus-color`             | 可点击名称的 focus-visible 描边颜色。   | `#191919`                 |
| `--tr-extension-card-icon-color`              | 溢出菜单 action 图标颜色。              | `#808080`                 |
| `--tr-extension-card-switch-bg-color`         | 未选中 switch 轨道颜色。                | `var(--tr-text-disabled)` |
| `--tr-extension-card-switch-bg-color-checked` | 选中 switch 轨道颜色。                  | `var(--tr-color-primary)` |
| `--tr-extension-card-grid-card-min-width`     | CardGrid 每个响应式网格轨道的最小宽度。 | `320px`                   |
