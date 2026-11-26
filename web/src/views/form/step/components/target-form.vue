<script lang="ts" setup>
import { Transfer as TinyTransfer } from '@opentiny/vue'
import { reactive, ref } from 'vue'

interface data {
  key: number
  label: string
  disabled: boolean
}

// 初始化请求数据
const targetFormRef = ref()
const targetData: data[] = reactive([])
for (let i = 0; i <= 15; i += 1) {
  targetData.push({
    key: i,
    label: `Options ${i}`,
    disabled: false,
  })
}

const targetModel = ref([])

function targetSubmit() {
  if (targetModel.value?.length) {
    targetData.forEach((item) => {
      item.disabled = true
    })
    return true
  }
  return false
}

function targetReset() {
  targetModel.value = []
}

defineExpose({
  targetReset,
  targetSubmit,
  targetModel,
})
</script>

<template>
  <div class="contain">
    <TinyTransfer
      ref="targetFormRef"
      v-model="targetModel"
      :data="targetData"
      :titles="[$t('stepForm.target.list'), $t('stepForm.target.sure')]"
    />
  </div>
</template>

<style scoped lang="less">
.contain {
  display: flex;
  justify-content: start;
  padding-left: 14px;
  padding-bottom: 24px;
}

:deep(.tiny-transfer__button) {
  width: auto;
}
</style>
