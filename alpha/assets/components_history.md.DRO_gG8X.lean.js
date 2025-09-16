const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/empty.CN-rLQsy.js","assets/chunks/theme.Cr2veUHG.js","assets/chunks/framework.DeWfoKqf.js","assets/chunks/basic.XAZqRqLG.js"])))=>i.map(i=>d[i]);
import{D as l,v as h,V as c,p as f,C as v,c as _,o as T,a2 as p,af as y,G as e,j as m,ag as u,k as d,w as r,ai as b,a as x}from"./chunks/framework.DeWfoKqf.js";import{R as k,k as g}from"./chunks/index.DAHaZP3X.js";const C=`<template>
  <tr-history :data="data" />
</template>

<script setup lang="ts">
import { TrHistory } from '@opentiny/tiny-robot'
import { reactive } from 'vue'

const data = reactive([])
<\/script>

<style lang="less" scoped></style>
`,w=`<template>
  <tr-history
    :data="data"
    :selected="selected"
    :show-rename-controls="true"
    rename-control-on-click-outside="cancel"
    @item-click="(item) => (selected = item.id)"
    @item-title-change="(newTitle, item) => (item.title = newTitle)"
    @item-action="(item) => console.log(item)"
  />
  <hr />
  <p>分组数据</p>
  <tr-history
    :data="groups"
    :selected="selected2"
    @item-click="(item) => (selected2 = item.id)"
    @item-title-change="(newTitle, item) => (item.title = newTitle)"
    @item-action="(item) => console.log(item)"
  />
</template>

<script setup lang="ts">
import { TrHistory } from '@opentiny/tiny-robot'
import { reactive, ref } from 'vue'

const data = reactive([
  { title: '如何训练一只聪明的小狗', id: '1' },
  { title: 'How to make a perfect soufflé', id: '2' },
  { title: 'The Art of Origami: Advanced Paper Folding', id: '3' },
  {
    title:
      'This is a very long title that demonstrates how the history component handles lengthy conversation titles and ensures proper text wrapping',
    id: '4',
  },
  { title: '历史对话5', id: '5' },
  { title: '历史对话6', id: '6' },
])

const selected = ref<string | undefined>('2')

const groups = reactive([
  {
    group: '今天',
    items: [{ title: '如何训练一只聪明的小狗', id: '1' }],
  },
  {
    group: '昨天',
    items: [{ title: 'How to make a perfect soufflé', id: '2' }],
  },
])

const selected2 = ref<string | undefined>('2')
<\/script>

<style lang="less" scoped></style>
`,B=JSON.parse('{"title":"History","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/history.md","filePath":"components/history.md"}'),D={name:"components/history.md"},H=Object.assign(D,{setup(E){const a=l();h(async()=>{a.value=(await c(async()=>{const{default:i}=await import("./chunks/empty.CN-rLQsy.js");return{default:i}},__vite__mapDeps([0,1,2]))).default});const o=f(!0),s=l();return h(async()=>{s.value=(await c(async()=>{const{default:i}=await import("./chunks/basic.XAZqRqLG.js");return{default:i}},__vite__mapDeps([3,1,2]))).default}),(i,t)=>{const n=v("ClientOnly");return T(),_("div",null,[t[2]||(t[2]=p("",4)),y(e(d(k),null,null,512),[[u,o.value]]),e(n,null,{default:r(()=>[e(d(g),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:t[0]||(t[0]=()=>{o.value=!1}),vueCode:d(w)},b({_:2},[s.value?{name:"vue",fn:r(()=>[e(d(s))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[3]||(t[3]=m("h3",{id:"空状态",tabindex:"-1"},[x("空状态 "),m("a",{class:"header-anchor",href:"#空状态","aria-label":'Permalink to "空状态"'},"​")],-1)),y(e(d(k),null,null,512),[[u,o.value]]),e(n,null,{default:r(()=>[e(d(g),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:t[1]||(t[1]=()=>{o.value=!1}),vueCode:d(C)},b({_:2},[a.value?{name:"vue",fn:r(()=>[e(d(a))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[4]||(t[4]=p("",28))])}}});export{B as __pageData,H as default};
