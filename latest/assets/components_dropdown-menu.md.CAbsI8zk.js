const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/basic.BaeUsII9.js","assets/chunks/theme.DE5H-yyn.js","assets/chunks/framework.BrPBGZf4.js"])))=>i.map(i=>d[i]);
import{aD as a,bQ as s,aZ as u,aL as h,v as m,H as c,bL as p,bB as g,J as e,bk as o,bJ as l,G as b,b7 as w,aU as v}from"./chunks/framework.BrPBGZf4.js";import{L as f,N as _}from"./chunks/index.CIWzME_L.js";const k=`<template>
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
`,D=JSON.parse('{"title":"DropdownMenu 下拉菜单","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/dropdown-menu.md","filePath":"components/dropdown-menu.md"}'),T={name:"components/dropdown-menu.md"},M=Object.assign(T,{setup(x){const n=v(!0),d=w();return a(async()=>{d.value=(await s(async()=>{const{default:r}=await import("./chunks/basic.BaeUsII9.js");return{default:r}},__vite__mapDeps([0,1,2]))).default}),(r,t)=>{const i=u("ClientOnly");return h(),m("div",null,[t[1]||(t[1]=c('<h1 id="dropdownmenu-下拉菜单" tabindex="-1">DropdownMenu 下拉菜单 <a class="header-anchor" href="#dropdownmenu-下拉菜单" aria-label="Permalink to &quot;DropdownMenu 下拉菜单&quot;">​</a></h1><p>此组件目前仅针对 SuggestionPills 组件开发，可配置项暂不全面</p><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基本示例" tabindex="-1">基本示例 <a class="header-anchor" href="#基本示例" aria-label="Permalink to &quot;基本示例&quot;">​</a></h3>',4)),p(e(o(f),null,null,512),[[g,n.value]]),e(i,null,{default:l(()=>[e(o(_),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{n.value=!1}),vueCode:o(k)},b({_:2},[d.value?{name:"vue",fn:l(()=>[e(o(d))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[2]||(t[2]=c('<h2 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h2><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>必填</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>appendTo</code></td><td><code>string | HTMLElement</code></td><td>否</td><td>-</td><td>指定下拉菜单挂载的容器元素或选择器</td></tr><tr><td><code>items</code></td><td><code>DropdownMenuItem[]</code></td><td>是</td><td>-</td><td>菜单项数据数组</td></tr><tr><td><code>show</code></td><td><code>boolean</code></td><td>否</td><td>-</td><td>控制菜单显示状态：<br>• <code>click</code>/<code>hover</code> 模式：双向绑定(v-model:show)<br>• <code>manual</code> 模式：单向绑定</td></tr><tr><td><code>trigger</code></td><td><code>&#39;click&#39; | &#39;hover&#39; | &#39;manual&#39;</code></td><td>否</td><td><code>&#39;click&#39;</code></td><td>菜单触发方式：<br>• <code>click</code> - 点击触发<br>• <code>hover</code> - 悬停触发<br>• <code>manual</code> - 手动控制</td></tr></tbody></table><p><strong>属性详细说明</strong></p><ol><li><p><strong><code>show</code> 属性行为</strong>：</p><ul><li>当 <code>trigger</code> 为 <code>&#39;click&#39;</code> 或 <code>&#39;hover&#39;</code> 时： <ul><li>可作为双向绑定属性使用 (<code>v-model:show</code>)</li><li>组件内外均可修改显示状态</li></ul></li><li>当 <code>trigger</code> 为 <code>&#39;manual&#39;</code> 时： <ul><li>仅作为单向属性使用</li><li>组件内部不会自动修改此值</li></ul></li></ul></li><li><p><strong><code>trigger</code> 模式区别</strong>：</p><ul><li><code>click</code>：点击触发元素显示/隐藏菜单</li><li><code>hover</code>：鼠标悬停触发元素显示菜单，移出后隐藏</li><li><code>manual</code>：完全通过外部控制的显示状态</li></ul></li></ol><h2 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h2><table tabindex="0"><thead><tr><th>插槽名</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>trigger</code></td><td><code>() =&gt; VNode | VNode[]</code></td><td>自定义触发元素插槽</td></tr></tbody></table><h2 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h2><table tabindex="0"><thead><tr><th>事件名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>item-click</code></td><td><code>item: DropdownMenuItem</code></td><td>点击菜单项时触发</td></tr><tr><td><code>click-outside</code></td><td><code>event: MouseEvent</code></td><td>点击菜单外部区域时触发（仅在 <code>trigger</code> 为 <code>&#39;click&#39;</code> 或 <code>&#39;manual&#39;</code> 时有效）</td></tr></tbody></table><h2 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h2><p><strong>DropdownMenuItem</strong> - 菜单项数据结构</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>id</code></td><td><code>string</code></td><td>菜单项唯一标识</td></tr><tr><td><code>text</code></td><td><code>string</code></td><td>菜单项显示文本</td></tr></tbody></table><h2 id="css-变量" tabindex="-1">CSS 变量 <a class="header-anchor" href="#css-变量" aria-label="Permalink to &quot;CSS 变量&quot;">​</a></h2><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th><th>默认值</th></tr></thead><tbody><tr><td><code>--tr-dropdown-menu-bg-color</code></td><td>下拉菜单背景色</td><td><code>#ffffff</code></td></tr><tr><td><code>--tr-dropdown-menu-box-shadow</code></td><td>下拉菜单阴影</td><td><code>0 0 20px rgba(0, 0, 0, 0.08)</code></td></tr><tr><td><code>--tr-dropdown-menu-min-width</code></td><td>下拉菜单最小宽度</td><td><code>130px</code></td></tr><tr><td><code>--tr-dropdown-menu-item-color</code></td><td>菜单项文字颜色</td><td><code>rgb(25, 25, 25)</code></td></tr><tr><td><code>--tr-dropdown-menu-item-hover-bg-color</code></td><td>菜单项悬停时背景色</td><td><code>#f5f5f5</code></td></tr><tr><td><code>--tr-dropdown-menu-item-font-weight</code></td><td>菜单项字体粗细</td><td><code>normal</code></td></tr><tr><td><code>--tr-dropdown-menu-min-top</code></td><td>下拉菜单最小 <code>top</code> 值</td><td><code>0px</code></td></tr><tr><td><code>--tr-dropdown-menu-max-bottom</code></td><td>下拉菜单最大 <code>bottom</code> 值</td><td><code>100%</code></td></tr><tr><td><code>--tr-dropdown-menu-min-left</code></td><td>下拉菜单最小 <code>left</code> 值</td><td><code>0px</code></td></tr><tr><td><code>--tr-dropdown-menu-max-right</code></td><td>下拉菜单最大 <code>right</code> 值</td><td><code>100%</code></td></tr></tbody></table>',13))])}}});export{D as __pageData,M as default};
