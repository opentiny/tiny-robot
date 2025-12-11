# Chat-Input 组件实现文档

> 本文档说明 Chat-Input 组件的实际实现方式，基于最新代码编写。
> 
> **相关文档：**
> - [DESIGN.md](./DESIGN.md) - 设计思想和架构
> - [design-template.md](./design-template.md) - 模板功能详细设计
> - [design-mention.md](./design-mention.md) - Mention 功能详细设计

---

## 一、文档说明

### 1.1 文档定位

- **DESIGN.md**：设计思想、架构设计（What & Why）
- **IMPLEMENTATION.md**（本文档）：具体实现、代码组织（How）
- **专项文档**：特定功能的详细设计和实现

### 1.2 阅读方式

1. 先阅读 DESIGN.md 了解整体设计
2. 阅读本文档了解实现方式
3. 结合源代码理解细节
4. 参考专项文档了解特定功能

---

## 二、架构实现

### 2.1 整体架构

Chat-Input 采用四层架构：

**表现层** (`index.vue`)
- 根据 mode 分发到 SingleLineLayout / MultiLineLayout
- 透传所有插槽
- 应用样式类

**逻辑层** (`composables/useChatInputCore.ts`)
- 统一管理所有 Hook 的初始化顺序
- 解决循环依赖问题
- 自动组装 Context 和 Expose

**扩展层** (`extensions/`)
- Template: 模板块节点 + 3个插件
- Mention: 提及节点 + Suggestion 插件
- Suggestion: 输入联想扩展

**组件层** (`components/`)
- 原子组件：通过 inject 获取 Context
- 布局组件：管理插槽和结构


### 2.2 数据流向

```
用户输入 → Tiptap 编辑器 → onUpdate 事件 → emit('update:modelValue') → 父组件 v-model
```

### 2.3 组件间通信

**主容器 → 子组件：** 通过 `provide(CHAT_INPUT_CONTEXT_KEY, context)` 传递 Context

**子组件 → 主容器：** 调用 Context 提供的方法（如 `context.submit()`）

**主容器 → 父组件：** 通过 `emit` 触发事件，通过 `defineExpose` 暴露方法

### 2.4 目录结构

实际目录结构与 DESIGN.md 完全一致，核心文件：

- `index.vue` - 主容器（哑组件）
- `composables/useChatInputCore.ts` - 核心逻辑聚合
- `composables/useEditor.ts` - 编辑器初始化
- `composables/useModeSwitch.ts` - 模式切换
- `composables/useAutoSize.ts` - 自动高度
- `composables/useKeyboardShortcuts.ts` - 键盘快捷键
- `context/index.ts` - Context 注入方法
- `extensions/template/` - 模板块扩展
- `extensions/mention/` - 提及扩展
- `components/layouts/` - 布局组件
- `components/editor-content/` - 编辑器内容
- `components/footer/` - 底部容器

---

## 三、Context 系统

### 3.1 Context 定义

Context 类型定义在 `index.type.ts` 的 `ChatInputContext` 接口中，包含：

- **编辑器**：editor, editorRef
- **状态**：mode, loading, disabled, hasContent, canSubmit, isOverLimit, characterCount 等
- **配置**：showWordLimit, clearable, defaultActions, submitType 等
- **方法**：submit, clear, cancel, focus, blur, setContent, getContent


### 3.2 Context 提供

在 `composables/useChatInputCore.ts` 中组装并提供 Context：

**实现步骤：**
1. 初始化编辑器（必须最先，因为其他逻辑依赖它）
2. 计算基础状态（hasContent, canSubmit, isOverLimit 等）
3. 定义核心方法（submit, clear 等）
4. 初始化其他 Hook（useModeSwitch, useKeyboardShortcuts 等）
5. 组装 Context 对象
6. 使用 `provide(CHAT_INPUT_CONTEXT_KEY, context)` 提供
7. 返回 context 和 expose 对象

**关键实现细节：**
- 使用 `computed` 自动响应依赖变化
- 使用 `toRef` 包装 props 保持响应式
- submit 方法需要在键盘处理器之前定义（避免循环依赖）
- 动态注入键盘处理器到编辑器（使用 `editor.setOptions`）

### 3.3 Context 注入

在 `context/index.ts` 中提供 `useChatInputContext()` 方法：

- 使用 `inject(CHAT_INPUT_CONTEXT_KEY)` 获取 Context
- 如果 Context 不存在，抛出错误
- 子组件通过解构获取需要的状态和方法

