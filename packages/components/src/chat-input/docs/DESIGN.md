# Chat-Input 组件设计文档

> 本文档说明 Chat-Input 组件的设计思想、架构设计和 API 定义。
> 
> **相关文档：**
> - [IMPLEMENTATION.md](./IMPLEMENTATION.md) - 具体实现方式
> - [design-template.md](./design-template.md) - 模板功能详细设计
> - [design-mention.md](./design-mention.md) - Mention 功能详细设计

---

## 一、设计概述

### 1.1 设计哲学

Chat-Input 基于 **"组合优于配置"** 的核心设计哲学，采用 Tiptap 编辑器作为底层实现。

**核心原则：**
- **拒绝布尔值地狱**：避免使用大量布尔 props 控制渲染
- **插槽优先**：组件结构由使用者通过插槽定义
- **哑容器 + 聪明子组件**：主容器提供结构和状态，子组件独立可复用
- **Context 共享**：使用 provide/inject 避免 props drilling

### 1.2 组件定位

Chat-Input 是 Sender 组件的重构版本，主要改进：
- 使用 Tiptap 替代原生 contenteditable（代码量减少 60-70%）
- 更清晰的插槽系统
- 更好的模板编辑体验
- 更强的扩展性

### 1.3 技术栈

- **编辑器核心**：Tiptap 3.x (基于 ProseMirror)
- **框架**：Vue 3 Composition API
- **类型**：TypeScript
- **样式**：Less + CSS Variables

---

## 二、架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────────────────┐
│                  index.vue                          │
│              (主容器 - 哑组件)                       │
│  ┌───────────────────────────────────────────────┐  │
│  │  useChatInputCore()                           │  │
│  │  - 统一管理所有 Hook 初始化                   │  │
│  │  - 自动组装 Context                           │  │
│  │  - 暴露方法给父组件                           │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  布局分发                                     │  │
│  │  - SingleLineLayout (单行模式)                │  │
│  │  - MultiLineLayout (多行模式)                 │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                        ↓ inject
┌─────────────────────────────────────────────────────┐
│              原子子组件                              │
│  - EditorContent, SubmitButton, ClearButton         │
│  - WordCounter, 布局组件                            │
└─────────────────────────────────────────────────────┘
```

### 2.2 四层架构

**表现层** (index.vue)
- 根据 mode 分发到不同布局组件
- 透传所有插槽
- 应用样式类

**逻辑层** (useChatInputCore)
- 统一管理所有 Hook 的初始化顺序
- 解决循环依赖问题
- 自动组装 Context 和 Expose

**扩展层** (extensions/)
- Template: 模板块节点 + 3个插件
- Mention: 提及节点 + Suggestion 插件
- Suggestion: 输入联想扩展

**组件层** (components/)
- 原子组件：通过 inject 获取 Context
- 布局组件：管理插槽和结构

---

## 三、目录结构设计

### 3.1 完整目录树

```
packages/components/src/chat-input/
├── index.ts                          # 导出入口
├── index.vue                         # 主容器组件
├── index.type.ts                     # 类型定义
├── index.less                        # 容器样式
├── README.md                         # 使用文档
│
├── docs/                             # 文档目录
│   ├── DESIGN.md                     # 设计文档
│   ├── IMPLEMENTATION.md             # 实现文档
│   ├── design-template.md            # 模板功能设计
│   ├── design-mention.md             # Mention 功能设计
│   └── design-suggestion.md          # Suggestion 功能设计
│
├── context/                          # Context 定义
│   ├── index.ts                      # ChatInputContext 定义和实现
│   └── types.ts                      # Context 相关类型
│
├── types/                            # 类型定义
│   ├── base.ts                       # 基础类型
│   ├── components.ts                 # 组件类型
│   ├── composables.ts                # Composables 类型
│   ├── context.ts                    # Context 类型
│   └── slots.ts                      # 插槽类型
│
├── extensions/                       # Tiptap 扩展
│   ├── index.ts                      # 扩展导出
│   │
│   ├── template/                     # 模板块扩展
│   │   ├── index.ts                  # 导出
│   │   ├── extension.ts              # 扩展定义
│   │   ├── commands.ts               # 命令定义
│   │   ├── plugins.ts                # 插件定义
│   │   ├── template-block-view.vue   # 视图组件
│   │   ├── types.ts                  # 类型定义
│   │   ├── utils.ts                  # 工具函数
│   │   └── index.less                # 样式
│   │
│   ├── mention/                      # Mention 扩展
│   │   ├── index.ts                  # 导出
│   │   ├── extension.ts              # 扩展定义
│   │   ├── commands.ts               # 命令定义
│   │   ├── plugin.ts                 # 插件定义
│   │   ├── components/               # 组件目录
│   │   ├── types.ts                  # 类型定义
│   │   ├── utils.ts                  # 工具函数
│   │   └── index.less                # 样式
│   │
│   ├── suggestion/                   # Suggestion 扩展
│   │   ├── index.ts                  # 导出
│   │   ├── extension.ts              # 扩展定义
│   │   ├── plugin.ts                 # 插件定义
│   │   ├── suggestion-list.vue       # 列表组件
│   │   ├── types.ts                  # 类型定义
│   │   ├── utils/                    # 工具函数
│   │   └── index.less                # 样式
│   │
│   └── utils/                        # 扩展工具函数
│       ├── index.ts                  # 导出
│       ├── id-generator.ts           # ID 生成器
│       └── position.ts               # 位置计算
│
├── components/                       # 原子子组件
│   ├── editor-content/               # 编辑器内容区
│   │   └── index.vue
│   │
│   ├── footer/                       # 底部容器
│   │   └── index.vue
│   │
│   └── layouts/                      # 布局组件
│       ├── SingleLineLayout.vue      # 单行布局
│       └── MultiLineLayout.vue       # 多行布局
│
└── composables/                      # 组合式函数
    ├── index.ts                      # 导出
    ├── useChatInputCore.ts           # 核心逻辑
    ├── useEditor.ts                  # 编辑器初始化
    ├── useModeSwitch.ts              # 模式切换
    ├── useAutoSize.ts                # 自动高度
    ├── useKeyboardShortcuts.ts       # 键盘快捷键
    └── useSlotScope.ts               # 插槽作用域
