<script lang="ts" setup>
import { DatePicker as TinyDatePicker } from '@opentiny/vue'
import { ref, watch } from 'vue'
import { useUserStore } from '@/store'

// 变量设置
const userStore = useUserStore()
const startTime = ref('')

function reset() {
  startTime.value = ''
}

// 监听选择
watch(startTime, (newValue) => {
  userStore.setInfo({ startTime: newValue })
})

defineExpose({
  reset,
})
</script>

<template>
  <div>
    <div class="flex items-center gap-2 text-[14px]">
      <span class="text-[140%] text-[#be1818]">*</span>
      <span>{{ $t('userInfo.filter.startTime') }}：</span>
    </div>
    <TinyDatePicker v-model="startTime" value-format="yyyy-MM-dd" />
  </div>
</template>

<style scoped lang="less"></style>
