
# 更新日志

TinyRobot 遵循语义化版本规范，每个版本的更新内容如下。

在此页面上，您可以查看最新的更新日志。如需查看完整的变更历史，请访问 [GitHub Release](https://github.com/opentiny/tiny-robot/releases)。

## v0.4.0

`2026-02-12`

> [!IMPORTANT]
> **Breaking Changes**:
> - **Bubble / Sender / Kit**: 气泡组件、消息发送组件和 Kit 工具整体重构，引入可插拔渲染器与插件体系，统一消息模型与存储抽象，内部结构与部分类型定义有较大调整，升级时请参考最新文档与迁移指引。

### ✨ 新特性

**组件**

- **Sender**: 基于 Tiptap 重构输入架构，支持扩展机制（Template、Mention、Suggestion 等）；拆分动作按钮与布局组件；支持 `enterkeyhint` 移动端输入优化；支持 `Ctrl+Enter` / `Shift+Enter` 等快捷键控制换行。 by @SonyLeo in [#283](https://github.com/opentiny/tiny-robot/pull/283) [#292](https://github.com/opentiny/tiny-robot/pull/292) [#263](https://github.com/opentiny/tiny-robot/pull/263)
- **Sender**: 优化录制状态下的图标展示效果。 by @SonyLeo in [#285](https://github.com/opentiny/tiny-robot/pull/285)
- **Bubble**: 支持 OpenAI 风格消息结构（`tool_calls`、`reasoning_content` 等）；基于匹配规则选择渲染器，支持复杂结构与多模态消息渲染。 by @Gene in [#266](https://github.com/opentiny/tiny-robot/pull/266) [#286](https://github.com/opentiny/tiny-robot/pull/286)
- **BubbleList**: 支持消息分组渲染，处理 user 单条消息对应 assistant 多条消息的场景。 by @Gene in [#305](https://github.com/opentiny/tiny-robot/pull/305)
- **McpServerPicker**: 新增 `header-actions` 插槽，支持在面板头部注入自定义操作。 by @SonyLeo in [#274](https://github.com/opentiny/tiny-robot/pull/274)

**工具**

- **useMessage**: 引入插件体系与生命周期钩子，支持在请求前、流式响应等阶段扩展处理逻辑。 by @Gene in [#286](https://github.com/opentiny/tiny-robot/pull/286)
- **useConversation**: 重构会话管理架构，将会话列表 `conversations` 与消息 `messages` 解耦，读取会话列表时不再一次性加载全部消息，并通过后台引擎池支持多个对话同时“在后台运行”且随时切换。 by @Gene in [#304](https://github.com/opentiny/tiny-robot/pull/304)
- **Kit 存储**: 抽象统一存储策略接口与工具函数；优化 LocalStorage 与 IndexedDB 实现。 by @Gene in [#286](https://github.com/opentiny/tiny-robot/pull/286)

### 🔨 优化改进

- **Sender**: 调整动作按钮、扩展与上下文管理结构；完善类型定义与内部模块划分。 by @SonyLeo in [#283](https://github.com/opentiny/tiny-robot/pull/283)
- **Bubble**: 重构气泡组件与渲染器实现；优化样式、动画与多类型内容组合渲染稳定性。 by @Gene in [#266](https://github.com/opentiny/tiny-robot/pull/266) [#286](https://github.com/opentiny/tiny-robot/pull/286)
- **BubbleList**: 优化消息分组逻辑，支持多角色与隐藏消息混合场景。 by @Gene in [#305](https://github.com/opentiny/tiny-robot/pull/305)

### 🐛 问题修复

- **useMessage**: 修复流式响应中 `choice.delta` 与 `choice.message` 同时存在时的数据合并问题。 by @Gene in [#297](https://github.com/opentiny/tiny-robot/pull/297)

## v0.3.3

`2026-01-29`

### 🐛 问题修复

- **Sender**: 更新提交事件与模板数据清理逻辑，修复在部分场景下存在模板残留或重复提交的问题 by @SonyLeo in [#293](https://github.com/opentiny/tiny-robot/pull/293)

## v0.3.2

`2026-01-28`

### ✨ 新特性

**组件**

- **Sender**: 支持使用 `Ctrl+Enter` 与 `Shift+Enter` 在输入框中插入换行，改善多行编辑体验 by @SonyLeo in [#263](https://github.com/opentiny/tiny-robot/pull/263)
- **Sender**: 使用 `IconRecordingWave` 图标替换原有波形图片资源，优化语音输入按钮视觉效果 by @SonyLeo in [#284](https://github.com/opentiny/tiny-robot/pull/284)
- **McpServerPicker**: 新增 `header-actions` 插槽，允许在面板头部区域自定义操作入口 by @SonyLeo in [#274](https://github.com/opentiny/tiny-robot/pull/274)

### 🐛 问题修复

- **Sender**: 使用响应式 ref 管理文件选择对话框选项，修复文件上传配置在部分场景下不同步的问题 by @SonyLeo in [#282](https://github.com/opentiny/tiny-robot/pull/282)

## v0.3.1

`2025-12-30`

### ✨ 新特性

**组件**

- **BubbleList**: `autoScroll` 功能启用后，新增支持用户手势打断和手动控制滚动到底部，自动滚动优化 by @Gene in [#270](https://github.com/opentiny/tiny-robot/pull/270)

**工具**

- **useConversation**: 添加可插拔存储策略，支持 LocalStorage 和 IndexedDB by @SonyLeo in [#275](https://github.com/opentiny/tiny-robot/pull/275)

### 🐛 问题修复

- **useConversation**: 修复保存会话时响应式对象转换问题 by @SonyLeo in [#271](https://github.com/opentiny/tiny-robot/pull/271)




## v0.3.0

`2025-11-24`

> [!IMPORTANT]
> **Breaking Changes**:
> - **History 历史组件**: Props 参数变更，具体迁移请参考最新文档

### ✨ 新特性

**组件**

- **History**: 新增 `item-prefix` 和 `item-title` 插槽，支持自定义历史项渲染 by @Gene in [#256](https://github.com/opentiny/tiny-robot/pull/256)
- **History**: 重构历史组件以提升移动端友好性 by @Gene in [#227](https://github.com/opentiny/tiny-robot/pull/227)
- **Bubble**: 支持为渲染组件配置 `defaultProps`，提供默认属性 by @Gene in [#253](https://github.com/opentiny/tiny-robot/pull/253)
- **Bubble**: 新增 `trailer` 插槽，增强插槽处理逻辑 by @Gene in [#237](https://github.com/opentiny/tiny-robot/pull/237)
- **Bubble**: 改进气泡组件，优化 trailer 插槽和样式增强 by @Gene in [#257](https://github.com/opentiny/tiny-robot/pull/257)
- **Bubble**: 增强 Bubble 组件，支持 CSS 变量 by @Gene in [#203](https://github.com/opentiny/tiny-robot/pull/203)
- **Bubble**: 新增自定义内容字段支持 by @Gene in [#186](https://github.com/opentiny/tiny-robot/pull/186)
- **Bubble**: 支持多种消息格式 by @Gene in [#123](https://github.com/opentiny/tiny-robot/pull/123)
- **BubbleList**: 新增隐藏角色支持 by @Gene in [#182](https://github.com/opentiny/tiny-robot/pull/182)
- **Sender**: 支持自定义语音输入功能 by @SonyLeo in [#245](https://github.com/opentiny/tiny-robot/pull/245)
- **Sender**: 支持自定义录音 UI 和节点点击事件 by @SonyLeo in [#246](https://github.com/opentiny/tiny-robot/pull/246)
- **Sender**: 新增 `tooltipPlacement` 属性，支持配置文件上传按钮提示框位置 by @SonyLeo in [#235](https://github.com/opentiny/tiny-robot/pull/235)
- **Sender**: 通过 `upload-popper-class` 自定义弹出框样式 by @SonyLeo in [#221](https://github.com/opentiny/tiny-robot/pull/221)
- **Sender**: 上传按钮和发送按钮扩展 by @SonyLeo in [#155](https://github.com/opentiny/tiny-robot/pull/155)
- **Sender**: 更新样式以使用 CSS 变量保持一致性 by @Gene in [#211](https://github.com/opentiny/tiny-robot/pull/211)
- **Sender**: 支持自定义选择建议项的按键 by @SonyLeo in [#205](https://github.com/opentiny/tiny-robot/pull/205)
- **Sender**: 新增 `autoSize` 属性支持，控制模板编辑器自适应尺寸 by @SonyLeo in [#255](https://github.com/opentiny/tiny-robot/pull/255)
- **Container**: 新增 `title` 属性和 `close` 事件 by @Gene in [#195](https://github.com/opentiny/tiny-robot/pull/195)
- **Container**: 更新样式和变量 by @Gene in [#210](https://github.com/opentiny/tiny-robot/pull/210)
- **Prompt**: 新增宽度相关的 CSS 变量，优化 UI 一致性 by @Gene in [#248](https://github.com/opentiny/tiny-robot/pull/248)
- **McpServerPicker**: MCP 服务器选择器组件 by @SonyLeo in [#125](https://github.com/opentiny/tiny-robot/pull/125)
- **McpServerPicker**: 更新样式以使用 CSS 变量 by @SonyLeo in [#219](https://github.com/opentiny/tiny-robot/pull/219)
- **McpAddForm**: MCP 添加表单组件及文档 by @SonyLeo in [#215](https://github.com/opentiny/tiny-robot/pull/215)
- **McpAddForm**: 更新样式以使用 CSS 变量保持一致性 by @Gene in [#218](https://github.com/opentiny/tiny-robot/pull/218)
- **DragOverlay**: 拖拽浮层组件 by @SonyLeo in [#147](https://github.com/opentiny/tiny-robot/pull/147)
- **DragOverlay**: 重构组件 CSS 变量和文档 by @SonyLeo in [#201](https://github.com/opentiny/tiny-robot/pull/201)
- **Attachments**: 附件组件 by @SonyLeo in [#148](https://github.com/opentiny/tiny-robot/pull/148)
- **SuggestionPopover**: 新增插槽以增强自定义能力 by @Gene in [#150](https://github.com/opentiny/tiny-robot/pull/150)
- **SuggestionPills**: 使用 useSlotRefs 重构建议按钮组组件 by @Gene in [#154](https://github.com/opentiny/tiny-robot/pull/154)
- **DropdownMenu**: 改进悬停处理 by @Gene in [#164](https://github.com/opentiny/tiny-robot/pull/164)
- **BasePopper**: 支持通过 CSS 变量自定义显示区域 by @Gene in [#169](https://github.com/opentiny/tiny-robot/pull/169)
- **BasePopper**: 暴露 update 方法 by @Gene in [#166](https://github.com/opentiny/tiny-robot/pull/166)
- **Theme**: 新增主题解决方案，支持多主题切换 by @Gene in [#189](https://github.com/opentiny/tiny-robot/pull/189)

**工具**

- **useConversation**: 增强会话加载功能，新增 `onLoaded` 回调和消息发送逻辑 by @Gene in [#232](https://github.com/opentiny/tiny-robot/pull/232)
- **useConversation**: 新增 `allowEmpty` 参数 by @Hexqi in [#223](https://github.com/opentiny/tiny-robot/pull/223)
- **useMessage**: 增强消息处理，新增完成原因支持 by @Gene in [#229](https://github.com/opentiny/tiny-robot/pull/229)
- **useMessage**: 新增 API `send`，新增选项 `events.onReceiveData` by @Gene in [#185](https://github.com/opentiny/tiny-robot/pull/185)
- **useMessage**: 增强文档和修复类型定义 by @Gene in [#202](https://github.com/opentiny/tiny-robot/pull/202)

**其他**

- **Playground**: 初始化 TinyRobot Playground 项目 by @Gene in [#249](https://github.com/opentiny/tiny-robot/pull/249)
- **Docs**: 将 Playground 集成到文档网站 by @Gene in [#247](https://github.com/opentiny/tiny-robot/pull/247)
- **Docs**: 新增侧边栏导航，增加指南和示例导航分组 by @Gene in [#252](https://github.com/opentiny/tiny-robot/pull/252)
- **Docs**: TinyRobot 文档样式优化 by @wuyiping in [#236](https://github.com/opentiny/tiny-robot/pull/236)
- **Docs**: 替换指定文本并优化文档样式 by @SonyLeo in [#226](https://github.com/opentiny/tiny-robot/pull/226)
- **E2E**: 构建 E2E 测试流程，实现容器组件测试 by @SonyLeo in [#199](https://github.com/opentiny/tiny-robot/pull/199)

### 🔨 优化改进

- **McpServerPicker**: 优化插件卡片边框颜色效果 by @SonyLeo in [#233](https://github.com/opentiny/tiny-robot/pull/233)
- **McpServerPicker**: 优化 MCP 面板样式和搜索方法 by @SonyLeo in [#192](https://github.com/opentiny/tiny-robot/pull/192)
- **McpServerPicker**: 新增插件添加状态并优化添加样式 by @SonyLeo in [#208](https://github.com/opentiny/tiny-robot/pull/208)
- **Sender**: 调整清除按钮的显示时机 by @SonyLeo in [#250](https://github.com/opentiny/tiny-robot/pull/250)
- **Sender**: 上传提示框默认位置改为 `top-end` by @SonyLeo in [#234](https://github.com/opentiny/tiny-robot/pull/234)
- **Sender**: 更新操作按钮图标 by @SonyLeo in [#217](https://github.com/opentiny/tiny-robot/pull/217)
- **Sender**: 移除默认建议过滤器并增强文本高亮功能 by @SonyLeo in [#179](https://github.com/opentiny/tiny-robot/pull/179)
- **Popper**: 改进 popper 组件响应性并更新演示 by @Gene in [#163](https://github.com/opentiny/tiny-robot/pull/163)
- **Build**: 外部化 @opentiny/vue 和 @opentiny/tiny-robot-svgs by @Gene in [#191](https://github.com/opentiny/tiny-robot/pull/191)

### 🐛 问题修复

- **Docs**: 修复文档构建时 'Element is missing end tag' 错误 by @Kagol in [#244](https://github.com/opentiny/tiny-robot/pull/244)
- **Docs**: 修复首页链接错误 by @Kagol in [#239](https://github.com/opentiny/tiny-robot/pull/239)
- **CI**: 修复源仓库 PR 的 E2E 测试流水线失败问题 by @SonyLeo in [#241](https://github.com/opentiny/tiny-robot/pull/241)
- **Assistant**: 修复 Assistant 演示会话问题 by @Gene in [#231](https://github.com/opentiny/tiny-robot/pull/231)
- **Sender**: 修复 Sender 组件工具提示弹出异常和相同文件选择问题 by @SonyLeo in [#206](https://github.com/opentiny/tiny-robot/pull/206)
- **Sender**: 修复示例项目中 Sender 组件宽度异常 by @SonyLeo in [#204](https://github.com/opentiny/tiny-robot/pull/204)
- **Sender**: 修复组件 footer-left 插槽位置错误 by @SonyLeo in [#197](https://github.com/opentiny/tiny-robot/pull/197)
- **McpServerPicker**: 修复暗色模式下标签页颜色异常 by @SonyLeo in [#220](https://github.com/opentiny/tiny-robot/pull/220)
- **McpServerPicker**: 修复 MCP 组件内置通知并优化插件标题 by @SonyLeo in [#207](https://github.com/opentiny/tiny-robot/pull/207)
- **McpServerPicker**: 更新 mcp-picker-server 表单类型值 by @SonyLeo in [#173](https://github.com/opentiny/tiny-robot/pull/173)
- **McpServerPicker**: 修复滚动条仅控制卡片列表显示 by @SonyLeo in [#198](https://github.com/opentiny/tiny-robot/pull/198)
- **McpServerPicker**: 为卡片描述添加 "title" 属性 by @SonyLeo in [#180](https://github.com/opentiny/tiny-robot/pull/180)
- **Sender**: 修复模板编辑器仅文本节点失焦问题 by @SonyLeo in [#190](https://github.com/opentiny/tiny-robot/pull/190)
- **Sender**: 修复提交模板内容时存在零宽字符 by @SonyLeo in [#184](https://github.com/opentiny/tiny-robot/pull/184)
- **Sender**: 修复模板编辑器光标位置和样式 by @SonyLeo in [#165](https://github.com/opentiny/tiny-robot/pull/165)
- **Sender**: 修复光标跳动和 IME 焦点丢失 by @Gene in [#176](https://github.com/opentiny/tiny-robot/pull/176)
- **Sender**: 修复 TS 5.9 及以上版本中 getComposedRanges 的类型兼容性 by @Gene in [#188](https://github.com/opentiny/tiny-robot/pull/188)
- **Bubble**: 修复函数和类 contentRenderer 不响应数据变化 by @Gene in [#187](https://github.com/opentiny/tiny-robot/pull/187)
- **History**: 修复 HistoryGroup 组件演示中缺少 TrHistory 导入 by @Gene in [#196](https://github.com/opentiny/tiny-robot/pull/196)
- **BaseSelect**: 使用 BaseSelect 组件替换 Select by @SonyLeo in [#214](https://github.com/opentiny/tiny-robot/pull/214)
- **Teleport**: 解决 createTeleport 中潜在的挂载失败 by @Gene in [#170](https://github.com/opentiny/tiny-robot/pull/170)
- **Compatibility**: 调整视口单位使用以兼容 Chrome < 108 by @Gene in [#167](https://github.com/opentiny/tiny-robot/pull/167)
- **Build**: 移除构建警告 by @SonyLeo in [#162](https://github.com/opentiny/tiny-robot/pull/162)

## v0.2.15

`2025-07-17`

### 🔨 优化改进

- **Sender**: 增强 CSS 变量以改进样式 by @SonyLeo in [#152](https://github.com/opentiny/tiny-robot/pull/152)
- **SuggestionPopover**: 增强 CSS 变量以改进样式 by @Gene in [#149](https://github.com/opentiny/tiny-robot/pull/149)

### 🐛 问题修复

- **SuggestionPills**: 优化容器宽度计算 by @Gene in [#144](https://github.com/opentiny/tiny-robot/pull/144)
- **Docs**: 修复文档导航样式 by @Hexqi in [#151](https://github.com/opentiny/tiny-robot/pull/151)
- **Docs**: 移除动态导入 enhanceApp mixin 以修复警告 by @Gene in [#157](https://github.com/opentiny/tiny-robot/pull/157)
- **CI/CD**: 新增 GitHub Pages 文档部署工作流 by @Hexqi in [#153](https://github.com/opentiny/tiny-robot/pull/153)
- **CI/CD**: 支持发布 alpha、beta、rc、latest 标签版本 by @Hexqi in [#156](https://github.com/opentiny/tiny-robot/pull/156)

## v0.2.14

`2025-07-07`

### 🔨 优化改进

- **BasePopper**: 简化插槽处理 by @Gene in [#128](https://github.com/opentiny/tiny-robot/pull/128)
- **Components**: 移除已弃用的 Question 和 Suggestion 组件，更新 Assistant 演示以使用 SuggestionPopover 和 SuggestionPills by @Gene in [#141](https://github.com/opentiny/tiny-robot/pull/141)

### 🐛 问题修复

- **Sender**: 修复提交快捷键触发换行 by @SonyLeo in [#140](https://github.com/opentiny/tiny-robot/pull/140)

## v0.2.13

`2025-07-03`

### ✨ 新特性

- **DropdownMenu**: 新增 `appendTo` 属性，设置菜单挂载的目标容器 by @Gene in [#137](https://github.com/opentiny/tiny-robot/pull/137)

## v0.2.12

`2025-07-03`

> [!IMPORTANT]
> **Breaking Change**: Sender 消息输入框模板编辑功能重新设计，相关用法请查看最新文档

### ✨ 新特性

- **Sender**: 模板组件及文档 by @SonyLeo in [#1](https://github.com/opentiny/tiny-robot/pull/1)

### 🔨 优化改进

- **Sender**: 改进模板编辑逻辑 by @gene9831
- **DropdownMenu**: 新增控制菜单项字重的 CSS 变量 `--tr-dropdown-menu-item-font-weight` by @Gene in [#135](https://github.com/opentiny/tiny-robot/pull/135)
- **SuggestionPills**: 移除 handleMouseenter 中自动滚动功能的冗余条件 by @Gene in [#133](https://github.com/opentiny/tiny-robot/pull/133)

## v0.2.11

`2025-06-28`

> [!IMPORTANT]
> **Breaking Change**: DropdownMenu 下拉菜单组件

### ✨ 新特性

- **DropdownMenu**: 增强悬停触发支持 by @Gene in [#127](https://github.com/opentiny/tiny-robot/pull/127)
- **SuggestionPills**: 新增溢出模式和自动滚动选项 by @Gene in [#129](https://github.com/opentiny/tiny-robot/pull/129)
- **ShadowDOM**: 支持 Shadow DOM teleport 兼容性 by @Gene in [#124](https://github.com/opentiny/tiny-robot/pull/124)
- **Suggestion**: 增强建议组件的事件处理 by @Gene in [#117](https://github.com/opentiny/tiny-robot/pull/117)

## v0.2.10

`2025-06-18`

### 🔨 优化改进

- **Sender**: 优化一些问题，实现输入框在加载状态时可以输入，支持 `stopText` 属性配置停止按钮的文本 by @SonyLeo in [#120](https://github.com/opentiny/tiny-robot/pull/120)

## v0.2.9

`2025-06-16`

### 🐛 问题修复

- **SuggestionPills**: 修复点击两次后弹出框才打开的问题 by @Gene in [#115](https://github.com/opentiny/tiny-robot/pull/115)

## v0.2.8

`2025-06-13`

### 🐛 问题修复

- **Sender**: 修复样式切换问题 by @SonyLeo in [#113](https://github.com/opentiny/tiny-robot/pull/113)

## v0.2.7

`2025-06-13`

### ✨ 新特性

- **Docs**: VitePress 文档支持开发模式下的 HMR by @Gene in [#107](https://github.com/opentiny/tiny-robot/pull/107)

### 🐛 问题修复

- **ShadowDOM**: 在 useScroll 中用 watchThrottled 替换 throttle 以兼容 Shadow DOM by @Gene in [#111](https://github.com/opentiny/tiny-robot/pull/111)

## v0.2.6

`2025-06-12`

### ✨ 新特性

- **Sender**: 新增侧边栏主题 by @SonyLeo in [#105](https://github.com/opentiny/tiny-robot/pull/105)
- **SuggestionPills**: 增强点击外部处理和 showAllButtonOn 属性 by @Gene in [#106](https://github.com/opentiny/tiny-robot/pull/106)

### 🔨 优化改进

- **Sender**: 重构紧凑类 by @SonyLeo in [#109](https://github.com/opentiny/tiny-robot/pull/109)

## v0.2.5

`2025-06-11`

### 🔨 优化改进

- **Sender**: 更新联想交互逻辑 by @SonyLeo in [#101](https://github.com/opentiny/tiny-robot/pull/101)

### 🐛 问题修复

- **Sender**: 修复模板输入 Shadow DOM 环境问题 by @SonyLeo in [#103](https://github.com/opentiny/tiny-robot/pull/103)
- **Tooltip**: 改进工具提示延迟处理和可见性逻辑 by @Gene in [#102](https://github.com/opentiny/tiny-robot/pull/102)

## v0.2.4

`2025-06-09`

### 🐛 问题修复

- **Sender**: 修复编辑块与文本垂直对齐 by @SonyLeo in [#98](https://github.com/opentiny/tiny-robot/pull/98)
- **Sender**: 移除停止生成工具提示 by @SonyLeo in [#99](https://github.com/opentiny/tiny-robot/pull/99)

## v0.2.3

`2025-06-09`

### ✨ 新特性

- **SuggestionPopover**: 增强建议弹出框，新增组件和工具提示功能 by @Gene in [#93](https://github.com/opentiny/tiny-robot/pull/93)
- **SuggestionPills**: 新增点击外部事件 by @Gene in [#95](https://github.com/opentiny/tiny-robot/pull/95)

### 🐛 问题修复

- **Sender**: 更新组件样式 by @SonyLeo in [#94](https://github.com/opentiny/tiny-robot/pull/94)
- **Tooltip**: 导出 TooltipContentProps 接口 by @Gene in [#96](https://github.com/opentiny/tiny-robot/pull/96)

## v0.2.2

`2025-06-05`

### 🐛 问题修复

- **Sender**: 修复失焦关闭弹出模态框和样式问题 by @SonyLeo in [#91](https://github.com/opentiny/tiny-robot/pull/91)
- **SuggestionPills**: 修复显示全部时更改容器宽度导致更多按钮消失 by @Gene in [#90](https://github.com/opentiny/tiny-robot/pull/90)
- **CI**: 更新环境为 Ubuntu 并更新 checkout action 版本 by @Gene in [#89](https://github.com/opentiny/tiny-robot/pull/89)
- **CI**: 修复 pnpm 缓存配置 by @ajaxzheng in [#87](https://github.com/opentiny/tiny-robot/pull/87)

## v0.2.1

`2025-06-04`

### 🐛 问题修复

- **SuggestionPills**: 修复弹出框在 SuggestionPills 中消失 by @Gene in [#85](https://github.com/opentiny/tiny-robot/pull/85)
- **CI**: 新增自动发布脚本 by @ajaxzheng in [#81](https://github.com/opentiny/tiny-robot/pull/81)

## v0.2.0

`2025-06-04`

### ✨ 新特性

**组件**

- **Sender**: 支持模板输入功能 by @SonyLeo in [#33](https://github.com/opentiny/tiny-robot/pull/33)
- **Sender**: 重构模板输入功能 by @SonyLeo in [#60](https://github.com/opentiny/tiny-robot/pull/60)
- **Sender**: 支持输入联想功能 by @SonyLeo in [#52](https://github.com/opentiny/tiny-robot/pull/52)
- **Sender**: 单行模式自动切换和快捷键切换 by @SonyLeo in [#40](https://github.com/opentiny/tiny-robot/pull/40)
- **Sender**: 更新语音输入功能 by @SonyLeo in [#42](https://github.com/opentiny/tiny-robot/pull/42)
- **Sender**: 固定发送状态服务文本 by @SonyLeo in [#46](https://github.com/opentiny/tiny-robot/pull/46)
- **Bubble**: 增强气泡组件，支持插槽并移除未使用的操作 by @Gene in [#34](https://github.com/opentiny/tiny-robot/pull/34)
- **History**: 新增历史组件及文档 by @Gene in [#29](https://github.com/opentiny/tiny-robot/pull/29)
- **Feedback**: 新增反馈组件及相关文档 by @Gene in [#32](https://github.com/opentiny/tiny-robot/pull/32)
- **Suggestion**: 新增建议组件及文档 by @SonyLeo in [#31](https://github.com/opentiny/tiny-robot/pull/31)
- **SuggestionPopover**: 新增建议弹出框组件及文档 by @Gene in [#59](https://github.com/opentiny/tiny-robot/pull/59)
- **SuggestionPills**: 新增建议按钮组组件 by @Gene in [#61](https://github.com/opentiny/tiny-robot/pull/61)
- **SuggestionPills**: 增强显示更多功能 by @Gene in [#70](https://github.com/opentiny/tiny-robot/pull/70)
- **DropdownMenu**: 新增下拉菜单组件及文档 by @Gene in [#61](https://github.com/opentiny/tiny-robot/pull/61)
- **ActionGroup**: 增强操作组，支持工具提示并重构图标按钮使用 by @Gene in [#36](https://github.com/opentiny/tiny-robot/pull/36)

**工具**

- **useConversation**: 新增会话管理工具 by @Hexqi in [#27](https://github.com/opentiny/tiny-robot/pull/27)

**其他**

- **Docs**: 新增 schema 卡片渲染演示 by @Gene in [#47](https://github.com/opentiny/tiny-robot/pull/47)

### 🔨 优化改进

- **History**: 更新历史数据结构，使用 'group' 替代 'date' 并增强文档 by @Gene in [#44](https://github.com/opentiny/tiny-robot/pull/44)
- **Sender**: 重构模板输入切换 content-editable 逻辑 by @SonyLeo in [#38](https://github.com/opentiny/tiny-robot/pull/38)
- **Sender**: 组件替换图标并解决一些审查意见 by @SonyLeo in [#58](https://github.com/opentiny/tiny-robot/pull/58)
- **Bubble**: 简化 VNode 属性处理 by @Gene in [#30](https://github.com/opentiny/tiny-robot/pull/30)
- **Icons**: 更新 SVG 图标和样式以保持一致性 by @Gene in [#25](https://github.com/opentiny/tiny-robot/pull/25)
- **Z-index**: 更新 z-index 值以使用 CSS 变量以便更好地维护 by @Gene in [#74](https://github.com/opentiny/tiny-robot/pull/74)
- **Sender**: 更新模板编辑器颜色 by @SonyLeo in [#77](https://github.com/opentiny/tiny-robot/pull/77)
- **Sender**: 优化模板删除位置逻辑 by @SonyLeo in [#78](https://github.com/opentiny/tiny-robot/pull/78)
- **Deprecation**: 标记 Question 和 Suggestion 组件为弃用状态 by @Gene in [#65](https://github.com/opentiny/tiny-robot/pull/65)
- **Build**: 构建和打包优化 by @Hexqi in [#49](https://github.com/opentiny/tiny-robot/pull/49)
- **Docs**: 修复和更新文档 by @Hexqi in [#51](https://github.com/opentiny/tiny-robot/pull/51)

### 🐛 问题修复

- **Sender**: 修复模板输入编辑问题 by @SonyLeo in [#68](https://github.com/opentiny/tiny-robot/pull/68)
- **Sender**: 修复问题联想弹出窗口显示时机 by @SonyLeo in [#69](https://github.com/opentiny/tiny-robot/pull/69)
- **Sender**: 修复文本宽度自适应和超出隐藏 by @SonyLeo in [#56](https://github.com/opentiny/tiny-robot/pull/56)
- **Sender**: 修复字数限制位置和超出标记 by @SonyLeo in [#55](https://github.com/opentiny/tiny-robot/pull/55)
- **Sender**: 更新 Sender 组件文档和样式问题 by @SonyLeo in [#28](https://github.com/opentiny/tiny-robot/pull/28)
- **Sender**: 修复文档和函数调用 by @SonyLeo in [#54](https://github.com/opentiny/tiny-robot/pull/54)
- **BubbleList**: 修复气泡列表自动滚动不工作 by @Gene in [#37](https://github.com/opentiny/tiny-robot/pull/37)
- **DropdownMenu**: 移除 Teleport to="body" 以兼容 Shadow DOM by @Gene in [#79](https://github.com/opentiny/tiny-robot/pull/79)
- **Style**: 修复一些样式问题并添加全局根 CSS by @Gene in [#72](https://github.com/opentiny/tiny-robot/pull/72)
- **AIModelConfig**: 添加可选属性以扩展 provider 并修复 handleSSEStream 相关问题 by @shenjunjian [#75](https://github.com/opentiny/tiny-robot/pull/75)
- **Compatibility**: 使用 ref 替换 useTemplateRef 以兼容 Vue 3.4 by @Gene in [#66](https://github.com/opentiny/tiny-robot/pull/66)
- **Docs**: 更新 vitepress-demo-plugin 以修复构建文档错误 by @Gene in [#45](https://github.com/opentiny/tiny-robot/pull/45)