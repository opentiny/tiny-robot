const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/list-hidden.BinVX8WA.js","assets/chunks/index.DWx5I85h.js","assets/chunks/framework.DZgqWKJp.js","assets/chunks/loading.CaA-rOal.js","assets/chunks/utils.PXvsRCZN.js","assets/chunks/index2.DniiL9LH.js","assets/chunks/tiny-robot-svgs.D-n4sgzD.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/list.1KEI0Btm.js","assets/chunks/index.Br-h_RyV.js","assets/chunks/index.CfdRQi1p.js","assets/chunks/index.BoV9dZ-y.js","assets/chunks/loading-shadow.qpgZbwLE.js","assets/chunks/index.BE00sSTR.js","assets/chunks/index.D40PrCfM.js","assets/chunks/schema-render.DDO7sFhk.js","assets/chunks/schema-card.ce.DV1kAccy.js","assets/chunks/index.CjlkEzI7.js","assets/chunks/index.BtIrbYv8.js","assets/chunks/help-circle.DDllw8tj.js","assets/chunks/index.C6RnbP2b.js","assets/chunks/index.9St3uIJX.js","assets/chunks/index.E-Q9EEi7.js","assets/chunks/index.05ZY--Re.js","assets/chunks/index.2vAGpwaK.js","assets/chunks/slots.CZSTPJnV.js","assets/chunks/custom-content-field.Dm4NpbVM.js","assets/chunks/messages.C4cfvBlN.js","assets/chunks/streaming.BhLfH5cT.js","assets/chunks/markdown.BmXlEuhG.js","assets/chunks/max-width.84m08I9S.js","assets/chunks/aborted.DQc3cgzC.js","assets/chunks/loading.CWnTLqRq.js","assets/chunks/shape.BwxZieMM.js","assets/chunks/avatar-and-placement.CMRWFQnb.js","assets/chunks/basic.BBacPKPx.js"])))=>i.map(i=>d[i]);
import{D as d,v as p,V as c,p as R,C as G,c as P,o as L,ah as y,ag as h,G as t,j as a,ai as u,k as n,w as o,aj as b,a as s}from"./chunks/framework.DZgqWKJp.js";import{R as k,k as m}from"./chunks/index.Cu7ZXtn0.js";const X=`<template>
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
    content: 'TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。',
  },
  {
    role: 'user',
    content: '简单介绍 TinyVue',
  },
  {
    role: 'ai',
    content: 'TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。',
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
`,I=`<template>
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
    content: 'TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。',
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
    content: 'TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。',
  },
  {
    role: 'user',
    content: '简单介绍 TinyVue',
  },
  {
    role: 'ai',
    content: 'TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。',
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
      footer: ({ bubbleProps }) => {
        return h(TrFeedback, {
          actions: [
            { name: 'refresh', label: '刷新', icon: 'refresh' },
            { name: 'copy', label: '复制', icon: 'copy' },
          ],
          onAction(name) {
            console.log(name)
            console.log(bubbleProps.content)
          },
        })
      },
    },
  },
  user: {
    placement: 'end',
    avatar: userAvatar,
    maxWidth: '80%',
  },
}
<\/script>
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

<script setup lang="tsx">
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

const mdContent = \`# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

<schema-card schema='\${schemaObj.value}'></schema-card>
\`
<\/script>
`,V=`<template>
  <schema-renderer :schema="schemaObj"></schema-renderer>
</template>

<script setup lang="ts">
import SchemaRenderer from '@opentiny/tiny-schema-renderer'
import { computed } from 'vue'

const props = defineProps({
  schema: {
    type: String,
    required: true,
    default: () =>
      JSON.stringify({
        state: {},
        methods: {},
        componentName: 'Page',
        props: {},
        children: [{ componentName: 'Text', props: { text: '展开查看 SchemaCard 组件代码' } }],
      }),
  },
})

const schemaObj = computed(() => {
  return JSON.parse(props.schema)
})
<\/script>
<style>
@import url('@opentiny/vue-theme/index.css');
</style>
`,J=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <label>加载中插槽</label>
    <tr-bubble :avatar="aiAvatar" :loading="true">
      <template #loading>
        <div style="display: flex; align-items: center">加载中。。。</div>
      </template>
    </tr-bubble>
    <hr />
    <label>默认插槽 和 footer 插槽</label>
    <tr-bubble :avatar="aiAvatar" :actions="['refresh', 'copy']">
      <span style="color: orange"
        >TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。</span
      >
      <template #footer>
        <tr-feedback :operations="operations" :actions="actions" :sources="sources" />
      </template>
    </tr-bubble>
  </div>