### 3.4 状态计算

**hasContent：** 检查编辑器文本是否非空（trim 后）

**canSubmit：** 综合判断 `!disabled && !loading && hasContent && !isOverLimit && !submit.disabled`

**isOverLimit：** 当 maxLength 存在时，判断 `characterCount > maxLength`

**characterCount：** 获取编辑器文本长度（`editor.getText().length`）

---

## 四、Tiptap 编辑器

### 4.1 编辑器初始化

实现文件：`composables/useEditor.ts`

**基础扩展：**
- Document, Paragraph, Text（基础节点）
- History（撤销/重做）
- Placeholder（占位符，支持响应式更新）
- CharacterCount（字数统计）

**用户扩展：** 合并 `props.extensions`

**事件处理：**
- onUpdate：emit('update:modelValue', text)
- onFocus：emit('focus', event)
- onBlur：emit('blur', event)

**粘贴处理：** 只粘贴纯文本，单行模式替换换行符为空格

**双向绑定：** 监听 `props.modelValue` 变化，同步到编辑器


### 4.2 Template 扩展

实现文件：`extensions/template/extension.ts`

**节点配置：**
- 类型：Node
- group: 'inline', inline: true
- content: 'text*'（允许内部有文本）
- atom: false（非 atom，允许光标进入）
- selectable: true, draggable: false

**为什么选择非 atom：** 需要允许光标进入内部编辑内容，支持字符级删除

**节点属性：** id, content

**Vue 组件渲染：** 使用 `VueNodeViewRenderer(TemplateBlockView)`

**三个核心插件：**
1. `ensureZeroWidthChars()` - 零宽字符管理
2. `keyboardNavigationPlugin()` - 键盘导航
3. `pasteHandlerPlugin()` - 粘贴处理

#### 4.2.1 零宽字符管理插件

实现文件：`extensions/template/plugins.ts`

**插入规则：**
1. 段落首个节点是模板块 → 前面插入零宽字符
2. 段落末个节点是模板块 → 后面插入零宽字符
3. 连续两个模板块 → 中间插入零宽字符
4. 模板块内容为空 → 内部插入零宽字符占位
5. 段落只有一个零宽字符 → 删除（避免空段落显示异常）

**注意：** 模板块和普通文本之间不插入零宽字符（避免零宽字符被合并到文本节点）

**实现方式：** 在 `appendTransaction` 钩子中，遍历文档检查并插入/删除零宽字符

#### 4.2.2 键盘导航插件

实现文件：`extensions/template/plugins.ts`

**ArrowLeft/Right 处理：**
- 光标在零宽字符旁边 → 跳过零宽字符进入模板块
- 光标在模板块内部边界 → 跳出到模板块前/后

**模板块内部导航：**
- 空模板块：按左右箭头直接跳出
- 有内容：光标在边界时跳出

详细逻辑参考 `keyboardNavigationPlugin()` 函数实现。


#### 4.2.3 删除逻辑

实现文件：`extensions/template/plugins.ts` 的 `keyboardNavigationPlugin()`

**核心设计原则：**
1. **保护性删除**：删除最后一个字符时保留模板块外壳（替换为零宽字符）
2. **渐进式退出**：空模板块内按删除键先跳出，再次按才删除整个块
3. **智能进入**：有内容的模板块，删除键会进入而非删除
4. **零宽字符清理**：删除模板块时连带清理前后零宽字符
5. **边界保护**：防止 ProseMirror 默认行为破坏模板块边界

**Backspace 处理：**
- 从模板块内部：保护性删除 → 渐进式退出 → 边界保护
- 从模板块外部：空块删除整个 + 零宽字符，有内容进入末尾

**Delete 处理：** 逻辑与 Backspace 对称，方向相反

**选区删除：** 扩展选区以包含零宽字符

详细的删除逻辑和测试用例参考 [design-template-delete-logic.md](./design-template-delete-logic.md)

#### 4.2.4 粘贴处理插件

实现文件：`extensions/template/plugins.ts` 的 `pasteHandlerPlugin()`

**处理策略：**
1. 如果粘贴的是模板块 HTML → 让 Tiptap 默认处理
2. 如果粘贴的是纯文本 → 自定义处理：
   - 移除光标周围的零宽字符
   - 单行文本：直接插入
   - 多行文本：为每一行创建段落节点
   - 设置光标到粘贴内容末尾

### 4.3 Mention 扩展

实现文件：`extensions/mention/extension.ts`

