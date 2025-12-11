# 模板功能方案文档摘要

## 问题分析

### 原有实现的问题

1. **光标定位问题**

   - 模板块前后无法正确放置光标
   - 连续两个模板块之间无法插入内容
   - 模板块作为段落最后一个节点时，光标无法移出

2. **键盘导航问题**

   - 方向键无法正确跳过模板块
   - 在零宽字符和模板块之间导航不流畅
   - 删除操作可能破坏文档结构

3. **内容编辑问题**
   - 粘贴内容时可能破坏零宽字符结构
   - 删除模板块时残留零宽字符
   - 输入法输入时零宽字符处理不当

## 优化方案

### 核心思路

使用**零宽字符（U+200B）**作为"光标锚点"，确保：

1. 自定义节点（模板块）前后始终有零宽字符
2. 连续的自定义节点之间有零宽字符分隔
3. 键盘操作时正确处理零宽字符的跳转
4. 删除和粘贴操作时维护零宽字符结构

### 实现细节

#### 1. 零宽字符管理插件 (`ensureZeroWidthChars`)

**功能：** 自动在需要的位置插入/删除零宽字符

**规则：**

- 段落首个节点是模板块 → 在模板块前插入零宽字符
- 段落末个节点是模板块 → 在模板块后插入零宽字符
- 连续两个模板块 → 在中间插入零宽字符
- 段落只有一个零宽字符 → 删除它（避免空段落显示异常）

**时机：** 在 `appendTransaction` 钩子中执行，确保每次文档变化后结构正确

```typescript
export function ensureZeroWidthChars() {
  return new Plugin({
    appendTransaction(transactions, oldState, newState) {
      const docChanged = transactions.some((tr) => tr.docChanged)
      if (!docChanged) return null
      return handleZeroWidthCharLogic(newState)
    },
  })
}
```

#### 2. 键盘导航插件 (`keyboardNavigationPlugin`)

**功能：** 处理方向键和删除键的特殊行为

**ArrowLeft 处理：**

```
[文本、零宽字符、光标、模板块] → 按左键 → [文本、光标、零宽字符、模板块]
```

**ArrowRight 处理：**

```
[模板块、零宽字符、光标、文本] → 按右键 → [模板块、零宽字符、光标、文本]
```

**Backspace 处理：**

- 删除模板块时，同时删除前后的零宽字符
- 删除普通字符时，保留必要的零宽字符
- 选区删除时，扩展选区以包含零宽字符

**关键代码：**

```typescript
// 删除模板块
if (beforeNode && beforeNode.type.name === 'template') {
  // 检查前后是否有零宽字符，一并删除
  let deleteStart = $from.pos - beforeNode.nodeSize
  let deleteEnd = $from.pos

  // 扩展删除范围
  if (prevPrevNode?.text?.endsWith(ZERO_WIDTH_CHAR)) {
    deleteStart -= 1
  }
  if (afterNode?.text?.startsWith(ZERO_WIDTH_CHAR)) {
    deleteEnd += 1
  }

  dispatch(state.tr.delete(deleteStart, deleteEnd))
}
```

#### 3. 粘贴处理插件 (`pasteHandlerPlugin`)

**功能：** 处理粘贴操作，维护零宽字符结构

**策略：**

1. 如果粘贴的是模板块的 HTML → 让 Tiptap 默认处理
2. 如果粘贴的是纯文本 → 自定义处理：
   - 移除光标周围的零宽字符
   - 处理多行文本（创建多个段落）
   - 设置光标到粘贴内容末尾

**关键代码：**

```typescript
// 移除光标周围的零宽字符
if ($from.nodeBefore?.text === ZERO_WIDTH_CHAR) {
  tr = tr.delete($from.pos - 1, $from.pos)
}

// 处理多行粘贴
const lines = text.split('\n')
if (lines.length > 1) {
  // 为每一行创建段落节点
  for (let i = 1; i < lines.length; i++) {
    const paragraph = state.schema.nodes.paragraph.create({}, lines[i] ? state.schema.text(lines[i]) : null)
    tr = tr.insert(pos, paragraph)
    pos += paragraph.nodeSize
  }
}
```

