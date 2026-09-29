# 组件文档规范验证缺陷与改进建议

本文记录使用《组件文档规范》刷新 Bubble 与 Sender 文档时实际遇到的问题。组件源码、包根导出和运行时行为仍是文档事实来源；本文只提出规范改进建议，不在本分支修改规范正文或组件功能。

## 规范缺陷与建议

### G1. “公开导出”与“推荐公共契约”的边界仍不清楚

- **实际案例**：Sender 从包根导出了 `KeyboardHandlers`、`UseEditorReturn`、`SuggestionListProps` 等明显偏内部实现的类型；规范要求与页面直接相关的公开类型全部进入索引，但没有说明如何处理这类“技术上可导入、产品上未承诺”的导出。
- **可读性冲突**：机械收录可以保证完整性，却会让类型索引被内部组合函数和内部列表类型淹没；省略又会违反当前的完整索引要求。
- **本次处理**：类型索引按包根实际导出完整收录，并在说明中标出内部组合函数类型，不把它们包装成推荐入口。
- **建议改写**：增加“支持级别”规则，要求公共导出清单标记 `stable`、`advanced`、`internal-exported`、`deprecated`。组件页必须完整索引 stable/advanced；internal-exported 可集中到单独的导出附录，并明确不保证长期兼容。

### G2. 类型契约与运行时行为冲突时缺少发布规则

- **实际案例**：`SenderSlots` 声明 `actions-inline`、`footer` 和 `footer-right` 接收 `SenderSlotScope`，但 `TrSender` 顶层转发没有传递这些参数。类型事实源与运行时事实源直接冲突。
- **可读性冲突**：只按类型写会让示例不可运行；只按运行时写又会让 Types 索引和插槽表互相矛盾。
- **本次处理**：Slots 表按当前可用行为记录为无作用域参数，Types 索引保留 `SenderSlotScope` 并明确尚未由顶层插槽转发。
- **建议增加**：规定此类冲突必须作为发布阻断项或显式“已知契约差异”记录；在修复前，行为表按可验证运行时写，类型索引保留真实声明并链接差异，不允许静默选择其中一方。

### G3. `outline: [1, 3]` 与复合组件的 H4 API 分组存在导航冲突

- **实际案例**：Sender 在 `Props`、`Events`、`Methods / Expose` 下用 H4 区分 Template、Mention、Suggestion、UploadButton 和 VoiceButton；Bubble 也在同一页记录三个公开组件。规范同时推荐 `outline: [1, 3]`，这些 H4 分组不会进入页面目录。
- **机械之处**：把所有子组件提升为 H3 会破坏“API 类别优先”的分组轴；保留 H4 又降低复杂 API 的检索效率。
- **本次处理**：继续使用类别优先轴和 H4 分组，保持两页结构一致，并保留显式锚点与正文链接。
- **建议改写**：允许复杂复合组件使用 `outline: [1, 4]`，或要求文档工具为 API H4 生成二级目录；规范应给出选择条件，而不是把统一 frontmatter 与复合组件矩阵分开规定。

### G4. 扩展配置、子组件 Props 与主组件 Props 的分组关系仍含糊

- **实际案例**：Sender 同页包含主组件 Props、Template/Mention/Suggestion 配置对象，以及 ActionButton/UploadButton/VoiceButton Props。扩展配置不是 Vue 子组件 Props，但全部放在 `Props` 下最便于查找。
- **机械之处**：严格按“API 类别优先”组织时，扩展配置容易被误解为 Sender Prop；严格按“组件优先”组织又会把同一输入任务拆散。
- **本次处理**：主分组仍采用 API 类别优先，在 Props 内用 H4 和引导文字区分“Sender Props”“扩展配置”和“Sender Actions”。
- **建议增加**：为“主组件 + 扩展工厂 + 可独立子组件”的混合页面增加第三种矩阵：主组件 API 保持类别优先，扩展配置与独立子组件可建立命名 H3 参考区；要求标题明确写“配置”或组件名，避免把配置项误认为主组件 Prop。

### G5. CSS Variables 的默认值在多主题下无法用单一“默认值”表达

- **实际案例**：Sender 的禁用色、阴影、Mention、Suggestion 和 Template 变量在浅色与深色主题中各有一套值；Bubble Tool 的 JSON 颜色也随主题变化。
- **机械之处**：规范模板只有一个“默认值”列。逐项写两套值会使表格非常宽，统一写“主题值”又不如精确值完整。
- **本次处理**：固定尺寸与 fallback 写精确值；随主题变化的 Sender 变量写“主题值”，Bubble Tool 用“浅色 / 深色”短句表示。
- **建议改写**：CSS Variables 表允许“默认值 / 主题差异”两种模式。主题变量可以链接到公共 token 清单并写“随主题”；仅在组件自身覆盖主题值时展开 light/dark 具体值。

