<template>
  <TrSuggestionPills>
    <TrSuggestionPopover :data="popoverData" :loading="loading" @open="delaySetData">
      <TrSuggestionPillButton>
        <template #icon>
          <IconSparkles style="font-size: 16px; color: #1476ff" />
        </template>
      </TrSuggestionPillButton>
    </TrSuggestionPopover>
    <TrDropdownMenu :items="dropdownMenuItems">
      <TrSuggestionPillButton> 点我打开Dropdown Menu </TrSuggestionPillButton>
    </TrDropdownMenu>
  </TrSuggestionPills>
  <hr />
  <span>点击第一个图标打开Popover弹出框</span>
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
</script>