## 与 其它框架 的对比

### 相似之处

1. **零宽字符策略** - 都使用 U+200B 作为光标锚点
2. **插件架构** - 都使用 Prootherrror Plugin 系统
3. **处理时机** - 都在 `appendTransaction` 中维护结构

### 差异之处

| 特性           | Other Design                        | 当前实现                         |
| -------------- | ----------------------------------- | -------------------------------- |
| 自定义节点类型 | input-slot, select-slot, skill-slot | template                   |
| 节点可编辑性   | input-slot 可编辑                   | template 通过 Vue 组件编辑 |
| 输入法处理     | 有专门的 composition 处理           | 暂未实现（可后续添加）           |
| 节点删除标记   | 使用 `DeleteAble` meta              | 直接删除                         |

### 简化之处

当前实现相比 Other Design 更简洁：

1. **单一节点类型** - 只有 `template`，逻辑更简单
2. **无需 placeholder** - 模板块内容由 Vue 组件管理
3. **更少的边界情况** - 不需要处理多种 slot 类型的交互

## 使用示例

### 基本使用

```typescript
import { Template } from './extensions/template'

const editor = useEditor({
  extensions: [
    StarterKit,
    Template, // 自动包含所有插件
  ],
})
```

### 设置模板数据

```typescript
editor.commands.setTemplateData([
  { type: 'text', content: '你好，我是 ' },
  { type: 'template', content: '张三' },
  { type: 'text', content: '！' },
])
```

### 光标行为

```
输入: "你好，我是 [张三]！"
实际: "你好，我是 ​[张三]​！"  (​ 表示零宽字符)

光标位置:
1. "你好，我是 |​[张三]​！"  - 可以在模板块前
2. "你好，我是 ​[张三]​|！"  - 可以在模板块后
3. "你好，我是 ​[|张三]​！"  - 可以在模板块内（通过 Vue 组件）
```

## 测试场景

### 1. 光标导航

- [ ] 左右方向键可以正确跳过模板块
- [ ] 连续模板块之间可以放置光标
- [ ] 模板块作为最后节点时，光标可以移出

### 2. 内容编辑

- [ ] 在模板块前后输入文字正常
- [ ] 删除模板块时，零宽字符被正确清理
- [ ] 粘贴多行文本时，结构正确

### 3. 边界情况

- [ ] 空段落不显示零宽字符
- [ ] 撤销/重做后零宽字符结构正确
- [ ] 模板块作为唯一内容时，可以正常编辑

## 后续优化方向

### 1. 输入法支持

参考 Other Design 的 `handleCompositionEndLogic`，处理中文输入法：

```typescript
export function handleCompositionEndLogic(view: EditorView) {
  const { state, dispatch } = view
  const $from = state.selection.$from
  let tr = state.tr

  // 移除输入法产生的零宽字符
  let modified = removeZeroWidthCharForComposition($from, tr)
  if (modified) {
    dispatch(tr)
  }
}
```

### 2. 性能优化

- 使用 `getMeta` 标记某些操作，避免不必要的零宽字符处理
- 缓存常用的节点查找结果
- 批量处理零宽字符插入/删除

### 3. 可访问性

- 确保屏幕阅读器正确读取模板块
- 添加 ARIA 标签
- 支持键盘快捷键（如 Tab 跳转到下一个模板块）

## 总结

通过引入零宽字符管理和专门的键盘导航插件，我们解决了模板块的光标问题：

✅ **光标可以正确定位** - 零宽字符作为锚点  
✅ **键盘导航流畅** - 方向键正确跳转  
✅ **删除操作安全** - 自动清理零宽字符  
✅ **粘贴行为正确** - 维护文档结构

## 模板编辑器功能详解

### 功能特性

模板编辑器支持在输入框中插入可编辑的模板块，用户可以通过键盘和鼠标自由编辑模板内容。

#### 核心特性

