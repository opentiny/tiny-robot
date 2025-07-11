const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/footer.NgedohWX.js","assets/chunks/index.CQnIaLgy.js","assets/chunks/framework.kTfunus-.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/align.CzZahLbJ.js","assets/chunks/index.BdpCrDlP.js","assets/chunks/index.DKVCnifJ.js","assets/chunks/help-circle.DZYgQKry.js","assets/chunks/index.BwQVmJhW.js","assets/chunks/basic.Cfy-vIhg.js"])))=>i.map(i=>d[i]);
import{p as r,v as c,V as u,C as W,c as g,o as C,ag as y,ah as p,G as t,j as o,ai as m,k as l,w as d,a as i}from"./chunks/framework.kTfunus-.js";import{O as h,E as b}from"./chunks/index.Bs5OpVoR.js";const T=`<template>
  <tr-welcome title="盘古助手" description="您好，我是盘古助手，您专属的华为云专家" :icon="icon">
    <template #footer>
      <div class="welcome-footer">
        <span>根据相关法律法规要求，您需要先<a>登录</a>，若没有帐号，您可前往<a>注册</a></span>
      </div>
    </template>
  </tr-welcome>
</template>

<script setup lang="tsx">
import { TrWelcome } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const icon = h('span', { style: { fontSize: '56px', lineHeight: '64px' } as CSSProperties }, '🤖')
<\/script>

<style lang="less" scoped>
.welcome-footer {
  margin-top: 12px;
  color: rgb(128, 128, 128);
  font-size: 12px;
  line-height: 20px;
}
</style>
`,w=`<template>
  <tr-welcome
    title="盘古助手"
    description="您好，我是盘古助手，您专属的华为云专家"
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
`,N=`<template>
  <tr-welcome title="盘古助手2" description="您好，我是盘古助手，您专属的华为云专家" :icon="icon"></tr-welcome>
</template>

<script setup lang="tsx">
import { TrWelcome } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const icon = h('span', { style: { fontSize: '56px', lineHeight: '64px' } as CSSProperties }, '🤖')
<\/script>
`,D=JSON.parse('{"title":"Welcome","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/welcome.md","filePath":"components/welcome.md"}'),x={name:"components/welcome.md"},G=Object.assign(x,{setup(S){const v=r();c(async()=>{v.value=(await u(async()=>{const{default:n}=await import("./chunks/footer.NgedohWX.js");return{default:n}},__vite__mapDeps([0,1,2,3]))).default});const f=r();c(async()=>{f.value=(await u(async()=>{const{default:n}=await import("./chunks/align.CzZahLbJ.js");return{default:n}},__vite__mapDeps([4,1,2,3,5,6,7,8]))).default});const a=r(!0),_=r();return c(async()=>{_.value=(await u(async()=>{const{default:n}=await import("./chunks/basic.Cfy-vIhg.js");return{default:n}},__vite__mapDeps([9,1,2,3]))).default}),(n,e)=>{const s=W("ClientOnly");return C(),g("div",null,[e[3]||(e[3]=y("",5)),p(t(l(h),null,null,512),[[m,a.value]]),t(s,null,{default:d(()=>[t(l(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[0]||(e[0]=()=>{a.value=!1}),vueCode:l(N)},{vue:d(()=>[t(l(_))]),_:1},8,["vueCode"])]),_:1}),e[4]||(e[4]=o("h3",{id:"对齐方向",tabindex:"-1"},[i("对齐方向 "),o("a",{class:"header-anchor",href:"#对齐方向","aria-label":'Permalink to "对齐方向"'},"​")],-1)),e[5]||(e[5]=o("p",null,[i("通过 "),o("code",null,"align"),i(" 属性设置对齐方向")],-1)),p(t(l(h),null,null,512),[[m,a.value]]),t(s,null,{default:d(()=>[t(l(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[1]||(e[1]=()=>{a.value=!1}),vueCode:l(w)},{vue:d(()=>[t(l(f))]),_:1},8,["vueCode"])]),_:1}),e[6]||(e[6]=o("h3",{id:"底部内容",tabindex:"-1"},[i("底部内容 "),o("a",{class:"header-anchor",href:"#底部内容","aria-label":'Permalink to "底部内容"'},"​")],-1)),e[7]||(e[7]=o("p",null,[i("使用 "),o("code",null,"footer"),i(" 插槽，给 Welcome 底部添加内容")],-1)),p(t(l(h),null,null,512),[[m,a.value]]),t(s,null,{default:d(()=>[t(l(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[2]||(e[2]=()=>{a.value=!1}),vueCode:l(T)},{vue:d(()=>[t(l(v))]),_:1},8,["vueCode"])]),_:1}),e[8]||(e[8]=y("",5))])}}});export{D as __pageData,G as default};
