const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/list.CklO_-jq.js","assets/chunks/index.DrOP9VmC.js","assets/chunks/framework.Dsng2_7o.js","assets/chunks/loading.CaA-rOal.js","assets/chunks/utils.D1YSndqS.js","assets/chunks/tiny-robot-svgs.wPOeRNoc.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/index3.BDwkJsQh.js","assets/chunks/index.BkgmJOJ9.js","assets/chunks/index5.CmFqHahF.js","assets/chunks/index2.BME1Z_Z8.js","assets/chunks/index.0U6ISQPI.js","assets/chunks/tiny-robot-svgs.Cy3xEaxQ.js","assets/chunks/schema-render.BtcJ12p1.js","assets/chunks/schema-card.ce.B3Io01ZP.js","assets/chunks/index.CfWQETGS.js","assets/chunks/index.OruwSYWr.js","assets/chunks/index.D4QLHw-u.js","assets/chunks/index.Bk8Sagdh.js","assets/chunks/index.DVrRK6sQ.js","assets/chunks/loading-shadow.DIQr-lWU.js","assets/chunks/help-circle.Da-MwPOe.js","assets/chunks/index.BhD4xwdf.js","assets/chunks/index.CTGqbFuT.js","assets/chunks/index.DeN5mRSL.js","assets/chunks/index.CoENTUsD.js","assets/chunks/slots.BfZKy83F.js","assets/chunks/messages.CyekvhYY.js","assets/chunks/streaming.BEAWxtzu.js","assets/chunks/markdown.DVZZmLoO.js","assets/chunks/max-width.BUdhpuIC.js","assets/chunks/aborted.C_497TaX.js","assets/chunks/loading.Ccq4rEOp.js","assets/chunks/shape.aao3aYeo.js","assets/chunks/avatar-and-placement.B2UlsG-P.js","assets/chunks/basic.B0OyBijc.js"])))=>i.map(i=>d[i]);
import{D as d,v as p,V as h,p as Z,C as w,c as R,o as P,ah as y,ag as c,G as t,j as s,ai as u,k as n,w as o,aj as b,a}from"./chunks/framework.Dsng2_7o.js";import{O as k,E as m}from"./chunks/index.BxQo2396.js";const G=`<template>
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
`,X=`<template>
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
import { BubbleMarkdownMessageRenderer, TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { defineCustomElement, h, ref } from 'vue'
import SchemaCard from './schema-card.ce.vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const markdownRenderer = new BubbleMarkdownMessageRenderer(
  { html: true },
  { ADD_TAGS: ['schema-card'], ADD_ATTR: ['schema'] },
)

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
`,L=`<template>
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
`,S=`<template>
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
`,V=`<template>
  <tr-bubble-provider :message-renderers="messageRenderers">
    <tr-bubble :messages="messages" :avatar="aiAvatar" placement="start"></tr-bubble>
  </tr-bubble-provider>
  <hr />
  <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 8px">
    <button @click="addMessage">添加消息</button>
    <button @click="setThinkingContent">设置思考过程</button>
  </div>
</template>

<script setup lang="ts">
import { BubbleMessageProps, TrBubbleProvider, TrBubble, BubbleMarkdownMessageRenderer } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

// function renderer
const customTextRenderer = (props: BubbleMessageProps) => {
  return h('div', { style: { color: 'red', fontStyle: 'italic' } }, props.content)
}

// class renderer
const markdownRenderer = new BubbleMarkdownMessageRenderer()

// register renderer
const messageRenderers = {
  'custom-text': customTextRenderer,
  markdown: markdownRenderer,
}

const thinkingContent = \`已获取到西安明天（2025年5月31日）的天气，最高温度28℃，最低温度17℃，有小雨。下一步，使用高德地图的文本搜索工具查找西安适合游玩的地点。\`

const messages = ref<BubbleMessageProps[]>([
  {
    type: 'text',
    content: '我使用默认的文本渲染器（组件渲染器）',
    style: {
      fontWeight: 'bold',
    },
    'data-id': 'test-id-1',
    onClick: () => {
      alert('点击了文本消息')
    },
  },
  {
    type: 'custom-text',
    content: '我使用自定义的文本渲染器（函数渲染器）',
  },
  {
    type: 'markdown',
    content: \`# 我使用Markdown渲染器（类渲染器）\`,
  },
  {
    type: 'tool',
    name: 'DayWeather（工具渲染器）',
    status: 'success',
    params: JSON.stringify({
      city: '西安',
      date: '2025-05-31',
      number: 123,
      boolean: true,
      null: null,
      object: {
        a: 1,
      },
    }),
    formatPretty: true,
  },
  {
    type: 'collapsible-text',
    title: '思考过程（折叠消息渲染器）',
    content: thinkingContent,
  },
])

const addMessage = () => {
  messages.value.push({
    type: 'collapsible-text',
    title: '思考过程',
    content:
      '已获取到西安明天（2025年5月31日）的天气，最高温度28℃，最低温度17℃，有小雨。下一步，使用高德地图的文本搜索工具查找西安适合游玩的地点。',
  })
}

const setThinkingContent = () => {
  const message = messages.value.find((m) => m.type === 'collapsible-text')
  if (!message) {
    return
  }
  message.content = ''
  for (let i = 0; i < thinkingContent.length; i += 1) {
    setTimeout(() => {
      message.content += thinkingContent[i]
    }, i * 100)
  }
}
<\/script>
`,I=`<template>
  <tr-bubble :content="streamContent" :avatar="aiAvatar" :content-renderer="markdownRenderer" />
  <hr />
  <button @click="resetStreamContent">点击展示流式文本</button>
</template>

<script setup lang="ts">
import { BubbleMarkdownMessageRenderer, TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const markdownRenderer = new BubbleMarkdownMessageRenderer()

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
`,M=`<template>
  <tr-bubble :content="mdContent" :avatar="aiAvatar" :content-renderer="markdownRenderer"></tr-bubble>
</template>

<script setup lang="ts">
import { BubbleMarkdownMessageRenderer, TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const markdownRenderer = new BubbleMarkdownMessageRenderer()

const mdContent = \`# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

~~Strikethrough~~
\`
<\/script>
`,q=`<template>
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
`,J=`<template>
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
`,j=`<template>
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
`,U=`<template>
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
`,Y=`<template>
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
`,z=`<template>
  <tr-bubble
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
  ></tr-bubble>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
<\/script>
`,$=JSON.parse('{"title":"Bubble 气泡组件","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/bubble.md","filePath":"components/bubble.md"}'),Q={name:"components/bubble.md"},K=Object.assign(Q,{setup(N){const g=d();p(async()=>{g.value=(await h(async()=>{const{default:l}=await import("./chunks/list.CklO_-jq.js");return{default:l}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12]))).default});const v=d();p(async()=>{v.value=(await h(async()=>{const{default:l}=await import("./chunks/schema-render.BtcJ12p1.js");return{default:l}},__vite__mapDeps([13,2,1,3,4,5,6,7,12,14,15,16,17,18,19,20,21,22,23,24,25]))).default});const f=d();p(async()=>{f.value=(await h(async()=>{const{default:l}=await import("./chunks/schema-card.ce.B3Io01ZP.js");return{default:l}},__vite__mapDeps([14,15,2,16,17,18,19,20,21,22,23,24,25]))).default});const E=d();p(async()=>{E.value=(await h(async()=>{const{default:l}=await import("./chunks/slots.BfZKy83F.js");return{default:l}},__vite__mapDeps([26,1,2,3,4,5,6,7,8,9,10,11,12]))).default});const B=d();p(async()=>{B.value=(await h(async()=>{const{default:l}=await import("./chunks/messages.CyekvhYY.js");return{default:l}},__vite__mapDeps([27,1,2,3,4,5,6,7,12]))).default});const A=d();p(async()=>{A.value=(await h(async()=>{const{default:l}=await import("./chunks/streaming.BEAWxtzu.js");return{default:l}},__vite__mapDeps([28,1,2,3,4,5,6,7,12]))).default});const C=d();p(async()=>{C.value=(await h(async()=>{const{default:l}=await import("./chunks/markdown.DVZZmLoO.js");return{default:l}},__vite__mapDeps([29,1,2,3,4,5,6,7,12]))).default});const _=d();p(async()=>{_.value=(await h(async()=>{const{default:l}=await import("./chunks/max-width.BUdhpuIC.js");return{default:l}},__vite__mapDeps([30,1,2,3,4,5,6,7,12,25,15,17,18,19,20,21]))).default});const D=d();p(async()=>{D.value=(await h(async()=>{const{default:l}=await import("./chunks/aborted.C_497TaX.js");return{default:l}},__vite__mapDeps([31,1,2,3,4,5,6,7,12,23,15,20]))).default});const F=d();p(async()=>{F.value=(await h(async()=>{const{default:l}=await import("./chunks/loading.Ccq4rEOp.js");return{default:l}},__vite__mapDeps([32,1,2,3,4,5,6,7,12,23,15,20]))).default});const T=d();p(async()=>{T.value=(await h(async()=>{const{default:l}=await import("./chunks/shape.aao3aYeo.js");return{default:l}},__vite__mapDeps([33,1,2,3,4,5,6,7]))).default});const W=d();p(async()=>{W.value=(await h(async()=>{const{default:l}=await import("./chunks/avatar-and-placement.B2UlsG-P.js");return{default:l}},__vite__mapDeps([34,1,2,3,4,5,6,7,12]))).default});const i=Z(!0),x=d();return p(async()=>{x.value=(await h(async()=>{const{default:l}=await import("./chunks/basic.B0OyBijc.js");return{default:l}},__vite__mapDeps([35,1,2,3,4,5,6,7]))).default}),(l,e)=>{const r=w("ClientOnly");return P(),R("div",null,[e[13]||(e[13]=y('<h1 id="bubble-气泡组件" tabindex="-1">Bubble 气泡组件 <a class="header-anchor" href="#bubble-气泡组件" aria-label="Permalink to &quot;Bubble 气泡组件&quot;">​</a></h1><p>Bubble 气泡组件用于展示消息气泡，支持流式文本、头像、位置、加载中、终止状态、操作按钮等功能。</p><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基本示例" tabindex="-1">基本示例 <a class="header-anchor" href="#基本示例" aria-label="Permalink to &quot;基本示例&quot;">​</a></h3><p>基本示例</p>',5)),c(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[0]||(e[0]=()=>{i.value=!1}),vueCode:n(z)},b({_:2},[x.value?{name:"vue",fn:o(()=>[t(n(x))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[14]||(e[14]=s("h3",{id:"头像和位置",tabindex:"-1"},[a("头像和位置 "),s("a",{class:"header-anchor",href:"#头像和位置","aria-label":'Permalink to "头像和位置"'},"​")],-1)),e[15]||(e[15]=s("p",null,[a("通过 "),s("code",null,"avatar"),a(" 设置自定义头像，通过 "),s("code",null,"placement"),a(" 设置位置，提供了 "),s("code",null,"start"),a("、"),s("code",null,"end"),a(" 两个选项")],-1)),c(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[1]||(e[1]=()=>{i.value=!1}),vueCode:n(Y)},b({_:2},[W.value?{name:"vue",fn:o(()=>[t(n(W))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[16]||(e[16]=s("h3",{id:"气泡形状",tabindex:"-1"},[a("气泡形状 "),s("a",{class:"header-anchor",href:"#气泡形状","aria-label":'Permalink to "气泡形状"'},"​")],-1)),e[17]||(e[17]=s("p",null,[a("通过 "),s("code",null,"shape"),a(" 设置气泡形状。目前提供了 "),s("code",null,"rounded"),a(" 和 "),s("code",null,"corner"),a(" 两个选项。默认为 "),s("code",null,"corner")],-1)),c(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[2]||(e[2]=()=>{i.value=!1}),vueCode:n(U)},b({_:2},[T.value?{name:"vue",fn:o(()=>[t(n(T))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[18]||(e[18]=y('<h3 id="加载中" tabindex="-1">加载中 <a class="header-anchor" href="#加载中" aria-label="Permalink to &quot;加载中&quot;">​</a></h3><p>通过 <code>loading</code> 设置加载中状态</p><p>BubbleList 除了需要设置 <code>loading</code>，还需要设置 <code>loading-role</code>。需要注意的是，列表的加载中气泡实际上并没有新增一条消息，<code>loading</code> 设置为 <code>false</code> 后，加载中的气泡不会渲染</p>',3)),c(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[3]||(e[3]=()=>{i.value=!1}),vueCode:n(j)},b({_:2},[F.value?{name:"vue",fn:o(()=>[t(n(F))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[19]||(e[19]=s("h3",{id:"用户停止",tabindex:"-1"},[a("用户停止 "),s("a",{class:"header-anchor",href:"#用户停止","aria-label":'Permalink to "用户停止"'},"​")],-1)),e[20]||(e[20]=s("p",null,[a("通过 "),s("code",null,"aborted"),a(" 设置用户停止状态")],-1)),c(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[4]||(e[4]=()=>{i.value=!1}),vueCode:n(J)},b({_:2},[D.value?{name:"vue",fn:o(()=>[t(n(D))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[21]||(e[21]=s("h3",{id:"最大宽度",tabindex:"-1"},[a("最大宽度 "),s("a",{class:"header-anchor",href:"#最大宽度","aria-label":'Permalink to "最大宽度"'},"​")],-1)),e[22]||(e[22]=s("p",null,[a("通过 "),s("code",null,"maxWidth"),a(" 设置气泡最大宽度")],-1)),c(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[5]||(e[5]=()=>{i.value=!1}),vueCode:n(q)},b({_:2},[_.value?{name:"vue",fn:o(()=>[t(n(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[23]||(e[23]=s("h3",{id:"渲染-markdown",tabindex:"-1"},[a("渲染 markdown "),s("a",{class:"header-anchor",href:"#渲染-markdown","aria-label":'Permalink to "渲染 markdown"'},"​")],-1)),c(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[6]||(e[6]=()=>{i.value=!1}),vueCode:n(M)},b({_:2},[C.value?{name:"vue",fn:o(()=>[t(n(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[24]||(e[24]=s("h3",{id:"流式文本",tabindex:"-1"},[a("流式文本 "),s("a",{class:"header-anchor",href:"#流式文本","aria-label":'Permalink to "流式文本"'},"​")],-1)),e[25]||(e[25]=s("p",null,[s("code",null,"content"),a(" 属性是响应式的，动态设置 "),s("code",null,"content"),a(" 即可实现流式文本")],-1)),c(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[7]||(e[7]=()=>{i.value=!1}),vueCode:n(I)},b({_:2},[A.value?{name:"vue",fn:o(()=>[t(n(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[26]||(e[26]=y(`<h3 id="多种消息格式" tabindex="-1">多种消息格式 <a class="header-anchor" href="#多种消息格式" aria-label="Permalink to &quot;多种消息格式&quot;">​</a></h3><p><code>BubbleProvider</code> 管理和注册消息渲染器。渲染器注册机制</p><p>当 Bubble 组件的 <code>messages</code> 数组不为空时，系统会：</p><p>1.检查每条消息的 <code>type</code> 字段<br> 2.在 <code>BubbleProvider</code> 中查找匹配的渲染器<br> 3.使用找到的渲染器渲染消息内容<br> 4.如果未找到匹配的渲染器，则使用默认渲染方式</p><p>有三种方式可以实现自定义消息渲染器：</p><p>1.<strong>函数式渲染器</strong>：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> myRenderer</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessageFunctionRenderer</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">options</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> h</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;div&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, options.content)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>2.<strong>类式渲染器</strong>：</p><p>必须继承 <code>BubbleMessageClassRenderer</code> 类</p><p>类渲染器通常用来复用复杂度较高的渲染器，比如MarkdownIt实例</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MyRenderer</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessageClassRenderer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  render</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">options</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">    return</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> h</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;div&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, options.content)</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>注册时记得 new 一个实例，否则会导致渲染失败</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-bubble-provider</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> :</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">message-renderers</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">messageRenderers</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    &lt;!-- other codes... --&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">tr-bubble-provider</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">const</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> messageRenderers</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;my-render&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">new</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> MyRenderer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">script</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p>3.<strong>Vue 组件</strong>：</p><p>message 对象中的所有属性都将传递给组件，onXXX会当作事件传递给组件，非props属性会当作attrs传递给组件</p><div class="language-vue vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">vue</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  &lt;</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">div</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;{{ props.content }}&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">div</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;/</span><span style="--shiki-light:#22863A;--shiki-dark:#85E89D;">template</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;</span></span></code></pre></div><p>目前内置直接可用的的渲染器类型有</p><ul><li><code>text</code>(默认渲染器)</li><li><code>collapsible-text</code></li><li><code>tool</code></li></ul><p>内置需要自行导入的渲染有</p><ul><li><code>BubbleMarkdownMessageRenderer</code> 类渲染器</li></ul>`,20)),c(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[8]||(e[8]=()=>{i.value=!1}),vueCode:n(V)},b({_:2},[B.value?{name:"vue",fn:o(()=>[t(n(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[27]||(e[27]=s("h3",{id:"插槽",tabindex:"-1"},[a("插槽 "),s("a",{class:"header-anchor",href:"#插槽","aria-label":'Permalink to "插槽"'},"​")],-1)),e[28]||(e[28]=s("p",null,[a("气泡组件提供了三个插槽，分别是 默认插槽, "),s("code",null,"loading"),a(" 插槽 和 "),s("code",null,"footer"),a(" 插槽")],-1)),c(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[9]||(e[9]=()=>{i.value=!1}),vueCode:n(S)},b({_:2},[E.value?{name:"vue",fn:o(()=>[t(n(E))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[29]||(e[29]=s("h3",{id:"schema-卡片渲染",tabindex:"-1"},[a("schema 卡片渲染 "),s("a",{class:"header-anchor",href:"#schema-卡片渲染","aria-label":'Permalink to "schema 卡片渲染"'},"​")],-1)),e[30]||(e[30]=s("p",null,"SchemaCard 组件代码如下",-1)),c(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[10]||(e[10]=()=>{i.value=!1}),vueCode:n(L)},b({_:2},[f.value?{name:"vue",fn:o(()=>[t(n(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),c(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[11]||(e[11]=()=>{i.value=!1}),vueCode:n(X)},b({_:2},[v.value?{name:"vue",fn:o(()=>[t(n(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[31]||(e[31]=s("h3",{id:"列表",tabindex:"-1"},[a("列表 "),s("a",{class:"header-anchor",href:"#列表","aria-label":'Permalink to "列表"'},"​")],-1)),c(t(n(k),null,null,512),[[u,i.value]]),t(r,null,{default:o(()=>[t(n(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[12]||(e[12]=()=>{i.value=!1}),vueCode:n(G)},b({_:2},[g.value?{name:"vue",fn:o(()=>[t(n(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[32]||(e[32]=y(`<h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="bubbleplacement" tabindex="-1">BubblePlacement <a class="header-anchor" href="#bubbleplacement" aria-label="Permalink to &quot;BubblePlacement&quot;">​</a></h3><p>气泡位置类型：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubblePlacement</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;start&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;"> &#39;end&#39;</span></span></code></pre></div><ul><li><code>&#39;start&#39;</code>: 气泡位于左侧/起始位置</li><li><code>&#39;end&#39;</code>: 气泡位于右侧/结束位置</li></ul><h3 id="bubblecommonprops" tabindex="-1">BubbleCommonProps <a class="header-anchor" href="#bubblecommonprops" aria-label="Permalink to &quot;BubbleCommonProps&quot;">​</a></h3><p>气泡通用属性配置。</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>placement</code></td><td><code>BubblePlacement</code></td><td>-</td><td>气泡对齐位置 (<code>&#39;start&#39;</code> 或 <code>&#39;end&#39;</code>)</td></tr><tr><td><code>avatar</code></td><td><code>VNode</code></td><td>-</td><td>气泡头像部分的自定义 Vue 节点</td></tr><tr><td><code>shape</code></td><td><code>&#39;rounded&#39; | &#39;corner&#39;</code></td><td><code>&#39;corner&#39;</code></td><td>气泡形状</td></tr><tr><td><code>hidden</code></td><td><code>boolean</code></td><td>-</td><td>是否隐藏气泡</td></tr><tr><td><code>maxWidth</code></td><td><code>string | number</code></td><td>-</td><td>气泡内容的最大宽度</td></tr></tbody></table><h3 id="bubbleprops" tabindex="-1">BubbleProps <a class="header-anchor" href="#bubbleprops" aria-label="Permalink to &quot;BubbleProps&quot;">​</a></h3><p>单个气泡的属性配置（继承自 BubbleCommonProps）。</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>content</code></td><td><code>string</code></td><td>-</td><td>气泡内容文本</td></tr><tr><td><code>messages</code></td><td><code>BubbleMessageProps[]</code></td><td>-</td><td>气泡消息数组</td></tr><tr><td><code>id</code></td><td><code>string | number | symbol</code></td><td>-</td><td>气泡唯一标识</td></tr><tr><td><code>role</code></td><td><code>string</code></td><td>-</td><td>气泡角色标识，用于关联 <code>roles</code> 配置</td></tr><tr><td><code>loading</code></td><td><code>boolean</code></td><td><code>false</code></td><td>是否显示加载状态</td></tr><tr><td><code>aborted</code></td><td><code>boolean</code></td><td><code>false</code></td><td>是否显示为已中止状态</td></tr></tbody></table><h3 id="bubbleslots" tabindex="-1">BubbleSlots <a class="header-anchor" href="#bubbleslots" aria-label="Permalink to &quot;BubbleSlots&quot;">​</a></h3><p>气泡组件的插槽定义。</p><table tabindex="0"><thead><tr><th>插槽名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>default</code></td><td><code>{ bubbleProps: BubbleProps }</code></td><td>默认内容插槽，用于自定义气泡内容</td></tr><tr><td><code>footer</code></td><td><code>{ bubbleProps: BubbleProps }</code></td><td>底部插槽，用于在气泡底部添加内容</td></tr><tr><td><code>loading</code></td><td><code>{ bubbleProps: BubbleProps }</code></td><td>加载状态插槽，用于自定义加载状态显示</td></tr></tbody></table><h3 id="bubbleroleconfig" tabindex="-1">BubbleRoleConfig <a class="header-anchor" href="#bubbleroleconfig" aria-label="Permalink to &quot;BubbleRoleConfig&quot;">​</a></h3><p>角色配置类型（继承自 BubbleCommonProps）。</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleRoleConfig</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleCommonProps</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> &amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  slots</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleSlots</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="bubblelistprops" tabindex="-1">BubbleListProps <a class="header-anchor" href="#bubblelistprops" aria-label="Permalink to &quot;BubbleListProps&quot;">​</a></h3><p>气泡列表组件的属性配置。</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>items</code></td><td><code>(BubbleProps &amp; { slots?: BubbleSlots })[]</code></td><td>-</td><td><strong>必填</strong>，气泡项数组</td></tr><tr><td><code>roles</code></td><td><code>Record&lt;string, BubbleRoleConfig&gt;</code></td><td>-</td><td>角色默认配置字典，key 为角色名</td></tr><tr><td><code>loading</code></td><td><code>boolean</code></td><td><code>false</code></td><td>列表是否加载中</td></tr><tr><td><code>loadingRole</code></td><td><code>string</code></td><td>-</td><td>指定哪个角色可以有加载中状态</td></tr><tr><td><code>autoScroll</code></td><td><code>boolean</code></td><td><code>false</code></td><td>是否自动滚动到最新内容</td></tr></tbody></table><h3 id="bubblemessageprops" tabindex="-1">BubbleMessageProps <a class="header-anchor" href="#bubblemessageprops" aria-label="Permalink to &quot;BubbleMessageProps&quot;">​</a></h3><p>单条消息对象的结构。</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">interface</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessageProps</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  type</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  [key: string]</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> any</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>type</code></td><td><code>string</code></td><td>消息类型，用于选择对应的渲染器</td></tr><tr><td><code>[key: string]</code></td><td><code>any</code></td><td>其他字段可自由扩展，用于携带消息所需的自定义数据</td></tr></tbody></table><h3 id="bubblemessagerenderer" tabindex="-1">BubbleMessageRenderer <a class="header-anchor" href="#bubblemessagerenderer" aria-label="Permalink to &quot;BubbleMessageRenderer&quot;">​</a></h3><p>用于渲染气泡消息内容的渲染器类型。</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessageRenderer</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessageFunctionRenderer</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessageClassRenderer</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Component</span></span></code></pre></div><ul><li><code>BubbleMessageFunctionRenderer</code>: 函数式渲染器，返回 <code>VNode</code></li><li><code>BubbleMessageClassRenderer</code>: 基于类的渲染器，需实现 <code>.render()</code> 方法</li><li><code>Component</code>: 任意 Vue 组件，也可以用作渲染器</li></ul><h3 id="bubblemessagefunctionrenderer" tabindex="-1">BubbleMessageFunctionRenderer <a class="header-anchor" href="#bubblemessagefunctionrenderer" aria-label="Permalink to &quot;BubbleMessageFunctionRenderer&quot;">​</a></h3><p>函数式消息渲染器：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessageFunctionRenderer</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">options</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { [</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">key</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> any</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span></span></code></pre></div><table tabindex="0"><thead><tr><th>参数</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>options</code></td><td><code>{ [key: string]: any }</code></td><td>与消息类型 (<code>BubbleMessageProps</code>) 对应的数据</td></tr><tr><td>返回值</td><td><code>VNode</code></td><td>渲染结果</td></tr></tbody></table><h3 id="bubblemessageclassrenderer" tabindex="-1">BubbleMessageClassRenderer <a class="header-anchor" href="#bubblemessageclassrenderer" aria-label="Permalink to &quot;BubbleMessageClassRenderer&quot;">​</a></h3><p>基于类的消息渲染器：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">abstract</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> class</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> BubbleMessageClassRenderer</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">  abstract</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> render</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">options</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { [</span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">key</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">]</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> any</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> })</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div>`,35))])}}});export{$ as __pageData,K as default};
