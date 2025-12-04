# ChatInput 紧凑模式实现总结

## 实现方案

### 1. CSS 变量系统（与 Sender 保持一致）

**设计原则**：
- 所有样式通过 CSS 变量控制
- 避免使用 `:root.tr-chat-input--small &` 嵌套选择器
- 在主样式文件中集中定义所有变量
- 子组件直接使用 CSS 变量，无需额外的紧凑模式样式

**默认模式变量**：
```less
:root {
  --tr-chat-input-font-size: 16px;
  --tr-chat-input-line-height: 26px;
  --tr-chat-input-min-height: 42px;
  --tr-chat-input-border-radius: 26px;
  --tr-chat-input-padding: 15px 20px;
  --tr-chat-input-gap: 8px;
  --tr-chat-input-footer-gap: 12px;
  --tr-chat-input-header-padding: 15px 20px 0;
  --tr-chat-input-multi-main-padding: 16px 20px 12px;
  --tr-chat-input-footer-padding: 0 10px 10px;
  --tr-chat-input-button-size: 32px;
  --tr-chat-input-button-size-submit: 36px;
  --tr-chat-input-button-size: 28px;
}
```

**紧凑模式变量覆盖**：
```less
.tr-chat-input--small {
  --tr-chat-input-font-size: 14px;
  --tr-chat-input-line-height: 22px;
  --tr-chat-input-min-height: 36px;
  --tr-chat-input-border-radius: 22px;
  --tr-chat-input-padding: 12px 16px;
  --tr-chat-input-gap: 6px;
  --tr-chat-input-footer-gap: 8px;
  --tr-chat-input-header-padding: 12px 16px 0;
  --tr-chat-input-multi-main-padding: 12px 16px 8px;
  --tr-chat-input-footer-padding: 0 8px 8px;
  --tr-chat-input-button-size: 28px;
}
```

### 2. 组件样式更新（统一使用 CSS 变量）

所有子组件都直接使用 CSS 变量，无需在组件内部定义紧凑模式样式：

#### SingleLineLayout
```less
.tr-chat-input-header {
  padding: var(--tr-chat-input-header-padding);
}
.tr-chat-input-content {
  padding: var(--tr-chat-input-padding);
}
.tr-chat-input-actions-group {
  gap: var(--tr-chat-input-gap);
}
```

#### MultiLineLayout
```less
.tr-chat-input-header {
  padding: var(--tr-chat-input-header-padding);
}
.tr-chat-input-main {
  padding: var(--tr-chat-input-multi-main-padding);
}
```

#### Footer
```less
.tr-chat-input-footer {
  padding: var(--tr-chat-input-footer-padding);
  gap: var(--tr-chat-input-footer-gap);
}
```

#### SubmitButton
```less
&__icon {
  font-size: var(--tr-chat-input-button-size-submit);
}
```

#### ClearButton
```less
&__icon {
  font-size: var(--tr-chat-input-button-size);
}
```

#### WordCounter
```less
.tr-chat-input-word-counter {
  font-size: calc(var(--tr-chat-input-font-size) - 2px);
  line-height: var(--tr-chat-input-line-height);
}
```

### 3. Demo 示例
创建了 `docs/demos/chat-input/size.vue`，展示了：
- 正常尺寸（size="normal"）的单行和多行输入框
- 紧凑尺寸（size="small"）的单行和多行输入框
- 对比效果

### 4. 文档更新
在 `docs/src/components/chat-input.md` 中添加了紧凑模式的演示

## 使用方式

```vue
<template>
  <!-- 使用 size="small" 启用紧凑模式 -->
  <ChatInput size="small" mode="single" />
</template>
```

## 样式调整对比

| 项目 | 默认模式 | 紧凑模式 |
|------|---------|---------|
| 字体大小 | 16px | 14px |
| 行高 | 26px | 22px |
| 最小高度 | 42px | 36px |
| 圆角 | 26px | 22px |
| 内边距 | 15px 20px | 12px 16px |
| 间距 | 8px | 6px |
| 按钮大小 | 32px | 28px |

## 优势

1. **无需修改组件代码**：只需添加 CSS 类
2. **响应式设计**：通过 CSS 变量系统，所有相关样式自动调整
3. **与 Sender 保持一致**：使用相同的实现模式，统一的代码风格
4. **易于维护**：样式集中在主样式文件中，便于后续调整
5. **性能优化**：使用 CSS 变量，无需 JavaScript 计算
6. **避免嵌套选择器**：不使用 `:root.tr-chat-input--small &`，代码更清晰
7. **扩展性好**：未来添加其他尺寸（如 large）只需添加新的 size 值

## 问题修复

### 高度跳跃问题
**问题**：输入内容前容器高度 46px，输入后 48px，导致跳跃。

**原因**：`tr-chat-input-actions-group` 有固定的 `padding-top: 10px` 和 `padding-bottom: 10px`，当按钮组显示时会增加容器高度。

**解决方案**：移除 `actions-group` 的垂直 padding，让按钮组通过父容器的 `align-items: center` 自动垂直居中，不影响容器高度。

```less
.tr-chat-input-actions-group {
  display: flex;
  align-items: center;
  gap: var(--tr-chat-input-gap);
  padding-left: 12px;
  // 移除 padding-top 和 padding-bottom，避免高度跳跃
}
```