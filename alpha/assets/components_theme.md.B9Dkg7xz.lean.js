const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/Storage.GFJoBhJ9.js","assets/chunks/theme.7L8HYfI8.js","assets/chunks/framework.CUa_Cx66.js","assets/chunks/NestedTheme.CNAyQR8u.js","assets/chunks/ThemeComp.vue_vue_type_script_setup_true_lang.D7Xn2-W0.js","assets/chunks/ColorMode.BQHXJ6lY.js","assets/chunks/Theme.CUrR69iS.js"])))=>i.map(i=>d[i]);
import{aD as d,bQ as p,aZ as F,aL as y,v as D,H as l,bL as C,bB as h,J as t,bk as s,bJ as a,G as m,w as n,I as v,b7 as c,aU as b}from"./chunks/framework.CUa_Cx66.js";import{L as E,N as g}from"./chunks/index.C4PESc4f.js";const T=`<template>
  <div id="theme-provider-storage">
    <tr-theme-provider target-element="#theme-provider-storage" :storage="storage" :storage-key="storageKey">
      <Comp></Comp>
    </tr-theme-provider>
  </div>
</template>

<script setup lang="ts">
import { TrThemeProvider } from '@opentiny/tiny-robot'
import Comp from './StorageComp.vue'

const storage = localStorage
const storageKey = 'custom-theme-data-storage'
<\/script>

<style scoped>
[data-tr-theme='custom-theme'][data-tr-color-mode='light'] {
  --tr-prompt-bg: #fff7ed;
  --tr-prompt-bg-hover: rgba(249, 115, 22, 0.08);
  --tr-prompt-bg-active: rgba(249, 115, 22, 0.15);
  --tr-prompt-bg-disabled: rgba(249, 115, 22, 0.04);
  --tr-prompt-shadow: 0 2px 12px rgba(249, 115, 22, 0.08);
  --tr-prompt-title-color: #c2410c;
  --tr-prompt-description-color: #92400e;
}
[data-tr-theme='custom-theme'][data-tr-color-mode='dark'] {
  --tr-prompt-bg: #1c1917;
  --tr-prompt-bg-hover: rgba(249, 115, 22, 0.15);
  --tr-prompt-bg-active: rgba(249, 115, 22, 0.25);
  --tr-prompt-bg-disabled: rgba(249, 115, 22, 0.08);
  --tr-prompt-shadow: 0 2px 12px rgba(249, 115, 22, 0.15);
  --tr-prompt-title-color: #fed7aa;
  --tr-prompt-description-color: #fbbf24;
}
</style>
`,f=`<template>
  <div id="theme-provider-nested-one">
    <tr-theme-provider target-element="#theme-provider-nested-one" theme="custom-theme">
      <Comp></Comp>
      <hr />
      <div id="theme-provider-nested-two">
        <p>我在嵌套的 ThemeProvider 中，默认使用 TinyRobot 的默认主题</p>
        <tr-theme-provider target-element="#theme-provider-nested-two">
          <Comp></Comp>
        </tr-theme-provider>
      </div>
    </tr-theme-provider>
  </div>
</template>

<script setup lang="ts">
import { TrThemeProvider } from '@opentiny/tiny-robot'
import Comp from './ThemeComp.vue'
<\/script>

<style scoped>
#theme-provider-nested-one,
#theme-provider-nested-two {
  border: 1px solid #ccc;
  border-radius: 10px;
  padding: 10px;
}

[data-tr-theme='custom-theme'] {
  --tr-prompt-bg: #fff7ed;
  --tr-prompt-bg-hover: rgba(249, 115, 22, 0.08);
  --tr-prompt-bg-active: rgba(249, 115, 22, 0.15);
  --tr-prompt-bg-disabled: rgba(249, 115, 22, 0.04);
  --tr-prompt-shadow: 0 2px 12px rgba(249, 115, 22, 0.08);
  --tr-prompt-title-color: #c2410c;
  --tr-prompt-description-color: #92400e;
}
</style>
`,P=`<template>
  <div id="theme-provider-color-mode">
    <tr-theme-provider target-element="#theme-provider-color-mode">
      <Comp></Comp>
    </tr-theme-provider>
  </div>
</template>

<script setup lang="ts">
import { TrThemeProvider } from '@opentiny/tiny-robot'
import Comp from './ColorModeComp.vue'
<\/script>
`,_=`<template>
  <div id="theme-provider-theme">
    <tr-theme-provider target-element="#theme-provider-theme" theme="custom-theme">
      <Comp></Comp>
    </tr-theme-provider>
  </div>
</template>

<script setup lang="ts">
import { TrThemeProvider } from '@opentiny/tiny-robot'
import Comp from './ThemeComp.vue'
<\/script>

<style scoped>
[data-tr-theme='custom-theme'] {
  --tr-prompt-bg: #fff7ed;
  --tr-prompt-bg-hover: rgba(249, 115, 22, 0.08);
  --tr-prompt-bg-active: rgba(249, 115, 22, 0.15);
  --tr-prompt-bg-disabled: rgba(249, 115, 22, 0.04);
  --tr-prompt-shadow: 0 2px 12px rgba(249, 115, 22, 0.08);
  --tr-prompt-title-color: #c2410c;
  --tr-prompt-description-color: #92400e;
}
</style>
`,Z=JSON.parse('{"title":"Theme","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/theme.md","filePath":"components/theme.md"}'),S={name:"components/theme.md"},W=Object.assign(S,{setup(x){const k=c();d(async()=>{k.value=(await p(async()=>{const{default:i}=await import("./chunks/Storage.GFJoBhJ9.js");return{default:i}},__vite__mapDeps([0,1,2]))).default});const u=c();d(async()=>{u.value=(await p(async()=>{const{default:i}=await import("./chunks/NestedTheme.CNAyQR8u.js");return{default:i}},__vite__mapDeps([3,1,2,4]))).default});const B=c();d(async()=>{B.value=(await p(async()=>{const{default:i}=await import("./chunks/ColorMode.BQHXJ6lY.js");return{default:i}},__vite__mapDeps([5,1,2]))).default});const o=b(!0),A=c();return d(async()=>{A.value=(await p(async()=>{const{default:i}=await import("./chunks/Theme.CUrR69iS.js");return{default:i}},__vite__mapDeps([6,1,2,4]))).default}),(i,e)=>{const r=F("ClientOnly");return y(),D("div",null,[e[4]||(e[4]=l("",13)),C(t(s(E),null,null,512),[[h,o.value]]),t(r,null,{default:a(()=>[t(s(g),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22Theme.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftheme-provider%2FTheme.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20id%3D%5C%22theme-provider-theme%5C%22%3E%5Cn%20%20%20%20%3Ctr-theme-provider%20target-element%3D%5C%22%23theme-provider-theme%5C%22%20theme%3D%5C%22custom-theme%5C%22%3E%5Cn%20%20%20%20%20%20%3CComp%3E%3C%2FComp%3E%5Cn%20%20%20%20%3C%2Ftr-theme-provider%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrThemeProvider%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20Comp%20from%20'.%2FThemeComp.vue'%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn%5Bdata-tr-theme%3D'custom-theme'%5D%20%7B%5Cn%20%20--tr-prompt-bg%3A%20%23fff7ed%3B%5Cn%20%20--tr-prompt-bg-hover%3A%20rgba(249%2C%20115%2C%2022%2C%200.08)%3B%5Cn%20%20--tr-prompt-bg-active%3A%20rgba(249%2C%20115%2C%2022%2C%200.15)%3B%5Cn%20%20--tr-prompt-bg-disabled%3A%20rgba(249%2C%20115%2C%2022%2C%200.04)%3B%5Cn%20%20--tr-prompt-shadow%3A%200%202px%2012px%20rgba(249%2C%20115%2C%2022%2C%200.08)%3B%5Cn%20%20--tr-prompt-title-color%3A%20%23c2410c%3B%5Cn%20%20--tr-prompt-description-color%3A%20%2392400e%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22ThemeComp.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftheme-provider%2FThemeComp.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Ctr-prompts%20%3Aitems%3D%5C%22items%5C%22%20vertical%3E%3C%2Ftr-prompts%3E%5Cn%20%20%3Cp%3E%E5%BD%93%E5%89%8D%E4%B8%BB%E9%A2%98%EF%BC%9A%7B%7B%20theme%20%7D%7D%3C%2Fp%3E%5Cn%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20gap%3A%2010px%5C%22%3E%5Cn%20%20%20%20%3CSuggestionPillButton%20%40click%3D%5C%22setTheme('')%5C%22%3E%E5%88%87%E6%8D%A2%E5%88%B0%E9%BB%98%E8%AE%A4%E4%B8%BB%E9%A2%98%3C%2FSuggestionPillButton%3E%5Cn%20%20%20%20%3CSuggestionPillButton%20%40click%3D%5C%22setTheme('custom-theme')%5C%22%3E%E5%88%87%E6%8D%A2%E5%88%B0%E8%87%AA%E5%AE%9A%E4%B9%89%E4%B8%BB%E9%A2%98%3C%2FSuggestionPillButton%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20PromptProps%2C%20SuggestionPillButton%2C%20TrPrompts%2C%20useTheme%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20CSSProperties%2C%20h%20%7D%20from%20'vue'%5Cn%5Cnconst%20%7B%20setTheme%2C%20theme%20%7D%20%3D%20useTheme()%5Cn%5Cnconst%20items%3A%20PromptProps%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20label%3A%20'%E5%AD%A6%E4%B9%A0%2F%E7%9F%A5%E8%AF%86%E5%9E%8B%E5%9C%BA%E6%99%AF'%2C%5Cn%20%20%20%20description%3A%20'%E6%9C%89%E4%BB%80%E4%B9%88%E6%83%B3%E4%BA%86%E8%A7%A3%E7%9A%84%E5%90%97%EF%BC%9F%E5%8F%AF%E4%BB%A5%E6%98%AF%E2%80%9C%E9%87%8F%E5%AD%90%E5%8A%9B%E5%AD%A6%E7%AE%80%E4%BB%8B%E2%80%9D%E6%88%96%E2%80%9CVue3%20%E5%92%8C%20React%20%E7%9A%84%E5%8C%BA%E5%88%AB%E2%80%9D%EF%BC%81'%2C%5Cn%20%20%20%20icon%3A%20h('span'%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'18px'%20%7D%20as%20CSSProperties%20%7D%2C%20'%F0%9F%A4%94')%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%3C%2Fscript%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[0]||(e[0]=()=>{o.value=!1}),vueCode:s(_)},m({_:2},[A.value?{name:"vue",fn:a(()=>[t(s(A))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[5]||(e[5]=l("",3)),C(t(s(E),null,null,512),[[h,o.value]]),t(r,null,{default:a(()=>[t(s(g),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22ColorMode.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftheme-provider%2FColorMode.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20id%3D%5C%22theme-provider-color-mode%5C%22%3E%5Cn%20%20%20%20%3Ctr-theme-provider%20target-element%3D%5C%22%23theme-provider-color-mode%5C%22%3E%5Cn%20%20%20%20%20%20%3CComp%3E%3C%2FComp%3E%5Cn%20%20%20%20%3C%2Ftr-theme-provider%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrThemeProvider%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20Comp%20from%20'.%2FColorModeComp.vue'%5Cn%3C%2Fscript%3E%5Cn%22%7D%2C%22ColorModeComp.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftheme-provider%2FColorModeComp.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Ctr-prompts%20%3Aitems%3D%5C%22items%5C%22%20vertical%3E%3C%2Ftr-prompts%3E%5Cn%20%20%3Cp%3E%E5%BD%93%E5%89%8D%E9%A2%9C%E8%89%B2%E6%A8%A1%E5%BC%8F%EF%BC%9A%7B%7B%20colorMode%20%7D%7D%3C%2Fp%3E%5Cn%20%20%3Cp%3E%E5%BD%93%E5%89%8D%E8%A7%A3%E6%9E%90%E5%90%8E%E7%9A%84%E9%A2%9C%E8%89%B2%E6%A8%A1%E5%BC%8F%EF%BC%9A%7B%7B%20resolvedColorMode%20%7D%7D%3C%2Fp%3E%5Cn%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20gap%3A%2010px%5C%22%3E%5Cn%20%20%20%20%3CSuggestionPillButton%20%40click%3D%5C%22toggleColorMode%5C%22%3Etoggle%3C%2FSuggestionPillButton%3E%5Cn%20%20%20%20%3CSuggestionPillButton%20%40click%3D%5C%22setColorMode('dark')%5C%22%3Eset%20dark%3C%2FSuggestionPillButton%3E%5Cn%20%20%20%20%3CSuggestionPillButton%20%40click%3D%5C%22setColorMode('light')%5C%22%3Eset%20light%3C%2FSuggestionPillButton%3E%5Cn%20%20%20%20%3CSuggestionPillButton%20%40click%3D%5C%22setColorMode('auto')%5C%22%3Eset%20auto%3C%2FSuggestionPillButton%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20PromptProps%2C%20SuggestionPillButton%2C%20TrPrompts%2C%20useTheme%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20CSSProperties%2C%20h%20%7D%20from%20'vue'%5Cn%5Cnconst%20%7B%20colorMode%2C%20resolvedColorMode%2C%20toggleColorMode%2C%20setColorMode%20%7D%20%3D%20useTheme()%5Cn%5Cnconst%20items%3A%20PromptProps%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20label%3A%20'%E5%AD%A6%E4%B9%A0%2F%E7%9F%A5%E8%AF%86%E5%9E%8B%E5%9C%BA%E6%99%AF'%2C%5Cn%20%20%20%20description%3A%20'%E6%9C%89%E4%BB%80%E4%B9%88%E6%83%B3%E4%BA%86%E8%A7%A3%E7%9A%84%E5%90%97%EF%BC%9F%E5%8F%AF%E4%BB%A5%E6%98%AF%E2%80%9C%E9%87%8F%E5%AD%90%E5%8A%9B%E5%AD%A6%E7%AE%80%E4%BB%8B%E2%80%9D%E6%88%96%E2%80%9CVue3%20%E5%92%8C%20React%20%E7%9A%84%E5%8C%BA%E5%88%AB%E2%80%9D%EF%BC%81'%2C%5Cn%20%20%20%20icon%3A%20h('span'%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'18px'%20%7D%20as%20CSSProperties%20%7D%2C%20'%F0%9F%A4%94')%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%3C%2Fscript%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[1]||(e[1]=()=>{o.value=!1}),vueCode:s(P)},m({_:2},[B.value?{name:"vue",fn:a(()=>[t(s(B))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[6]||(e[6]=n("h2",{id:"嵌套主题",tabindex:"-1"},[v("嵌套主题 "),n("a",{class:"header-anchor",href:"#嵌套主题","aria-label":'Permalink to "嵌套主题"'},"​")],-1)),e[7]||(e[7]=n("p",null,[n("code",null,"ThemeProvider"),v(" 可以嵌套使用。组件会往上查找最近的 "),n("code",null,"ThemeProvider"),v(" 提供的主题和颜色模式。")],-1)),C(t(s(E),null,null,512),[[h,o.value]]),t(r,null,{default:a(()=>[t(s(g),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22NestedTheme.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftheme-provider%2FNestedTheme.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20id%3D%5C%22theme-provider-nested-one%5C%22%3E%5Cn%20%20%20%20%3Ctr-theme-provider%20target-element%3D%5C%22%23theme-provider-nested-one%5C%22%20theme%3D%5C%22custom-theme%5C%22%3E%5Cn%20%20%20%20%20%20%3CComp%3E%3C%2FComp%3E%5Cn%20%20%20%20%20%20%3Chr%20%2F%3E%5Cn%20%20%20%20%20%20%3Cdiv%20id%3D%5C%22theme-provider-nested-two%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%3Cp%3E%E6%88%91%E5%9C%A8%E5%B5%8C%E5%A5%97%E7%9A%84%20ThemeProvider%20%E4%B8%AD%EF%BC%8C%E9%BB%98%E8%AE%A4%E4%BD%BF%E7%94%A8%20TinyRobot%20%E7%9A%84%E9%BB%98%E8%AE%A4%E4%B8%BB%E9%A2%98%3C%2Fp%3E%5Cn%20%20%20%20%20%20%20%20%3Ctr-theme-provider%20target-element%3D%5C%22%23theme-provider-nested-two%5C%22%3E%5Cn%20%20%20%20%20%20%20%20%20%20%3CComp%3E%3C%2FComp%3E%5Cn%20%20%20%20%20%20%20%20%3C%2Ftr-theme-provider%3E%5Cn%20%20%20%20%20%20%3C%2Fdiv%3E%5Cn%20%20%20%20%3C%2Ftr-theme-provider%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrThemeProvider%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20Comp%20from%20'.%2FThemeComp.vue'%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn%23theme-provider-nested-one%2C%5Cn%23theme-provider-nested-two%20%7B%5Cn%20%20border%3A%201px%20solid%20%23ccc%3B%5Cn%20%20border-radius%3A%2010px%3B%5Cn%20%20padding%3A%2010px%3B%5Cn%7D%5Cn%5Cn%5Bdata-tr-theme%3D'custom-theme'%5D%20%7B%5Cn%20%20--tr-prompt-bg%3A%20%23fff7ed%3B%5Cn%20%20--tr-prompt-bg-hover%3A%20rgba(249%2C%20115%2C%2022%2C%200.08)%3B%5Cn%20%20--tr-prompt-bg-active%3A%20rgba(249%2C%20115%2C%2022%2C%200.15)%3B%5Cn%20%20--tr-prompt-bg-disabled%3A%20rgba(249%2C%20115%2C%2022%2C%200.04)%3B%5Cn%20%20--tr-prompt-shadow%3A%200%202px%2012px%20rgba(249%2C%20115%2C%2022%2C%200.08)%3B%5Cn%20%20--tr-prompt-title-color%3A%20%23c2410c%3B%5Cn%20%20--tr-prompt-description-color%3A%20%2392400e%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22ThemeComp.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftheme-provider%2FThemeComp.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Ctr-prompts%20%3Aitems%3D%5C%22items%5C%22%20vertical%3E%3C%2Ftr-prompts%3E%5Cn%20%20%3Cp%3E%E5%BD%93%E5%89%8D%E4%B8%BB%E9%A2%98%EF%BC%9A%7B%7B%20theme%20%7D%7D%3C%2Fp%3E%5Cn%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20gap%3A%2010px%5C%22%3E%5Cn%20%20%20%20%3CSuggestionPillButton%20%40click%3D%5C%22setTheme('')%5C%22%3E%E5%88%87%E6%8D%A2%E5%88%B0%E9%BB%98%E8%AE%A4%E4%B8%BB%E9%A2%98%3C%2FSuggestionPillButton%3E%5Cn%20%20%20%20%3CSuggestionPillButton%20%40click%3D%5C%22setTheme('custom-theme')%5C%22%3E%E5%88%87%E6%8D%A2%E5%88%B0%E8%87%AA%E5%AE%9A%E4%B9%89%E4%B8%BB%E9%A2%98%3C%2FSuggestionPillButton%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20PromptProps%2C%20SuggestionPillButton%2C%20TrPrompts%2C%20useTheme%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20CSSProperties%2C%20h%20%7D%20from%20'vue'%5Cn%5Cnconst%20%7B%20setTheme%2C%20theme%20%7D%20%3D%20useTheme()%5Cn%5Cnconst%20items%3A%20PromptProps%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20label%3A%20'%E5%AD%A6%E4%B9%A0%2F%E7%9F%A5%E8%AF%86%E5%9E%8B%E5%9C%BA%E6%99%AF'%2C%5Cn%20%20%20%20description%3A%20'%E6%9C%89%E4%BB%80%E4%B9%88%E6%83%B3%E4%BA%86%E8%A7%A3%E7%9A%84%E5%90%97%EF%BC%9F%E5%8F%AF%E4%BB%A5%E6%98%AF%E2%80%9C%E9%87%8F%E5%AD%90%E5%8A%9B%E5%AD%A6%E7%AE%80%E4%BB%8B%E2%80%9D%E6%88%96%E2%80%9CVue3%20%E5%92%8C%20React%20%E7%9A%84%E5%8C%BA%E5%88%AB%E2%80%9D%EF%BC%81'%2C%5Cn%20%20%20%20icon%3A%20h('span'%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'18px'%20%7D%20as%20CSSProperties%20%7D%2C%20'%F0%9F%A4%94')%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%3C%2Fscript%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[2]||(e[2]=()=>{o.value=!1}),vueCode:s(f)},m({_:2},[u.value?{name:"vue",fn:a(()=>[t(s(u))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[8]||(e[8]=l("",3)),C(t(s(E),null,null,512),[[h,o.value]]),t(r,null,{default:a(()=>[t(s(g),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%22Storage.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftheme-provider%2FStorage.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Cdiv%20id%3D%5C%22theme-provider-storage%5C%22%3E%5Cn%20%20%20%20%3Ctr-theme-provider%20target-element%3D%5C%22%23theme-provider-storage%5C%22%20%3Astorage%3D%5C%22storage%5C%22%20%3Astorage-key%3D%5C%22storageKey%5C%22%3E%5Cn%20%20%20%20%20%20%3CComp%3E%3C%2FComp%3E%5Cn%20%20%20%20%3C%2Ftr-theme-provider%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20TrThemeProvider%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20Comp%20from%20'.%2FStorageComp.vue'%5Cn%5Cnconst%20storage%20%3D%20localStorage%5Cnconst%20storageKey%20%3D%20'custom-theme-data-storage'%5Cn%3C%2Fscript%3E%5Cn%5Cn%3Cstyle%20scoped%3E%5Cn%5Bdata-tr-theme%3D'custom-theme'%5D%5Bdata-tr-color-mode%3D'light'%5D%20%7B%5Cn%20%20--tr-prompt-bg%3A%20%23fff7ed%3B%5Cn%20%20--tr-prompt-bg-hover%3A%20rgba(249%2C%20115%2C%2022%2C%200.08)%3B%5Cn%20%20--tr-prompt-bg-active%3A%20rgba(249%2C%20115%2C%2022%2C%200.15)%3B%5Cn%20%20--tr-prompt-bg-disabled%3A%20rgba(249%2C%20115%2C%2022%2C%200.04)%3B%5Cn%20%20--tr-prompt-shadow%3A%200%202px%2012px%20rgba(249%2C%20115%2C%2022%2C%200.08)%3B%5Cn%20%20--tr-prompt-title-color%3A%20%23c2410c%3B%5Cn%20%20--tr-prompt-description-color%3A%20%2392400e%3B%5Cn%7D%5Cn%5Bdata-tr-theme%3D'custom-theme'%5D%5Bdata-tr-color-mode%3D'dark'%5D%20%7B%5Cn%20%20--tr-prompt-bg%3A%20%231c1917%3B%5Cn%20%20--tr-prompt-bg-hover%3A%20rgba(249%2C%20115%2C%2022%2C%200.15)%3B%5Cn%20%20--tr-prompt-bg-active%3A%20rgba(249%2C%20115%2C%2022%2C%200.25)%3B%5Cn%20%20--tr-prompt-bg-disabled%3A%20rgba(249%2C%20115%2C%2022%2C%200.08)%3B%5Cn%20%20--tr-prompt-shadow%3A%200%202px%2012px%20rgba(249%2C%20115%2C%2022%2C%200.15)%3B%5Cn%20%20--tr-prompt-title-color%3A%20%23fed7aa%3B%5Cn%20%20--tr-prompt-description-color%3A%20%23fbbf24%3B%5Cn%7D%5Cn%3C%2Fstyle%3E%5Cn%22%7D%2C%22StorageComp.vue%22%3A%7B%22filename%22%3A%22..%2F..%2Fdemos%2Ftheme-provider%2FStorageComp.vue%22%2C%22code%22%3A%22%3Ctemplate%3E%5Cn%20%20%3Ctr-prompts%20%3Aitems%3D%5C%22items%5C%22%20vertical%3E%3C%2Ftr-prompts%3E%5Cn%20%20%3Cdiv%20style%3D%5C%22display%3A%20flex%3B%20gap%3A%2010px%3B%20margin-top%3A%2010px%5C%22%3E%5Cn%20%20%20%20%3CSuggestionPillButton%20%40click%3D%5C%22setTheme('')%5C%22%3E%E5%88%87%E6%8D%A2%E5%88%B0%E9%BB%98%E8%AE%A4%E4%B8%BB%E9%A2%98%3C%2FSuggestionPillButton%3E%5Cn%20%20%20%20%3CSuggestionPillButton%20%40click%3D%5C%22setTheme('custom-theme')%5C%22%3E%E5%88%87%E6%8D%A2%E5%88%B0%E8%87%AA%E5%AE%9A%E4%B9%89%E4%B8%BB%E9%A2%98%3C%2FSuggestionPillButton%3E%5Cn%20%20%20%20%3CSuggestionPillButton%20%40click%3D%5C%22toggleColorMode%5C%22%3E%E5%88%87%E6%8D%A2%E4%BA%AE%E8%89%B2%2F%E6%9A%97%E8%89%B2%3C%2FSuggestionPillButton%3E%5Cn%20%20%20%20%3CSuggestionPillButton%20%40click%3D%5C%22setColorMode('auto')%5C%22%3E%E4%BA%AE%E8%89%B2%E6%9A%97%E8%89%B2%E8%87%AA%E9%80%82%E5%BA%94%3C%2FSuggestionPillButton%3E%5Cn%20%20%3C%2Fdiv%3E%5Cn%3C%2Ftemplate%3E%5Cn%5Cn%3Cscript%20setup%20lang%3D%5C%22ts%5C%22%3E%5Cnimport%20%7B%20PromptProps%2C%20SuggestionPillButton%2C%20TrPrompts%2C%20useTheme%20%7D%20from%20'%40opentiny%2Ftiny-robot'%5Cnimport%20%7B%20CSSProperties%2C%20h%20%7D%20from%20'vue'%5Cn%5Cnconst%20%7B%20setTheme%2C%20toggleColorMode%2C%20setColorMode%20%7D%20%3D%20useTheme()%5Cn%5Cnconst%20items%3A%20PromptProps%5B%5D%20%3D%20%5B%5Cn%20%20%7B%5Cn%20%20%20%20label%3A%20'%E5%AD%A6%E4%B9%A0%2F%E7%9F%A5%E8%AF%86%E5%9E%8B%E5%9C%BA%E6%99%AF'%2C%5Cn%20%20%20%20description%3A%20'%E6%9C%89%E4%BB%80%E4%B9%88%E6%83%B3%E4%BA%86%E8%A7%A3%E7%9A%84%E5%90%97%EF%BC%9F%E5%8F%AF%E4%BB%A5%E6%98%AF%E2%80%9C%E9%87%8F%E5%AD%90%E5%8A%9B%E5%AD%A6%E7%AE%80%E4%BB%8B%E2%80%9D%E6%88%96%E2%80%9CVue3%20%E5%92%8C%20React%20%E7%9A%84%E5%8C%BA%E5%88%AB%E2%80%9D%EF%BC%81'%2C%5Cn%20%20%20%20icon%3A%20h('span'%2C%20%7B%20style%3A%20%7B%20fontSize%3A%20'18px'%20%7D%20as%20CSSProperties%20%7D%2C%20'%F0%9F%A4%94')%2C%5Cn%20%20%7D%2C%5Cn%5D%5Cn%3C%2Fscript%3E%5Cn%22%7D%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:e[3]||(e[3]=()=>{o.value=!1}),vueCode:s(T)},m({_:2},[k.value?{name:"vue",fn:a(()=>[t(s(k))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[9]||(e[9]=l("",16))])}}});export{Z as __pageData,W as default};
