const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/footer.pUjPFMLv.js","assets/chunks/index.BH-lwJjM.js","assets/chunks/framework.VUT5-8yJ.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/align.Di-ChX4A.js","assets/chunks/index.D8hw7RQS.js","assets/chunks/index.DKID6BLY.js","assets/chunks/index.BOD-uldB.js","assets/chunks/help-circle.BKviG7aU.js","assets/chunks/index.BVQd9tnS.js","assets/chunks/basic.Bp8AedXQ.js"])))=>i.map(i=>d[i]);
import{D as p,v as m,V as h,p as g,C as T,c as x,o as k,ah as W,ag as f,G as t,j as o,ai as y,k as a,w as i,aj as b,a as d}from"./chunks/framework.VUT5-8yJ.js";import{O as v,E as _}from"./chunks/index.BITB4gIy.js";const w=`<template>
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
`,S=`<template>
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
`,Z=`<template>
  <tr-welcome title="盘古助手2" description="您好，我是盘古助手，您专属的华为云专家" :icon="icon"></tr-welcome>
</template>

<script setup lang="tsx">
import { TrWelcome } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const icon = h('span', { style: { fontSize: '56px', lineHeight: '64px' } as CSSProperties }, '🤖')
<\/script>
`,B=JSON.parse('{"title":"Welcome","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/welcome.md","filePath":"components/welcome.md"}'),C={name:"components/welcome.md"},L=Object.assign(C,{setup(A){const r=p();m(async()=>{r.value=(await h(async()=>{const{default:l}=await import("./chunks/footer.pUjPFMLv.js");return{default:l}},__vite__mapDeps([0,1,2,3]))).default});const s=p();m(async()=>{s.value=(await h(async()=>{const{default:l}=await import("./chunks/align.Di-ChX4A.js");return{default:l}},__vite__mapDeps([4,1,2,3,5,6,7,8,9]))).default});const n=g(!0),c=p();return m(async()=>{c.value=(await h(async()=>{const{default:l}=await import("./chunks/basic.Bp8AedXQ.js");return{default:l}},__vite__mapDeps([10,1,2,3]))).default}),(l,e)=>{const u=T("ClientOnly");return k(),x("div",null,[e[3]||(e[3]=W("",5)),f(t(a(v),null,null,512),[[y,n.value]]),t(u,null,{default:i(()=>[t(a(_),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[0]||(e[0]=()=>{n.value=!1}),vueCode:a(Z)},b({_:2},[c.value?{name:"vue",fn:i(()=>[t(a(c))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[4]||(e[4]=o("h3",{id:"对齐方向",tabindex:"-1"},[d("对齐方向 "),o("a",{class:"header-anchor",href:"#对齐方向","aria-label":'Permalink to "对齐方向"'},"​")],-1)),e[5]||(e[5]=o("p",null,[d("通过 "),o("code",null,"align"),d(" 属性设置对齐方向")],-1)),f(t(a(v),null,null,512),[[y,n.value]]),t(u,null,{default:i(()=>[t(a(_),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[1]||(e[1]=()=>{n.value=!1}),vueCode:a(S)},b({_:2},[s.value?{name:"vue",fn:i(()=>[t(a(s))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[6]||(e[6]=o("h3",{id:"底部内容",tabindex:"-1"},[d("底部内容 "),o("a",{class:"header-anchor",href:"#底部内容","aria-label":'Permalink to "底部内容"'},"​")],-1)),e[7]||(e[7]=o("p",null,[d("使用 "),o("code",null,"footer"),d(" 插槽，给 Welcome 底部添加内容")],-1)),f(t(a(v),null,null,512),[[y,n.value]]),t(u,null,{default:i(()=>[t(a(_),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[2]||(e[2]=()=>{n.value=!1}),vueCode:a(w)},b({_:2},[r.value?{name:"vue",fn:i(()=>[t(a(r))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[8]||(e[8]=W("",5))])}}});export{B as __pageData,L as default};
