const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/footer.BxA8WOUz.js","assets/chunks/theme.MY0DDsqj.js","assets/chunks/framework.Dw8jt1Jz.js","assets/chunks/align.DG_QBchF.js","assets/chunks/basic.DyXa5GlY.js"])))=>i.map(i=>d[i]);
import{aD as p,aZ as w,aL as W,v as S,H as T,bL as m,bB as h,J as t,bk as o,bJ as d,G as f,w as l,I as r,aU as g,b7 as y,bQ as b}from"./chunks/framework.Dw8jt1Jz.js";import{L as v,N as _}from"./chunks/index.DDu3Iq4c.js";const j=`<template>
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
`,Z=`<template>
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
`,M=`<template>
  <tr-welcome title="TinyRobot2" description="您好，我是TinyRobot，您专属的 AI 智能专家" :icon="icon"></tr-welcome>
</template>

<script setup lang="ts">
import { TrWelcome } from '@opentiny/tiny-robot'
import { CSSProperties, h } from 'vue'

const icon = h('span', { style: { fontSize: '56px', lineHeight: '64px' } as CSSProperties }, '🤖')
<\/script>
`,D=JSON.parse('{"title":"Welcome","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/welcome.md","filePath":"components/welcome.md"}'),A={name:"components/welcome.md"},L=Object.assign(A,{setup(k){const i=y();p(async()=>{i.value=(await b(async()=>{const{default:a}=await import("./chunks/footer.BxA8WOUz.js");return{default:a}},__vite__mapDeps([0,1,2]))).default});const s=y();p(async()=>{s.value=(await b(async()=>{const{default:a}=await import("./chunks/align.DG_QBchF.js");return{default:a}},__vite__mapDeps([3,1,2]))).default});const n=g(!0),c=y();return p(async()=>{c.value=(await b(async()=>{const{default:a}=await import("./chunks/basic.DyXa5GlY.js");return{default:a}},__vite__mapDeps([4,1,2]))).default}),(a,e)=>{const u=w("ClientOnly");return W(),S("div",null,[e[3]||(e[3]=T("",5)),m(t(o(v),null,null,512),[[h,n.value]]),t(u,null,{default:d(()=>[t(o(_),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{n.value=!1}),vueCode:o(M)},f({_:2},[c.value?{name:"vue",fn:d(()=>[t(o(c))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[4]||(e[4]=l("h3",{id:"对齐方向",tabindex:"-1"},[r("对齐方向 "),l("a",{class:"header-anchor",href:"#对齐方向","aria-label":'Permalink to "对齐方向"'},"​")],-1)),e[5]||(e[5]=l("p",null,[r("通过 "),l("code",null,"align"),r(" 属性设置对齐方向")],-1)),m(t(o(v),null,null,512),[[h,n.value]]),t(u,null,{default:d(()=>[t(o(_),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{n.value=!1}),vueCode:o(Z)},f({_:2},[s.value?{name:"vue",fn:d(()=>[t(o(s))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[6]||(e[6]=l("h3",{id:"底部内容",tabindex:"-1"},[r("底部内容 "),l("a",{class:"header-anchor",href:"#底部内容","aria-label":'Permalink to "底部内容"'},"​")],-1)),e[7]||(e[7]=l("p",null,[r("使用 "),l("code",null,"footer"),r(" 插槽，给 Welcome 底部添加内容")],-1)),m(t(o(v),null,null,512),[[h,n.value]]),t(u,null,{default:d(()=>[t(o(_),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{n.value=!1}),vueCode:o(j)},f({_:2},[i.value?{name:"vue",fn:d(()=>[t(o(i))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[8]||(e[8]=T("",4))])}}});export{D as __pageData,L as default};
