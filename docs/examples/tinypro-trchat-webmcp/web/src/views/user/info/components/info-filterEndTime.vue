<script lang="ts" setup>
import { Modal, DatePicker as TinyDatePicker } from '@opentiny/vue'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store'

// 变量设置
const { t } = useI18n()
const userStore = useUserStore()
const endTime = ref('')

function reset() {
  endTime.value = ''
}

function handleBlur() {
  const start = new Date(
    JSON.parse(JSON.stringify(userStore.startTime)),
  ).getTime()
  const end = new Date(JSON.parse(JSON.stringify(endTime.value))).getTime()
  if (end < start) {
    endTime.value = ''
    Modal.message({
      message: t('userInfo.time.message'),
      status: 'error',
    })
  }
}

// 监听选择
watch(endTime, (newValue) => {
  userStore.setInfo({ endTime: newValue })
})

defineExpose({
  reset,
})
</script>

<template>
  <div>
    <div class="flex items-center gap-2 text-[14px]">
      <span class="text-[140%] text-[#be1818]">*</span>
      <span>{{ $t('userInfo.filter.endTime') }}：</span>
    </div>

    <TinyDatePicker v-model="endTime" value-format="yyyy-MM-dd" @blur="handleBlur" />
  </div>
</template>

<style scoped lang="less"></style>
