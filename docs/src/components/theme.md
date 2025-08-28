---
outline: deep
---

# Theme

## 基础用法

需要自定义主题或者配色时，使用 `ThemeProvider` 包裹应用，`ThemeProvider` 提供的 `target-element` prop，是应用主题的根元素（默认是 `html` 元素）。

主题和配色是通过 css 变量来实现的，`ThemeProvider` 会在 `target-element` 上添加 `data-tr-theme` 和 `data-tr-color-mode` 属性，所以需要使用属性选择器来覆盖 css 变量。

- `[data-tr-theme]` 属性选择器，用于覆盖主题相关的 css 变量，可以为任意字符串，和你设置的主题对应
- `[data-tr-color-mode]` 属性选择器，用于覆盖颜色模式相关的 css 变量，可以为 `light` 或 `dark`

例如：

```css
/* 覆盖默认主题的 'light' 模式下的 css 变量 */
[data-tr-color-mode='light'] {
  /*  */
}

/* 'custom-theme' 主题的 css 变量 */
[data-tr-theme='custom-theme'] {
  /*  */
}

/* 'custom-theme' 主题的 'light' 模式下的 css 变量 */
[data-tr-theme='custom-theme'][data-tr-color-mode='light'] {
  /*  */
}
```

另外，TinyRobot 提供了 `useTheme` 组合式函数，可以使用代码动态切换主题和颜色模式。

> [!IMPORTANT]
> `useTheme` 只能在 `ThemeProvider` 包裹的组件中使用。

```typescript
import { useTheme } from '@opentiny/tiny-robot'

const { toggleColorMode, setColorMode, setTheme } = useTheme()

toggleColorMode() // 切换颜色模式
setColorMode('dark') // 设置颜色模式
setTheme('custom-theme') // 设置主题
```

## 主题设置

使用 `ThemeProvider` 的 `theme` prop 设置主题，或者使用 `useTheme` 中的 `setTheme` 设置主题。`theme` prop 默认值为空字符串，表示使用默认主题。

使用 `[data-tr-theme='custom-theme']` 属性选择器来自定义你的主题 css 变量。

<demo vue="../../demos/theme-provider/Theme.vue" :vueFiles="['../../demos/theme-provider/Theme.vue', '../../demos/theme-provider/ThemeComp.vue']" />

## 颜色模式切换

使用 `ThemeProvider` 的 `colorMode` prop 设置颜色模式，或者使用 `useTheme` 中的 `setColorMode` 设置颜色模式。`colorMode` prop 默认值为 `'auto'`，表示自动模式，跟随系统设置。

使用 `[data-tr-color-mode='light']` 和 `[data-tr-color-mode='dark']` 属性选择器来自定义你的颜色模式 css 变量。

<demo vue="../../demos/theme-provider/ColorMode.vue" :vueFiles="['../../demos/theme-provider/ColorMode.vue', '../../demos/theme-provider/ColorModeComp.vue']" />

## 嵌套主题

`ThemeProvider` 可以嵌套使用。组件会往上查找最近的 `ThemeProvider` 提供的主题和颜色模式。

<demo vue="../../demos/theme-provider/NestedTheme.vue" :vueFiles="['../../demos/theme-provider/NestedTheme.vue', '../../demos/theme-provider/ThemeComp.vue']" />

## 主题数据持久化

`ThemeProvider` 提供了 `storage` 和 `storageKey` 两个属性，用于持久化主题数据。

下面例子中，切换主题和颜色模式时，主题数据会持久化到 `localStorage` 中，刷新页面后，主题数据会从 `localStorage` 中恢复。

<demo vue="../../demos/theme-provider/Storage.vue" :vueFiles="['../../demos/theme-provider/Storage.vue', '../../demos/theme-provider/StorageComp.vue']" />

## API

### ColorMode

颜色模式类型：

```typescript
type ColorMode = 'light' | 'dark' | 'auto'
```

- `'light'`: 亮色模式
- `'dark'`: 暗色模式
- `'auto'`: 自动模式，跟随系统设置

### ThemeStorage

主题存储接口类型：

```typescript
type ThemeStorage = Pick<Storage, 'getItem' | 'setItem'>
```

| 属性      | 类型       | 说明             |
| --------- | ---------- | ---------------- |
| `getItem` | `function` | 获取存储项的方法 |
| `setItem` | `function` | 设置存储项的方法 |

### ThemeProviderProps

ThemeProvider 组件的属性配置。

| 属性            | 类型           | 默认值                    | 说明                                                              |
| --------------- | -------------- | ------------------------- | ----------------------------------------------------------------- |
| `colorMode`     | `ColorMode`    | `'auto'`                  | 颜色模式，支持 v-model 双向绑定                                   |
| `targetElement` | `string`       | `'html'`                  | 应用主题属性选择器的目标元素，主题只会影响 targetElement 下的元素 |
| `theme`         | `string`       | `''`                      | 主题名称，支持 v-model 双向绑定                                   |
| `storage`       | `ThemeStorage` | -                         | 主题数据存储实现，用于持久化主题设置                              |
| `storageKey`    | `string`       | `'tiny-robot-theme-data'` | 存储键名，用于在 storage 中标识主题数据                           |

### useTheme

主题相关的组合式函数，提供主题和颜色模式的操作 API。

> [!IMPORTANT]
> `useTheme` 只能在 `ThemeProvider` 包裹的组件中使用。如果在没有 `ThemeProvider` 的组件中使用，相关方法会返回 `false` 并在控制台输出警告信息。

useTheme 返回值

```typescript
const { theme, colorMode, resolvedColorMode, systemColorMode, setTheme, toggleColorMode, setColorMode } = useTheme()
```

| 属性                | 类型                               | 说明                                                                                           |
| ------------------- | ---------------------------------- | ---------------------------------------------------------------------------------------------- |
| `theme`             | `Ref<string>`                      | 当前主题名称的响应式引用                                                                       |
| `colorMode`         | `Ref<ColorMode>`                   | 当前颜色模式的响应式引用                                                                       |
| `resolvedColorMode` | `Readonly<Ref<'light' \| 'dark'>>` | 解析后的颜色模式，auto 模式会被解析为实际的 light 或 dark                                      |
| `systemColorMode`   | `Readonly<Ref<'light' \| 'dark'>>` | 系统颜色模式的响应式引用，只读。`window.matchMedia('(prefers-color-scheme: dark)')` 的匹配结果 |
| `setTheme`          | `(newTheme: string) => boolean`    | 设置主题名称，返回是否设置成功                                                                 |
| `toggleColorMode`   | `() => boolean`                    | 切换颜色模式，返回是否切换成功                                                                 |
| `setColorMode`      | `(mode: ColorMode) => boolean`     | 设置颜色模式，返回是否设置成功                                                                 |
