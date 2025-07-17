const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/pills-popper.CM9srw2I.js","assets/chunks/index.YyC4kf82.js","assets/chunks/framework.Dgud2iI9.js","assets/chunks/tiny-robot-svgs.DkMnPK0j.js","assets/chunks/index2.DHk6GfRG.js","assets/chunks/index.Dl8Yb5qj.js","assets/chunks/utils.D1YSndqS.js","assets/chunks/plugin-vue_export-helper.lGy7RumW.js","assets/chunks/index.PuLjcH9b.js","assets/chunks/tiny-robot-svgs.DsFtH99N.js","assets/chunks/pills-popper-config.BXLYcXRL.js","assets/chunks/index.C3UjZiq3.js","assets/chunks/index.hZi136iK.js","assets/chunks/help-circle.C1L1HL1-.js","assets/chunks/index.DXEM-Uaf.js","assets/chunks/index.D10l4-cF.js","assets/chunks/loading-shadow.pjlHnCgD.js"])))=>i.map(i=>d[i]);
import{D as d,v as r,V as k,p as m,C as v,c as b,o as F,ag as p,ah as g,G as i,ai as c,k as t,w as a,aj as u}from"./chunks/framework.Dgud2iI9.js";import{O as E,E as y}from"./chunks/index.DqyWXox9.js";const C=`<template>
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
`,x=JSON.parse('{"title":"SuggestionPills 建议按钮组","description":"","frontmatter":{"outline":"deep"},"headers":[],"relativePath":"components/suggestion-pills.md","filePath":"components/suggestion-pills.md"}'),P={name:"components/suggestion-pills.md"},_=Object.assign(P,{setup(B){const l=d();r(async()=>{l.value=(await k(async()=>{const{default:e}=await import("./chunks/pills-popper.CM9srw2I.js");return{default:e}},__vite__mapDeps([0,1,2,3,4,5,6,7,8,9]))).default});const n=m(!0),o=d();return r(async()=>{o.value=(await k(async()=>{const{default:e}=await import("./chunks/pills-popper-config.BXLYcXRL.js");return{default:e}},__vite__mapDeps([10,1,2,3,4,5,6,7,8,9,11,12,13,14,15,16]))).default}),(e,s)=>{const h=v("ClientOnly");return F(),b("div",null,[s[2]||(s[2]=p("",6)),g(i(t(E),null,null,512),[[c,n.value]]),i(h,null,{default:a(()=>[i(t(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:s[0]||(s[0]=()=>{n.value=!1}),vueCode:t(f)},u({_:2},[o.value?{name:"vue",fn:a(()=>[i(t(o))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[3]||(s[3]=p("",6)),g(i(t(E),null,null,512),[[c,n.value]]),i(h,null,{default:a(()=>[i(t(y),{title:"",description:"",locale:"",select:"vue",order:"vue,react,html",github:"",gitlab:"",theme:"",lightTheme:"",darkTheme:"",stackblitz:"%7B%22show%22%3Afalse%7D",codesandbox:"%7B%22show%22%3Afalse%7D",codeplayer:"%7B%22show%22%3Afalse%7D",files:"%7B%22vue%22%3A%7B%7D%2C%22react%22%3A%7B%7D%2C%22html%22%3A%7B%7D%7D",scope:"",visible:!0,onMount:s[1]||(s[1]=()=>{n.value=!1}),vueCode:t(C)},u({_:2},[l.value?{name:"vue",fn:a(()=>[i(t(l))]),key:"0"}:void 0]),1032,["vueCode"])]),_:1}),s[4]||(s[4]=p("",32))])}}});export{x as __pageData,_ as default};
