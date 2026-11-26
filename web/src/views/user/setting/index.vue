<script lang="ts" setup>
import { Modal, Button as TinyButton } from '@opentiny/vue'
import { defineAsyncComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useUserStore } from '@/store'
import { getSimpleDate } from '@/utils/time'

const HeadTop = defineAsyncComponent(() => import('../../form/step/components/head.vue'))
const SetFrom = defineAsyncComponent(() => import('./components/set-from.vue'))

const { t } = useI18n()
const setFormRef = ref()
const userStore = useUserStore()

// btn操作
function handleFormReset() {
  setFormRef.value.setReset()
}

async function handleSubmit() {
  const data = setFormRef.value.setData()
  if (setFormRef.value.setFormValid()) {
    const newTemp = {
      department: data.filterOptions.department,
      job: data.filterOptions.position,
      employeeType: data.filterOptions.type,
      probationStart: getSimpleDate(data.filterOptions.date[0]),
      probationEnd: getSimpleDate(data.filterOptions.date[1]),
      probationDuration: data.filterOptions.during,
      protocolStart: getSimpleDate(data.filterOptions.startTime),
      protocolEnd: getSimpleDate(data.filterOptions.endTime),
    }

    await userStore.updateInfo(newTemp)

    Modal.message({
      message: t('baseForm.form.submit.success'),
      status: 'success',
    })
    handleFormReset()
  }
  else {
    Modal.message({
      message: t('baseForm.form.submit.error'),
      status: 'error',
    })
  }
}
</script>

<template>
  <div class="container-set">
    <Breadcrumb :items="['menu.user', 'menu.user.setting']" />
    <div class="general-card">
      <div class="general-top">
        <HeadTop />
      </div>
      <div class="general-contain">
        <SetFrom ref="setFormRef" />
        <div class="general-btn">
          <TinyButton type="primary" native-type="submit" @click="handleSubmit">
            {{ $t('userSetting.save') }}
          </TinyButton>
          <TinyButton @click="handleFormReset">
            {{ $t('userSetting.cancel') }}
          </TinyButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.container-set {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: inherit;
  margin: 0 auto;

  .general-card {
    height: 100%;
    padding: 10px;
    overflow-x: hidden;
    overflow-y: auto;
    border-radius: 10px;

    .general-top {
      display: flex;
      justify-content: space-around;
      min-height: 202px;
      margin: 0 -12px;
      overflow: hidden;
      background-image: url('@/assets/images/step-head.png');
      background-size: 100% 100%;
    }

    .general-contain {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      min-height: 75%;
      padding: 30px 0 10px 20px;
      color: black;
      background-color: #fff;
      border-radius: 10px;

      .tiny-layout {
        width: 80%;
      }
    }

    .general-btn {
      position: relative;
      left: 160px;

      button {
        width: 100px;
        height: 36px;
        border-radius: 4px;
      }
    }

    .margin-bottom {
      margin: 15px 0;
    }

    .col {
      padding: 4px 0;
      color: #fff;
    }
  }
}
</style>