</template>

<script setup lang="tsx">
import { FeedbackProps, TrBubble, TrFeedback } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

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
`,q=`<template>
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
`,M=`<template>
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
`,U=`<template>
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
`,j=`<template>
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
`,z=`<template>
  <tr-bubble
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
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
`,Y=`<template>
  <tr-bubble
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
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
`,Q=`<template>
  <tr-bubble
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
    :avatar="aiAvatar"
    :loading="loading"
  ></tr-bubble>
  <hr />
  <div><span>列表加载中</span></div>
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
  },
})
<\/script>
`,N=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <tr-bubble content="形状: rounded" placement="start" shape="rounded"></tr-bubble>
    <tr-bubble
      content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
      placement="end"
      shape="rounded"
    ></tr-bubble>
    <tr-bubble content="形状: corner" placement="start" shape="corner"></tr-bubble>
    <tr-bubble
      content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
      placement="end"
      shape="corner"
    ></tr-bubble>
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
<\/script>
`,O=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <tr-bubble content="简单介绍 TinyVue" :avatar="aiAvatar" placement="start"></tr-bubble>
    <tr-bubble
      content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
      :avatar="userAvatar"
      placement="end"
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
`,H=`<template>
  <tr-bubble
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
  ></tr-bubble>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
<\/script>
`,ne=JSON.parse('{"title":"Bubble 气泡组件","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/bubble.md","filePath":"components/bubble.md"}'),$={name:"components/bubble.md"},ae=Object.assign($,{setup(K){const v=d();p(async()=>{v.value=(await c(async()=>{const{default:l}=await import("./chunks/list-hidden.BinVX8WA.js");return{default:l}},__vite__mapDeps([0,1,2,3,4,5,6,7]))).default});const g=d();p(async()=>{g.value=(await c(async()=>{const{default:l}=await import("./chunks/list.1KEI0Btm.js");return{default:l}},__vite__mapDeps([8,1,2,3,4,5,6,7,9,10,11,12,13,14]))).default});const f=d();p(async()=>{f.value=(await c(async()=>{const{default:l}=await import("./chunks/schema-render.DDO7sFhk.js");return{default:l}},__vite__mapDeps([15,2,1,3,4,5,6,7,16,11,17,18,13,10,12,19,20,21,22,23,24]))).default});const E=d();p(async()=>{E.value=(await c(async()=>{const{default:l}=await import("./chunks/schema-card.ce.DV1kAccy.js");return{default:l}},__vite__mapDeps([16,11,2,17,18,13,10,12,19,20,21,22,23,24]))).default});const C=d();p(async()=>{C.value=(await c(async()=>{const{default:l}=await import("./chunks/slots.CZSTPJnV.js");return{default:l}},__vite__mapDeps([25,1,2,3,4,5,6,7,9,10,11,12,13,14]))).default});const B=d();p(async()=>{B.value=(await c(async()=>{const{default:l}=await import("./chunks/custom-content-field.Dm4NpbVM.js");return{default:l}},__vite__mapDeps([26,1,2,3,4,5,6,7,21,11,12]))).default});const A=d();p(async()=>{A.value=(await c(async()=>{const{default:l}=await import("./chunks/messages.C4cfvBlN.js");return{default:l}},__vite__mapDeps([27,1,2,3,4,5,6,7]))).default});const W=d();p(async()=>{W.value=(await c(async()=>{const{default:l}=await import("./chunks/streaming.BhLfH5cT.js");return{default:l}},__vite__mapDeps([28,1,2,3,4,5,6,7]))).default});const T=d();p(async()=>{T.value=(await c(async()=>{const{default:l}=await import("./chunks/markdown.BmXlEuhG.js");return{default:l}},__vite__mapDeps([29,1,2,3,4,5,6,7]))).default});const D=d();p(async()=>{D.value=(await c(async()=>{const{default:l}=await import("./chunks/max-width.84m08I9S.js");return{default:l}},__vite__mapDeps([30,1,2,3,4,5,6,7,24,11,18,13,10,12,19]))).default});const _=d();p(async()=>{_.value=(await c(async()=>{const{default:l}=await import("./chunks/aborted.DQc3cgzC.js");return{default:l}},__vite__mapDeps([31,1,2,3,4,5,6,7,21,11,12]))).default});const F=d();p(async()=>{F.value=(await c(async()=>{const{default:l}=await import("./chunks/loading.CWnTLqRq.js");return{default:l}},__vite__mapDeps([32,1,2,3,4,5,6,7,21,11,12]))).default});const w=d();p(async()=>{w.value=(await c(async()=>{const{default:l}=await import("./chunks/shape.BwxZieMM.js");return{default:l}},__vite__mapDeps([33,1,2,3,4,5,6,7]))).default});const x=d();p(async()=>{x.value=(await c(async()=>{const{default:l}=await import("./chunks/avatar-and-placement.CMRWFQnb.js");return{default:l}},__vite__mapDeps([34,1,2,3,4,5,6,7]))).default});const i=R(!0),Z=d();return p(async()=>{Z.value=(await c(async()=>{const{default:l}=await import("./chunks/basic.BBacPKPx.js");return{default:l}},__vite__mapDeps([35,1,2,3,4,5,6,7]))).default}),(l,e)=>{const r=G("ClientOnly");return L(),P("div",null,[e[15]||(e[15]=y("",5)),h(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:e[0]||(e[0]=()=>{i.value=!1}),vueCode:n(H)},b({_:2},[Z.value?{name:"vue",fn:o(()=>[t(n(Z))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[16]||(e[16]=a("h3",{id:"头像和位置",tabindex:"-1"},[s("头像和位置 "),a("a",{class:"header-anchor",href:"#头像和位置","aria-label":'Permalink to "头像和位置"'},"​")],-1)),e[17]||(e[17]=a("p",null,[s("通过 "),a("code",null,"avatar"),s(" 设置自定义头像，通过 "),a("code",null,"placement"),s(" 设置位置，提供了 "),a("code",null,"start"),s("、"),a("code",null,"end"),s(" 两个选项")],-1)),h(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:e[1]||(e[1]=()=>{i.value=!1}),vueCode:n(O)},b({_:2},[x.value?{name:"vue",fn:o(()=>[t(n(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[18]||(e[18]=a("h3",{id:"气泡形状",tabindex:"-1"},[s("气泡形状 "),a("a",{class:"header-anchor",href:"#气泡形状","aria-label":'Permalink to "气泡形状"'},"​")],-1)),e[19]||(e[19]=a("p",null,[s("通过 "),a("code",null,"shape"),s(" 设置气泡形状。目前提供了 "),a("code",null,"rounded"),s(" 和 "),a("code",null,"corner"),s(" 两个选项。默认为 "),a("code",null,"corner")],-1)),h(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:e[2]||(e[2]=()=>{i.value=!1}),vueCode:n(N)},b({_:2},[w.value?{name:"vue",fn:o(()=>[t(n(w))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[20]||(e[20]=y("",3)),h(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:e[3]||(e[3]=()=>{i.value=!1}),vueCode:n(Q)},b({_:2},[F.value?{name:"vue",fn:o(()=>[t(n(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[21]||(e[21]=a("h3",{id:"用户停止",tabindex:"-1"},[s("用户停止 "),a("a",{class:"header-anchor",href:"#用户停止","aria-label":'Permalink to "用户停止"'},"​")],-1)),e[22]||(e[22]=a("p",null,[s("通过 "),a("code",null,"aborted"),s(" 设置用户停止状态")],-1)),h(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:e[4]||(e[4]=()=>{i.value=!1}),vueCode:n(Y)},b({_:2},[_.value?{name:"vue",fn:o(()=>[t(n(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[23]||(e[23]=a("h3",{id:"最大宽度",tabindex:"-1"},[s("最大宽度 "),a("a",{class:"header-anchor",href:"#最大宽度","aria-label":'Permalink to "最大宽度"'},"​")],-1)),e[24]||(e[24]=a("p",null,[s("通过 "),a("code",null,"maxWidth"),s(" 设置气泡最大宽度")],-1)),h(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:e[5]||(e[5]=()=>{i.value=!1}),vueCode:n(z)},b({_:2},[D.value?{name:"vue",fn:o(()=>[t(n(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[25]||(e[25]=a("h3",{id:"渲染-markdown",tabindex:"-1"},[s("渲染 markdown "),a("a",{class:"header-anchor",href:"#渲染-markdown","aria-label":'Permalink to "渲染 markdown"'},"​")],-1)),h(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:e[6]||(e[6]=()=>{i.value=!1}),vueCode:n(j)},b({_:2},[T.value?{name:"vue",fn:o(()=>[t(n(T))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[26]||(e[26]=a("h3",{id:"流式文本",tabindex:"-1"},[s("流式文本 "),a("a",{class:"header-anchor",href:"#流式文本","aria-label":'Permalink to "流式文本"'},"​")],-1)),e[27]||(e[27]=a("p",null,[a("code",null,"content"),s(" 属性是响应式的，动态设置 "),a("code",null,"content"),s(" 即可实现流式文本")],-1)),h(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:e[7]||(e[7]=()=>{i.value=!1}),vueCode:n(U)},b({_:2},[W.value?{name:"vue",fn:o(()=>[t(n(W))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[28]||(e[28]=y("",20)),h(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:e[8]||(e[8]=()=>{i.value=!1}),vueCode:n(M)},b({_:2},[A.value?{name:"vue",fn:o(()=>[t(n(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[29]||(e[29]=a("h3",{id:"指定渲染属性",tabindex:"-1"},[s("指定渲染属性 "),a("a",{class:"header-anchor",href:"#指定渲染属性","aria-label":'Permalink to "指定渲染属性"'},"​")],-1)),e[30]||(e[30]=a("p",null,[s("和大模型交互数据时，交互的原始数据中的 content 字段可能需要经过前端二次处理再展示到UI上，但此时我们又不想改动原始的 content 字段。此时可以通过 "),a("code",null,"customContentField"),s(" 属性来在前端指定你需要渲染的属性")],-1)),h(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:e[9]||(e[9]=()=>{i.value=!1}),vueCode:n(q)},b({_:2},[B.value?{name:"vue",fn:o(()=>[t(n(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[31]||(e[31]=a("h3",{id:"插槽",tabindex:"-1"},[s("插槽 "),a("a",{class:"header-anchor",href:"#插槽","aria-label":'Permalink to "插槽"'},"​")],-1)),e[32]||(e[32]=a("p",null,[s("气泡组件提供了三个插槽，分别是 默认插槽, "),a("code",null,"loading"),s(" 插槽 和 "),a("code",null,"footer"),s(" 插槽")],-1)),h(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:e[10]||(e[10]=()=>{i.value=!1}),vueCode:n(J)},b({_:2},[C.value?{name:"vue",fn:o(()=>[t(n(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[33]||(e[33]=a("h3",{id:"schema-卡片渲染",tabindex:"-1"},[s("schema 卡片渲染 "),a("a",{class:"header-anchor",href:"#schema-卡片渲染","aria-label":'Permalink to "schema 卡片渲染"'},"​")],-1)),e[34]||(e[34]=a("p",null,"SchemaCard 组件代码如下",-1)),h(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:e[11]||(e[11]=()=>{i.value=!1}),vueCode:n(V)},b({_:2},[E.value?{name:"vue",fn:o(()=>[t(n(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),h(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:e[12]||(e[12]=()=>{i.value=!1}),vueCode:n(S)},b({_:2},[f.value?{name:"vue",fn:o(()=>[t(n(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[35]||(e[35]=a("h3",{id:"列表",tabindex:"-1"},[s("列表 "),a("a",{class:"header-anchor",href:"#列表","aria-label":'Permalink to "列表"'},"​")],-1)),h(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:e[13]||(e[13]=()=>{i.value=!1}),vueCode:n(I)},b({_:2},[g.value?{name:"vue",fn:o(()=>[t(n(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[36]||(e[36]=a("h3",{id:"隐藏角色",tabindex:"-1"},[s("隐藏角色 "),a("a",{class:"header-anchor",href:"#隐藏角色","aria-label":'Permalink to "隐藏角色"'},"​")],-1)),e[37]||(e[37]=a("p",null,[s("角色配置中使用 "),a("code",null,"hidden"),s(" 来隐藏这个角色的所有消息")],-1)),h(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:e[14]||(e[14]=()=>{i.value=!1}),vueCode:n(X)},b({_:2},[v.value?{name:"vue",fn:o(()=>[t(n(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[38]||(e[38]=y("",36))])}}});export{ne as __pageData,ae as default};
