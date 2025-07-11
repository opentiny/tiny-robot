const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/basic.CWo-8JRR.js","assets/chunks/index.cxSKZGKH.js","assets/chunks/framework.kTfunus-.js","assets/chunks/tiny-robot-svgs.BaAiG9Fu.js","assets/chunks/index2.DXNIapAb.js","assets/chunks/utils.D1YSndqS.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/index.CbhXsEHC.js","assets/chunks/index.DM95O2dU.js"])))=>i.map(i=>d[i]);
import{p as a,v as s,V as u,C as h,c as p,o as m,ag as l,ah as b,G as e,ai as g,k as d,w as i}from"./chunks/framework.kTfunus-.js";import{O as w,E as _}from"./chunks/index.Bs5OpVoR.js";const f=`<template>
  <TrDropdownMenu :items="dropdownMenuItems" @item-click="(item) => console.log(item)">
    <template #trigger>
      <TrSuggestionPillButton> 点我打开Dropdown Menu </TrSuggestionPillButton>
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

const handleClickOutside = (ev: MouseEvent) => {
  console.log('click-outside', ev)
}
<\/script>
`,M=JSON.parse('{"title":"DropdownMenu 下拉菜单","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/dropdown-menu.md","filePath":"components/dropdown-menu.md"}'),v={name:"components/dropdown-menu.md"},x=Object.assign(v,{setup(T){const o=a(!0),n=a();return s(async()=>{n.value=(await u(async()=>{const{default:r}=await import("./chunks/basic.CWo-8JRR.js");return{default:r}},__vite__mapDeps([0,1,2,3,4,5,6,7,8]))).default}),(r,t)=>{const c=h("ClientOnly");return m(),p("div",null,[t[1]||(t[1]=l('<h1 id="dropdownmenu-下拉菜单" tabindex="-1">DropdownMenu 下拉菜单 <a class="header-anchor" href="#dropdownmenu-下拉菜单" aria-label="Permalink to &quot;DropdownMenu 下拉菜单&quot;">​</a></h1><p>此组件目前仅针对 SuggestionPills 组件开发，可配置项暂不全面</p><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基本示例" tabindex="-1">基本示例 <a class="header-anchor" href="#基本示例" aria-label="Permalink to &quot;基本示例&quot;">​</a></h3>',4)),b(e(d(w),null,null,512),[[g,o.value]]),e(c,null,{default:i(()=>[e(d(_),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[0]||(t[0]=()=>{o.value=!1}),vueCode:d(f)},{vue:i(()=>[e(d(n))]),_:1},8,["vueCode"])]),_:1}),t[2]||(t[2]=l('<h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h3><p>下拉菜单属性配置。</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>appendTo</code></td><td><code>string | HTMLElement</code></td><td><code>&#39;body&#39;</code> 或者 shadow dom 的根节点</td><td>菜单挂载的目标容器</td></tr><tr><td><code>items</code></td><td><code>DropdownMenuItem[]</code></td><td>-</td><td><strong>必填</strong>，菜单项数据数组</td></tr><tr><td><code>show</code></td><td><code>boolean</code></td><td>-</td><td>是否显示菜单，仅在 <code>trigger</code> 为 <code>&#39;manual&#39;</code> 时有效</td></tr><tr><td><code>trigger</code></td><td><code>&#39;click&#39; | &#39;hover&#39; | &#39;manual&#39;</code></td><td><code>&#39;click&#39;</code></td><td>菜单触发方式：点击、悬停或手动控制</td></tr></tbody></table><h3 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h3><p>下拉菜单插槽定义。</p><table tabindex="0"><thead><tr><th>插槽名</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>trigger</code></td><td><code>() =&gt; VNode | VNode[]</code></td><td>自定义触发元素插槽</td></tr></tbody></table><h3 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h3><p>下拉菜单事件定义。</p><table tabindex="0"><thead><tr><th>事件名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>item-click</code></td><td><code>item: DropdownMenuItem</code></td><td>点击菜单项时触发</td></tr><tr><td><code>click-outside</code></td><td><code>event: MouseEvent</code></td><td>点击菜单外部区域时触发（仅在 <code>trigger</code> 为 <code>&#39;click&#39;</code> 或 <code>&#39;manual&#39;</code> 时有效）</td></tr></tbody></table><h3 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h3><h4 id="dropdownmenuitem" tabindex="-1">DropdownMenuItem <a class="header-anchor" href="#dropdownmenuitem" aria-label="Permalink to &quot;DropdownMenuItem&quot;">​</a></h4><p>菜单项数据结构。</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>id</code></td><td><code>string</code></td><td>菜单项唯一标识</td></tr><tr><td><code>text</code></td><td><code>string</code></td><td>菜单项显示文本</td></tr></tbody></table><h3 id="css-variables" tabindex="-1">CSS Variables <a class="header-anchor" href="#css-variables" aria-label="Permalink to &quot;CSS Variables&quot;">​</a></h3><table tabindex="0"><thead><tr><th>变量名</th><th>说明</th><th>默认值</th></tr></thead><tbody><tr><td><code>--tr-dropdown-menu-bg-color</code></td><td>下拉菜单背景色</td><td><code>#ffffff</code></td></tr><tr><td><code>--tr-dropdown-menu-box-shadow</code></td><td>下拉菜单阴影</td><td><code>0 0 20px rgba(0, 0, 0, 0.08)</code></td></tr><tr><td><code>--tr-dropdown-menu-min-width</code></td><td>下拉菜单最小宽度</td><td><code>130px</code></td></tr><tr><td><code>--tr-dropdown-menu-item-color</code></td><td>菜单项文字颜色</td><td><code>rgb(25, 25, 25)</code></td></tr><tr><td><code>--tr-dropdown-menu-item-hover-bg-color</code></td><td>菜单项悬停时背景色</td><td><code>#f5f5f5</code></td></tr><tr><td><code>--tr-dropdown-menu-item-font-weight</code></td><td>菜单项字体粗细</td><td><code>normal</code></td></tr></tbody></table>',16))])}}});export{M as __pageData,x as default};
