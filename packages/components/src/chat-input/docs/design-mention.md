# 技能提及功能方案文档

## 功能概述

技能提及（Skill Mention）功能允许用户通过输入 `@` 字符快速引用预设的技能助手，类似于社交媒体中的 @提及 功能。选择技能后，会在输入框中插入一个技能标签，并在提交时自动附带该技能的预设内容。

### 核心特性

1. **@ 触发机制** - 输入 @ 字符自动弹出技能选择面板
2. **实时搜索过滤** - 支持输入关键词过滤技能列表
3. **键盘导航** - 支持上下箭头选择、Enter/Tab 确认、Esc 取消
4. **鼠标交互** - 支持鼠标悬停高亮、点击选择
5. **智能删除** - Backspace 删除技能块时保留 @ 符号，可继续选择
6. **Atom 节点** - 技能块作为不可编辑的整体，避免内容被破坏

## 问题分析

### 设计目标

1. **快速引用** - 用户无需手动输入完整的技能预设内容
2. **视觉区分** - 技能标签与普通文本有明显的视觉差异
3. **流畅交互** - 键盘和鼠标操作都应该流畅自然
4. **数据完整** - 提交时能正确提取技能的预设内容

### 与模板功能的对比

| 特性     | 模板块 (Template Block) | 技能提及 (Skill Mention) |
| -------- | ----------------------- | ------------------------ |
| 节点类型 | 非 atom，可编辑内容     | atom，不可编辑           |
| 触发方式 | 手动插入                | @ 字符触发               |
| 内容编辑 | 支持内部编辑            | 不支持，整体替换         |
| 删除行为 | 字符级删除              | 块级删除，但保留 @       |
| 零宽字符 | 需要管理                | 不需要（atom 自动处理）  |
| 使用场景 | 表单填充、内容模板      | 快速引用、技能切换       |

## 技术实现

### 1. 节点定义

技能提及基于 Tiptap 的 **atom 节点**实现：

```typescript
{
  name: 'skillMention',
  group: 'inline',
  inline: true,
  atom: true,        // 关键：作为不可分割的整体
  selectable: true,  // 可选中
  draggable: false,  // 不可拖拽
}
```

**Atom 节点的优势：**

- 光标无法进入节点内部
- 删除时作为整体删除
- 不需要管理零宽字符
- 避免内容被意外修改

### 2. Suggestion 插件

基于 ProseMirror 插件实现建议功能：

#### 2.1 触发检测

监听文档变化，检测 @ 字符：

```typescript
function findSuggestion(state, char, allowSpaces) {
  const { $from } = state.selection
  const textBefore = $from.nodeBefore?.text || ''

  // 查找最后一个 @ 的位置
  const lastCharIndex = textBefore.lastIndexOf(char)
  if (lastCharIndex === -1) return null

  // 提取查询文本
  const query = textBefore.slice(lastCharIndex + char.length)

  // 不允许空格（避免误触发）
  if (!allowSpaces && query.includes(' ')) return null

  return {
    range: { from, to },
    query,
  }
}
```

**触发条件：**

1. 输入 @ 字符
2. @ 后面的文本不包含空格
3. 光标在 @ 后面

#### 2.2 技能过滤

根据查询文本过滤技能列表：

```typescript
function filterSkills(skills, query) {
  if (!query) return skills

  const lowerQuery = query.toLowerCase()

  return skills.filter((skill) => {
    // 匹配标签
    if (skill.label.toLowerCase().includes(lowerQuery)) {
      return true
    }
    // 匹配预设内容
    if (skill.preset?.toLowerCase().includes(lowerQuery)) {
      return true
    }
    return false
  })
}
```

**过滤规则：**

- 空查询：显示所有技能
- 有查询：匹配标签或预设内容（不区分大小写）

#### 2.3 弹窗定位

使用 `@floating-ui/dom` 实现精确定位：

```typescript
import { computePosition, flip, shift, offset, autoUpdate } from '@floating-ui/dom'

// 自动更新位置
cleanup = autoUpdate(referenceElement, popup, () => {
  computePosition(referenceElement, popup, {
    placement: 'bottom-start', // 默认在下方左对齐
    middleware: [
      offset(8), // 偏移 8px
      flip(), // 空间不足时翻转
      shift({ padding: 8 }), // 保持在视口内
    ],
  }).then(({ x, y }) => {
    popup.style.left = `${x}px`
    popup.style.top = `${y}px`
  })
})
```

