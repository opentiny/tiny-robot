const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/list.DCO_rcre.js","assets/chunks/index.BrbdVymC.js","assets/chunks/framework.CktAfHHO.js","assets/chunks/utils.D1YSndqS.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/index3.BuO2fLLa.js","assets/chunks/index.BCMeW1wU.js","assets/chunks/tiny-robot-svgs.CwbW4C49.js","assets/chunks/index5.B3WGPrpn.js","assets/chunks/index2.DYPKjN3A.js","assets/chunks/index.Ba75axwg.js","assets/chunks/tiny-robot-svgs.sQeJBbmg.js","assets/chunks/schema-render.meIVZy98.js","assets/chunks/schema-card.vue_vue_type_style_index_0_lang.CAjIQYEU.js","assets/chunks/index.BcjC4P4Z.js","assets/chunks/index.Dq54-SrG.js","assets/chunks/index.CdF1aB2E.js","assets/chunks/index.CEUWEMqJ.js","assets/chunks/index.BWBUjzBa.js","assets/chunks/loading-shadow.C19uh6T4.js","assets/chunks/help-circle.DrXRl-Rd.js","assets/chunks/index.BpTThMEa.js","assets/chunks/index.BzaD4zws.js","assets/chunks/index.7WDqESk6.js","assets/chunks/index.DiIMaJLW.js","assets/chunks/schema-card.uyV2OA3R.js","assets/chunks/slots.CxQZ4Err.js","assets/chunks/streaming.C0stZJyG.js","assets/chunks/markdown.sJcuJvi0.js","assets/chunks/max-width.BYJdRAvm.js","assets/chunks/aborted.Hsh0i2Wp.js","assets/chunks/loading.C5rcAMYo.js","assets/chunks/avatar-and-placement.RfFHB8pn.js","assets/chunks/basic.BV3GmczD.js"])))=>i.map(i=>d[i]);
import{D as r,v as u,V as c,p as x,C as E,c as w,o as G,ah as D,ag as b,G as t,j as a,ai as p,k as n,w as s,aj as m,a as l}from"./chunks/framework.CktAfHHO.js";import{O as h,E as y}from"./chunks/index.CWzhtMrw.js";const X=`<template>
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
`,P=`<template>
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
`,F=`<template>
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
`,I=`<template>
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
`,V=`<template>
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
`,R=`<template>
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
`,J=`<template>
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
`,q=`<template>
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
`,j=`<template>
  <tr-bubble
    content="TinyVue 是一个轻量级、高性能的 Vue 3 组件库，专为企业级应用设计，由华为开源团队开发维护。"
  ></tr-bubble>
</template>

<script setup lang="ts">
import { TrBubble } from '@opentiny/tiny-robot'
<\/script>
`,U=JSON.parse('{"title":"Bubble 气泡组件","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/bubble.md","filePath":"components/bubble.md"}'),Y={name:"components/bubble.md"},N=Object.assign(Y,{setup(z){const v=r();u(async()=>{v.value=(await c(async()=>{const{default:i}=await import("./chunks/list.DCO_rcre.js");return{default:i}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11]))).default});const f=r();u(async()=>{f.value=(await c(async()=>{const{default:i}=await import("./chunks/schema-render.meIVZy98.js");return{default:i}},__vite__mapDeps([12,2,1,3,4,5,11,13,14,15,16,17,18,19,20,21,22,23,24]))).default});const k=r();u(async()=>{k.value=(await c(async()=>{const{default:i}=await import("./chunks/schema-card.uyV2OA3R.js");return{default:i}},__vite__mapDeps([25,13,14,2,15,16,17,18,19,20,21,22,23,24]))).default});const g=r();u(async()=>{g.value=(await c(async()=>{const{default:i}=await import("./chunks/slots.CxQZ4Err.js");return{default:i}},__vite__mapDeps([26,1,2,3,4,5,6,7,8,9,10,11]))).default});const A=r();u(async()=>{A.value=(await c(async()=>{const{default:i}=await import("./chunks/streaming.C0stZJyG.js");return{default:i}},__vite__mapDeps([27,1,2,3,4,5,11]))).default});const B=r();u(async()=>{B.value=(await c(async()=>{const{default:i}=await import("./chunks/markdown.sJcuJvi0.js");return{default:i}},__vite__mapDeps([28,1,2,3,4,5,11]))).default});const _=r();u(async()=>{_.value=(await c(async()=>{const{default:i}=await import("./chunks/max-width.BYJdRAvm.js");return{default:i}},__vite__mapDeps([29,1,2,3,4,5,11,24,14,16,17,18,19,20]))).default});const T=r();u(async()=>{T.value=(await c(async()=>{const{default:i}=await import("./chunks/aborted.Hsh0i2Wp.js");return{default:i}},__vite__mapDeps([30,1,2,3,4,5,11,22,14,19]))).default});const W=r();u(async()=>{W.value=(await c(async()=>{const{default:i}=await import("./chunks/loading.C5rcAMYo.js");return{default:i}},__vite__mapDeps([31,1,2,3,4,5,11,22,14,19]))).default});const C=r();u(async()=>{C.value=(await c(async()=>{const{default:i}=await import("./chunks/avatar-and-placement.RfFHB8pn.js");return{default:i}},__vite__mapDeps([32,1,2,3,4,5,11]))).default});const o=x(!0),Z=r();return u(async()=>{Z.value=(await c(async()=>{const{default:i}=await import("./chunks/basic.BV3GmczD.js");return{default:i}},__vite__mapDeps([33,1,2,3,4,5]))).default}),(i,e)=>{const d=E("ClientOnly");return G(),w("div",null,[e[11]||(e[11]=D("",5)),b(t(n(h),null,null,512),[[p,o.value]]),t(d,null,{default:s(()=>[t(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[0]||(e[0]=()=>{o.value=!1}),vueCode:n(j)},m({_:2},[Z.value?{name:"vue",fn:s(()=>[t(n(Z))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[12]||(e[12]=a("h3",{id:"头像和位置",tabindex:"-1"},[l("头像和位置 "),a("a",{class:"header-anchor",href:"#头像和位置","aria-label":'Permalink to "头像和位置"'},"​")],-1)),e[13]||(e[13]=a("p",null,[l("通过 "),a("code",null,"avatar"),l(" 设置自定义头像，通过 "),a("code",null,"placement"),l(" 设置位置，提供了 "),a("code",null,"start"),l("、"),a("code",null,"end"),l(" 两个选项")],-1)),b(t(n(h),null,null,512),[[p,o.value]]),t(d,null,{default:s(()=>[t(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[1]||(e[1]=()=>{o.value=!1}),vueCode:n(q)},m({_:2},[C.value?{name:"vue",fn:s(()=>[t(n(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[14]||(e[14]=a("h3",{id:"加载中",tabindex:"-1"},[l("加载中 "),a("a",{class:"header-anchor",href:"#加载中","aria-label":'Permalink to "加载中"'},"​")],-1)),e[15]||(e[15]=a("p",null,[l("通过 "),a("code",null,"loading"),l(" 设置加载中状态")],-1)),b(t(n(h),null,null,512),[[p,o.value]]),t(d,null,{default:s(()=>[t(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[2]||(e[2]=()=>{o.value=!1}),vueCode:n(J)},m({_:2},[W.value?{name:"vue",fn:s(()=>[t(n(W))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[16]||(e[16]=a("h3",{id:"用户停止",tabindex:"-1"},[l("用户停止 "),a("a",{class:"header-anchor",href:"#用户停止","aria-label":'Permalink to "用户停止"'},"​")],-1)),e[17]||(e[17]=a("p",null,[l("通过 "),a("code",null,"aborted"),l(" 设置用户停止状态")],-1)),b(t(n(h),null,null,512),[[p,o.value]]),t(d,null,{default:s(()=>[t(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[3]||(e[3]=()=>{o.value=!1}),vueCode:n(R)},m({_:2},[T.value?{name:"vue",fn:s(()=>[t(n(T))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[18]||(e[18]=a("h3",{id:"最大宽度",tabindex:"-1"},[l("最大宽度 "),a("a",{class:"header-anchor",href:"#最大宽度","aria-label":'Permalink to "最大宽度"'},"​")],-1)),e[19]||(e[19]=a("p",null,[l("通过 "),a("code",null,"maxWidth"),l(" 设置气泡最大宽度")],-1)),b(t(n(h),null,null,512),[[p,o.value]]),t(d,null,{default:s(()=>[t(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[4]||(e[4]=()=>{o.value=!1}),vueCode:n(V)},m({_:2},[_.value?{name:"vue",fn:s(()=>[t(n(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[20]||(e[20]=a("h3",{id:"渲染-markdown",tabindex:"-1"},[l("渲染 markdown "),a("a",{class:"header-anchor",href:"#渲染-markdown","aria-label":'Permalink to "渲染 markdown"'},"​")],-1)),e[21]||(e[21]=a("p",null,[l("通过 "),a("code",null,"type"),l(" 设置气泡内容渲染格式，可选值为 "),a("code",null,"text"),l(" 或者 "),a("code",null,"markdown")],-1)),b(t(n(h),null,null,512),[[p,o.value]]),t(d,null,{default:s(()=>[t(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[5]||(e[5]=()=>{o.value=!1}),vueCode:n(I)},m({_:2},[B.value?{name:"vue",fn:s(()=>[t(n(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[22]||(e[22]=a("h3",{id:"流式文本",tabindex:"-1"},[l("流式文本 "),a("a",{class:"header-anchor",href:"#流式文本","aria-label":'Permalink to "流式文本"'},"​")],-1)),e[23]||(e[23]=a("p",null,[a("code",null,"content"),l(" 属性是响应式的，动态设置 "),a("code",null,"content"),l(" 即可实现流式文本")],-1)),b(t(n(h),null,null,512),[[p,o.value]]),t(d,null,{default:s(()=>[t(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[6]||(e[6]=()=>{o.value=!1}),vueCode:n(S)},m({_:2},[A.value?{name:"vue",fn:s(()=>[t(n(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[24]||(e[24]=a("h3",{id:"插槽",tabindex:"-1"},[l("插槽 "),a("a",{class:"header-anchor",href:"#插槽","aria-label":'Permalink to "插槽"'},"​")],-1)),e[25]||(e[25]=a("p",null,[l("气泡组件提供了三个插槽，分别是 默认插槽, "),a("code",null,"loading"),l(" 插槽 和 "),a("code",null,"footer"),l(" 插槽")],-1)),b(t(n(h),null,null,512),[[p,o.value]]),t(d,null,{default:s(()=>[t(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[7]||(e[7]=()=>{o.value=!1}),vueCode:n(F)},m({_:2},[g.value?{name:"vue",fn:s(()=>[t(n(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[26]||(e[26]=a("h3",{id:"schema-卡片渲染",tabindex:"-1"},[l("schema 卡片渲染 "),a("a",{class:"header-anchor",href:"#schema-卡片渲染","aria-label":'Permalink to "schema 卡片渲染"'},"​")],-1)),e[27]||(e[27]=a("p",null,"SchemaCard 组件代码如下",-1)),b(t(n(h),null,null,512),[[p,o.value]]),t(d,null,{default:s(()=>[t(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[8]||(e[8]=()=>{o.value=!1}),vueCode:n(L)},m({_:2},[k.value?{name:"vue",fn:s(()=>[t(n(k))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),b(t(n(h),null,null,512),[[p,o.value]]),t(d,null,{default:s(()=>[t(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[9]||(e[9]=()=>{o.value=!1}),vueCode:n(P)},m({_:2},[f.value?{name:"vue",fn:s(()=>[t(n(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[28]||(e[28]=a("h3",{id:"列表",tabindex:"-1"},[l("列表 "),a("a",{class:"header-anchor",href:"#列表","aria-label":'Permalink to "列表"'},"​")],-1)),b(t(n(h),null,null,512),[[p,o.value]]),t(d,null,{default:s(()=>[t(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[10]||(e[10]=()=>{o.value=!1}),vueCode:n(X)},m({_:2},[v.value?{name:"vue",fn:s(()=>[t(n(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[29]||(e[29]=D("",17))])}}});export{U as __pageData,N as default};