1. **双向数据绑定** - 支持 `v-model:template-data` 绑定模板数据
2. **自由光标导航** - 光标可在普通文本和模板块之间自由移动
3. **精细删除控制** - 支持字符级和块级删除
4. **空白占位** - 空模板块保持最小宽度 32px，便于点击编辑
5. **自动聚焦** - 插入模板后自动聚焦到第一个模板块

### 交互规则

#### 1. 光标导航

**插入模板后**

- 光标自动定位到第一个模板块内部
- 光标在模板块内容末尾

**键盘导航**

- **左箭头 ←**：光标在零宽字符右侧时，进入左侧模板块末尾
- **右箭头 →**：光标在零宽字符左侧时，进入右侧模板块开头
- **模板块内左箭头**：光标在开头时跳出到模板块前
- **模板块内右箭头**：光标在末尾时跳出到模板块后

**鼠标操作**

- 点击模板块可直接进入编辑状态
- 点击模板块外的文本可正常定位光标

#### 2. 删除规则

详细的删除逻辑和测试用例请参考 [delete-logic-summary.md](./delete-logic-summary.md)

##### 核心设计原则

1. **保护性删除**：模板块内删除到最后一个字符时，不删除模板块，而是保留零宽字符占位
2. **渐进式退出**：空模板块内按删除键先跳出，再次按才删除整个块
3. **智能进入**：有内容的模板块，删除键会进入而非删除
4. **零宽字符清理**：删除模板块时连带清理前后的零宽字符，保持文档整洁
5. **边界保护**：防止 ProseMirror 默认行为导致模板块边界被破坏

##### Backspace vs Delete 对比

| 维度               | Backspace                          | Delete                               |
| ------------------ | ---------------------------------- | ------------------------------------ |
| **方向**           | ← 向左删除                         | → 向右删除                           |
| **检查节点**       | `$from.nodeBefore`                 | `$from.nodeAfter`                    |
| **模板块位置判断** | `$from.pos === $from.end()` (末尾) | `$from.pos === $from.start()` (开头) |
| **跳出位置**       | `$from.before()` (前面)            | `$from.after()` (后面)               |
| **进入位置**       | `$from.pos - 1` (末尾)             | `$from.pos + 1` (开头)               |
| **跳过零宽字符**   | `$from.pos - 2`                    | `$from.pos + 2`                      |

##### 基本交互规则

**从模板块外部删除**

- **Backspace（从右侧）**：
  - 有内容：进入模板块末尾
  - 无内容：删除整个模板块和前后零宽字符
- **Delete（从左侧）**：
  - 有内容：进入模板块开头
  - 无内容：删除整个模板块和前后零宽字符

**在模板块内部删除**

- **Backspace**：
  - 光标在末尾，删除单个字符
  - 删除最后一个字符时：替换为零宽字符，保留模板块外壳
  - 空模板块内继续删除：光标跳出到模板块前
  - 光标在开头：跳出到模板块前（边界保护）
- **Delete**：
  - 光标在开头，删除单个字符
  - 删除最后一个字符时：替换为零宽字符，保留模板块外壳
  - 空模板块内继续删除：光标跳出到模板块后
  - 光标在末尾：跳出到模板块后（边界保护）

##### 关键特性

**保护性删除示例**

```
初始：【三】（光标在 "三" 后）
  ↓ Backspace
结果：【​】（变成空模板块，不删除外壳）
```

**渐进式退出示例**

```
初始：【​】（光标在内部）
  ↓ Backspace（第一次）
结果：|【​】（光标跳出，模板块保留）
  ↓ Backspace（第二次）
结果：（整个模板块被删除）
```

**边界保护示例**（防止文本被吸入模板块）

```
初始：我是【张三】，来自（光标在 "三" 后）
  ↓ Delete
结果：我是【张三】|，来自 ✅（光标跳出，不破坏边界）

修复前问题：我是【张三，】来自 ❌（逗号被吸入模板块）
```

#### 3. 空白模板块

**显示规则**

- 最小宽度：32px（紧凑模式 24px）
- 内部自动插入零宽字符占位
- 保持可点击和可编辑状态

**删除规则**

- 从外部删除：直接删除整个模板块
- 从内部删除：先跳出到模板块前/后，再删除

