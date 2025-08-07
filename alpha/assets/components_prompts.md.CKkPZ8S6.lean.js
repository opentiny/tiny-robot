const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/footer.C6nQ2bbL.js","assets/chunks/index.nNojpAL5.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/framework.WjEkGhiu.js","assets/chunks/responsive.B_kqRuy9.js","assets/chunks/wrap.C4nnxvvb.js","assets/chunks/vertical.DdUHhKuY.js","assets/chunks/badge.LUJ9Amh5.js","assets/chunks/disabled.TceSYniL.js","assets/chunks/basic.DCEjH9jF.js"])))=>i.map(i=>d[i]);
import{D as d,v as p,V as m,p as W,C as T,c as Z,o as D,ah as w,ag as c,G as e,j as o,ai as u,k as n,w as l,aj as h,a}from"./chunks/framework.WjEkGhiu.js";import{R as y,k as b}from"./chunks/index.C4nH5rc5.js";const x=`<template>
  <tr-prompts :items="items" wrap item-class="prompt-item">
    <template #footer>
      <div class="prompts-footer"><span style="font-size: 16px; margin-right: 4px">🔄</span>换一换</div>
    </template>
  </tr-prompts>
</template>

<script setup lang="ts">
import { PromptProps, TrPrompts } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const items: PromptProps[] = [
  {
    label: '日常助理场景',
    description: '今天需要我帮你安排日程，规划旅行，还是起草一封邮件？',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '🧠'),
  },
  {
    label: '学习/知识型场景',
    description: '有什么想了解的吗？可以是“量子力学简介”或“Vue3 和 React 的区别”！',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '🤔'),
  },
]
<\/script>

<style lang="less" scoped>
:deep(.prompt-item) {
  width: 100%;

  @media (width >= 40rem) {
    width: calc(50% - 8px);
  }
}

.prompts-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}
</style>
`,A=`<template>
  <tr-prompts :items="items" wrap item-class="prompt-item"></tr-prompts>
</template>

<script setup lang="ts">
import { PromptProps, TrPrompts } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const items: PromptProps[] = [
  {
    label: '日常助理场景',
    description: '今天需要我帮你安排日程，规划旅行，还是起草一封邮件？',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '🧠'),
  },
  {
    label: '学习/知识型场景',
    description: '有什么想了解的吗？可以是“量子力学简介”或“Vue3 和 React 的区别”！',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '🤔'),
  },
  {
    label: '创意生成场景',
    description: '想写段文案、起个名字，还是来点灵感？说一句你想要的，我来帮你实现！',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '✨'),
  },
  {
    label: '日常助理场景',
    description: '今天需要我帮你安排日程，规划旅行，还是起草一封邮件？',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '🧠'),
  },
  {
    label: '学习/知识型场景',
    description: '有什么想了解的吗？可以是“量子力学简介”或“Vue3 和 React 的区别”！',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '🤔'),
  },
]
<\/script>

<style lang="less" scoped>
:deep(.prompt-item) {
  width: 100%;

  @media (width >= 40rem) {
    width: calc(50% - 8px);
  }
}
</style>
`,B=`<template>
  <tr-prompts :items="items" wrap></tr-prompts>
</template>

<script setup lang="ts">
import { PromptProps, TrPrompts } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const items: PromptProps[] = [
  {
    label: '日常助理场景',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '🧠'),
  },
  {
    label: '学习/知识型场景',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '🤔'),
  },
  {
    label: '想写段文案、起个名字，还是来点灵感',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '✨'),
  },
  {
    label: '日常助理场景',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '🧠'),
  },
  {
    label: '学习/知识型场景',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '🤔'),
  },
  {
    label: '想写段文案、起个名字，还是来点灵感',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '✨'),
  },
]
<\/script>
`,R=`<template>
  <tr-prompts :items="items" vertical></tr-prompts>
</template>

<script setup lang="ts">
import { PromptProps, TrPrompts } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const items: PromptProps[] = [
  {
    label: '日常助理场景',
    description: '今天需要我帮你安排日程，规划旅行，还是起草一封邮件？',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '🧠'),
  },
  {
    label: '学习/知识型场景',
    description: '有什么想了解的吗？可以是“量子力学简介”或“Vue3 和 React 的区别”！',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '🤔'),
  },
  {
    label: '创意生成场景',
    description: '想写段文案、起个名字，还是来点灵感？说一句你想要的，我来帮你实现！',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '✨'),
  },
]
<\/script>
`,X=`<template>
  <tr-prompts :items="items"></tr-prompts>
</template>

<script setup lang="ts">
import { TrPrompts, PromptProps } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const items: PromptProps[] = [
  {
    label: '日常助理场景',
    description: '今天需要我帮你安排日程，规划旅行，还是起草一封邮件？',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '🧠'),
    badge: 'NEW',
  },
  {
    label: '学习/知识型场景',
    description: '有什么想了解的吗？可以是“量子力学简介”或“Vue3 和 React 的区别”！',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '🤔'),
  },
]
<\/script>
`,L=`<template>
  <tr-prompts :items="items"></tr-prompts>
</template>

<script setup lang="ts">
import { PromptProps, TrPrompts } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const items: PromptProps[] = [
  {
    label: '日常助理场景',
    description: '今天需要我帮你安排日程，规划旅行，还是起草一封邮件？',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '🧠'),
    disabled: true,
  },
  {
    label: '学习/知识型场景',
    description: '有什么想了解的吗？可以是“量子力学简介”或“Vue3 和 React 的区别”！',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '🤔'),
  },
]
<\/script>
`,g=`<template>
  <tr-prompts :items="items"></tr-prompts>
</template>

<script setup lang="ts">
import { PromptProps, TrPrompts } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const items: PromptProps[] = [
  {
    label: '日常助理场景',
    description: '今天需要我帮你安排日程，规划旅行，还是起草一封邮件？',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '🧠'),
  },
  {
    label: '学习/知识型场景',
    description: '有什么想了解的吗？可以是“量子力学简介”或“Vue3 和 React 的区别”！',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '🤔'),
  },
  {
    label: '创意生成场景',
    description: '想写段文案、起个名字，还是来点灵感？说一句你想要的，我来帮你实现！',
    icon: h('span', { style: { fontSize: '18px' } as CSSProperties }, '✨'),
  },
]
<\/script>
`,I=JSON.parse('{"title":"Prompts 提示集组件","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/prompts.md","filePath":"components/prompts.md"}'),z={name:"components/prompts.md"},q=Object.assign(z,{setup(V){const f=d();p(async()=>{f.value=(await m(async()=>{const{default:s}=await import("./chunks/footer.C6nQ2bbL.js");return{default:s}},__vite__mapDeps([0,1,2,3]))).default});const v=d();p(async()=>{v.value=(await m(async()=>{const{default:s}=await import("./chunks/responsive.B_kqRuy9.js");return{default:s}},__vite__mapDeps([4,1,2,3]))).default});const P=d();p(async()=>{P.value=(await m(async()=>{const{default:s}=await import("./chunks/wrap.C4nnxvvb.js");return{default:s}},__vite__mapDeps([5,1,2,3]))).default});const S=d();p(async()=>{S.value=(await m(async()=>{const{default:s}=await import("./chunks/vertical.DdUHhKuY.js");return{default:s}},__vite__mapDeps([6,1,2,3]))).default});const _=d();p(async()=>{_.value=(await m(async()=>{const{default:s}=await import("./chunks/badge.LUJ9Amh5.js");return{default:s}},__vite__mapDeps([7,1,2,3]))).default});const C=d();p(async()=>{C.value=(await m(async()=>{const{default:s}=await import("./chunks/disabled.TceSYniL.js");return{default:s}},__vite__mapDeps([8,1,2,3]))).default});const r=W(!0),k=d();return p(async()=>{k.value=(await m(async()=>{const{default:s}=await import("./chunks/basic.DCEjH9jF.js");return{default:s}},__vite__mapDeps([9,1,2,3]))).default}),(s,t)=>{const i=T("ClientOnly");return D(),Z("div",null,[t[7]||(t[7]=w("",5)),c(e(n(y),null,null,512),[[u,r.value]]),e(i,null,{default:l(()=>[e(n(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:t[0]||(t[0]=()=>{r.value=!1}),vueCode:n(g)},h({_:2},[k.value?{name:"vue",fn:l(()=>[e(n(k))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[8]||(t[8]=o("h3",{id:"禁用状态",tabindex:"-1"},[a("禁用状态 "),o("a",{class:"header-anchor",href:"#禁用状态","aria-label":'Permalink to "禁用状态"'},"​")],-1)),t[9]||(t[9]=o("p",null,[a("要将 Prompt 标记为禁用，请向 Prompt 添加 "),o("code",null,"disabled"),a(" 属性")],-1)),c(e(n(y),null,null,512),[[u,r.value]]),e(i,null,{default:l(()=>[e(n(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:t[1]||(t[1]=()=>{r.value=!1}),vueCode:n(L)},h({_:2},[C.value?{name:"vue",fn:l(()=>[e(n(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[10]||(t[10]=o("h3",{id:"徽章",tabindex:"-1"},[a("徽章 "),o("a",{class:"header-anchor",href:"#徽章","aria-label":'Permalink to "徽章"'},"​")],-1)),t[11]||(t[11]=o("p",null,[a("使用 "),o("code",null,"badge"),a(" 属性，给 Prompt 项右上角添加徽章")],-1)),c(e(n(y),null,null,512),[[u,r.value]]),e(i,null,{default:l(()=>[e(n(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:t[2]||(t[2]=()=>{r.value=!1}),vueCode:n(X)},h({_:2},[_.value?{name:"vue",fn:l(()=>[e(n(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[12]||(t[12]=o("h3",{id:"纵向展示",tabindex:"-1"},[a("纵向展示 "),o("a",{class:"header-anchor",href:"#纵向展示","aria-label":'Permalink to "纵向展示"'},"​")],-1)),t[13]||(t[13]=o("p",null,[a("使用 "),o("code",null,"vertical"),a(" 属性，控制 Prompts 展示方向。")],-1)),c(e(n(y),null,null,512),[[u,r.value]]),e(i,null,{default:l(()=>[e(n(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:t[3]||(t[3]=()=>{r.value=!1}),vueCode:n(R)},h({_:2},[S.value?{name:"vue",fn:l(()=>[e(n(S))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[14]||(t[14]=o("h3",{id:"自动换行",tabindex:"-1"},[a("自动换行 "),o("a",{class:"header-anchor",href:"#自动换行","aria-label":'Permalink to "自动换行"'},"​")],-1)),t[15]||(t[15]=o("p",null,[a("使用 "),o("code",null,"wrap"),a(" 属性，控制 Prompts 超出区域长度时是否可以换行")],-1)),c(e(n(y),null,null,512),[[u,r.value]]),e(i,null,{default:l(()=>[e(n(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:t[4]||(t[4]=()=>{r.value=!1}),vueCode:n(B)},h({_:2},[P.value?{name:"vue",fn:l(()=>[e(n(P))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[16]||(t[16]=o("h3",{id:"响应式布局",tabindex:"-1"},[a("响应式布局 "),o("a",{class:"header-anchor",href:"#响应式布局","aria-label":'Permalink to "响应式布局"'},"​")],-1)),t[17]||(t[17]=o("p",null,[a("配合 "),o("code",null,"wrap"),a(" 与 "),o("code",null,"item-style"),a(" 或者 "),o("code",null,"item-class"),a(" 实现响应式布局")],-1)),c(e(n(y),null,null,512),[[u,r.value]]),e(i,null,{default:l(()=>[e(n(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:t[5]||(t[5]=()=>{r.value=!1}),vueCode:n(A)},h({_:2},[v.value?{name:"vue",fn:l(()=>[e(n(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[18]||(t[18]=o("h3",{id:"底部内容",tabindex:"-1"},[a("底部内容 "),o("a",{class:"header-anchor",href:"#底部内容","aria-label":'Permalink to "底部内容"'},"​")],-1)),t[19]||(t[19]=o("p",null,[a("使用 "),o("code",null,"footer"),a(" 插槽，给 Prompts 列表底部添加内容")],-1)),c(e(n(y),null,null,512),[[u,r.value]]),e(i,null,{default:l(()=>[e(n(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:t[6]||(t[6]=()=>{r.value=!1}),vueCode:n(x)},h({_:2},[f.value?{name:"vue",fn:l(()=>[e(n(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[20]||(t[20]=w("",13))])}}});export{I as __pageData,q as default};
