const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/list.DD4ztelB.js","assets/chunks/index.BF_PQeJ7.js","assets/chunks/framework.kTfunus-.js","assets/chunks/utils.D1YSndqS.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/index2.DXNIapAb.js","assets/chunks/index.qi1GoFxM.js","assets/chunks/tiny-robot-svgs.BaAiG9Fu.js","assets/chunks/index4.UhD4dyzc.js","assets/chunks/index.DM95O2dU.js","assets/chunks/tiny-robot-svgs.Ct4S-7ct.js","assets/chunks/schema-render.CZoQzHBq.js","assets/chunks/schema-card.vue_vue_type_style_index_0_lang.ru08NnnM.js","assets/chunks/index.DoAmEUYk.js","assets/chunks/index.DKVCnifJ.js","assets/chunks/index.D5z7hk73.js","assets/chunks/loading-shadow.lIjb6yma.js","assets/chunks/index.BwQVmJhW.js","assets/chunks/index.DSizFn09.js","assets/chunks/help-circle.DZYgQKry.js","assets/chunks/index.BdpCrDlP.js","assets/chunks/index.DRKSS0gm.js","assets/chunks/schema-card.CZ8rBx35.js","assets/chunks/slots.BhuxuElm.js","assets/chunks/streaming.Ddrt9mbj.js","assets/chunks/markdown.DdCifQLu.js","assets/chunks/max-width.DLEvTGa3.js","assets/chunks/aborted.D3XYLFZB.js","assets/chunks/loading.DAKcf--9.js","assets/chunks/avatar-and-placement.DwYK_QTH.js","assets/chunks/basic.B3BY6b2A.js"])))=>i.map(i=>d[i]);
import{p as d,v as u,V as b,C as x,c as z,o as E,ag as D,ah as c,G as t,j as l,ai as p,k as n,w as i,a}from"./chunks/framework.kTfunus-.js";import{O as m,E as h}from"./chunks/index.Bs5OpVoR.js";const N=`<template>
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
`,R=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <label>使用插槽渲染运行时渲染</label>
    <tr-bubble :avatar="aiAvatar">
      <schema-card :schema="schemaObj"></schema-card>
    </tr-bubble>

    <label>使用markdown渲染运行时渲染（webcomponent）</label>
    <tr-bubble :avatar="aiAvatar" type="markdown" :content="mdContent" :mdConfig="{ html: true }"></tr-bubble>
  </div>
</template>

<script setup lang="tsx">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { defineCustomElement, h, ref } from 'vue'
import SchemaCard from './schema-card.vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

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
`,w=`<template>
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
`,V=`<template>
  <div style="display: flex; flex-direction: column; gap: 16px">
    <label>加载中插槽</label>
    <tr-bubble :avatar="aiAvatar" :loading="true">
      <template #loading>
        <div style="display: flex; align-items: center">加载中。。。</div>
      </template>
    </tr-bubble>
    <hr />
    <label>默认 content 插槽 和 footer 插槽</label>
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
`,S=`<template>
  <tr-bubble :content="streamContent" :avatar="aiAvatar" type="markdown" />
  <hr />
  <button @click="resetStreamContent">点击展示流式文本</button>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

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
`,L=`<template>
  <tr-bubble :content="mdContent" :avatar="aiAvatar" type="markdown"></tr-bubble>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { h } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })

