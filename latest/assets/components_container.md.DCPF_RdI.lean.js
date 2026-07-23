const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/basic.DjchViMM.js","assets/chunks/theme.BgXP30Ey.js","assets/chunks/framework.DU7FgoRM.js"])))=>i.map(i=>d[i]);
import{aD as l,bQ as h,aZ as c,aL as p,v as k,H as d,bL as u,bB as b,J as e,bk as n,bJ as o,G as y,b7 as f,aU as g}from"./chunks/framework.DU7FgoRM.js";import{L as m,N as E}from"./chunks/index.jCZUXNFC.js";const v=`<template>
  <tr-container v-model:show="show" v-model:fullscreen="fullscreen">
    <!-- 默认插槽 -->
    <div class="content">
      <p v-for="i in 20" :key="i">测试文本</p>
    </div>
    <!-- operations插槽 -->
    <template #operations>
      <tr-icon-button size="28" svg-size="20" :icon="IconNewSession" />
    </template>
    <!-- footer插槽 -->
    <template #footer>
      <div class="footer">这是 footer</div>
    </template>
  </tr-container>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <div>
      <label>show：</label>
      <tiny-switch v-model="show"></tiny-switch>
    </div>
    <div>
      <label>fullscreen：</label>
      <tiny-switch v-model="fullscreen"></tiny-switch>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrContainer, TrIconButton } from '@opentiny/tiny-robot'
import { IconNewSession } from '@opentiny/tiny-robot-svgs'
import { TinySwitch } from '@opentiny/vue'
import { ref } from 'vue'

const show = ref(false)
const fullscreen = ref(false)
<\/script>

<style scoped>
.content {
  padding: 0 24px;
}

.footer {
  padding: 16px 24px;
}

.fullscreen {
  @media (min-width: 1280px) {
    .content,
    .footer {
      width: 1280px;
      margin: 0 auto;
    }
  }
}
</style>
`,w=JSON.parse('{"title":"Container 容器","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/container.md","filePath":"components/container.md"}'),_={name:"components/container.md"},B=Object.assign(_,{setup(C){const s=g(!0),a=f();return l(async()=>{a.value=(await h(async()=>{const{default:i}=await import("./chunks/basic.DjchViMM.js");return{default:i}},__vite__mapDeps([0,1,2]))).default}),(i,t)=>{const r=c("ClientOnly");return p(),k("div",null,[t[1]||(t[1]=d("",4)),u(e(n(m),null,null,512),[[b,s.value]]),e(r,null,{default:o(()=>[e(n(E),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{s.value=!1}),vueCode:n(v)},y({_:2},[a.value?{name:"vue",fn:o(()=>[e(n(a))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[2]||(t[2]=d("",17))])}}});export{w as __pageData,B as default};
