const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/pills-popper.B_8rgosR.js","assets/chunks/index.DWcP29QJ.js","assets/chunks/framework.CBhkkd1d.js","assets/chunks/tiny-robot-svgs.DjZeQ69T.js","assets/chunks/index2.CaPMndaq.js","assets/chunks/index.DgnhvHJN.js","assets/chunks/utils.D1YSndqS.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/index.B-t13XQj.js","assets/chunks/tiny-robot-svgs.C0qvPHkC.js","assets/chunks/pills-popper-config.DStPpo4k.js","assets/chunks/index.BQpFRYQt.js","assets/chunks/index.BOkR6d9W.js","assets/chunks/help-circle.pXbkA2qN.js","assets/chunks/index.C2al9N0I.js","assets/chunks/index.6BnWwxi8.js","assets/chunks/loading-shadow.CSqHyDZ-.js"])))=>i.map(i=>d[i]);
import{D as d,v as r,V as k,p as m,C as v,c as b,o as F,ag as p,ah as g,G as i,ai as c,k as t,w as a,aj as u}from"./chunks/framework.CBhkkd1d.js";import{O as E,E as y}from"./chunks/index.D3YLhVKP.js";const C=`<template>
  <TrSuggestionPills>
    <TrSuggestionPopover
      :data="popoverData"
      :loading="loading"
      @open="delaySetData"
      @item-click="handlePopoverItemClick"
    >
      <TrSuggestionPillButton>
        <template #icon>
          <IconSparkles style="font-size: 16px; color: #1476ff" />
        </template>
      </TrSuggestionPillButton>
    </TrSuggestionPopover>
    <TrDropdownMenu :items="dropdownMenuItems" @item-click="handleDropdownMenuItemClick">
      <template #trigger>
        <TrSuggestionPillButton>点击我打开DropdownMenu弹出框</TrSuggestionPillButton>
      </template>
    </TrDropdownMenu>
    <TrSuggestionPillButton>资源管理</TrSuggestionPillButton>
    <TrSuggestionPillButton>费用查询</TrSuggestionPillButton>
  </TrSuggestionPills>
  <hr />
  <span>点击第一个图标会打开Popover弹出框</span>
</template>

<script setup lang="ts">
import { TrSuggestionPillButton, TrSuggestionPills, TrSuggestionPopover, TrDropdownMenu } from '@opentiny/tiny-robot'
import { IconSparkles } from '@opentiny/tiny-robot-svgs'
import { ref } from 'vue'

const dropdownMenuItems = ref([
  { id: '1', text: '去续费' },
  { id: '2', text: '去退订' },
  { id: '3', text: '查账单' },
  { id: '4', text: '导账单' },
  { id: '5', text: '对帐单' },
])

const popoverData = ref<typeof data>([])
const loading = ref(true)

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

const delaySetData = () => {
  setTimeout(() => {
    popoverData.value = data
    loading.value = false
  }, 1000)
}

const handlePopoverItemClick = (item) => {
  console.log('Popover item clicked,', item)
}

const handleDropdownMenuItemClick = (item) => {
  console.log('DropdownMenu item clicked,', item)
}
<\/script>
`,f=`<template>
  <TrSuggestionPills
    :items="items"
    v-model:showAll="showAll"
    :overflow-mode="overflowMode"
    :auto-scroll-on-hover="autoScrollOnHover"
    @item-click="handleItemClick"
    @click-outside="handleClickOutside"
  ></TrSuggestionPills>
  <hr />
  <span>点击第一个图标会打开Popover弹出框</span>
  <hr />
  <div>
    <label>手动控制显示更多：</label>
    <tiny-switch v-model="showAll" ref="showAllRef"></tiny-switch>
  </div>
  <hr />
  <div style="display: flex; flex-direction: column; gap: 10px">
    <div><button ref="addButtonRef" @click="handleClickAddButton">点我增加按钮</button></div>
    <div style="display: flex; align-items: center; gap: 10px">
      <label>overflowMode：</label>
      <tiny-radio-group v-model="overflowMode" :options="overflowModeOptions"></tiny-radio-group>
    </div>
    <div style="display: flex; align-items: center; gap: 10px">
      <label>autoScrollOnHover：</label>
      <tiny-switch v-model="autoScrollOnHover"></tiny-switch>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SuggestionPillItem, SuggestionPillMenuAction, TrSuggestionPills } from '@opentiny/tiny-robot'
import { IconEdit, IconSparkles } from '@opentiny/tiny-robot-svgs'
import { TinyRadioGroup, TinySwitch } from '@opentiny/vue'
import { h, markRaw, ref } from 'vue'

const showAll = ref(false)
const showAllRef = ref<InstanceType<typeof TinySwitch>>()
const addButtonRef = ref<HTMLButtonElement | null>(null)

const overflowMode = ref<'expand' | 'scroll'>('expand')
const overflowModeOptions = ref([
  { label: 'expand', value: 'expand' },
  { label: 'scroll', value: 'scroll' },
])

const autoScrollOnHover = ref(false)

const dropdownMenuItems = ref([
  { id: '1', text: '去续费' },
  { id: '2', text: '去退订' },
  { id: '3', text: '查账单' },
  { id: '4', text: '导账单' },
  { id: '5', text: '对帐单' },
])

const items = ref<SuggestionPillItem[]>([
  {
    id: '1',
    icon: h(IconSparkles, { style: { color: '#1476FF', fontSize: '16px' } }),
    action: {
      type: 'popover',
      props: {
        data: [],
        loading: true,
        onItemClick: (item) => {
          console.log(item)
        },
      },
      slots: {
        loading: () => h('span', {}, '加载中...'),
      },
    },
  },
  ...Array.from({ length: 8 })
    .fill(0)
    .map((_, index) => ({
      id: String(index + 2),
      text: '费用成本',
      icon: markRaw(IconEdit),
      action: {
        type: 'menu',
        props: {
          items: dropdownMenuItems.value,
          trigger: 'manual',
          show: false,
          onItemClick: (item) => {
            console.log(item)
            closeAllPopper()
          },
          onClickOutside: () => {
            console.log('onClickOutside')
            closeAllPopper()
          },
        },
      } as SuggestionPillMenuAction,
    })),
])

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

const closeAllPopper = () => {
  items.value.forEach((i) => {
    if (i.action?.props) {
      i.action.props.show = false
    }
  })
}

const delaySetData = () => {
  setTimeout(() => {
    if (items.value[0].action?.type === 'popover') {
      items.value[0].action.props.data = data
      items.value[0].action.props.loading = false
    }
  }, 1000)
}

const handleItemClick = (item: SuggestionPillItem) => {
  console.log('SuggestionPillButton clicked,', item)

  if (item.id === items.value[0].id) {
    delaySetData()
  }

  if (item.action?.type === 'menu') {
    items.value.forEach((i) => {
      if (i.action?.type === 'menu') {
        if (i.id === item.id) {
          i.action.props.show = !i.action.props.show
        } else {
          i.action.props.show = false
        }
      }
    })
  }
}

const handleClickOutside = (event: MouseEvent) => {
  if (event.composedPath().includes(showAllRef.value?.$el)) {
    return
  }
  if (addButtonRef.value && event.composedPath().includes(addButtonRef.value)) {
    return
  }
  showAll.value = false
  closeAllPopper()
}

const handleClickAddButton = () => {
  items.value.push({
    id: String(items.value.length + 2),
    text: '费用成本',
    icon: markRaw(IconEdit),
    action: {
      type: 'menu',
      props: {
        items: dropdownMenuItems.value,
        trigger: 'manual',
        show: false,
        onItemClick: (item) => {
          console.log(item)
          closeAllPopper()
        },
        onClickOutside: () => {
          console.log('onClickOutside')
          closeAllPopper()
        },
      },
    } as SuggestionPillMenuAction,
  })
}
<\/script>

<style lang="less" scoped>
:deep(.tr-suggestion-pills__more-wrapper) {
  left: 40px;
}
</style>
`,x=JSON.parse('{"title":"SuggestionPills 建议按钮组","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/suggestion-pills.md","filePath":"components/suggestion-pills.md"}'),P={name:"components/suggestion-pills.md"},_=Object.assign(P,{setup(B){const l=d();r(async()=>{l.value=(await k(async()=>{const{default:e}=await import("./chunks/pills-popper.B_8rgosR.js");return{default:e}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9]))).default});const n=m(!0),o=d();return r(async()=>{o.value=(await k(async()=>{const{default:e}=await import("./chunks/pills-popper-config.DStPpo4k.js");return{default:e}},__vite__mapDeps([10,1,2,3,4,5,6,7,8,9,11,12,13,14,15,16]))).default}),(e,s)=>{const h=v("ClientOnly");return F(),b("div",null,[s[2]||(s[2]=p('<h1 id="suggestionpills-建议按钮组" tabindex="-1">SuggestionPills 建议按钮组 <a class="header-anchor" href="#suggestionpills-建议按钮组" aria-label="Permalink to &quot;SuggestionPills 建议按钮组&quot;">​</a></h1><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="基本示例" tabindex="-1">基本示例 <a class="header-anchor" href="#基本示例" aria-label="Permalink to &quot;基本示例&quot;">​</a></h3><p>使用配置式来配置按钮组的内部元素</p><p>元素超长会隐藏，会自动显示展开按钮。展开按钮也可以通过 <code>v-model:show-all</code> 控制</p><p>目前按钮支持3种类型，分别是：<code>popover</code>, <code>menu</code> 和默认的普通按钮</p>',6)),g(i(t(E),null,null,512),[[c,n.value]]),i(h,null,{default:a(()=>[i(t(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:s[0]||(s[0]=()=>{n.value=!1}),vueCode:t(f)},u({_:2},[o.value?{name:"vue",fn:a(()=>[i(t(o))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[3]||(s[3]=p(`<p>如果你想自定义弹出容器的边距，使用 <code>:deep(.tr-suggestion-pills__more-wrapper)</code> 选择器</p><div class="language-less vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">less</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:deep(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">.tr-suggestion-pills__more-wrapper</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">  left</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">40</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">px</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><p>由于目前弹窗是位于 SuggestionPills 内部，无法使用 mask 来实现右侧超出的按钮渐变。需要手动加上下面的样式</p><div class="language-less vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">less</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">:deep(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">.tr-suggestion-pills__container</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  &amp;::before</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    content</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;&#39;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    position</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">absolute</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    inset</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">;</span></span>
<span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">    // 背景色需要和容器背景色一致</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">    background</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">linear-gradient</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">to</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> right</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">rgba</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(rgb(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">248</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">248</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">248</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">), </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">0</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">) </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">90</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">%</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">rgba</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(rgb(</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">248</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">248</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">248</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">), </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">1</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">));</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">    pointer-events: none;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h3 id="使用插槽-不推荐" tabindex="-1">使用插槽（不推荐） <a class="header-anchor" href="#使用插槽-不推荐" aria-label="Permalink to &quot;使用插槽（不推荐）&quot;">​</a></h3><p>如果是使用默认插槽，<code>TrSuggestionPills</code> 的 <code>item-click</code> 事件是无效的。而且无法添加展开收起逻辑</p>`,6)),g(i(t(E),null,null,512),[[c,n.value]]),i(h,null,{default:a(()=>[i(t(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:s[1]||(s[1]=()=>{n.value=!1}),vueCode:t(C)},u({_:2},[l.value?{name:"vue",fn:a(()=>[i(t(l))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[4]||(s[4]=p(`<h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="suggestionpillsprops" tabindex="-1">SuggestionPillsProps <a class="header-anchor" href="#suggestionpillsprops" aria-label="Permalink to &quot;SuggestionPillsProps&quot;">​</a></h3><p>药丸组件属性配置。</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>items</code></td><td><code>SuggestionPillItem[]</code></td><td>-</td><td>建议药丸项数据数组</td></tr><tr><td><code>showAll</code></td><td><code>boolean</code></td><td>-</td><td>是否展开全部元素 (v-model)</td></tr><tr><td><code>showAllButtonOn</code></td><td><code>&#39;hover&#39; | &#39;always&#39;</code></td><td><code>&#39;hover&#39;</code></td><td>显示&quot;更多&quot;按钮的时机</td></tr><tr><td><code>overflowMode</code></td><td><code>&#39;expand&#39; | &#39;scroll&#39;</code></td><td><code>&#39;expand&#39;</code></td><td>控制多余项的展示方式：<code>expand</code>为展开显示，<code>scroll</code>为横向滚动显示</td></tr><tr><td><code>autoScrollOnHover</code></td><td><code>boolean</code></td><td><code>false</code></td><td>鼠标悬停时是否自动滚动到可见区域</td></tr></tbody></table><h3 id="suggestionpillsslots" tabindex="-1">SuggestionPillsSlots <a class="header-anchor" href="#suggestionpillsslots" aria-label="Permalink to &quot;SuggestionPillsSlots&quot;">​</a></h3><p>药丸组件插槽定义。</p><table tabindex="0"><thead><tr><th>插槽名</th><th>类型</th><th>说明</th><th>状态</th></tr></thead><tbody><tr><td><code>default</code></td><td><code>() =&gt; VNode | VNode[]</code></td><td>自定义内容插槽</td><td>已废弃</td></tr></tbody></table><h3 id="suggestionpillsemits" tabindex="-1">SuggestionPillsEmits <a class="header-anchor" href="#suggestionpillsemits" aria-label="Permalink to &quot;SuggestionPillsEmits&quot;">​</a></h3><p>药丸组件事件定义。</p><table tabindex="0"><thead><tr><th>事件名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>item-click</code></td><td><code>item: SuggestionPillItem</code></td><td>点击药丸项时触发</td></tr><tr><td><code>click-outside</code></td><td><code>event: MouseEvent</code></td><td>点击组件外部区域时触发</td></tr></tbody></table><h3 id="suggestionpillbuttonprops" tabindex="-1">SuggestionPillButtonProps <a class="header-anchor" href="#suggestionpillbuttonprops" aria-label="Permalink to &quot;SuggestionPillButtonProps&quot;">​</a></h3><p>药丸按钮属性配置。</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>item</code></td><td><code>SuggestionPillItem</code></td><td>药丸项数据</td></tr></tbody></table><h3 id="suggestionpillbuttonslots" tabindex="-1">SuggestionPillButtonSlots <a class="header-anchor" href="#suggestionpillbuttonslots" aria-label="Permalink to &quot;SuggestionPillButtonSlots&quot;">​</a></h3><p>药丸按钮插槽定义。</p><table tabindex="0"><thead><tr><th>插槽名</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>default</code></td><td><code>() =&gt; unknown</code></td><td>自定义内容插槽</td></tr><tr><td><code>icon</code></td><td><code>() =&gt; unknown</code></td><td>自定义图标插槽</td></tr></tbody></table><h3 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h3><h4 id="suggestionpillaction" tabindex="-1">SuggestionPillAction <a class="header-anchor" href="#suggestionpillaction" aria-label="Permalink to &quot;SuggestionPillAction&quot;">​</a></h4><p>建议药丸动作配置类型：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SuggestionPillAction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SuggestionPillPopoverAction</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SuggestionPillMenuAction</span></span></code></pre></div><h4 id="suggestionpillpopoveraction" tabindex="-1">SuggestionPillPopoverAction <a class="header-anchor" href="#suggestionpillpopoveraction" aria-label="Permalink to &quot;SuggestionPillPopoverAction&quot;">​</a></h4><p>弹出框动作配置：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;popover&#39;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  props</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: SuggestionPopoverProps </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SuggestionPopoverEventProps</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  slots</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> Omit</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&lt;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">SuggestionPopoverSlots, </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;default&#39;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&gt;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  events</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> SuggestionPopoverEvents </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 已废弃，请使用 props 中的 onXXX 事件</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h4 id="suggestionpillmenuaction" tabindex="-1">SuggestionPillMenuAction <a class="header-anchor" href="#suggestionpillmenuaction" aria-label="Permalink to &quot;SuggestionPillMenuAction&quot;">​</a></h4><p>下拉菜单动作配置：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">{</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  type</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&#39;menu&#39;</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">  props</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: DropdownMenuProps </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> DropdownMenuEventProps</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  events</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> DropdownMenuEvents </span><span style="--shiki-light:#6A737D;--shiki-dark:#6A737D;">// 已废弃，请使用 props 中的 onXXX 事件</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">}</span></span></code></pre></div><h4 id="suggestionpillbaseitem" tabindex="-1">SuggestionPillBaseItem <a class="header-anchor" href="#suggestionpillbaseitem" aria-label="Permalink to &quot;SuggestionPillBaseItem&quot;">​</a></h4><p>建议药丸基础项类型：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SuggestionPillBaseItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> {</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  id</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span></span>
<span class="line"><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">  action</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SuggestionPillAction</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">} </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> T</span></span></code></pre></div><h4 id="suggestionpillitem" tabindex="-1">SuggestionPillItem <a class="header-anchor" href="#suggestionpillitem" aria-label="Permalink to &quot;SuggestionPillItem&quot;">​</a></h4><p>建议药丸项类型：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SuggestionPillItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">T</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Record</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;">unknown</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt;&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SuggestionPillBaseItem</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&lt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">T</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">&gt; </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">&amp;</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">  ({ </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">text</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">icon</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Component</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">text</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">icon</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Component</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> })</span></span></code></pre></div>`,32))])}}});export{x as __pageData,_ as default};
