<script lang="ts" setup>
import { CheckboxGroup as TinyCheckboxGroup } from '@opentiny/vue'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store'

const { t } = useI18n()
const userStore = useUserStore()
const checkList = ref([])
const options = ref([
  { label: 'A', text: t('userInfo.type.optionA') },
  { label: 'B', text: t('userInfo.type.optionB') },
  { label: 'C', text: t('userInfo.type.optionC') },
])

function reset() {
  checkList.value = []
}

// 监听选择
watch(checkList, (newValue) => {
  userStore.setInfo({ filterType: newValue })
})

defineExpose({
  reset,
})
</script>

<template>
  <div>
    <div class="flex items-center gap-2 text-[14px]">
      <span class="text-[140%] text-[#be1818]">*</span>
      <span>{{ $t('userInfo.type.type') }}：</span>
    </div>

    <TinyCheckboxGroup v-model="checkList" type="checkbox" :options="options" />
  </div>
</template>

<style scoped lang="less"></style>