```

### 3.2 目录职责说明

**根目录文件：**
- `index.ts`: 组件导出
- `index.vue`: 主容器组件，负责布局分发和 Context 提供
- `index.type.ts`: 公开的类型定义
- `index.less`: 主容器样式和 CSS 变量定义

**docs/：** 文档目录
- 设计文档、实现文档、功能设计文档

**context/：** Context 相关
- ChatInputContext 接口定义
- provide/inject 实现
- 全局状态和方法管理

**types/：** 类型定义
- 按模块拆分的类型定义
- 基础类型、组件类型、Context 类型等

**extensions/：** Tiptap 扩展
- 每个扩展独立目录
- 包含扩展定义、命令、插件、视图组件、类型、样式
- 扩展之间相互独立，通过 extensions/index.ts 统一导出

**components/：** 原子组件
- editor-content: 编辑器内容区
- footer: 底部容器
- layouts: 单行/多行布局组件

**composables/：** 组合式函数
- 封装可复用的逻辑
- 返回响应式状态和方法
- 通过 composables/index.ts 统一导出

---

## 四、插槽系统设计

### 4.1 插槽层次结构

```
chat-input 组件结构：
┌─────────────────────────────────────────────────────┐
│ header 插槽 (可选)                                   │
│ - 完全自定义顶部区域                                 │
│ - 用于标题、提示等                                   │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│ 输入行                                               │
│ ┌─────────┬───────────────────────┬────────────────┐│
│ │ prefix  │ content (编辑器)       │ actions-inline ││
│ │ 插槽    │ 插槽                   │ 插槽 (单行)    ││
│ │ (可选)  │ (默认: EditorContent)  │ (可选)         ││
│ └─────────┴───────────────────────┴────────────────┘│
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│ 底部区域 (多行模式)                                  │
│ ┌──────────────────────┬────────────────────────────┐│
│ │ footer 插槽          │ footer-right 插槽          ││
│ │ (左侧自定义)         │ (右侧自定义，可选)         ││
│ │                      │                            ││
│ │                      │ 默认右侧内容：             ││
│ │                      │ - WordCounter              ││
│ │                      │ - DefaultActions           ││
│ └──────────────────────┴────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

### 4.2 插槽详细说明

#### 4.2.1 header 插槽

**位置：** 组件顶部
**用途：** 自定义头部区域
**使用场景：**
- 显示对话标题
- 显示提示信息
- 显示状态指示器

