const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/footer.DIAoY8xh.js","assets/chunks/index.CEqBLwX-.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/framework.kTfunus-.js","assets/chunks/responsive.H8ICAdnq.js","assets/chunks/wrap.D2vE2aBG.js","assets/chunks/vertical.B2KNhdCx.js","assets/chunks/badge.Cf5GrKnv.js","assets/chunks/disabled.hwdo0vH7.js","assets/chunks/basic.BHrw99-R.js"])))=>i.map(i=>d[i]);
import{p as d,v as p,V as m,C as w,c as B,o as W,ag as z,ah as u,G as e,j as o,ai as c,k as n,w as r,a as l}from"./chunks/framework.kTfunus-.js";import{O as b,E as h}from"./chunks/index.Bs5OpVoR.js";const k=`<template>
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
`,T=`<template>
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
`,x=`<template>
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
`,A=`<template>
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
`,N=`<template>
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
`,U=JSON.parse('{"title":"Prompts 提示集组件","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/prompts.md","filePath":"components/prompts.md"}'),V={name:"components/prompts.md"},E=Object.assign(V,{setup(G){const f=d();p(async()=>{f.value=(await m(async()=>{const{default:a}=await import("./chunks/footer.DIAoY8xh.js");return{default:a}},__vite__mapDeps([0,1,2,3]))).default});const v=d();p(async()=>{v.value=(await m(async()=>{const{default:a}=await import("./chunks/responsive.H8ICAdnq.js");return{default:a}},__vite__mapDeps([4,1,2,3]))).default});const P=d();p(async()=>{P.value=(await m(async()=>{const{default:a}=await import("./chunks/wrap.D2vE2aBG.js");return{default:a}},__vite__mapDeps([5,1,2,3]))).default});const y=d();p(async()=>{y.value=(await m(async()=>{const{default:a}=await import("./chunks/vertical.B2KNhdCx.js");return{default:a}},__vite__mapDeps([6,1,2,3]))).default});const S=d();p(async()=>{S.value=(await m(async()=>{const{default:a}=await import("./chunks/badge.Cf5GrKnv.js");return{default:a}},__vite__mapDeps([7,1,2,3]))).default});const C=d();p(async()=>{C.value=(await m(async()=>{const{default:a}=await import("./chunks/disabled.hwdo0vH7.js");return{default:a}},__vite__mapDeps([8,1,2,3]))).default});const s=d(!0),_=d();return p(async()=>{_.value=(await m(async()=>{const{default:a}=await import("./chunks/basic.BHrw99-R.js");return{default:a}},__vite__mapDeps([9,1,2,3]))).default}),(a,t)=>{const i=w("ClientOnly");return W(),B("div",null,[t[7]||(t[7]=z('<h1 id="prompts-提示集组件" tabindex="-1">Prompts 提示集组件 <a class="header-anchor" href="#prompts-提示集组件" aria-label="Permalink to &quot;Prompts 提示集组件&quot;">​</a></h1><p>Prompts 是一个用于展示提示列表的通用组件，包含多个提示项，支持自定义样式、禁用状态、徽章、纵向展示、自动换行、响应式布局、底部内容等功能。</p><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基本" tabindex="-1">基本 <a class="header-anchor" href="#基本" aria-label="Permalink to &quot;基本&quot;">​</a></h3><p>基本用法</p>',5)),u(e(n(b),null,null,512),[[c,s.value]]),e(i,null,{default:r(()=>[e(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[0]||(t[0]=()=>{s.value=!1}),vueCode:n(N)},{vue:r(()=>[e(n(_))]),_:1},8,["vueCode"])]),_:1}),t[8]||(t[8]=o("h3",{id:"禁用状态",tabindex:"-1"},[l("禁用状态 "),o("a",{class:"header-anchor",href:"#禁用状态","aria-label":'Permalink to "禁用状态"'},"​")],-1)),t[9]||(t[9]=o("p",null,[l("要将 Prompt 标记为禁用，请向 Prompt 添加 "),o("code",null,"disabled"),l(" 属性")],-1)),u(e(n(b),null,null,512),[[c,s.value]]),e(i,null,{default:r(()=>[e(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[1]||(t[1]=()=>{s.value=!1}),vueCode:n(R)},{vue:r(()=>[e(n(C))]),_:1},8,["vueCode"])]),_:1}),t[10]||(t[10]=o("h3",{id:"徽章",tabindex:"-1"},[l("徽章 "),o("a",{class:"header-anchor",href:"#徽章","aria-label":'Permalink to "徽章"'},"​")],-1)),t[11]||(t[11]=o("p",null,[l("使用 "),o("code",null,"badge"),l(" 属性，给 Prompt 项右上角添加徽章")],-1)),u(e(n(b),null,null,512),[[c,s.value]]),e(i,null,{default:r(()=>[e(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[2]||(t[2]=()=>{s.value=!1}),vueCode:n(A)},{vue:r(()=>[e(n(S))]),_:1},8,["vueCode"])]),_:1}),t[12]||(t[12]=o("h3",{id:"纵向展示",tabindex:"-1"},[l("纵向展示 "),o("a",{class:"header-anchor",href:"#纵向展示","aria-label":'Permalink to "纵向展示"'},"​")],-1)),t[13]||(t[13]=o("p",null,[l("使用 "),o("code",null,"vertical"),l(" 属性，控制 Prompts 展示方向。")],-1)),u(e(n(b),null,null,512),[[c,s.value]]),e(i,null,{default:r(()=>[e(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[3]||(t[3]=()=>{s.value=!1}),vueCode:n(D)},{vue:r(()=>[e(n(y))]),_:1},8,["vueCode"])]),_:1}),t[14]||(t[14]=o("h3",{id:"自动换行",tabindex:"-1"},[l("自动换行 "),o("a",{class:"header-anchor",href:"#自动换行","aria-label":'Permalink to "自动换行"'},"​")],-1)),t[15]||(t[15]=o("p",null,[l("使用 "),o("code",null,"wrap"),l(" 属性，控制 Prompts 超出区域长度时是否可以换行")],-1)),u(e(n(b),null,null,512),[[c,s.value]]),e(i,null,{default:r(()=>[e(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[4]||(t[4]=()=>{s.value=!1}),vueCode:n(x)},{vue:r(()=>[e(n(P))]),_:1},8,["vueCode"])]),_:1}),t[16]||(t[16]=o("h3",{id:"响应式布局",tabindex:"-1"},[l("响应式布局 "),o("a",{class:"header-anchor",href:"#响应式布局","aria-label":'Permalink to "响应式布局"'},"​")],-1)),t[17]||(t[17]=o("p",null,[l("配合 "),o("code",null,"wrap"),l(" 与 "),o("code",null,"item-style"),l(" 或者 "),o("code",null,"item-class"),l(" 实现响应式布局")],-1)),u(e(n(b),null,null,512),[[c,s.value]]),e(i,null,{default:r(()=>[e(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[5]||(t[5]=()=>{s.value=!1}),vueCode:n(T)},{vue:r(()=>[e(n(v))]),_:1},8,["vueCode"])]),_:1}),t[18]||(t[18]=o("h3",{id:"底部内容",tabindex:"-1"},[l("底部内容 "),o("a",{class:"header-anchor",href:"#底部内容","aria-label":'Permalink to "底部内容"'},"​")],-1)),t[19]||(t[19]=o("p",null,[l("使用 "),o("code",null,"footer"),l(" 插槽，给 Prompts 列表底部添加内容")],-1)),u(e(n(b),null,null,512),[[c,s.value]]),e(i,null,{default:r(()=>[e(n(h),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[6]||(t[6]=()=>{s.value=!1}),vueCode:n(k)},{vue:r(()=>[e(n(f))]),_:1},8,["vueCode"])]),_:1}),t[20]||(t[20]=z('<h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="promptprops" tabindex="-1">PromptProps <a class="header-anchor" href="#promptprops" aria-label="Permalink to &quot;PromptProps&quot;">​</a></h3><p>单个提示项的属性配置。</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>必填</th><th>说明</th></tr></thead><tbody><tr><td><code>label</code></td><td><code>string</code></td><td>是</td><td>提示标签，显示提示的主要内容</td></tr><tr><td><code>id</code></td><td><code>string</code></td><td>否</td><td>唯一标识用于区分每个提示项，用于 Prompts 列表。如果不传此参数，则使用 index 作为 key</td></tr><tr><td><code>description</code></td><td><code>string</code></td><td>否</td><td>提示描述，提供额外的信息</td></tr><tr><td><code>icon</code></td><td><code>VNode</code></td><td>否</td><td>提示图标，显示在提示项的左侧</td></tr><tr><td><code>disabled</code></td><td><code>boolean</code></td><td>否</td><td>是否禁用，默认 <code>false</code></td></tr><tr><td><code>badge</code></td><td><code>string | VNode</code></td><td>否</td><td>提示徽章，显示在提示项的右上角</td></tr></tbody></table><h3 id="promptsprops" tabindex="-1">PromptsProps <a class="header-anchor" href="#promptsprops" aria-label="Permalink to &quot;PromptsProps&quot;">​</a></h3><p>提示列表组件的属性配置。</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>必填</th><th>说明</th></tr></thead><tbody><tr><td><code>items</code></td><td><code>PromptProps[]</code></td><td>是</td><td>包含多个提示项的列表</td></tr><tr><td><code>itemStyle</code></td><td><code>string | CSSProperties</code></td><td>否</td><td>自定义样式，用于各个提示项的不同部分</td></tr><tr><td><code>itemClass</code></td><td><code>string | string[]</code></td><td>否</td><td>自定义类名，用于各个提示项的不同部分</td></tr><tr><td><code>vertical</code></td><td><code>boolean</code></td><td>否</td><td>提示列表是否垂直排列，默认 <code>false</code></td></tr><tr><td><code>wrap</code></td><td><code>boolean</code></td><td>否</td><td>提示列表是否折行，默认 <code>false</code></td></tr></tbody></table><h3 id="promptsevents" tabindex="-1">PromptsEvents <a class="header-anchor" href="#promptsevents" aria-label="Permalink to &quot;PromptsEvents&quot;">​</a></h3><p>提示列表组件的事件定义。</p><table tabindex="0"><thead><tr><th>事件名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>item-click</code></td><td><code>(ev: MouseEvent, item: PromptProps)</code></td><td>当点击提示项时触发</td></tr></tbody></table><h3 id="promptsslots" tabindex="-1">PromptsSlots <a class="header-anchor" href="#promptsslots" aria-label="Permalink to &quot;PromptsSlots&quot;">​</a></h3><p>提示列表组件的插槽定义。</p><table tabindex="0"><thead><tr><th>插槽名</th><th>说明</th></tr></thead><tbody><tr><td><code>footer</code></td><td>底部插槽，用于在提示列表底部添加自定义内容</td></tr></tbody></table>',13))])}}});export{U as __pageData,E as default};
