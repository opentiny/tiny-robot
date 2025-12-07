# Chat-Input 组件

基于 Tiptap 的高度可组合输入组件，遵循"组合优于配置"的设计哲学。

> **重要说明**：本组件是 Sender 组件的重构版本，使用 Tiptap 替代原生 contenteditable 实现，提供更好的可维护性和扩展性。

## 📚 文档索引

- **[DESIGN.md](./DESIGN.md)** - 完整的组件设计文档
- **[index.type.ts](./index.type.ts)** - 详细的类型定义
- **[FEASIBILITY.md](./FEASIBILITY.md)** - Tiptap 重构可行性评估

## 🎯 核心特性

- ✅ **基于 Tiptap**：强大的编辑器能力
- ✅ **高度可组合**：通过插槽灵活定制
- ✅ **独立子组件**：所有按钮都可独立使用
- ✅ **Context 共享**：避免 props drilling
- ✅ **类型安全**：完整的 TypeScript 支持
- ✅ **模板编辑**：支持模板块的插入和编辑
- ✅ **输入联想**：智能建议和自动补全
- ✅ **语音输入**：支持语音识别
- ✅ **主题支持**：Light/Dark 主题

## 🏗️ 架构概览

```
主容器 (index.vue)
├── 提供 Context
├── 定义插槽系统
└── 管理编辑器生命周期

原子组件
├── EditorContent (编辑器内容)
├── SubmitButton (提交按钮)
├── ClearButton (清空按钮)
├── VoiceButton (语音按钮)
├── FileButton (文件按钮)
├── WordCounter (字数统计)
└── SuggestionList (建议列表)

Tiptap 扩展
├── Template (模板块)
├── SingleLineMode (单行模式)
├── Suggestion (输入联想)
└── CharacterCount (字数统计)
```

## 📦 目录结构

```
chat-input/
├── index.ts                    # 导出入口
├── index.vue                   # 主容器组件
├── index.type.ts               # 类型定义
├── index.less                  # 样式
├── DESIGN.md                   # 设计文档
├── README.md                   # 本文件
│
├── context/                    # Context 定义
├── extensions/                 # Tiptap 扩展
├── components/                 # 原子组件
├── composables/                # 组合式函数
├── utils/                      # 工具函数
└── constants/                  # 常量定义
```

## 🎨 插槽系统

### 单行模式

```
┌─────────────────────────────────────────┐
│ [prefix] [编辑器] [actions-inline]      │
└─────────────────────────────────────────┘
```

### 多行模式

```
┌─────────────────────────────────────────┐
│ [header]                                │
├─────────────────────────────────────────┤
│ [prefix] [编辑器]                       │
├─────────────────────────────────────────┤
│ [footer]              [footer-right]    │
│ (左侧自定义)          (右侧默认/自定义) │
└─────────────────────────────────────────┘
```

### 插槽说明

| 插槽 | 位置 | 用途 | 使用频率 |
|------|------|------|---------|
| `header` | 顶部 | 自定义头部 | 低 |
| `prefix` | 输入框左侧 | 前缀内容 | 低 |
| `content` | 输入框主体 | 自定义编辑器 | 极低 |
| `actions-inline` | 输入框右侧（单行） | 自定义按钮 | 中 |
| `footer` | 底部左侧（多行） | 自定义内容 | **高** |
| `footer-right` | 底部右侧（多行） | 完全自定义右侧 | 低 |

## 💡 使用示例

### 基础使用（90% 场景）

```vue
<chat-input
  v-model="content"
  :max-length="500"
  show-word-limit
  clearable
  allow-speech
  @submit="handleSubmit"
/>
```

### 添加自定义按钮（常见场景）

```vue
<chat-input v-model="content">
  <template #footer>
    <deep-think-button />
    <emoji-button />
  </template>
</chat-input>
```

### 模板填充

```vue
<chat-input
  v-model="content"
  :template-data="templates"
  @update:template-data="handleTemplateUpdate"
/>
```

