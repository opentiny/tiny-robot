const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/basic.CBGswgFk.js","assets/chunks/index.BYLXfHN9.js","assets/chunks/framework.WjEkGhiu.js","assets/chunks/tiny-robot-svgs.Dnkbi6us.js","assets/chunks/index.4mTuZ42u.js","assets/chunks/utils.ayD70Qgn.js","assets/chunks/index3.BnOquABP.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/tiny-robot-svgs.B2XD9sQ_.js","assets/chunks/index.L57c4HSE.js","assets/chunks/index.DTUTkZ-1.js","assets/chunks/loading-shadow.BvaKwsHe.js"])))=>i.map(i=>d[i]);
import{p as s,D as c,v as h,V as p,C as u,c as m,o as f,ah as d,ag as _,G as e,ai as b,k as o,w as l,aj as v}from"./chunks/framework.WjEkGhiu.js";import{O as y,E as w}from"./chunks/index.DW9_sJEN.js";const T=`<template>
  <tr-container v-model:show="show" v-model:fullscreen="fullscreen">
    <!-- 默认插槽 -->
    <div style="padding: 0 24px">
      <p v-for="i in 20" :key="i">测试文本</p>
    </div>
    <!-- operations插槽 -->
    <template #operations>
      <tr-icon-button size="28" svg-size="20" :icon="IconNewSession" />
    </template>
    <!-- footer插槽 -->
    <template #footer>
      <div style="padding: 8px 24px; border-top: 1px solid rgb(0, 0, 0, 0.15)">footer</div>
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
`,S=JSON.parse('{"title":"Container 容器","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/container.md","filePath":"components/container.md"}'),x={name:"components/container.md"},D=Object.assign(x,{setup(P){const n=s(!0),a=c();return h(async()=>{a.value=(await p(async()=>{const{default:r}=await import("./chunks/basic.CBGswgFk.js");return{default:r}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11]))).default}),(r,t)=>{const i=u("ClientOnly");return f(),m("div",null,[t[1]||(t[1]=d("",3)),_(e(o(y),null,null,512),[[b,n.value]]),e(i,null,{default:l(()=>[e(o(w),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[0]||(t[0]=()=>{n.value=!1}),vueCode:o(T)},v({_:2},[a.value?{name:"vue",fn:l(()=>[e(o(a))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[2]||(t[2]=d("",6))])}}});export{S as __pageData,D as default};