**节点配置：**
- 类型：Node
- group: 'inline', inline: true
- atom: true（关键：作为不可分割的整体）
- selectable: true, draggable: false

**为什么选择 atom：** 不需要编辑内部内容，作为整体删除，不需要管理零宽字符

**节点属性：** id, label, preset

**Vue 组件渲染：** 使用 `VueNodeViewRenderer(MentionView)`

**Suggestion 插件：** 使用 `createSuggestionPlugin()` 创建


#### 4.3.1 Suggestion 插件

实现文件：`extensions/mention/plugin.ts`

**插件状态：**
- active: 是否激活
- range: 触发范围
- query: 查询文本
- filteredItems: 过滤后的项目列表

**触发检测：**
- 查找最后一个 @ 字符的位置
- 提取 @ 后面的查询文本
- 不允许空格（避免误触发）

**过滤逻辑：**
- 空查询：显示所有项目
- 有查询：匹配 label 或 preset（不区分大小写）

**键盘处理：**
- 面板激活时，交给组件处理（上下箭头、Enter/Tab 确认）
- Backspace 删除 mention 后保留 @（智能删除）

**智能删除实现：**
1. 检测光标前面是否是 mention 节点
2. 删除整个 mention 节点
3. 插入 @ 字符
4. 光标定位到 @ 后面
5. 自动触发建议面板

#### 4.3.2 弹窗定位

实现文件：`extensions/mention/components/mention-list.vue`

**使用 @floating-ui/dom：**
- 参考元素：`.mention-trigger`（高亮的 @ 文本）
- 默认位置：bottom-start（下方左对齐）
- 中间件：offset(8), flip(), shift({ padding: 8 })
- 自动更新：使用 `autoUpdate` 监听滚动和尺寸变化

**定位策略：**
- 空间不足时自动翻转到上方
- 保持在视口内，避免被遮挡

### 4.4 扩展配置优化

**addOptions 简化原则：** 只在需要提供有意义的默认值时才定义

**示例：**
- Mention 扩展：保留 `addOptions()`，返回 `{ items: [], char: '@' }`
- Template 扩展：移除 `addOptions()`（返回空对象没有意义）

**配置项默认值处理：**
- 在类型定义中标记为可选（`allowSpaces?: boolean`）
- 在使用时提供默认值（`this.options.allowSpaces || false`）

**用户配置合并：** Tiptap 内部自动合并 `addOptions()` 返回值和 `.configure()` 参数


---

## 五、插槽系统

### 5.1 主容器布局分发

实现文件：`index.vue`

**实现方式：**
- 根据 `context.mode.value` 分发到 SingleLineLayout 或 MultiLineLayout
- 使用 `v-if="$slots.xxx"` 检查插槽是否存在
- 透传所有插槽到对应的布局组件

**设计要点：**
- 主容器是纯哑组件，只负责布局分发
- 不包含任何业务逻辑
- 所有逻辑在 useChatInputCore 中处理

### 5.2 SingleLineLayout

实现文件：`components/layouts/SingleLineLayout.vue`

**布局结构：**
```
header (可选)
main
  ├─ prefix (可选)
  ├─ editor-wrapper
  │  └─ content 插槽（默认：EditorContent）
  └─ actions-inline (可选，默认：chat-input-actions 提供的默认按钮)
```

**插槽处理：**
- header: 条件渲染
- prefix: 条件渲染
- content: 提供 editor 作用域，默认 EditorContent
- actions-inline: 条件渲染，默认使用 chat-input-actions 包的按钮组

### 5.3 MultiLineLayout

实现文件：`components/layouts/MultiLineLayout.vue`

**布局结构：**
```
header (可选)
main
  ├─ prefix (可选)
  └─ editor-wrapper
     └─ content 插槽（默认：EditorContent）
footer
  ├─ footer-left (footer 插槽)
  └─ footer-right (footer-right 插槽，默认：DefaultRight)
```

**与单行模式的区别：**
- 没有 actions-inline 插槽
- 增加 Footer 组件

### 5.4 Footer 组件

实现文件：`components/footer/index.vue`

**布局：** 左右两栏，使用 flexbox，justify-content: space-between

**左侧：** footer 插槽（始终渲染区域）

**右侧：** footer-right 插槽（默认：chat-input-actions 包提供的默认右侧内容）


### 5.5 默认右侧内容

**说明：** 默认右侧内容通过 chat-input-actions 包提供

**包含组件：**
- WordCounter（条件：showWordLimit && maxLength）
- ClearButton（条件：clearable）
- SubmitButton（始终显示）

