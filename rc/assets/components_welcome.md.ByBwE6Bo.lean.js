const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/footer.BkhbY6mK.js","assets/chunks/theme.i2e4G7nn.js","assets/chunks/framework.D9iQNV5u.js","assets/chunks/align.CKN2Osw1.js","assets/chunks/basic.BsGG4ffh.js"])))=>i.map(i=>d[i]);
import{aD as p,bQ as m,aZ as g,aL as T,v as w,H as W,bL as h,bB as b,J as t,bk as o,bJ as i,G as y,w as a,I as r,b7 as f,aU as k}from"./chunks/framework.D9iQNV5u.js";import{L as v,N as _}from"./chunks/index.Bp548Vg5.js";const S=`<template>
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
`,A=`<template>
  <tr-welcome
    title="TinyRobot"
    description="您好，我是TinyRobot，您专属的 AI 智能专家"
    :icon="icon"
    :align="align"
  ></tr-welcome>
  <hr />
  <div style="display: flex; align-items: center">
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
`,Z=`<template>
  <tr-welcome title="TinyRobot2" description="您好，我是TinyRobot，您专属的 AI 智能专家" :icon="icon"></tr-welcome>
</template>

<script setup lang="ts">
import { TrWelcome } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const icon = h('span', { style: { fontSize: '56px', lineHeight: '64px' } as CSSProperties }, '🤖')
<\/script>
`,L=JSON.parse('{"title":"Welcome","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/welcome.md","filePath":"components/welcome.md"}'),x={name:"components/welcome.md"},P=Object.assign(x,{setup(D){const d=f();p(async()=>{d.value=(await m(async()=>{const{default:l}=await import("./chunks/footer.BkhbY6mK.js");return{default:l}},__vite__mapDeps([0,1,2]))).default});const s=f();p(async()=>{s.value=(await m(async()=>{const{default:l}=await import("./chunks/align.CKN2Osw1.js");return{default:l}},__vite__mapDeps([3,1,2]))).default});const n=k(!0),c=f();return p(async()=>{c.value=(await m(async()=>{const{default:l}=await import("./chunks/basic.BsGG4ffh.js");return{default:l}},__vite__mapDeps([4,1,2]))).default}),(l,e)=>{const u=g("ClientOnly");return T(),w("div",null,[e[3]||(e[3]=W("",5)),h(t(o(v),null,null,512),[[b,n.value]]),t(u,null,{default:i(()=>[t(o(_),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{n.value=!1}),vueCode:o(Z)},y({_:2},[c.value?{name:"vue",fn:i(()=>[t(o(c))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[4]||(e[4]=a("h3",{id:"对齐方向",tabindex:"-1"},[r("对齐方向 "),a("a",{class:"header-anchor",href:"#对齐方向","aria-label":'Permalink to "对齐方向"'},"​")],-1)),e[5]||(e[5]=a("p",null,[r("通过 "),a("code",null,"align"),r(" 属性设置对齐方向")],-1)),h(t(o(v),null,null,512),[[b,n.value]]),t(u,null,{default:i(()=>[t(o(_),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{n.value=!1}),vueCode:o(A)},y({_:2},[s.value?{name:"vue",fn:i(()=>[t(o(s))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[6]||(e[6]=a("h3",{id:"底部内容",tabindex:"-1"},[r("底部内容 "),a("a",{class:"header-anchor",href:"#底部内容","aria-label":'Permalink to "底部内容"'},"​")],-1)),e[7]||(e[7]=a("p",null,[r("使用 "),a("code",null,"footer"),r(" 插槽，给 Welcome 底部添加内容")],-1)),h(t(o(v),null,null,512),[[b,n.value]]),t(u,null,{default:i(()=>[t(o(_),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{n.value=!1}),vueCode:o(S)},y({_:2},[d.value?{name:"vue",fn:i(()=>[t(o(d))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[8]||(e[8]=W("",4))])}}});export{L as __pageData,P as default};
