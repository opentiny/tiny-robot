---
outline: deep
---

# Bubble

## 组件示例

<script setup lang="ts">
import { BubbleItemProps, BubbleRoleConfig, BubbleStatus } from '@opentiny/tiny-robot'
import { h, reactive, ref } from 'vue'

/// 角色配置
const userRoleConfig = reactive<BubbleRoleConfig>({
  align: 'right',
  avatar: undefined,
})

const toggleUserAvatar = (value: boolean) => {
  userRoleConfig.avatar = value ? h('div', { style: 'font-size: 24px' }, '👤') : undefined
}

// max width
const maxWidth = ref(80)

// 渲染 markdown
const mdContent = `# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

~~Strikethrough~~
`

// stream
const streamContent = ref(mdContent)

const resetStreamContent = async () => {
  streamContent.value = ''

  const chunks: string[] = []
  for (let i = 0; i < mdContent.length; i += 3) {
    chunks.push(mdContent.slice(i, i + 3))
  }

  for (const chunk of chunks) {
    // 动态地给 content 末尾添加文本
    streamContent.value = streamContent.value + chunk
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}

// actions
const content = 'TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。'
const status = ref<BubbleStatus>('complete')
const streamContent2 = ref(content)

const resetStreamContent2 = async () => {
  streamContent2.value = ''
  status.value = 'generating'

  const chunks: string[] = []
  for (let i = 0; i < content.length; i += 3) {
    chunks.push(content.slice(i, i + 3))
  }

  for (const chunk of chunks) {
    // 动态地给 content 末尾添加文本
    streamContent2.value = streamContent2.value + chunk
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  status.value = 'complete'
}

const handleAction = (action: string) => {
  console.log(action)
  if (action === 'regenerate') {
    resetStreamContent2()
  } else if (action === 'copy') {
    alert('copied')
  }
}

// list
const userMsg: BubbleItemProps = {
  role: 'user',
  content: '简单介绍TinyVue',
}

const aiMsg: BubbleItemProps = {
  role: 'ai',
  content: 'TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。',
}
const bubbleItems = ref([userMsg, aiMsg])

const handleAddBubble = () => {
  if (bubbleItems.value[bubbleItems.value.length - 1].role === 'ai') {
    bubbleItems.value.push(userMsg)
  } else {
    bubbleItems.value.push(aiMsg)
  }
}
</script>

### 简单文本

设置 `content` 展示简单文本

<div class="language-vue" style="padding: 20px">
  <tiny-bubble-item
    role="ai"
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
  ></tiny-bubble-item>
</div>

```vue
<template>
  <tiny-bubble-item
    role="ai"
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
  ></tiny-bubble-item>
</template>
```

### 角色

`role` 属性可设置成 `ai` 或者 `user`

<div class="language-vue" style="padding: 20px; display: flex; flex-direction: column; gap: 16px">
  <tiny-bubble-item role="user" content="简单介绍TinyVue" :role-config="userRoleConfig"></tiny-bubble-item
  ><tiny-bubble-item
    role="ai"
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
  ></tiny-bubble-item>
  <hr style="width: 100%" />
  <div style="display: flex; flex-direction: column; gap: 16px">
    <div>
      <label style="font-size: 12px; margin-right: 8px">自定义头像</label>
      <tiny-switch mini @change="toggleUserAvatar"></tiny-switch>
    </div>
    <tiny-radio-group v-model="userRoleConfig.align">
      <tiny-radio label="left">左对齐</tiny-radio>
      <tiny-radio label="right">右对齐</tiny-radio>
    </tiny-radio-group>
  </div>
</div>

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <tiny-bubble-item role="user" content="简单介绍TinyVue" :role-config="userRoleConfig"></tiny-bubble-item
    ><tiny-bubble-item
      role="ai"
      content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
    ></tiny-bubble-item>
    <hr style="width: 100%" />
    <div style="display: flex; flex-direction: column; gap: 16px">
      <div>
        <label style="font-size: 12px; margin-right: 8px">自定义头像</label>
        <tiny-switch mini @change="toggleUserAvatar"></tiny-switch>
      </div>
      <tiny-radio-group v-model="userRoleConfig.align">
        <tiny-radio label="left">左对齐</tiny-radio>
        <tiny-radio label="right">右对齐</tiny-radio>
      </tiny-radio-group>
    </div>
  </div>
</template>

<script setup lang="ts">
// 角色配置
const userRoleConfig = reactive<BubbleRoleConfig>({
  align: 'right',
  avatar: undefined,
})

const toggleUserAvatar = (value: boolean) => {
  userRoleConfig.avatar = value ? h('div', { style: 'font-size: 24px' }, '👤') : undefined
}
</script>
```

### 状态

<div class="language-vue" style="padding: 20px; display: flex; flex-direction: column; gap: 16px">
  <label>加载中</label>
  <tiny-bubble-item role="ai" status="loading" />
  <label>用户停止</label>
  <tiny-bubble-item
    role="ai"
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，"
    status="aborted"
  ></tiny-bubble-item>
</div>

```vue
<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <label>加载中</label>
    <tiny-bubble-item role="ai" status="loading" />
    <label>用户停止</label>
    <tiny-bubble-item
      role="ai"
      content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，"
      status="aborted"
    ></tiny-bubble-item>
  </div>
</template>
```

### 最大宽度

<div class="language-vue" style="padding: 20px; display: flex; flex-direction: column; gap: 16px">
  <tiny-bubble-item
    role="ai"
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
    :max-width="maxWidth + '%'"
  ></tiny-bubble-item>
  <hr style="width: 100%" />
  <div style="display: flex; align-items: center">
    <label style="font-size: 12px; margin-right: 8px">调整最大宽度</label>
    <tiny-slider v-model="maxWidth" :max="100" :min="30"></tiny-slider>
    <label style="font-size: 12px; margin-left: 24px">当前值：{{ maxWidth + '%' }}</label>
  </div>
</div>

```vue
<template>
  <div style=" display: flex; flex-direction: column; gap: 16px">
    <tiny-bubble-item
      role="ai"
      content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
      :max-width="maxWidth + '%'"
    ></tiny-bubble-item>
    <hr style="width: 100%" />
    <div style="display: flex; align-items: center">
      <label style="font-size: 12px; margin-right: 8px">调整最大宽度</label>
      <tiny-slider v-model="maxWidth" :max="100" :min="30"></tiny-slider>
      <label style="font-size: 12px; margin-left: 24px">当前值：{{ maxWidth + '%' }}</label>
    </div>
  </div>
</template>

<script setup lang="ts">
const maxWidth = ref(80)
</script>
```

### 渲染 markdown

设置 `type` 属性为 `markdown`，会以 markdown 格式渲染。`type` 属性可选值为 `text` 或`markdown`，默认为 `text` 。markdown 渲染使用 [markdown-it](https://github.com/markdown-it/markdown-it) 库实现，`mdConfig` 属性是 markdown 配置，配置会传递给内部的 `markdown-it`。具体配置项可查看 markdown-it 的[options](https://markdown-it.github.io/markdown-it/#MarkdownIt.new)

<div style="background: #f9f9f9; padding: 24px; border-radius: 8px">
  <TinyBubbleItem role="ai" :content="mdContent" type="markdown" />
</div>

```vue
<template>
  <TinyBubbleItem role="ai" :content="mdContent" type="markdown" />
</template>

<script setup lang="ts">
const mdContent = `# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

~~Strikethrough~~
`
</script>
```

### 流式文本

`content` 属性是响应式的，动态地给 `content` 末尾添加文本是实现流式文本的最简单的方法

<div style="background: #f9f9f9; padding: 24px; border-radius: 8px">
  <TinyBubbleItem role="ai" :content="streamContent" type="markdown" />
  <hr />
  <button @click="resetStreamContent">点击展示流式文本</button>
</div>

```vue
<template>
  <TinyBubbleItem role="ai" :content="streamContent" type="markdown" />
  <hr />
  <button @click="resetStreamContent">点击展示流式文本</button>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const mdContent = `# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

~~Strikethrough~~
`

const streamContent = ref(mdContent)

const resetStreamContent = async () => {
  streamContent.value = ''

  const chunks: string[] = []
  for (let i = 0; i < mdContent.length; i += 3) {
    chunks.push(mdContent.slice(i, i + 3))
  }

  for (const chunk of chunks) {
    // 动态地给 content 末尾添加文本
    streamContent.value = streamContent.value + chunk
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
}
</script>
```

### actions

<div class="language-vue" style="padding: 20px">
  <tiny-bubble-item
    role="ai"
    :content="streamContent2"
    :show-actions="true"
    :status="status"
    @action-click="handleAction"
  />
</div>

```vue
<template>
  <tiny-bubble-item
    role="ai"
    :content="streamContent2"
    :show-actions="true"
    :status="status"
    @action-click="handleAction"
  />
</template>

<script setup lang="ts">
const content = 'TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。'
const status = ref<BubbleStatus>('complete')
const streamContent2 = ref(content)

const resetStreamContent2 = async () => {
  streamContent2.value = ''
  status.value = 'generating'

  const chunks: string[] = []
  for (let i = 0; i < content.length; i += 3) {
    chunks.push(content.slice(i, i + 3))
  }

  for (const chunk of chunks) {
    // 动态地给 content 末尾添加文本
    streamContent2.value = streamContent2.value + chunk
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  status.value = 'complete'
}

const handleAction = (action: string) => {
  console.log(action)
  if (action === 'regenerate') {
    resetStreamContent2()
  } else if (action === 'copy') {
    alert('copied')
  }
}
</script>
```

### 插槽

<div class="language-vue" style="padding: 20px; display: flex; flex-direction: column; gap: 16px">
  <label>加载中插槽</label>
  <tiny-bubble-item role="ai" status="loading">
    <template #loading>
      <div style="display: flex; align-items: center">加载中。。。</div>
    </template>
  </tiny-bubble-item>
  <label>footer插槽</label>
  <tiny-bubble-item
    role="ai"
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
    :show-actions="true"
  >
    <template #footer>
      <div style="color: rgb(128, 128, 128); font-size: 14px; margin-top: 12px">3条来源</div>
    </template>
  </tiny-bubble-item>
</div>

```vue
<template>
  <div style=" display: flex; flex-direction: column; gap: 16px">
    <label>加载中插槽</label>
    <tiny-bubble-item role="ai" status="loading">
      <template #loading>
        <div style="display: flex; align-items: center">加载中。。。</div>
      </template>
    </tiny-bubble-item>
    <label>footer插槽</label>
    <tiny-bubble-item
      role="ai"
      content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
      :show-actions="true"
    >
      <template #footer>
        <div style="color: rgb(128, 128, 128); font-size: 14px; margin-top: 12px">3条来源</div>
      </template>
    </tiny-bubble-item>
  </div>
</template>
```

### 列表

<div class="language-vue" style="padding: 20px">
  <tiny-bubble-list
    :items="bubbleItems"
    :action-configs="{ ai: { show: true } }"
    style="max-height: 200px"
    :auto-scroll="true"
  ></tiny-bubble-list>
  <hr style="width: 100%" />
  <div>
    <button @click="handleAddBubble">点击增加对话</button>
  </div>
</div>

```vue
<template>
  <div style=" display: flex; flex-direction: column; gap: 16px">
    <tiny-bubble-list
      :items="bubbleItems"
      :action-configs="{ ai: { show: true } }"
      style="max-height: 200px"
      :auto-scroll="true"
    ></tiny-bubble-list>
    <hr style="width: 100%" />
    <div>
      <button @click="handleAddBubble">点击增加对话</button>
    </div>
  </div>
</template>

<script>
const userMsg: BubbleItemProps = {
  role: 'user',
  content: '简单介绍TinyVue',
}

const aiMsg: BubbleItemProps = {
  role: 'ai',
  content: 'TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。',
}
const bubbleItems = ref([userMsg, aiMsg])

const handleAddBubble = () => {
  if (bubbleItems.value[bubbleItems.value.length - 1].role === 'ai') {
    bubbleItems.value.push(userMsg)
  } else {
    bubbleItems.value.push(aiMsg)
  }
}
</script>
```

## API

### BubbleItem 组件

单个气泡组件的属性定义

```typescript
interface BubbleItemProps {
  /**
   * 角色，`ai` 或 `user`
   */
  role: BubbleRole
  /**
   * 内容
   */
  content?: string
  /**
   * 内容类型
   */
  type?: 'text' | 'markdown'
  /**
   * 气泡状态
   */
  status?: BubbleStatus
  /**
   * 角色配置项
   */
  roleConfig?: BubbleRoleConfig
  /**
   * type 为 'markdown' 时，markdown 的配置项
   */
  mdConfig?: MarkdownItOptions
  showActions?: boolean
  actions?: BubbleAction[]
  // 样式相关
  maxWidth?: CSSProperties['maxWidth']
}
```

**属性说明**:

- `role`: 必选，气泡角色
- `content`: 可选，气泡显示的内容
- `type`: 可选，内容类型，默认为'text'
- `status`: 可选，气泡状态
- `roleConfig`: 可选，覆盖全局的角色配置
- `mdConfig`: 可选，markdown 渲染配置
- `showActions`: 可选，是否显示操作按钮
- `actions`: 可选，自定义操作按钮
- `maxWidth`: 可选，气泡最大宽度

---

### BubbleList 组件

气泡列表组件的属性定义

```typescript
interface BubbleListProps {
  items: BubbleItemProps[] // 气泡项列表
  roleConfigs?: Partial<Record<BubbleRole, BubbleRoleConfig>> // 角色配置
  mdConfig?: MarkdownItOptions // 全局markdown配置
  actionConfigs?: Partial<Record<BubbleRole, BubbleActionConfig>> // 操作按钮配置
  autoScroll?: boolean // 是否自动滚动到底部
  // 样式相关
  maxWidth?: CSSProperties['maxWidth'] // 最大宽度
}
```

**属性说明**:

- `items`: 必选，气泡项数组
- `roleConfigs`: 可选，各角色的默认配置
- `mdConfig`: 可选，全局 markdown 配置
- `actionConfigs`: 可选，各角色的操作按钮配置
- `autoScroll`: 可选，是否自动滚动
- `maxWidth`: 可选，列表最大宽度

---

### BubbleRole

定义气泡对话中的角色类型

```typescript
type BubbleRole = 'ai' | 'user'
```

**取值说明**:

- `'ai'`: AI 角色气泡
- `'user'`: 用户角色气泡

---

### BubbleRoleConfig

角色配置项，定义不同角色的显示方式

```typescript
interface BubbleRoleConfig {
  avatar?: VNode // 角色头像，Vue虚拟节点
  align: 'left' | 'right' // 气泡对齐方式
}
```

**属性说明**:

- `avatar`: 可选，显示在气泡旁的头像
- `align`: 必选，气泡的对齐方向

---

### BubbleStatus

定义气泡的状态

```typescript
type BubbleStatus = 'loading' | 'generating' | 'aborted' | 'complete' | 'error'
```

**状态说明**:

- `'loading'`: 加载中状态
- `'generating'`: AI 生成内容中
- `'aborted'`: 生成被中止
- `'complete'`: 完成状态
- `'error'`: 错误状态

---

### BubbleActionOptions

自定义气泡操作项

```typescript
interface BubbleActionOptions {
  name: string // 操作名称
  vnode: VNode | Component // 操作图标或组件
  show?: boolean | ((props: BubbleItemProps) => boolean) // 显示条件
}
```

---

### BubbleAction

气泡支持的操作类型，可以是预设类型或自定义操作

```typescript
type BubbleAction = 'copy' | 'regenerate' | 'like' | 'dislike' | 'continue' | 'edit' | BubbleActionOptions
```

**预设操作类型**:

- `'copy'`: 复制内容
- `'regenerate'`: 重新生成
- `'like'`: 点赞
- `'dislike'`: 点踩
- `'continue'`: 继续生成
- `'edit'`: 编辑内容

---

### BubbleActionConfig

操作按钮配置

```typescript
interface BubbleActionConfig {
  show?: boolean // 是否显示操作栏
  actions?: BubbleAction[] // 自定义操作项
}
```