**布局：** 使用 flexbox，gap 间距

### 5.6 插槽渲染决策

**实现方式：** 使用 Vue 的 `v-if="$slots.xxx"` 检查插槽是否存在

**决策逻辑：**
- header: 有插槽就渲染
- prefix: 有插槽就渲染
- content: 有插槽用插槽，否则用 EditorContent
- actions-inline (单行): 有插槽用插槽，否则用 chat-input-actions 的默认按钮
- footer: 始终渲染区域（即使插槽为空）
- footer-right: 有插槽用插槽，否则用 chat-input-actions 的 DefaultRight

---

## 六、核心 Composables

### 6.1 useChatInputCore

实现文件：`composables/useChatInputCore.ts`

**职责：** 统一管理所有 Hook 的初始化顺序，解决循环依赖，自动组装 Context

**初始化顺序：**
1. useEditor（必须最先）
2. 计算基础状态（hasContent, canSubmit 等）
3. 定义 submit 方法（必须在键盘处理器之前）
4. useModeSwitch
5. useKeyboardShortcuts
6. 动态注入键盘处理器到编辑器
7. useAutoSize
8. 监听内容变化检查溢出
9. 定义其他方法
10. 组装 Context 并 provide
11. 返回 context 和 expose

**关键实现：**
- submit 方法中根据扩展类型提取结构化数据（Template 或 Mention）
- 使用 `watch(editor, ...)` 动态注入键盘处理器
- 键盘处理器中先检查插件状态，再处理快捷键
- 单行模式下换行键先切换模式，再执行换行


### 6.2 useEditor

实现文件：`composables/useEditor.ts`

**职责：** 初始化和管理 Tiptap 编辑器

**扩展构建：**
- 基础扩展：Document, Paragraph, Text, History, Placeholder, CharacterCount
- 用户扩展：合并 `props.extensions`

**响应式 placeholder：** 使用 `toRef(props, 'placeholder')`，监听变化强制更新视图

**粘贴处理：** 在 `editorProps.handlePaste` 中只粘贴纯文本，单行模式替换换行符

**双向绑定：**
- onUpdate: emit('update:modelValue', text)
- watch modelValue: setContent(newValue)

**生命周期：** onBeforeUnmount 中销毁编辑器

### 6.3 useModeSwitch

实现文件：`composables/useModeSwitch.ts`

**职责：** 管理单行/多行模式的自动和手动切换

**状态：**
- currentMode: 当前模式
- isAutoSwitching: 是否正在自动切换
- initialMode: 初始模式（用于判断是否允许自动切换）

**checkOverflow 实现：**
- 只在 initialMode 为 'single' 时才自动切换
- 使用 `scrollWidth > clientWidth` 检测溢出
- 单行模式溢出 → 切换到多行
- 多行模式清空文本 → 切换回单行

**setMode 实现：**
- 设置 isAutoSwitching = true
- 更新 currentMode
- 聚焦编辑器
- 300ms 后设置 isAutoSwitching = false

**ResizeObserver：** 使用 `useResizeObserver` 监听容器尺寸变化，触发 checkOverflow

### 6.4 useAutoSize

实现文件：`composables/useAutoSize.ts`

**职责：** 根据 autoSize 配置自动调整编辑器高度

**实现方式：**
- 监听 mode 变化
- 只在多行模式下生效
- 使用 ResizeObserver 监听编辑器内容高度
- 根据 minRows 和 maxRows 计算并设置高度

**计算逻辑：**
- 获取单行高度（lineHeight）
- minHeight = minRows * lineHeight
- maxHeight = maxRows * lineHeight
- 设置 CSS 变量或直接设置样式


### 6.5 useKeyboardShortcuts

实现文件：`composables/useKeyboardShortcuts.ts`

**职责：** 管理键盘快捷键

**返回方法：**
- checkSubmitShortcut(event): 检查是否为提交快捷键
- checkNewlineShortcut(event): 检查是否为换行快捷键

**提交快捷键映射：**
- submitType === 'enter': Enter 键
- submitType === 'ctrlEnter': Ctrl+Enter
- submitType === 'shiftEnter': Shift+Enter

**换行快捷键：**
- submitType !== 'shiftEnter': Shift+Enter 触发换行
- 其他情况：Enter 触发换行

**注意：** 实际的键盘处理在 useChatInputCore 中动态注入到编辑器

### 6.6 useSlotScope

实现文件：`composables/useSlotScope.ts`

