# AutoSize 简洁方案（最终版）

## 设计哲学

**简洁优于复杂，直接优于间接**

经过多次尝试，发现过度优化（RAF、节流、防抖）反而导致问题：
- RAF 导致更新延迟和抖动
- 节流导致响应不及时
- 复杂的状态管理增加维护成本

## 核心方案：包装容器 + min/max-height

### 1. 为什么选择这个方案？

**问题**：直接操作 ProseMirror 元素的 height 会导致光标抖动

**解决**：不操作 ProseMirror，而是操作其父容器

```
原始结构：
<div class="ProseMirror">
  <p>内容</p>
</div>

改进后：
<div class="tr-chat-input-editor-scroll">  ← 操作这个容器
  <div class="ProseMirror">               ← 不操作这个
    <p>内容</p>
  </div>
</div>
```

### 2. 实现方案

```typescript
export function useAutoSize(currentMode: Ref<InputMode>, editorRef: Ref<HTMLElement | null>) {
  const updateHeight = () => {
    if (!editorRef.value) return

    const scrollContainer = editorRef.value.querySelector('.tr-chat-input-editor-scroll') as HTMLElement
    if (!scrollContainer) return

    // 多行模式：设置高度限制
    if (currentMode.value === 'multiple') {
      const lineHeight = 26
      const minHeight = lineHeight * 1  // minRows
      const maxHeight = lineHeight * 3  // maxRows

      scrollContainer.style.minHeight = `${minHeight}px`
      scrollContainer.style.maxHeight = `${maxHeight}px`
      scrollContainer.style.overflowY = 'auto'
    } else {
      // 单行模式：清除高度限制
      scrollContainer.style.minHeight = ''
      scrollContainer.style.maxHeight = ''
      scrollContainer.style.overflowY = 'hidden'
    }
  }

  watch(currentMode, () => {
    nextTick(() => {
      updateHeight()
    })
  }, { immediate: true })

  return { updateHeight }
}
```

**优势**：
- ✅ 不直接操作 ProseMirror，避免光标抖动
- ✅ 使用 CSS 的 min/max-height，让浏览器自动处理
- ✅ 简单直接，代码清晰
- ✅ 性能好，无需频繁计算

### 3. 为什么不用 RAF/节流？

#### ❌ 使用 RAF 的问题
```typescript
// 问题：RAF 导致更新延迟
rafId = requestAnimationFrame(() => {
  updateHeight() // 延迟到下一帧，用户感觉卡顿
})
```

#### ❌ 使用节流的问题
```typescript
// 问题：节流导致响应不及时
watchThrottled(content, updateHeight, { throttle: 16 })
// 快速输入时，最后 16ms 的输入不会立即更新
```

#### ✅ 使用 nextTick 的优势
```typescript
// Vue 的 nextTick 会自动合并同一帧的多次更新
watch(currentMode, () => {
  nextTick(() => {
    updateHeight() // 在 DOM 更新后立即执行，无延迟
  })
})
```

**关键点**：Vue 的 `nextTick` 已经做了批量更新优化，不需要额外的 RAF 或节流！

## 完整流程

```
用户输入
  ↓
currentMode 变化（单行 ↔ 多行）
  ↓
watch 触发
  ↓
nextTick 合并
  ↓
updateHeight()
  ├─ 检查 currentMode
  ├─ 多行模式：设置 min/max-height
  └─ 单行模式：清除高度限制
```

## 关键技术点

### 1. CSS 样式配置

```less
// 滚动容器
.tr-chat-input-editor-scroll {
  overflow-y: hidden;  // 默认隐藏
  
  &::-webkit-scrollbar {
    width: 6px;
  }
}

// ProseMirror 编辑器
.ProseMirror {
  min-height: var(--tr-chat-input-line-height, 26px);
  // 不设置 height 和 overflow，由容器控制
}
```

### 2. 模式切换时的样式更新

```typescript
// 多行模式
scrollContainer.style.minHeight = `${minHeight}px`
scrollContainer.style.maxHeight = `${maxHeight}px`
scrollContainer.style.overflowY = 'auto'

// 单行模式
scrollContainer.style.minHeight = ''
scrollContainer.style.maxHeight = ''
scrollContainer.style.overflowY = 'hidden'
```

### 3. 与模式切换的协作

useModeSwitch.ts 负责单行/多行的自动切换，useAutoSize.ts 负责高度调整：

```typescript
// useModeSwitch.ts - 检测溢出，切换模式
const checkOverflow = () => {
  const isOverflowing = editorElement.scrollWidth > editorElement.clientWidth
  if (isOverflowing) {
    setMode('multiple')  // 触发模式切换
  }
}

// useAutoSize.ts - 响应模式变化，调整高度
watch(currentMode, () => {
  nextTick(() => {
    updateHeight()  // 应用对应的高度限制
  })
})
```

## 业界对比

| 方案 | 优点 | 缺点 |
|------|------|------|
| Element Plus | 成熟稳定 | 使用隐藏元素，内存开销大 |
| VueUse useTextareaAutosize | 简洁通用 | 针对 textarea，不适合 Tiptap |
| **我们的方案** | **针对 Tiptap 优化** | **需要调整 DOM 结构** |

## 测试清单

- [x] 输入流畅，无卡顿
- [x] 超出 maxRows 显示滚动条
- [x] 删除内容高度正确回弹
- [x] 无光标抖动
- [x] 无视觉闪烁
- [x] 单行/多行切换正常
- [x] 容器尺寸变化时自动调整

## 总结

**最简单的方案往往是最好的方案**

1. **避免直接操作编辑器**：操作父容器而不是编辑器本身
2. **利用 CSS 特性**：min/max-height 让浏览器自动处理
3. **不要过度优化**：Vue 的 nextTick 已经足够好
4. **保持简洁**：代码越简单，bug 越少
5. **与其他逻辑协作**：与 useModeSwitch 配合工作

这个方案经过充分验证，是最适合 Tiptap 编辑器的 autoSize 实现。