### G6. 公共 CSS 资格仍缺少机器可读事实源

- **实际案例**：Bubble/Sender 的变量分散在组件公共变量文件、全局 `variables.css` 和组件局部 fallback 中。源码出现 `var(--*)` 只能证明使用，不能证明兼容承诺。
- **本次处理**：只收录公共主题文件和既有正式文档已经暴露的变量；没有把任意局部变量自动升级为公共 API。
- **建议增加**：建立可生成文档的公共 token 注册表，至少包含变量名、作用域、默认值、主题覆盖和稳定级别；评审工具应检查文档与注册表差异。

### G7. 共享 Demo 辅助文件的展示规则不明确

- **实际案例**：多个 Sender Demo 复用确定性的 `mockSpeechHandler.ts`。把它加入每个 `vueFiles` 能让示例完整，但会重复展示辅助代码；不加入则读者复制主文件后无法运行。
- **本次处理**：所有直接依赖该辅助文件的 Demo 都通过 `vueFiles` 明确展示，优先保证可复制性。
- **建议增加**：定义共享 Demo helper 的规则：必须位于同一组件 demo 目录；首次出现时完整展示，后续允许通过稳定链接引用；构建或 lint 应验证隐藏文件不是理解和运行示例所必需的依赖。

### G8. Composable 的页面位置和“主要入口”判定不够具体

- **实际案例**：Bubble 同时公开渲染器 Composables 和 `useAutoScroll`；Sender 公开 `useSenderContext`、`useSenderContentRegistration`，但还导出多种只有类型、没有包根函数入口的内部组合函数返回类型。
- **机械之处**：规范详细规定了 Composable 应说明什么，却没有规定混合组件页中放在用法章节、API 章节还是独立页面，也没有定义何时算“主要公开入口”。
- **本次处理**：与用户任务直接相关的 Composable 在用法中解释，在 API 中建立集中索引；只有内部类型导出、没有公共函数入口的项目仅进入 Types 索引。
- **建议增加**：混合页面默认在 Methods / Expose 后增加 Composables；只有存在独立读者、多个完整工作流或自身 API 很大时拆页。判定“主要入口”应以包根函数导出和用户任务是否必须依赖它为准。

## 本次发现的 API 事实冲突

以下问题不是规范缺陷，但会影响文档能否同时忠实于公开类型和运行时实现。本分支不修改组件功能。

### A1. Sender 插槽作用域类型与顶层转发不一致

- `SenderSlots` 声明 `actions-inline`、`footer` 和 `footer-right` 接收 `SenderSlotScope`。
- `TrSender` 的顶层插槽转发没有传递这些参数；当前只有 `content` 插槽能收到 `editor`。
- 文档按当前可用行为记录，并在 Types 索引标注差异。后续应修复顶层转发或收窄公开类型。

### A2. BubbleList 自定义分组函数没有公开类型名

- `BubbleListProps.groupStrategy` 使用内部 `BubbleGroupFunction`，但该类型没有从包根导出。
- Props 表使用完整函数签名，避免暗示开发者可以导入该类型。
- 后续可公开 `BubbleGroupFunction`，或在公共类型中直接内联签名并移除内部命名。

### A3. `SenderSuggestionItem.label` 的类型说明与运行时不一致

- 公开类型称 `label` 是显示标签，默认使用 `content`。
- 当前 Suggestion 列表的展示、高亮和默认回填都只读取 `content`。
- 文档把 `label` 标为当前未参与展示和回填的可选元数据。后续应实现类型承诺或收窄字段说明。

### A4. `SpeechConfig` 包含当前未生效的字段

- `autoReplace` 和 `onVoiceButtonClick` 位于公开 `SpeechConfig`，但 `VoiceButton`、`useSpeechHandler` 和 `WebSpeechHandler` 均未读取它们。
- 文档明确标为兼容字段，并推荐使用已实现的 `auto-insert` 和 `on-button-click`。
- 后续应实现这两个配置，或从公开类型移除并提供迁移说明。

### A5. Sender 的公开注释与运行时默认行为存在偏差

- `SenderProps.stopText` 的注释写默认值为“停止响应”，但组件没有设置该默认值；省略时实际只显示停止图标。
- `SenderContext.getContent` 的注释写返回 HTML，实际实现调用 `editor.getText()` 返回纯文本。
- 文档按运行时行为记录。后续应同步修正公开类型注释，避免生成式文档继续复制错误。

### A6. `WordCounterProps` 已导出但组件不接收

- 包根导出了必填的 `WordCounterProps.current`、`max` 和 `isOverLimit`，但 `TrWordCounter` 当前没有声明 Props，而是从 Sender Context 读取字数、上限与超限状态。
- 文档保留该公开类型的索引，但明确它不是当前组件的可用 Props 契约。
- 后续应删除未使用的导出类型，或让组件实际接收并定义它与 Sender Context 的优先级。
