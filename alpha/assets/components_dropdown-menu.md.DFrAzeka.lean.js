const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/basic.hVSVfYRG.js","assets/chunks/theme.Cr2veUHG.js","assets/chunks/framework.DeWfoKqf.js"])))=>i.map(i=>d[i]);
import{p as i,D as s,v as u,V as h,C as p,c as m,o as g,a2 as a,af as b,G as e,ag as w,k as o,w as l,ai as v}from"./chunks/framework.DeWfoKqf.js";import{R as f,k}from"./chunks/index.DAHaZP3X.js";const _=`<template>
  <TrDropdownMenu v-model:show="clickShow" :items="dropdownMenuItems" @item-click="(item) => console.log(item)">
    <template #trigger>
      <TrSuggestionPillButton> Trigger 为 click </TrSuggestionPillButton>
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
      v-model:show="hoverShow"
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
  <hr />
  <div style="display: flex; gap: 10px; flex-direction: column; align-items: flex-start">
    <button @click="clickShow = true">点我打开Trigger为click</button>
    <button @click="hoverShow = !hoverShow">点我切换Trigger为hover</button>
  </div>
  <hr />
  <div style="display: flex; gap: 10px; flex-direction: column; align-items: flex-start">
    <button @click="addDropdownMenu">新增菜单项</button>
    <button @click="removeDropdownMenu">删除菜单项</button>
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
const clickShow = ref(false)
const hoverShow = ref(false)

const handleClickOutside = (ev: MouseEvent) => {
  console.log('click-outside', ev)
}

const addDropdownMenu = () => {
  dropdownMenuItems.value.push({ id: String(dropdownMenuItems.value.length + 1), text: '新增' })
}

const removeDropdownMenu = () => {
  dropdownMenuItems.value.pop()
}
<\/script>
`,D=JSON.parse('{"title":"DropdownMenu 下拉菜单","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/dropdown-menu.md","filePath":"components/dropdown-menu.md"}'),T={name:"components/dropdown-menu.md"},M=Object.assign(T,{setup(x){const n=i(!0),d=s();return u(async()=>{d.value=(await h(async()=>{const{default:r}=await import("./chunks/basic.hVSVfYRG.js");return{default:r}},__vite__mapDeps([0,1,2]))).default}),(r,t)=>{const c=p("ClientOnly");return g(),m("div",null,[t[1]||(t[1]=a("",4)),b(e(o(f),null,null,512),[[w,n.value]]),e(c,null,{default:l(()=>[e(o(k),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:t[0]||(t[0]=()=>{n.value=!1}),vueCode:o(_)},v({_:2},[d.value?{name:"vue",fn:l(()=>[e(o(d))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[2]||(t[2]=a("",18))])}}});export{D as __pageData,M as default};
