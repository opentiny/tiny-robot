const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/footer.lhdPL714.js","assets/chunks/theme.CG-bv-bL.js","assets/chunks/framework.6DE2p-7l.js","assets/chunks/align.DhNTIhc2.js","assets/chunks/basic.IUYUixPS.js"])))=>i.map(i=>d[i]);
import{aV as p,_ as m,bg as W,b1 as T,G as w,O as g,cn as h,cb as y,Q as t,bH as o,cl as r,N as b,y as n,P as i,bq as f,bb as x}from"./chunks/framework.6DE2p-7l.js";import{L as v,N as _}from"./chunks/index.DWSLKOW8.js";const k=`<template>
  <tr-welcome title="TinyRobot" description="您好，我是TinyRobot，您专属的 AI 智能专家" :icon="icon">
    <template #footer>
      <div class="welcome-footer">
        <span>根据相关法律法规要求，您需要先<a>登录</a>，若没有帐号，您可前往<a>注册</a></span>
      </div>
    </template>
  </tr-welcome>
</template>

<script setup lang="ts">
import { TrWelcome } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const icon = h('span', { style: { fontSize: '56px', lineHeight: '64px' } as CSSProperties }, '🤖')
<\/script>

<style scoped>
.welcome-footer {
  margin-top: 12px;
  color: rgb(128, 128, 128);
  font-size: 12px;
  line-height: 20px;
}
</style>
`,S=`<template>
  <tr-welcome
    title="TinyRobot"
    description="您好，我是TinyRobot，您专属的 AI 智能专家"
    :icon="icon"
    :align="align"
  ></tr-welcome>
  <hr />
  <div class="align-controls">
    <label>对齐方向：</label>
    <tiny-radio-group v-model="align">
      <tiny-radio label="left">left</tiny-radio>
      <tiny-radio label="center">center</tiny-radio>
      <tiny-radio label="right">right</tiny-radio>
    </tiny-radio-group>
  </div>
</template>

<script setup lang="ts">
import { TrWelcome } from '@opentiny/tiny-robot'
import { TinyRadio, TinyRadioGroup } from '@opentiny/vue'
import { CSSProperties, h, ref } from 'vue'

const icon = h('span', { style: { fontSize: '56px', lineHeight: '64px' } as CSSProperties }, '🤖')

const align = ref('left')
<\/script>

<style lang="less" scoped>
.align-controls {
  display: flex;
  align-items: center;
  color: var(--tr-text-primary);

  :deep(.tiny-radio) {
    --tv-Radio-text-color: var(--tr-text-primary);
  }
}
</style>
`,A=`<template>
  <tr-welcome title="TinyRobot2" description="您好，我是TinyRobot，您专属的 AI 智能专家" :icon="icon"></tr-welcome>
</template>

<script setup lang="ts">
import { TrWelcome } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const icon = h('span', { style: { fontSize: '56px', lineHeight: '64px' } as CSSProperties }, '🤖')
<\/script>
`,P=JSON.parse('{"title":"Welcome","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/welcome.md","filePath":"components/welcome.md"}'),Z={name:"components/welcome.md"},L=Object.assign(Z,{setup(D){const d=f();p(async()=>{d.value=(await m(async()=>{const{default:l}=await import("./chunks/footer.lhdPL714.js");return{default:l}},__vite__mapDeps([0,1,2]))).default});const s=f();p(async()=>{s.value=(await m(async()=>{const{default:l}=await import("./chunks/align.DhNTIhc2.js");return{default:l}},__vite__mapDeps([3,1,2]))).default});const a=x(!0),c=f();return p(async()=>{c.value=(await m(async()=>{const{default:l}=await import("./chunks/basic.IUYUixPS.js");return{default:l}},__vite__mapDeps([4,1,2]))).default}),(l,e)=>{const u=W("ClientOnly");return T(),w("div",null,[e[3]||(e[3]=g('<h1 id="welcome" tabindex="-1">Welcome <a class="header-anchor" href="#welcome" aria-label="Permalink to &quot;Welcome&quot;">​</a></h1><p>Welcome 是一个用于展示欢迎信息的通用组件，包含标题、描述、图标等内容。 组件支持自定义对齐方向、图标、底部内容等功能。</p><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基本" tabindex="-1">基本 <a class="header-anchor" href="#基本" aria-label="Permalink to &quot;基本&quot;">​</a></h3><p>基础用法</p>',5)),h(t(o(v),null,null,512),[[y,a.value]]),t(u,null,{default:r(()=>[t(o(_),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{a.value=!1}),vueCode:o(A)},b({_:2},[c.value?{name:"vue",fn:r(()=>[t(o(c))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[4]||(e[4]=n("h3",{id:"对齐方向",tabindex:"-1"},[i("对齐方向 "),n("a",{class:"header-anchor",href:"#对齐方向","aria-label":'Permalink to "对齐方向"'},"​")],-1)),e[5]||(e[5]=n("p",null,[i("通过 "),n("code",null,"align"),i(" 属性设置对齐方向")],-1)),h(t(o(v),null,null,512),[[y,a.value]]),t(u,null,{default:r(()=>[t(o(_),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{a.value=!1}),vueCode:o(S)},b({_:2},[s.value?{name:"vue",fn:r(()=>[t(o(s))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[6]||(e[6]=n("h3",{id:"底部内容",tabindex:"-1"},[i("底部内容 "),n("a",{class:"header-anchor",href:"#底部内容","aria-label":'Permalink to "底部内容"'},"​")],-1)),e[7]||(e[7]=n("p",null,[i("使用 "),n("code",null,"footer"),i(" 插槽，给 Welcome 底部添加内容")],-1)),h(t(o(v),null,null,512),[[y,a.value]]),t(u,null,{default:r(()=>[t(o(_),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{a.value=!1}),vueCode:o(k)},b({_:2},[d.value?{name:"vue",fn:r(()=>[t(o(d))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[8]||(e[8]=g('<h2 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h2><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>必填</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>title</code></td><td><code>string</code></td><td>是</td><td>-</td><td>标题</td></tr><tr><td><code>description</code></td><td><code>string</code></td><td>是</td><td>-</td><td>标题描述</td></tr><tr><td><code>align</code></td><td><code>&#39;left&#39; | &#39;center&#39; | &#39;right&#39;</code></td><td>否</td><td><code>&#39;center&#39;</code></td><td>内容对齐方式</td></tr><tr><td><code>icon</code></td><td><code>VNode</code></td><td>否</td><td>-</td><td>自定义图标节点，支持 Vue 组件或 JSX</td></tr></tbody></table><h2 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h2><table tabindex="0"><thead><tr><th>插槽名</th><th>说明</th></tr></thead><tbody><tr><td><code>footer</code></td><td>组件底部内容插槽</td></tr></tbody></table>',4))])}}});export{P as __pageData,L as default};