**职责：** 提供插槽作用域数据

**返回数据：**
- editor: 编辑器实例
- 其他需要传递给插槽的数据

**使用场景：** content 插槽需要访问 editor 实例

---

## 七、原子组件

### 7.1 设计模式

**核心原则：**
- 通过 `useChatInputContext()` 注入 Context
- 最小化 Props（大部分状态从 Context 获取）
- 独立可复用（可在 chat-input 外部使用）

**通用模式：**
```typescript
const context = useChatInputContext()
const { canSubmit, submit } = context
```

### 7.2 EditorContent

实现文件：`components/editor-content/index.vue`

**职责：** 渲染 Tiptap 编辑器内容

**实现：** 使用 Tiptap 的 `<EditorContent :editor="context.editor.value" />`

**样式：** 处理编辑器基础样式、滚动条样式


### 7.3 SubmitButton

**说明：** 提交按钮不是独立组件，而是通过 chat-input-actions 包提供

**依赖 Context：** canSubmit, loading, submit, defaultActions

**禁用条件：** `!canSubmit || defaultActions.submit?.disabled`

**显示状态：**
- loading === true: 显示停止图标
- loading === false: 显示提交图标

**点击事件：** 调用 `context.submit()`

### 7.4 ClearButton

**说明：** 清空按钮通过 chat-input-actions 包提供

**依赖 Context：** hasContent, clearable, clear, defaultActions

**显示条件：** `clearable && hasContent && !defaultActions.clear?.disabled`

**点击事件：** 调用 `context.clear()`

### 7.5 WordCounter

**说明：** 字数统计通过 chat-input-actions 包提供

**依赖 Context：** characterCount, maxLength, isOverLimit

**显示条件：** `showWordLimit && maxLength`

**显示格式：** `{characterCount}/{maxLength}`

**样式：** isOverLimit 为 true 时添加错误样式

---

## 八、样式系统

### 8.1 CSS 变量

定义文件：`index.less`

**变量命名规范：** `--tr-chat-input-{component}-{property}-{state}`

**核心变量分类：**
- 基础颜色：bg-color, text-color, placeholder-color, border-color
- 尺寸：font-size, line-height, min-height, border-radius
- 间距：padding, gap, footer-gap
- 按钮：button-size, button-hover-bg, button-active-bg
- 字数限制：word-limit-color, word-limit-error-color
- 模板块：template-bg, template-color, template-border-radius
- 动画：transition-duration


### 8.2 紧凑模式

**实现方式：** 通过 `size` prop 控制，应用 `.tr-chat-input--small` 类

**变量覆盖：**
- 减小 font-size, line-height, min-height
- 减小 border-radius, padding
- 减小 button-size

### 8.3 暗色模式

暗色模式通过全局 CSS 变量系统自动适配，无需单独配置。

### 8.4 BEM 命名

**块：** `.tr-chat-input`

**元素：** `.tr-chat-input-header`, `.tr-chat-input-main`, `.tr-chat-input-footer` 等

**修饰符：** `.tr-chat-input--single`, `.tr-chat-input--multiple`, `.tr-chat-input--small`

**状态类：** `.is-auto-switching`, `.is-over-limit`, `.is-disabled`

---

## 九、类型系统

### 9.1 类型文件组织

**主类型文件：** `index.type.ts` - 导出所有公开类型

**分类文件：** `types/` 目录
- `base.ts` - 基础类型（InputMode, ComponentSize 等）
- `context.ts` - Context 类型（ChatInputContext）
- `components.ts` - 组件 Props 和 Emits 类型
- `composables.ts` - Composable 返回类型
- `slots.ts` - 插槽作用域类型

### 9.2 核心类型

**ChatInputProps：** 组件 Props 类型
- modelValue, placeholder, mode, size
- maxLength, showWordLimit, clearable
- submitType, loading, disabled
- extensions, autoSize, defaultActions 等

**ChatInputEmits：** 组件 Emits 类型
- 'update:modelValue', 'submit', 'clear', 'cancel'
- 'focus', 'blur'

**ChatInputContext：** Context 类型（见第三章）

**StructuredData：** 结构化数据类型（Template 或 Mention）


### 9.3 Tiptap 类型扩展

**Commands 接口扩展：**

在 `extensions/template/types.ts` 和 `extensions/mention/types.ts` 中：

