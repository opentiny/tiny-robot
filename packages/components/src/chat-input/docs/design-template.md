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
if (beforeNode && beforeNode.type.name === 'templateBlock') {
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
    const paragraph = state.schema.nodes.paragraph.create(
      {},
      lines[i] ? state.schema.text(lines[i]) : null
    )
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

| 特性 | Other Design | 当前实现 |
|------|-------------|----------|
| 自定义节点类型 | input-slot, select-slot, skill-slot | template-block |
| 节点可编辑性 | input-slot 可编辑 | template-block 通过 Vue 组件编辑 |
| 输入法处理 | 有专门的 composition 处理 | 暂未实现（可后续添加） |
| 节点删除标记 | 使用 `DeleteAble` meta | 直接删除 |

### 简化之处

当前实现相比 Other Design 更简洁：

1. **单一节点类型** - 只有 `template-block`，逻辑更简单
2. **无需 placeholder** - 模板块内容由 Vue 组件管理
3. **更少的边界情况** - 不需要处理多种 slot 类型的交互

## 使用示例

### 基本使用

```typescript
import { TemplateBlock } from './extensions/template-block'

const editor = useEditor({
  extensions: [
    StarterKit,
    TemplateBlock, // 自动包含所有插件
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

**从模板块右侧删除（Backspace）**
- 有内容：删除最后一个字符
- 无内容：删除整个模板块

**在模板块内部删除（Backspace）**
- 有内容：删除单个字符
- 删除最后一个字符：模板块变空但保留（显示最小宽度）
- 空模板块内继续删除：光标跳出到模板块前，模板块保留

**从模板块左侧删除（Delete）**
- 遵循类似的规则

#### 3. 空白模板块

**显示规则**
- 最小宽度：32px（紧凑模式 24px）
- 内部自动插入零宽字符占位
- 保持可点击和可编辑状态

**删除规则**
- 从外部删除：删除整个模板块
- 从内部删除：跳出到模板块前，保留模板块

### 技术实现

#### 节点结构

模板块基于 Tiptap 的非 atom 节点实现：

```typescript
{
  name: 'templateBlock',
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
4. 模板块后跟文本 → 中间插入
5. 模板块内容为空 → 内部插入

#### 光标位置计算

使用 Prootherrror 的 `TextSelection.create()` API：

```typescript
// 进入模板块末尾
const nextCursorPos = $from.pos - 2  // 跳过零宽字符
dispatch(state.tr.setSelection(TextSelection.create(state.doc, nextCursorPos)))
```

### 测试用例

#### 基础功能测试

**TC-01: 插入模板**
- 操作：点击"模板1"按钮
- 预期：模板内容插入，光标在第一个模板块"张三"内部末尾

**TC-02: 编辑模板块**
- 操作：在"张三"模板块内输入文字
- 预期：内容正常更新，`templateData` 同步变化

**TC-03: 清空模板**
- 操作：点击"清空"按钮
- 预期：所有内容清空，`templateData` 变为空数组

#### 光标导航测试

**TC-04: 右箭头进入模板块**
- 前置：光标在"你好，我是"后面
- 操作：按右箭头 →
- 预期：光标进入"张三"模板块开头

**TC-05: 左箭头进入模板块**
- 前置：光标在"，来自"前面
- 操作：按左箭头 ←
- 预期：光标进入"张三"模板块末尾

**TC-06: 模板块内左箭头跳出**
- 前置：光标在"张三"的"张"前面
- 操作：按左箭头 ←
- 预期：光标跳出到"我是"后面

**TC-07: 模板块内右箭头跳出**
- 前置：光标在"张三"的"三"后面
- 操作：按右箭头 →
- 预期：光标跳出到"，来自"前面

**TC-08: 连续导航**
- 前置：光标在"你好"后面
- 操作：连续按右箭头 →
- 预期：光标依次经过"，我是"、进入"张三"、跳出、进入"北京"等

#### 删除功能测试

**TC-09: 删除模板块内字符**
- 前置：光标在"张三"的"三"后面
- 操作：按 Backspace
- 预期：删除"三"，模板块变成"张"

**TC-10: 删除到空模板块**
- 前置：模板块内容为"张"
- 操作：按 Backspace
- 预期：模板块变空，显示最小宽度 32px

**TC-11: 空模板块内删除**
- 前置：模板块为空，光标在内部
- 操作：按 Backspace
- 预期：光标跳出到模板块前，模板块保留

**TC-12: 从右侧删除有内容的模板块**
- 前置：光标在"张三"后面
- 操作：按 Backspace
- 预期：删除"三"，模板块变成"张"

**TC-13: 从右侧删除空模板块（后无内容）**
- 前置：清空"北京"模板块，光标在"！"前面
- 操作：按 Backspace
- 预期：整个空模板块被删除

**TC-14: 从右侧删除空模板块（后有文本）**
- 前置：清空"张三"模板块，光标在"，来自"的"，"前面
- 操作：按 Backspace
- 预期：整个空模板块被删除

**TC-15: 从右侧删除空模板块（后有模板块）**
- 前置：清空"张三"模板块，光标在"北京"模板块前
- 操作：按 Backspace
- 预期：整个空模板块被删除

#### 边界情况测试

**TC-16: 空白占位显示**
- 前置：清空模板块
- 预期：模板块保持可见，最小宽度 32px，可点击进入

**TC-17: 多个连续模板块**
- 前置：插入"[模板1][模板2][模板3]"
- 操作：使用箭头键导航
- 预期：可以在所有模板块之间自由移动

**TC-18: 模板块在段落开头**
- 前置：模板块是段落第一个节点
- 操作：光标在模板块前，按左箭头
- 预期：光标移到上一段落

**TC-19: 模板块在段落末尾**
- 前置：模板块是段落最后一个节点
- 操作：光标在模板块后，按右箭头
- 预期：光标移到下一段落

**TC-20: 撤销/重做**
- 操作：编辑模板块后按 Ctrl+Z / Ctrl+Y
- 预期：内容正确撤销和重做，零宽字符结构保持正确

#### 数据同步测试

**TC-21: 外部更新 templateData**
- 操作：通过 `v-model:template-data` 更新数据
- 预期：编辑器内容同步更新

**TC-22: 内部编辑同步到外部**
- 操作：在编辑器内修改模板块内容
- 预期：`templateData` 自动更新

**TC-23: 方法调用 setTemplateData**
- 操作：调用 `chatInputRef.value.setTemplateData(items)`
- 预期：内容更新，光标聚焦到第一个模板块

**TC-24: 方法调用 clearTemplateData**
- 操作：调用 `chatInputRef.value.clearTemplateData()`
- 预期：所有模板块被清除

**TC-25: 方法调用 getTemplateData**
- 操作：调用 `chatInputRef.value.getTemplateData()`
- 预期：返回当前的模板数据数组

### 已知限制

1. **不支持嵌套** - 模板块内部只能包含纯文本，不支持嵌套其他模板块
2. **不支持格式化** - 模板块内部不支持粗体、斜体等格式
3. **浏览器兼容性** - 基于现代浏览器的 contenteditable 实现
4. **性能考虑** - 建议单个输入框中的模板块数量控制在 20 个以内

### 常见问题

**Q: 为什么有时看到零宽字符？**  
A: 零宽字符用于光标定位，正常情况下不可见。如果可见，可能是字体渲染问题。

**Q: 如何自定义模板块样式？**  
A: 通过 CSS 变量或覆盖 `.template-block` 类样式。

**Q: 模板块可以包含换行吗？**  
A: 不支持。模板块是 inline 节点，内部只能包含单行文本。

**Q: 如何禁用模板功能？**  
A: 不传递 `template-data` 属性即可，组件会自动禁用模板相关功能。

