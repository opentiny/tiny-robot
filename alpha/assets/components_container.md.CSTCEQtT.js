const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/basic.Cocu8HcG.js","assets/chunks/index.BPopbeGN.js","assets/chunks/framework.VUT5-8yJ.js","assets/chunks/tiny-robot-svgs.0wLZSGWQ.js","assets/chunks/index.BH8J1JeV.js","assets/chunks/utils.BxFdpG70.js","assets/chunks/index3.TWDCajl8.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/tiny-robot-svgs.CEfedB12.js","assets/chunks/index.C-_cmAPW.js","assets/chunks/index.DKID6BLY.js","assets/chunks/loading-shadow.wWFOIFgP.js"])))=>i.map(i=>d[i]);
import{p as s,D as c,v as h,V as p,C as u,c as m,o as f,ah as d,ag as _,G as e,ai as b,k as o,w as l,aj as v}from"./chunks/framework.VUT5-8yJ.js";import{O as y,E as w}from"./chunks/index.BITB4gIy.js";const T=`<template>
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
`,S=JSON.parse('{"title":"Container 容器","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/container.md","filePath":"components/container.md"}'),x={name:"components/container.md"},D=Object.assign(x,{setup(P){const n=s(!0),a=c();return h(async()=>{a.value=(await p(async()=>{const{default:r}=await import("./chunks/basic.Cocu8HcG.js");return{default:r}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11]))).default}),(r,t)=>{const i=u("ClientOnly");return f(),m("div",null,[t[1]||(t[1]=d('<h1 id="container-容器" tabindex="-1">Container 容器 <a class="header-anchor" href="#container-容器" aria-label="Permalink to &quot;Container 容器&quot;">​</a></h1><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基本示例" tabindex="-1">基本示例 <a class="header-anchor" href="#基本示例" aria-label="Permalink to &quot;基本示例&quot;">​</a></h3>',3)),_(e(o(y),null,null,512),[[b,n.value]]),e(i,null,{default:l(()=>[e(o(w),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[0]||(t[0]=()=>{n.value=!1}),vueCode:o(T)},v({_:2},[a.value?{name:"vue",fn:l(()=>[e(o(a))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[2]||(t[2]=d('<h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Prop Name</th><th>Description</th><th>Type</th><th>Required</th><th>Default</th></tr></thead><tbody><tr><td><code>model:show</code></td><td>是否显示容器</td><td><code>boolean</code></td><td>✅</td><td>—</td></tr><tr><td><code>model:fullscreen</code></td><td>是否全屏模式</td><td><code>boolean</code></td><td>❌</td><td><code>false</code></td></tr></tbody></table><hr><h3 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Slot Name</th><th>Description</th></tr></thead><tbody><tr><td><code>default</code></td><td>容器主体内容</td></tr><tr><td><code>title</code></td><td>自定义标题区域内容</td></tr><tr><td><code>operations</code></td><td>标题栏右侧操作区</td></tr><tr><td><code>footer</code></td><td>底部操作栏内容</td></tr></tbody></table>',6))])}}});export{S as __pageData,D as default};
