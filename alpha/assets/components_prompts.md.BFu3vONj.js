const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/footer.DxIbqF6O.js","assets/chunks/theme.HOe8XNk8.js","assets/chunks/framework.Bj9nRyxS.js","assets/chunks/responsive.BJphAnsA.js","assets/chunks/wrap.MfXtl3PA.js","assets/chunks/vertical.CZIphqrf.js","assets/chunks/badge.De0w2sYB.js","assets/chunks/disabled.B3_E-22_.js","assets/chunks/size.Lp5uIQmp.js","assets/chunks/basic.BobBJTb0.js"])))=>i.map(i=>d[i]);
import{aD as i,bQ as p,aZ as D,aL as W,v as A,H as k,bL as c,bB as m,J as e,bk as o,bJ as l,G as u,w as d,I as n,b7 as h,aU as T}from"./chunks/framework.Bj9nRyxS.js";import{L as b,N as y}from"./chunks/index.CWoq7UBq.js";const x=`<template>
  <tr-prompts :items="items" wrap item-class="prompt-item">
    <template #footer>
      <div class="prompts-footer">
        <span style="font-size: 16px; margin-right: 4px"><IconRefresh /></span>
        <span style="font-size: 12px; line-height: 20px">换一换</span>
      </div>
    </template>
  </tr-prompts>
</template>

<script setup lang="ts">
import { IconRefresh } from '@opentiny/tiny-robot-svgs'
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

<style scoped>
:deep(.prompt-item) {
  width: 100%;

  @media (width >= 40rem) {
    width: calc(50% - var(--tr-prompts-gap) / 2);
  }
}

.prompts-footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 16px;
  color: var(--tr-text-secondary);
  cursor: pointer;
}
</style>
`,Z=`<template>
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

<style scoped>
:deep(.prompt-item) {
  width: 100%;

  @media (width >= 40rem) {
    width: calc(50% - var(--tr-prompts-gap) / 2);
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
`,z=`<template>
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
`,L=`<template>
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
`,R=`<template>
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
`,X=`<template>
  <tr-prompts :items="items" vertical></tr-prompts>
</template>

<script setup lang="ts">
import { PromptProps, TrPrompts } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const iconStyle: CSSProperties = {
  fontSize: '18px',
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

const items: PromptProps[] = [
  {
    label: '日常助理场景(small)',
    description: '今天需要我帮你安排日程，规划旅行，还是起草一封邮件？',
    icon: h('span', { style: iconStyle }, '🧠'),
    size: 'small',
    badge: 'NEW',
  },
  {
    label: '日常助理场景(medium)',
    description: '今天需要我帮你安排日程，规划旅行，还是起草一封邮件？',
    icon: h('span', { style: iconStyle }, '🧠'),
    size: 'medium',
    badge: 'NEW',
  },
  {
    label: '日常助理场景(large)',
    description: '今天需要我帮你安排日程，规划旅行，还是起草一封邮件？',
    icon: h('span', { style: iconStyle }, '🧠'),
    size: 'large',
    badge: 'NEW',
  },
]
<\/script>
`,E=`<template>
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
`,J=JSON.parse('{"title":"Prompts 提示集组件","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/prompts.md","filePath":"components/prompts.md"}'),G={name:"components/prompts.md"},j=Object.assign(G,{setup(V){const f=h();i(async()=>{f.value=(await p(async()=>{const{default:a}=await import("./chunks/footer.DxIbqF6O.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const v=h();i(async()=>{v.value=(await p(async()=>{const{default:a}=await import("./chunks/responsive.BJphAnsA.js");return{default:a}},__vite__mapDeps([3,1,2]))).default});const g=h();i(async()=>{g.value=(await p(async()=>{const{default:a}=await import("./chunks/wrap.MfXtl3PA.js");return{default:a}},__vite__mapDeps([4,1,2]))).default});const P=h();i(async()=>{P.value=(await p(async()=>{const{default:a}=await import("./chunks/vertical.CZIphqrf.js");return{default:a}},__vite__mapDeps([5,1,2]))).default});const S=h();i(async()=>{S.value=(await p(async()=>{const{default:a}=await import("./chunks/badge.De0w2sYB.js");return{default:a}},__vite__mapDeps([6,1,2]))).default});const _=h();i(async()=>{_.value=(await p(async()=>{const{default:a}=await import("./chunks/disabled.B3_E-22_.js");return{default:a}},__vite__mapDeps([7,1,2]))).default});const w=h();i(async()=>{w.value=(await p(async()=>{const{default:a}=await import("./chunks/size.Lp5uIQmp.js");return{default:a}},__vite__mapDeps([8,1,2]))).default});const r=T(!0),C=h();return i(async()=>{C.value=(await p(async()=>{const{default:a}=await import("./chunks/basic.BobBJTb0.js");return{default:a}},__vite__mapDeps([9,1,2]))).default}),(a,t)=>{const s=D("ClientOnly");return W(),A("div",null,[t[8]||(t[8]=k('<h1 id="prompts-提示集组件" tabindex="-1">Prompts 提示集组件 <a class="header-anchor" href="#prompts-提示集组件" aria-label="Permalink to &quot;Prompts 提示集组件&quot;">​</a></h1><p>Prompts 是一个用于展示提示列表的通用组件，包含多个提示项，支持自定义样式、禁用状态、徽章、纵向展示、自动换行、响应式布局、底部内容等功能。</p><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基本" tabindex="-1">基本 <a class="header-anchor" href="#基本" aria-label="Permalink to &quot;基本&quot;">​</a></h3><p>基本用法</p>',5)),c(e(o(b),null,null,512),[[m,r.value]]),e(s,null,{default:l(()=>[e(o(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{r.value=!1}),vueCode:o(E)},u({_:2},[C.value?{name:"vue",fn:l(()=>[e(o(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[9]||(t[9]=k('<h3 id="大小" tabindex="-1">大小 <a class="header-anchor" href="#大小" aria-label="Permalink to &quot;大小&quot;">​</a></h3><p>使用 <code>size</code> 属性，控制 Prompt 项的大小。默认大小为 <code>medium</code>，可选值为 <code>small</code>、<code>medium</code>、<code>large</code>。</p>',2)),c(e(o(b),null,null,512),[[m,r.value]]),e(s,null,{default:l(()=>[e(o(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{r.value=!1}),vueCode:o(X)},u({_:2},[w.value?{name:"vue",fn:l(()=>[e(o(w))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[10]||(t[10]=d("h3",{id:"禁用状态",tabindex:"-1"},[n("禁用状态 "),d("a",{class:"header-anchor",href:"#禁用状态","aria-label":'Permalink to "禁用状态"'},"​")],-1)),t[11]||(t[11]=d("p",null,[n("要将 Prompt 标记为禁用，请向 Prompt 添加 "),d("code",null,"disabled"),n(" 属性")],-1)),c(e(o(b),null,null,512),[[m,r.value]]),e(s,null,{default:l(()=>[e(o(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{r.value=!1}),vueCode:o(R)},u({_:2},[_.value?{name:"vue",fn:l(()=>[e(o(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[12]||(t[12]=d("h3",{id:"徽章",tabindex:"-1"},[n("徽章 "),d("a",{class:"header-anchor",href:"#徽章","aria-label":'Permalink to "徽章"'},"​")],-1)),t[13]||(t[13]=d("p",null,[n("使用 "),d("code",null,"badge"),n(" 属性，给 Prompt 项右上角添加徽章")],-1)),c(e(o(b),null,null,512),[[m,r.value]]),e(s,null,{default:l(()=>[e(o(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[3]||(t[3]=()=>{r.value=!1}),vueCode:o(L)},u({_:2},[S.value?{name:"vue",fn:l(()=>[e(o(S))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[14]||(t[14]=d("h3",{id:"纵向展示",tabindex:"-1"},[n("纵向展示 "),d("a",{class:"header-anchor",href:"#纵向展示","aria-label":'Permalink to "纵向展示"'},"​")],-1)),t[15]||(t[15]=d("p",null,[n("使用 "),d("code",null,"vertical"),n(" 属性，控制 Prompts 展示方向。")],-1)),c(e(o(b),null,null,512),[[m,r.value]]),e(s,null,{default:l(()=>[e(o(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[4]||(t[4]=()=>{r.value=!1}),vueCode:o(z)},u({_:2},[P.value?{name:"vue",fn:l(()=>[e(o(P))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[16]||(t[16]=d("h3",{id:"自动换行",tabindex:"-1"},[n("自动换行 "),d("a",{class:"header-anchor",href:"#自动换行","aria-label":'Permalink to "自动换行"'},"​")],-1)),t[17]||(t[17]=d("p",null,[n("使用 "),d("code",null,"wrap"),n(" 属性，控制 Prompts 超出区域长度时是否可以换行")],-1)),c(e(o(b),null,null,512),[[m,r.value]]),e(s,null,{default:l(()=>[e(o(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[5]||(t[5]=()=>{r.value=!1}),vueCode:o(B)},u({_:2},[g.value?{name:"vue",fn:l(()=>[e(o(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[18]||(t[18]=d("h3",{id:"响应式布局",tabindex:"-1"},[n("响应式布局 "),d("a",{class:"header-anchor",href:"#响应式布局","aria-label":'Permalink to "响应式布局"'},"​")],-1)),t[19]||(t[19]=d("p",null,[n("配合 "),d("code",null,"wrap"),n(" 与 "),d("code",null,"item-style"),n(" 或者 "),d("code",null,"item-class"),n(" 实现响应式布局")],-1)),c(e(o(b),null,null,512),[[m,r.value]]),e(s,null,{default:l(()=>[e(o(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[6]||(t[6]=()=>{r.value=!1}),vueCode:o(Z)},u({_:2},[v.value?{name:"vue",fn:l(()=>[e(o(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[20]||(t[20]=d("h3",{id:"底部内容",tabindex:"-1"},[n("底部内容 "),d("a",{class:"header-anchor",href:"#底部内容","aria-label":'Permalink to "底部内容"'},"​")],-1)),t[21]||(t[21]=d("p",null,[n("使用 "),d("code",null,"footer"),n(" 插槽，给 Prompts 列表底部添加内容")],-1)),c(e(o(b),null,null,512),[[m,r.value]]),e(s,null,{default:l(()=>[e(o(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[7]||(t[7]=()=>{r.value=!1}),vueCode:o(x)},u({_:2},[f.value?{name:"vue",fn:l(()=>[e(o(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[22]||(t[22]=k('<h2 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h2><p><strong>PromptProps</strong> - 单个提示项的属性配置</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>必填</th><th>说明</th></tr></thead><tbody><tr><td><code>label</code></td><td><code>string</code></td><td>是</td><td>提示标签，显示提示的主要内容</td></tr><tr><td><code>id</code></td><td><code>string</code></td><td>否</td><td>唯一标识用于区分每个提示项，用于 Prompts 列表。如果不传此参数，则使用 index 作为 key</td></tr><tr><td><code>description</code></td><td><code>string</code></td><td>否</td><td>提示描述，提供额外的信息</td></tr><tr><td><code>icon</code></td><td><code>VNode</code></td><td>否</td><td>提示图标，显示在提示项的左侧</td></tr><tr><td><code>disabled</code></td><td><code>boolean</code></td><td>否</td><td>是否禁用，默认 <code>false</code></td></tr><tr><td><code>badge</code></td><td><code>string | VNode</code></td><td>否</td><td>提示徽章，显示在提示项的右上角</td></tr></tbody></table><p><strong>PromptsProps</strong> - 提示列表组件的属性配置</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>必填</th><th>说明</th></tr></thead><tbody><tr><td><code>items</code></td><td><code>PromptProps[]</code></td><td>是</td><td>包含多个提示项的列表</td></tr><tr><td><code>itemStyle</code></td><td><code>string | CSSProperties</code></td><td>否</td><td>自定义样式，用于各个提示项的不同部分</td></tr><tr><td><code>itemClass</code></td><td><code>string | string[]</code></td><td>否</td><td>自定义类名，用于各个提示项的不同部分</td></tr><tr><td><code>vertical</code></td><td><code>boolean</code></td><td>否</td><td>提示列表是否垂直排列，默认 <code>false</code></td></tr><tr><td><code>wrap</code></td><td><code>boolean</code></td><td>否</td><td>提示列表是否折行，默认 <code>false</code></td></tr></tbody></table><h2 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h2><table tabindex="0"><thead><tr><th>插槽名</th><th>说明</th></tr></thead><tbody><tr><td><code>footer</code></td><td>底部插槽，用于在提示列表底部添加自定义内容</td></tr></tbody></table><h2 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h2><table tabindex="0"><thead><tr><th>事件名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>item-click</code></td><td><code>(ev: MouseEvent, item: PromptProps)</code></td><td>当点击提示项时触发</td></tr></tbody></table><h2 id="css-变量" tabindex="-1">CSS 变量 <a class="header-anchor" href="#css-变量" aria-label="Permalink to &quot;CSS 变量&quot;">​</a></h2><p><strong>Prompt 根元素</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-prompt-bg</code></td><td>提示项背景色</td></tr><tr><td><code>--tr-prompt-bg-hover</code></td><td>提示项悬停背景色</td></tr><tr><td><code>--tr-prompt-bg-active</code></td><td>提示项激活背景色</td></tr><tr><td><code>--tr-prompt-bg-disabled</code></td><td>提示项禁用背景色</td></tr><tr><td><code>--tr-prompt-border-radius</code></td><td>圆角大小</td></tr><tr><td><code>--tr-prompt-shadow</code></td><td>阴影效果</td></tr><tr><td><code>--tr-prompt-width</code></td><td>提示项宽度</td></tr><tr><td><code>--tr-prompt-padding</code></td><td>内边距</td></tr><tr><td><code>--tr-prompt-gap</code></td><td>图标与内容间距</td></tr></tbody></table><p><strong>title 标题</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-prompt-title-color</code></td><td>标题文字颜色</td></tr><tr><td><code>--tr-prompt-title-font-size</code></td><td>标题字号</td></tr><tr><td><code>--tr-prompt-title-line-height</code></td><td>标题行高</td></tr><tr><td><code>--tr-prompt-title-font-weight</code></td><td>标题字重</td></tr></tbody></table><p><strong>content 内容</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-prompt-content-gap</code></td><td>标题与描述间距</td></tr></tbody></table><p><strong>description 描述</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-prompt-description-color</code></td><td>描述文字颜色</td></tr><tr><td><code>--tr-prompt-description-font-size</code></td><td>描述字号</td></tr><tr><td><code>--tr-prompt-description-line-height</code></td><td>描述行高</td></tr></tbody></table><p><strong>badge 徽章</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-prompt-badge-bg</code></td><td>徽章背景色</td></tr><tr><td><code>--tr-prompt-badge-color</code></td><td>徽章文字颜色</td></tr><tr><td><code>--tr-prompt-badge-padding</code></td><td>徽章内边距</td></tr><tr><td><code>--tr-prompt-badge-font-size</code></td><td>徽章字号</td></tr><tr><td><code>--tr-prompt-badge-line-height</code></td><td>徽章行高</td></tr></tbody></table><p><strong>Prompt 组件尺寸变量</strong></p><p>Prompt 组件 <code>size</code> 属性可选值有 <code>small</code>、<code>medium</code>、<code>large</code>，默认值为 <code>medium</code>。不同尺寸对应的变量是如下变量名后缀加上 <code>-small</code>、<code>-medium</code>、<code>-large</code>。</p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-prompt-padding</code></td><td>内边距</td></tr><tr><td><code>--tr-prompt-gap</code></td><td>图标间距</td></tr><tr><td><code>--tr-prompt-title-font-size</code></td><td>标题字号</td></tr><tr><td><code>--tr-prompt-title-line-height</code></td><td>标题行高</td></tr><tr><td><code>--tr-prompt-content-gap</code></td><td>内容间距</td></tr><tr><td><code>--tr-prompt-description-font-size</code></td><td>描述字号</td></tr><tr><td><code>--tr-prompt-description-line-height</code></td><td>描述行高</td></tr><tr><td><code>--tr-prompt-badge-padding</code></td><td>徽章内边距</td></tr><tr><td><code>--tr-prompt-badge-font-size</code></td><td>徽章字号</td></tr><tr><td><code>--tr-prompt-badge-line-height</code></td><td>徽章行高</td></tr></tbody></table><p>比如 <code>--tr-prompt-padding</code> 变量，对应不同尺寸的变量如下：</p><table tabindex="0"><thead><tr><th>变量名</th><th>size</th></tr></thead><tbody><tr><td><code>--tr-prompt-padding-small</code></td><td>small</td></tr><tr><td><code>--tr-prompt-padding-medium</code></td><td>medium</td></tr><tr><td><code>--tr-prompt-padding-large</code></td><td>large</td></tr></tbody></table><p><strong>Prompts 容器变量</strong></p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-prompts-gap</code></td><td>提示项之间的间距</td></tr></tbody></table>',27))])}}});export{J as __pageData,j as default};
