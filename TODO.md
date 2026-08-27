# ModelSelector 优化 Todo

## 范围与约束

- 只调整 ModelSelector 组件、相关文档和测试。
- 不提交、不推送、不修改其他组件。
- 保持 Vue 3 Composition API、`script setup` 和 TypeScript。
- 保留现有受控/非受控 `modelValue`、`open`、`reasoningEffort` 行为。

## 公共 API 调整

### 删除

- `ModelSelectorProps.matchTriggerWidth`
- `ModelSelectorOption.groupLabel`
- `ModelSelectorSlots['group-label']`
- `ModelSelectorSlots['panel-header']`
- `ModelSelectorProps.listAriaLabel`
- `ModelSelectorProps.reasoningEffortAriaLabel`
- `ModelSelectorGroupLabelSlotProps`
- `ModelSelectorPanelSlotProps`

### 重命名

- `panel-header` 插槽改为 `header`。
- `ModelSelectorPanelSlotProps` 改为 `ModelSelectorSlotProps`，作为 `header` 和 `footer` 的公共基础类型。
- 面板 CSS 类 `tr-model-selector__panel-header` 改为 `tr-model-selector__header`。

### 保留

- 插槽：`trigger`、`item`、`empty`、`header`、`footer`。
- Props：模型、受控状态、默认状态、搜索、文案、过滤、样式、浮层定位、`reasoningEffortLabel`。
- `ariaLabel` 和 `searchAriaLabel`，避免删除后无法为 Trigger 和搜索框提供可靠的无障碍名称。
- `group`，同时作为分组标识和默认显示标题。

## disabled 契约

以下状态全部保留，不新增同义 Props：

- 根组件 `ModelSelectorProps.disabled`：禁用整个组件、禁止打开并关闭已显示的面板。
- `ModelSelectorOption.disabled`：禁用模型项；仍可搜索和展示，但不可点击或通过键盘选择。
- `ModelSelectorReasoningEffortOption.disabled`：禁用单个 effort 选项。
- `ModelSelectorTrigger` 内部 `disabled`：绑定原生 button 的 `disabled` 属性。
- `ModelSelectorEffort` 内部 `disabled`：当前模型禁用时统一禁用 effort 按钮。
- `NormalizedModelSelectorOption.disabled`：归一化后的内部 boolean 状态。
- `trigger` 和 `item` 插槽参数中的 `disabled`：供自定义内容渲染禁用状态。

内部 `effortDisabled` 只作为组件间属性，不暴露为根组件公共 Props。

## 组件边界

### `ModelSelector` 根组件

职责：维护公共状态、渲染 Trigger、Teleport 和浮层定位。

保留：

- `modelValue`、`open`、`reasoningEffort` 状态及对外事件。
- 当前模型和当前 effort 的派生状态。
- Trigger click 切换和 Enter 打开。
- Teleport、浮层定位、outside pointer 关闭。
- outside pointer 关闭和 Trigger 焦点恢复。
- 根组件 `disabled` 对打开、选择和 effort 操作的拦截。

移除或下沉：

- 根级搜索过滤和导航状态。
- 根级 Panel `keydown` 处理。
- `findVisibleOption`、`handleSelectByKey`。
- `panelRef`、`focusPanelPrimary` 和根组件主动聚焦 Panel 的链路。
- 主题注入和 Teleport 主题属性绑定。

### `ModelSelectorPanel`

职责：维护面板内部搜索、过滤、highlight、键盘交互和初始焦点。

调整：

- 接收归一化模型列表和当前选中值。
- 在 Panel 内使用 `useModelSelectorFilter` 和 `useModelSelectorNavigation`。
- Panel 挂载后自行聚焦搜索框或 listbox。
- 搜索框处理 Arrow、Enter、Escape；非搜索 listbox 处理 Arrow、Home、End、Enter、Space。
- Panel 根部仅处理 Escape，Tab 交由浏览器原生处理，不能拦截 header/footer 内部控件的 Enter、Space。
- 直接抛出选中的 `ModelSelectorOption`，不再只抛出 option key。
- 通过 `close` 事件通知根组件关闭，由根组件决定是否恢复 Trigger 焦点。

建议的内部事件：

- `select: [option: ModelSelectorOption]`
- `select-effort: [value: string | null]`
- `close: [restoreFocus: boolean]`

### `ModelSelectorGroup`

- 删除 `group-label` 插槽和 `ModelSelectorGroupLabelSlotProps`。
- 删除 `groupModels` 派生数据。
- 有 `group` 时直接渲染默认分组标题，否则使用 `presentation` 语义。
- 仅负责分组布局和 item 事件转发。

