# Chat-Input 组件设计总结

## 📋 文档导航

本目录包含 Chat-Input 组件的完整设计文档：

| 文档                                   | 内容                                   | 适用人群       |
| -------------------------------------- | -------------------------------------- | -------------- |
| **[README.md](./README.md)**           | 组件概览、快速开始、使用示例           | 所有人         |
| **[DESIGN.md](./DESIGN.md)**           | 完整的架构设计、插槽系统、Context 设计 | 开发者         |
| **[index.type.ts](./index.type.ts)**   | 详细的 TypeScript 类型定义             | 开发者         |
| **[FEASIBILITY.md](./FEASIBILITY.md)** | Tiptap 重构可行性评估                  | 决策者、架构师 |
| **[SUMMARY.md](./SUMMARY.md)**         | 本文档，设计总结                       | 所有人         |

---

## 🎯 设计目标

### 核心理念

**"组合优于配置" (Composition over Configuration)**

- ❌ 不使用大量布尔 props 控制渲染
- ✅ 通过插槽让使用者明确定义结构
- ✅ 主容器是哑组件，只提供结构和状态
- ✅ 子组件独立可复用，通过 Context 获取状态

### 技术选型

**基于 Tiptap 重构 Sender 组件**

- **编辑器核心**：Tiptap (基于 ProseMirror)
- **框架**：Vue 3 Composition API
- **类型**：TypeScript
- **样式**：Less + CSS Variables

---

## 🏗️ 架构概览

### 层次结构

```
┌─────────────────────────────────────────┐
│   表现层 (Presentation Layer)           │
│   - 主容器组件 (index.vue)              │
│   - 插槽系统定义                        │
│   - 基础样式和布局                      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   逻辑层 (Logic Layer)                  │
│   - Composables (组合式函数)            │
│   - Context 管理                        │
│   - 状态计算和方法封装                  │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   扩展层 (Extension Layer)              │
│   - Tiptap 扩展                         │
│   - 自定义节点和插件                    │
│   - 编辑器行为定制                      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   组件层 (Component Layer)              │
│   - 原子组件                            │
│   - 独立可复用                          │
│   - 通过 inject 获取状态                │
└─────────────────────────────────────────┘
```

### 目录结构

```
chat-input/
├── index.ts                    # 导出入口
├── index.vue                   # 主容器组件（哑组件）
├── index.type.ts               # 类型定义
├── index.less                  # 样式
│
├── context/                    # Context 定义
│   └── index.ts                # ChatInputContext
│
├── extensions/                 # Tiptap 扩展
│   ├── template/         # 模板块扩展
│   ├── single-line-mode/       # 单行模式扩展
│   ├── suggestion/             # 输入联想扩展
│   └── character-count/        # 字数统计扩展
│
├── components/                 # 原子组件
│   ├── editor-content/         # 编辑器内容区
│   ├── footer/                 # 底部容器
│   ├── submit-button/          # 提交按钮
│   ├── clear-button/           # 清空按钮
│   ├── voice-button/           # 语音按钮
│   ├── file-button/            # 文件按钮
│   ├── word-counter/           # 字数计数器
│   └── suggestion-list/        # 建议列表
│
├── composables/                # 组合式函数
│   ├── useChatInputContext.ts  # 获取 Context
│   ├── useEditor.ts            # 编辑器初始化
│   ├── useModeSwitch.ts        # 模式切换
│   ├── useSuggestion.ts        # 输入联想
│   ├── useSpeech.ts            # 语音输入
│   ├── useFileUpload.ts        # 文件上传
│   ├── useTemplateData.ts      # 模板数据
│   └── useKeyboardShortcuts.ts # 键盘快捷键
│
├── utils/                      # 工具函数
│   ├── template-converter.ts   # 模板格式转换
│   ├── content-validator.ts    # 内容验证
│   └── dom-helpers.ts          # DOM 辅助
│
└── constants/                  # 常量定义
    └── index.ts                # 默认配置
```

---

## 🎨 插槽系统设计

### 插槽层次

