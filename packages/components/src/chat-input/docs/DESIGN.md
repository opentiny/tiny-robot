# Chat-Input 组件设计文档

## 一、设计概述

### 1.1 设计哲学

Chat-Input 组件基于 **"组合优于配置"** 的核心设计哲学，采用 Tiptap 编辑器作为底层实现，构建一个高度可组合、易于扩展的输入组件系统。

**核心原则：**
- **拒绝布尔值地狱**：避免使用大量布尔 props 控制渲染逻辑
- **插槽优先**：组件结构由使用者通过插槽明确定义
- **哑容器 + 聪明子组件**：主容器提供结构和状态，子组件独立可复用
- **Context 共享**：使用 provide/inject 避免 props drilling

### 1.2 组件定位

Chat-Input 是 Sender 组件的重构版本，主要改进：
- 使用 Tiptap 替代原生 contenteditable
- 更清晰的插槽系统
- 更好的模板编辑体验
- 更强的扩展性

### 1.3 技术栈

- **编辑器核心**：Tiptap (基于 ProseMirror)
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
│  │  provide: ChatInputContext                    │  │
│  │  - editor 实例                                │  │
│  │  - 状态管理                                   │  │
│  │  - 方法暴露                                   │  │
│  └───────────────────────────────────────────────┘  │
│                                                     │
│  ┌───────────────────────────────────────────────┐  │
│  │  插槽系统                                     │  │
│  │  - header                                     │  │
│  │  - prefix                                     │  │
│  │  - content (编辑器)                           │  │
│  │  - actions-inline (单行模式)                  │  │
│  │  - footer (多行模式左侧)                      │  │
│  │  - footer-right (多行模式右侧)                │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                        ↓ inject
┌─────────────────────────────────────────────────────┐
│              原子子组件 (聪明组件)                   │
│  - EditorContent                                    │
│  - SubmitButton                                     │
│  - ClearButton                                      │
│  - VoiceButton                                      │
│  - FileButton                                       │
│  - WordCounter                                      │
│  - SuggestionList                                   │
└─────────────────────────────────────────────────────┘
```

### 2.2 层次划分


**1. 表现层 (Presentation Layer)**
- 主容器组件 (index.vue)
- 插槽系统定义
- 基础样式和布局

**2. 逻辑层 (Logic Layer)**
- Composables (组合式函数)
- Context 管理
- 状态计算和方法封装

**3. 扩展层 (Extension Layer)**
- Tiptap 扩展
- 自定义节点和插件
- 编辑器行为定制

**4. 组件层 (Component Layer)**
- 原子组件
- 独立可复用
- 通过 inject 获取状态

---

## 三、目录结构设计

### 3.1 完整目录树

```
packages/components/src/chat-input/
├── index.ts                          # 导出入口
├── index.vue                         # 主容器组件
├── index.type.ts                     # 类型定义
├── index.less                        # 容器样式
├── DESIGN.md                         # 设计文档
├── README.md                         # 使用文档
│
├── context/                          # Context 定义
│   ├── index.ts                      # ChatInputContext 定义和实现
│   └── types.ts                      # Context 相关类型
│
├── extensions/                       # Tiptap 扩展
│   ├── template-block/              
│   │   ├── index.ts                 # 模板块扩展定义
│   │   ├── template-block-view.vue  # 模板块视图组件
│   │   ├── types.ts                 # 模板块类型定义
│   │   └── index.less               # 模板块样式
│   │
│   ├── single-line-mode/            
│   │   ├── index.ts                 # 单行模式扩展
│   │   └── types.ts                 # 单行模式类型
│   │
│   ├── suggestion/                   
│   │   ├── index.ts                 # 输入联想扩展
│   │   ├── suggestion-plugin.ts     # ProseMirror 插件
│   │   └── types.ts                 # 联想相关类型
│   │
│   └── character-count/              
│       ├── index.ts                 # 字数统计扩展
│       └── types.ts                 # 字数统计类型
│
├── components/                       # 原子子组件
│   ├── editor-content/              
│   │   ├── index.vue                # 编辑器内容区
│   │   └── index.less
│   │
│   ├── footer/                      
│   │   ├── index.vue                # 底部容器
│   │   ├── default-right.vue        # 默认右侧内容
│   │   └── index.less
│   │
│   ├── action-button/               
│   │   ├── index.vue                # 基础操作按钮
│   │   ├── index.type.ts
│   │   └── index.less
│   │
│   ├── submit-button/               
│   │   ├── index.vue
│   │   └── index.less
│   │
│   ├── clear-button/                
│   │   ├── index.vue
│   │   └── index.less
│   │
│   ├── voice-button/                
│   │   ├── index.vue
│   │   └── index.less
│   │
│   ├── file-button/                 
│   │   ├── index.vue
│   │   └── index.less
│   │
│   ├── word-counter/                
│   │   ├── index.vue
│   │   └── index.less
│   │
│   ├── suggestion-list/             
│   │   ├── index.vue
│   │   ├── suggestion-item.vue
│   │   ├── index.type.ts
│   │   └── index.less
│   │
│   └── tab-indicator/               
│       ├── index.vue
│       └── index.less
│
├── composables/                      # 组合式函数
│   ├── useChatInputContext.ts       # 获取 Context
│   ├── useEditor.ts                 # 编辑器初始化
│   ├── useModeSwitch.ts             # 模式切换
│   ├── useSuggestion.ts             # 输入联想
│   ├── useSpeech.ts                 # 语音输入
│   ├── useFileUpload.ts             # 文件上传
│   ├── useTemplateData.ts           # 模板数据
│   └── useKeyboardShortcuts.ts      # 键盘快捷键
│
├── utils/                            # 工具函数
│   ├── template-converter.ts         # 模板格式转换
│   ├── content-validator.ts          # 内容验证
│   └── dom-helpers.ts                # DOM 辅助
│
└── constants/                        # 常量定义
    └── index.ts                      # 默认配置
