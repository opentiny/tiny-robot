<template>
  <TrSuggestionPills
    :items="items"
    v-model:showAll="showAll"
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
  <button ref="addButtonRef" @click="handleClickAddButton">增加按钮</button>
</template>

<script setup lang="ts">
import { SuggestionPillItem, SuggestionPillMenuAction, TrSuggestionPills } from '@opentiny/tiny-robot'
import { IconEdit, IconSparkles } from '@opentiny/tiny-robot-svgs'
import { TinySwitch } from '@opentiny/vue'
import { h, markRaw, ref } from 'vue'

const showAll = ref(false)
const showAllRef = ref<InstanceType<typeof TinySwitch>>()
const addButtonRef = ref<HTMLButtonElement | null>(null)

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
</script>

<style lang="less" scoped>
:deep(.tr-suggestion-pills__more-wrapper) {
  left: 40px;
}

:deep(.tr-suggestion-pills__container) {
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    // 背景色需要和容器背景色一致
    background: linear-gradient(to right, rgba(rgb(248, 248, 248), 0) 90%, rgba(rgb(248, 248, 248), 1));
    pointer-events: none;
  }
}
</style>