### 输入联想

```vue
<chat-input
  v-model="content"
  :suggestions="suggestions"
  @suggestion-select="handleSelect"
/>
```

## 🔧 开发指南

### 添加新的原子组件

1. 在 `components/` 下创建组件目录
2. 实现组件，通过 `inject` 获取 Context
3. 确保组件可以独立使用
4. 添加类型定义
5. 编写单元测试

### 添加新的 Tiptap 扩展

1. 在 `extensions/` 下创建扩展目录
2. 实现扩展，遵循 Tiptap 规范
3. 在 `useEditor` 中注册扩展
4. 添加类型定义
5. 编写测试用例

### 添加新的 Composable

1. 在 `composables/` 下创建文件
2. 实现逻辑，返回响应式状态和方法
3. 添加类型定义
4. 编写单元测试
5. 在主组件中使用

## 📋 设计原则

### 1. 组合优于配置

❌ **错误方式**：
```vue
<chat-input
  :show-clear="true"
  :show-voice="true"
  :show-file="false"
/>
```

✅ **正确方式**：
```vue
<chat-input>
  <template #footer>
    <custom-button />
  </template>
</chat-input>
```

### 2. 哑容器 + 聪明子组件

- **主容器**：只提供结构、插槽、Context
- **子组件**：独立、可复用、通过 inject 获取状态

### 3. Context 共享

- 使用 `provide/inject` 避免 props drilling
- 所有子组件都可以访问 Context
- Context 提供状态和方法

### 4. 最小化 Props

- 只接收必要的 props
- 大部分功能通过插槽实现
- 配置通过 Context 传递

## 🧪 测试

```bash
# 运行单元测试
pnpm test:unit

# 运行组件测试
pnpm test:component

# 运行集成测试
pnpm test:integration

# 测试覆盖率
pnpm test:coverage
```

## 📝 待办事项

- [ ] 实现所有核心组件
- [ ] 实现所有 Tiptap 扩展
- [ ] 实现所有 Composables
- [ ] 编写单元测试
- [ ] 编写组件测试
- [ ] 编写集成测试
- [ ] 编写使用文档
- [ ] 编写 API 文档
- [ ] 性能优化
- [ ] 可访问性优化

## 🤝 贡献指南

1. 阅读 [DESIGN.md](./DESIGN.md) 了解设计思想
2. 遵循代码规范和设计原则
3. 编写测试用例
4. 更新文档
5. 提交 Pull Request

## 🔄 从 Sender 迁移

### 为什么要重构？

Chat-Input 是 Sender 组件的重构版本，主要改进：

**代码质量提升：**
- ✅ 减少 60-70% 的自定义代码（模板编辑器从 1130 行降至约 300-400 行）
- ✅ 基于成熟的 ProseMirror 架构，更好的可维护性
- ✅ 更少的边缘情况和 bug

**功能增强：**
- ✅ 更好的浏览器兼容性（Tiptap 已处理大部分兼容性问题）
- ✅ 更强的扩展性（可轻松添加富文本、协作编辑等功能）
- ✅ 更丰富的生态系统（可使用 Tiptap 社区扩展）

**长期收益：**
- ✅ 活跃的社区和持续更新
- ✅ 更容易招聘到熟悉 Tiptap 的开发者
- ✅ 更好的文档和学习资源

### 功能对比

| 功能 | Sender | Chat-Input | 说明 |
|------|--------|-----------|------|
| **基础输入** | ✅ | ✅ | 完全兼容 |
| **模板编辑** | ✅ 自定义实现 | ✅ Tiptap Node | 代码量减少 60-70% |
| **撤销/重做** | ✅ 手动实现 | ✅ Tiptap 内置 | 更可靠 |
| **输入联想** | ✅ | ✅ | 需要自定义实现 |
| **语音输入** | ✅ | ✅ | 复用现有实现 |
| **单行/多行** | ✅ | ✅ | 需要自定义实现 |
| **Shadow DOM** | ✅ 复杂处理 | ✅ Tiptap 支持 | 更简单 |
| **富文本** | ❌ | ✅ 可扩展 | 新增能力 |
| **协作编辑** | ❌ | ✅ 可扩展 | 未来功能 |