```

### 3.2 目录职责说明


**根目录文件：**
- `index.ts`: 组件导出，包括组件本身、类型、常量等
- `index.vue`: 主容器组件，负责布局、插槽定义、Context 提供
- `index.type.ts`: 所有公开的类型定义
- `index.less`: 主容器样式，包括 CSS 变量定义

**context/：** Context 相关
- 定义 ChatInputContext 接口
- 实现 provide/inject 逻辑
- 管理全局状态和方法

**extensions/：** Tiptap 扩展
- 每个扩展一个独立目录
- 包含扩展定义、视图组件、类型、样式
- 扩展之间相互独立

**components/：** 原子组件
- 每个组件一个独立目录
- 通过 inject 获取 Context
- 可在 chat-input 外部独立使用

**composables/：** 组合式函数
- 封装可复用的逻辑
- 返回响应式状态和方法
- 可被主组件或子组件使用

**utils/：** 纯函数工具
- 无副作用的工具函数
- 数据转换、验证等
- 不依赖 Vue 响应式系统

**constants/：** 常量定义
- 默认配置
- 枚举值
- 魔法数字的语义化

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
[ClearButton] [FileButton] [VoiceButton] [SubmitButton]
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
[WordCounter] [ClearButton] [FileButton] [VoiceButton] [SubmitButton]
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
allowSpeech: Ref<boolean>
allowFiles: Ref<boolean>

// 按钮配置
buttonGroup: Ref<ButtonGroupConfig | undefined>

// 提交配置
submitType: Ref<'enter' | 'ctrlEnter' | 'shiftEnter'>
stopText: Ref<string | undefined>
```

**说明：**
- showWordLimit: 是否显示字数限制
- clearable: 是否显示清空按钮
- allowSpeech: 是否允许语音输入
- allowFiles: 是否允许文件上传
- buttonGroup: 按钮组详细配置
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
- Context: canSubmit, loading, submit, buttonGroup

