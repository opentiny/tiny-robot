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
`,B=JSON.parse('{"title":"History","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/history.md","filePath":"components/history.md"}'),D={name:"components/history.md"},H=Object.assign(D,{setup(E){const a=l();h(async()=>{a.value=(await c(async()=>{const{default:i}=await import("./chunks/empty.CN-rLQsy.js");return{default:i}},__vite__mapDeps([0,1,2]))).default});const o=f(!0),s=l();return h(async()=>{s.value=(await c(async()=>{const{default:i}=await import("./chunks/basic.XAZqRqLG.js");return{default:i}},__vite__mapDeps([3,1,2]))).default}),(i,t)=>{const n=v("ClientOnly");return T(),_("div",null,[t[2]||(t[2]=p('<h1 id="history" tabindex="-1">History <a class="header-anchor" href="#history" aria-label="Permalink to &quot;History&quot;">​</a></h1><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基本示例" tabindex="-1">基本示例 <a class="header-anchor" href="#基本示例" aria-label="Permalink to &quot;基本示例&quot;">​</a></h3><p>直接传入数组数据，或者传入分组数据。</p>',4)),y(e(d(k),null,null,512),[[u,o.value]]),e(n,null,{default:r(()=>[e(d(g),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:t[0]||(t[0]=()=>{o.value=!1}),vueCode:d(w)},b({_:2},[s.value?{name:"vue",fn:r(()=>[e(d(s))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[3]||(t[3]=m("h3",{id:"空状态",tabindex:"-1"},[x("空状态 "),m("a",{class:"header-anchor",href:"#空状态","aria-label":'Permalink to "空状态"'},"​")],-1)),y(e(d(k),null,null,512),[[u,o.value]]),e(n,null,{default:r(()=>[e(d(g),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:t[1]||(t[1]=()=>{o.value=!1}),vueCode:d(C)},b({_:2},[a.value?{name:"vue",fn:r(()=>[e(d(a))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[4]||(t[4]=p('<h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>必填</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>data</code></td><td><code>HistoryData&lt;T&gt;</code></td><td>是</td><td>-</td><td>历史数据（可以是 <code>HistoryItem[]</code> 或 <code>HistoryGroup[]</code>）</td></tr><tr><td><code>selected</code></td><td><code>string</code></td><td>否</td><td>-</td><td>当前选中的历史项ID</td></tr><tr><td><code>showRenameControls</code></td><td><code>boolean</code></td><td>否</td><td><code>false</code></td><td>是否显示重命名控制按钮</td></tr><tr><td><code>renameControlOnClickOutside</code></td><td><code>&#39;confirm&#39; | &#39;cancel&#39; | &#39;none&#39;</code></td><td>否</td><td><code>&#39;confirm&#39;</code></td><td>点击外部时的重命名控制行为：确认、取消或不处理</td></tr></tbody></table><h3 id="historydata" tabindex="-1">HistoryData <a class="header-anchor" href="#historydata" aria-label="Permalink to &quot;HistoryData&quot;">​</a></h3><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> HistoryData</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">T</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> extends</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> HistoryItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">[] </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> HistoryGroup</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;[]</span></span></code></pre></div><p>表示历史数据可以是：</p><ol><li>直接的历史项数组 <code>T[]</code></li><li>分组的历史项数组 <code>HistoryGroup&lt;T&gt;[]</code></li></ol><h3 id="historygroup" tabindex="-1">HistoryGroup <a class="header-anchor" href="#historygroup" aria-label="Permalink to &quot;HistoryGroup&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>group</code></td><td><code>string | symbol</code></td><td>分组标识</td></tr><tr><td><code>items</code></td><td><code>T[]</code></td><td>该分组下的历史项列表</td></tr></tbody></table><h3 id="historyitem" tabindex="-1">HistoryItem <a class="header-anchor" href="#historyitem" aria-label="Permalink to &quot;HistoryItem&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>id</code></td><td><code>string</code></td><td>唯一标识（可选）</td></tr><tr><td><code>title</code></td><td><code>string</code></td><td>标题</td></tr><tr><td><code>[x: string]</code></td><td><code>unknown</code></td><td>其他自定义属性</td></tr></tbody></table><h3 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h3><table tabindex="0"><thead><tr><th>事件名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>item-click</code></td><td><code>item: T</code></td><td>点击历史项时触发</td></tr><tr><td><code>item-title-change</code></td><td><code>newTitle: string, item: T</code></td><td>标题修改时触发</td></tr><tr><td><code>item-action</code></td><td><code>action: { id: string; text: string }, item: T</code></td><td>点击菜单项时触发</td></tr></tbody></table><h3 id="css-变量" tabindex="-1">CSS 变量 <a class="header-anchor" href="#css-变量" aria-label="Permalink to &quot;CSS 变量&quot;">​</a></h3><p>分组</p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-history-group-space-y</code></td><td>分组之间的垂直间距</td></tr><tr><td><code>--tr-history-group-title-font-size</code></td><td>分组标题字体大小</td></tr><tr><td><code>--tr-history-group-title-line-height</code></td><td>分组标题行高</td></tr><tr><td><code>--tr-history-group-title-padding</code></td><td>分组标题内边距</td></tr><tr><td><code>--tr-history-group-title-color</code></td><td>分组标题颜色</td></tr></tbody></table><p>历史项</p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-history-item-font-size</code></td><td>历史项字体大小</td></tr><tr><td><code>--tr-history-item-line-height</code></td><td>历史项行高</td></tr><tr><td><code>--tr-history-item-color</code></td><td>历史项文字颜色</td></tr><tr><td><code>--tr-history-item-padding</code></td><td>历史项内边距</td></tr><tr><td><code>--tr-history-item-padding-editing</code></td><td>编辑状态下的内边距</td></tr><tr><td><code>--tr-history-item-hover-bg</code></td><td>悬停背景色</td></tr><tr><td><code>--tr-history-item-border-radius</code></td><td>历史项圆角</td></tr><tr><td><code>--tr-history-item-selected-bg</code></td><td>选中背景色</td></tr></tbody></table><p>操作按钮</p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-history-item-actions-gap</code></td><td>操作按钮之间的间距</td></tr><tr><td><code>--tr-history-item-action-bg-hover</code></td><td>按钮悬停背景色</td></tr></tbody></table><p>编辑器</p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-history-item-editor-border-color</code></td><td>编辑器边框颜色</td></tr><tr><td><code>--tr-history-item-editor-border-radius</code></td><td>编辑器圆角</td></tr><tr><td><code>--tr-history-item-editor-padding</code></td><td>编辑器内边距</td></tr><tr><td><code>--tr-history-item-editor-border-width</code></td><td>编辑器边框宽度</td></tr><tr><td><code>--tr-history-item-editor-confirm-color</code></td><td>确认按钮颜色</td></tr><tr><td><code>--tr-history-item-editor-cancel-color</code></td><td>取消按钮颜色</td></tr></tbody></table><p>空状态</p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-history-empty-padding</code></td><td>空状态内边距</td></tr></tbody></table><p>菜单列表</p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-history-menu-list-bg</code></td><td>菜单列表背景色</td></tr><tr><td><code>--tr-history-menu-list-bg-hover</code></td><td>菜单项悬停背景色</td></tr><tr><td><code>--tr-history-menu-list-box-shadow</code></td><td>菜单列表阴影</td></tr></tbody></table><p>菜单项</p><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th></tr></thead><tbody><tr><td><code>--tr-history-menu-item-color</code></td><td>菜单项文字颜色</td></tr><tr><td><code>--tr-history-menu-item-text-color-hover</code></td><td>菜单项悬停文字颜色</td></tr></tbody></table>',28))])}}});export{B as __pageData,H as default};