**作用域插槽参数：** 无

**渲染条件：** 当提供 header 插槽时渲染

#### 4.2.2 prefix 插槽

**位置：** 输入框左侧
**用途：** 输入框前缀内容
**使用场景：**
- 显示图标
- 显示标签
- 显示用户头像

**作用域插槽参数：** 无

**渲染条件：** 当提供 prefix 插槽时渲染

#### 4.2.3 content 插槽

**位置：** 输入框主体区域
**用途：** 完全自定义编辑器内容
**使用场景：**
- 替换默认的 EditorContent
- 使用自定义编辑器
- 特殊的输入场景

**作用域插槽参数：**
```typescript
{
  editor: Editor | null  // Tiptap 编辑器实例
}
```

**渲染条件：** 
- 如果提供 content 插槽，使用插槽内容
- 否则使用默认的 EditorContent 组件

**注意事项：**
- 使用此插槽会完全替换编辑器
- 需要自行处理编辑器的渲染和交互
- 很少使用，大部分场景使用默认即可

#### 4.2.4 actions-inline 插槽

**位置：** 输入框右侧（单行模式）
**用途：** 单行模式下的操作按钮区域
**使用场景：**
- 自定义单行模式的按钮布局
- 添加额外的操作按钮

**作用域插槽参数：** 无

**渲染条件：** 
- 仅在 mode === 'single' 时渲染
- 如果提供插槽，使用插槽内容
- 否则使用默认的按钮组

**默认内容：**
```
[ClearButton] [SubmitButton]
```

#### 4.2.5 footer 插槽

**位置：** 底部左侧（多行模式）
**用途：** 多行模式下的左侧自定义区域
**使用场景：**
- 添加自定义按钮（深度思考、表情等）
- 显示提示信息
- 显示快捷键说明

**作用域插槽参数：** 无

**渲染条件：** 
- 仅在 mode === 'multiple' 时渲染
- 始终渲染此区域（即使插槽为空）

**注意事项：**
- 这是最常用的插槽（90% 的使用场景）
- 内容会自动左对齐
- 与右侧内容之间有自动间距

#### 4.2.6 footer-right 插槽

**位置：** 底部右侧（多行模式）
**用途：** 完全自定义右侧区域
**使用场景：**
- 完全自定义右侧布局
- 替换默认的字数限制和按钮组
- 特殊的业务需求

**作用域插槽参数：** 无

**渲染条件：** 
- 仅在 mode === 'multiple' 时渲染
- 如果提供插槽，完全覆盖右侧默认内容
- 否则显示默认右侧内容

**默认内容：**
```
[WordCounter] [ClearButton] [SubmitButton]
```

**注意事项：**
- 使用此插槽会完全替换右侧所有默认内容
- 需要自行实现字数限制和按钮
- 很少使用（约 5% 的场景）

### 4.3 插槽使用优先级


**单行模式：**
```
actions-inline 插槽 > 默认按钮组
```

**多行模式底部：**
```
footer-right 插槽 > 默认右侧内容 (WordCounter + DefaultActions)
footer 插槽始终渲染（即使为空）
```

### 4.4 插槽渲染决策树

```
渲染 header 区域：
└─ 是否有 header 插槽？
   ├─ 是 → 渲染 header 插槽
   └─ 否 → 不渲染

渲染输入行：
├─ 是否有 prefix 插槽？
│  ├─ 是 → 渲染 prefix 插槽
│  └─ 否 → 不渲染
│
├─ 是否有 content 插槽？
│  ├─ 是 → 渲染 content 插槽
│  └─ 否 → 渲染默认 EditorContent
│
└─ 是否单行模式？
   ├─ 是 → 渲染 actions-inline 区域
   │       └─ 是否有 actions-inline 插槽？
   │          ├─ 是 → 渲染插槽
   │          └─ 否 → 渲染默认按钮组
   └─ 否 → 不渲染

渲染底部区域：
└─ 是否多行模式？
   ├─ 否 → 不渲染
   └─ 是 → 渲染底部
       ├─ 渲染 footer 插槽（左侧）
       └─ 渲染右侧区域
           └─ 是否有 footer-right 插槽？
              ├─ 是 → 渲染 footer-right 插槽
              └─ 否 → 渲染默认右侧内容
                      ├─ WordCounter (条件渲染)
                      └─ DefaultActions
```

