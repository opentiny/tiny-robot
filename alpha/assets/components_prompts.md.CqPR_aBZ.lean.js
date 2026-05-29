const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/footer.RcYaSwFk.js","assets/chunks/theme.BDSlIIn-.js","assets/chunks/framework.6DE2p-7l.js","assets/chunks/responsive.DbFZij-_.js","assets/chunks/wrap.CzYKbVJs.js","assets/chunks/vertical.CgUN2JlB.js","assets/chunks/badge.nuNAxgJ6.js","assets/chunks/disabled.Se-0u99r.js","assets/chunks/size.RPp-Paty.js","assets/chunks/basic.D42W0awD.js"])))=>i.map(i=>d[i]);
import{aV as i,_ as p,bg as D,b1 as W,G as A,O as k,cn as c,cb as m,Q as e,bH as o,cl as l,N as u,y as d,P as n,bq as h,bb as T}from"./chunks/framework.6DE2p-7l.js";import{L as b,N as y}from"./chunks/index.DWSLKOW8.js";const x=`<template>
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
`,R=`<template>
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
`,V=`<template>
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
`,J=JSON.parse('{"title":"Prompts 提示集组件","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/prompts.md","filePath":"components/prompts.md"}'),E={name:"components/prompts.md"},j=Object.assign(E,{setup(G){const f=h();i(async()=>{f.value=(await p(async()=>{const{default:a}=await import("./chunks/footer.RcYaSwFk.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const v=h();i(async()=>{v.value=(await p(async()=>{const{default:a}=await import("./chunks/responsive.DbFZij-_.js");return{default:a}},__vite__mapDeps([3,1,2]))).default});const g=h();i(async()=>{g.value=(await p(async()=>{const{default:a}=await import("./chunks/wrap.CzYKbVJs.js");return{default:a}},__vite__mapDeps([4,1,2]))).default});const P=h();i(async()=>{P.value=(await p(async()=>{const{default:a}=await import("./chunks/vertical.CgUN2JlB.js");return{default:a}},__vite__mapDeps([5,1,2]))).default});const S=h();i(async()=>{S.value=(await p(async()=>{const{default:a}=await import("./chunks/badge.nuNAxgJ6.js");return{default:a}},__vite__mapDeps([6,1,2]))).default});const _=h();i(async()=>{_.value=(await p(async()=>{const{default:a}=await import("./chunks/disabled.Se-0u99r.js");return{default:a}},__vite__mapDeps([7,1,2]))).default});const w=h();i(async()=>{w.value=(await p(async()=>{const{default:a}=await import("./chunks/size.RPp-Paty.js");return{default:a}},__vite__mapDeps([8,1,2]))).default});const r=T(!0),C=h();return i(async()=>{C.value=(await p(async()=>{const{default:a}=await import("./chunks/basic.D42W0awD.js");return{default:a}},__vite__mapDeps([9,1,2]))).default}),(a,t)=>{const s=D("ClientOnly");return W(),A("div",null,[t[8]||(t[8]=k("",5)),c(e(o(b),null,null,512),[[m,r.value]]),e(s,null,{default:l(()=>[e(o(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{r.value=!1}),vueCode:o(V)},u({_:2},[C.value?{name:"vue",fn:l(()=>[e(o(C))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[9]||(t[9]=k("",2)),c(e(o(b),null,null,512),[[m,r.value]]),e(s,null,{default:l(()=>[e(o(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{r.value=!1}),vueCode:o(X)},u({_:2},[w.value?{name:"vue",fn:l(()=>[e(o(w))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[10]||(t[10]=d("h3",{id:"禁用状态",tabindex:"-1"},[n("禁用状态 "),d("a",{class:"header-anchor",href:"#禁用状态","aria-label":'Permalink to "禁用状态"'},"​")],-1)),t[11]||(t[11]=d("p",null,[n("要将 Prompt 标记为禁用，请向 Prompt 添加 "),d("code",null,"disabled"),n(" 属性")],-1)),c(e(o(b),null,null,512),[[m,r.value]]),e(s,null,{default:l(()=>[e(o(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{r.value=!1}),vueCode:o(L)},u({_:2},[_.value?{name:"vue",fn:l(()=>[e(o(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[12]||(t[12]=d("h3",{id:"徽章",tabindex:"-1"},[n("徽章 "),d("a",{class:"header-anchor",href:"#徽章","aria-label":'Permalink to "徽章"'},"​")],-1)),t[13]||(t[13]=d("p",null,[n("使用 "),d("code",null,"badge"),n(" 属性，给 Prompt 项右上角添加徽章")],-1)),c(e(o(b),null,null,512),[[m,r.value]]),e(s,null,{default:l(()=>[e(o(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[3]||(t[3]=()=>{r.value=!1}),vueCode:o(R)},u({_:2},[S.value?{name:"vue",fn:l(()=>[e(o(S))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[14]||(t[14]=d("h3",{id:"纵向展示",tabindex:"-1"},[n("纵向展示 "),d("a",{class:"header-anchor",href:"#纵向展示","aria-label":'Permalink to "纵向展示"'},"​")],-1)),t[15]||(t[15]=d("p",null,[n("使用 "),d("code",null,"vertical"),n(" 属性，控制 Prompts 展示方向。")],-1)),c(e(o(b),null,null,512),[[m,r.value]]),e(s,null,{default:l(()=>[e(o(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[4]||(t[4]=()=>{r.value=!1}),vueCode:o(z)},u({_:2},[P.value?{name:"vue",fn:l(()=>[e(o(P))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[16]||(t[16]=d("h3",{id:"自动换行",tabindex:"-1"},[n("自动换行 "),d("a",{class:"header-anchor",href:"#自动换行","aria-label":'Permalink to "自动换行"'},"​")],-1)),t[17]||(t[17]=d("p",null,[n("使用 "),d("code",null,"wrap"),n(" 属性，控制 Prompts 超出区域长度时是否可以换行")],-1)),c(e(o(b),null,null,512),[[m,r.value]]),e(s,null,{default:l(()=>[e(o(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[5]||(t[5]=()=>{r.value=!1}),vueCode:o(B)},u({_:2},[g.value?{name:"vue",fn:l(()=>[e(o(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[18]||(t[18]=d("h3",{id:"响应式布局",tabindex:"-1"},[n("响应式布局 "),d("a",{class:"header-anchor",href:"#响应式布局","aria-label":'Permalink to "响应式布局"'},"​")],-1)),t[19]||(t[19]=d("p",null,[n("配合 "),d("code",null,"wrap"),n(" 与 "),d("code",null,"item-style"),n(" 或者 "),d("code",null,"item-class"),n(" 实现响应式布局")],-1)),c(e(o(b),null,null,512),[[m,r.value]]),e(s,null,{default:l(()=>[e(o(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[6]||(t[6]=()=>{r.value=!1}),vueCode:o(Z)},u({_:2},[v.value?{name:"vue",fn:l(()=>[e(o(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[20]||(t[20]=d("h3",{id:"底部内容",tabindex:"-1"},[n("底部内容 "),d("a",{class:"header-anchor",href:"#底部内容","aria-label":'Permalink to "底部内容"'},"​")],-1)),t[21]||(t[21]=d("p",null,[n("使用 "),d("code",null,"footer"),n(" 插槽，给 Prompts 列表底部添加内容")],-1)),c(e(o(b),null,null,512),[[m,r.value]]),e(s,null,{default:l(()=>[e(o(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[7]||(t[7]=()=>{r.value=!1}),vueCode:o(x)},u({_:2},[f.value?{name:"vue",fn:l(()=>[e(o(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[22]||(t[22]=k("",27))])}}});export{J as __pageData,j as default};
