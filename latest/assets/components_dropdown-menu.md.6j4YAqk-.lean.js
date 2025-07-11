const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/basic.CWo-8JRR.js","assets/chunks/index.cxSKZGKH.js","assets/chunks/framework.kTfunus-.js","assets/chunks/tiny-robot-svgs.BaAiG9Fu.js","assets/chunks/index2.DXNIapAb.js","assets/chunks/utils.D1YSndqS.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/index.CbhXsEHC.js","assets/chunks/index.DM95O2dU.js"])))=>i.map(i=>d[i]);
import{p as a,v as s,V as u,C as h,c as p,o as m,ag as l,ah as b,G as e,ai as g,k as d,w as i}from"./chunks/framework.kTfunus-.js";import{O as w,E as _}from"./chunks/index.Bs5OpVoR.js";const f=`<template>
  <TrDropdownMenu :items="dropdownMenuItems" @item-click="(item) => console.log(item)">
    <template #trigger>
      <TrSuggestionPillButton> 点我打开Dropdown Menu </TrSuggestionPillButton>
    </template>
  </TrDropdownMenu>
  <hr />
  <TrDropdownMenu
    :items="dropdownMenuItems"
    :show="show"
    trigger="manual"
    @item-click="(item) => console.log(item)"
    @click-outside="handleClickOutside"
  >
    <template #trigger>
      <TrSuggestionPillButton @click="show = !show"> Trigger 为 manual </TrSuggestionPillButton>
    </template>
  </TrDropdownMenu>
  <hr />
  <div style="display: flex; gap: 10px">
    <TrDropdownMenu
      :items="dropdownMenuItems"
      trigger="hover"
      @item-click="(item) => console.log(item)"
      append-to="#app"
    >
      <template #trigger>
        <TrSuggestionPillButton> Trigger 为 hover </TrSuggestionPillButton>
      </template>
    </TrDropdownMenu>
    <TrDropdownMenu :items="dropdownMenuItems" trigger="hover" @item-click="(item) => console.log(item)">
      <template #trigger>
        <TrSuggestionPillButton> Trigger 为 hover </TrSuggestionPillButton>
      </template>
    </TrDropdownMenu>
  </div>
</template>

<script setup lang="ts">
import { TrDropdownMenu, TrSuggestionPillButton } from '@opentiny/tiny-robot'
import { ref } from 'vue'

const dropdownMenuItems = ref([
  { id: '1', text: '去续费' },
  { id: '2', text: '去退订' },
  { id: '3', text: '查账单' },
  { id: '4', text: '导账单' },
  { id: '5', text: '对帐单' },
])

const show = ref(false)

const handleClickOutside = (ev: MouseEvent) => {
  console.log('click-outside', ev)
}
<\/script>
`,M=JSON.parse('{"title":"DropdownMenu 下拉菜单","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/dropdown-menu.md","filePath":"components/dropdown-menu.md"}'),v={name:"components/dropdown-menu.md"},x=Object.assign(v,{setup(T){const o=a(!0),n=a();return s(async()=>{n.value=(await u(async()=>{const{default:r}=await import("./chunks/basic.CWo-8JRR.js");return{default:r}},__vite__mapDeps([0,1,2,3,4,5,6,7,8]))).default}),(r,t)=>{const c=h("ClientOnly");return m(),p("div",null,[t[1]||(t[1]=l("",4)),b(e(d(w),null,null,512),[[g,o.value]]),e(c,null,{default:i(()=>[e(d(_),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[0]||(t[0]=()=>{o.value=!1}),vueCode:d(f)},{vue:i(()=>[e(d(n))]),_:1},8,["vueCode"])]),_:1}),t[2]||(t[2]=l("",16))])}}});export{M as __pageData,x as default};
