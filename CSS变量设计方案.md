# CSS 变量设计方案

## 🎨 整体架构

这是一个**三层变量系统**的设计：

```
1. 主题层 (prompt.css)     - 定义所有变量值
2. 组件层 (prompt.vue)     - 变量映射和尺寸覆盖
3. 样式层 (prompt.vue)     - 实际应用变量
```

## 🏗️ 变量分层设计

### 第一层：主题变量定义 (`prompt.css`)

```css
:root {
  /* 不影响的布局的变量 */
  --tr-prompt-bg-color: white;
  --tr-prompt-hover-color: rgba(0, 0, 0, 0.04);
  --tr-prompt-title-color: rgb(25, 25, 25);
  --tr-prompt-border-radius: 16px;

  /* 影响的布局的变量 */
  /* default (medium) */
  --tr-prompt-padding-block: var(--tr-prompt-padding-block-medium);
  --tr-prompt-gap: var(--tr-prompt-gap-medium);
  --tr-prompt-title-font-size: var(--tr-prompt-title-font-size-medium);

  /* small */
  --tr-prompt-padding-block-small: 10px;
  --tr-prompt-gap-small: 12px;
  --tr-prompt-title-font-size-small: 14px;

  /* medium */
  --tr-prompt-padding-block-medium: 14px;
  --tr-prompt-gap-medium: 12px;
  --tr-prompt-title-font-size-medium: 14px;

  /* large */
  --tr-prompt-padding-block-large: 14px;
  --tr-prompt-gap-large: 12px;
  --tr-prompt-title-font-size-large: 16px;
}
```

### 第二层：组件变量映射 (`prompt.vue`)

```css
.tr-prompt {
  /* 变量映射 */
  --bg-color: var(--tr-prompt-bg-color);
  --hover-color: var(--tr-prompt-hover-color);
  --title-color: var(--tr-prompt-title-color);
  --border-radius: var(--tr-prompt-border-radius);

  --padding-block: var(--tr-prompt-padding-block);
  --gap: var(--tr-prompt-gap);
  --title-font-size: var(--tr-prompt-title-font-size);

  /* small 尺寸覆盖 */
  &.small {
    --padding-block: var(--tr-prompt-padding-block-small, var(--tr-prompt-padding-block));
    --gap: var(--tr-prompt-gap-small, var(--tr-prompt-gap));
    --title-font-size: var(--tr-prompt-title-font-size-small, var(--tr-prompt-title-font-size));
  }

  /* large 尺寸覆盖 */
  &.large {
    --padding-block: var(--tr-prompt-padding-block-large, var(--tr-prompt-padding-block));
    --gap: var(--tr-prompt-gap-large, var(--tr-prompt-gap));
    --title-font-size: var(--tr-prompt-title-font-size-large, var(--tr-prompt-title-font-size));
  }
}
```

### 第三层：样式应用 (`prompt.vue`)

```css
.tr-prompt {
  display: flex;
  align-items: start;
  gap: var(--gap);
  border-radius: var(--border-radius);
  padding-block: var(--padding-block);
  background-color: var(--bg-color);

  &:hover {
    background-color: var(--hover-color);
  }
}

.tr-prompt__content-title {
  color: var(--title-color);
  font-size: var(--title-font-size);
}
```

## 🎯 Size 变量切换机制

### 1. 默认值机制

```css
/* 在主题层定义默认值 */
--tr-prompt-padding-block: var(--tr-prompt-padding-block-medium);
```

### 2. Fallback 机制

```css
/* 在组件层使用 fallback */
--padding-block: var(--tr-prompt-padding-block-small, var(--tr-prompt-padding-block));
```

### 3. 尺寸覆盖机制

```css
.tr-prompt {
  /* 默认使用 medium 尺寸 */
  --padding-block: var(--tr-prompt-padding-block);

  &.small {
    /* small 尺寸覆盖 */
    --padding-block: var(--tr-prompt-padding-block-small, var(--tr-prompt-padding-block));
  }

  &.large {
    /* large 尺寸覆盖 */
    --padding-block: var(--tr-prompt-padding-block-large, var(--tr-prompt-padding-block));
  }
}
```

## 🔄 变量切换流程

```
1. 组件渲染时添加 size 类名
   <div class="tr-prompt small">

2. CSS 选择器匹配尺寸类
   .tr-prompt.small { ... }

3. 变量重新赋值
   --padding-block: var(--tr-prompt-padding-block-small, fallback);

4. 样式自动更新
   padding-block: var(--padding-block);
```

## 📊 变量命名规范

### 主题变量命名

```css
--tr-prompt-{属性}-{尺寸}
--tr-prompt-padding-block-small
--tr-prompt-padding-block-medium
--tr-prompt-padding-block-large
```

### 组件变量命名

```css
--{属性}
--padding-block
--gap
--title-font-size
```

## 🎯 实际应用示例

```vue
<!-- 不同尺寸的组件 -->
<Prompt size="small" />
<Prompt size="medium" />
<Prompt size="large" />

<!-- 对应的 CSS 类 -->
<div class="tr-prompt small"></div>
<div class="tr-prompt medium"></div>
<div class="tr-prompt large"></div>
```

## 🏆 设计优势

### 1. 主题隔离

- 主题变量在外部 CSS 文件定义
- 组件不直接依赖主题变量
- 便于主题切换和定制

### 2. 尺寸灵活

- 通过 CSS 类名控制尺寸
- 无需 JavaScript 干预
- 支持动态切换

### 3. 维护友好

- 变量集中管理
- 语义化命名
- 清晰的层级关系

### 4. 性能优化

- CSS 变量原生支持
- 无需重渲染
- 平滑过渡效果

## 🎯 总结

这是一个**非常优秀的 CSS 变量设计方案**：

1. **分层清晰**：主题、组件、样式三层分离
2. **尺寸灵活**：通过 CSS 类名实现尺寸切换
3. **主题友好**：支持主题定制和切换
4. **维护简单**：变量集中管理，命名规范
5. **性能优秀**：原生 CSS 变量，无需 JavaScript

这种设计模式可以很好地应用到其他组件中，是一个值得推广的 CSS 变量架构方案。
