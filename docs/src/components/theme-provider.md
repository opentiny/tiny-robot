---
outline: deep
---

# ThemeProvider

## 基本用法

需要自定义主题或者配色时，使用 `ThemeProvider` 包裹应用，`target-element` 设置为需要应用主题的根元素（默认是 `html` 元素）。然后使用 `useTheme` 获取主题相关的 API。
主题和配色是通过覆盖 css 变量来实现的，`ThemeProvider` 会在 `target-element` 上添加下面的属性，所以需要使用属性选择器来覆盖 css 变量。

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

## 主题设置

使用 `ThemeProvider` 的 `theme` props 设置主题，或者使用 `useTheme` 中的 `setTheme` 设置主题。

使用 `[data-tr-theme='custom-theme']` 属性选择器来自定义你的主题 css 变量。

<demo vue="../../demos/theme-provider/Theme.vue" :vueFiles="['../../demos/theme-provider/Theme.vue', '../../demos/theme-provider/ThemeComp.vue']" />

## 颜色模式切换

使用 `ThemeProvider` 的 `colorMode` props 设置颜色模式，或者使用 `useTheme` 中的 `setColorMode` 设置颜色模式。

使用 `[data-tr-color-mode='light']` 和 `[data-tr-color-mode='dark']` 属性选择器来自定义你的颜色模式 css 变量。

<demo vue="../../demos/theme-provider/ColorMode.vue" :vueFiles="['../../demos/theme-provider/ColorMode.vue', '../../demos/theme-provider/ColorModeComp.vue']" />

## 主题数据持久化

`ThemeProvider` 提供了 `storage` 和 `storageKey` 两个属性，用于持久化主题数据。

下面例子中，切换主题和颜色模式时，主题数据会持久化到 `localStorage` 中，刷新页面后，主题数据会从 `localStorage` 中恢复。

<demo vue="../../demos/theme-provider/Storage.vue" :vueFiles="['../../demos/theme-provider/Storage.vue', '../../demos/theme-provider/StorageComp.vue']" />