```typescript
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    template: {
      setTemplateData: (items: TemplateItem[]) => ReturnType
      insertTemplate: (attrs: Partial<TemplateAttrs>) => ReturnType
      // ...
    }
    mention: {
      insertMention: (attrs: Partial<MentionAttrs>) => ReturnType
      deleteMention: (id: string) => ReturnType
    }
  }
}
```

**作用：** 使 TypeScript 能够识别自定义命令，提供类型提示

---

## 十、关键实现细节

### 10.1 循环依赖解决

**问题：** submit 方法需要在键盘处理器中调用，但键盘处理器需要在编辑器初始化后注入

**解决方案：**
1. 在 useChatInputCore 中先定义 submit 方法
2. 再初始化 useKeyboardShortcuts
3. 使用 `watch(editor, ...)` 动态注入键盘处理器
4. 键盘处理器中直接调用 submit（此时已定义）

### 10.2 插件优先级

**问题：** 键盘快捷键可能与插件冲突（如 Mention 的上下箭头）

**解决方案：**
在键盘处理器中先检查插件状态：
```typescript
const mentionState = MentionPluginKey.getState(view.state)
const suggestionState = SuggestionPluginKey.getState(view.state)

if (mentionState?.active || suggestionState?.active) {
  return false  // 让插件处理
}
```

### 10.3 模式切换时的换行

**问题：** 单行模式下按换行键需要先切换到多行，再执行换行

**解决方案：**
```typescript
if (currentMode.value === 'single') {
  setMode('multiple')
  setTimeout(() => {
    editorInstance.commands.splitBlock()
    editorInstance.commands.focus()
  }, 0)
}
```

使用 setTimeout 确保模式切换完成后再执行换行


### 10.4 响应式 placeholder

**问题：** placeholder 需要支持动态更新

**解决方案：**
1. 使用 `toRef(props, 'placeholder')` 保持响应式
2. 在 Placeholder 扩展中使用函数返回：`placeholder: () => placeholderRef.value`
3. 监听 placeholder 变化，强制更新视图（dispatch 空事务）

### 10.5 零宽字符与文本节点

**问题：** 零宽字符可能被合并到文本节点，导致难以管理

**解决方案：**
- 只在模板块和模板块之间插入零宽字符
- 模板块和普通文本之间不插入零宽字符
- 在 appendTransaction 中统一管理零宽字符

### 10.6 粘贴处理

**问题：** 粘贴内容可能破坏文档结构

**解决方案：**
1. 检查粘贴内容类型（HTML 或纯文本）
2. 如果是模板块 HTML，让 Tiptap 默认处理
3. 如果是纯文本，自定义处理：
   - 移除光标周围的零宽字符
   - 多行文本创建段落节点
   - 设置光标位置

### 10.7 结构化数据提取

**实现位置：** `useChatInputCore.ts` 的 submit 方法

**逻辑：**
1. 检查编辑器中是否有 Template 扩展
   - 有：使用 `getTemplateStructuredData()` 和 `getTextWithTemplates()`
2. 否则检查是否有 Mention 扩展
   - 有：使用 `getMentionStructuredData()` 和 `getTextWithMentions()`
3. 都没有：使用 `editor.getText()`

**工具函数位置：** `extensions/template/utils.ts` 和 `extensions/mention/utils.ts`

### 10.8 自动高度调整

**实现方式：**
- 使用 ResizeObserver 监听编辑器内容高度变化
- 根据 autoSize.minRows 和 maxRows 计算限制
- 设置编辑器的 min-height 和 max-height
- 只在多行模式下生效

### 10.9 溢出检测

**实现方式：**
- 使用 `scrollWidth > clientWidth` 检测水平溢出
- 使用 ResizeObserver 监听容器尺寸变化
- 使用 requestAnimationFrame 避免频繁触发
- 只在 initialMode 为 'single' 时才自动切换


### 10.10 避免失焦问题

**问题：** 点击建议列表项时编辑器失焦

**解决方案：**
- 使用 `<button>` 元素而不是 `<div>`
- 设置 `type="button"` 避免表单提交
- 重置按钮默认样式（border, background, padding 等）

---

## 十一、性能优化

### 11.1 响应式数据优化

**策略：**
- 使用 `computed` 而不是 `watch` 计算派生状态
- 使用 `toRef` 包装 props 避免不必要的响应式转换
- 大数据使用 `shallowRef` 或 `shallowReactive`

### 11.2 事件监听优化

**策略：**
- 使用 `useResizeObserver` 而不是手动添加监听器
- 使用 `requestAnimationFrame` 节流频繁操作
- 在组件销毁时清理监听器

### 11.3 渲染优化