**定位策略：**

- 参考元素：`.mention-trigger`（高亮的 @ 文本）
- 默认位置：下方左对齐
- 自动翻转：空间不足时显示在上方
- 自动调整：保持在视口内，避免被遮挡

### 3. 键盘交互

#### 3.1 导航和选择

**组件内部处理：**

```typescript
function onKeyDown({ event }) {
  // 上箭头：选择上一个
  if (event.key === 'ArrowUp') {
    selectedIndex.value = Math.max(0, selectedIndex.value - 1)
    return true
  }

  // 下箭头：选择下一个
  if (event.key === 'ArrowDown') {
    selectedIndex.value = Math.min(skills.length - 1, selectedIndex.value + 1)
    return true
  }

  // Enter/Tab：确认选择
  if (event.key === 'Enter' || event.key === 'Tab') {
    selectItem(selectedIndex.value)
    return true
  }

  return false
}
```

**插件调用：**

```typescript
handleKeyDown(view, event) {
  // 面板激活时，交给组件处理
  if (pluginState?.active) {
    return component?.ref?.onKeyDown?.({ event }) || false
  }
}
```

#### 3.2 智能删除

**Backspace 删除技能块：**

```typescript
if (event.key === 'Backspace') {
  const { $from } = view.state.selection

  // 检查光标前面是否是技能块
  if ($from.nodeBefore?.type.name === 'skillMention') {
    event.preventDefault()

    const nodePos = $from.pos - $from.nodeBefore.nodeSize

    // 删除技能块
    tr.delete(nodePos, $from.pos)

    // 插入 @ 字符
    tr.insertText(char, nodePos)

    // 光标定位到 @ 后面
    tr.setSelection(TextSelection.create(tr.doc, nodePos + 1))

    view.dispatch(tr)
    return true
  }
}
```

**删除逻辑：**

1. 检测光标前面是否是技能块
2. 删除整个技能块
3. 插入 @ 字符
4. 光标定位到 @ 后面
5. 自动触发建议面板（因为检测到 @）

### 4. 鼠标交互

#### 4.1 避免失焦问题

使用 `<button>` 元素而不是 `<div>`：

```vue
<button type="button" @click="selectItem(index)" @mouseenter="onHover(index)">
  <span class="skill-icon">{{ skill.icon }}</span>
  <span class="skill-label">{{ skill.label }}</span>
</button>
```

**关键点：**

- `type="button"` 避免表单提交
- 点击不会导致编辑器失焦
- 完整的按钮样式重置（border、background、padding 等）

#### 4.2 悬停高亮

```typescript
function onHover(index: number) {
  selectedIndex.value = index
}
```

鼠标悬停时更新选中索引，实现视觉反馈。

### 5. Vue 组件渲染

#### 5.1 技能块视图

```vue
<template>
  <NodeViewWrapper as="span" class="skill-mention" :data-id="node.attrs.id" :data-preset="node.attrs.preset"
    >@{{ node.attrs.label }}</NodeViewWrapper
  >
</template>
```

**注意事项：**

- 内容必须在同一行，避免渲染出多余空格
- 使用 `NodeViewWrapper` 包裹，自动处理 ProseMirror 集成
- 通过 data 属性存储技能信息

#### 5.2 建议列表

```vue
<template>
  <div class="skill-mention-list">
    <button
      v-for="(skill, index) in skills"
      :key="skill.id"
      :class="{ 'is-selected': index === selectedIndex }"
      @click="selectItem(index)"
      @mouseenter="onHover(index)"
    >
      <span class="skill-icon">{{ skill.icon }}</span>
      <span class="skill-label">{{ skill.label }}</span>
    </button>
  </div>
</template>
```

**设计原则：**

```vue
<template>
  <ChatInput v-model="content" :skills="skills" @submit="handleSubmit" />
</template>

<script setup>
const skills = [
  {
    id: '1',
    label: '小小画家',
    icon: '🎨',
    preset: '你是一个专业的绘画助手...',
  },
  {
    id: '2',
    label: '代码助手',
    icon: '💻',
    preset: '你是一个专业的编程助手...',
  },
]

function handleSubmit(value, context) {
  // value: 默认拼接后的内容（预设 + 换行 + 用户文本）
  console.log('提交内容：', value)

  // context: 包含原始数据，可用于自定义处理
  // context.presets: string[] - 所有技能的预设内容
  // context.userText: string - 用户输入的文本
  console.log('技能预设：', context.presets)
  console.log('用户文本：', context.userText)
}
</script>
```

