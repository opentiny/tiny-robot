const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/pills-popper.FwAyuO8t.js","assets/chunks/index.D2cG5w7A.js","assets/chunks/index2.lf0lWHKg.js","assets/chunks/framework.CBhkkd1d.js","assets/chunks/index3.MK1UNZfa.js","assets/chunks/utils.D1YSndqS.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/index.BOLOr6XF.js","assets/chunks/tiny-robot-svgs.DjZeQ69T.js","assets/chunks/index.BwQ_pUO6.js","assets/chunks/index.B-t13XQj.js","assets/chunks/tiny-robot-svgs.C0qvPHkC.js","assets/chunks/index.BQpFRYQt.js","assets/chunks/index.BOkR6d9W.js","assets/chunks/help-circle.pXbkA2qN.js","assets/chunks/index.C2al9N0I.js","assets/chunks/index.6BnWwxi8.js","assets/chunks/loading-shadow.CSqHyDZ-.js"])))=>i.map(i=>d[i]);
import{p as r,D as h,v as u,V as p,C as c,c as g,o as k,ag as i,ah as v,G as e,ai as f,k as n,w as a,aj as m}from"./chunks/framework.CBhkkd1d.js";import{O as b,E as y}from"./chunks/index.D3YLhVKP.js";const x=`<template>
  <div class="pills-container">
    <TrSuggestionPopover :data="[]">
      <TrSuggestionPillButton>
        <template #icon>
          <IconSparkles style="font-size: 16px; color: #1476ff" />
        </template>
      </TrSuggestionPillButton>
    </TrSuggestionPopover>
    <TrSuggestionPills
      class="pills"
      ref="pillsRef"
      v-model:showAll="showAll"
      :show-all-button-on="showAllButtonOn"
      :overflow-mode="overflowMode"
      :auto-scroll-on-hover="autoScrollOnHover"
      @click-outside="handleClickOutside"
    >
      <TrDropdownMenu
        v-for="(button, index) in buttons"
        :items="dropdownMenuItems"
        @item-click="handleDropdownMenuItemClick"
        :key="index"
        v-model:show="hoverShowModels[index]"
        trigger="click"
      >
        <template #trigger>
          <TrSuggestionPillButton :data-index="index">{{ button.text }}</TrSuggestionPillButton>
        </template>
      </TrDropdownMenu>
    </TrSuggestionPills>
  </div>
  <hr />
  <span>点击第一个图标会打开Popover弹出框</span>
  <hr />
  <div style="display: flex; flex-direction: column; gap: 10px">
    <div>
      <label>showAll：</label>
      <tiny-switch v-model="showAll" ref="showAllRef"></tiny-switch>
    </div>
    <div>
      <label>showAllButtonOn：</label>
      <tiny-radio-group v-model="showAllButtonOn" :options="showAllButtonOnOptions"></tiny-radio-group>
    </div>
    <div style="display: flex; align-items: center; gap: 10px">
      <label>overflowMode：</label>
      <tiny-radio-group v-model="overflowMode" :options="overflowModeOptions"></tiny-radio-group>
    </div>
    <div style="display: flex; align-items: center; gap: 10px">
      <label>autoScrollOnHover：</label>
      <tiny-switch v-model="autoScrollOnHover"></tiny-switch>
    </div>
    <div style="display: flex; align-items: center; gap: 10px">
      <button ref="addButtonRef" @click="handleClickAddButton">点我增加按钮</button>
      <button ref="removeButtonRef" @click="handleClickRemoveButton">点我删除按钮</button>
      <button @click="handleClickResetButton">点我重置按钮</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TrDropdownMenu, TrSuggestionPillButton, TrSuggestionPills, TrSuggestionPopover } from '@opentiny/tiny-robot'
import { IconSparkles } from '@opentiny/tiny-robot-svgs'
import { TinyRadioGroup, TinySwitch } from '@opentiny/vue'
import { ref, watch } from 'vue'

const showAll = ref(false)
const showAllRef = ref<InstanceType<typeof TinySwitch>>()
const addButtonRef = ref<HTMLButtonElement | null>(null)
const removeButtonRef = ref<HTMLButtonElement | null>(null)

const showAllButtonOn = ref<'hover' | 'always'>('hover')
const showAllButtonOnOptions = ref([
  { label: 'hover', value: 'hover' },
  { label: 'always', value: 'always' },
])

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

const handleClickOutside = (event: MouseEvent) => {
  if (event.composedPath().includes(showAllRef.value?.$el)) {
    return
  }
  if (addButtonRef.value && event.composedPath().includes(addButtonRef.value)) {
    return
  }
  if (removeButtonRef.value && event.composedPath().includes(removeButtonRef.value)) {
    return
  }
  showAll.value = false
}

const handleDropdownMenuItemClick = (item) => {
  console.log('DropdownMenu item clicked,', item)
}

const originalButtons = [
  {
    text: '资源管理1',
  },
  {
    text: '资源管理2',
  },
  {
    text: '资源管理3',
  },
  {
    text: '资源管理4',
  },
  {
    text: '资源管理5',
  },
  {
    text: '资源管理6',
  },
  {
    text: '资源管理7',
  },
]

const buttons = ref(structuredClone(originalButtons))

const hoverShowModels = ref<boolean[]>([])

watch(
  () => buttons.value.length,
  (len) => {
    hoverShowModels.value = Array.from({ length: len }, () => false)
  },
  { immediate: true },
)

const handleClickAddButton = () => {
  buttons.value.push({
    text: '新增按钮',
  })
}

const handleClickRemoveButton = () => {
  buttons.value.pop()
}

const handleClickResetButton = () => {
  buttons.value = structuredClone(originalButtons)
}

const pillsRef = ref<InstanceType<typeof TrSuggestionPills>>()

watch(
  () => [pillsRef.value?.$el, pillsRef.value?.children.map((el) => el)] as const,
  ([root, targets], _, onCleanup) => {
    if (!root || !Array.isArray(targets) || targets.length === 0) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            const index = Number((entry.target as HTMLElement).dataset.index)
            if (typeof index === 'number' && !isNaN(index)) {
              hoverShowModels.value[index] = false
            }
          }
        })
      },
      {
        root,
        threshold: 0.99,
      },
    )

    targets.forEach((el) => el && observer.observe(el))

    onCleanup(() => {
      observer.disconnect()
    })
  },
  { flush: 'post' },
)
<\/script>

<style lang="less" scoped>
.pills-container {
  display: flex;
  gap: 8px;
}

.pills {
  width: calc(100% - 40px);
}
</style>
`,_=JSON.parse('{"title":"SuggestionPills 建议按钮组","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/suggestion-pills.md","filePath":"components/suggestion-pills.md"}'),w={name:"components/suggestion-pills.md"},A=Object.assign(w,{setup(B){const l=r(!0),o=h();return u(async()=>{o.value=(await p(async()=>{const{default:s}=await import("./chunks/pills-popper.FwAyuO8t.js");return{default:s}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]))).default}),(s,t)=>{const d=c("ClientOnly");return k(),g("div",null,[t[1]||(t[1]=i('<h1 id="suggestionpills-建议按钮组" tabindex="-1">SuggestionPills 建议按钮组 <a class="header-anchor" href="#suggestionpills-建议按钮组" aria-label="Permalink to &quot;SuggestionPills 建议按钮组&quot;">​</a></h1><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="使用插槽" tabindex="-1">使用插槽 <a class="header-anchor" href="#使用插槽" aria-label="Permalink to &quot;使用插槽&quot;">​</a></h3>',3)),v(e(n(b),null,null,512),[[f,l.value]]),e(d,null,{default:a(()=>[e(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[0]||(t[0]=()=>{l.value=!1}),vueCode:n(x)},m({_:2},[o.value?{name:"vue",fn:a(()=>[e(n(o))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[2]||(t[2]=i('<h2 id="api" tabindex="-1">API <a class="header-anchor" href="#api" aria-label="Permalink to &quot;API&quot;">​</a></h2><h3 id="suggestionpillsprops" tabindex="-1">SuggestionPillsProps <a class="header-anchor" href="#suggestionpillsprops" aria-label="Permalink to &quot;SuggestionPillsProps&quot;">​</a></h3><p>药丸组件属性配置。</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>showAll</code></td><td><code>boolean</code></td><td>-</td><td>是否展开全部元素 (v-model)</td></tr><tr><td><code>showAllButtonOn</code></td><td><code>&#39;hover&#39; | &#39;always&#39;</code></td><td><code>&#39;hover&#39;</code></td><td>显示&quot;更多&quot;按钮的时机</td></tr><tr><td><code>overflowMode</code></td><td><code>&#39;expand&#39; | &#39;scroll&#39;</code></td><td><code>&#39;expand&#39;</code></td><td>控制多余项的展示方式：<code>expand</code>为展开显示，<code>scroll</code>为横向滚动显示</td></tr><tr><td><code>autoScrollOnHover</code></td><td><code>boolean</code></td><td><code>false</code></td><td>鼠标悬停时是否自动滚动到可见区域</td></tr></tbody></table><h3 id="suggestionpillsslots" tabindex="-1">SuggestionPillsSlots <a class="header-anchor" href="#suggestionpillsslots" aria-label="Permalink to &quot;SuggestionPillsSlots&quot;">​</a></h3><p>药丸组件插槽定义。</p><table tabindex="0"><thead><tr><th>插槽名</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>default</code></td><td><code>() =&gt; VNode[]</code></td><td>自定义内容插槽</td></tr></tbody></table><h3 id="suggestionpillsemits" tabindex="-1">SuggestionPillsEmits <a class="header-anchor" href="#suggestionpillsemits" aria-label="Permalink to &quot;SuggestionPillsEmits&quot;">​</a></h3><p>药丸组件事件定义。</p><table tabindex="0"><thead><tr><th>事件名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>click-outside</code></td><td><code>event: MouseEvent</code></td><td>点击组件外部区域时触发</td></tr></tbody></table><h3 id="suggestionpillbuttonprops" tabindex="-1">SuggestionPillButtonProps <a class="header-anchor" href="#suggestionpillbuttonprops" aria-label="Permalink to &quot;SuggestionPillButtonProps&quot;">​</a></h3><p>药丸按钮属性配置。</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>item</code></td><td><code>SuggestionPillItem</code></td><td>药丸项数据</td></tr></tbody></table><h3 id="suggestionpillbuttonslots" tabindex="-1">SuggestionPillButtonSlots <a class="header-anchor" href="#suggestionpillbuttonslots" aria-label="Permalink to &quot;SuggestionPillButtonSlots&quot;">​</a></h3><p>药丸按钮插槽定义。</p><table tabindex="0"><thead><tr><th>插槽名</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>default</code></td><td><code>() =&gt; unknown</code></td><td>自定义内容插槽</td></tr><tr><td><code>icon</code></td><td><code>() =&gt; unknown</code></td><td>自定义图标插槽</td></tr></tbody></table><h3 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h3><h4 id="suggestionpillitem" tabindex="-1">SuggestionPillItem <a class="header-anchor" href="#suggestionpillitem" aria-label="Permalink to &quot;SuggestionPillItem&quot;">​</a></h4><p>建议药丸项类型：</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SuggestionPillItem</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">text</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">icon</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Component</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">text</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">icon</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Component</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span></code></pre></div><p>表示每个药丸项必须包含：</p><ul><li><code>text</code> 或 <code>icon</code> 至少一个</li><li>支持自定义 Vue 组件或虚拟节点作为图标</li></ul>',22))])}}});export{_ as __pageData,A as default};