**Props：** 无

**Emits：** 无

**实现要点：**
- 根据 canSubmit 控制禁用状态
- 根据 loading 显示加载状态或停止图标
- 点击时调用 context.submit()
- 支持通过 buttonGroup.submit 自定义配置

**状态判断：**
```
按钮禁用条件：
- !canSubmit
- buttonGroup.submit?.disabled

按钮显示：
- loading === true: 显示停止图标
- loading === false: 显示提交图标
```

#### 6.2.3 ClearButton

**职责：** 清空按钮

**依赖：**
- Context: hasContent, clearable, clear, buttonGroup

**Props：** 无

**Emits：** 无

**实现要点：**
- 根据 hasContent && clearable 控制显示
- 点击时调用 context.clear()
- 支持通过 buttonGroup.clear 自定义配置

**显示条件：**
```
显示清空按钮：
- clearable === true
- hasContent === true
- !buttonGroup.clear?.disabled
```

#### 6.2.4 VoiceButton

**职责：** 语音输入按钮

**依赖：**
- Context: allowSpeech, speechState, startSpeech, stopSpeech, buttonGroup

**Props：** 无

**Emits：** 无

**实现要点：**
- 根据 allowSpeech 控制显示
- 根据 speechState.isRecording 切换图标
- 点击时调用 startSpeech 或 stopSpeech
- 支持通过 buttonGroup.voice 自定义图标

**状态判断：**
```
显示语音按钮：
- allowSpeech === true
- speechState.isSupported === true

按钮状态：
- speechState.isRecording === true: 显示停止图标，激活状态
- speechState.isRecording === false: 显示麦克风图标，普通状态
```

#### 6.2.5 FileButton

**职责：** 文件上传按钮

**依赖：**
- Context: allowFiles, openFileDialog, buttonGroup

**Props：** 无

**Emits：** 无

**实现要点：**
- 根据 allowFiles 控制显示
- 点击时调用 context.openFileDialog()
- 支持通过 buttonGroup.file 自定义配置

**显示条件：**
```
显示文件按钮：
- allowFiles === true
- !buttonGroup.file?.disabled
```

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

#### 6.2.7 SuggestionList

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

#### 6.2.8 TabIndicator

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
- 包含 WordCounter 和所有默认按钮
- 按钮顺序：Clear, File, Voice, Submit
- 自动处理按钮间距

**渲染结构：**
```
<div class="default-right">
  <WordCounter v-if="showWordLimit && maxLength" />
  <div class="action-buttons">
    <ClearButton />
    <FileButton />
    <VoiceButton />
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
- TemplateBlock (模板块)
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


#### 7.2.5 useSpeech

**职责：** 管理语音输入功能

**参数：**
```typescript
{
  options: SpeechHookOptions
}
```

**返回：**
```typescript
{
  speechState: Ref<SpeechState>
  start: () => void
  stop: () => void
}
```

**实现要点：**
- 检测浏览器支持
- 管理语音识别生命周期
- 处理识别结果
- 支持自定义语音处理器

**状态管理：**
```
speechState: {
  isRecording: boolean
  isSupported: boolean
  error?: Error
}
```

#### 7.2.6 useFileUpload

**职责：** 管理文件上传功能

**参数：**
```typescript
{
  buttonGroup: Ref<ButtonGroupConfig | undefined>
  emit: ChatInputEmits
}
```

**返回：**
```typescript
{
  openFileDialog: () => void
  files: Ref<File[]>
}
```

**实现要点：**
- 使用 useFileDialog 创建文件选择
- 根据 buttonGroup.file 配置 accept, multiple
- 监听文件选择并 emit 事件

#### 7.2.7 useTemplateData

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

#### 7.2.8 useKeyboardShortcuts

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

#### 8.2.1 TemplateBlock

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
insertTemplateBlock(attrs: TemplateBlockAttrs): Command
deleteTemplateBlock(id: string): Command
updateTemplateBlock(id: string, content: string): Command
```