---

## 五、Context 设计

### 5.1 Context 职责

ChatInputContext 负责：
1. **状态共享**：在主容器和所有子组件之间共享状态
2. **方法暴露**：提供统一的操作方法
3. **避免 Props Drilling**：子组件无需层层传递 props
4. **解耦组件**：子组件独立，不依赖父组件 props

### 5.2 Context 结构

Context 分为以下几个部分：

#### 5.2.1 编辑器相关

```typescript
// 编辑器实例
editor: Ref<Editor | null>

// 编辑器 DOM 引用
editorRef: Ref<HTMLElement | null>
```

**说明：**
- editor: Tiptap 编辑器实例，用于操作编辑器
- editorRef: 编辑器 DOM 元素引用，用于 DOM 操作

#### 5.2.2 状态相关

```typescript
// 模式状态
mode: Ref<'single' | 'multiple'>

// 组件状态
loading: Ref<boolean>
disabled: Ref<boolean>

// 内容状态
hasContent: Ref<boolean>
canSubmit: Ref<boolean>
isOverLimit: Ref<boolean>

// 字数统计
characterCount: Ref<number>
maxLength: Ref<number | undefined>

// 语音状态
speechState: Ref<SpeechState>
```

**说明：**
- mode: 当前输入模式（单行/多行）
- loading: 加载状态，影响按钮禁用
- disabled: 禁用状态，影响所有交互
- hasContent: 是否有内容，影响清空按钮显示
- canSubmit: 是否可提交，综合判断多个条件
- isOverLimit: 是否超出字数限制
- characterCount: 当前字符数
- maxLength: 最大字符数限制
- speechState: 语音识别状态

#### 5.2.3 配置相关

```typescript
// 显示配置
showWordLimit: Ref<boolean>
clearable: Ref<boolean>
size: Ref<'normal' | 'small'>

// 默认按钮配置
defaultActions: Ref<DefaultActions | undefined>

// 提交配置
submitType: Ref<'enter' | 'ctrlEnter' | 'shiftEnter'>
stopText: Ref<string | undefined>
```

**说明：**
- showWordLimit: 是否显示字数限制
- clearable: 是否显示清空按钮
- size: 组件尺寸（normal/small）
- defaultActions: 默认按钮配置（Submit、Clear）
- submitType: 提交快捷键类型
- stopText: 停止按钮文本

#### 5.2.4 方法相关

```typescript
// 基础操作
submit: () => void
clear: () => void
focus: () => void
blur: () => void

// 内容操作
setContent: (content: string) => void
getContent: () => string

// 语音操作
startSpeech: () => void
stopSpeech: () => void

// 文件操作
openFileDialog: () => void

// 模板操作
insertTemplate: (template: TemplateItem) => void
exitTemplateMode: () => void

// 模式操作
setMode: (mode: 'single' | 'multiple') => void
```

**说明：**
- submit: 提交内容
- clear: 清空内容
- focus: 聚焦编辑器
- blur: 失焦编辑器
- setContent: 设置编辑器内容
- getContent: 获取编辑器内容
- startSpeech: 开始语音识别
- stopSpeech: 停止语音识别
- openFileDialog: 打开文件选择对话框
- insertTemplate: 插入模板块
- exitTemplateMode: 退出模板编辑模式
- setMode: 切换输入模式

### 5.3 Context 使用方式

#### 5.3.1 提供 Context (主容器)

```typescript
伪代码：

在 index.vue 的 setup 中：

// 1. 创建所有状态和方法
const editor = ref<Editor | null>(null)
const mode = ref<'single' | 'multiple'>(props.mode)
// ... 其他状态

const submit = () => { /* 实现 */ }
const clear = () => { /* 实现 */ }
// ... 其他方法

// 2. 组装 Context 对象
const context: ChatInputContext = {
  editor,
  mode,
  loading: toRef(props, 'loading'),
  // ... 其他状态和方法
}

// 3. 提供 Context
provide(CHAT_INPUT_CONTEXT_KEY, context)
```

#### 5.3.2 注入 Context (子组件)

```typescript
伪代码：

在子组件的 setup 中：

// 1. 注入 Context
const context = inject(CHAT_INPUT_CONTEXT_KEY)

// 2. 解构需要的状态和方法
const { canSubmit, submit } = context

// 3. 在模板中使用
<button :disabled="!canSubmit" @click="submit">
  提交
</button>
```

