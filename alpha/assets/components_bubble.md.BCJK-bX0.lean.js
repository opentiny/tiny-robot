const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/list-hidden.CUHfRbtE.js","assets/chunks/theme.BY94qQGO.js","assets/chunks/framework.CP_8zwxL.js","assets/chunks/list.P9wxejxr.js","assets/chunks/schema-render.BWwldkhb.js","assets/chunks/slots.Cey4FTGD.js","assets/chunks/custom-content-field.CGaHH1dg.js","assets/chunks/messages.BXQLfwOx.js","assets/chunks/streaming.BvxoJrF6.js","assets/chunks/markdown.BmQnXUbt.js","assets/chunks/max-width.Ko0CGQnD.js","assets/chunks/aborted.BDP4RzT2.js","assets/chunks/loading.DrwVKeFy.js","assets/chunks/shape.KJMboaUN.js","assets/chunks/avatar-and-placement.DyLSwgWJ.js","assets/chunks/basic.DxuQCKVo.js"])))=>i.map(i=>d[i]);
import{s as d,A as p,_ as c,r as Z,H as I,e as R,o as L,a4 as k,ah as h,J as e,q as a,ai as u,x as n,i as o,ak as b,g as s}from"./chunks/framework.CP_8zwxL.js";import{L as C,N as m}from"./chunks/index.glnvWzwV.js";const G=`<template>
  <tr-bubble-list :items="items" :roles="roles"></tr-bubble-list>
</template>

<script setup lang="ts">
import { BubbleListProps, BubbleRoleConfig, TrBubbleList } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const items: BubbleListProps['items'] = [
  {
    role: 'user',
    content: '简单介绍 TinyVue',
  },
  {
    role: 'ai',
    content: 'TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由 OpenTiny 开源团队开发维护。',
  },
  {
    role: 'user',
    content: '简单介绍 TinyVue',
  },
  {
    role: 'ai',
    content: 'TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由 OpenTiny 开源团队开发维护。',
  },
]

const roles: Record<string, BubbleRoleConfig> = {
  ai: {
    placement: 'start',
    avatar: aiAvatar,
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
    hidden: true,
  },
}
<\/script>
`,P=`<template>
  <tr-bubble-list :items="items" :roles="roles"></tr-bubble-list>
</template>

<script setup lang="ts">
import { BubbleListProps, BubbleRoleConfig, TrBubbleList, TrFeedback } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })

const items: BubbleListProps['items'] = [
  {
    role: 'user',
    content: '简单介绍 TinyVue',
  },
  {
    role: 'ai',
    content: 'TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由 OpenTiny 开源团队开发维护。',
    slots: {
      default: ({ bubbleProps }) => {
        return h('div', { style: { color: 'green' } }, bubbleProps.content)
      },
    },
  },
  {
    role: 'user',
    content: '简单介绍 TinyVue',
  },
  {
    role: 'ai',
    content: 'TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由 OpenTiny 开源团队开发维护。',
  },
  {
    role: 'user',
    content: '简单介绍 TinyVue',
  },
  {
    role: 'ai',
    content: 'TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由 OpenTiny 开源团队开发维护。',
  },
]

const roles: Record<string, BubbleRoleConfig> = {
  ai: {
    placement: 'start',
    avatar: aiAvatar,
    maxWidth: '80%',
    slots: {
      default: ({ bubbleProps }) => {
        return h('div', { style: { color: 'red' } }, bubbleProps.content)
      },
      footer: ({ bubbleProps, index }) => {
        return h(TrFeedback, {
          actions: [
            { name: 'refresh', label: '刷新', icon: 'refresh' },
            { name: 'copy', label: '复制', icon: 'copy' },
          ],
          onAction(name) {
            console.log(name)
            console.log(bubbleProps.content)
            console.log(index, items[index!])
          },
        })
      },
      trailer: ({ index }) => {
        return h('div', {}, \`尾部插槽，列表索引：\${index}\`)
      },
    },
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
    maxWidth: '80%',
    slots: {
      trailer: ({ index }) => {
        return h('div', {}, \`尾部插槽，列表索引：\${index}\`)
      },
    },
  },
}
<\/script>

<style scoped>
:deep([data-role='user']) {
  --tr-bubble-content-bg: var(--tr-color-primary-light);
}
</style>
`,S=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <label>使用插槽渲染运行时渲染</label>
    <tr-bubble :avatar="aiAvatar">
      <schema-card :schema="schemaObj"></schema-card>
    </tr-bubble>

    <label>使用markdown渲染运行时渲染（webcomponent）</label>
    <tr-bubble :avatar="aiAvatar" :content="mdContent" :content-renderer="markdownRenderer"></tr-bubble>
  </div>
</template>

<script setup lang="ts">
import { BubbleMarkdownContentRenderer, TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { defineCustomElement, h, ref } from 'vue'
import SchemaCard from './schema-card.ce.vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const markdownRenderer = new BubbleMarkdownContentRenderer({
  mdConfig: { html: true },
  dompurifyConfig: { ADD_TAGS: ['schema-card'], ADD_ATTR: ['schema'] },
})

const schemaObj = ref(
  JSON.stringify({
    state: {},
    methods: {},
    componentName: 'Page',
    props: {},
    children: [
      { componentName: 'Text', props: { text: '运行时渲染器文本' } },
      { componentName: 'Button', props: { text: '运行时渲染器按钮' } },
    ],
  }),
)

// 下面的代码应放在应用挂载前执行
if (!customElements.get('schema-card')) {
  // 将 Vue 组件转为自定义元素类。
  const CardElement = defineCustomElement(SchemaCard)
  // 在浏览器中注册元素类。
  customElements.define('schema-card', CardElement)
}