**实现要点：**
- 定义为 inline + atom 节点
- 使用 VueNodeViewRenderer 渲染
- 支持编辑和删除
- 处理光标导航

**节点定义：**
```
name: 'templateBlock'
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
3. 提供 light 和 dark 主题
4. 支持紧凑模式

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
  --tr-chat-input-text-color: var(--tr-text-primary);
  --tr-chat-input-placeholder-color: var(--tr-text-tertiary);
  --tr-chat-input-border-color: var(--tr-border-default);
  
  // ===== 尺寸 =====
  --tr-chat-input-font-size: 16px;
  --tr-chat-input-line-height: 26px;
  --tr-chat-input-min-height: 42px;
  --tr-chat-input-border-radius: 26px;
  
  // ===== 间距 =====
  --tr-chat-input-padding: 15px 20px;
  --tr-chat-input-gap: 8px;
  --tr-chat-input-footer-gap: 12px;
  
  // ===== 按钮 =====
  --tr-chat-input-button-size: 32px;
  --tr-chat-input-button-hover-bg: rgba(0, 0, 0, 0.08);
  --tr-chat-input-button-active-bg: rgba(0, 0, 0, 0.12);
  
  // ===== 字数限制 =====
  --tr-chat-input-word-limit-color: #808080;
  --tr-chat-input-word-limit-error-color: #f23030;
  
  // ===== 模板块 =====
  --tr-chat-input-template-bg: rgba(20, 118, 255, 0.1);
  --tr-chat-input-template-color: #1476ff;
  --tr-chat-input-template-border-radius: 6px;
  
  // ===== 动画 =====
  --tr-chat-input-transition-duration: 0.2s;
}
```

### 9.3 紧凑模式

```less
.tr-chat-input--small {
  --tr-chat-input-font-size: 14px;
  --tr-chat-input-line-height: 24px;
  --tr-chat-input-min-height: 36px;
  --tr-chat-input-border-radius: 24px;
  --tr-chat-input-padding: 12px 16px;
  --tr-chat-input-button-size: 28px;
}
```

### 9.4 主题支持

```less
[data-theme="dark"] {
  --tr-chat-input-bg-color: #1a1a1a;
  --tr-chat-input-text-color: #ffffff;
  --tr-chat-input-placeholder-color: #666666;
  --tr-chat-input-border-color: #333333;
}
```

---

## 十、类型系统设计

详见 `index.type.ts` 文件

---

## 十一、使用场景和最佳实践

### 11.1 常见使用场景

#### 场景 1：基础聊天输入（90%）

**需求：**
- 单行输入，自动切换多行
- 显示字数限制
- 支持清空、语音、提交

**实现：**
```
<chat-input
  v-model="content"
  :max-length="500"
  show-word-limit
  clearable
  allow-speech
  @submit="handleSubmit"
/>
```

#### 场景 2：添加自定义按钮（常见）

**需求：**
- 在底部左侧添加深度思考按钮
- 保留默认的右侧按钮

**实现：**
```
<chat-input v-model="content">
  <template #footer>
    <deep-think-button />
  </template>
</chat-input>
```

#### 场景 3：模板填充

**需求：**
- 支持模板块编辑
- 模板块可编辑和删除

**实现：**
```
<chat-input
  v-model="content"
  :template-data="templates"
  @update:template-data="handleTemplateUpdate"
/>
```

#### 场景 4：输入联想

**需求：**
- 输入时显示建议
- 支持键盘和鼠标选择

**实现：**
```
<chat-input
  v-model="content"
  :suggestions="suggestions"
  @suggestion-select="handleSelect"
/>
```

### 11.2 最佳实践

