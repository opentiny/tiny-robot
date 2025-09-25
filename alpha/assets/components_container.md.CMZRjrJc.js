const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/basic.C3aaMOBP.js","assets/chunks/theme.DkkYkddJ.js","assets/chunks/framework.CSeOnaMy.js"])))=>i.map(i=>d[i]);
import{p as l,D as h,v as c,V as p,C as k,c as u,o as b,a2 as d,af as y,G as e,ag as f,k as a,w as o,ai as m}from"./chunks/framework.CSeOnaMy.js";import{R as g,k as E}from"./chunks/index.B39_SCiv.js";const v=`<template>
  <tr-container v-model:show="show" v-model:fullscreen="fullscreen">
    <!-- 默认插槽 -->
    <div class="content">
      <p v-for="i in 20" :key="i">测试文本</p>
    </div>
    <!-- operations插槽 -->
    <template #operations>
      <tr-icon-button size="28" svg-size="20" :icon="IconNewSession" />
    </template>
    <!-- footer插槽 -->
    <template #footer>
      <div class="footer">这是 footer</div>
    </template>
  </tr-container>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <div>
      <label>show：</label>
      <tiny-switch v-model="show"></tiny-switch>
    </div>
    <div>
      <label>fullscreen：</label>
      <tiny-switch v-model="fullscreen"></tiny-switch>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrContainer, TrIconButton } from '@opentiny/tiny-robot'
import { IconNewSession } from '@opentiny/tiny-robot-svgs'
import { TinySwitch } from '@opentiny/vue'
import { ref } from 'vue'

const show = ref(false)
const fullscreen = ref(false)
<\/script>

<style lang="less" scoped>
.content {
  padding: 0 24px;
}

.footer {
  padding: 16px 24px;
}

.fullscreen {
  @media (min-width: 1280px) {
    .content,
    .footer {
      width: 1280px;
      margin: 0 auto;
    }
  }
}
</style>
`,w=JSON.parse('{"title":"Container 容器","description":"","frontmatter":{"outline":[1,3]},"headers":[],"relativePath":"components/container.md","filePath":"components/container.md"}'),_={name:"components/container.md"},S=Object.assign(_,{setup(C){const i=l(!0),n=h();return c(async()=>{n.value=(await p(async()=>{const{default:s}=await import("./chunks/basic.C3aaMOBP.js");return{default:s}},__vite__mapDeps([0,1,2]))).default}),(s,t)=>{const r=k("ClientOnly");return b(),u("div",null,[t[1]||(t[1]=d('<h1 id="container-容器" tabindex="-1">Container 容器 <a class="header-anchor" href="#container-容器" aria-label="Permalink to &quot;Container 容器&quot;">​</a></h1><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基本示例" tabindex="-1">基本示例 <a class="header-anchor" href="#基本示例" aria-label="Permalink to &quot;基本示例&quot;">​</a></h3><p>全屏模式下，<code>Container</code> 组件会加上 <code>fullscreen</code> 类名，此时可以使用选择器 <code>.fullscreen</code> 来设置自定义 default 或者 footer 插槽的样式。</p>',4)),y(e(a(g),null,null,512),[[f,i.value]]),e(r,null,{default:o(()=>[e(a(E),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",visible:!0,onMount:t[0]||(t[0]=()=>{i.value=!1}),vueCode:a(v)},m({_:2},[n.value?{name:"vue",fn:o(()=>[e(a(n))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[2]||(t[2]=d(`<h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Prop Name</th><th>Description</th><th>Type</th><th>Required</th><th>Default</th></tr></thead><tbody><tr><td><code>model:show</code></td><td>是否显示容器</td><td><code>boolean</code></td><td>✅</td><td>—</td></tr><tr><td><code>model:fullscreen</code></td><td>是否全屏模式</td><td><code>boolean</code></td><td>❌</td><td><code>false</code></td></tr><tr><td><code>title</code></td><td>容器标题</td><td><code>string</code></td><td>❌</td><td><code>&#39;OpenTiny NEXT&#39;</code></td></tr></tbody></table><hr><h3 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Slot Name</th><th>Description</th></tr></thead><tbody><tr><td><code>default</code></td><td>容器主体内容</td></tr><tr><td><code>title</code></td><td>自定义标题区域内容</td></tr><tr><td><code>operations</code></td><td>标题栏右侧操作区</td></tr><tr><td><code>footer</code></td><td>底部操作栏内容</td></tr></tbody></table><hr><h3 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h3><table tabindex="0"><thead><tr><th>Event Name</th><th>Description</th><th>Parameters</th></tr></thead><tbody><tr><td><code>close</code></td><td>容器关闭时触发</td><td>—</td></tr></tbody></table><hr><h3 id="css-变量" tabindex="-1">CSS 变量 <a class="header-anchor" href="#css-变量" aria-label="Permalink to &quot;CSS 变量&quot;">​</a></h3><p>Container 组件支持以下 CSS 变量来自定义样式：</p><h4 id="全局变量-root" tabindex="-1">全局变量 (<code>:root</code>) <a class="header-anchor" href="#全局变量-root" aria-label="Permalink to &quot;全局变量 (\`:root\`)&quot;">​</a></h4><table tabindex="0"><thead><tr><th>变量名</th><th>描述</th></tr></thead><tbody><tr><td><code>--tr-container-bg-color</code></td><td>容器背景色</td></tr><tr><td><code>--tr-container-border-color</code></td><td>容器边框色</td></tr><tr><td><code>--tr-container-border-width</code></td><td>容器边框宽度</td></tr><tr><td><code>--tr-container-header-operations-gap</code></td><td>操作按钮间距</td></tr><tr><td><code>--tr-container-header-padding</code></td><td>头部内边距</td></tr><tr><td><code>--tr-container-title-color</code></td><td>标题文字颜色</td></tr><tr><td><code>--tr-container-title-font-size</code></td><td>标题字体大小</td></tr><tr><td><code>--tr-container-title-font-weight</code></td><td>标题字体粗细</td></tr><tr><td><code>--tr-container-title-line-height</code></td><td>标题行高</td></tr><tr><td><code>--tr-container-width</code></td><td>容器宽度</td></tr></tbody></table><p>全屏模式下的 CSS 变量：</p><table tabindex="0"><thead><tr><th>变量名</th><th>描述</th></tr></thead><tbody><tr><td><code>--tr-container-header-padding-fullscreen</code></td><td>全屏模式头部内边距</td></tr><tr><td><code>--tr-container-title-font-size-fullscreen</code></td><td>全屏模式标题字体大小</td></tr><tr><td><code>--tr-container-title-line-height-fullscreen</code></td><td>全屏模式标题行高</td></tr></tbody></table><h4 id="变量覆盖" tabindex="-1">变量覆盖 <a class="header-anchor" href="#变量覆盖" aria-label="Permalink to &quot;变量覆盖&quot;">​</a></h4><p>非全屏模式（默认）</p><div class="language-css vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">css</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">:root</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-container-width</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">600</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-container-title-font-size</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">18</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>全屏模式</p><div class="language-css vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">css</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">:root</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-container-title-font-size-fullscreen</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">20</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  --tr-container-header-padding-fullscreen</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 200</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> 24</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div>`,21))])}}});export{w as __pageData,S as default};