const mdContent = \`# Markdown 标题

**Markdown 加粗文本**

<schema-card schema='\${schemaObj.value}'></schema-card>
\`
<\/script>
`,V=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <label>加载中插槽</label>
    <tr-bubble :avatar="aiAvatar" :loading="true">
      <template #loading>
        <img style="height: 40px; margin-left: -25px" :src="loadingImgUrl" />
      </template>
    </tr-bubble>
    <hr />
    <label>默认插槽、footer 插槽 和 trailer 插槽（鼠标hover气泡内容显示）</label>
    <tr-bubble class="bubble" :avatar="aiAvatar" :actions="['refresh', 'copy']">
      <span style="color: orange"
        >TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由 OpenTiny 开源团队开发维护。</span
      >
      <template #footer>
        <tr-feedback :operations="operations" :actions="actions" :sources="sources" />
      </template>
      <template #trailer>
        <div class="trailer-slot">
          <IconButton :icon="IconCopy" />
          <IconButton :icon="IconLike" />
          <IconButton :icon="IconDislike" />
        </div>
      </template>
    </tr-bubble>
  </div>
</template>

<script setup lang="ts">
import { FeedbackProps, IconButton, TrBubble, TrFeedback } from '@opentiny/tiny-robot'
import { IconAi, IconCopy, IconDislike, IconLike } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const loadingImgUrl = import.meta.env.BASE_URL + 'wave.webp'

const operations: FeedbackProps['operations'] = [
  {
    name: 'edit',
    label: '编辑',
    onClick: () => console.log('点击了编辑按钮'),
  },
  {
    name: 'delete',
    label: '删除',
  },
]

const actions: FeedbackProps['actions'] = [
  {
    name: 'copy',
    label: '复制',
    icon: 'copy',
  },
  {
    name: 'refresh',
    label: '刷新',
    icon: 'refresh',
  },
]

const sources: FeedbackProps['sources'] = [
  {
    label: '数据来源1',
    link: 'https://example.com/source1',
  },
  {
    label: '数据来源2',
    link: 'https://example.com/source2',
  },
]
<\/script>

