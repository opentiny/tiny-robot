<script lang="ts" setup>
import {
  Loading,
  Modal,
  Button as TinyButton,
} from '@opentiny/vue'
import { onBeforeMount, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getBaseData } from '@/api/form'
import BaseInfo from './components/base-info.vue'
import DetailInfo from './components/detail-info.vue'
// 加载效果
const state = reactive<{
  loading: any
}>({
  loading: null,
})

// 初始化请求数据
const { t } = useI18n()
const baseInfoFormRef = ref(null)
const detailInfoFormRef = ref(null)

const coachPlay = ref(true)
const projectData = reactive({
  position: [],
  HR: [],
  mentor: [],
  director: [],
})

// 请求数据接口方法
async function fetchData() {
  state.loading = Loading.service({
    text: 'loading...',
    target: document.getElementById('container'),
  })
  try {
    const { data } = await getBaseData()
    projectData.position = data.position
    projectData.HR = data.HR
    projectData.mentor = data.mentor
    projectData.director = data.director
  }
  finally {
    state.loading.close()
  }
}

// 初始化请求数据
onBeforeMount(() => {
  fetchData()
})

// form的button
function handleFormReset() {
  baseInfoFormRef.value.peopleReset()
  detailInfoFormRef.value.planReset()
}

function handleSubmit() {
  const baseValid = baseInfoFormRef.value.baseValid()
  if (baseValid) {
    Modal.message({
      message: t('baseForm.form.submit.success'),
      status: 'success',
    })
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
  <div class="container-form">
    <div class="container-header">
      <Breadcrumb :items="['menu.form', 'menu.form.base']" />
    </div>
    <div class="base-body">
      <div class="form-card">
        <BaseInfo
          ref="baseInfoFormRef"
          :project-data="projectData"
          :coach-play="coachPlay"
        />
      </div>
      <div class="form-card mart_16">
        <DetailInfo ref="detailInfoFormRef" />
      </div>
      <div class="base-footer mart_16">
        <TinyButton @click="handleFormReset">
          {{ $t('baseForm.form.cancel') }}
        </TinyButton>
        <TinyButton
          type="primary"
          native-type="submit"
          @click="handleSubmit"
        >
          {{ $t('stepForm.button.submit') }}
        </TinyButton>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.form-card {
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