### 技术实现

#### 节点结构

模板块基于 Tiptap 的非 atom 节点实现：

```typescript
{
  name: 'template',
  group: 'inline',
  inline: true,
  content: 'text*',  // 允许内部有文本
  atom: false,       // 非 atom，允许光标进入
}
```

#### 零宽字符管理

系统自动在以下位置插入零宽字符（U+200B）：

1. 段落首个节点是模板块 → 前面插入
2. 段落末个节点是模板块 → 后面插入
3. 连续两个模板块 → 中间插入
4. 模板块内容为空 → 内部插入

**注意**：当前实现中，模板块和普通文本之间**不插入**零宽字符，这是为了避免零宽字符被合并到文本节点。

#### 光标位置计算

使用 ProseMirror 的 `TextSelection.create()` API：

```typescript
// 进入模板块末尾
const nextCursorPos = $from.pos - 2 // 跳过零宽字符
dispatch(state.tr.setSelection(TextSelection.create(state.doc, nextCursorPos)))

// 跳出到模板块前
const nodePos = $from.before()
dispatch(state.tr.setSelection(TextSelection.create(state.doc, nodePos)))

// 跳出到模板块后
const nodePos = $from.after()
dispatch(state.tr.setSelection(TextSelection.create(state.doc, nodePos)))
```

#### 删除逻辑实现

关键代码片段（详见 `plugins.ts`）：

```typescript
// 边界保护：防止 ProseMirror 默认行为破坏模板块边界
if ($from.pos === $from.end() && content.length > 0 && content !== ZERO_WIDTH_CHAR) {
  const nodePos = $from.after()
  dispatch(state.tr.setSelection(TextSelection.create(state.doc, nodePos)))
  event.preventDefault()
  return true
}

// 保护性删除：删除最后一个字符时保留模板块
if ($from.pos === $from.end() && content.length === 1 && content !== ZERO_WIDTH_CHAR) {
  const pos = $from.pos - 1
  dispatch(state.tr.insertText(ZERO_WIDTH_CHAR, pos, pos + 1))
  event.preventDefault()
  return true
}

// 零宽字符清理：删除模板块时一并删除周围零宽字符
if (beforeNode.type.name === 'template' && isEmpty) {
  let deleteStart = $from.pos - beforeNode.nodeSize
  let deleteEnd = $from.pos

  if (prevPrevNode?.text?.endsWith(ZERO_WIDTH_CHAR)) deleteStart -= 1
  if (afterNode?.text?.startsWith(ZERO_WIDTH_CHAR)) deleteEnd += 1

  dispatch(state.tr.delete(deleteStart, deleteEnd))
  event.preventDefault()
  return true
}
```

### 已知限制

1. **不支持嵌套** - 模板块内部只能包含纯文本，不支持嵌套其他模板块
2. **不支持格式化** - 模板块内部不支持粗体、斜体等格式
3. **浏览器兼容性** - 基于现代浏览器的 contenteditable 实现
4. **性能考虑** - 建议单个输入框中的模板块数量控制在 20 个以内
5. **模板块与文本粘连** - 当前实现中模板块和文本之间不插入零宽字符，可能导致删除后粘连

### 常见问题

**Q: 为什么有时看到零宽字符？**  
A: 零宽字符用于光标定位，正常情况下不可见。如果可见，可能是字体渲染问题。

**Q: 如何自定义模板块样式？**  
A: 通过 CSS 变量或覆盖 `.template` 类样式。

**Q: 模板块可以包含换行吗？**  
A: 不支持。模板块是 inline 节点，内部只能包含单行文本。

**Q: 如何禁用模板功能？**  
A: 不传递 `template-data` 属性即可，组件会自动禁用模板相关功能。

**Q: 删除模板块后为什么有时会粘连？**  
A: 这是已知限制，当前实现在模板块和文本之间不插入零宽字符。可以通过修改 `handleZeroWidthCharLogic` 函数解决。

**Q: 如何查看完整的删除逻辑？**  
A: 请参考 [delete-logic-summary.md](./design-template-delete-logic) 文档。
