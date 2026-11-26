<script lang="ts" setup>
import {
  Modal,
  TinyDatePicker,
  TinyForm,
  TinyFormItem,
  TinyInput,
  TinySelect,
} from '@opentiny/vue'
import { t } from '@opentiny/vue-locale'
import { reactive, ref } from 'vue'

interface CompProps {
  projectData: {
    positionOptions: any[]
    hrOptions: any[]
    teacherOptions: any[]
  }
}
defineProps<CompProps>()

const formRef = ref()

const basicInfo = reactive({
  projectName: '',
  position: '',
  hr: '',
  teacher: '',
  startTime: '',
  endTime: '',
  phone: '',
  address: '',
  remark: '',
})
const validType = ref('text')

const commonRule = [
  {
    required: true,
    trigger: ['blur', 'change'],
    message: t('advanceForm.form.validError.null'),
  },
]
const rules = ref({
  projectName: [...commonRule],
  position: [...commonRule],
  hr: [...commonRule],
  teacher: [...commonRule],
  startTime: [...commonRule],
  endTime: [...commonRule],
  phone: [...commonRule],
  address: [...commonRule],
  remark: [...commonRule],
})

function validForm() {
  let baseValidate = false
  formRef.value.validate((valid) => {
    if (!valid) {
      Modal.message({
        message: t('baseForm.form.submit.error'),
        status: 'error',
      })
    }
    baseValidate = valid
  })

  return baseValidate
}

function resetForm() {
  formRef.value.resetFields()
}

defineExpose({
  validForm,
  resetForm,
})
</script>

<template>
  <div id="project-form">
    <TinyForm
      ref="formRef" class="form-container" label-position="top" :model="basicInfo" :rules="rules"
      :validate-type="validType"
    >
      <!-- 项目名称 -->
      <TinyFormItem :label="$t('advanceForm.form.basicInfo.projectName')" prop="projectName">
        <TinyInput v-model="basicInfo.projectName" />
      </TinyFormItem>
      <!-- 培养职位 -->
      <TinyFormItem :label="$t('advanceForm.form.basicInfo.position')" prop="position">
        <TinySelect v-model="basicInfo.position" :options="projectData.positionOptions" />
      </TinyFormItem>
      <!-- HR -->
      <TinyFormItem :label="$t('advanceForm.form.basicInfo.hr')" prop="hr">
        <TinySelect v-model="basicInfo.hr" :options="projectData.hrOptions" />
      </TinyFormItem>
      <!-- 导师 -->
      <TinyFormItem :label="$t('advanceForm.form.basicInfo.teacher')" prop="teacher">
        <TinySelect v-model="basicInfo.teacher" :options="projectData.teacherOptions" />
      </TinyFormItem>
      <!-- 开始时间 -->
      <TinyFormItem :label="$t('advanceForm.form.basicInfo.startTime')" prop="startTime">
        <TinyDatePicker v-model="basicInfo.startTime" />
      </TinyFormItem>
      <!-- 结束时间 -->
      <TinyFormItem :label="$t('advanceForm.form.basicInfo.endTime')" prop="endTime">
        <TinyDatePicker v-model="basicInfo.endTime" />
      </TinyFormItem>
      <!-- 电话 -->
      <TinyFormItem :label="$t('advanceForm.form.basicInfo.phone')" prop="phone">
        <TinyInput v-model="basicInfo.phone" />
      </TinyFormItem>
      <!-- 地址 -->
      <TinyFormItem :label="$t('advanceForm.form.basicInfo.address')" prop="address">
        <TinyInput v-model="basicInfo.address" />
      </TinyFormItem>
      <!-- 备注 -->
      <TinyFormItem :label="$t('advanceForm.form.basicInfo.remark')" prop="remark">
        <TinyInput v-model="basicInfo.remark" />
      </TinyFormItem>
    </TinyForm>
  </div>
</template>

<style scoped lang="less">
.form-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 10%;
  row-gap: 12px;
}
</style>