```
chat-input 组件结构：

┌─────────────────────────────────────────┐
│ header 插槽 (可选)                       │
│ - 完全自定义顶部区域                     │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 输入行                                   │
│ ┌───────┬─────────────┬────────────────┐│
│ │prefix │ content     │ actions-inline ││
│ │插槽   │ (编辑器)    │ 插槽 (单行)    ││
│ └───────┴─────────────┴────────────────┘│
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ 底部区域 (多行模式)                      │
│ ┌──────────────┬────────────────────────┐│
│ │footer 插槽   │ footer-right 插槽      ││
│ │(左侧自定义)  │ (右侧自定义，可选)     ││
│ │              │                        ││
│ │              │ 默认右侧内容：         ││
│ │              │ - WordCounter          ││
│ │              │ - DefaultActions       ││
│ └──────────────┴────────────────────────┘│
└─────────────────────────────────────────┘
```

### 插槽使用频率

| 插槽             | 使用频率 | 说明                   |
| ---------------- | -------- | ---------------------- |
| `footer`         | **90%**  | 最常用，添加自定义按钮 |
| `actions-inline` | 15%      | 单行模式自定义按钮     |
| `footer-right`   | 5%       | 完全自定义右侧         |
| `header`         | 5%       | 自定义头部             |
| `prefix`         | 3%       | 输入框前缀             |
| `content`        | <1%      | 完全自定义编辑器       |

### 设计优化

**底部插槽简化：**

```
原 Sender 设计：
- footer-left: 左侧自定义
- footer-right: 右侧自定义（位置不合理）
- footer: 完全覆盖

优化后设计：
- footer: 左侧自定义（最常用，命名简化）
- footer-right: 右侧自定义（预留，很少用）
- 移除 footer 完全覆盖（实际不需要）
```

**优势：**

- ✅ 符合 90% 的使用场景
- ✅ 命名更简洁直观
- ✅ 减少插槽优先级判断
- ✅ 降低使用复杂度

---

## 🔧 Context 设计

### Context 结构

```typescript
interface ChatInputContext {
  // 编辑器
  editor: Ref<Editor | null>
  editorRef: Ref<HTMLElement | null>

  // 状态
  mode: Ref<'single' | 'multiple'>
  loading: Ref<boolean>
  disabled: Ref<boolean>
  hasContent: Ref<boolean>
  canSubmit: Ref<boolean>
  isOverLimit: Ref<boolean>
  characterCount: Ref<number>
  maxLength: Ref<number | undefined>
  speechState: Ref<SpeechState>

  // 配置
  showWordLimit: Ref<boolean>
  clearable: Ref<boolean>
  allowSpeech: Ref<boolean>
  allowFiles: Ref<boolean>
  buttonGroup: Ref<ButtonGroupConfig | undefined>

  // 方法
  submit: () => void
  clear: () => void
  focus: () => void
  blur: () => void
  setContent: (content: string) => void
  getContent: () => string
  startSpeech: () => void
  stopSpeech: () => void
  openFileDialog: () => void
  insertTemplate: (template: TemplateItem) => void
  exitTemplateMode: () => void
  setMode: (mode: InputMode) => void
}
```

### Context 使用

**提供 Context (主容器)：**

```typescript
// 在 index.vue 中
provide(CHAT_INPUT_CONTEXT_KEY, context)
```

**注入 Context (子组件)：**

```typescript
// 在子组件中
const { canSubmit, submit } = useChatInputContext()
```

---

## 🧩 核心组件

### 原子组件列表

| 组件           | 职责       | 依赖 Context                                      |
| -------------- | ---------- | ------------------------------------------------- |
| EditorContent  | 渲染编辑器 | editor                                            |
| SubmitButton   | 提交按钮   | canSubmit, loading, submit                        |
| ClearButton    | 清空按钮   | hasContent, clearable, clear                      |
| VoiceButton    | 语音按钮   | allowSpeech, speechState, startSpeech, stopSpeech |
| FileButton     | 文件按钮   | allowFiles, openFileDialog                        |
| WordCounter    | 字数统计   | characterCount, maxLength, isOverLimit            |
| SuggestionList | 建议列表   | 无（通过 props）                                  |

### Tiptap 扩展列表

