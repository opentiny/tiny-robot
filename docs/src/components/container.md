---
outline: [1, 3]
---

# Container 容器

## 代码示例

### 基本示例

全屏模式下，`Container` 组件会加上 `fullscreen` 类名，此时可以使用选择器 `.fullscreen` 来设置自定义 default 或者 footer 插槽的样式。

<demo vue="../../demos/container/basic.vue" />

## Props

| 属性               | 类型      | 必填 | 默认值            | 说明         |
| ------------------ | --------- | ---- | ----------------- | ------------ |
| `model:show`       | `boolean` | 是   | -                 | 是否显示容器 |
| `model:fullscreen` | `boolean` | 否   | `false`           | 是否全屏模式 |
| `title`            | `string`  | 否   | `'OpenTiny NEXT'` | 容器标题     |

## Slots

| 插槽名       | 说明               |
| ------------ | ------------------ |
| `default`    | 容器主体内容       |
| `title`      | 自定义标题区域内容 |
| `operations` | 标题栏右侧操作区   |
| `footer`     | 底部操作栏内容     |

## Events

| 事件名  | 参数 | 说明           |
| ------- | ---- | -------------- |
| `close` | -    | 容器关闭时触发 |

## CSS 变量

Container 组件支持以下 CSS 变量来自定义样式：

**全局变量 (`:root`)**

| 变量名                                 | 说明         |
| -------------------------------------- | ------------ |
| `--tr-container-bg-color`              | 容器背景色   |
| `--tr-container-border-color`          | 容器边框色   |
| `--tr-container-border-width`          | 容器边框宽度 |
| `--tr-container-header-operations-gap` | 操作按钮间距 |
| `--tr-container-header-padding`        | 头部内边距   |
| `--tr-container-title-color`           | 标题文字颜色 |
| `--tr-container-title-font-size`       | 标题字体大小 |
| `--tr-container-title-font-weight`     | 标题字体粗细 |
| `--tr-container-title-line-height`     | 标题行高     |
| `--tr-container-width`                 | 容器宽度     |

**全屏模式变量**

| 变量名                                        | 说明                 |
| --------------------------------------------- | -------------------- |
| `--tr-container-header-padding-fullscreen`    | 全屏模式头部内边距   |
| `--tr-container-title-font-size-fullscreen`   | 全屏模式标题字体大小 |
| `--tr-container-title-line-height-fullscreen` | 全屏模式标题行高     |

**变量覆盖示例**

非全屏模式（默认）

```css
:root {
  --tr-container-width: 600px;
  --tr-container-title-font-size: 18px;
}
```

全屏模式

```css
:root {
  --tr-container-title-font-size-fullscreen: 20px;
  --tr-container-header-padding-fullscreen: 0 200px 24px;
}
```
