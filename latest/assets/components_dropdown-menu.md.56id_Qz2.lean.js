const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/basic.Bg6Q5IHp.js","assets/chunks/index.DWcP29QJ.js","assets/chunks/framework.CBhkkd1d.js","assets/chunks/tiny-robot-svgs.DjZeQ69T.js","assets/chunks/index2.CaPMndaq.js","assets/chunks/index.DgnhvHJN.js","assets/chunks/utils.D1YSndqS.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/index.B-t13XQj.js"])))=>i.map(i=>d[i]);
import{p as c,D as s,v as h,V as u,C as m,c as p,o as g,ag as a,ah as b,G as e,ai as w,k as o,w as i,aj as _}from"./chunks/framework.CBhkkd1d.js";import{O as f,E as v}from"./chunks/index.D3YLhVKP.js";const T=`<template>
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
`,D=JSON.parse('{"title":"DropdownMenu 下拉菜单","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/dropdown-menu.md","filePath":"components/dropdown-menu.md"}'),k={name:"components/dropdown-menu.md"},S=Object.assign(k,{setup(y){const n=c(!0),d=s();return h(async()=>{d.value=(await u(async()=>{const{default:r}=await import("./chunks/basic.Bg6Q5IHp.js");return{default:r}},__vite__mapDeps([0,1,2,3,4,5,6,7,8]))).default}),(r,t)=>{const l=m("ClientOnly");return g(),p("div",null,[t[1]||(t[1]=a("",4)),b(e(o(f),null,null,512),[[w,n.value]]),e(l,null,{default:i(()=>[e(o(v),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[0]||(t[0]=()=>{n.value=!1}),vueCode:o(T)},_({_:2},[d.value?{name:"vue",fn:i(()=>[e(o(d))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[2]||(t[2]=a("",16))])}}});export{D as __pageData,S as default};
