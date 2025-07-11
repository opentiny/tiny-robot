const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/basic.DWCW7kIG.js","assets/chunks/index.DKge4mlx.js","assets/chunks/framework.kTfunus-.js","assets/chunks/tiny-robot-svgs.BaAiG9Fu.js","assets/chunks/index.DM95O2dU.js","assets/chunks/utils.D1YSndqS.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/tiny-robot-svgs.Ct4S-7ct.js","assets/chunks/index.DRKSS0gm.js","assets/chunks/index.DKVCnifJ.js","assets/chunks/loading-shadow.lIjb6yma.js"])))=>i.map(i=>d[i]);
import{p as d,v as c,V as h,C as p,c as u,o as m,ag as r,ah as b,G as e,ai as _,k as o,w as i}from"./chunks/framework.kTfunus-.js";import{O as f,E as v}from"./chunks/index.Bs5OpVoR.js";const y=`<template>
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
`,N=JSON.parse('{"title":"Container 容器","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/container.md","filePath":"components/container.md"}'),w={name:"components/container.md"},P=Object.assign(w,{setup(T){const a=d(!0),n=d();return c(async()=>{n.value=(await h(async()=>{const{default:l}=await import("./chunks/basic.DWCW7kIG.js");return{default:l}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10]))).default}),(l,t)=>{const s=p("ClientOnly");return m(),u("div",null,[t[1]||(t[1]=r('<h1 id="container-容器" tabindex="-1">Container 容器 <a class="header-anchor" href="#container-容器" aria-label="Permalink to &quot;Container 容器&quot;">​</a></h1><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基本示例" tabindex="-1">基本示例 <a class="header-anchor" href="#基本示例" aria-label="Permalink to &quot;基本示例&quot;">​</a></h3>',3)),b(e(o(f),null,null,512),[[_,a.value]]),e(s,null,{default:i(()=>[e(o(v),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[0]||(t[0]=()=>{a.value=!1}),vueCode:o(y)},{vue:i(()=>[e(o(n))]),_:1},8,["vueCode"])]),_:1}),t[2]||(t[2]=r('<h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Prop Name</th><th>Description</th><th>Type</th><th>Required</th><th>Default</th></tr></thead><tbody><tr><td><code>model:show</code></td><td>是否显示容器</td><td><code>boolean</code></td><td>✅</td><td>—</td></tr><tr><td><code>model:fullscreen</code></td><td>是否全屏模式</td><td><code>boolean</code></td><td>❌</td><td><code>false</code></td></tr></tbody></table><hr><h3 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Slot Name</th><th>Description</th></tr></thead><tbody><tr><td><code>default</code></td><td>容器主体内容</td></tr><tr><td><code>title</code></td><td>自定义标题区域内容</td></tr><tr><td><code>operations</code></td><td>标题栏右侧操作区</td></tr><tr><td><code>footer</code></td><td>底部操作栏内容</td></tr></tbody></table>',6))])}}});export{N as __pageData,P as default};