<style scoped>
.trailer-slot {
  position: absolute;
  top: 100%;
  padding-top: 4px;

  display: flex;
  align-items: center;
  gap: 4px;

  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.bubble:hover .trailer-slot {
  opacity: 1;
  pointer-events: auto;
}
</style>
`,X=`<template>
  <tr-bubble-list :items="items" :roles="roles" />
  <hr />
  <div>
    <label>指定渲染属性为 my-content: </label>
    <tiny-switch v-model="custom" />
  </div>
  <hr />
</template>

<script setup lang="ts">
import { BubbleContentItem, BubbleListProps, BubbleRoleConfig, TrBubbleList } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { TinySwitch } from '@opentiny/vue'
import { h, reactive, ref, watch } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const custom = ref(true)

const thinkingContent = \`已获取到西安明天（2025年5月31日）的天气，最高温度28℃，最低温度17℃，有小雨。下一步，使用高德地图的文本搜索工具查找西安适合游玩的地点。\`

const items: BubbleListProps['items'] & { 'my-content'?: BubbleContentItem[] }[] = [
  {
    role: 'ai',
    content: thinkingContent,
    'my-content': [
      {
        type: 'collapsible-text',
        title: '思考过程（折叠消息渲染器）',
        content: thinkingContent,
      },
    ],
  },
]

const roles: Record<string, BubbleRoleConfig> = reactive({
  ai: {
    placement: 'start',
    avatar: aiAvatar,
    customContentField: 'my-content',
  },
})

watch(custom, (val) => {
  roles.ai.customContentField = val ? 'my-content' : undefined
})
<\/script>
`,J=`<template>
  <tr-bubble-provider :content-renderers="contentRenderers">
    <tr-bubble :content="content" :avatar="aiAvatar" placement="start"></tr-bubble>
  </tr-bubble-provider>
  <hr />
  <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 8px">
    <button @click="changeCustomTextContent">修改自定义文本内容</button>
    <button @click="changeMarkdownContent">修改Markdown内容</button>
    <button @click="changeToolContent">修改工具内容(给number加1)</button>
    <button @click="addMessage">添加消息</button>
    <button @click="setThinkingContent">设置思考过程</button>
    <button @click="toggleToolStatus">切换工具状态</button>
  </div>
</template>

<script setup lang="ts">
import { BubbleContentItem, TrBubbleProvider, TrBubble, BubbleMarkdownContentRenderer } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h, reactive, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

// function renderer
const customTextRenderer = (props: BubbleContentItem) => {
  // 剩余参数当作属性传递给div，那么外部可以传递class、style、id等属性
  const { content, ...rest } = props
  return h('div', { style: { color: 'red', fontStyle: 'italic' }, ...rest }, content)
}

// class renderer
const markdownRenderer = new BubbleMarkdownContentRenderer({ defaultAttrs: { class: 'markdown-content' } })

// register renderer
const contentRenderers = {
  'custom-text': customTextRenderer,
  markdown: markdownRenderer,
}

const thinkingContent = \`已获取到西安明天（2025年5月31日）的天气，最高温度28℃，最低温度17℃，有小雨。下一步，使用高德地图的文本搜索工具查找西安适合游玩的地点。\`

const toolMessage = reactive({
  type: 'tool',
  name: 'DayWeather（工具渲染器）',
  status: 'running',
})

const thinkingMessage = reactive({
  type: 'collapsible-text',
  title: '思考过程（折叠消息渲染器）',
  content: thinkingContent,
})

const content = ref<BubbleContentItem[]>([
  {
    type: 'text',
    content: '我使用默认的文本渲染器（组件渲染器）',
    style: {
      fontWeight: 'bold',
      color: 'green',
    },
    'data-id': 'test-id-1',
    onClick: () => {
      alert('点击了文本消息')
    },
  },
  {
    type: 'custom-text',
    content: '我使用自定义的文本渲染器（函数渲染器）',
    id: 'custom-text-id',
  },
  {
    type: 'markdown',
    content: \`# 我使用Markdown渲染器（类渲染器）\`,
    id: 'markdown-id',
  },
  {
    type: 'tool',
    name: 'DayWeather（工具渲染器）',
    status: 'success',
    content: JSON.stringify({
      string: 'hello',
      number: 123,
      boolean: true,
      null: null,
      object: {
        a: 1,
      },
    }),
    formatPretty: true,
    defaultOpen: true,
  },
  toolMessage,
  {
    type: 'tool',
    name: 'DayWeather（工具渲染器）',
    status: 'failed',
  },
  {
    type: 'tool',
    name: 'DayWeather（工具渲染器）',
    status: 'cancelled',
  },
  thinkingMessage,
])

const addMessage = () => {
  content.value.push({
    type: 'collapsible-text',
    title: '思考过程',
    content: thinkingContent,
  })
}

const toggleToolStatus = () => {
  toolMessage.status = toolMessage.status === 'running' ? 'success' : 'running'
}

const setThinkingContent = () => {
  thinkingMessage.content = ''
  for (let i = 0; i < thinkingContent.length; i += 1) {
    setTimeout(() => {
      thinkingMessage.content += thinkingContent[i]
    }, i * 100)
  }
}

const changeCustomTextContent = () => {
  const customTextMessage = content.value.find((item) => item.type === 'custom-text')
  if (customTextMessage) {
    customTextMessage.content += '123'
  }
}

const changeMarkdownContent = () => {
  const markdownMessage = content.value.find((item) => item.type === 'markdown')
  if (markdownMessage) {
    markdownMessage.content += '123'
  }
}

const changeToolContent = () => {
  const toolMessage = content.value.find((item) => item.type === 'tool')
  if (toolMessage) {
    if (toolMessage.content?.startsWith('{')) {
      const parsedContent = JSON.parse(toolMessage.content)
      toolMessage.content = JSON.stringify({
        ...parsedContent,
        number: parsedContent.number + 1,
      })
    }
  }
}
<\/script>
`,M=`<template>
  <tr-bubble :content="streamContent" :avatar="aiAvatar" :content-renderer="markdownRenderer" />
  <hr />
  <button @click="resetStreamContent">点击展示流式文本</button>
</template>

<script setup lang="ts">
import { BubbleMarkdownContentRenderer, TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const markdownRenderer = new BubbleMarkdownContentRenderer()

const mdContent = \`# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

~~Strikethrough~~
\`

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
<\/script>
`,q=`<template>
  <tr-bubble :content="mdContent" :avatar="aiAvatar" :content-renderer="markdownRenderer"></tr-bubble>
</template>

<script setup lang="ts">
import { BubbleMarkdownContentRenderer, TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const markdownRenderer = new BubbleMarkdownContentRenderer()

const mdContent = \`# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

~~Strikethrough~~
\`
<\/script>
`,U=`<template>
  <tr-bubble
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由 OpenTiny 开源团队开发维护。"
    :avatar="aiAvatar"
    :max-width="maxWidth + '%'"
  ></tr-bubble>
  <hr />
  <div style="display: flex; align-items: center">
    <label style="margin-right: 8px">调整最大宽度</label>
    <tiny-slider v-model="maxWidth" :max="100" :min="30"></tiny-slider>
    <label style="margin-left: 24px">当前值：{{ maxWidth + '%' }}</label>
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { TinySlider } from '@opentiny/vue'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const maxWidth = ref(80)
<\/script>
`,O=`<template>
  <tr-bubble
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由 OpenTiny 开源团队开发维护。"
    :avatar="aiAvatar"
    :aborted="aborted"
  ></tr-bubble>
  <hr />
  <div>
    <label style="margin-right: 8px">用户停止</label>
    <tiny-switch v-model="aborted"></tiny-switch>
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { TinySwitch } from '@opentiny/vue'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const aborted = ref(true)
<\/script>
`,z=`<template>
  <p>单个气泡加载中</p>
  <tr-bubble
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由 OpenTiny 开源团队开发维护。"
    :avatar="aiAvatar"
    :loading="loading"
    :style="{ marginTop: '16px' }"
  ></tr-bubble>
  <hr />
  <p>单个气泡加载中，使用 slots 自定义 loading 内容</p>
  <tr-bubble
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由 OpenTiny 开源团队开发维护。"
    :avatar="aiAvatar"
    :loading="loading"
    :style="{ marginTop: '16px' }"
  >
    <template #loading>
      <img style="height: 40px; margin-left: -25px" :src="loadingImgUrl" />
    </template>
  </tr-bubble>
  <hr />
  <p>列表加载中</p>
  <tr-bubble-list :items="items" :roles="roles" :loading="loading" loading-role="ai"></tr-bubble-list>
  <hr />
  <div>
    <label style="margin-right: 8px">加载中</label>
    <tiny-switch v-model="loading"></tiny-switch>
  </div>
</template>

<script setup lang="ts">
import { BubbleListProps, TrBubble, TrBubbleList } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { TinySwitch } from '@opentiny/vue'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })
const loading = ref(true)

const loadingImgUrl = import.meta.env.BASE_URL + 'wave.webp'

const items = ref<BubbleListProps['items']>([
  {
    role: 'user',
    content: '简单介绍 TinyVue',
  },
])

const roles = ref<BubbleListProps['roles']>({
  user: {
    placement: 'end',
    avatar: userAvatar,
  },
  ai: {
    placement: 'start',
    avatar: aiAvatar,
    slots: {
      loading: () => h('img', { style: { height: '40px', marginLeft: '-25px' }, src: loadingImgUrl }),
    },
  },
})
<\/script>
`,j=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <tr-bubble content="形状: rounded" placement="start" shape="rounded"></tr-bubble>
    <tr-bubble
      content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由 OpenTiny 开源团队开发维护。"
      placement="end"
      shape="rounded"
    ></tr-bubble>
    <tr-bubble content="形状: corner" placement="start" shape="corner"></tr-bubble>
    <tr-bubble
      content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由 OpenTiny 开源团队开发维护。"
      placement="end"
      shape="corner"
    ></tr-bubble>
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
<\/script>
`,Y=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <tr-bubble
      content="简单介绍 TinyVue"
      :avatar="userAvatar"
      placement="end"
      style="--tr-bubble-content-bg: var(--tr-color-primary-light)"
    ></tr-bubble>
    <tr-bubble
      content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由 OpenTiny 开源团队开发维护。"
      :avatar="aiAvatar"
      placement="start"
    ></tr-bubble>
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi, IconUser } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const userAvatar = h(IconUser, { style: { fontSize: '32px' } })
<\/script>
`,Q=`<template>
  <tr-bubble
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由 OpenTiny 开源团队开发维护。"
    style="--tr-bubble-content-bg: var(--tr-color-primary-light)"
  ></tr-bubble>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
<\/script>
`,tt=JSON.parse('{"title":"Bubble 气泡组件","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/bubble.md","filePath":"components/bubble.md"}'),N={name:"components/bubble.md"},et=Object.assign(N,{setup(H){const y=d();p(async()=>{y.value=(await c(async()=>{const{default:l}=await import("./chunks/list-hidden.CUHfRbtE.js");return{default:l}},__vite__mapDeps([0,1,2]))).default});const E=d();p(async()=>{E.value=(await c(async()=>{const{default:l}=await import("./chunks/list.P9wxejxr.js");return{default:l}},__vite__mapDeps([3,1,2]))).default});const g=d();p(async()=>{g.value=(await c(async()=>{const{default:l}=await import("./chunks/schema-render.BWwldkhb.js");return{default:l}},__vite__mapDeps([4,2,1]))).default});const B=d();p(async()=>{B.value=(await c(async()=>{const{default:l}=await import("./chunks/slots.Cey4FTGD.js");return{default:l}},__vite__mapDeps([5,1,2]))).default});const A=d();p(async()=>{A.value=(await c(async()=>{const{default:l}=await import("./chunks/custom-content-field.CGaHH1dg.js");return{default:l}},__vite__mapDeps([6,1,2]))).default});const v=d();p(async()=>{v.value=(await c(async()=>{const{default:l}=await import("./chunks/messages.BXQLfwOx.js");return{default:l}},__vite__mapDeps([7,1,2]))).default});const f=d();p(async()=>{f.value=(await c(async()=>{const{default:l}=await import("./chunks/streaming.BvxoJrF6.js");return{default:l}},__vite__mapDeps([8,1,2]))).default});const D=d();p(async()=>{D.value=(await c(async()=>{const{default:l}=await import("./chunks/markdown.BmQnXUbt.js");return{default:l}},__vite__mapDeps([9,1,2]))).default});const F=d();p(async()=>{F.value=(await c(async()=>{const{default:l}=await import("./chunks/max-width.Ko0CGQnD.js");return{default:l}},__vite__mapDeps([10,1,2]))).default});const T=d();p(async()=>{T.value=(await c(async()=>{const{default:l}=await import("./chunks/aborted.BDP4RzT2.js");return{default:l}},__vite__mapDeps([11,1,2]))).default});const x=d();p(async()=>{x.value=(await c(async()=>{const{default:l}=await import("./chunks/loading.DrwVKeFy.js");return{default:l}},__vite__mapDeps([12,1,2]))).default});const w=d();p(async()=>{w.value=(await c(async()=>{const{default:l}=await import("./chunks/shape.KJMboaUN.js");return{default:l}},__vite__mapDeps([13,1,2]))).default});const W=d();p(async()=>{W.value=(await c(async()=>{const{default:l}=await import("./chunks/avatar-and-placement.DyLSwgWJ.js");return{default:l}},__vite__mapDeps([14,1,2]))).default});const i=Z(!0),_=d();return p(async()=>{_.value=(await c(async()=>{const{default:l}=await import("./chunks/basic.DxuQCKVo.js");return{default:l}},__vite__mapDeps([15,1,2]))).default}),(l,t)=>{const r=I("ClientOnly");return L(),R("div",null,[t[14]||(t[14]=k("",6)),h(e(n(C),null,null,512),[[u,i.value]]),e(r,null,{default:o(()=>[e(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{i.value=!1}),vueCode:n(Q)},b({_:2},[_.value?{name:"vue",fn:o(()=>[e(n(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[15]||(t[15]=a("h3",{id:"头像和位置",tabindex:"-1"},[s("头像和位置 "),a("a",{class:"header-anchor",href:"#头像和位置","aria-label":'Permalink to "头像和位置"'},"​")],-1)),t[16]||(t[16]=a("p",null,[s("通过 "),a("code",null,"avatar"),s(" 设置自定义头像，通过 "),a("code",null,"placement"),s(" 设置位置，提供了 "),a("code",null,"start"),s("、"),a("code",null,"end"),s(" 两个选项")],-1)),h(e(n(C),null,null,512),[[u,i.value]]),e(r,null,{default:o(()=>[e(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{i.value=!1}),vueCode:n(Y)},b({_:2},[W.value?{name:"vue",fn:o(()=>[e(n(W))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[17]||(t[17]=a("h3",{id:"气泡形状",tabindex:"-1"},[s("气泡形状 "),a("a",{class:"header-anchor",href:"#气泡形状","aria-label":'Permalink to "气泡形状"'},"​")],-1)),t[18]||(t[18]=a("p",null,[s("通过 "),a("code",null,"shape"),s(" 设置气泡形状。目前提供了 "),a("code",null,"rounded"),s(" 和 "),a("code",null,"corner"),s(" 两个选项。默认为 "),a("code",null,"corner")],-1)),h(e(n(C),null,null,512),[[u,i.value]]),e(r,null,{default:o(()=>[e(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{i.value=!1}),vueCode:n(j)},b({_:2},[w.value?{name:"vue",fn:o(()=>[e(n(w))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[19]||(t[19]=k("",3)),h(e(n(C),null,null,512),[[u,i.value]]),e(r,null,{default:o(()=>[e(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22loading.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbubble%2Floading.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cp%3E%E5%8D%95%E4%B8%AA%E6%B0%94%E6%B3%A1%E5%8A%A0%E8%BD%BD%E4%B8%AD%3C%2Fp%3E%5Cn%20%20%3Ctr-bubble%5Cn%20%20%20%20content%3D%5C%22TinyVue%20%E6%98%AF%E4%B8%80%E4%B8%AA%E8%BD%BB%E9%87%8F%E7%BA%A7%E3%80%81%E9%AB%98%E6%80%A7%E8%83%BD%E7%9A%84%20Vue%203%20%E7%BB%84%E4%BB%B6%E5%BA%93%EF%BC%8C%E4%B8%93%E4%B8%BA%E4%BC%81%E4%B8%9A%E7%BA%A7%E5%BA%94%E7%94%A8%E8%AE%BE%E8%AE%A1%EF%BC%8C%E7%94%B1%20OpenTiny%20%E5%BC%80%E6%BA%90%E5%9B%A2%E9%98%9F%E5%BC%80%E5%8F%91%E7%BB%B4%E6%8A%A4%E3%80%82%5C%22%5Cn%20%20%20%20%3Aavatar%3D%5C%22aiAvatar%5C%22%5Cn%20%20%20%20%3Aloading%3D%5C%22loading%5C%22%5Cn%20%20%20%20%3Astyle%3D%5C%22%7B%20marginTop%3A%20'16px'%20%7D%5C%22%5Cn%20%20%3E%3C%2Ftr-bubble%3E%5Cn%20%20%3Chr%20%2F%3E%5Cn%20%20%3Cp%3E%E5%8D%95%E4%B8%AA%E6%B0%94%E6%B3%A1%E5%8A%A0%E8%BD%BD%E4%B8%AD%EF%BC%8C%E4%BD%BF%E7%94%A8%20slots%20%E8%87%AA%E5%AE%9A%E4%B9%89%20loading%20%E5%86%85%E5%AE%B9%3C%2Fp%3E%5Cn%20%20%3Ctr-bubble%5Cn%20%20%20%20content%3D%5C%22TinyVue%20%E6%98%AF%E4%B8%80%E4%B8%AA%E8%BD%BB%E9%87%8F%E7%BA%A7%E3%80%81%E9%AB%98%E6%80%A7%E8%83%BD%E7%9A%84%20Vue%203%20%E7%BB%84%E4%BB%B6%E5%BA%93%EF%BC%8C%E4%B8%93%E4%B8%BA%E4%BC%81%E4%B8%9A%E7%BA%A7%E5%BA%94%E7%94%A8%E8%AE%BE%E8%AE%A1%EF%BC%8C%E7%94%B1%20OpenTiny%20%E5%BC%80%E6%BA%90%E5%9B%A2%E9%98%9F%E5%BC%80%E5%8F%91%E7%BB%B4%E6%8A%A4%E3%80%82%5C%22%5Cn%20%20%20%20%3Aavatar%3D%5C%22aiAvatar%5C%22%5Cn%20%20%20%20%3Aloading%3D%5C%22loading%5C%22%5Cn%20%20%20%20%3Astyle%3D%5C%22%7B%20marginTop%3A%20'16px'%20%7D%5C%22%5Cn%20%20%3E%5Cn%20%20%20%20%3Ctemplate%20%23loading%3E%5Cn%20%20%20%20%20%20%3Cimg%20style%3D%5C%22height%3A%2040px%3B%20margin-left%3A%20-25px%5C%22%20%3Asrc%3D%5C%22loadingImgUrl%5C%22%20%2F%3E%5Cn%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%3C%2Ftr-bubble%3E%5Cn%20%20%3Chr%20%2F%3E%5Cn%20%20%3Cp%3E%E5%88%97%E8%A1%A8%E5%8A%A0%E8%BD%BD%E4%B8%AD%3C%2Fp%3E%5Cn%20%20%3Ctr-bubble-list%20%3Aitems%3D%5C%22items%5C%22%20%3Aroles%3D%5C%22roles%5C%22%20%3Aloading%3D%5C%22loading%5C%22%20loading-role%3D%5C%22ai%5C%22%3E%3C%2Ftr-bubble-list%3E%5Cn%20%20%3Chr%20%2F%3E%5Cn%20%20%3Cdiv%3E%5Cn%20%20%20%20%3Clabel%20style%3D%5C%22margin-right%3A%208px%5C%22%3E%E5%8A%A0%E8%BD%BD%E4%B8%AD%3C%2Flabel%3E%5Cn%20%20%20%20%3Ctiny-switch%20v-model%3D%5C%22loading%5C%22%3E%3C%2Ftiny-switch%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20BubbleListProps%2C%20TrBubble%2C%20TrBubbleList%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconUser%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20TinySwitch%20%7D%20from%20'%40opentiny%2Fvue'%5Cnimport%20%7B%20h%2C%20ref%20%7D%20from%20'vue'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20userAvatar%20%3D%20h(IconUser%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20loading%20%3D%20ref(true)%5Cn%5Cnconst%20loadingImgUrl%20%3D%20'%2Ftiny-robot%2Falpha%2F'%20%2B%20'wave.webp'%5Cn%5Cnconst%20items%20%3D%20ref%3CBubbleListProps%5B'items'%5D%3E(%5B%5Cn%20%20%7B%5Cn%20%20%20%20role%3A%20'user'%2C%5Cn%20%20%20%20content%3A%20'%E7%AE%80%E5%8D%95%E4%BB%8B%E7%BB%8D%20TinyVue'%2C%5Cn%20%20%7D%2C%5Cn%5D)%5Cn%5Cnconst%20roles%20%3D%20ref%3CBubbleListProps%5B'roles'%5D%3E(%7B%5Cn%20%20user%3A%20%7B%5Cn%20%20%20%20placement%3A%20'end'%2C%5Cn%20%20%20%20avatar%3A%20userAvatar%2C%5Cn%20%20%7D%2C%5Cn%20%20ai%3A%20%7B%5Cn%20%20%20%20placement%3A%20'start'%2C%5Cn%20%20%20%20avatar%3A%20aiAvatar%2C%5Cn%20%20%20%20slots%3A%20%7B%5Cn%20%20%20%20%20%20loading%3A%20()%20%3D%3E%20h('img'%2C%20%7B%20style%3A%20%7B%20height%3A%20'40px'%2C%20marginLeft%3A%20'-25px'%20%7D%2C%20src%3A%20loadingImgUrl%20%7D)%2C%5Cn%20%20%20%20%7D%2C%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%3C%2Fscript%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[3]||(t[3]=()=>{i.value=!1}),vueCode:n(z)},b({_:2},[x.value?{name:"vue",fn:o(()=>[e(n(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[20]||(t[20]=a("h3",{id:"用户停止",tabindex:"-1"},[s("用户停止 "),a("a",{class:"header-anchor",href:"#用户停止","aria-label":'Permalink to "用户停止"'},"​")],-1)),t[21]||(t[21]=a("p",null,[s("通过 "),a("code",null,"aborted"),s(" 设置用户停止状态")],-1)),h(e(n(C),null,null,512),[[u,i.value]]),e(r,null,{default:o(()=>[e(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[4]||(t[4]=()=>{i.value=!1}),vueCode:n(O)},b({_:2},[T.value?{name:"vue",fn:o(()=>[e(n(T))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[22]||(t[22]=a("h3",{id:"最大宽度",tabindex:"-1"},[s("最大宽度 "),a("a",{class:"header-anchor",href:"#最大宽度","aria-label":'Permalink to "最大宽度"'},"​")],-1)),t[23]||(t[23]=a("p",null,[s("通过 "),a("code",null,"maxWidth"),s(" 设置气泡最大宽度")],-1)),h(e(n(C),null,null,512),[[u,i.value]]),e(r,null,{default:o(()=>[e(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[5]||(t[5]=()=>{i.value=!1}),vueCode:n(U)},b({_:2},[F.value?{name:"vue",fn:o(()=>[e(n(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[24]||(t[24]=a("h3",{id:"渲染-markdown",tabindex:"-1"},[s("渲染 markdown "),a("a",{class:"header-anchor",href:"#渲染-markdown","aria-label":'Permalink to "渲染 markdown"'},"​")],-1)),h(e(n(C),null,null,512),[[u,i.value]]),e(r,null,{default:o(()=>[e(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[6]||(t[6]=()=>{i.value=!1}),vueCode:n(q)},b({_:2},[D.value?{name:"vue",fn:o(()=>[e(n(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[25]||(t[25]=a("h3",{id:"流式文本",tabindex:"-1"},[s("流式文本 "),a("a",{class:"header-anchor",href:"#流式文本","aria-label":'Permalink to "流式文本"'},"​")],-1)),t[26]||(t[26]=a("p",null,[a("code",null,"content"),s(" 属性是响应式的，动态设置 "),a("code",null,"content"),s(" 即可实现流式文本")],-1)),h(e(n(C),null,null,512),[[u,i.value]]),e(r,null,{default:o(()=>[e(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[7]||(t[7]=()=>{i.value=!1}),vueCode:n(M)},b({_:2},[f.value?{name:"vue",fn:o(()=>[e(n(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[27]||(t[27]=k("",20)),h(e(n(C),null,null,512),[[u,i.value]]),e(r,null,{default:o(()=>[e(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[8]||(t[8]=()=>{i.value=!1}),vueCode:n(J)},b({_:2},[v.value?{name:"vue",fn:o(()=>[e(n(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[28]||(t[28]=a("h3",{id:"指定渲染属性",tabindex:"-1"},[s("指定渲染属性 "),a("a",{class:"header-anchor",href:"#指定渲染属性","aria-label":'Permalink to "指定渲染属性"'},"​")],-1)),t[29]||(t[29]=a("p",null,[s("和大模型交互数据时，交互的原始数据中的 content 字段可能需要经过前端二次处理再展示到UI上，但此时我们又不想改动原始的 content 字段。此时可以通过 "),a("code",null,"customContentField"),s(" 属性来在前端指定你需要渲染的属性")],-1)),h(e(n(C),null,null,512),[[u,i.value]]),e(r,null,{default:o(()=>[e(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[9]||(t[9]=()=>{i.value=!1}),vueCode:n(X)},b({_:2},[A.value?{name:"vue",fn:o(()=>[e(n(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[30]||(t[30]=a("h3",{id:"插槽",tabindex:"-1"},[s("插槽 "),a("a",{class:"header-anchor",href:"#插槽","aria-label":'Permalink to "插槽"'},"​")],-1)),t[31]||(t[31]=a("p",null,[s("气泡组件提供了四个插槽，分别是 默认插槽, "),a("code",null,"loading"),s(" 插槽、"),a("code",null,"footer"),s(" 插槽 和 "),a("code",null,"trailer"),s(" 插槽")],-1)),h(e(n(C),null,null,512),[[u,i.value]]),e(r,null,{default:o(()=>[e(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22slots.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbubble%2Fslots.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20flex-direction%3A%20column%3B%20gap%3A%2016px%5C%22%3E%5Cn%20%20%20%20%3Clabel%3E%E5%8A%A0%E8%BD%BD%E4%B8%AD%E6%8F%92%E6%A7%BD%3C%2Flabel%3E%5Cn%20%20%20%20%3Ctr-bubble%20%3Aavatar%3D%5C%22aiAvatar%5C%22%20%3Aloading%3D%5C%22true%5C%22%3E%5Cn%20%20%20%20%20%20%3Ctemplate%20%23loading%3E%5Cn%20%20%20%20%20%20%20%20%3Cimg%20style%3D%5C%22height%3A%2040px%3B%20margin-left%3A%20-25px%5C%22%20%3Asrc%3D%5C%22loadingImgUrl%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%3C%2Ftr-bubble%3E%5Cn%20%20%20%20%3Chr%20%2F%3E%5Cn%20%20%20%20%3Clabel%3E%E9%BB%98%E8%AE%A4%E6%8F%92%E6%A7%BD%E3%80%81footer%20%E6%8F%92%E6%A7%BD%20%E5%92%8C%20trailer%20%E6%8F%92%E6%A7%BD%EF%BC%88%E9%BC%A0%E6%A0%87hover%E6%B0%94%E6%B3%A1%E5%86%85%E5%AE%B9%E6%98%BE%E7%A4%BA%EF%BC%89%3C%2Flabel%3E%5Cn%20%20%20%20%3Ctr-bubble%20class%3D%5C%22bubble%5C%22%20%3Aavatar%3D%5C%22aiAvatar%5C%22%20%3Aactions%3D%5C%22%5B'refresh'%2C%20'copy'%5D%5C%22%3E%5Cn%20%20%20%20%20%20%3Cspan%20style%3D%5C%22color%3A%20orange%5C%22%5Cn%20%20%20%20%20%20%20%20%3ETinyVue%20%E6%98%AF%E4%B8%80%E4%B8%AA%E8%BD%BB%E9%87%8F%E7%BA%A7%E3%80%81%E9%AB%98%E6%80%A7%E8%83%BD%E7%9A%84%20Vue%203%20%E7%BB%84%E4%BB%B6%E5%BA%93%EF%BC%8C%E4%B8%93%E4%B8%BA%E4%BC%81%E4%B8%9A%E7%BA%A7%E5%BA%94%E7%94%A8%E8%AE%BE%E8%AE%A1%EF%BC%8C%E7%94%B1%20OpenTiny%20%E5%BC%80%E6%BA%90%E5%9B%A2%E9%98%9F%E5%BC%80%E5%8F%91%E7%BB%B4%E6%8A%A4%E3%80%82%3C%2Fspan%5Cn%20%20%20%20%20%20%3E%5Cn%20%20%20%20%20%20%3Ctemplate%20%23footer%3E%5Cn%20%20%20%20%20%20%20%20%3Ctr-feedback%20%3Aoperations%3D%5C%22operations%5C%22%20%3Aactions%3D%5C%22actions%5C%22%20%3Asources%3D%5C%22sources%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%20%20%3Ctemplate%20%23trailer%3E%5Cn%20%20%20%20%20%20%20%20%3Cdiv%20class%3D%5C%22trailer-slot%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3CIconButton%20%3Aicon%3D%5C%22IconCopy%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3CIconButton%20%3Aicon%3D%5C%22IconLike%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3CIconButton%20%3Aicon%3D%5C%22IconDislike%5C%22%20%2F%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%20%20%3C%2Ftemplate%3E%5Cn%20%20%20%20%3C%2Ftr-bubble%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20FeedbackProps%2C%20IconButton%2C%20TrBubble%2C%20TrFeedback%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%2C%20IconCopy%2C%20IconDislike%2C%20IconLike%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20h%20%7D%20from%20'vue'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cnconst%20loadingImgUrl%20%3D%20'%2Ftiny-robot%2Falpha%2F'%20%2B%20'wave.webp'%5Cn%5Cnconst%20operations%3A%20FeedbackProps%5B'operations'%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20name%3A%20'edit'%2C%5Cn%20%20%20%20label%3A%20'%E7%BC%96%E8%BE%91'%2C%5Cn%20%20%20%20onClick%3A%20()%20%3D%3E%20console.log('%E7%82%B9%E5%87%BB%E4%BA%86%E7%BC%96%E8%BE%91%E6%8C%89%E9%92%AE')%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20name%3A%20'delete'%2C%5Cn%20%20%20%20label%3A%20'%E5%88%A0%E9%99%A4'%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20actions%3A%20FeedbackProps%5B'actions'%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20name%3A%20'copy'%2C%5Cn%20%20%20%20label%3A%20'%E5%A4%8D%E5%88%B6'%2C%5Cn%20%20%20%20icon%3A%20'copy'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20name%3A%20'refresh'%2C%5Cn%20%20%20%20label%3A%20'%E5%88%B7%E6%96%B0'%2C%5Cn%20%20%20%20icon%3A%20'refresh'%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%5Cnconst%20sources%3A%20FeedbackProps%5B'sources'%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20label%3A%20'%E6%95%B0%E6%8D%AE%E6%9D%A5%E6%BA%901'%2C%5Cn%20%20%20%20link%3A%20'https%3A%2F%2Fexample.com%2Fsource1'%2C%5Cn%20%20%7D%2C%5Cn%20%20%7B%5Cn%20%20%20%20label%3A%20'%E6%95%B0%E6%8D%AE%E6%9D%A5%E6%BA%902'%2C%5Cn%20%20%20%20link%3A%20'https%3A%2F%2Fexample.com%2Fsource2'%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn.trailer-slot%20%7B%5Cn%20%20position%3A%20absolute%3B%5Cn%20%20top%3A%20100%25%3B%5Cn%20%20padding-top%3A%204px%3B%5Cn%5Cn%20%20display%3A%20flex%3B%5Cn%20%20align-items%3A%20center%3B%5Cn%20%20gap%3A%204px%3B%5Cn%5Cn%20%20opacity%3A%200%3B%5Cn%20%20pointer-events%3A%20none%3B%5Cn%20%20transition%3A%20opacity%200.2s%20ease%3B%5Cn%7D%5Cn%5Cn.bubble%3Ahover%20.trailer-slot%20%7B%5Cn%20%20opacity%3A%201%3B%5Cn%20%20pointer-events%3A%20auto%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[10]||(t[10]=()=>{i.value=!1}),vueCode:n(V)},b({_:2},[B.value?{name:"vue",fn:o(()=>[e(n(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[32]||(t[32]=a("h3",{id:"schema-卡片渲染",tabindex:"-1"},[s("schema 卡片渲染 "),a("a",{class:"header-anchor",href:"#schema-卡片渲染","aria-label":'Permalink to "schema 卡片渲染"'},"​")],-1)),h(e(n(C),null,null,512),[[u,i.value]]),e(r,null,{default:o(()=>[e(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%22schema-render.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbubble%2Fschema-render.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20flex-direction%3A%20column%3B%20gap%3A%2016px%5C%22%3E%5Cn%20%20%20%20%3Clabel%3E%E4%BD%BF%E7%94%A8%E6%8F%92%E6%A7%BD%E6%B8%B2%E6%9F%93%E8%BF%90%E8%A1%8C%E6%97%B6%E6%B8%B2%E6%9F%93%3C%2Flabel%3E%5Cn%20%20%20%20%3Ctr-bubble%20%3Aavatar%3D%5C%22aiAvatar%5C%22%3E%5Cn%20%20%20%20%20%20%3Cschema-card%20%3Aschema%3D%5C%22schemaObj%5C%22%3E%3C%2Fschema-card%3E%5Cn%20%20%20%20%3C%2Ftr-bubble%3E%5Cn%5Cn%20%20%20%20%3Clabel%3E%E4%BD%BF%E7%94%A8markdown%E6%B8%B2%E6%9F%93%E8%BF%90%E8%A1%8C%E6%97%B6%E6%B8%B2%E6%9F%93%EF%BC%88webcomponent%EF%BC%89%3C%2Flabel%3E%5Cn%20%20%20%20%3Ctr-bubble%20%3Aavatar%3D%5C%22aiAvatar%5C%22%20%3Acontent%3D%5C%22mdContent%5C%22%20%3Acontent-renderer%3D%5C%22markdownRenderer%5C%22%3E%3C%2Ftr-bubble%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20BubbleMarkdownContentRenderer%2C%20TrBubble%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20IconAi%20%7D%20from%20'%40opentiny%2Ftiny-robot-svgs'%5Cnimport%20%7B%20defineCustomElement%2C%20h%2C%20ref%20%7D%20from%20'vue'%5Cnimport%20SchemaCard%20from%20'.%2Fschema-card.ce.vue'%5Cn%5Cnconst%20aiAvatar%20%3D%20h(IconAi%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'32px'%20%7D%20%7D)%5Cn%5Cnconst%20markdownRenderer%20%3D%20new%20BubbleMarkdownContentRenderer(%7B%5Cn%20%20mdConfig%3A%20%7B%20html%3A%20true%20%7D%2C%5Cn%20%20dompurifyConfig%3A%20%7B%20ADD_TAGS%3A%20%5B'schema-card'%5D%2C%20ADD_ATTR%3A%20%5B'schema'%5D%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20schemaObj%20%3D%20ref(%5Cn%20%20JSON.stringify(%7B%5Cn%20%20%20%20state%3A%20%7B%7D%2C%5Cn%20%20%20%20methods%3A%20%7B%7D%2C%5Cn%20%20%20%20componentName%3A%20'Page'%2C%5Cn%20%20%20%20props%3A%20%7B%7D%2C%5Cn%20%20%20%20children%3A%20%5B%5Cn%20%20%20%20%20%20%7B%20componentName%3A%20'Text'%2C%20props%3A%20%7B%20text%3A%20'%E8%BF%90%E8%A1%8C%E6%97%B6%E6%B8%B2%E6%9F%93%E5%99%A8%E6%96%87%E6%9C%AC'%20%7D%20%7D%2C%5Cn%20%20%20%20%20%20%7B%20componentName%3A%20'Button'%2C%20props%3A%20%7B%20text%3A%20'%E8%BF%90%E8%A1%8C%E6%97%B6%E6%B8%B2%E6%9F%93%E5%99%A8%E6%8C%89%E9%92%AE'%20%7D%20%7D%2C%5Cn%20%20%20%20%5D%2C%5Cn%20%20%7D)%2C%5Cn)%5Cn%5Cn%2F%2F%20%E4%B8%8B%E9%9D%A2%E7%9A%84%E4%BB%A3%E7%A0%81%E5%BA%94%E6%94%BE%E5%9C%A8%E5%BA%94%E7%94%A8%E6%8C%82%E8%BD%BD%E5%89%8D%E6%89%A7%E8%A1%8C%5Cnif%20(!customElements.get('schema-card'))%20%7B%5Cn%20%20%2F%2F%20%E5%B0%86%20Vue%20%E7%BB%84%E4%BB%B6%E8%BD%AC%E4%B8%BA%E8%87%AA%E5%AE%9A%E4%B9%89%E5%85%83%E7%B4%A0%E7%B1%BB%E3%80%82%5Cn%20%20const%20CardElement%20%3D%20defineCustomElement(SchemaCard)%5Cn%20%20%2F%2F%20%E5%9C%A8%E6%B5%8F%E8%A7%88%E5%99%A8%E4%B8%AD%E6%B3%A8%E5%86%8C%E5%85%83%E7%B4%A0%E7%B1%BB%E3%80%82%5Cn%20%20customElements.define('schema-card'%2C%20CardElement)%5Cn%7D%5Cn%5Cnconst%20mdContent%20%3D%20%60%23%20Markdown%20%E6%A0%87%E9%A2%98%5Cn%5Cn**Markdown%20%E5%8A%A0%E7%B2%97%E6%96%87%E6%9C%AC**%5Cn%5Cn%3Cschema-card%20schema%3D'%24%7BschemaObj.value%7D'%3E%3C%2Fschema-card%3E%5Cn%60%5Cn%3C%2Fscript%3E%5Cn%22%7D%2C%22schema-card.ce.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Fbubble%2Fschema-card.ce.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cschema-renderer%20%3Aschema%3D%5C%22schemaObj%5C%22%3E%3C%2Fschema-renderer%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20SchemaRenderer%20from%20'%40opentiny%2Ftiny-schema-renderer'%5Cnimport%20%7B%20computed%20%7D%20from%20'vue'%5Cn%5Cnconst%20props%20%3D%20defineProps(%7B%5Cn%20%20schema%3A%20%7B%5Cn%20%20%20%20type%3A%20String%2C%5Cn%20%20%20%20required%3A%20true%2C%5Cn%20%20%7D%2C%5Cn%7D)%5Cn%5Cnconst%20schemaObj%20%3D%20computed(()%20%3D%3E%20%7B%5Cn%20%20return%20JSON.parse(props.schema)%5Cn%7D)%5Cn%3C%2Fscript%3E%5Cn%3Cstyle%3E%5Cn%40import%20url('%40opentiny%2Fvue-theme%2Findex.css')%3B%5Cn%3C%2Fstyle%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[11]||(t[11]=()=>{i.value=!1}),vueCode:n(S)},b({_:2},[g.value?{name:"vue",fn:o(()=>[e(n(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[33]||(t[33]=a("h3",{id:"列表",tabindex:"-1"},[s("列表 "),a("a",{class:"header-anchor",href:"#列表","aria-label":'Permalink to "列表"'},"​")],-1)),h(e(n(C),null,null,512),[[u,i.value]]),e(r,null,{default:o(()=>[e(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[12]||(t[12]=()=>{i.value=!1}),vueCode:n(P)},b({_:2},[E.value?{name:"vue",fn:o(()=>[e(n(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[34]||(t[34]=a("h3",{id:"隐藏角色",tabindex:"-1"},[s("隐藏角色 "),a("a",{class:"header-anchor",href:"#隐藏角色","aria-label":'Permalink to "隐藏角色"'},"​")],-1)),t[35]||(t[35]=a("p",null,[s("角色配置中使用 "),a("code",null,"hidden"),s(" 来隐藏这个角色的所有消息")],-1)),h(e(n(C),null,null,512),[[u,i.value]]),e(r,null,{default:o(()=>[e(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[13]||(t[13]=()=>{i.value=!1}),vueCode:n(G)},b({_:2},[y.value?{name:"vue",fn:o(()=>[e(n(y))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[36]||(t[36]=k("",45))])}}});export{tt as __pageData,et as default};
