# Chat-Input AutoSize 需求分析与解决方案评估

## 一、需求描述

### 1.1 功能需求

| 需求项 | 描述 | 优先级 |
|--------|------|--------|
| 最小高度 | 内容少于 minRows 时，显示 minRows 对应的高度 | P0 |
| 自动增长 | 内容在 minRows 和 maxRows 之间时，高度随内容自动增长 | P0 |
| 最大高度 | 内容超过 maxRows 时，固定为 maxRows 高度 | P0 |
| 滚动条显示 | 超过 maxRows 时显示垂直滚动条 | P0 |
| 高度回弹 | 删除内容时，高度能正确缩小 | P0 |
| 光标跟随 | 输入时光标始终可见（自动滚动到光标位置） | P0 |

### 1.2 性能需求

| 需求项 | 描述 | 优先级 |
|--------|------|--------|
| 输入流畅 | 快速输入时无卡顿 | P0 |
| 无抖动 | 光标和内容不能上下抖动 | P0 |
| 无闪烁 | 高度变化时不能有视觉闪烁 | P1 |

### 1.3 兼容性需求

| 需求项 | 描述 | 优先级 |
|--------|------|--------|
| 单行/多行切换 | 模式切换时样式正确重置 | P0 |
| CSS 兼容 | 与现有 CSS 样式不冲突 | P0 |
| Tiptap 兼容 | 与 Tiptap/ProseMirror 编辑器兼容 | P0 |

---

## 二、问题根因分析

### 2.1 Tiptap/ProseMirror 的特殊性

```
DOM 结构：
<div class="ProseMirror">           ← 我们操作的元素
  <p>第一行</p>                      ← 实际内容
  <p>第二行</p>
  <p>...</p>
</div>
```

**特殊点**：
1. ProseMirror 使用 `contenteditable`，不是 `<textarea>`
2. 内容是多个 `<p>` 元素，不是纯文本
3. 编辑器有自己的滚动和光标管理机制
4. `scrollHeight` 的计算受 `height` 和 `overflow` 影响

### 2.2 高度计算的矛盾

```
要获取真实内容高度：
  → 需要设置 height: auto
  → 但这会触发重排
  → 导致光标抖动

要避免光标抖动：
  → 不能改变 height
  → 但无法获取真实内容高度
```

**这是一个根本性的矛盾**

---

## 三、推荐方案：包装容器方案 ✅ 已实现

### 3.1 方案思路

**核心思想**：不操作 ProseMirror 元素，而是操作其父容器

```
<div class="editor-wrapper" style="height: Xpx; overflow-y: auto">
  <div class="ProseMirror">
    ...内容...
  </div>
</div>
```

**优势**：
- ✅ 不直接操作 ProseMirror，避免光标抖动
- ✅ 滚动条在包装容器上，不影响编辑器
- ✅ 简单直接，改动最小
- ✅ 与现有代码兼容性好

### 3.2 实现现状

#### DOM 结构

```vue
<!-- editor-content/index.vue -->
<template>
  <div ref="editorRef" class="tr-chat-input-editor-wrapper">
    <div class="tr-chat-input-editor-scroll">  <!-- 滚动容器 -->
      <TiptapEditorContent :editor="editor" class="tr-chat-input-editor-content" />
    </div>
  </div>
</template>
```

**说明**：
- `tr-chat-input-editor-wrapper`：外层包装容器
- `tr-chat-input-editor-scroll`：滚动容器，高度由 JS 控制
- `ProseMirror`：编辑器内容，自然高度

#### CSS 配置

```less
.tr-chat-input-editor-scroll {
  overflow-y: hidden;  // 默认隐藏，多行模式时改为 auto
  
  &::-webkit-scrollbar {
    width: 6px;
  }
}

.ProseMirror {
  min-height: var(--tr-chat-input-line-height, 26px);
}
```

#### useAutoSize 实现

```typescript
export function useAutoSize(currentMode: Ref<InputMode>, editorRef: Ref<HTMLElement | null>) {
  const updateHeight = () => {
    if (!editorRef.value) return

    const scrollContainer = editorRef.value.querySelector('.tr-chat-input-editor-scroll') as HTMLElement
    if (!scrollContainer) return

    if (currentMode.value === 'multiple') {
      const lineHeight = 26
      const minHeight = lineHeight * 1  // minRows
      const maxHeight = lineHeight * 3  // maxRows

      scrollContainer.style.minHeight = `${minHeight}px`
      scrollContainer.style.maxHeight = `${maxHeight}px`
      scrollContainer.style.overflowY = 'auto'
    } else {
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

---

## 四、模式切换优化

同时优化了单行/多行模式的切换逻辑（useModeSwitch.ts）：

**改进点**：
1. **使用 VueUse 的 useResizeObserver**：自动处理生命周期和清理
2. **使用 Tiptap 的 setOptions API**：确保样式正确应用
3. **精确的溢出检测**：使用 `scrollWidth > clientWidth`

---

## 五、下一步行动

1. ✅ **方案确认**：包装容器方案已验证可行
2. ✅ **实现完成**：useAutoSize 和 useModeSwitch 已实现
3. ⏳ **测试验证**：覆盖所有需求场景
4. ⏳ **性能优化**：如需要可进一步优化

---

## 附录：参考资料

- [Element Plus Input 源码](https://github.com/element-plus/element-plus/blob/dev/packages/components/input/src/input.vue)
- [VueUse useTextareaAutosize](https://vueuse.org/core/useTextareaAutosize/)
- [ProseMirror 文档](https://prosemirror.net/docs/)
- [Tiptap 文档](https://tiptap.dev/docs)
