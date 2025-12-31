# 版本标记使用指南

TinyRobot 文档支持在 Markdown 表格中添加版本标记，用于标识属性、方法或其他 API 的版本信息。

## 插件配置

### Markdown 内容标记插件

在 `.vitepress/config.mts` 中配置 `MarkdownBadgePlugin` 以支持文档内容中的版本标记：

```typescript

import { defineConfig } from 'vitepress'
import { MarkdownBadgePlugin } from './.vitepress/plugins/badge'

export default defineConfig({
  markdown: {
    config: (md) => {
      md.use(MarkdownBadgePlugin)
    },
  },
  // ... 其他配置
})
```

### 侧边栏徽章插件

在 `.vitepress/config.mts` 中配置 `SidebarBadgePlugin` 以支持从 frontmatter 自动读取徽章：

```typescript
import { defineConfig } from 'vitepress'
import { SidebarBadgePlugin } from './.vitepress/plugins/badge'

export default defineConfig({
  vite: {
    plugins: [
      SidebarBadgePlugin({
        srcDir: 'src', // 源文件目录，默认为 'src'
        debug: false, // 是否启用调试日志
      }),
    ],
  },
  // ... 其他配置
})
```

## 支持的标记类型

### 1. 新增标记 `@new`

用于标记新添加的功能或属性。

**示例：**

```markdown
| 属性名       | 说明     | 类型   |
| ------------ | -------- | ------ |
| newProp @new | 新增属性 | string |
```

**效果：** 属性名后会显示蓝色的"新增"标记

### 2. 废弃标记 `@deprecated`

用于标记已废弃或即将移除的功能。

**示例：**

```markdown
| 属性名              | 说明       | 类型   |
| ------------------- | ---------- | ------ |
| oldProp @deprecated | 已废弃属性 | string |
```

**效果：** 属性名后会显示红色的"已废弃"标记

### 3. Beta 标记 `@beta`

用于标记处于测试阶段的功能。

**示例：**

```markdown
| 属性名         | 说明          | 类型   |
| -------------- | ------------- | ------ |
| betaProp @beta | Beta 测试属性 | string |
```

**效果：** 属性名后会显示橙色的"Beta"标记

### 4. Alpha 标记 `@alpha`

用于标记早期实验性功能。

**示例：**

```markdown
| 属性名           | 说明           | 类型   |
| ---------------- | -------------- | ------ |
| alphaProp @alpha | Alpha 测试属性 | string |
```

**效果：** 属性名后会显示灰色的"Alpha"标记

### 5. 自定义版本号 `@x.x.x`

用于标记特定版本引入的功能。

**示例：**

```markdown
| 属性名             | 说明           | 类型   |
| ------------------ | -------------- | ------ |
| versionProp @1.2.0 | 1.2.0 版本新增 | string |
```

**效果：** 属性名后会显示蓝色的"1.2.0"标记

## 使用场景

### Props 表格

```markdown
## Props

| 属性名                 | 说明       | 类型    | 默认值 |
| ---------------------- | ---------- | ------- | ------ |
| count                  | 计数器     | number  | 0      |
| enableNewFeature @new  | 开启新功能 | boolean | false  |
| oldApi @deprecated     | 旧版 API   | string  | -      |
| experimentalMode @beta | 实验模式   | boolean | false  |
```

### Events 表格

```markdown
## Events

| 事件名        | 说明     | 回调参数            |
| ------------- | -------- | ------------------- |
| click         | 点击事件 | (event: MouseEvent) |
| newEvent @new | 新增事件 | (value: string)     |
```

### Methods 表格

```markdown
## Methods

| 方法名               | 说明       | 参数            | 返回值        |
| -------------------- | ---------- | --------------- | ------------- |
| getValue             | 获取值     | -               | string        |
| setValueAsync @1.5.0 | 异步设置值 | (value: string) | Promise<void> |
```

## 注意事项

1. **位置要求**：版本标记必须紧跟在属性/方法名之后，中间用空格分隔
2. **格式要求**：标记以 `@` 开头，后接标记类型或版本号
3. **表格限制**：目前仅支持在表格中使用版本标记
4. **暗黑模式**：版本标记会自动适配暗黑模式的配色

## 侧边栏版本徽章

在 Markdown 文件的 frontmatter 中添加 `badge` 字段，插件会自动将徽章添加到侧边栏。

**在 Markdown 文件中添加 badge：**

```markdown
---
badge: new
---

# Sender 消息输入框

这是一个新增的组件...
```

**正常配置侧边栏：**

```typescript
sidebar: {
  '/components/': [
    {
      text: '组件',
      base: '/components/',
      items: [
        { text: 'Sender 消息输入框', link: 'sender' }, // 自动添加徽章
        { text: 'Container 容器', link: 'container' },
      ],
    },
  ],
}
```

插件会自动读取 `sender.md` 的 frontmatter，将徽章添加到侧边栏。

**支持的 badge 值：**

- `new` - 新增
- `deprecated` - 已废弃
- `beta` - Beta
- `alpha` - Alpha
- 版本号（如 `1.2.0`）


## 完整配置示例

### config.mts 配置

```typescript
import { defineConfig } from 'vitepress'
import { MarkdownBadgePlugin, SidebarBadgePlugin } from './.vitepress/plugins/badge'

export default defineConfig({
  // Markdown 内容标记插件
  markdown: {
    config: (md) => {
      md.use(MarkdownBadgePlugin)
    },
  },

  // 侧边栏徽章插件
  vite: {
    plugins: [
      SidebarBadgePlugin({
        srcDir: 'src',
        debug: false,
      }),
    ],
  },

  themeConfig: {
    sidebar: {
      '/components/': [
        {
          text: '组件',
          base: '/components/',
          items: [
            { text: 'Sender 消息输入框', link: 'sender' }, // 自动读取 frontmatter
            { text: 'Container 容器', link: 'container' },
          ],
        },
      ],
    },
  },
})
```

### Markdown 文件示例

```markdown
---
badge: new
---

# Sender 消息输入框

## Props

| 属性名                 | 说明       | 类型    | 默认值 |
| ---------------------- | ---------- | ------- | ------ |
| value                  | 输入值     | string  | ''     |
| placeholder @new       | 占位文本   | string  | ''     |
| maxLength @1.2.0       | 最大长度   | number  | -      |
| oldProp @deprecated    | 已废弃属性 | string  | -      |
| experimentalMode @beta | 实验模式   | boolean | false  |
```

### 效果说明

1. **侧边栏**：`Sender 消息输入框` 后会自动显示蓝色的"新增"徽章（从 frontmatter 读取）
2. **文档内容**：
   - `placeholder` 显示蓝色"新增"徽章
   - `maxLength` 显示蓝色"1.2.0"版本号徽章
   - `oldProp` 显示红色"已废弃"徽章
   - `experimentalMode` 显示橙色"Beta"徽章

## 插件 API

### SidebarBadgePlugin 选项

| 选项   | 类型    | 默认值 | 说明                 |
| ------ | ------- | ------ | -------------------- |
| srcDir | string  | 'src'  | Markdown 源文件目录  |
| debug  | boolean | false  | 是否启用调试日志输出 |