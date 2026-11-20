const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/footer.B6oJViUW.js","assets/chunks/theme.MY0DDsqj.js","assets/chunks/framework.Dw8jt1Jz.js","assets/chunks/responsive.BbtdR5U1.js","assets/chunks/wrap.Bo8FCouG.js","assets/chunks/vertical.CjX7JGVG.js","assets/chunks/badge.CTKu2O9G.js","assets/chunks/disabled.BcOqFYoS.js","assets/chunks/size.Vm1NKr8D.js","assets/chunks/basic.CpIEHsZ3.js"])))=>i.map(i=>d[i]);
import{aD as i,aZ as C,aL as Z,v as j,H as M,bL as p,bB as c,J as e,bk as d,bJ as l,G as m,w as o,I as r,aU as W,b7 as u,bQ as h}from"./chunks/framework.Dw8jt1Jz.js";import{L as b,N as f}from"./chunks/index.DDu3Iq4c.js";const A=`<template>
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
`,k=`<template>
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
`,z=`<template>
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
`,D=`<template>
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
`,x=`<template>
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
`,B=`<template>
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
`,J=JSON.parse('{"title":"Prompts 提示集组件","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/prompts.md","filePath":"components/prompts.md"}'),G={name:"components/prompts.md"},Y=Object.assign(G,{setup(V){const y=u();i(async()=>{y.value=(await h(async()=>{const{default:a}=await import("./chunks/footer.B6oJViUW.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const v=u();i(async()=>{v.value=(await h(async()=>{const{default:a}=await import("./chunks/responsive.BbtdR5U1.js");return{default:a}},__vite__mapDeps([3,1,2]))).default});const S=u();i(async()=>{S.value=(await h(async()=>{const{default:a}=await import("./chunks/wrap.Bo8FCouG.js");return{default:a}},__vite__mapDeps([4,1,2]))).default});const w=u();i(async()=>{w.value=(await h(async()=>{const{default:a}=await import("./chunks/vertical.CjX7JGVG.js");return{default:a}},__vite__mapDeps([5,1,2]))).default});const g=u();i(async()=>{g.value=(await h(async()=>{const{default:a}=await import("./chunks/badge.CTKu2O9G.js");return{default:a}},__vite__mapDeps([6,1,2]))).default});const P=u();i(async()=>{P.value=(await h(async()=>{const{default:a}=await import("./chunks/disabled.BcOqFYoS.js");return{default:a}},__vite__mapDeps([7,1,2]))).default});const T=u();i(async()=>{T.value=(await h(async()=>{const{default:a}=await import("./chunks/size.Vm1NKr8D.js");return{default:a}},__vite__mapDeps([8,1,2]))).default});const n=W(!0),_=u();return i(async()=>{_.value=(await h(async()=>{const{default:a}=await import("./chunks/basic.CpIEHsZ3.js");return{default:a}},__vite__mapDeps([9,1,2]))).default}),(a,t)=>{const s=C("ClientOnly");return Z(),j("div",null,[t[8]||(t[8]=M("",5)),p(e(d(b),null,null,512),[[c,n.value]]),e(s,null,{default:l(()=>[e(d(f),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{n.value=!1}),vueCode:d(E)},m({_:2},[_.value?{name:"vue",fn:l(()=>[e(d(_))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[9]||(t[9]=M("",2)),p(e(d(b),null,null,512),[[c,n.value]]),e(s,null,{default:l(()=>[e(d(f),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{n.value=!1}),vueCode:d(B)},m({_:2},[T.value?{name:"vue",fn:l(()=>[e(d(T))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[10]||(t[10]=o("h3",{id:"禁用状态",tabindex:"-1"},[r("禁用状态 "),o("a",{class:"header-anchor",href:"#禁用状态","aria-label":'Permalink to "禁用状态"'},"​")],-1)),t[11]||(t[11]=o("p",null,[r("要将 Prompt 标记为禁用，请向 Prompt 添加 "),o("code",null,"disabled"),r(" 属性")],-1)),p(e(d(b),null,null,512),[[c,n.value]]),e(s,null,{default:l(()=>[e(d(f),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{n.value=!1}),vueCode:d(x)},m({_:2},[P.value?{name:"vue",fn:l(()=>[e(d(P))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[12]||(t[12]=o("h3",{id:"徽章",tabindex:"-1"},[r("徽章 "),o("a",{class:"header-anchor",href:"#徽章","aria-label":'Permalink to "徽章"'},"​")],-1)),t[13]||(t[13]=o("p",null,[r("使用 "),o("code",null,"badge"),r(" 属性，给 Prompt 项右上角添加徽章")],-1)),p(e(d(b),null,null,512),[[c,n.value]]),e(s,null,{default:l(()=>[e(d(f),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[3]||(t[3]=()=>{n.value=!1}),vueCode:d(L)},m({_:2},[g.value?{name:"vue",fn:l(()=>[e(d(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[14]||(t[14]=o("h3",{id:"纵向展示",tabindex:"-1"},[r("纵向展示 "),o("a",{class:"header-anchor",href:"#纵向展示","aria-label":'Permalink to "纵向展示"'},"​")],-1)),t[15]||(t[15]=o("p",null,[r("使用 "),o("code",null,"vertical"),r(" 属性，控制 Prompts 展示方向。")],-1)),p(e(d(b),null,null,512),[[c,n.value]]),e(s,null,{default:l(()=>[e(d(f),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[4]||(t[4]=()=>{n.value=!1}),vueCode:d(D)},m({_:2},[w.value?{name:"vue",fn:l(()=>[e(d(w))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[16]||(t[16]=o("h3",{id:"自动换行",tabindex:"-1"},[r("自动换行 "),o("a",{class:"header-anchor",href:"#自动换行","aria-label":'Permalink to "自动换行"'},"​")],-1)),t[17]||(t[17]=o("p",null,[r("使用 "),o("code",null,"wrap"),r(" 属性，控制 Prompts 超出区域长度时是否可以换行")],-1)),p(e(d(b),null,null,512),[[c,n.value]]),e(s,null,{default:l(()=>[e(d(f),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[5]||(t[5]=()=>{n.value=!1}),vueCode:d(z)},m({_:2},[S.value?{name:"vue",fn:l(()=>[e(d(S))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[18]||(t[18]=o("h3",{id:"响应式布局",tabindex:"-1"},[r("响应式布局 "),o("a",{class:"header-anchor",href:"#响应式布局","aria-label":'Permalink to "响应式布局"'},"​")],-1)),t[19]||(t[19]=o("p",null,[r("配合 "),o("code",null,"wrap"),r(" 与 "),o("code",null,"item-style"),r(" 或者 "),o("code",null,"item-class"),r(" 实现响应式布局")],-1)),p(e(d(b),null,null,512),[[c,n.value]]),e(s,null,{default:l(()=>[e(d(f),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[6]||(t[6]=()=>{n.value=!1}),vueCode:d(k)},m({_:2},[v.value?{name:"vue",fn:l(()=>[e(d(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[20]||(t[20]=o("h3",{id:"底部内容",tabindex:"-1"},[r("底部内容 "),o("a",{class:"header-anchor",href:"#底部内容","aria-label":'Permalink to "底部内容"'},"​")],-1)),t[21]||(t[21]=o("p",null,[r("使用 "),o("code",null,"footer"),r(" 插槽，给 Prompts 列表底部添加内容")],-1)),p(e(d(b),null,null,512),[[c,n.value]]),e(s,null,{default:l(()=>[e(d(f),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[7]||(t[7]=()=>{n.value=!1}),vueCode:d(A)},m({_:2},[y.value?{name:"vue",fn:l(()=>[e(d(y))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[22]||(t[22]=M("",27))])}}});export{J as __pageData,Y as default};
