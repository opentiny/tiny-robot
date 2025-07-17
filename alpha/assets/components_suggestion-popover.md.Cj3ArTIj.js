const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/popover-other-status.FWSMkuKQ.js","assets/chunks/index.BwQ_pUO6.js","assets/chunks/framework.CBhkkd1d.js","assets/chunks/index2.lf0lWHKg.js","assets/chunks/index3.MK1UNZfa.js","assets/chunks/utils.D1YSndqS.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/tiny-robot-svgs.DjZeQ69T.js","assets/chunks/index.B-t13XQj.js","assets/chunks/popover-grouped.CnAjCMpc.js","assets/chunks/tiny-robot-svgs.C0qvPHkC.js","assets/chunks/popover-trigger.Cb7NlHfS.js","assets/chunks/popover-basic.DMF7ou_C.js"])))=>i.map(i=>d[i]);
import{D as s,v as r,V as c,p as x,C as P,c as S,o as Z,ag as _,ah as u,G as e,j as i,ai as p,k as o,w as a,aj as g,a as h}from"./chunks/framework.CBhkkd1d.js";import{O as b,E as m}from"./chunks/index.D3YLhVKP.js";const I=`<template>
  <div style="display: flex; gap: 8px; justify-content: space-around">
    <SuggestionPopover :data="[]" :loading="true">
      <button>加载中状态</button>
    </SuggestionPopover>
    <SuggestionPopover :data="[]">
      <button>空状态</button>
    </SuggestionPopover>
  </div>
</template>

<script setup lang="ts">
import { SuggestionPopover } from '@opentiny/tiny-robot'
<\/script>
`,W=`<template>
  <SuggestionPopover
    :data="groups"
    :selectedGroup="selectedGroup"
    @item-click="(item) => console.log(item)"
    @group-click="(group) => console.log(group)"
  >
    <button>分组数据</button>
  </SuggestionPopover>
</template>

<script setup lang="ts">
import { SuggestionPopover } from '@opentiny/tiny-robot'
import { IconLike, IconDislike } from '@opentiny/tiny-robot-svgs'
import { ref } from 'vue'

const groups = [
  {
    group: 'basic',
    label: '推荐',
    icon: IconLike,
    items: [
      { id: 'b1', text: '什么是弹性云服务器?' },
      { id: 'b2', text: '如何登录到Windows云服务器?' },
      { id: 'b3', text: '弹性公网IP为什么ping不通?' },
      { id: 'b4', text: '云服务器安全组如何配置?' },
      { id: 'b5', text: '如何查看云服务器密码?' },
      { id: 'b6', text: '什么是弹性云服务器?' },
      { id: 'b7', text: '如何登录到Windows云服务器?' },
      { id: 'b8', text: '弹性公网IP为什么ping不通?' },
      { id: 'b9', text: '云服务器安全组如何配置?' },
      { id: 'b0', text: '如何查看云服务器密码?' },
    ],
  },
  {
    group: 'purchase',
    label: '购买咨询',
    icon: IconDislike,
    items: [
      { id: 'p1', text: '如何购买弹性云服务器?' },
      { id: 'p2', text: '无法登录弹性云服务器怎么办?' },
      { id: 'p3', text: '云服务器价格怎么计算?' },
      { id: 'p4', text: '如何查看账单详情?' },
      { id: 'p5', text: '如何续费云服务器?' },
    ],
  },
  {
    group: 'usage',
    label: '使用咨询',
    icon: IconLike,
    items: [
      { id: 'u1', text: '云服务器使用限制与须知' },
      { id: 'u2', text: '使用RDP文件连接Windows实例' },
      { id: 'u3', text: '多用户登录（Windows2016）' },
      { id: 'u4', text: '如何重置云服务器密码?' },
      { id: 'u5', text: '云服务器如何安装软件?' },
    ],
  },
  { group: '4', label: '推荐', icon: IconLike, items: [] },
  { group: '5', label: '购买咨询', icon: IconLike, items: [] },
  { group: '6', label: '使用咨询', icon: IconLike, items: [] },
  { group: '7', label: '购买咨询', icon: IconLike, items: [] },
  { group: '8', label: '使用咨询', icon: IconLike, items: [] },
  { group: '9', label: '购买咨询', icon: IconLike, items: [] },
  { group: '10', label: '使用咨询', icon: IconLike, items: [] },
]

const selectedGroup = ref(groups[1].group)
<\/script>
`,X=`<template>
  <div style="display: flex; gap: 8px; justify-content: space-around">
    <SuggestionPopover
      :data="data"
      trigger="click"
      @open="console.log('open')"
      @close="console.log('close')"
      @item-click="console.log('item-click')"
      @click-outside="console.log('click-outside')"
    >
      <button>click触发</button>
    </SuggestionPopover>
    <SuggestionPopover
      :data="data"
      :show="show"
      trigger="manual"
      @close="handleClose"
      @item-click="console.log('item-click')"
      @click-outside="console.log('click-outside')"
    >
      <button @click="show = !show">manual触发</button>
    </SuggestionPopover>
  </div>
</template>

<script setup lang="ts">
import { SuggestionPopover } from '@opentiny/tiny-robot'
import { ref } from 'vue'

const show = ref(false)

const handleClose = () => {
  console.log('close')
  show.value = false
}

const data = [
  { id: 'b1', text: '什么是弹性云服务器?' },
  { id: 'b2', text: '如何登录到Windows云服务器?' },
  { id: 'b3', text: '弹性公网IP为什么ping不通?' },
  { id: 'b4', text: '云服务器安全组如何配置?' },
  { id: 'b5', text: '如何查看云服务器密码?' },
  { id: 'b6', text: '什么是弹性云服务器?' },
  { id: 'b7', text: '如何登录到Windows云服务器?' },
  { id: 'b8', text: '弹性公网IP为什么ping不通?' },
  { id: 'b9', text: '云服务器安全组如何配置?' },
  { id: 'b0', text: '如何查看云服务器密码?' },
]
<\/script>
`,D=`<template>
  <SuggestionPopover :data="data" @item-click="(item) => console.log(item)">
    <button>点击弹出SuggestionPopover</button>
  </SuggestionPopover>
</template>

<script setup lang="ts">
import { SuggestionPopover } from '@opentiny/tiny-robot'

const data = [
  { id: 'b1', text: '什么是弹性云服务器?' },
  { id: 'b2', text: '如何登录到Windows云服务器?' },
  { id: 'b3', text: '弹性公网IP为什么ping不通?' },
  { id: 'b4', text: '云服务器安全组如何配置云服务器安全组如何配置云服务器安全组如何配置?' },
  { id: 'b5', text: '如何查看云服务器密码如何查看云服务器密码如何查看云服务器密码如何查看云服务器密码?' },
  { id: 'b6', text: '什么是弹性云服务器什么是弹性云服务器什么是弹性云服务器什么是弹性云服务器什么是弹性云服务器?' },
  {
    id: 'b7',
    text: '如何登录到Windows云服务器如何登录到Windows云服务器如何登录到Windows云服务器如何登录到Windows云服务器?',
  },
  { id: 'b8', text: '弹性公网IP为什么ping不通?' },
  { id: 'b9', text: '云服务器安全组如何配置?' },
  { id: 'b0', text: '如何查看云服务器密码?' },
]
<\/script>
`,q=JSON.parse('{"title":"SuggestionPopover 建议弹出框","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/suggestion-popover.md","filePath":"components/suggestion-popover.md"}'),w={name:"components/suggestion-popover.md"},C=Object.assign(w,{setup(T){const v=s();r(async()=>{v.value=(await c(async()=>{const{default:n}=await import("./chunks/popover-other-status.FWSMkuKQ.js");return{default:n}},__vite__mapDeps([0,1,2,3,4,5,6,7,8]))).default});const k=s();r(async()=>{k.value=(await c(async()=>{const{default:n}=await import("./chunks/popover-grouped.CnAjCMpc.js");return{default:n}},__vite__mapDeps([9,1,2,3,4,5,6,7,8,10]))).default});const y=s();r(async()=>{y.value=(await c(async()=>{const{default:n}=await import("./chunks/popover-trigger.Cb7NlHfS.js");return{default:n}},__vite__mapDeps([11,1,2,3,4,5,6,7,8]))).default});const d=x(!0),f=s();return r(async()=>{f.value=(await c(async()=>{const{default:n}=await import("./chunks/popover-basic.DMF7ou_C.js");return{default:n}},__vite__mapDeps([12,1,2,3,4,5,6,7,8]))).default}),(n,t)=>{const l=P("ClientOnly");return Z(),S("div",null,[t[4]||(t[4]=_('<h1 id="suggestionpopover-建议弹出框" tabindex="-1">SuggestionPopover 建议弹出框 <a class="header-anchor" href="#suggestionpopover-建议弹出框" aria-label="Permalink to &quot;SuggestionPopover 建议弹出框&quot;">​</a></h1><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基本示例" tabindex="-1">基本示例 <a class="header-anchor" href="#基本示例" aria-label="Permalink to &quot;基本示例&quot;">​</a></h3><p>使用 <code>data</code> 传入数据，</p>',4)),u(e(o(b),null,null,512),[[p,d.value]]),e(l,null,{default:a(()=>[e(o(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[0]||(t[0]=()=>{d.value=!1}),vueCode:o(D)},g({_:2},[f.value?{name:"vue",fn:a(()=>[e(o(f))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[5]||(t[5]=_('<h3 id="触发方式" tabindex="-1">触发方式 <a class="header-anchor" href="#触发方式" aria-label="Permalink to &quot;触发方式&quot;">​</a></h3><p>使用 <code>trggier</code> 来决定弹出框的触发方式。目前有 <code>click</code> 和 <code>manual</code> 两种方式，默认为 <code>click</code>。<code>trggier</code> 为 <code>manual</code> 时，需要你手动修改弹出框显示状态</p>',2)),u(e(o(b),null,null,512),[[p,d.value]]),e(l,null,{default:a(()=>[e(o(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[1]||(t[1]=()=>{d.value=!1}),vueCode:o(X)},g({_:2},[y.value?{name:"vue",fn:a(()=>[e(o(y))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[6]||(t[6]=i("h3",{id:"分组数据",tabindex:"-1"},[h("分组数据 "),i("a",{class:"header-anchor",href:"#分组数据","aria-label":'Permalink to "分组数据"'},"​")],-1)),t[7]||(t[7]=i("p",null,[i("code",null,"data"),h(" 数组中的项，添加 "),i("code",null,"group"),h(" 字段来表示为分组数据。分组数据和普通数据不能混合")],-1)),u(e(o(b),null,null,512),[[p,d.value]]),e(l,null,{default:a(()=>[e(o(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[2]||(t[2]=()=>{d.value=!1}),vueCode:o(W)},g({_:2},[k.value?{name:"vue",fn:a(()=>[e(o(k))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[8]||(t[8]=i("h3",{id:"加载中和空数据",tabindex:"-1"},[h("加载中和空数据 "),i("a",{class:"header-anchor",href:"#加载中和空数据","aria-label":'Permalink to "加载中和空数据"'},"​")],-1)),u(e(o(b),null,null,512),[[p,d.value]]),e(l,null,{default:a(()=>[e(o(m),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[3]||(t[3]=()=>{d.value=!1}),vueCode:o(I)},g({_:2},[v.value?{name:"vue",fn:a(()=>[e(o(v))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[9]||(t[9]=_('<h3 id="移动端适配" tabindex="-1">移动端适配 <a class="header-anchor" href="#移动端适配" aria-label="Permalink to &quot;移动端适配&quot;">​</a></h3><blockquote><p>目前移动端判断逻辑是，视窗宽度小于 768px</p></blockquote><p>将窗口宽度缩小到 768px，可以点击查看上面的示例</p><h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h3><p>弹出框属性配置。</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>data</code></td><td><code>SuggestionData</code></td><td>-</td><td><strong>必填</strong>，建议数据</td></tr><tr><td><code>title</code></td><td><code>string</code></td><td>-</td><td>弹出框标题</td></tr><tr><td><code>icon</code></td><td><code>VNode | Component</code></td><td>-</td><td>标题图标</td></tr><tr><td><code>show</code></td><td><code>boolean</code></td><td>-</td><td>控制弹出框显示/隐藏，仅在 trigger 为 &#39;manual&#39; 时有效</td></tr><tr><td><code>trigger</code></td><td><code>&#39;click&#39; | &#39;manual&#39;</code></td><td><code>&#39;click&#39;</code></td><td>触发方式：点击或手动控制</td></tr><tr><td><code>selectedGroup</code></td><td><code>string</code></td><td>-</td><td>当前选中分组 (v-model)</td></tr><tr><td><code>groupShowMoreTrigger</code></td><td><code>&#39;click&#39; | &#39;hover&#39;</code></td><td>-</td><td>分组&quot;显示更多&quot;的触发方式</td></tr><tr><td><code>loading</code></td><td><code>boolean</code></td><td><code>false</code></td><td>是否显示加载状态</td></tr><tr><td><code>topOffset</code></td><td><code>number</code></td><td>-</td><td>顶部偏移量</td></tr></tbody></table><h3 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h3><p>弹出框插槽定义。</p><table tabindex="0"><thead><tr><th>插槽名</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>default</code></td><td><code>() =&gt; unknown</code></td><td>自定义内容插槽</td></tr><tr><td><code>loading</code></td><td><code>() =&gt; unknown</code></td><td>自定义加载状态显示</td></tr><tr><td><code>empty</code></td><td><code>() =&gt; unknown</code></td><td>自定义空状态显示</td></tr></tbody></table><h3 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h3><p>弹出框事件定义。</p><table tabindex="0"><thead><tr><th>事件名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>item-click</code></td><td><code>item: SuggestionItem</code></td><td>点击建议项时触发</td></tr><tr><td><code>group-click</code></td><td><code>group: SuggestionGroup</code></td><td>点击分组时触发</td></tr><tr><td><code>open</code></td><td>-</td><td>弹窗打开时触发</td></tr><tr><td><code>close</code></td><td>-</td><td>弹窗关闭时触发</td></tr><tr><td><code>click-outside</code></td><td><code>event: MouseEvent</code></td><td>点击弹窗外部区域时触发</td></tr></tbody></table><h3 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h3><h4 id="suggestionitem" tabindex="-1">SuggestionItem <a class="header-anchor" href="#suggestionitem" aria-label="Permalink to &quot;SuggestionItem&quot;">​</a></h4><p>建议项数据结构。</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>id</code></td><td><code>string</code></td><td>项唯一标识</td></tr><tr><td><code>text</code></td><td><code>string</code></td><td>显示文本</td></tr></tbody></table><h4 id="suggestiongroup" tabindex="-1">SuggestionGroup <a class="header-anchor" href="#suggestiongroup" aria-label="Permalink to &quot;SuggestionGroup&quot;">​</a></h4><p>建议分组数据结构。</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>group</code></td><td><code>string</code></td><td>分组标识</td></tr><tr><td><code>label</code></td><td><code>string</code></td><td>分组显示名称</td></tr><tr><td><code>icon</code></td><td><code>VNode | Component</code></td><td>分组图标</td></tr><tr><td><code>items</code></td><td><code>SuggestionItem[]</code></td><td>分组下的建议项</td></tr></tbody></table><h4 id="suggestiondata" tabindex="-1">SuggestionData <a class="header-anchor" href="#suggestiondata" aria-label="Permalink to &quot;SuggestionData&quot;">​</a></h4><p>建议数据联合类型：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SuggestionData</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> (</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">SuggestionItem</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SuggestionGroup</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)[]</span></span></code></pre></div><p>表示数据可以是：</p><ul><li>平铺的建议项数组 <code>SuggestionItem[]</code></li><li>分组的建议项数组 <code>SuggestionGroup[]</code></li></ul>',25))])}}});export{q as __pageData,C as default};