### 5.4 Context 设计原则

1. **只读状态**：子组件只能读取状态，不能直接修改
2. **方法调用**：状态修改通过调用 Context 提供的方法
3. **响应式**：所有状态都是响应式的，自动更新
4. **类型安全**：完整的 TypeScript 类型定义
5. **可选注入**：提供默认值或错误处理

---

## 六、组件层设计

### 6.1 原子组件设计原则


**1. 单一职责**
- 每个组件只做一件事
- 职责清晰，易于理解和维护

**2. 独立可复用**
- 可以在 chat-input 外部独立使用
- 不强依赖 chat-input 的特定结构

**3. 通过 Context 获取状态**
- 使用 inject 获取需要的状态
- 避免 props 层层传递

**4. 最小化 Props**
- 只接收必要的 props
- 大部分状态从 Context 获取

**5. 事件向上传递**
- 通过 emit 向父组件传递事件
- 或调用 Context 提供的方法

### 6.2 核心原子组件

#### 6.2.1 EditorContent

**职责：** 渲染 Tiptap 编辑器内容

**依赖：**
- Context: editor

**Props：** 无

**Emits：** 无

**实现要点：**
- 使用 Tiptap 的 EditorContent 组件
- 从 Context 获取 editor 实例
- 处理编辑器的基础样式

#### 6.2.2 SubmitButton

**职责：** 提交按钮

**依赖：**
- Context: canSubmit, loading, submit, defaultActions

**Props：** 无

**Emits：** 无

**实现要点：**
- 根据 canSubmit 控制禁用状态
- 根据 loading 显示加载状态或停止图标
- 点击时调用 context.submit()
- 支持通过 defaultActions.submit 自定义配置

**状态判断：**
```
按钮禁用条件：
- !canSubmit
- defaultActions.submit?.disabled

按钮显示：
- loading === true: 显示停止图标
- loading === false: 显示提交图标
```

#### 6.2.3 ClearButton

**职责：** 清空按钮

**依赖：**
- Context: hasContent, clearable, clear, defaultActions

**Props：** 无

**Emits：** 无

**实现要点：**
- 根据 hasContent && clearable 控制显示
- 点击时调用 context.clear()
- 支持通过 defaultActions.clear 自定义配置

**显示条件：**
```
显示清空按钮：
- clearable === true
- hasContent === true
- !defaultActions.clear?.disabled
```

#### 6.2.4 VoiceButton

**职责：** 语音输入按钮（通过插槽自定义）

**说明：**
- 语音功能不是内置按钮
- 通过 footer 或 actions-inline 插槽添加
- 使用独立的 VoiceInput 组件实现

#### 6.2.5 FileButton

**职责：** 文件上传按钮（通过插槽自定义）

**说明：**
- 文件上传功能不是内置按钮
- 通过 footer 或 actions-inline 插槽添加
- 使用独立的 FileUpload 组件实现

#### 6.2.6 WordCounter

**职责：** 字数统计显示

**依赖：**
- Context: characterCount, maxLength, isOverLimit

**Props：** 无

**Emits：** 无

**实现要点：**
- 显示格式：`{characterCount}/{maxLength}`
- 超出限制时高亮显示
- 根据 isOverLimit 添加错误样式

**显示逻辑：**
```
显示字数统计：
- showWordLimit === true
- maxLength !== undefined

样式状态：
- isOverLimit === true: 添加 'is-over-limit' 类
- isOverLimit === false: 普通样式
```

#### 6.2.6 SuggestionList

**职责：** 输入联想列表

**依赖：**
- Context: 无（通过 props 传递）

**Props：**
- show: boolean
- suggestions: SuggestionItem[]
- activeIndex: number
- inputValue: string

**Emits：**
- select: (suggestion: string) => void
- mouseEnter: (index: number) => void
- mouseLeave: () => void

**实现要点：**
- 弹窗定位在输入框下方
- 支持键盘导航高亮
- 支持鼠标悬停高亮
- 支持自定义高亮规则

#### 6.2.7 TabIndicator

**职责：** Tab 键提示器

**依赖：**
- Context: 无（通过 props 传递）

**Props：**
- show: boolean

**Emits：** 无

**实现要点：**
- 显示 "TAB" 文字提示
- 仅在有联想内容时显示
- 位置在自动补全文本旁边

