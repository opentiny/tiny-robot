# ActionButton Tooltip 样式配置

## 概述

ActionButton 组件的 tooltip 样式现已通过 CSS 变量暴露，用户可以直接通过 CSS 来自定义 tooltip 的外观。

## 可配置的 CSS 变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `--tr-action-button-tooltip-padding` | 内边距 | `6px 12px` |
| `--tr-action-button-tooltip-bg-color` | 背景色 | `rgba(0, 0, 0, 0.85)` |
| `--tr-action-button-tooltip-color` | 文字颜色 | `white` |
| `--tr-action-button-tooltip-border-radius` | 圆角 | `4px` |
| `--tr-action-button-tooltip-font-size` | 字体大小 | `12px` |
| `--tr-action-button-tooltip-z-index` | 层级 | `1000` |

## 使用示例

### 全局配置

在根元素或全局样式中设置 CSS 变量：

```css
:root {
  --tr-action-button-tooltip-bg-color: #333;
  --tr-action-button-tooltip-color: #fff;
  --tr-action-button-tooltip-padding: 8px 16px;
  --tr-action-button-tooltip-border-radius: 6px;
  --tr-action-button-tooltip-font-size: 14px;
}
```

### 局部配置

在特定容器中覆盖样式：

```css
.custom-container {
  --tr-action-button-tooltip-bg-color: #1476ff;
  --tr-action-button-tooltip-color: white;
  --tr-action-button-tooltip-padding: 10px 14px;
  --tr-action-button-tooltip-font-size: 13px;
}
```

### 样式类名

tooltip 元素使用 `.tr-action-button-tooltip` 类名，可以直接编写 CSS 规则：

```css
.tr-action-button-tooltip {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  font-weight: 500;
}
```

## 注意事项

- tooltip 通过 Teleport 挂载到 body，因此使用全局 CSS 变量或全局样式规则
- 样式类名 `.tr-action-button-tooltip` 已暴露，可直接在全局样式中定制
- 位置相关样式（position、top、left）由组件内部控制，不建议修改
