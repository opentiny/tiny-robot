<script lang="ts" setup>
import {
  Modal,
  Col as TinyCol,
  DatePicker as TinyDatePicker,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Layout as TinyLayout,
  Option as TinyOption,
  Row as TinyRow,
  Select as TinySelect,
} from '@opentiny/vue'
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

interface FilterOptions {
  department: string
  position: Array<object>
  type: Array<object>
  date: Array<object>
  during: Array<object>
  startTime: string
  endTime: string
}

const projectData = [
  {
    value: '1',
    label: 'social recruitment',
  },
  {
    value: '2',
    label: 'scholl recruitment',
  },
  {
    value: '3',
    label: 'Job transfer',
  },
]

// 加载效果
const state = reactive<{
  filterOptions: FilterOptions
  department: string
  position: Array<object>
  type: Array<object>
  date: Array<object>
  during: string
  startTime: string
  endTime: string
}>({
  filterOptions: {} as FilterOptions,
  department: '',
  position: [],
  type: [],
  date: [],
  during: '',
  startTime: '',
  endTime: '',
})

// 初始化请求数据
const setFormRef = ref()
const { t } = useI18n()

// 校验规则
const rulesType = {
  required: true,
  trigger: 'blur',
}
const rulesSelect = {
  required: true,
  message: '必选',
  trigger: 'blur',
}
const rules = computed(() => {
  return {
    department: [rulesType],
    position: [rulesType],
    type: [rulesSelect],
    date: [rulesType],
    during: [rulesType],
    startTime: [rulesType],
    endTime: [rulesType],
  }
})

// 结束时间校验
function handleBlur() {
  const start = state.filterOptions.startTime?.getTime()
  const end = state.filterOptions.endTime?.getTime()
  if (end < start) {
    state.filterOptions.endTime = ''
    Modal.message({
      message: t('userInfo.time.message'),
      status: 'error',
    })
  }
}
function setFormValid() {
  let setValidate = false
  setFormRef.value.validate((valid: boolean) => {
    setValidate = valid
  })

  return setValidate
}

function setReset() {
  state.filterOptions = {} as FilterOptions
}

function setData() {
  return state
}

defineExpose({
  setData,
  setFormValid,
  setReset,
})
</script>

<template>
  <TinyLayout>
    <TinyForm
      ref="setFormRef"
      :model="state.filterOptions"
      :rules="rules"
      label-width="150px"
      :label-align="true"
      label-position="left"
    >
      <TinyRow :flex="true" justify="left">
        <TinyCol :span="5" label-width="100px">
          <TinyFormItem :label="$t('userSetting.department')" prop="department">
            <TinyInput v-model="state.filterOptions.department" />
          </TinyFormItem>
        </TinyCol>
        <TinyCol :span="5" label-width="100px">
          <TinyFormItem :label="$t('userSetting.position')" prop="position">
            <TinyInput v-model="state.filterOptions.position" />
          </TinyFormItem>
        </TinyCol>
      </TinyRow>

      <TinyRow :flex="true" justify="left">
        <TinyCol :span="5" label-width="100px">
          <TinyFormItem :label="$t('userSetting.type')" prop="type">
            <TinySelect
              v-model="state.filterOptions.type"
              :placeholder="$t('baseForm.form.label.placeholder')"
            >
              <TinyOption
                v-for="item in projectData"
                :key="item.value"
                :label="$t(item.label)"
                :value="item.label"
              />
            </TinySelect>
          </TinyFormItem>
        </TinyCol>
        <TinyCol :span="5" label-width="100px">
          <TinyFormItem :label="$t('userSetting.date')" prop="date">
            <TinyDatePicker
              v-model="state.filterOptions.date"
              unlink-panels type="daterange"
              range-separator="-"
              :start-placeholder="$t('userSetting.first')"
              :end-placeholder="$t('userSetting.last')"
            />
          </TinyFormItem>
        </TinyCol>
      </TinyRow>

      <TinyRow :flex="true" justify="left">
        <TinyCol :span="5" label-width="100px">
          <TinyFormItem :label="$t('userSetting.during')" prop="during">
            <TinyInput v-model="state.filterOptions.during" />
          </TinyFormItem>
        </TinyCol>
        <TinyCol :span="5" label-width="100px">
          <TinyFormItem :label="$t('userSetting.startTime')" prop="startTime">
            <TinyDatePicker v-model="state.filterOptions.startTime" @blur="handleBlur" />
          </TinyFormItem>
        </TinyCol>
      </TinyRow>

      <TinyRow :flex="true" justify="left">
        <TinyCol :span="5" label-width="100px">
          <TinyFormItem :label="$t('userSetting.endTime')" prop="endTime">
            <TinyDatePicker v-model="state.filterOptions.endTime" @blur="handleBlur" />
          </TinyFormItem>
        </TinyCol>
      </TinyRow>
    </TinyForm>
  </TinyLayout>
</template>

<style lang="less" scoped></style>
