# 基础弹窗组件设计方案

## 方案分析：抽取基础弹窗组件

基于对两个插件的分析，我发现它们在弹窗管理上有很多相似之处。以下是详细的方案分析：

### 📊 相似点分析

#### 1. **弹窗生命周期管理**
两个插件都需要：
- 创建 VueRenderer 实例
- 管理 popup DOM 元素
- 处理 cleanup 函数（autoUpdate 清理）
- 在适当时机销毁组件

#### 2. **定位逻辑**
都使用 `@floating-ui/dom`：
- `computePosition` 计算位置
- `autoUpdate` 自动更新位置
- 相同的 middleware：`offset`, `flip`, `shift`
- 都需要找到参考元素（reference element）

#### 3. **状态同步**
- 根据插件状态决定显示/隐藏
- 动态更新 props
- 处理销毁逻辑

### 🎯 差异点分析

#### 1. **参考元素不同**
- **Mention**: 使用 `.mention-trigger` 装饰器元素
- **Suggestion**: 使用 `.tr-chat-input` 容器元素

#### 2. **定位策略不同**
- **Mention**: `placement: 'bottom-start'`（在触发点下方）
- **Suggestion**: `placement: 'top-start'`（在输入框上方）

#### 3. **弹窗宽度计算**
- **Mention**: 固定宽度（由组件自身决定）
- **Suggestion**: 动态宽度（基于输入框宽度，支持百分比）

#### 4. **组件 props 不同**
- **Mention**: `items`, `command`
- **Suggestion**: `suggestions`, `activeKeyboardIndex`, `inputValue`, `onSelect`, `onMouseEnter`, `onMouseLeave`

### ✅ 推荐方案：抽取 `useFloatingPopup` Composable

不建议抽取 Vue 组件，而是抽取一个 **Composable**，原因：

1. **更灵活**：Composable 可以处理通用逻辑，但保留各插件的特殊需求
2. **类型安全**：可以使用泛型支持不同的组件 props
3. **职责清晰**：Composable 只负责弹窗管理，不涉及业务逻辑
4. **易于测试**：可以独立测试弹窗管理逻辑

### 📐 Composable 设计方案

```typescript
// composables/useFloatingPopup.ts

interface FloatingPopupOptions<T> {
  // 必需参数
  editor: Editor
  component: Component  // Vue 组件
  
  // 定位配置
  getReferenceElement: (view: EditorView) => HTMLElement | null
  placement?: Placement  // 'top-start' | 'bottom-start' 等
  offset?: number
  
  // 宽度配置
  width?: number | string | ((referenceWidth: number) => string)
  
  // Props 构建函数
  buildProps: (state: T) => Record<string, unknown>
  
  // 显示条件
  shouldShow: (state: T) => boolean
}

interface FloatingPopupReturn {
  // 更新弹窗（在 view.update 中调用）
  update: (view: EditorView, state: unknown) => void
  
  // 销毁弹窗（在 view.destroy 中调用）
  destroy: () => void
}

function useFloatingPopup<T>(options: FloatingPopupOptions<T>): FloatingPopupReturn
```

### 🔧 使用示例

#### Mention 插件使用：

```typescript
const popup = useFloatingPopup({
  editor,
  component: MentionList,
  getReferenceElement: (view) => view.dom.querySelector('.mention-trigger'),
  placement: 'bottom-start',
  offset: 8,
  buildProps: (state) => ({
    items: state.filteredItems,
    command: (item) => insertMention(view, state.range, item),
  }),
  shouldShow: (state) => state.active && state.filteredItems.length > 0,
})

// 在 view() 中
return {
  update(view) {
    const state = MentionPluginKey.getState(view.state)
    popup.update(view, state)
  },
  destroy() {
    popup.destroy()
  }
}
```

#### Suggestion 插件使用：

```typescript
const popup = useFloatingPopup({
  editor,
  component: SuggestionList,
  getReferenceElement: (view) => view.dom.closest('.tr-chat-input'),
  placement: 'top-start',
  offset: 8,
  width: (refWidth) => `${refWidth * 0.8}px`,  // 80% 宽度
  buildProps: (state) => ({
    suggestions: state.filteredSuggestions,
    activeKeyboardIndex: state.selectedIndex,
    inputValue: state.query,
    onSelect: (content) => insertSuggestion(view, state.range, content),
    // ...
  }),
  shouldShow: (state) => state.active && state.filteredSuggestions.length > 0,
})
```

### 📦 Composable 内部实现要点

1. **封装 VueRenderer 管理**
   - 创建、更新、销毁逻辑
   - Props 动态更新

2. **封装 floating-ui 逻辑**
   - computePosition 调用
   - autoUpdate 管理
   - cleanup 处理

3. **封装 DOM 管理**
   - popup 元素创建
   - 添加到 body
   - 移除清理

4. **支持配置化**
   - 定位策略可配置
   - 宽度计算可配置
   - 参考元素查找可配置

### ✨ 优势总结

1. **代码复用**：两个插件的弹窗管理代码减少 60%+
2. **易于维护**：弹窗逻辑集中在一处，修改更容易
3. **类型安全**：使用泛型支持不同的状态类型
4. **灵活性高**：通过配置函数支持各种定制需求
5. **易于扩展**：未来新增插件可以直接复用
6. **测试友好**：Composable 可以独立测试

### 🚀 实施建议

1. **第一步**：创建 `useFloatingPopup` composable
2. **第二步**：重构 Mention 插件使用新 composable
3. **第三步**：重构 Suggestion 插件使用新 composable
4. **第四步**：添加单元测试
5. **第五步**：更新文档

这个方案既能简化代码，又保持了足够的灵活性，符合"组合优于配置"的设计思想。
