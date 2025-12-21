# 版本标记使用指南

TinyRobot 文档支持在 Markdown 表格中添加版本标记，用于标识属性、方法或其他 API 的版本信息。

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

除了在文档内容中使用版本标记，您也可以在左侧导航栏中添加版本徽章。

### 方式一：直接使用 HTML

在 `.vitepress/config.mts` 的侧边栏配置中直接添加 HTML：

```typescript
const sharedSidebarItems = [
  {
    text: '组件',
    base: '/components/',
    items: [
      {
        text: 'Sender 消息输入框 <span class="version-badge version-badge--new">新增</span>',
        link: 'sender',
      },
      {
        text: 'OldComponent <span class="version-badge version-badge--deprecated">已废弃</span>',
        link: 'old',
      },
    ],
  },
]
```

### 方式二：使用辅助函数（推荐）

导入辅助函数简化配置：

```typescript
import { withBadge, createSidebarItems } from './.vitepress/theme/utils/sidebar-badge-helper'

const sharedSidebarItems = [
  {
    text: '组件',
    base: '/components/',
    items: createSidebarItems([
      { text: 'Sender 消息输入框', badge: 'new', link: 'sender' },
      { text: 'BetaFeature', badge: 'beta', link: 'beta-feature' },
      { text: 'NewAPI', badge: '1.5.0', link: 'new-api' },
      { text: 'Container 容器', link: 'container' }, // 无徽章
    ]),
  },
]

// 或者单独使用 withBadge
{ text: withBadge('Sender 消息输入框', 'new'), link: 'sender' }
```

### 支持的徽章类型

侧边栏徽章支持与文档内容相同的类型：

- `'new'` - 蓝色"新增"徽章
- `'deprecated'` - 红色"已废弃"徽章
- `'beta'` - 橙色"Beta"徽章
- `'alpha'` - 灰色"Alpha"徽章
- 版本号（如 `'1.2.0'`）- 蓝色版本号徽章