const mdContent = \`# h1 Heading
## Emphasis

**This is bold text**

*This is italic text*

_This is italic text_

~~Strikethrough~~
\`
<\/script>
`,G=`<template>
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
`,P=`<template>
  <tr-bubble
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
    :avatar="aiAvatar"
    :loading="loading"
  ></tr-bubble>
  <hr />
  <div>
    <label style="margin-right: 8px">加载中</label>
    <tiny-switch v-model="loading"></tiny-switch>
  </div>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
import { IconAi } from '@opentiny/tiny-robot-svgs'
import { TinySwitch } from '@opentiny/vue'
import { h, ref } from 'vue'

const aiAvatar = h(IconAi, { style: { fontSize: '32px' } })
const loading = ref(true)
<\/script>
`,U=`<template>
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
`,Y=`<template>
  <tr-bubble
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
  ></tr-bubble>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
<\/script>
`,M=JSON.parse('{"title":"Bubble 气泡组件","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/bubble.md","filePath":"components/bubble.md"}'),F={name:"components/bubble.md"},X=Object.assign(F,{setup(Z){const v=d();u(async()=>{v.value=(await b(async()=>{const{default:s}=await import("./chunks/list.DD4ztelB.js");return{default:s}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10]))).default});const f=d();u(async()=>{f.value=(await b(async()=>{const{default:s}=await import("./chunks/schema-render.CZoQzHBq.js");return{default:s}},__vite__mapDeps([11,2,1,3,4,5,10,12,13,14,15,16,17,18,19,20,21]))).default});const k=d();u(async()=>{k.value=(await b(async()=>{const{default:s}=await import("./chunks/schema-card.CZ8rBx35.js");return{default:s}},__vite__mapDeps([22,12,13,14,2,15,16,17,18,19,20,21]))).default});const y=d();u(async()=>{y.value=(await b(async()=>{const{default:s}=await import("./chunks/slots.BhuxuElm.js");return{default:s}},__vite__mapDeps([23,1,2,3,4,5,6,7,8,9,10]))).default});const g=d();u(async()=>{g.value=(await b(async()=>{const{default:s}=await import("./chunks/streaming.Ddrt9mbj.js");return{default:s}},__vite__mapDeps([24,1,2,3,4,5,10]))).default});const A=d();u(async()=>{A.value=(await b(async()=>{const{default:s}=await import("./chunks/markdown.DdCifQLu.js");return{default:s}},__vite__mapDeps([25,1,2,3,4,5,10]))).default});const B=d();u(async()=>{B.value=(await b(async()=>{const{default:s}=await import("./chunks/max-width.DLEvTGa3.js");return{default:s}},__vite__mapDeps([26,1,2,3,4,5,10,18,14,17,15,16,19]))).default});const C=d();u(async()=>{C.value=(await b(async()=>{const{default:s}=await import("./chunks/aborted.D3XYLFZB.js");return{default:s}},__vite__mapDeps([27,1,2,3,4,5,10,21,14,16]))).default});const W=d();u(async()=>{W.value=(await b(async()=>{const{default:s}=await import("./chunks/loading.DAKcf--9.js");return{default:s}},__vite__mapDeps([28,1,2,3,4,5,10,21,14,16]))).default});const _=d();u(async()=>{_.value=(await b(async()=>{const{default:s}=await import("./chunks/avatar-and-placement.DwYK_QTH.js");return{default:s}},__vite__mapDeps([29,1,2,3,4,5,10]))).default});const o=d(!0),T=d();return u(async()=>{T.value=(await b(async()=>{const{default:s}=await import("./chunks/basic.B3BY6b2A.js");return{default:s}},__vite__mapDeps([30,1,2,3,4,5]))).default}),(s,e)=>{const r=x("ClientOnly");return E(),z("div",null,[e[11]||(e[11]=D("",5)),c(t(n(m),null,null,512),[[p,o.value]]),t(r,null,{default:i(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[0]||(e[0]=()=>{o.value=!1}),vueCode:n(Y)},{vue:i(()=>[t(n(T))]),_:1},8,["vueCode"])]),_:1}),e[12]||(e[12]=l("h3",{id:"头像和位置",tabindex:"-1"},[a("头像和位置 "),l("a",{class:"header-anchor",href:"#头像和位置","aria-label":'Permalink to "头像和位置"'},"​")],-1)),e[13]||(e[13]=l("p",null,[a("通过 "),l("code",null,"avatar"),a(" 设置自定义头像，通过 "),l("code",null,"placement"),a(" 设置位置，提供了 "),l("code",null,"start"),a("、"),l("code",null,"end"),a(" 两个选项")],-1)),c(t(n(m),null,null,512),[[p,o.value]]),t(r,null,{default:i(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[1]||(e[1]=()=>{o.value=!1}),vueCode:n(U)},{vue:i(()=>[t(n(_))]),_:1},8,["vueCode"])]),_:1}),e[14]||(e[14]=l("h3",{id:"加载中",tabindex:"-1"},[a("加载中 "),l("a",{class:"header-anchor",href:"#加载中","aria-label":'Permalink to "加载中"'},"​")],-1)),e[15]||(e[15]=l("p",null,[a("通过 "),l("code",null,"loading"),a(" 设置加载中状态")],-1)),c(t(n(m),null,null,512),[[p,o.value]]),t(r,null,{default:i(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[2]||(e[2]=()=>{o.value=!1}),vueCode:n(P)},{vue:i(()=>[t(n(W))]),_:1},8,["vueCode"])]),_:1}),e[16]||(e[16]=l("h3",{id:"用户停止",tabindex:"-1"},[a("用户停止 "),l("a",{class:"header-anchor",href:"#用户停止","aria-label":'Permalink to "用户停止"'},"​")],-1)),e[17]||(e[17]=l("p",null,[a("通过 "),l("code",null,"aborted"),a(" 设置用户停止状态")],-1)),c(t(n(m),null,null,512),[[p,o.value]]),t(r,null,{default:i(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[3]||(e[3]=()=>{o.value=!1}),vueCode:n(J)},{vue:i(()=>[t(n(C))]),_:1},8,["vueCode"])]),_:1}),e[18]||(e[18]=l("h3",{id:"最大宽度",tabindex:"-1"},[a("最大宽度 "),l("a",{class:"header-anchor",href:"#最大宽度","aria-label":'Permalink to "最大宽度"'},"​")],-1)),e[19]||(e[19]=l("p",null,[a("通过 "),l("code",null,"maxWidth"),a(" 设置气泡最大宽度")],-1)),c(t(n(m),null,null,512),[[p,o.value]]),t(r,null,{default:i(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[4]||(e[4]=()=>{o.value=!1}),vueCode:n(G)},{vue:i(()=>[t(n(B))]),_:1},8,["vueCode"])]),_:1}),e[20]||(e[20]=l("h3",{id:"渲染-markdown",tabindex:"-1"},[a("渲染 markdown "),l("a",{class:"header-anchor",href:"#渲染-markdown","aria-label":'Permalink to "渲染 markdown"'},"​")],-1)),e[21]||(e[21]=l("p",null,[a("通过 "),l("code",null,"type"),a(" 设置气泡内容渲染格式，可选值为 "),l("code",null,"text"),a(" 或者 "),l("code",null,"markdown")],-1)),c(t(n(m),null,null,512),[[p,o.value]]),t(r,null,{default:i(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[5]||(e[5]=()=>{o.value=!1}),vueCode:n(L)},{vue:i(()=>[t(n(A))]),_:1},8,["vueCode"])]),_:1}),e[22]||(e[22]=l("h3",{id:"流式文本",tabindex:"-1"},[a("流式文本 "),l("a",{class:"header-anchor",href:"#流式文本","aria-label":'Permalink to "流式文本"'},"​")],-1)),e[23]||(e[23]=l("p",null,[l("code",null,"content"),a(" 属性是响应式的，动态设置 "),l("code",null,"content"),a(" 即可实现流式文本")],-1)),c(t(n(m),null,null,512),[[p,o.value]]),t(r,null,{default:i(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[6]||(e[6]=()=>{o.value=!1}),vueCode:n(S)},{vue:i(()=>[t(n(g))]),_:1},8,["vueCode"])]),_:1}),e[24]||(e[24]=l("h3",{id:"插槽",tabindex:"-1"},[a("插槽 "),l("a",{class:"header-anchor",href:"#插槽","aria-label":'Permalink to "插槽"'},"​")],-1)),e[25]||(e[25]=l("p",null,[a("气泡组件提供了三个插槽，分别是 默认插槽, "),l("code",null,"loading"),a(" 插槽 和 "),l("code",null,"footer"),a(" 插槽")],-1)),c(t(n(m),null,null,512),[[p,o.value]]),t(r,null,{default:i(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[7]||(e[7]=()=>{o.value=!1}),vueCode:n(V)},{vue:i(()=>[t(n(y))]),_:1},8,["vueCode"])]),_:1}),e[26]||(e[26]=l("h3",{id:"schema-卡片渲染",tabindex:"-1"},[a("schema 卡片渲染 "),l("a",{class:"header-anchor",href:"#schema-卡片渲染","aria-label":'Permalink to "schema 卡片渲染"'},"​")],-1)),e[27]||(e[27]=l("p",null,"SchemaCard 组件代码如下",-1)),c(t(n(m),null,null,512),[[p,o.value]]),t(r,null,{default:i(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[8]||(e[8]=()=>{o.value=!1}),vueCode:n(w)},{vue:i(()=>[t(n(k))]),_:1},8,["vueCode"])]),_:1}),c(t(n(m),null,null,512),[[p,o.value]]),t(r,null,{default:i(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[9]||(e[9]=()=>{o.value=!1}),vueCode:n(R)},{vue:i(()=>[t(n(f))]),_:1},8,["vueCode"])]),_:1}),e[28]||(e[28]=l("h3",{id:"列表",tabindex:"-1"},[a("列表 "),l("a",{class:"header-anchor",href:"#列表","aria-label":'Permalink to "列表"'},"​")],-1)),c(t(n(m),null,null,512),[[p,o.value]]),t(r,null,{default:i(()=>[t(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[10]||(e[10]=()=>{o.value=!1}),vueCode:n(N)},{vue:i(()=>[t(n(v))]),_:1},8,["vueCode"])]),_:1}),e[29]||(e[29]=D("",17))])}}});export{M as __pageData,X as default};