### 6.3 复合组件

#### 6.3.1 Footer

**职责：** 底部容器，管理左右布局

**依赖：**
- Context: mode

**Props：** 无

**Slots：**
- footer: 左侧自定义区域
- footer-right: 右侧自定义区域

**实现要点：**
- 仅在 mode === 'multiple' 时渲染
- 左右两栏布局，自动间距
- 右侧默认内容由 DefaultRight 组件提供

**布局结构：**
```
<div class="footer">
  <div class="footer-left">
    <slot name="footer" />
  </div>
  <div class="footer-right">
    <slot name="footer-right">
      <DefaultRight />
    </slot>
  </div>
</div>
```

#### 6.3.2 DefaultRight

**职责：** 默认右侧内容

**依赖：**
- Context: showWordLimit, maxLength

**Props：** 无

**Emits：** 无

**实现要点：**
- 包含 WordCounter 和默认按钮
- 按钮顺序：Clear, Submit
- 自动处理按钮间距

**渲染结构：**
```
<div class="default-right">
  <WordCounter v-if="showWordLimit && maxLength" />
  <div class="action-buttons">
    <ClearButton />
    <SubmitButton />
  </div>
</div>
```

---

## 七、Composables 设计

### 7.1 Composables 设计原则

1. **单一职责**：每个 composable 负责一个特定功能
2. **可组合**：可以在其他 composable 中使用
3. **返回响应式**：返回 ref 或 computed
4. **无副作用**：不直接修改外部状态
5. **可测试**：易于单元测试

### 7.2 核心 Composables

#### 7.2.1 useChatInputContext

**职责：** 获取 ChatInputContext

**参数：** 无

**返回：**
```typescript
ChatInputContext
```

**实现要点：**
- 使用 inject 获取 Context
- 提供类型安全的访问
- 处理 Context 不存在的情况

**错误处理：**
```
如果 Context 不存在：
- 开发环境：抛出错误
- 生产环境：返回默认值或 undefined
```

#### 7.2.2 useEditor

**职责：** 初始化和管理 Tiptap 编辑器

**参数：**
```typescript
{
  props: ChatInputProps
  emit: ChatInputEmits
}
```

**返回：**
```typescript
{
  editor: Ref<Editor | null>
  editorRef: Ref<HTMLElement | null>
}
```

**实现要点：**
- 使用 useEditor 创建编辑器实例
- 配置所有 Tiptap 扩展
- 监听编辑器事件并 emit
- 处理编辑器生命周期

**扩展配置：**
```
必需扩展：
- StarterKit (基础功能)
- Placeholder (占位符)
- CharacterCount (字数统计)

可选扩展：
- Template (模板块)
- SingleLineMode (单行模式)
- Suggestion (输入联想)
```

**事件处理：**
```
onUpdate: emit('update:modelValue', content)
onFocus: emit('focus', event)
onBlur: emit('blur', event)
```

#### 7.2.3 useModeSwitch

**职责：** 管理单行/多行模式切换

**参数：**
```typescript
{
  props: ChatInputProps
  editor: Ref<Editor | null>
}
```

**返回：**
```typescript
{
  currentMode: Ref<'single' | 'multiple'>
  isAutoSwitching: Ref<boolean>
  setMode: (mode: 'single' | 'multiple') => void
  checkOverflow: () => void
}
```

**实现要点：**
- 监听 props.mode 变化
- 检测内容溢出自动切换
- 处理快捷键切换 (Shift+Enter)
- 更新编辑器配置

**自动切换逻辑：**
```
触发条件：
- 单行模式下内容宽度超出容器
- 用户按下 Shift+Enter

切换过程：
1. 设置 isAutoSwitching = true
2. 更新 currentMode
3. 更新编辑器扩展配置
4. 保持光标位置
5. 设置 isAutoSwitching = false
```

#### 7.2.4 useSuggestion

**职责：** 管理输入联想功能

**参数：**
```typescript
{
  suggestions: Ref<SuggestionItem[]>
  inputValue: Ref<string>
  isComposing: Ref<boolean>
  showTemplateEditor: Ref<boolean>
}
```

