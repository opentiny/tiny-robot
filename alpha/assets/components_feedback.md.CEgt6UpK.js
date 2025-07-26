const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/custom-action-icon.B3QRwcYm.js","assets/chunks/index.DbIuHe0H.js","assets/chunks/tiny-robot-svgs.Dnkbi6us.js","assets/chunks/framework.WjEkGhiu.js","assets/chunks/index5.BgPA3y6E.js","assets/chunks/index2.DE8fSCLV.js","assets/chunks/index3.Wj-l2D0K.js","assets/chunks/index.w2_VBJes.js","assets/chunks/utils.DwCNla4E.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/tiny-robot-svgs.B2XD9sQ_.js","assets/chunks/limit.0au35ef1.js","assets/chunks/basic.D2Q9AQOx.js","assets/chunks/index.BwkskP7b.js","assets/chunks/index.DTUTkZ-1.js","assets/chunks/loading-shadow.BvaKwsHe.js"])))=>i.map(i=>d[i]);
import{D as m,v as u,V as b,p as A,C as g,c as T,o as P,ah as h,ag as k,G as n,j as i,ai as f,k as t,w as d,aj as y,a as l}from"./chunks/framework.WjEkGhiu.js";import{O as _,E as v}from"./chunks/index.DW9_sJEN.js";const w=`<template>
  <tr-feedback
    :operations="operations"
    :operations-limit="3"
    @operation="handleOperation"
    :actions="actions"
    :actions-limit="3"
    @action="handleAction"
  ></tr-feedback>
</template>

<script setup lang="ts">
import { FeedbackProps, TrFeedback } from '@opentiny/tiny-robot'
import { IconPin } from '@opentiny/tiny-robot-svgs'
import { h, resolveComponent } from 'vue'

const operations: FeedbackProps['operations'] = [
  {
    name: 'edit',
    label: '编辑',
  },
  {
    name: 'delete',
    label: '删除',
  },
]

const handleOperation = (name: string) => {
  console.log('operation', name)
}

const actions: FeedbackProps['actions'] = [
  { name: 'refresh', label: '刷新', icon: 'refresh' },
  { name: 'copy', label: '复制', icon: 'copy' },
  { name: 'pin', label: '置顶', icon: h(resolveComponent('TrIconButton'), { icon: IconPin }) },
  { name: 'like', label: '推荐', icon: 'like' },
  { name: 'dislike', label: '不推荐', icon: 'dislike' },
  { name: 'pin2', label: '置顶2', icon: h(resolveComponent('TrIconButton'), { icon: IconPin }) },
]

const handleAction = (name: string) => {
  console.log('action', name)
}
<\/script>
`,C=`<template>
  <tr-feedback
    :operations="operations"
    :operations-limit="3"
    :actions="actions"
    :actions-limit="3"
    :sources="sources"
    :sources-lines-limit="1"
    @operation="handleOperation"
    @action="handleAction"
  />
  <hr />
</template>

<script setup lang="ts">
import { FeedbackProps, TrFeedback } from '@opentiny/tiny-robot'

const operations: FeedbackProps['operations'] = [
  { name: 'operation1', label: '操作一', onClick: () => console.log('单独监听点击事件', 'operation1') },
  { name: 'operation2', label: '操作二' },
  { name: 'operation3', label: '操作三' },
  { name: 'operation4', label: '操作四' },
  { name: 'operation5', label: '操作五' },
]

const actions: FeedbackProps['actions'] = [
  { name: 'refresh', label: '刷新', icon: 'refresh' },
  { name: 'copy', label: '复制', icon: 'copy' },
  { name: 'like', label: '推荐', icon: 'like' },
  { name: 'dislike', label: '不推荐', icon: 'dislike' },
]

const sources = Array(6)
  .fill([
    { label: '来源1', link: 'https://www.baidu.com' },
    { label: '来源22', link: 'https://www.baidu.com' },
    { label: '来源3333333', link: 'https://www.baidu.com' },
  ])
  .flat()

const handleOperation = (name: string) => {
  console.log('操作:', name)
}

const handleAction = (name: string) => {
  console.log('动作:', name)
}
<\/script>
`,W=`<template>
  <tr-feedback
    :operations="showOperations ? operations : undefined"
    :actions="actions"
    :sources="sources"
    @operation="handleOperation"
    @action="handleAction"
  />
  <hr />
  <tiny-button @click="showOperations = !showOperations" :reset-time="0">
    {{ showOperations ? '隐藏操作' : '显示操作' }}
  </tiny-button>
</template>

<script setup lang="ts">
import { FeedbackProps, TrFeedback } from '@opentiny/tiny-robot'
import { TinyButton } from '@opentiny/vue'
import { ref } from 'vue'

const operations: FeedbackProps['operations'] = [
  {
    name: 'edit',
    label: '编辑',
    onClick: () => console.log('点击了编辑按钮'),
  },
  {
    name: 'delete',
    label: '删除',
  },
]

const showOperations = ref(true)

const actions: FeedbackProps['actions'] = [
  {
    name: 'copy',
    label: '复制',
    icon: 'copy',
  },
  {
    name: 'refresh',
    label: '刷新',
    icon: 'refresh',
  },
]

const sources: FeedbackProps['sources'] = [
  {
    label: '数据来源1',
    link: 'https://example.com/source1',
  },
  {
    label: '数据来源2',
    link: 'https://example.com/source2',
  },
]

const handleOperation = (name: string) => {
  console.log('操作:', name)
}

const handleAction = (name: string) => {
  console.log('动作:', name)
}
<\/script>
`,V=JSON.parse('{"title":"Feedback 气泡反馈","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/feedback.md","filePath":"components/feedback.md"}'),D={name:"components/feedback.md"},q=Object.assign(D,{setup(Z){const c=m();u(async()=>{c.value=(await b(async()=>{const{default:a}=await import("./chunks/custom-action-icon.B3QRwcYm.js");return{default:a}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10]))).default});const s=m();u(async()=>{s.value=(await b(async()=>{const{default:a}=await import("./chunks/limit.0au35ef1.js");return{default:a}},__vite__mapDeps([11,1,2,3,4,5,6,7,8,9]))).default});const o=A(!0),r=m();return u(async()=>{r.value=(await b(async()=>{const{default:a}=await import("./chunks/basic.D2Q9AQOx.js");return{default:a}},__vite__mapDeps([12,1,2,3,4,5,6,7,8,9,13,14,15]))).default}),(a,e)=>{const p=g("ClientOnly");return P(),T("div",null,[e[3]||(e[3]=h('<h1 id="feedback-气泡反馈" tabindex="-1">Feedback 气泡反馈 <a class="header-anchor" href="#feedback-气泡反馈" aria-label="Permalink to &quot;Feedback 气泡反馈&quot;">​</a></h1><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基本示例" tabindex="-1">基本示例 <a class="header-anchor" href="#基本示例" aria-label="Permalink to &quot;基本示例&quot;">​</a></h3><p>基本示例</p><p>注意：<code>operations</code> 和 <code>actions</code> 中的 <code>name</code> 属性必须唯一。点击后，会响应 <code>operation</code> 或 <code>action</code> 事件，参数则为 <code>name</code></p><p>另外，<code>operations</code> 和 <code>actions</code> 的每一项可以单独设置 <code>onClick</code> 回调，和 <code>operation</code> 或 <code>action</code> 事件会同时触发</p>',6)),k(n(t(_),null,null,512),[[f,o.value]]),n(p,null,{default:d(()=>[n(t(v),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[0]||(e[0]=()=>{o.value=!1}),vueCode:t(W)},y({_:2},[r.value?{name:"vue",fn:d(()=>[n(t(r))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[4]||(e[4]=i("h3",{id:"控制显示数量",tabindex:"-1"},[l("控制显示数量 "),i("a",{class:"header-anchor",href:"#控制显示数量","aria-label":'Permalink to "控制显示数量"'},"​")],-1)),e[5]||(e[5]=i("p",null,[l("使用 "),i("code",null,"operations-limit"),l("，"),i("code",null,"actions-limit"),l("，"),i("code",null,"sources-lines-limit"),l(" 来分别控制左侧操作按钮、右侧动作按钮和底部来源展开后显示的最大数量或行数")],-1)),k(n(t(_),null,null,512),[[f,o.value]]),n(p,null,{default:d(()=>[n(t(v),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[1]||(e[1]=()=>{o.value=!1}),vueCode:t(C)},y({_:2},[s.value?{name:"vue",fn:d(()=>[n(t(s))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[6]||(e[6]=h('<h3 id="自定义动作图标" tabindex="-1">自定义动作图标 <a class="header-anchor" href="#自定义动作图标" aria-label="Permalink to &quot;自定义动作图标&quot;">​</a></h3><p><code>action</code> 内置支持的图标有：<code>copy</code>、<code>refresh</code>、<code>like</code>、<code>dislike</code>。可设置 <code>action.icon</code> 传入自定义图标，支持 <code>VNode</code> 或 <code>Component</code></p>',2)),k(n(t(_),null,null,512),[[f,o.value]]),n(p,null,{default:d(()=>[n(t(v),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:e[2]||(e[2]=()=>{o.value=!1}),vueCode:t(w)},y({_:2},[c.value?{name:"vue",fn:d(()=>[n(t(c))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),e[7]||(e[7]=h('<h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="feedbackprops" tabindex="-1">FeedbackProps <a class="header-anchor" href="#feedbackprops" aria-label="Permalink to &quot;FeedbackProps&quot;">​</a></h3><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>必填</th><th>说明</th></tr></thead><tbody><tr><td><code>operations</code></td><td><code>Array&lt;{ name: string; label: string; onClick?: () =&gt; void }&gt;</code></td><td>否</td><td>操作按钮配置数组</td></tr><tr><td><code>operationsLimit</code></td><td><code>number</code></td><td>否</td><td>默认显示的操作按钮数量，超出部分会折叠</td></tr><tr><td><code>actions</code></td><td><code>Array&lt;{ name: string; label: string; icon?: &#39;copy&#39; | &#39;refresh&#39; | &#39;like&#39;| &#39;dislike&#39; | VNode | Component; onClick?: () =&gt; void }&gt;</code></td><td>否</td><td>动作按钮配置数组</td></tr><tr><td><code>actionsLimit</code></td><td><code>number</code></td><td>否</td><td>默认显示的动作按钮数量，超出部分会折叠</td></tr><tr><td><code>sources</code></td><td><code>Array&lt;{ label: string; link: string }&gt;</code></td><td>否</td><td>数据来源链接配置数组</td></tr><tr><td><code>sourcesLinesLimit</code></td><td><code>number</code></td><td>否</td><td>默认显示的数据来源行数，超出部分会折叠</td></tr></tbody></table><h3 id="feedbackevents" tabindex="-1">FeedbackEvents <a class="header-anchor" href="#feedbackevents" aria-label="Permalink to &quot;FeedbackEvents&quot;">​</a></h3><table tabindex="0"><thead><tr><th>事件名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>operation</code></td><td><code>name: string</code></td><td>当点击操作按钮时触发，返回操作名称</td></tr><tr><td><code>action</code></td><td><code>name: string</code></td><td>当点击动作按钮时触发，返回动作名称</td></tr></tbody></table>',5))])}}});export{V as __pageData,q as default};