**1. 状态管理**
- 使用 v-model 双向绑定内容
- 使用 ref 获取组件实例调用方法
- 监听事件处理业务逻辑

**2. 性能优化**
- 大量建议项使用虚拟滚动
- 模板数据使用 shallowRef
- 避免频繁的 setContent

**3. 可访问性**
- 提供合适的 aria 标签
- 支持键盘导航
- 提供清晰的视觉反馈

**4. 错误处理**
- 捕获编辑器错误
- 提供降级方案
- 显示友好的错误提示

---

## 十二、迁移指南

### 12.1 从 Sender 迁移

**主要变化：**

1. **组件名称**
   - `TrSender` → `ChatInput`

2. **插槽变化**
   - `footer-left` → `footer`
   - `footer-right` → `footer-right` (保持)
   - 移除 `footer` 完全覆盖插槽

3. **Props 变化**
   - 基本保持一致
   - 新增部分 Tiptap 相关配置

4. **事件变化**
   - 基本保持一致

**迁移步骤：**

```
步骤 1: 更新组件引用
import { TrSender } from '@opentiny/tiny-robot'
↓
import { ChatInput } from '@opentiny/tiny-robot'

步骤 2: 更新插槽名称
<template #footer-left>
↓
<template #footer>

步骤 3: 测试功能
- 验证所有功能正常
- 检查样式是否一致
- 测试边缘情况
```

---

## 十三、开发规范

### 13.1 代码规范

1. **TypeScript**
   - 所有代码使用 TypeScript
   - 避免使用 any
   - 提供完整的类型定义

2. **Vue 3**
   - 使用 Composition API
   - 使用 `<script setup>`
   - 合理使用 ref 和 reactive

3. **命名规范**
   - 组件：PascalCase
   - 文件：kebab-case
   - 变量：camelCase
   - 常量：UPPER_SNAKE_CASE

4. **注释规范**
   - 所有公开 API 添加 JSDoc
   - 复杂逻辑添加行内注释
   - 类型定义添加说明注释

### 13.2 测试规范

1. **单元测试**
   - 所有 composables 需要单元测试
   - 所有工具函数需要单元测试
   - 测试覆盖率 > 80%

2. **组件测试**
   - 测试组件渲染
   - 测试用户交互
   - 测试事件触发

3. **集成测试**
   - 测试完整使用场景
   - 测试组件组合
   - 测试边缘情况

### 13.3 文档规范

1. **组件文档**
   - Props 说明
   - Events 说明
   - Slots 说明
   - 使用示例

2. **API 文档**
   - 类型定义
   - 方法说明
   - 参数说明
   - 返回值说明

3. **更新日志**
   - 记录所有变更
   - 标注破坏性变更
   - 提供迁移指南

---

## 十四、未来扩展

### 14.1 计划功能

1. **富文本支持**
   - 加粗、斜体、下划线
   - 列表、引用
   - 代码块

2. **协作编辑**
   - 多人实时编辑
   - 光标位置同步
   - 冲突解决

3. **AI 集成**
   - AI 补全
   - AI 改写
   - AI 总结

4. **更多扩展**
   - Markdown 支持
   - 表情选择器
   - @提及功能

### 14.2 扩展接口

组件提供扩展接口，支持：
- 自定义 Tiptap 扩展
- 自定义按钮组件
- 自定义样式主题
- 自定义快捷键

---

## 十五、总结

Chat-Input 组件采用"组合优于配置"的设计哲学，通过：
- 清晰的插槽系统
- 强大的 Context 机制
- 独立的原子组件
- 灵活的 Tiptap 扩展

构建了一个高度可组合、易于扩展、易于维护的输入组件系统。

**核心优势：**
- ✅ 简单场景简单使用
- ✅ 复杂场景灵活定制
- ✅ 组件独立可复用
- ✅ 类型安全完整
- ✅ 性能优秀
- ✅ 易于测试和维护
