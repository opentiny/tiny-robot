---
outline: deep
---

# Container 容器

## 代码示例

### 基本示例

<demo-plugin vue="../../demos/container/basic.vue" />

## API

### Props

| Prop Name          | Description  | Type      | Required | Default |
| ------------------ | ------------ | --------- | -------- | ------- |
| `model:show`       | 是否显示容器 | `boolean` | ✅       | —       |
| `model:fullscreen` | 是否全屏模式 | `boolean` | ❌       | `false` |

---

### Slots

| Slot Name    | Description        |
| ------------ | ------------------ |
| `default`    | 容器主体内容       |
| `title`      | 自定义标题区域内容 |
| `operations` | 标题栏右侧操作区   |
| `footer`     | 底部操作栏内容     |
