<template>
  <div>
    <TrMcpAddModal v-model:show="show" @confirm="handleConfirm" />
    <tiny-button @click="show = !show">显示弹窗</tiny-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button as TinyButton } from '@opentiny/vue'
import { TrMcpAddModal, type IPluginCreationData } from '@opentiny/tiny-robot'

const show = ref(false)

const handleConfirm = (type: 'form' | 'code', data: IPluginCreationData) => {
  console.log(type, data)
}
</script>