**策略：**
- 使用 `v-if` 而不是 `v-show` 条件渲染插槽
- 避免在模板中使用复杂计算
- 使用 `v-once` 渲染静态内容

### 11.4 零宽字符处理优化

**策略：**
- 只在 `docChanged` 时处理零宽字符
- 从后往前处理，避免位置偏移
- 批量处理，减少事务次数

---

## 十二、边界情况处理

### 12.1 空内容处理

**场景：** 编辑器内容为空

**处理：**
- hasContent 返回 false
- canSubmit 返回 false
- 显示 placeholder
- 清空按钮隐藏

### 12.2 超出字数限制

**场景：** characterCount > maxLength

**处理：**
- isOverLimit 返回 true
- canSubmit 返回 false
- WordCounter 显示错误样式
- 仍然允许输入（不强制阻止）


### 12.3 连续操作处理

**场景：** 用户快速连续操作（如快速输入、删除）

**处理：**
- 使用 Tiptap 的事务系统保证操作原子性
- 使用 `appendTransaction` 在事务完成后统一处理
- 避免在操作过程中修改文档

### 12.4 模板块边界情况

**场景：** 空模板块、连续模板块、模板块在段落边界

**处理：** 详见 [design-template.md](./design-template.md) 和 [design-template-delete-logic.md](./design-template-delete-logic.md)

### 12.5 Mention 触发误判

**场景：** 用户输入 @ 但不是想触发 mention

**处理：**
- 不允许 @ 后面有空格（`!allowSpaces && query.includes(' ')`）
- 按 Esc 关闭建议面板
- 继续输入普通文本

---

## 十三、浏览器兼容性

### 13.1 contenteditable 兼容

**策略：**
- 使用 Tiptap 处理大部分兼容性问题
- Tiptap 基于 ProseMirror，已处理主流浏览器差异
- 避免直接操作 contenteditable

### 13.2 输入法兼容

**策略：**
- Tiptap 原生支持输入法
- 不在 composition 期间处理键盘事件
- 零宽字符不影响输入法输入

### 13.3 Shadow DOM 兼容

**策略：**
- Tiptap 支持 Shadow DOM
- 样式使用 CSS 变量，可穿透 Shadow DOM
- 弹窗定位使用 Floating UI，支持 Shadow DOM

---

## 十四、测试策略

### 14.1 单元测试

**测试对象：**
- Composables（useChatInputCore, useEditor 等）
- 扩展工具函数（extensions/template/utils.ts, extensions/mention/utils.ts 等）
- 类型定义

**测试工具：** Vitest

**测试重点：**
- 状态计算逻辑
- 方法调用结果
- 边界情况处理


### 14.2 组件测试

**测试对象：**
- 原子组件（SubmitButton, ClearButton 等）
- 布局组件（SingleLineLayout, MultiLineLayout 等）
- 主容器组件（index.vue）

**测试工具：** Vitest + @vue/test-utils

**测试重点：**
- 组件渲染
- 用户交互（点击、输入）
- 事件触发
- 插槽渲染

### 14.3 集成测试

**测试对象：** 完整的使用场景

**测试场景：**
- 基础输入和提交
- 模板块编辑
- Mention 选择
- 模式切换
- 键盘快捷键

**测试工具：** Vitest + @vue/test-utils 或 Playwright

---

## 十五、最佳实践与经验

### 15.1 设计模式应用

**组合优于配置：**
- 使用插槽而不是布尔 props 控制渲染
- footer 插槽就是左侧区域（最常用场景）
- footer-right 完全覆盖右侧（预留场景）

**哑容器 + 聪明子组件：**
- 主容器只负责布局分发
- 所有逻辑在 useChatInputCore 中
- 子组件通过 inject 获取状态

**Context 共享：**
- 避免 props drilling
- 统一的状态管理
- 方便子组件访问

### 15.2 代码组织经验

**文件拆分原则：**
- 单一职责：每个文件只负责一个功能
- 合理大小：文件不超过 500 行
- 清晰命名：文件名反映功能

**职责划分：**
- Composables：可复用的逻辑
- Components：可复用的视图
- Extensions：编辑器扩展
- Utils：纯函数工具

**依赖管理：**
- 避免循环依赖
- 统一在 useChatInputCore 中管理初始化顺序
- 使用 Context 解耦组件


### 15.3 常见问题与解决方案

**问题1：光标定位不准确**
- 原因：零宽字符管理不当
- 解决：使用 appendTransaction 统一管理零宽字符