**返回：**
```typescript
{
  isPopupVisible: Ref<boolean>
  activeSuggestion: Ref<string>
  activeKeyboardIndex: Ref<number>
  activeMouseIndex: Ref<number>
  autoCompleteText: Ref<string>
  showTabIndicator: Ref<boolean>
  applySuggestion: (suggestion: string) => void
  navigateWithKeyboard: (direction: 'up' | 'down') => void
  handleMouseEnter: (index: number) => void
  handleMouseLeave: () => void
  closePopup: () => void
}
```

**实现要点：**
- 根据输入内容过滤建议
- 管理键盘和鼠标交互
- 计算自动补全文本
- 处理 Tab 键选择

**显示逻辑：**
```
显示联想弹窗：
- inputValue 不为空
- suggestions 有匹配项
- !isComposing (非输入法状态)
- !showTemplateEditor (非模板编辑)
```


#### 7.2.5 useTemplateData

**职责：** 管理模板数据转换

**参数：**
```typescript
{
  templateData: Ref<TemplateItem[]>
  editor: Ref<Editor | null>
}
```

**返回：**
```typescript
{
  insertTemplate: (template: TemplateItem) => void
  exitTemplateMode: () => void
  updateTemplateData: (data: TemplateItem[]) => void
}
```

**实现要点：**
- 将用户格式转换为 Tiptap 格式
- 插入模板块到编辑器
- 监听模板变化并同步

#### 7.2.6 useKeyboardShortcuts

**职责：** 管理键盘快捷键

**参数：**
```typescript
{
  submitType: Ref<SubmitTrigger>
  canSubmit: Ref<boolean>
  submit: () => void
  setMode: (mode: 'single' | 'multiple') => void
  // ... 其他操作方法
}
```

**返回：**
```typescript
{
  handleKeyDown: (event: KeyboardEvent) => void
}
```

**实现要点：**
- 根据 submitType 处理提交快捷键
- 处理 Shift+Enter 切换多行
- 处理 Esc 退出模板模式
- 处理 Tab 选择联想

**快捷键映射：**
```
Enter: 
  - submitType === 'enter' → 提交
  - 其他 → 换行

Ctrl+Enter:
  - submitType === 'ctrlEnter' → 提交

Shift+Enter:
  - submitType === 'shiftEnter' → 提交
  - 其他 → 切换多行模式

Tab:
  - 有联想 → 选择联想
  - 无联想 → 默认行为

Esc:
  - 模板模式 → 退出模板
  - 联想显示 → 关闭联想
```

---

## 八、Tiptap 扩展设计

### 8.1 扩展设计原则

1. **独立性**：每个扩展独立，不相互依赖
2. **可配置**：通过 configure 方法配置
3. **类型安全**：完整的 TypeScript 类型
4. **命令扩展**：提供自定义命令
5. **插件集成**：可以集成 ProseMirror 插件

### 8.2 核心扩展

#### 8.2.1 Template

**职责：** 模板块节点

**类型：** Node

**配置：**
```typescript
{
  HTMLAttributes: Record<string, unknown>
}
```

**属性：**
```typescript
{
  id: string
  content: string
  editable: boolean
}
```

**命令：**
```typescript
insertTemplate(attrs: TemplateAttrs): Command
deleteTemplate(id: string): Command
updateTemplate(id: string, content: string): Command
```

**实现要点：**
- 定义为 inline + atom 节点
- 使用 VueNodeViewRenderer 渲染
- 支持编辑和删除
- 处理光标导航

**节点定义：**
```
name: 'template'
group: 'inline'
inline: true
atom: true
selectable: true
draggable: false
```

#### 8.2.2 SingleLineMode

**职责：** 单行模式扩展

**类型：** Extension

**配置：**
```typescript
{
  enabled: boolean
}
```

**实现要点：**
- 禁用 Enter 键换行
- 禁用 HardBreak
- 限制内容为单行
- 处理粘贴时的换行符

**键盘处理：**
```
Enter: 
  - enabled === true → 阻止默认，触发提交
  - enabled === false → 允许换行
```

#### 8.2.3 Suggestion

**职责：** 输入联想扩展

**类型：** Extension

**配置：**
```typescript
{
  suggestions: SuggestionItem[]
  char: string  // 触发字符，默认无
  allowSpaces: boolean
}
```

**实现要点：**
- 使用 ProseMirror 插件实现
- 监听输入变化
- 计算匹配的建议
- 提供选择接口

**插件功能：**
```
- 监听文档变化
- 计算当前输入文本
- 过滤匹配的建议
- 管理弹窗状态
```

