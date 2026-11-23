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
import { computed, reactive, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

interface FilterOptions {
  director: Array<object>
  remark: string
  startTime: string
  endTime: string
}

// 父组件传值
const props = defineProps({
  projectData: Object,
  directorPlay: Boolean,
})

const { directorPlay } = toRefs(props)

// 加载效果
const state = reactive<{
  filterOptions: FilterOptions
}>({
  filterOptions: {} as FilterOptions,
})

// 初始化请求数据
const { t } = useI18n()
const directorFormRef = ref()
const disabled = ref(false)
// 校验规则
const rulesType = {
  required: true,
  trigger: ['blur', 'change'],
}
const rulesSelect = {
  required: true,
  message: '必选',
  trigger: ['blur', 'change'],
}
const rules = computed(() => {
  return {
    director: directorPlay.value ? [rulesSelect] : '',
    remark: directorPlay.value ? [rulesType] : '',
    startTime: directorPlay.value ? [rulesType] : '',
    endTime: directorPlay.value ? [rulesType] : '',
  }
})

function handleBlur() {
  const start = new Date(
    state.filterOptions.startTime,
  ).getTime()
  const end = new Date(
    state.filterOptions.endTime,
  ).getTime()
  if (end < start) {
    state.filterOptions.endTime = ''
    Modal.message({
      message: t('userInfo.time.message'),
      status: 'error',
    })
  }
}

function directorValid() {
  let directorValidate = false
  directorFormRef.value.validate((valid: boolean) => {
    if (valid) {
      disabled.value = true
    }
    directorValidate = valid
  })
  return directorValidate
}

function directorReset() {
  disabled.value = false
  state.filterOptions = {} as FilterOptions
}

defineExpose({
  directorValid,
  directorReset,
  state,
  disabled,
})
</script>

<template>
  <TinyLayout>
    <TinyForm
      ref="directorFormRef"
      :model="state.filterOptions"
      :rules="rules"
      label-width="150px"
      :label-align="true"
      label-position="top"
      class="form-base-info"
    >
      <TinyRow class="flex flex-wrap">
        <TinyCol label-width="100px" class="w-1/3 max-sm:mb-4 max-md:w-1/2 max-sm:w-full">
          <TinyFormItem
            :label="$t('stepForm.dire.supervisor')"
            prop="director"
          >
            <TinySelect
              v-model="state.filterOptions.director"
              :disabled="disabled"
              :placeholder="$t('baseForm.form.label.placeholder')"
              multiple
            >
              <TinyOption
                v-for="item in projectData?.director as any"
                :key="item"
                :label="$t(item)"
                :value="item"
              />
            </TinySelect>
          </TinyFormItem>
        </TinyCol>
        <TinyCol label-width="100px" class="w-1/3 max-sm:mb-4 max-md:w-1/2 max-sm:w-full">
          <TinyFormItem :label="$t('stepForm.dire.remarks')" prop="remark">
            <TinyInput
              v-model="state.filterOptions.remark"
              :disabled="disabled"
            />
          </TinyFormItem>
        </TinyCol>
        <TinyCol label-width="100px" class="w-1/3 max-sm:mb-4 max-md:w-1/2 max-sm:w-full">
          <TinyFormItem
            :label="$t('stepForm.dire.startTime')"
            prop="startTime"
          >
            <TinyDatePicker
              v-model="state.filterOptions.startTime"
              :disabled="disabled"
            />
          </TinyFormItem>
        </TinyCol>
        <TinyCol label-width="100px" class="w-1/3 max-sm:mb-4 max-md:w-1/2 max-sm:w-full">
          <TinyFormItem :label="$t('stepForm.dire.endTime')" prop="endTime">
            <TinyDatePicker
              v-model="state.filterOptions.endTime"
              :disabled="disabled"
              @blur="handleBlur"
            />
          </TinyFormItem>
        </TinyCol>
      </TinyRow>
    </TinyForm>
  </TinyLayout>
</template>

<style scoped lang="less"></style>
