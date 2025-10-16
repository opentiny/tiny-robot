const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/custom-menu.rraN8Mjk.js","assets/chunks/theme.C0IJQBJ6.js","assets/chunks/framework.1ofCZuck.js","assets/chunks/empty.CIXZhoTu.js","assets/chunks/basic.BssDxEvn.js"])))=>i.map(i=>d[i]);
import{s as m,A as u,_ as p,r as _,H as T,e as x,o as D,a4 as v,ah as y,J as e,q as a,ai as b,x as d,i as r,ak as g,g as n}from"./chunks/framework.1ofCZuck.js";import{L as k,N as f}from"./chunks/index.DG7r5IE9.js";const w=`<template>
  <tr-history
    :data="data"
    :selected="selected"
    :menu-items="menuItems"
    @item-click="(item) => (selected = item.id)"
    @item-title-change="(newTitle, item) => (item.title = newTitle)"
    @item-action="(action, item) => handleAction(action, item)"
  />
</template>

<script setup lang="ts">
import { TrHistory } from '@opentiny/tiny-robot'
import { IconEditPen, IconDelete, IconCopy } from '@opentiny/tiny-robot-svgs'
import { reactive, ref } from 'vue'

const data = reactive([
  { title: '如何训练一只聪明的小狗', id: '1' },
  { title: 'How to make a perfect soufflé', id: '2' },
  { title: 'The Art of Origami: Advanced Paper Folding', id: '3' },
  { title: '历史对话4', id: '4' },
  { title: '历史对话5', id: '5' },
])

const selected = ref<string | undefined>('2')

// 自定义菜单项
const menuItems = [
  { id: 'rename', text: '重命名', icon: IconEditPen },
  { id: 'copy', text: '复制', icon: IconCopy },
  { id: 'delete', text: '删除', icon: IconDelete },
]

const handleAction = (action: { id: string; text: string }, item: { id?: string; title: string }) => {
  console.log(\`执行操作: \${action.text}\`, { action, item })

  switch (action.id) {
    case 'rename':
      // 重命名逻辑
      break
    case 'copy':
      // 复制逻辑
      break
    case 'delete':
      // 删除逻辑
      break
  }
}
<\/script>
`,A=`<template>
  <tr-history :data="data" />
</template>

<script setup lang="ts">
import { TrHistory } from '@opentiny/tiny-robot'
import { reactive } from 'vue'

const data = reactive([])
<\/script>
`,C=`<template>
  <tr-history
    :data="data"
    :selected="selected"
    :show-rename-controls="isTouchDevice"
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
import { TrHistory, useTouchDevice } from '@opentiny/tiny-robot'
import { reactive, ref } from 'vue'

const { isTouchDevice } = useTouchDevice()

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
`,W=JSON.parse('{"title":"History","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/history.md","filePath":"components/history.md"}'),I={name:"components/history.md"},H=Object.assign(I,{setup(E){const s=m();u(async()=>{s.value=(await p(async()=>{const{default:i}=await import("./chunks/custom-menu.rraN8Mjk.js");return{default:i}},__vite__mapDeps([0,1,2]))).default});const c=m();u(async()=>{c.value=(await p(async()=>{const{default:i}=await import("./chunks/empty.CIXZhoTu.js");return{default:i}},__vite__mapDeps([3,1,2]))).default});const o=_(!0),l=m();return u(async()=>{l.value=(await p(async()=>{const{default:i}=await import("./chunks/basic.BssDxEvn.js");return{default:i}},__vite__mapDeps([4,1,2]))).default}),(i,t)=>{const h=T("ClientOnly");return D(),x("div",null,[t[3]||(t[3]=v("",4)),y(e(d(k),null,null,512),[[b,o.value]]),e(h,null,{default:r(()=>[e(d(f),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{o.value=!1}),vueCode:d(C)},g({_:2},[l.value?{name:"vue",fn:r(()=>[e(d(l))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[4]||(t[4]=a("h3",{id:"空状态",tabindex:"-1"},[n("空状态 "),a("a",{class:"header-anchor",href:"#空状态","aria-label":'Permalink to "空状态"'},"​")],-1)),y(e(d(k),null,null,512),[[b,o.value]]),e(h,null,{default:r(()=>[e(d(f),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[1]||(t[1]=()=>{o.value=!1}),vueCode:d(A)},g({_:2},[c.value?{name:"vue",fn:r(()=>[e(d(c))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[5]||(t[5]=a("h3",{id:"自定义菜单项",tabindex:"-1"},[n("自定义菜单项 "),a("a",{class:"header-anchor",href:"#自定义菜单项","aria-label":'Permalink to "自定义菜单项"'},"​")],-1)),t[6]||(t[6]=a("p",null,[n("通过 "),a("code",null,"menuItems"),n(" 属性可以自定义历史项的菜单选项。")],-1)),y(e(d(k),null,null,512),[[b,o.value]]),e(h,null,{default:r(()=>[e(d(f),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[2]||(t[2]=()=>{o.value=!1}),vueCode:d(w)},g({_:2},[s.value?{name:"vue",fn:r(()=>[e(d(s))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[7]||(t[7]=v("",30))])}}});export{W as __pageData,H as default};