### 迁移步骤

**阶段 1：核心功能迁移（2-3 周）**
- [ ] 实现基础编辑器
- [ ] 实现模板块节点
- [ ] 实现撤销/重做
- [ ] 保持现有 API 兼容

**阶段 2：高级功能迁移（2-3 周）**
- [ ] 实现单行/多行模式
- [ ] 实现输入联想
- [ ] 实现语音输入
- [ ] 实现文件上传

**阶段 3：优化和测试（1-2 周）**
- [ ] 性能优化
- [ ] 浏览器兼容性测试
- [ ] 边缘情况处理
- [ ] 文档更新

**总计：5-8 周**

### API 兼容性

**Props 变化：**
```typescript
// 基本保持一致
TrSender → ChatInput

// 插槽变化
footer-left → footer  // 简化命名
footer-right → footer-right  // 保持不变
```

**使用示例对比：**

```vue
<!-- Sender (旧) -->
<tr-sender mode="multiple">
  <template #footer-left>
    <deep-think-button />
  </template>
</tr-sender>

<!-- Chat-Input (新) -->
<chat-input mode="multiple">
  <template #footer>
    <deep-think-button />
  </template>
</chat-input>
```

### 风险评估

**🔴 高风险项：**
- 单行模式实现：需要大量自定义逻辑
- 自动模式切换：需要精确的宽度计算
- 现有 API 兼容性：需要保持向后兼容

**🟡 中风险项：**
- 输入联想功能：需要自定义实现
- 模板数据格式转换：需要适配现有的 UserItem 格式
- 性能优化：Tiptap 比原生 contenteditable 稍重（约 50KB）

**🟢 低风险项：**
- 模板块编辑：Tiptap 完美支持
- 撤销/重做：Tiptap 内置
- Vue 集成：Tiptap 官方支持

### 注意事项

1. **保持向后兼容**
   - 确保现有的 props 和 events 继续工作
   - 提供迁移指南和工具

2. **渐进式迁移**
   - 可以先在新目录实现，测试稳定后再替换
   - 支持两个版本并存一段时间

3. **性能监控**
   - Tiptap 会增加约 50KB 的包体积
   - 需要监控首屏加载时间和运行时性能

4. **充分测试**
   - 特别关注 Shadow DOM 场景
   - 移动端兼容性测试
   - 边缘情况处理

## 📊 技术对比

### 模板编辑器实现对比

**Sender (原生 contenteditable)：**
```
代码量：1130 行
复杂度：高
- 手动管理光标位置
- 手动处理 Shadow DOM
- 手动实现撤销/重做
- 零宽字符作为分隔符
- Safari 特殊处理
```

**Chat-Input (Tiptap)：**
```
代码量：约 300-400 行（减少 60-70%）
复杂度：中
- Tiptap 自动管理光标
- Tiptap 处理 Shadow DOM
- Tiptap 内置撤销/重做
- 使用 Node 系统
- 跨浏览器兼容
```

### Tiptap 能力覆盖

**✅ 完美覆盖：**
- 富文本编辑
- 占位符（Placeholder 扩展）
- 撤销/重做（History 扩展）
- 复制粘贴处理（PasteRules）
- 输入法支持（原生支持）
- 选区管理（Selection API）
- 自定义节点（Node Views）
- Vue 组件集成（VueNodeViewRenderer）
- 事件和命令系统

**⚠️ 需要额外实现：**
- 单行/多行模式切换
- 字数限制验证
- 输入联想（自定义实现）
- 语音输入（复用现有）
- 文件上传（自定义实现）
- 自动高度调整

## 📄 许可证

MIT
