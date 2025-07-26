const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/pills-popper.DQQGzGzG.js","assets/chunks/index.CkEQdhrI.js","assets/chunks/index3.TWDCajl8.js","assets/chunks/framework.VUT5-8yJ.js","assets/chunks/index4.DnnouxLm.js","assets/chunks/utils.BxFdpG70.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/index.X2hDHuqR.js","assets/chunks/tiny-robot-svgs.0wLZSGWQ.js","assets/chunks/index.BEAp7Ejj.js","assets/chunks/index.BH8J1JeV.js","assets/chunks/tiny-robot-svgs.CEfedB12.js","assets/chunks/index.BOD-uldB.js","assets/chunks/index.DKID6BLY.js","assets/chunks/index.D8hw7RQS.js","assets/chunks/help-circle.BKviG7aU.js","assets/chunks/index.BVQd9tnS.js","assets/chunks/index.C-_cmAPW.js","assets/chunks/loading-shadow.wWFOIFgP.js"])))=>i.map(i=>d[i]);
import{p as r,D as u,v as h,V as p,C as c,c as g,o as k,ah as i,ag as m,G as e,ai as f,k as n,w as a,aj as v}from"./chunks/framework.VUT5-8yJ.js";import{O as b,E as y}from"./chunks/index.BITB4gIy.js";const x=`<template>
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

<style lang="less" scoped>
.pills-container {
  display: flex;
  gap: 8px;
}

.pills {
  width: calc(100% - 40px);
}
</style>
`,_=JSON.parse('{"title":"SuggestionPills 建议按钮组","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/suggestion-pills.md","filePath":"components/suggestion-pills.md"}'),w={name:"components/suggestion-pills.md"},A=Object.assign(w,{setup(B){const l=r(!0),o=u();return h(async()=>{o.value=(await p(async()=>{const{default:s}=await import("./chunks/pills-popper.DQQGzGzG.js");return{default:s}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18]))).default}),(s,t)=>{const d=c("ClientOnly");return k(),g("div",null,[t[1]||(t[1]=i("",3)),m(e(n(b),null,null,512),[[f,l.value]]),e(d,null,{default:a(()=>[e(n(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:t[0]||(t[0]=()=>{l.value=!1}),vueCode:n(x)},v({_:2},[o.value?{name:"vue",fn:a(()=>[e(n(o))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),t[2]||(t[2]=i("",22))])}}});export{_ as __pageData,A as default};
