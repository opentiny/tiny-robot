const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/multi-tabs.DPRipXr3.js","assets/chunks/index.Ds9_U3Z7.js","assets/chunks/framework.Drg26CuE.js","assets/chunks/tiny-robot-svgs.CrjnPBnr.js","assets/chunks/index6.CN_lv5ML.js","assets/chunks/index2.BWIbWYBl.js","assets/chunks/index5.CIv_Rczv.js","assets/chunks/index.RcIFPvqJ.js","assets/chunks/utils.D1YSndqS.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/index3.D7tvyltF.js","assets/chunks/search-bar.BhLqDEnE.js","assets/chunks/group.UywH6C5b.js","assets/chunks/basic.CAckBQc4.js"])))=>i.map(i=>d[i]);
import{D as l,v as c,V as h,p as T,C as H,c as I,o as C,ah as _,ag as p,G as e,j as o,ai as u,k as a,w as i,aj as y,a as r}from"./chunks/framework.Drg26CuE.js";import{O as m,E as b}from"./chunks/index.C-wDJslB.js";const D=`<template>
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
`,L=JSON.parse('{"title":"History","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/history.md","filePath":"components/history.md"}'),x={name:"components/history.md"},Z=Object.assign(x,{setup(X){const v=l();c(async()=>{v.value=(await h(async()=>{const{default:n}=await import("./chunks/multi-tabs.DPRipXr3.js");return{default:n}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10]))).default});const g=l();c(async()=>{g.value=(await h(async()=>{const{default:n}=await import("./chunks/search-bar.BhLqDEnE.js");return{default:n}},__vite__mapDeps([11,1,2,3,4,5,6,7,8,9,10]))).default});const f=l();c(async()=>{f.value=(await h(async()=>{const{default:n}=await import("./chunks/group.UywH6C5b.js");return{default:n}},__vite__mapDeps([12,2]))).default});const d=T(!0),k=l();return c(async()=>{k.value=(await h(async()=>{const{default:n}=await import("./chunks/basic.CAckBQc4.js");return{default:n}},__vite__mapDeps([13,1,2,3,4,5,6,7,8,9,10]))).default}),(n,t)=>{const s=H("ClientOnly");return C(),I("div",null,[t[4]||(t[4]=_('<h1 id="history" tabindex="-1">History <a class="header-anchor" href="#history" aria-label="Permalink to &quot;History&quot;">​</a></h1><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基本示例" tabindex="-1">基本示例 <a class="header-anchor" href="#基本示例" aria-label="Permalink to &quot;基本示例&quot;">​</a></h3><p>基本示例。<code>tab-title</code> 为标题（由于 <code>title</code> 属性是内置 html 属性，防止冲突，使用 <code>tab-title</code>），<code>data</code> 为数据。使用 <code>selected</code> 控制选中的项，值为每一项的 <code>id</code></p>',4)),p(e(a(m),null,null,512),[[u,d.value]]),e(s,null,{default:i(()=>[e(a(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[0]||(t[0]=()=>{d.value=!1}),vueCode:a(P)},y({_:2},[k.value?{name:"vue",fn:i(()=>[e(a(k))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[5]||(t[5]=o("h3",{id:"分组",tabindex:"-1"},[r("分组 "),o("a",{class:"header-anchor",href:"#分组","aria-label":'Permalink to "分组"'},"​")],-1)),t[6]||(t[6]=o("p",null,"分组",-1)),p(e(a(m),null,null,512),[[u,d.value]]),e(s,null,{default:i(()=>[e(a(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[1]||(t[1]=()=>{d.value=!1}),vueCode:a(w)},y({_:2},[f.value?{name:"vue",fn:i(()=>[e(a(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[7]||(t[7]=o("h3",{id:"搜索框",tabindex:"-1"},[r("搜索框 "),o("a",{class:"header-anchor",href:"#搜索框","aria-label":'Permalink to "搜索框"'},"​")],-1)),t[8]||(t[8]=o("p",null,[r("使用 "),o("code",null,"search-bar"),r(" 控制是否显示搜索框。相应的还有 "),o("code",null,"search-placeholder"),r("、"),o("code",null,"search-query"),r("（这是一个双向绑定model）、"),o("code",null,"search-fn"),r("（自定义搜索函数）")],-1)),p(e(a(m),null,null,512),[[u,d.value]]),e(s,null,{default:i(()=>[e(a(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[2]||(t[2]=()=>{d.value=!1}),vueCode:a(A)},y({_:2},[g.value?{name:"vue",fn:i(()=>[e(a(g))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[9]||(t[9]=_('<h3 id="多个页签" tabindex="-1">多个页签 <a class="header-anchor" href="#多个页签" aria-label="Permalink to &quot;多个页签&quot;">​</a></h3><p>使用 <code>tab</code> 传入多个页签，每个 <code>tab</code> 有 <code>title</code> 和 <code>id</code> 两个属性，此时 <code>data</code> 是一个对象，key 指向对应的 <code>tab.id</code>。使用 <code>activeTab</code>（这是一个双向绑定model）来控制显示的哪个页签</p>',2)),p(e(a(m),null,null,512),[[u,d.value]]),e(s,null,{default:i(()=>[e(a(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[3]||(t[3]=()=>{d.value=!1}),vueCode:a(D)},y({_:2},[v.value?{name:"vue",fn:i(()=>[e(a(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[10]||(t[10]=_('<h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="basehistoryprops-基础属性" tabindex="-1">BaseHistoryProps 基础属性 <a class="header-anchor" href="#basehistoryprops-基础属性" aria-label="Permalink to &quot;BaseHistoryProps 基础属性&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>必填</th><th>说明</th></tr></thead><tbody><tr><td><code>activeTab</code></td><td><code>string</code></td><td>否</td><td>当前激活的标签页ID</td></tr><tr><td><code>searchBar</code></td><td><code>boolean</code></td><td>否</td><td>是否显示搜索栏，默认 <code>false</code></td></tr><tr><td><code>searchQuery</code></td><td><code>string</code></td><td>否</td><td>搜索关键词</td></tr><tr><td><code>searchPlaceholder</code></td><td><code>string</code></td><td>否</td><td>搜索框占位文本</td></tr><tr><td><code>searchFn</code></td><td><code>(query: string, item: HistoryItem) =&gt; boolean</code></td><td>否</td><td>自定义搜索函数</td></tr><tr><td><code>selected</code></td><td><code>string</code></td><td>否</td><td>当前选中的历史项ID</td></tr></tbody></table><h3 id="singletabhistoryprops-单标签页模式" tabindex="-1">SingleTabHistoryProps 单标签页模式 <a class="header-anchor" href="#singletabhistoryprops-单标签页模式" aria-label="Permalink to &quot;SingleTabHistoryProps 单标签页模式&quot;">​</a></h3><p>继承 <code>BaseHistoryProps</code> 的所有属性，并添加：</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>必填</th><th>说明</th></tr></thead><tbody><tr><td><code>tabTitle</code></td><td><code>string</code></td><td>是</td><td>标签页标题</td></tr><tr><td><code>data</code></td><td><code>HistoryData</code></td><td>是</td><td>历史数据（可以是 <code>HistoryItem[]</code> 或 <code>HistoryGroup[]</code>）</td></tr></tbody></table><h3 id="multitabhistoryprops-多标签页模式" tabindex="-1">MultiTabHistoryProps 多标签页模式 <a class="header-anchor" href="#multitabhistoryprops-多标签页模式" aria-label="Permalink to &quot;MultiTabHistoryProps 多标签页模式&quot;">​</a></h3><p>继承 <code>BaseHistoryProps</code> 的所有属性，并添加：</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>必填</th><th>说明</th></tr></thead><tbody><tr><td><code>tabs</code></td><td><code>{ title: string; id: string }[]</code></td><td>是</td><td>标签页配置数组</td></tr><tr><td><code>data</code></td><td><code>Record&lt;string, HistoryData&gt;</code></td><td>是</td><td>按标签页ID分组的历史数据</td></tr></tbody></table><h3 id="historydata" tabindex="-1">HistoryData <a class="header-anchor" href="#historydata" aria-label="Permalink to &quot;HistoryData&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> HistoryData</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> HistoryItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> HistoryGroup</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[]</span></span></code></pre></div><p>表示历史数据可以是：</p><ol><li>直接的历史项数组 <code>HistoryItem[]</code></li><li>分组的历史项数组 <code>HistoryGroup[]</code></li></ol><h3 id="historygroup" tabindex="-1">HistoryGroup <a class="header-anchor" href="#historygroup" aria-label="Permalink to &quot;HistoryGroup&quot;">​</a></h3><p>| 属性 | 类型 | 说明 | | ------- | --------------- | -------------------- | -------- | | <code>group</code> | <code>string | symbol</code> | 分组标识 | | <code>items</code> | <code>HistoryItem[]</code> | 该分组下的历史项列表 |</p><h3 id="historyitemtagprops" tabindex="-1">HistoryItemTagProps <a class="header-anchor" href="#historyitemtagprops" aria-label="Permalink to &quot;HistoryItemTagProps&quot;">​</a></h3><p>| 属性 | 类型 | 说明 | | ------- | --------------- | ---------- | ------- | ------ | ---------- | ---------------------- | | <code>text</code> | <code>string</code> | 标签文本 | | <code>type</code> | <code>&#39;success&#39; | &#39;warning&#39; | &#39;error&#39; | &#39;info&#39; | &#39;default&#39;</code> | 标签类型，决定颜色样式 | | <code>style</code> | <code>CSSProperties</code> | 自定义样式 |</p><h3 id="historyitem" tabindex="-1">HistoryItem <a class="header-anchor" href="#historyitem" aria-label="Permalink to &quot;HistoryItem&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>id</code></td><td><code>string</code></td><td>唯一标识</td></tr><tr><td><code>title</code></td><td><code>string</code></td><td>标题</td></tr><tr><td><code>tag</code></td><td><code>HistoryItemTagProps</code></td><td>标签配置</td></tr><tr><td><code>data</code></td><td><code>T</code></td><td>自定义数据（泛型，默认为 <code>Record&lt;string, unknown&gt;</code>）</td></tr></tbody></table><h3 id="historyevents" tabindex="-1">HistoryEvents <a class="header-anchor" href="#historyevents" aria-label="Permalink to &quot;HistoryEvents&quot;">​</a></h3><table tabindex="0"><thead><tr><th>事件名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>close</code></td><td>-</td><td>关闭事件</td></tr><tr><td><code>item-click</code></td><td><code>item: HistoryItem</code></td><td>点击历史项时触发</td></tr><tr><td><code>item-title-change</code></td><td><code>newTitle: string, rawData: HistoryItem</code></td><td>标题修改时触发</td></tr><tr><td><code>item-delete</code></td><td><code>item: HistoryItem</code></td><td>删除历史项时触发</td></tr></tbody></table>',21))])}}});export{L as __pageData,Z as default};