| 扩展           | 类型      | 职责       |
| -------------- | --------- | ---------- |
| Template  | Node      | 模板块节点 |
| SingleLineMode | Extension | 单行模式   |
| Suggestion     | Extension | 输入联想   |
| CharacterCount | Extension | 字数统计   |

---

## 📊 Tiptap 重构评估

### 代码量对比

| 模块       | Sender   | Chat-Input  | 减少       |
| ---------- | -------- | ----------- | ---------- |
| 模板编辑器 | 1130 行  | 300-400 行  | **60-70%** |
| 光标管理   | 手动实现 | Tiptap 自动 | **90%**    |
| 撤销/重做  | 手动实现 | Tiptap 内置 | **100%**   |
| Shadow DOM | 手动兼容 | Tiptap 支持 | **100%**   |

### 功能覆盖

**✅ Tiptap 完美覆盖：**

- 富文本编辑
- 占位符
- 撤销/重做
- 复制粘贴
- 输入法支持
- 选区管理
- 自定义节点
- Vue 集成

**⚠️ 需要额外实现：**

- 单行/多行模式切换（中等复杂度）
- 字数限制验证（低复杂度）
- 输入联想（中等复杂度）
- 语音输入（复用现有）
- 文件上传（低复杂度）
- 自动高度调整（低复杂度）

### 风险评估

**🔴 高风险：**

- 单行模式实现
- 自动模式切换
- API 兼容性

**🟡 中风险：**

- 输入联想
- 模板数据转换
- 性能优化

**🟢 低风险：**

- 模板块编辑
- 撤销/重做
- Vue 集成

### 实施计划

**总工期：5-8 周**

- 阶段 1：核心功能迁移（2-3 周）
- 阶段 2：高级功能迁移（2-3 周）
- 阶段 3：优化和测试（1-2 周）

---

## 💡 设计亮点

### 1. 组合优于配置

**错误方式：**

```vue
<chat-input :show-clear="true" :show-voice="true" :show-file="false" />
```

**正确方式：**

```vue
<chat-input>
  <template #footer>
    <custom-button />
  </template>
</chat-input>
```

### 2. 哑容器 + 聪明子组件

- 主容器只提供结构、插槽、Context
- 子组件独立、可复用、通过 inject 获取状态

### 3. Context 共享

- 使用 provide/inject 避免 props drilling
- 所有子组件都可以访问 Context
- Context 提供状态和方法

### 4. 最小化 Props

- 只接收必要的 props
- 大部分功能通过插槽实现
- 配置通过 Context 传递

### 5. 底部插槽优化

- footer 插槽就是左侧区域（最常用）
- footer-right 完全覆盖右侧（预留）
- 符合 80/20 原则

---

## 📈 预期收益

### 代码质量

- ✅ 代码量减少 60-70%
- ✅ 可维护性大幅提升
- ✅ 更少的 bug
- ✅ 更好的浏览器兼容性

### 功能增强

- ✅ 可轻松添加富文本功能
- ✅ 支持协作编辑（未来）
- ✅ 更丰富的扩展生态

### 长期收益

- ✅ 活跃的社区支持
- ✅ 持续的更新和优化
- ✅ 更容易招聘开发者
- ✅ 降低培训成本

---

## 🎯 下一步行动

### 立即开始

1. **阅读完整设计文档**

   - [DESIGN.md](./DESIGN.md) - 详细设计
   - [index.type.ts](./index.type.ts) - 类型定义
   - [FEASIBILITY.md](./FEASIBILITY.md) - 可行性评估

2. **搭建项目结构**

   - 创建目录
   - 配置 TypeScript
   - 安装依赖

3. **实现核心功能**

   - 基础编辑器
   - 模板块节点
   - Context 系统

4. **编写测试**
   - 单元测试
   - 组件测试
   - 集成测试

### 持续优化

1. **性能监控**

   - 包体积
   - 加载时间
   - 运行时性能

2. **用户反馈**

   - 收集使用问题
   - 优化用户体验
   - 迭代改进

3. **文档完善**
   - 使用文档
   - API 文档
   - 最佳实践

---
