---
outline: [1, 3]
---

# SVG 图标

`@opentiny/tiny-robot-svgs` 提供了一组可直接使用的 SVG 图标组件。

## 安装

::: code-group

```bash [pnpm]
pnpm add @opentiny/tiny-robot-svgs
```

```bash [yarn]
yarn add @opentiny/tiny-robot-svgs
```

```bash [npm]
npm install @opentiny/tiny-robot-svgs
```

:::

## 示例

下面展示几种最常见的使用方式。

### 直接引入与渲染

适合直接在页面中摆放独立图标，通过 `fontSize` 和 `color` 控制尺寸与颜色即可。

<demo vue="../../demos/icons/DirectRender.vue" />

### 作为组件 props 传递

适合 `TrIconButton`、`TrSender`、`TrHistory` 等支持 `icon` 属性的组件。

<demo vue="../../demos/icons/PropsUsage.vue" />

### 作为 VNode 传递

适合 icon 需要在运行时动态组装，或者第三方/业务组件要求接收 VNode 的场景。

<demo vue="../../demos/icons/VNodeUsage.vue" />

## 图标集合

图标集合按常用场景分类展示，支持按图标名、分类名和关键词筛选。点击图标卡片可以快速复制图标名称；插画型和场景态图标会单独分组展示。

<demo vue="../../demos/icons/IconGallery.vue" />

## 常用属性

常规图标默认以 `1em` 渲染，插画型图标保留原始尺寸，可按下面方式控制样式：

| 属性 | 说明 | 默认 |
| --- | --- | --- |
| `font-size` | 控制常规图标整体尺寸 | 继承当前字号 |
| `color` | 控制使用 `currentColor` 的单色图标颜色 | 跟随当前颜色 |
| `width` / `height` | 显式指定展示尺寸，插画型图标更常用 | 未设置时使用图标默认尺寸 |
| `class` / `style` | 追加自定义样式 | `-` |

## 兼容导出说明

本版本保留了一组旧图标名的兼容导出，便于平滑升级；这些旧名会在下个版本移除，建议尽快切换到新名字：

- `IconAccessory` -> `IconUpload`
- `IconClear` -> `IconClose`
- `IconFullScreen` -> `IconEnterFullScreen`
- `IconCancelFullScreen` -> `IconExitFullScreen`
- `IconImageLoading` -> `IconUploadLoading`
- `IconMenu` -> `IconMoreCircle`
- `IconMenu2` -> `IconMore`