const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/custom-action-icon.DyNm3zxb.js","assets/chunks/theme.CjKr94ly.js","assets/chunks/framework.D5IXmigW.js","assets/chunks/limit.CFbyxJW9.js","assets/chunks/basic.Cm28Fvsw.js"])))=>i.map(i=>d[i]);
import{aD as m,bQ as u,aZ as g,aL as A,v as T,H as b,bL as h,bB as k,J as n,bk as t,bJ as i,G as f,w as l,I as d,b7 as y,aU as w}from"./chunks/framework.D5IXmigW.js";import{L as _,N as v}from"./chunks/index.BPwzYTgQ.js";const W=`<template>
  <tr-feedback
    :operations="operations"
    :operations-limit="3"
    @operation="handleOperation"
    :actions="actions"
    :actions-limit="3"
    @action="handleAction"
  ></tr-feedback>
</template>

<script setup lang="ts">
import { FeedbackProps, TrFeedback } from '@opentiny/tiny-robot'
import { IconPin } from '@opentiny/tiny-robot-svgs'
import { h, resolveComponent } from 'vue'

const operations: FeedbackProps['operations'] = [
  {
    name: 'edit',
    label: '编辑',
  },
  {
    name: 'delete',
    label: '删除',
  },
]

const handleOperation = (name: string) => {
  console.log('operation', name)
}

const actions: FeedbackProps['actions'] = [
  { name: 'refresh', label: '刷新', icon: 'refresh' },
  { name: 'copy', label: '复制', icon: 'copy' },
  { name: 'pin', label: '置顶', icon: h(resolveComponent('TrIconButton'), { icon: IconPin }) },
  { name: 'like', label: '推荐', icon: 'like' },
  { name: 'dislike', label: '不推荐', icon: 'dislike' },
  { name: 'pin2', label: '置顶2', icon: h(resolveComponent('TrIconButton'), { icon: IconPin }) },
]

const handleAction = (name: string) => {
  console.log('action', name)
}
<\/script>
`,C=`<template>
  <tr-feedback
    :operations="operations"
    :operations-limit="3"
    :actions="actions"
    :actions-limit="3"
    :sources="sources"
    :sources-lines-limit="1"
    @operation="handleOperation"
    @action="handleAction"
  />
  <hr />
</template>

<script setup lang="ts">
import { FeedbackProps, TrFeedback } from '@opentiny/tiny-robot'

const operations: FeedbackProps['operations'] = [
  { name: 'operation1', label: '操作一', onClick: () => console.log('单独监听点击事件', 'operation1') },
  { name: 'operation2', label: '操作二' },
  { name: 'operation3', label: '操作三' },
  { name: 'operation4', label: '操作四' },
  { name: 'operation5', label: '操作五' },
]

const actions: FeedbackProps['actions'] = [
  { name: 'refresh', label: '刷新', icon: 'refresh' },
  { name: 'copy', label: '复制', icon: 'copy' },
  { name: 'like', label: '推荐', icon: 'like' },
  { name: 'dislike', label: '不推荐', icon: 'dislike' },
]

const sources = Array(6)
  .fill([
    { label: '来源1', link: 'https://www.baidu.com' },
    { label: '来源22', link: 'https://www.baidu.com' },
    { label: '来源3333333', link: 'https://www.baidu.com' },
  ])
  .flat()

const handleOperation = (name: string) => {
  console.log('操作:', name)
}

const handleAction = (name: string) => {
  console.log('动作:', name)
}
<\/script>
`,P=`<template>
  <tr-feedback
    :operations="showOperations ? operations : undefined"
    :actions="actions"
    :sources="sources"
    @operation="handleOperation"
    @action="handleAction"
  />
  <hr />
  <tiny-button @click="showOperations = !showOperations" :reset-time="0">
    {{ showOperations ? '隐藏操作' : '显示操作' }}
  </tiny-button>
</template>

<script setup lang="ts">
import { FeedbackProps, TrFeedback } from '@opentiny/tiny-robot'
import { TinyButton } from '@opentiny/vue'
import { ref } from 'vue'

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

const showOperations = ref(true)

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

const handleOperation = (name: string) => {
  console.log('操作:', name)
}

const handleAction = (name: string) => {
  console.log('动作:', name)
}
<\/script>
`,V=JSON.parse('{"title":"Feedback 气泡反馈","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/feedback.md","filePath":"components/feedback.md"}'),D={name:"components/feedback.md"},q=Object.assign(D,{setup(B){const r=y();m(async()=>{r.value=(await u(async()=>{const{default:a}=await import("./chunks/custom-action-icon.DyNm3zxb.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const c=y();m(async()=>{c.value=(await u(async()=>{const{default:a}=await import("./chunks/limit.CFbyxJW9.js");return{default:a}},__vite__mapDeps([3,1,2]))).default});const o=w(!0),s=y();return m(async()=>{s.value=(await u(async()=>{const{default:a}=await import("./chunks/basic.Cm28Fvsw.js");return{default:a}},__vite__mapDeps([4,1,2]))).default}),(a,e)=>{const p=g("ClientOnly");return A(),T("div",null,[e[3]||(e[3]=b("",6)),h(n(t(_),null,null,512),[[k,o.value]]),n(p,null,{default:i(()=>[n(t(v),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{o.value=!1}),vueCode:t(P)},f({_:2},[s.value?{name:"vue",fn:i(()=>[n(t(s))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[4]||(e[4]=l("h3",{id:"控制显示数量",tabindex:"-1"},[d("控制显示数量 "),l("a",{class:"header-anchor",href:"#控制显示数量","aria-label":'Permalink to "控制显示数量"'},"​")],-1)),e[5]||(e[5]=l("p",null,[d("使用 "),l("code",null,"operations-limit"),d("，"),l("code",null,"actions-limit"),d("，"),l("code",null,"sources-lines-limit"),d(" 来分别控制左侧操作按钮、右侧动作按钮和底部来源展开后显示的最大数量或行数")],-1)),h(n(t(_),null,null,512),[[k,o.value]]),n(p,null,{default:i(()=>[n(t(v),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{o.value=!1}),vueCode:t(C)},f({_:2},[c.value?{name:"vue",fn:i(()=>[n(t(c))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[6]||(e[6]=b("",2)),h(n(t(_),null,null,512),[[k,o.value]]),n(p,null,{default:i(()=>[n(t(v),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{o.value=!1}),vueCode:t(W)},f({_:2},[r.value?{name:"vue",fn:i(()=>[n(t(r))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[7]||(e[7]=b("",4))])}}});export{V as __pageData,q as default};