### 交互流程

```
1. 用户输入 "@"
   → 触发建议面板
   → 显示所有技能

2. 用户继续输入 "画"
   → 过滤技能列表
   → 只显示包含 "画" 的技能（如 "小小画家"）

3. 用户按下箭头 ↓
   → 选中第一个技能
   → 高亮显示

4. 用户按 Enter
   → 插入技能块 "@小小画家"
   → 关闭建议面板
   → 光标移到技能块后面

5. 用户按 Backspace
   → 删除技能块
   → 插入 "@" 字符
   → 重新触发建议面板
```

## 测试用例

### 基础功能测试

**TC-01: @ 触发建议面板**

- 操作：输入 `@`
- 预期：弹出技能选择面板，显示所有技能

**TC-02: 搜索过滤**

- 操作：输入 `@画`
- 预期：只显示标签或预设包含 "画" 的技能

**TC-03: 空格关闭面板**

- 操作：输入 `@ ` (@ 后面加空格)
- 预期：建议面板关闭

**TC-04: 选择技能**

- 操作：输入 `@`，按下箭头选择，按 Enter
- 预期：插入技能块，面板关闭，光标在技能块后

**TC-05: 鼠标选择**

- 操作：输入 `@`，鼠标点击某个技能
- 预期：插入技能块，面板关闭，编辑器保持焦点

### 键盘导航测试

**TC-06: 上下箭头导航**

- 前置：建议面板打开
- 操作：按上下箭头
- 预期：选中项正确切换，不会超出范围

**TC-07: Enter 确认**

- 前置：建议面板打开，选中某个技能
- 操作：按 Enter
- 预期：插入选中的技能块

**TC-08: Tab 确认**

- 前置：建议面板打开，选中某个技能
- 操作：按 Tab
- 预期：插入选中的技能块

**TC-09: Esc 取消**

- 前置：建议面板打开
- 操作：按 Esc
- 预期：面板关闭，@ 和查询文本保留

### 删除功能测试

**TC-10: Backspace 删除技能块**

- 前置：光标在技能块 `@小小画家` 后面
- 操作：按 Backspace
- 预期：技能块被删除，插入 `@`，建议面板打开

**TC-11: 选区删除技能块**

- 前置：选中技能块 `@小小画家`
- 操作：按 Backspace 或 Delete
- 预期：技能块被删除，不插入 `@`

**TC-12: Delete 删除技能块**

- 前置：光标在技能块 `@小小画家` 前面
- 操作：按 Delete
- 预期：技能块被删除

### 鼠标交互测试

**TC-13: 悬停高亮**

- 前置：建议面板打开
- 操作：鼠标悬停在某个技能上
- 预期：该技能高亮显示

**TC-14: 点击选择**

- 前置：建议面板打开
- 操作：点击某个技能
- 预期：插入技能块，编辑器保持焦点

**TC-15: 点击不失焦**

- 前置：建议面板打开，编辑器有焦点
- 操作：点击技能
- 预期：编辑器焦点不丢失

### 弹窗定位测试

**TC-16: 默认位置**

- 前置：输入框在屏幕中间
- 操作：输入 `@`
- 预期：面板显示在 @ 下方左对齐

**TC-17: 空间不足翻转**

- 前置：输入框在屏幕底部
- 操作：输入 `@`
- 预期：面板显示在 @ 上方

**TC-18: 视口边界调整**

- 前置：输入框在屏幕右侧
- 操作：输入 `@`
- 预期：面板向左调整，不超出视口

**TC-19: 滚动时更新位置**

- 前置：建议面板打开
- 操作：滚动页面
- 预期：面板位置自动更新，保持对齐

### 数据提取测试

**TC-20: 单个技能提取**

- 前置：输入 `你好 @小小画家`
- 操作：提交
- 预期：提取到 "小小画家" 的预设内容

**TC-21: 多个技能提取**

- 前置：输入 `@小小画家 和 @代码助手`
- 操作：提交
- 预期：提取到两个技能的预设内容，按顺序组合

**TC-22: 无技能提取**

- 前置：输入 `普通文本`
- 操作：提交
- 预期：只返回普通文本，无预设内容

### 边界情况测试

**TC-23: 连续两个技能块**

