const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/pills-popper.BFCAVcOV.js","assets/chunks/index.D2cG5w7A.js","assets/chunks/index2.lf0lWHKg.js","assets/chunks/framework.CBhkkd1d.js","assets/chunks/index3.MK1UNZfa.js","assets/chunks/utils.D1YSndqS.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/index.Bn8z_5BQ.js","assets/chunks/tiny-robot-svgs.DjZeQ69T.js","assets/chunks/index.BwQ_pUO6.js","assets/chunks/index.B-t13XQj.js","assets/chunks/tiny-robot-svgs.C0qvPHkC.js","assets/chunks/index.BQpFRYQt.js","assets/chunks/index.BOkR6d9W.js","assets/chunks/help-circle.pXbkA2qN.js","assets/chunks/index.C2al9N0I.js","assets/chunks/index.6BnWwxi8.js","assets/chunks/loading-shadow.CSqHyDZ-.js"])))=>i.map(i=>d[i]);
import{p as r,D as h,v as u,V as p,C as c,c as g,o as k,ag as i,ah as v,G as e,ai as m,k as n,w as a,aj as f}from"./chunks/framework.CBhkkd1d.js";import{O as b,E as y}from"./chunks/index.D3YLhVKP.js";const x=`<template>
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
      :auto-scroll-on="autoScrollOn"
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
`,_=JSON.parse('{"title":"SuggestionPills 建议按钮组","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/suggestion-pills.md","filePath":"components/suggestion-pills.md"}'),w={name:"components/suggestion-pills.md"},A=Object.assign(w,{setup(B){const l=r(!0),o=h();return u(async()=>{o.value=(await p(async()=>{const{default:s}=await import("./chunks/pills-popper.BFCAVcOV.js");return{default:s}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]))).default}),(s,t)=>{const d=c("ClientOnly");return k(),g("div",null,[t[1]||(t[1]=i("",3)),v(e(n(b),null,null,512),[[m,l.value]]),e(d,null,{default:a(()=>[e(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[0]||(t[0]=()=>{l.value=!1}),vueCode:n(x)},f({_:2},[o.value?{name:"vue",fn:a(()=>[e(n(o))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[2]||(t[2]=i("",22))])}}});export{_ as __pageData,A as default};