**问题2：删除操作破坏结构**
- 原因：ProseMirror 默认行为
- 解决：在键盘插件中拦截并自定义处理

**问题3：粘贴内容格式错误**
- 原因：粘贴 HTML 包含不需要的格式
- 解决：只粘贴纯文本，自定义多行处理

**问题4：编辑器失焦**
- 原因：点击外部元素导致失焦
- 解决：使用 button 元素，设置 type="button"

**问题5：模式切换时内容丢失**
- 原因：切换过程中编辑器状态不一致
- 解决：使用 isAutoSwitching 标记，延迟操作

**问题6：键盘快捷键冲突**
- 原因：插件和快捷键同时处理
- 解决：先检查插件状态，再处理快捷键

**问题7：响应式数据不更新**
- 原因：使用了非响应式的值
- 解决：使用 computed 或 toRef 包装

**问题8：性能问题**
- 原因：频繁的 DOM 操作或计算
- 解决：使用 requestAnimationFrame 节流，使用 computed 缓存

---

## 十六、文件索引

### 16.1 核心文件

- `index.vue` - 主容器组件
- `index.ts` - 导出入口
- `index.type.ts` - 类型定义
- `index.less` - 样式

### 16.2 Composables

- `composables/useChatInputCore.ts` - 核心逻辑聚合
- `composables/useEditor.ts` - 编辑器初始化
- `composables/useModeSwitch.ts` - 模式切换
- `composables/useAutoSize.ts` - 自动高度
- `composables/useKeyboardShortcuts.ts` - 键盘快捷键
- `composables/useSlotScope.ts` - 插槽作用域

### 16.3 Context

- `context/index.ts` - Context 注入方法
- `context/types.ts` - Context 类型导出

### 16.4 Extensions

- `extensions/template/extension.ts` - Template 扩展定义
- `extensions/template/plugins.ts` - Template 插件（零宽字符、键盘、粘贴）
- `extensions/template/commands.ts` - Template 命令
- `extensions/template/utils.ts` - Template 工具函数
- `extensions/mention/extension.ts` - Mention 扩展定义
- `extensions/mention/plugin.ts` - Mention Suggestion 插件
- `extensions/mention/commands.ts` - Mention 命令
- `extensions/mention/utils.ts` - Mention 工具函数


### 16.5 Components

- `components/layouts/SingleLineLayout.vue` - 单行布局
- `components/layouts/MultiLineLayout.vue` - 多行布局
- `components/editor-content/index.vue` - 编辑器内容
- `components/footer/index.vue` - 底部容器

### 16.6 Types

- `types/base.ts` - 基础类型
- `types/context.ts` - Context 类型
- `types/components.ts` - 组件类型
- `types/composables.ts` - Composable 类型
- `types/slots.ts` - 插槽类型

---

## 十七、总结

### 17.1 核心实现特点

**架构清晰：**
- 四层架构：表现层、逻辑层、扩展层、组件层
- 职责明确：每层只负责自己的事情
- 解耦良好：通过 Context 和插槽解耦

**代码精简：**
- Template 扩展代码量减少 60-70%（相比原生实现）
- 使用 Tiptap 处理大部分编辑器逻辑
- 避免重复造轮子

**易于扩展：**
- 插槽系统灵活
- Tiptap 扩展机制强大
- Context 易于添加新功能

**类型安全：**
- 完整的 TypeScript 类型定义
- Tiptap Commands 接口扩展
- 编译时类型检查

### 17.2 关键技术点

1. **useChatInputCore 统一管理**：解决循环依赖，统一初始化顺序
2. **零宽字符管理**：保证模板块光标定位准确
3. **键盘导航插件**：处理复杂的光标移动和删除逻辑
4. **动态注入键盘处理器**：避免二次初始化，支持插件优先级
5. **Floating UI 弹窗定位**：精确定位，自动处理边界
6. **响应式 placeholder**：支持动态更新
7. **模式自动切换**：基于溢出检测
8. **结构化数据提取**：支持 Template 和 Mention 两种场景

### 17.3 设计亮点

1. **组合优于配置**：通过插槽而不是布尔 props 控制渲染
2. **哑容器 + 聪明子组件**：主容器只负责布局，逻辑在 Hook 中
3. **Context 共享**：避免 props drilling，统一状态管理
4. **底部插槽优化**：footer 就是左侧（最常用），footer-right 完全覆盖（预留）
5. **扩展配置优化**：只在需要时定义 addOptions，使用时提供默认值