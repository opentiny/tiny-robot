const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/footer.BXzychj9.js","assets/chunks/theme.7L8HYfI8.js","assets/chunks/framework.CUa_Cx66.js","assets/chunks/align.C_a4ng0s.js","assets/chunks/basic.B6rWlUU0.js"])))=>i.map(i=>d[i]);
import{aD as p,bQ as m,aZ as g,aL as T,v as w,H as W,bL as h,bB as y,J as t,bk as o,bJ as r,G as b,w as n,I as i,b7 as f,aU as k}from"./chunks/framework.CUa_Cx66.js";import{L as v,N as _}from"./chunks/index.C4PESc4f.js";const x=`<template>
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
`,L=JSON.parse('{"title":"Welcome","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/welcome.md","filePath":"components/welcome.md"}'),Z={name:"components/welcome.md"},P=Object.assign(Z,{setup(D){const d=f();p(async()=>{d.value=(await m(async()=>{const{default:l}=await import("./chunks/footer.BXzychj9.js");return{default:l}},__vite__mapDeps([0,1,2]))).default});const s=f();p(async()=>{s.value=(await m(async()=>{const{default:l}=await import("./chunks/align.C_a4ng0s.js");return{default:l}},__vite__mapDeps([3,1,2]))).default});const a=k(!0),c=f();return p(async()=>{c.value=(await m(async()=>{const{default:l}=await import("./chunks/basic.B6rWlUU0.js");return{default:l}},__vite__mapDeps([4,1,2]))).default}),(l,e)=>{const u=g("ClientOnly");return T(),w("div",null,[e[3]||(e[3]=W("",5)),h(t(o(v),null,null,512),[[y,a.value]]),t(u,null,{default:r(()=>[t(o(_),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{a.value=!1}),vueCode:o(A)},b({_:2},[c.value?{name:"vue",fn:r(()=>[t(o(c))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[4]||(e[4]=n("h3",{id:"对齐方向",tabindex:"-1"},[i("对齐方向 "),n("a",{class:"header-anchor",href:"#对齐方向","aria-label":'Permalink to "对齐方向"'},"​")],-1)),e[5]||(e[5]=n("p",null,[i("通过 "),n("code",null,"align"),i(" 属性设置对齐方向")],-1)),h(t(o(v),null,null,512),[[y,a.value]]),t(u,null,{default:r(()=>[t(o(_),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{a.value=!1}),vueCode:o(S)},b({_:2},[s.value?{name:"vue",fn:r(()=>[t(o(s))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[6]||(e[6]=n("h3",{id:"底部内容",tabindex:"-1"},[i("底部内容 "),n("a",{class:"header-anchor",href:"#底部内容","aria-label":'Permalink to "底部内容"'},"​")],-1)),e[7]||(e[7]=n("p",null,[i("使用 "),n("code",null,"footer"),i(" 插槽，给 Welcome 底部添加内容")],-1)),h(t(o(v),null,null,512),[[y,a.value]]),t(u,null,{default:r(()=>[t(o(_),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{a.value=!1}),vueCode:o(x)},b({_:2},[d.value?{name:"vue",fn:r(()=>[t(o(d))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[8]||(e[8]=W("",4))])}}});export{L as __pageData,P as default};
