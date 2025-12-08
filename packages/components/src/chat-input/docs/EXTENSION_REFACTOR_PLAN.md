# Chat-Input 扩展系统重构文档

## 重构目标

1. **职责单一**：每个文件只负责一个特定功能
2. **结构统一**：所有扩展遵循相同的目录结构和命名规范
3. **代码复用**：通用逻辑抽象到共享模块
4. **简化层级**：遵循 YAGNI 原则，单文件不建文件夹

---

## 目录结构

### 整体结构

```
extensions/
├── utils/                    # 共享工具函数
│   ├── id-generator.ts       # 生成唯一 ID
│   ├── position.ts           # 查找触发位置（mention/suggestion 通用）
│   └── index.ts              # 统一导出
├── mention/                  # Mention 扩展
├── suggestion/               # Suggestion 扩展
├── template/                 # Template 扩展
└── index.ts                  # 统一导出所有扩展
```

### 各扩展统一结构

每个扩展遵循相同的文件组织：

```
extension-name/
├── index.ts          # 入口：导出所有内容 + 便捷函数
├── extension.ts      # 扩展定义：Node.create() 或 Extension.create()
├── types.ts          # 类型定义 + TypeScript 模块扩展声明
├── commands.ts       # 命令实现（如有命令）
├── utils.ts          # 扩展特定的工具函数
├── plugin.ts         # 插件实现（单个插件）
├── plugins.ts        # 插件集合（多个插件时使用）
├── index.less        # 样式文件（扁平化，不建 styles/ 文件夹）
├── components/       # Vue 组件（2个及以上才建文件夹）
└── utils/            # 专用工具模块（2个及以上才建文件夹）
```

---

## 文件职责说明

### 核心文件

| 文件 | 职责 | 说明 |
|------|------|------|
| `index.ts` | 入口文件 | 导出所有内容 + 定义便捷函数（如 `mention()`） |
| `extension.ts` | 扩展定义 | Tiptap 扩展配置（节点/扩展属性、渲染、插件集成） |
| `types.ts` | 类型定义 | 接口定义 + TypeScript 模块扩展声明 |
| `commands.ts` | 命令实现 | 编辑器命令的业务逻辑（如 insertMention） |
| `utils.ts` | 工具函数 | 编辑器操作相关的辅助函数 |
| `plugin.ts` | 插件实现 | ProseMirror 插件逻辑 |
| `index.less` | 样式文件 | 扩展的样式定义 |

### 目录组织原则

- **单文件直接放根目录**：减少嵌套（如 `index.less`、`xxx-view.vue`）
- **多文件才建文件夹**：2个及以上文件才需要组织（如 `components/`、`utils/`）
- **保持一致性**：所有扩展遵循相同规则

---

## 各扩展特点

### Mention 扩展

```
mention/
├── components/          # 2个组件，保留文件夹
│   ├── mention-view.vue
│   └── mention-list.vue
├── index.less           # 扁平化
├── commands.ts          # 有命令
├── extension.ts
├── index.ts
├── plugin.ts
├── types.ts
└── utils.ts
```

**特点**：
- 有命令（insertMention、deleteMention）
- 有多个组件（保留 components/ 文件夹）
- 使用共享工具（generateId）

### Suggestion 扩展

```
suggestion/
├── utils/                    # 专用工具，保留文件夹
│   ├── filter.ts             # 过滤逻辑
│   └── highlight.ts          # 高亮逻辑
├── suggestion-list.vue       # 扁平化
├── index.less                # 扁平化
├── extension.ts
├── index.ts
├── plugin.ts
└── types.ts
```

**特点**：
- 无命令（不需要 commands.ts）
- 单个组件（扁平化）
- 有专用工具模块（保留 utils/ 文件夹）

### Template 扩展

```
template/
├── template-block-view.vue   # 扁平化
├── index.less                # 扁平化
├── commands.ts               # 有多个命令
├── extension.ts
├── index.ts
├── plugins.ts                # 多个插件
├── types.ts
└── utils.ts
```

**特点**：
- 有多个命令（setTemplateData、insertTemplate 等）
- 单个组件（扁平化）
- 有多个插件（使用 plugins.ts）

---

## 重构改进点

### 1. 职责分离

**重构前**：`index.ts` 混合了扩展定义、命令、工具函数、插件等（300+ 行）

**重构后**：
- `extension.ts`：扩展定义
- `commands.ts`：命令实现
- `utils.ts`：工具函数
- `plugin.ts`：插件逻辑
- `index.ts`：导出 + 便捷函数

### 2. 便捷函数整合

**重构前**：便捷函数在独立的 `helpers/extension-helpers.ts`

**重构后**：便捷函数直接在各扩展的 `index.ts` 中定义

```typescript
// mention/index.ts
export function mention(items, char = '@', options) {
  return Mention.configure({ items, char, ...options })
}
```

### 3. 类型定义增强

**重构前**：命令类型在独立的 `commands.d.ts`

**重构后**：类型定义和模块扩展声明统一在 `types.ts`

```typescript
// types.ts
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    mention: {
      insertMention: (attrs: Partial<MentionAttrs>) => ReturnType
    }
  }
}
```

### 4. 目录扁平化

**重构前**：
- `styles/index.less`（所有扩展）
- `components/xxx.vue`（单组件也建文件夹）

**重构后**：
- `index.less`（扁平化）
- `xxx.vue`（单组件扁平化）
- `components/`（仅多组件时保留）

### 5. 共享代码最小化

**重构前**：计划建立复杂的共享基础设施（插件基类、通用组件等）

**重构后**：只抽象真正通用的工具
- `utils/id-generator.ts`：所有扩展都需要
- `utils/position.ts`：mention 和 suggestion 需要
- 删除未使用的 `shared/styles/`

---

## API 兼容性

用户代码无需修改，完全向后兼容：

```typescript
// 方式1：扩展类
const extensions = [
  ChatInput.Mention.configure({ items: mentions })
]

// 方式2：便捷函数
const extensions = [
  ChatInput.mention(mentions),
  ChatInput.suggestion(suggestions),
  ChatInput.template(templates)
]
```

---

## 文件变化总结

### 新增
- `utils/`：共享工具函数目录
- 各扩展的 `extension.ts`：扩展定义独立
- 各扩展的 `commands.ts`：命令实现独立（如有命令）

### 删除
- `helpers/extension-helpers.ts`：功能整合到各扩展的 `index.ts`
- 各扩展的 `commands.d.ts`：整合到 `types.ts`
- 各扩展的 `styles/` 文件夹：扁平化为 `index.less`
- `shared/styles/`：未使用，已删除

### 重命名
- `shared/` → `utils/`：语义更清晰
- `plugins.ts` → `plugin.ts`（单插件时）

### 移动
- 单组件从 `components/` 移到根目录（扁平化）
- 样式文件从 `styles/index.less` 移到 `index.less`（扁平化）

---

## 设计原则

1. **YAGNI**（You Aren't Gonna Need It）：不过度设计，单文件不建文件夹
2. **职责单一**：每个文件只做一件事
3. **最小化共享**：只抽象真正通用的代码
4. **保持一致**：所有扩展遵循相同模式
5. **向后兼容**：用户代码无需修改
