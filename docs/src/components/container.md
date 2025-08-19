---
outline: [1, 3]
---

# Container 容器

## 代码示例

### 基本示例

全屏模式下，`Container` 组件会加上 `fullscreen` 类名，此时可以使用选择器 `.fullscreen` 来设置自定义 default 或者 footer 插槽的样式。

<demo vue="../../demos/container/basic.vue" />

## API

### Props

| Prop Name          | Description  | Type      | Required | Default           |
| ------------------ | ------------ | --------- | -------- | ----------------- |
| `model:show`       | 是否显示容器 | `boolean` | ✅       | —                 |
| `model:fullscreen` | 是否全屏模式 | `boolean` | ❌       | `false`           |
| `title`            | 容器标题     | `string`  | ❌       | `'OpenTiny NEXT'` |

---

### Slots

| Slot Name    | Description        |
| ------------ | ------------------ |
| `default`    | 容器主体内容       |
| `title`      | 自定义标题区域内容 |
| `operations` | 标题栏右侧操作区   |
| `footer`     | 底部操作栏内容     |

---

### Events

| Event Name | Description    | Parameters |
| ---------- | -------------- | ---------- |
| `close`    | 容器关闭时触发 | —          |

---

### CSS 变量

Container 组件支持以下 CSS 变量来自定义样式：

#### 全局变量 (`:root`)

| 变量名                                 | 描述         |
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

全屏模式下的 CSS 变量：

| 变量名                                        | 描述                 |
| --------------------------------------------- | -------------------- |
| `--tr-container-header-padding-fullscreen`    | 全屏模式头部内边距   |
| `--tr-container-title-font-size-fullscreen`   | 全屏模式标题字体大小 |
| `--tr-container-title-line-height-fullscreen` | 全屏模式标题行高     |

#### 变量覆盖

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
