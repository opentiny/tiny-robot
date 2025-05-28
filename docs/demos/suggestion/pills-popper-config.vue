<template>
  <TrSuggestionPills :items="items" @item-click="handleItemClick"></TrSuggestionPills>
  <hr />
  <span>点击第一个图标打开Popover弹出框</span>
</template>

<script setup lang="ts">
import { SuggestionPillItem, TrSuggestionPills } from '@opentiny/tiny-robot'
import { IconEdit, IconSparkles } from '@opentiny/tiny-robot-svgs'
import { h, ref } from 'vue'

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
      },
      slots: {
        loading: () => h('span', {}, '加载中...'),
      },
      events: {
        itemClick: (item) => {
          console.log(item)
        },
      },
    },
  },
  {
    id: '2',
    text: '点我打开Dropdown Menu',
    icon: IconEdit,
    action: {
      type: 'menu',
      props: {
        items: dropdownMenuItems.value,
      },
      events: {
        itemClick: (item) => {
          console.log(item)
        },
      },
    },
  },
  {
    id: '3',
    text: '资源管理',
  },
  {
    id: '4',
    text: '华为云弹性公网IP不通怎么回事？',
  },
  {
    id: '5',
    text: 'ECS示例规格如何选择？',
  },
  {
    id: '6',
    text: '什么是ECS弹性云服务器？',
  },
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

const delaySetData = () => {
  setTimeout(() => {
    if (items.value[0].action?.type === 'popover') {
      items.value[0].action.props.data = data
      items.value[0].action.props.loading = false
    }
  }, 1000)
}

const handleItemClick = (item: SuggestionPillItem) => {
  console.log(item)

  if (item.id === items.value[0].id) {
    delaySetData()
  }
}
</script>
