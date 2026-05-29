const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/pills-popper.D_d9qJ7V.js","assets/chunks/theme.CG-bv-bL.js","assets/chunks/framework.6DE2p-7l.js"])))=>i.map(i=>d[i]);
import{aV as r,_ as h,bg as u,b1 as p,G as c,O as i,cn as g,cb as k,Q as e,bH as n,cl as a,N as f,bq as m,bb as v}from"./chunks/framework.6DE2p-7l.js";import{L as y,N as b}from"./chunks/index.DWSLKOW8.js";const w=`<template>
  <div class="pills-container">
    <TrSuggestionPopover :data="[]">
      <template #trigger>
        <TrSuggestionPillButton>
          <template #icon>
            <IconSparkles style="font-size: 16px; color: #1476ff" />
          </template>
        </TrSuggestionPillButton>
      </template>
    </TrSuggestionPopover>
    <TrSuggestionPills
      class="pills"
      ref="pillsRef"
      v-model:showAll="showAll"
      :show-all-button-on="showAllButtonOn"
      :overflow-mode="overflowMode"
      :auto-scroll-on="autoScrollOn"
      @click-outside="handleClickOutside"
    >
      <TrDropdownMenu
        v-for="(button, index) in buttons"
        :items="dropdownMenuItems"
        :style="{
          '--tr-dropdown-menu-min-left': leftRange.left,
          '--tr-dropdown-menu-max-right': leftRange.right,
        }"
        @item-click="handleDropdownMenuItemClick"
        :key="index"
        v-model:show="dropdownShowModels[index]"
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
      <label>autoScrollOn：</label>
      <tiny-radio-group v-model="autoScrollOn" :options="autoScrollOptions"></tiny-radio-group>
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
import { computed, ref, watch } from 'vue'

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

const autoScrollOn = ref<'click' | 'mouseenter' | undefined>(undefined)
const autoScrollOptions = ref([
  { label: 'none', value: undefined },
  { label: 'click', value: 'click' },
  { label: 'mouseenter', value: 'mouseenter' },
])

const dropdownMenuItems = ref([
  { id: '1', text: '去续费' },
  { id: '2', text: '去退订' },
  { id: '3', text: '查账单' },
  { id: '4', text: '导账单' },
  { id: '5', text: '对帐单' },
])

const handleClickOutside = (event: MouseEvent) => {
  dropdownShowModels.value.forEach((_, index) => {
    dropdownShowModels.value[index] = false
  })

  const composedPath = event.composedPath()
  if (composedPath.some((el) => el instanceof HTMLElement && el.matches('ul.tr-dropdown-menu__list'))) {
    return
  }
  if (composedPath.includes(showAllRef.value?.$el)) {
    return
  }
  if (addButtonRef.value && composedPath.includes(addButtonRef.value)) {
    return
  }
  if (removeButtonRef.value && composedPath.includes(removeButtonRef.value)) {
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

const dropdownShowModels = ref<boolean[]>([])

watch(
  () => buttons.value.length,
  (len) => {
    dropdownShowModels.value = Array.from({ length: len }, () => false)
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

const leftRange = computed(() => {
  const el = pillsRef.value?.$el
  if (!el) {
    return { left: '0px', right: '100%' }
  }
  const { left, right } = el.getBoundingClientRect()
  return {
    left: \`\${left}px\`,
    right: \`\${right}px\`,
  }
})

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
              dropdownShowModels.value[index] = false
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

<style scoped>
.pills-container {
  display: flex;
  gap: 8px;
}

.pills {
  width: calc(100% - 40px);
}
</style>
`,A=JSON.parse('{"title":"SuggestionPills 建议按钮组","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/suggestion-pills.md","filePath":"components/suggestion-pills.md"}'),x={name:"components/suggestion-pills.md"},E=Object.assign(x,{setup(B){const l=v(!0),o=m();return r(async()=>{o.value=(await h(async()=>{const{default:s}=await import("./chunks/pills-popper.D_d9qJ7V.js");return{default:s}},__vite__mapDeps([0,1,2]))).default}),(s,t)=>{const d=u("ClientOnly");return p(),c("div",null,[t[1]||(t[1]=i('<h1 id="suggestionpills-建议按钮组" tabindex="-1">SuggestionPills 建议按钮组 <a class="header-anchor" href="#suggestionpills-建议按钮组" aria-label="Permalink to &quot;SuggestionPills 建议按钮组&quot;">​</a></h1><h2 id="代码示例" tabindex="-1">代码示例 <a class="header-anchor" href="#代码示例" aria-label="Permalink to &quot;代码示例&quot;">​</a></h2><h3 id="使用插槽" tabindex="-1">使用插槽 <a class="header-anchor" href="#使用插槽" aria-label="Permalink to &quot;使用插槽&quot;">​</a></h3>',3)),g(e(n(y),null,null,512),[[k,l.value]]),e(d,null,{default:a(()=>[e(n(b),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",playground:"%7B%22show%22%3Atrue%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",htmlWriteWay:"write",background:"undefined",visible:!0,onMount:t[0]||(t[0]=()=>{l.value=!1}),vueCode:n(w)},f({_:2},[o.value?{name:"vue",fn:a(()=>[e(n(o))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[2]||(t[2]=i('<h2 id="props" tabindex="-1">Props <a class="header-anchor" href="#props" aria-label="Permalink to &quot;Props&quot;">​</a></h2><p><strong>SuggestionPillsProps</strong> - 药丸组件属性配置</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>必填</th><th>默认值</th><th>说明</th></tr></thead><tbody><tr><td><code>showAll</code></td><td><code>boolean</code></td><td>否</td><td>-</td><td>是否展开全部元素 (v-model)</td></tr><tr><td><code>showAllButtonOn</code></td><td><code>&#39;hover&#39; | &#39;always&#39;</code></td><td>否</td><td><code>&#39;hover&#39;</code></td><td>显示&quot;更多&quot;按钮的时机</td></tr><tr><td><code>overflowMode</code></td><td><code>&#39;expand&#39; | &#39;scroll&#39;</code></td><td>否</td><td><code>&#39;expand&#39;</code></td><td>控制多余项的展示方式：<code>expand</code>为展开显示，<code>scroll</code>为横向滚动显示</td></tr><tr><td><code>autoScrollOn</code></td><td><code>&#39;mouseenter&#39; | &#39;click&#39;</code></td><td>否</td><td>-</td><td>鼠标悬停或点击时是否自动滚动到可见区域</td></tr></tbody></table><p><strong>SuggestionPillButtonProps</strong> - 药丸按钮属性配置</p><table tabindex="0"><thead><tr><th>属性</th><th>类型</th><th>必填</th><th>说明</th></tr></thead><tbody><tr><td><code>item</code></td><td><code>SuggestionPillItem</code></td><td>是</td><td>药丸项数据</td></tr></tbody></table><h2 id="slots" tabindex="-1">Slots <a class="header-anchor" href="#slots" aria-label="Permalink to &quot;Slots&quot;">​</a></h2><p><strong>SuggestionPillsSlots</strong> - 药丸组件插槽定义</p><table tabindex="0"><thead><tr><th>插槽名</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>default</code></td><td><code>() =&gt; VNode[]</code></td><td>自定义内容插槽</td></tr></tbody></table><p><strong>SuggestionPillButtonSlots</strong> - 药丸按钮插槽定义</p><table tabindex="0"><thead><tr><th>插槽名</th><th>类型</th><th>说明</th></tr></thead><tbody><tr><td><code>default</code></td><td><code>() =&gt; unknown</code></td><td>自定义内容插槽</td></tr><tr><td><code>icon</code></td><td><code>() =&gt; unknown</code></td><td>自定义图标插槽</td></tr></tbody></table><h2 id="events" tabindex="-1">Events <a class="header-anchor" href="#events" aria-label="Permalink to &quot;Events&quot;">​</a></h2><table tabindex="0"><thead><tr><th>事件名</th><th>参数</th><th>说明</th></tr></thead><tbody><tr><td><code>click-outside</code></td><td><code>event: MouseEvent</code></td><td>点击组件外部区域时触发</td></tr></tbody></table><h2 id="types" tabindex="-1">Types <a class="header-anchor" href="#types" aria-label="Permalink to &quot;Types&quot;">​</a></h2><p><strong>SuggestionPillItem</strong> - 建议药丸项类型</p><div class="language-typescript vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">typescript</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">type</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> SuggestionPillItem</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> =</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">text</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">icon</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Component</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">|</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> { </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">text</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">?:</span><span style="--shiki-light:#005CC5;--shiki-dark:#79B8FF;"> string</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">; </span><span style="--shiki-light:#E36209;--shiki-dark:#FFAB70;">icon</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> VNode</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> |</span><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;"> Component</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;"> }</span></span></code></pre></div><p>表示每个药丸项必须包含：</p><ul><li><code>text</code> 或 <code>icon</code> 至少一个</li><li>支持自定义 Vue 组件或虚拟节点作为图标</li></ul>',17))])}}});export{A as __pageData,E as default};
