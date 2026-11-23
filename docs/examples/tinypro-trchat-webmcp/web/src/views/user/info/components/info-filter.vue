<script lang="ts" setup>
import { Modal, Button as TinyButton } from '@opentiny/vue'
import { defineAsyncComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store'

const props = defineProps({
  activeName: String,
})

const InfoFilterStartTime = defineAsyncComponent(() => import('./info-filterStartTime.vue'))
const InfoFilterEndTime = defineAsyncComponent(() => import('./info-filterEndTime.vue'))
const InfoFilterStatus = defineAsyncComponent(() => import('./info-filterStatus.vue'))
const InfoFilterType = defineAsyncComponent(() => import('./info-filterType.vue'))

const userStore = useUserStore()
const filterstarttime = ref()
const filterendtime = ref()
const filterstatus = ref()
const filtertype = ref()
const { t } = useI18n()

// 重置筛选项
function reset() {
  if (props.activeName === '1') {
    filterstarttime.value?.reset()
    filterendtime.value?.reset()
  }
  filterstatus.value?.reset()
  filtertype.value?.reset()
  userStore.resetFilterInfo()
  userStore.setInfo({ reset: true })
}

function submit() {
  if (props.activeName === '1') {
    userStore.startTime === ''
    || userStore.endTime === ''
    || userStore.filterStatus?.length === 0
    || userStore.filterType?.length === 0
      ? Modal.message({
          message: t('userInfo.filter.all'),
          status: 'error',
        })
      : userStore.setInfo({ submit: true, sort: undefined })
  }
  else {
    userStore.filterStatus?.length === 0 || userStore.filterType?.length === 0
      ? Modal.message({
          message: t('userInfo.filter.all'),
          status: 'error',
        })
      : userStore.setInfo({ submit: true, sort: undefined })
  }
}
defineExpose({
  reset,
})
</script>

<template>
  <div>
    <InfoFilterStartTime v-if="activeName === '1'" ref="filterstarttime" />
    <InfoFilterEndTime v-if="activeName === '1'" ref="filterendtime" />
    <InfoFilterStatus ref="filterstatus" />
    <InfoFilterType ref="filtertype" />

    <div class="mt-8 flex items-center justify-center">
      <TinyButton type="primary" @click="submit">
        {{ $t('userInfo.btn.search') }}
      </TinyButton>
      <TinyButton @click="reset">
        {{ $t('userInfo.btn.reset') }}
      </TinyButton>
    </div>
  </div>
</template>

<style scoped lang="less">
</style>