- 操作：插入 `@小小画家@代码助手`
- 预期：两个技能块正常显示，光标可以在中间定位

**TC-24: 技能块在开头**

- 操作：插入 `@小小画家 你好`
- 预期：技能块正常显示，光标可以在前面定位

**TC-25: 技能块在末尾**

- 操作：插入 `你好 @小小画家`
- 预期：技能块正常显示，光标可以在后面定位

**TC-26: 空技能列表**

- 前置：`skills` 为空数组
- 操作：输入 `@`
- 预期：不显示建议面板

**TC-27: 搜索无结果**

- 操作：输入 `@xyz`（不存在的技能）
- 预期：建议面板关闭或显示 "未找到匹配的技能"

**TC-28: 撤销/重做**

- 操作：插入技能块后按 Ctrl+Z / Ctrl+Y
- 预期：技能块正确撤销和重做

**TC-29: 复制粘贴技能块**

- 操作：复制包含技能块的文本，粘贴到其他位置
- 预期：技能块正确复制，属性完整

**TC-30: 多行输入**

- 操作：输入 `@小小画家`，按 Enter 换行，继续输入
- 预期：技能块在第一行，第二行正常输入

## 与其他实现的对比

### 与 Tiptap 官方 Mention 的对比

| 特性     | Tiptap Mention | 当前实现         |
| -------- | -------------- | ---------------- |
| 触发字符 | 可配置         | 固定 @           |
| 节点类型 | atom           | atom             |
| 建议来源 | 异步函数       | 同步数组         |
| 弹窗定位 | Tippy.js       | @floating-ui/dom |
| 键盘导航 | 组件内部       | 组件内部         |
| 删除行为 | 整体删除       | 删除后保留 @     |

### 优化点

1. **统一技术栈** - 使用 @floating-ui/dom 与 Tiptap 3.0 保持一致
2. **智能删除** - Backspace 删除后保留 @，可继续选择
3. **简化 UI** - 只显示图标和标签，去除描述和分组
4. **避免失焦** - 使用 button 元素，点击不失焦

### 简化之处

相比完整的 Mention 实现，当前方案更简洁：

1. **同步数据** - 不需要处理异步加载
2. **固定触发** - 只支持 @ 字符
3. **单一用途** - 专门用于技能引用

## 已知限制

1. **不支持异步加载** - 技能列表必须预先提供
2. **不支持多字符触发** - 只支持单个 @ 字符
3. **不支持嵌套** - 技能块内部不能包含其他节点
4. **不支持编辑** - 技能块是 atom 节点，不可编辑内容
5. **浏览器兼容性** - 依赖现代浏览器的 contenteditable

## 后续优化方向

### 1. 异步加载支持

```typescript
interface SkillMentionOptions {
  skills: SkillItem[] | ((query: string) => Promise<SkillItem[]>)
}
```

支持异步函数，实现动态加载和搜索。

### 2. 多字符触发

```typescript
interface SkillMentionOptions {
  char: string | string[] // 支持 ['@', '#', '/']
}
```

支持多种触发字符，用于不同场景。

### 3. 自定义渲染

```typescript
interface SkillMentionOptions {
  renderLabel: (skill: SkillItem) => string
  renderItem: (skill: SkillItem) => VNode
}
```

允许自定义技能块和列表项的渲染。

### 4. 性能优化

- 虚拟滚动：技能列表很长时使用虚拟滚动
- 防抖搜索：输入时防抖，减少过滤次数
- 缓存结果：缓存过滤结果，避免重复计算

### 5. 可访问性

- ARIA 标签：添加 `role="listbox"` 等标签
- 键盘快捷键：支持 Ctrl+Space 打开面板
- 屏幕阅读器：确保技能块被正确读取

## 总结

技能提及功能通过以下设计实现了流畅的用户体验：

✅ **Atom 节点** - 作为不可分割的整体，避免内容被破坏  
✅ **Suggestion 插件** - 自动检测 @ 触发，实时过滤技能  
✅ **Floating UI** - 精确定位弹窗，自动处理边界情况  
✅ **键盘导航** - 上下箭头选择，Enter/Tab 确认，Esc 取消  
✅ **智能删除** - Backspace 删除后保留 @，可继续选择  
✅ **避免失焦** - 使用 button 元素，点击不影响编辑器焦点

相比模板块功能，技能提及更适合快速引用和切换的场景，而模板块更适合需要编辑内容的场景。两者结合使用，可以满足不同的业务需求。
