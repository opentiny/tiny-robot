const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/basic.Bm58zrfT.js","assets/chunks/theme.MY0DDsqj.js","assets/chunks/framework.Dw8jt1Jz.js"])))=>i.map(i=>d[i]);
import{aD as a,aZ as s,aL as u,v as h,H as c,bL as m,bB as p,J as e,bk as o,bJ as l,G as g,aU as w,b7 as b,bQ as v}from"./chunks/framework.Dw8jt1Jz.js";import{L as f,N as T}from"./chunks/index.DDu3Iq4c.js";const _=`<template>
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
`,y=JSON.parse('{"title":"DropdownMenu 下拉菜单","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/dropdown-menu.md","filePath":"components/dropdown-menu.md"}'),k={name:"components/dropdown-menu.md"},D=Object.assign(k,{setup(M){const n=w(!0),d=b();return a(async()=>{d.value=(await v(async()=>{const{default:r}=await import("./chunks/basic.Bm58zrfT.js");return{default:r}},__vite__mapDeps([0,1,2]))).default}),(r,t)=>{const i=s("ClientOnly");return u(),h("div",null,[t[1]||(t[1]=c("",4)),m(e(o(f),null,null,512),[[p,n.value]]),e(i,null,{default:l(()=>[e(o(T),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{n.value=!1}),vueCode:o(_)},g({_:2},[d.value?{name:"vue",fn:l(()=>[e(o(d))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[2]||(t[2]=c("",13))])}}});export{y as __pageData,D as default};