### `ModelSelectorItem`

- 保留内部 `highlighted`，用于键盘导航视觉状态、ARIA active descendant 和自动滚动。
- 保留 item 插槽中的 `highlighted`、`disabled`。
- 选择事件改为向上抛出原始 `ModelSelectorOption`，根组件继续做最终禁用校验。

### `ModelSelectorTrigger`

- 保留原生 button、`disabled`、`aria-expanded` 和 `aria-controls`。
- 只发出 click 和 Enter 语义事件，不向根组件转发通用键盘逻辑。
- Enter 打开时阻止原生默认行为，避免合成 click 导致面板立即关闭。
- 根组件通过统一的 `triggerSlotProps` 使用 `v-bind` 转发默认插槽参数。

### `ModelSelectorEffort`

- 保留组件级 `disabled` 和选项级 `option.disabled` 的合并逻辑。
- 保持禁用模型时 effort 全部不可操作。

## 具体文件修改清单

### 源码

- `packages/components/src/model-selector/index.type.ts`
  - 删除废弃 Props、分组字段和插槽类型。
  - 增加 `ModelSelectorSlotProps`。
  - 将插槽名改为 `header`。
- `packages/components/src/model-selector/internal.type.ts`
  - 移除 `groupLabel` 相关内部字段。
  - 删除不再使用的初始 highlight 类型。
- `packages/components/src/model-selector/normalizeModelOptions.ts`
  - 删除 `groupLabel` 归一化、搜索和分组逻辑。
  - 使用 `group` 生成分组 key 和标题。
- `packages/components/src/model-selector/composables/useModelSelectorFilter.ts`
  - 移除 `groupLabel` 搜索字段。
- `packages/components/src/model-selector/composables/useModelSelectorFloating.ts`
  - 删除 `matchTriggerWidth` 参数和开关。
  - 保留 Floating UI 的内部宽度测量以维持 Teleport 后的自动匹配行为。
- `packages/components/src/model-selector/index.vue`
  - 删除主题注入、根级 filter/navigation、Panel 键盘处理和 Panel 主动聚焦。
  - 简化 Trigger 事件和选项选择链路。
  - 更新 header/footer/item/empty 插槽转发。
- `packages/components/src/model-selector/components/ModelSelectorPanel.vue`
  - 接管搜索、导航、键盘和面板焦点。
  - `panel-header` 改为 `header`。
- `packages/components/src/model-selector/components/ModelSelectorGroup.vue`
  - 删除 `group-label` 插槽和相关参数。
- `packages/components/src/model-selector/components/ModelSelectorItem.vue`
  - 调整选择事件负载，保留 highlight 和 disabled 状态。
- `packages/components/src/model-selector/components/ModelSelectorTrigger.vue`
  - 收敛键盘事件为 Enter 语义事件。
- `packages/components/src/model-selector/index.less`
  - 同步 header 类名。
- `packages/components/src/styles/components/model-selector.less`
  - 保留 CSS 变量定义；必要时将 group label 变量改为 group title 变量。

### 文档与测试

- `docs/src/components/model-selector.md`
  - 同步 Props、Slots、Types、键盘和主题说明。
  - 删除 `group-label`、`panel-header`、`matchTriggerWidth` 和已删除 ARIA Props。
- `docs/demos/model-selector/slots.vue`
  - 改用 `header`，删除分组标题插槽和 `groupLabel` 数据。
- `packages/test/src/model-selector/index.vue`
  - 同步插槽、ARIA Props、分组字段和主题场景。
- `packages/test/src/model-selector/index.spec.ts`
  - 更新 Enter 打开行为。
  - 删除 ArrowUp/ArrowDown 打开断言。
- 保留 Panel 内导航、禁用项、effort、焦点和插槽回归测试；不约束 Tab 焦点流和离开关闭。
  - 增加 disabled 组件动态关闭和 Enter 不重复切换测试。

## 验证清单

- [x] `rg` 检查不存在 `group-label`、`panel-header`、`matchTriggerWidth` 和已删除 Props 的源码引用。
- [x] `pnpm exec prettier --check` 检查修改文件。
- [x] `pnpm -F @opentiny/tiny-robot type-check`。
- [x] `pnpm -F @opentiny/tiny-robot build`。
- [x] 执行 ModelSelector Playwright 测试。
- [x] 检查工作区只包含预期修改。
- [x] 不执行 commit 和 push。
