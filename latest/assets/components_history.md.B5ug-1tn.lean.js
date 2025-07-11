const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/multi-tabs.CKMz6oqN.js","assets/chunks/index.CqJjDIy1.js","assets/chunks/framework.kTfunus-.js","assets/chunks/tiny-robot-svgs.BaAiG9Fu.js","assets/chunks/index5.B63c_vYG.js","assets/chunks/index4.UhD4dyzc.js","assets/chunks/index.DM95O2dU.js","assets/chunks/utils.D1YSndqS.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/index2.DXNIapAb.js","assets/chunks/search-bar.Ci-s8AZ5.js","assets/chunks/group.DdBgedrd.js","assets/chunks/basic.DgEpR4gB.js"])))=>i.map(i=>d[i]);
import{p as s,v as c,V as h,C as _,c as T,o as C,ag as b,ah as p,G as e,j as d,ai as u,k as o,w as i,a as r}from"./chunks/framework.kTfunus-.js";import{O as m,E as y}from"./chunks/index.Bs5OpVoR.js";const H=`<template>
  <tr-history
    class="tr-history-demo"
    :data="data"
    :tabs="tabs"
    :active-tab="activeTab"
    :selected="selected"
    @item-click="handleItemClick"
    @item-title-change="handleItemTitleChange"
  />
</template>

<script setup lang="ts">
import { HistoryGroup, HistoryItem, TrHistory } from '@opentiny/tiny-robot'
import { reactive, ref } from 'vue'
const tabs = [
  { title: '历史对话', id: 'conversations' },
  { title: '历史任务', id: 'tasks' },
]

const activeTab = ref('tasks')

const selected = ref('2')

const data: Record<string, HistoryGroup[]> = reactive({
  conversations: [
    {
      group: '今天',
      items: [
        { title: '如何训练一只聪明的小狗', id: '1', tag: { text: '成功', type: 'success' } },
        { title: 'How to make a perfect soufflé', id: '2', tag: { text: '警告', type: 'warning' } },
        { title: 'The Art of Origami: Advanced Paper Folding', id: '3', tag: { text: '错误', type: 'error' } },
      ],
    },
    {
      group: '昨天',
      items: [
        {
          title:
            'This is a very long title that demonstrates how the history component handles lengthy conversation titles and ensures proper text wrapping',
          id: '4',
        },
        { title: '历史对话默认', id: '5' },
        { title: '历史对话hover', id: '6' },
      ],
    },
    {
      group: '5月13日',
      items: [
        { title: '历史对话默认', id: '7' },
        { title: '历史对话默认', id: '8' },
      ],
    },
    { group: '5月12日', items: [] },
  ],
  tasks: [],
})

const handleItemClick = (item: HistoryItem) => {
  selected.value = item.id
}

const handleItemTitleChange = (title: string, rawData: HistoryItem) => {
  rawData.title = title
  console.log('previous title:', rawData.title)
  console.log('new title:', title)
}
<\/script>

<style lang="less" scoped>
.tr-history-demo {
  height: 400px;
}
</style>
`,A=`<template>
  <tr-history
    class="tr-history-demo"
    tab-title="历史对话"
    :search-bar="true"
    search-placeholder="自定义搜索"
    :search-query="searchQuery"
    :search-fn="searchFn"
    :data="data"
  />
</template>

<script setup lang="ts">
import { HistoryGroup, HistoryItem, TrHistory } from '@opentiny/tiny-robot'
import { reactive, ref } from 'vue'

const searchQuery = ref('')

const searchFn = (query: string, item: HistoryItem) => {
  console.log('searching')
  return item.title.toLowerCase().includes(query.toLowerCase())
}

const data: HistoryGroup[] = reactive([
  {
    group: '今天',
    items: [
      { title: '如何训练一只聪明的小狗', id: '1' },
      { title: 'How to make a perfect soufflé', id: '2' },
      { title: 'The Art of Origami: Advanced Paper Folding', id: '3' },
    ],
  },
])
<\/script>

<style lang="less" scoped>
.tr-history-demo {
  height: 400px;
}
</style>
`,D=`<template>
  <tr-history
    class="tr-history-demo"
    tab-title="历史对话"
    :data="data"
    :selected="selected"
    @item-click="handleItemClick"
    @close="handleClose"
  />
</template>

<script setup lang="ts">
import { HistoryGroup, HistoryItem } from '@opentiny/tiny-robot'
import { reactive, ref } from 'vue'

const selected = ref('2')

const data: HistoryGroup[] = reactive([
  {
    group: '今天',
    items: [
      { title: '如何训练一只聪明的小狗', id: '1' },
      { title: 'How to make a perfect soufflé', id: '2' },
      { title: 'The Art of Origami: Advanced Paper Folding', id: '3' },
    ],
  },
  {
    group: '昨天',
    items: [
      {
        title:
          'This is a very long title that demonstrates how the history component handles lengthy conversation titles and ensures proper text wrapping',
        id: '4',
      },
      { title: '历史对话5', id: '5' },
      { title: '历史对话6', id: '6' },
    ],
  },
  {
    group: '5月13日',
    items: [
      { title: '历史对话7', id: '7' },
      { title: '历史对话8', id: '8' },
    ],
  },
  { group: '5月12日', items: [] },
])

const handleItemClick = (item: HistoryItem) => {
  selected.value = item.id
}

const handleClose = () => {
  alert('close')
}
<\/script>

<style lang="less" scoped>
.tr-history-demo {
  height: 400px;
}
</style>
`,w=`<template>
  <tr-history
    class="tr-history-demo"
    tab-title="历史对话"
    :data="data"
    :selected="selected"
    @item-click="handleItemClick"
    @close="handleClose"
  />
</template>

<script setup lang="ts">
import { HistoryItem, TrHistory } from '@opentiny/tiny-robot'
import { reactive, ref } from 'vue'

const selected = ref('2')

const data: HistoryItem[] = reactive([
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

const handleItemClick = (item: HistoryItem) => {
  selected.value = item.id
}

const handleClose = () => {
  alert('close')
}
<\/script>

<style lang="less" scoped>
.tr-history-demo {
  height: 400px;
}
</style>
`,R=JSON.parse('{"title":"History","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/history.md","filePath":"components/history.md"}'),P={name:"components/history.md"},x=Object.assign(P,{setup(I){const v=s();c(async()=>{v.value=(await h(async()=>{const{default:n}=await import("./chunks/multi-tabs.CKMz6oqN.js");return{default:n}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9]))).default});const g=s();c(async()=>{g.value=(await h(async()=>{const{default:n}=await import("./chunks/search-bar.Ci-s8AZ5.js");return{default:n}},__vite__mapDeps([10,1,2,3,4,5,6,7,8,9]))).default});const f=s();c(async()=>{f.value=(await h(async()=>{const{default:n}=await import("./chunks/group.DdBgedrd.js");return{default:n}},__vite__mapDeps([11,2]))).default});const a=s(!0),k=s();return c(async()=>{k.value=(await h(async()=>{const{default:n}=await import("./chunks/basic.DgEpR4gB.js");return{default:n}},__vite__mapDeps([12,1,2,3,4,5,6,7,8,9]))).default}),(n,t)=>{const l=_("ClientOnly");return C(),T("div",null,[t[4]||(t[4]=b("",4)),p(e(o(m),null,null,512),[[u,a.value]]),e(l,null,{default:i(()=>[e(o(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[0]||(t[0]=()=>{a.value=!1}),vueCode:o(w)},{vue:i(()=>[e(o(k))]),_:1},8,["vueCode"])]),_:1}),t[5]||(t[5]=d("h3",{id:"分组",tabindex:"-1"},[r("分组 "),d("a",{class:"header-anchor",href:"#分组","aria-label":'Permalink to "分组"'},"​")],-1)),t[6]||(t[6]=d("p",null,"分组",-1)),p(e(o(m),null,null,512),[[u,a.value]]),e(l,null,{default:i(()=>[e(o(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[1]||(t[1]=()=>{a.value=!1}),vueCode:o(D)},{vue:i(()=>[e(o(f))]),_:1},8,["vueCode"])]),_:1}),t[7]||(t[7]=d("h3",{id:"搜索框",tabindex:"-1"},[r("搜索框 "),d("a",{class:"header-anchor",href:"#搜索框","aria-label":'Permalink to "搜索框"'},"​")],-1)),t[8]||(t[8]=d("p",null,[r("使用 "),d("code",null,"search-bar"),r(" 控制是否显示搜索框。相应的还有 "),d("code",null,"search-placeholder"),r("、"),d("code",null,"search-query"),r("（这是一个双向绑定model）、"),d("code",null,"search-fn"),r("（自定义搜索函数）")],-1)),p(e(o(m),null,null,512),[[u,a.value]]),e(l,null,{default:i(()=>[e(o(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[2]||(t[2]=()=>{a.value=!1}),vueCode:o(A)},{vue:i(()=>[e(o(g))]),_:1},8,["vueCode"])]),_:1}),t[9]||(t[9]=b("",2)),p(e(o(m),null,null,512),[[u,a.value]]),e(l,null,{default:i(()=>[e(o(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[3]||(t[3]=()=>{a.value=!1}),vueCode:o(H)},{vue:i(()=>[e(o(v))]),_:1},8,["vueCode"])]),_:1}),t[10]||(t[10]=b("",21))])}}});export{R as __pageData,x as default};