#### 8.2.4 CharacterCount

**职责：** 字数统计扩展

**类型：** Extension

**配置：**
```typescript
{
  limit: number | undefined
  mode: 'textSize' | 'nodeSize'
}
```

**存储：**
```typescript
{
  characters: () => number
  words: () => number
}
```

**实现要点：**
- 统计文档字符数
- 支持限制检查
- 提供统计方法
- 实时更新

---

## 九、样式设计

### 9.1 CSS 变量系统

**设计原则：**
1. 所有可定制的样式使用 CSS 变量
2. 变量命名遵循 BEM 规范
3. 通过全局 CSS 变量系统自动适配主题
4. 支持紧凑模式（size="small"）

**变量命名规范：**
```
--tr-chat-input-{component}-{property}-{state}

示例：
--tr-chat-input-bg-color
--tr-chat-input-button-hover-bg
--tr-chat-input-footer-padding
```

### 9.2 核心变量定义

```less
:root {
  // ===== 基础颜色 =====
  --tr-chat-input-bg-color: var(--tr-container-bg-default);
  --tr-chat-input-bg-color-disabled: #f0f0f0;
  --tr-chat-input-text-color: var(--tr-text-primary);
  --tr-chat-input-text-color-disabled: #a0a0a0;
  --tr-chat-input-placeholder-color: var(--tr-text-tertiary);
  --tr-chat-input-placeholder-color-disabled: #c0c0c0;

  // ===== 阴影 =====
  --tr-chat-input-box-shadow: 0 4px 16px 0px rgba(0, 0, 0, 0.08);

  // ===== 尺寸（默认 normal）=====
  --tr-chat-input-font-size: 16px;
  --tr-chat-input-line-height: 26px;
  --tr-chat-input-border-radius: 26px;

  // ===== 间距（默认 normal）=====
  --tr-chat-input-padding: 15px 20px;
  --tr-chat-input-gap: 8px;
  --tr-chat-input-footer-gap: 12px;

  // ===== Header 区域 =====
  --tr-chat-input-header-padding: 12px 20px;
  --tr-chat-input-header-divider-inset: 20px;
  --tr-chat-input-header-border-bottom: 1px solid #e0e0e0;
  --tr-chat-input-multi-main-padding: 16px 20px 12px;

  // ===== Footer 区域 =====
  --tr-chat-input-footer-padding: 0 10px 10px;

  // ===== 前缀和操作区 =====
  --tr-chat-input-prefix-padding-right: 4px;
  --tr-chat-input-actions-padding-right: 10px;

  // ===== 按钮（默认 normal）=====
  --tr-chat-input-button-size: 32px;
  --tr-chat-input-button-size-submit: 36px;
  --tr-chat-input-button-hover-bg: var(--tr-container-bg-hover);
  --tr-chat-input-button-active-bg: rgba(0, 0, 0, 0.12);

  // ===== 字数限制 =====
  --tr-chat-input-word-limit-color: #808080;
  --tr-chat-input-word-limit-error-color: #f23030;

  // ===== 动画 =====
  --tr-chat-input-transition-duration: 0.2s;
}
```

### 9.3 紧凑模式（size="small"）

通过 `.tr-chat-input--small` 类覆盖变量：

```less
.tr-chat-input--small {
  --tr-chat-input-font-size: 14px;
  --tr-chat-input-line-height: 22px;
  --tr-chat-input-border-radius: 22px;
  --tr-chat-input-padding: 12px 16px;
  --tr-chat-input-gap: 6px;
  --tr-chat-input-footer-gap: 8px;
  --tr-chat-input-header-padding: 12px 16px;
  --tr-chat-input-multi-main-padding: 14px 16px 10px;
  --tr-chat-input-footer-padding: 0 10px 8px;
  --tr-chat-input-button-size: 28px;
  --tr-chat-input-button-size-submit: 32px;
  --tr-chat-input-prefix-padding-right: 4px;
  --tr-chat-input-actions-padding-right: 8px;
}
```

### 9.4 主题适配

暗色模式和其他主题通过全局 CSS 变量系统自动适配：

- `--tr-container-bg-default`：容器背景色
- `--tr-text-primary`：主文本颜色
- `--tr-text-tertiary`：占位符颜色
- `--tr-container-bg-hover`：按钮悬停背景色

无需在组件内部单独配置主题。