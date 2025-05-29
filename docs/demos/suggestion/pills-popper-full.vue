<template>
  <div style="display: flex; gap: 8px">
    <TrSuggestionPopover :data="popoverData" :loading="loading" style="flex-shrink: 0" @open="delaySetData">
      <TrSuggestionPillButton>
        <template #icon>
          <IconSparkles style="font-size: 16px; color: #1476ff" />
        </template>
      </TrSuggestionPillButton>
    </TrSuggestionPopover>
    <TrSuggestionPills :items="items" style="flex: 1"></TrSuggestionPills>
  </div>
</template>

<script setup lang="ts">
import { SuggestionPillItem, TrSuggestionPills } from '@opentiny/tiny-robot'
import { IconLike, IconSparkles } from '@opentiny/tiny-robot-svgs'
import { ref } from 'vue'

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

const dropdownMenuItems = ref([
  { id: '1', text: '去续费' },
  { id: '2', text: '去退订' },
  { id: '3', text: '查账单' },
  { id: '4', text: '导账单' },
  { id: '5', text: '对帐单' },
])

// 模拟数据
const buttonTexts = ['产品及问题咨询', '资源管理', '故障诊断', '费用成本', '资源管理', '故障诊断', '费用成本']

const items = ref<SuggestionPillItem[]>(
  buttonTexts.map((text, index) => ({
    id: String(index),
    text,
    icon: IconLike,
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
  })),
)
</script>
