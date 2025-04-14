---
outline: deep
---

# Welcome

<script setup lang="ts">
import Demo from './demo.vue'
import DemoAlign from './demo-align.vue'
import DemoFooter from './demo-footer.vue'
</script>

## 代码示例

### 基本

基础用法

<Demo />

```vue
<template>
  <Welcome title="盘古助手" description="您好，我是盘古助手，您专属的华为云专家" :icon="icon"> </Welcome>
</template>

<script setup lang="tsx">
import { Welcome } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const icon = h('span', { style: { fontSize: '56px', lineHeight: '64px' } as CSSProperties }, '🤖')
</script>
```

### 对齐方向

通过 `align` 属性设置对齐方向

<DemoAlign />

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <Welcome
      title="盘古助手"
      description="您好，我是盘古助手，您专属的华为云专家"
      :icon="icon"
      :align="align"
    ></Welcome>
    <div style="display: flex; align-items: center">
      <label>对齐方向：</label>
      <tiny-radio-group v-model="align">
        <tiny-radio label="left">left</tiny-radio>
        <tiny-radio label="center">center</tiny-radio>
        <tiny-radio label="right">right</tiny-radio>
      </tiny-radio-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Welcome } from '@opentiny/tiny-robot'
import { TinyRadioGroup, TinyRadio } from '@opentiny/vue'
import { CSSProperties, h, ref } from 'vue'

const icon = h('span', { style: { fontSize: '56px', lineHeight: '64px' } as CSSProperties }, '🤖')

const align = ref('left')
</script>
```

### 底部插槽

定制底部内容

<DemoFooter />

```vue
<template>
  <Welcome title="盘古助手" description="您好，我是盘古助手，您专属的华为云专家" :icon="icon">
    <template #footer>
      <span>根据相关法律法规要求，您需要先<a>登录</a>，若没有帐号，您可前往<a>注册</a></span>
    </template>
  </Welcome>
</template>

<script setup lang="tsx">
import { Welcome } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const icon = h('span', { style: { fontSize: '56px', lineHeight: '64px' } as CSSProperties }, '🤖')
</script>
```

## API

### Props

| 属性名        | 类型                            | 必填 | 默认值     | 说明                                |
| ------------- | ------------------------------- | ---- | ---------- | ----------------------------------- |
| `title`       | `string`                        | ✅   | —          | 标题                                |
| `description` | `string`                        | ✅   | —          | 标题描述                            |
| `align`       | `'left' \| 'center' \| 'right'` | ❌   | `'center'` | 内容对齐方式                        |
| `icon`        | `VNode`                         | ❌   | —          | 自定义图标节点，支持 Vue 组件或 JSX |

### 插槽

| 插槽     | 必填 | 默认值 | 说明             |
| -------- | ---- | ------ | ---------------- |
| `footer` | ❌   | —      | 组件底部内容插槽 |
