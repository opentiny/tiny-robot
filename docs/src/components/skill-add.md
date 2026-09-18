---
outline: [1, 3]
---

# SkillAdd Skill 导入组件

`SkillAdd` 提供本地文件夹和 GitHub 两种 Skill 导入界面。组件内部管理输入草稿、校验、加载和错误状态，解析成功且用户确认后统一输出 `SkillDefinition`。

## 安装

`@opentiny/tiny-robot-kit` 是组件库的 peer dependency。`SkillAdd` 未传入 `resolve-skill` 时，会动态加载 kit 提供的默认 Skill 解析器，因此需要先安装两个包：

```bash
pnpm add @opentiny/tiny-robot @opentiny/tiny-robot-kit
```

## 基础用法

```vue
<script setup lang="ts">
import { SkillAdd } from '@opentiny/tiny-robot'
import type { SkillDefinition } from '@opentiny/tiny-robot'

const saveSkill = (definition: SkillDefinition) => {
  // 保存解析完成的 SkillDefinition
}
</script>

<template>
  <SkillAdd source="local" @submit="saveSkill" />
</template>
```

本地文件夹在选择后立即解析；GitHub 地址在用户点击“导入”后解析。默认解析器只负责加载并生成 `SkillDefinition`，不负责持久化。

## 自定义解析器

应用可以通过 `resolve-skill` 覆盖默认 kit 解析器。组件会等待 Promise，并自行展示加载和错误状态：

```vue
<SkillAdd source="github" :resolve-skill="resolveSkill" @submit="saveSkill" />
```

```ts
import type { SkillAddInput, SkillDefinition } from '@opentiny/tiny-robot'

const resolveSkill = async (input: SkillAddInput): Promise<SkillDefinition> => {
  // GitHub 输入已由 SkillAdd 解析为 url、repo、ref、path
  // 应用可直接调用自己的加载、鉴权或持久化逻辑
  return loadFromApplication(input)
}
```

如果关闭窗口后任务仍需继续，应用应在自定义 resolver 中持有任务并负责全局成功或失败通知。组件卸载后不再负责界面反馈。

## Props

| 属性名            | 说明                                            | 类型                                                 | 默认值     |
| ----------------- | ----------------------------------------------- | ---------------------------------------------------- | ---------- |
| `source`          | Skill 来源；切换时清空组件内部草稿和解析结果    | `'local' \| 'github'`                                | `'local'`  |
| `max-upload-size` | 本地文件夹允许的总字节数                        | `number`                                             | `10485760` |
| `resolve-skill`   | 可选异步解析器；未提供时动态加载 kit 默认解析器 | `(input: SkillAddInput) => Promise<SkillDefinition>` | —          |

## Events

| 事件名   | 触发时机                       | 回调参数                                |
| -------- | ------------------------------ | --------------------------------------- |
| `submit` | Skill 解析成功且用户完成确认   | `(definition: SkillDefinition) => void` |
| `cancel` | 用户点击本地上传界面的取消按钮 | `() => void`                            |

## 类型

`SkillDefinition`、`SkillResourceDescriptor`、`SkillAddInput`、`SkillAddSource` 和 `SkillResolver` 均由 `@opentiny/tiny-robot` 导出。components 中的 `SkillDefinition` 与 kit 返回的同名类型保持结构兼容。
