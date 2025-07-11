const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/pills-popper.ztp2w8p_.js","assets/chunks/index.cxSKZGKH.js","assets/chunks/framework.kTfunus-.js","assets/chunks/tiny-robot-svgs.BaAiG9Fu.js","assets/chunks/index2.DXNIapAb.js","assets/chunks/utils.D1YSndqS.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/index.CbhXsEHC.js","assets/chunks/index.DM95O2dU.js","assets/chunks/tiny-robot-svgs.Ct4S-7ct.js","assets/chunks/pills-popper-config.DZz18589.js","assets/chunks/index.BdpCrDlP.js","assets/chunks/index.DKVCnifJ.js","assets/chunks/help-circle.DZYgQKry.js","assets/chunks/index.BwQVmJhW.js","assets/chunks/index.DRKSS0gm.js","assets/chunks/loading-shadow.lIjb6yma.js"])))=>i.map(i=>d[i]);
import{p as l,v as r,V as k,C as y,c as m,o as b,ag as o,ah as g,G as i,ai as c,k as t,w as a}from"./chunks/framework.kTfunus-.js";import{O as u,E}from"./chunks/index.Bs5OpVoR.js";const v=`<template>
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
`,F=`<template>
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
`,B=JSON.parse('{"title":"SuggestionPills 建议按钮组","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/suggestion-pills.md","filePath":"components/suggestion-pills.md"}'),C={name:"components/suggestion-pills.md"},A=Object.assign(C,{setup(P){const p=l();r(async()=>{p.value=(await k(async()=>{const{default:e}=await import("./chunks/pills-popper.ztp2w8p_.js");return{default:e}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9]))).default});const n=l(!0),h=l();return r(async()=>{h.value=(await k(async()=>{const{default:e}=await import("./chunks/pills-popper-config.DZz18589.js");return{default:e}},__vite__mapDeps([10,1,2,3,4,5,6,7,8,9,11,12,13,14,15,16]))).default}),(e,s)=>{const d=y("ClientOnly");return b(),m("div",null,[s[2]||(s[2]=o("",6)),g(i(t(u),null,null,512),[[c,n.value]]),i(d,null,{default:a(()=>[i(t(E),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:s[0]||(s[0]=()=>{n.value=!1}),vueCode:t(F)},{vue:a(()=>[i(t(h))]),_:1},8,["vueCode"])]),_:1}),s[3]||(s[3]=o("",6)),g(i(t(u),null,null,512),[[c,n.value]]),i(d,null,{default:a(()=>[i(t(E),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:s[1]||(s[1]=()=>{n.value=!1}),vueCode:t(v)},{vue:a(()=>[i(t(p))]),_:1},8,["vueCode"])]),_:1}),s[4]||(s[4]=o("",32))])}}});export{B as __pageData,A as default};
