const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/multi-tabs.BnlUUQOx.js","assets/chunks/index.CDUvPs-D.js","assets/chunks/framework.Cue1fywD.js","assets/chunks/tiny-robot-svgs.Drx3vgfj.js","assets/chunks/index.C-KxNaZL.js","assets/chunks/index.BxNcVGWn.js","assets/chunks/index.C6NR4zBu.js","assets/chunks/index.D4QX1QD9.js","assets/chunks/loading-shadow.DnxX4PrV.js","assets/chunks/help-circle.QYo-CUpD.js","assets/chunks/index.CxWeTUhD.js","assets/chunks/utils.SoyBvDll.js","assets/chunks/index2.ChrULO9t.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/search-bar.BfI5xE8l.js","assets/chunks/group.C4Y7kvOO.js","assets/chunks/basic.CB3rnMMr.js"])))=>i.map(i=>d[i]);
import{D as l,v as c,V as h,p as T,C as H,c as I,o as C,ah as _,ag as p,G as e,j as o,ai as u,k as a,w as i,aj as y,a as r}from"./chunks/framework.Cue1fywD.js";import{R as m,k as b}from"./chunks/index.CG8BqhQK.js";const D=`<template>
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
`,w=`<template>
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
`,A=`<template>
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
`,P=`<template>
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
`,q=JSON.parse('{"title":"History","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/history.md","filePath":"components/history.md"}'),x={name:"components/history.md"},L=Object.assign(x,{setup(X){const v=l();c(async()=>{v.value=(await h(async()=>{const{default:n}=await import("./chunks/multi-tabs.BnlUUQOx.js");return{default:n}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13]))).default});const g=l();c(async()=>{g.value=(await h(async()=>{const{default:n}=await import("./chunks/search-bar.BfI5xE8l.js");return{default:n}},__vite__mapDeps([14,1,2,3,4,5,6,7,8,9,10,11,12,13]))).default});const f=l();c(async()=>{f.value=(await h(async()=>{const{default:n}=await import("./chunks/group.C4Y7kvOO.js");return{default:n}},__vite__mapDeps([15,2]))).default});const d=T(!0),k=l();return c(async()=>{k.value=(await h(async()=>{const{default:n}=await import("./chunks/basic.CB3rnMMr.js");return{default:n}},__vite__mapDeps([16,1,2,3,4,5,6,7,8,9,10,11,12,13]))).default}),(n,t)=>{const s=H("ClientOnly");return C(),I("div",null,[t[4]||(t[4]=_("",4)),p(e(a(m),null,null,512),[[u,d.value]]),e(s,null,{default:i(()=>[e(a(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:t[0]||(t[0]=()=>{d.value=!1}),vueCode:a(P)},y({_:2},[k.value?{name:"vue",fn:i(()=>[e(a(k))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[5]||(t[5]=o("h3",{id:"分组",tabindex:"-1"},[r("分组 "),o("a",{class:"header-anchor",href:"#分组","aria-label":'Permalink to "分组"'},"​")],-1)),t[6]||(t[6]=o("p",null,"分组",-1)),p(e(a(m),null,null,512),[[u,d.value]]),e(s,null,{default:i(()=>[e(a(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:t[1]||(t[1]=()=>{d.value=!1}),vueCode:a(A)},y({_:2},[f.value?{name:"vue",fn:i(()=>[e(a(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[7]||(t[7]=o("h3",{id:"搜索框",tabindex:"-1"},[r("搜索框 "),o("a",{class:"header-anchor",href:"#搜索框","aria-label":'Permalink to "搜索框"'},"​")],-1)),t[8]||(t[8]=o("p",null,[r("使用 "),o("code",null,"search-bar"),r(" 控制是否显示搜索框。相应的还有 "),o("code",null,"search-placeholder"),r("、"),o("code",null,"search-query"),r("（这是一个双向绑定model）、"),o("code",null,"search-fn"),r("（自定义搜索函数）")],-1)),p(e(a(m),null,null,512),[[u,d.value]]),e(s,null,{default:i(()=>[e(a(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:t[2]||(t[2]=()=>{d.value=!1}),vueCode:a(w)},y({_:2},[g.value?{name:"vue",fn:i(()=>[e(a(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[9]||(t[9]=_("",2)),p(e(a(m),null,null,512),[[u,d.value]]),e(s,null,{default:i(()=>[e(a(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:t[3]||(t[3]=()=>{d.value=!1}),vueCode:a(D)},y({_:2},[v.value?{name:"vue",fn:i(()=>[e(a(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[10]||(t[10]=_("",21))])}}});export{q as __pageData,L as default};
