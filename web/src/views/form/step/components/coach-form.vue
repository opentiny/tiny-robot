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
  sector: string
  position: Array<object>
  hr: string
  teacher: Array<object>
  startTime: string
  endTime: string
}

// 父组件传值
const props = defineProps({
  projectData: Object,
  coachPlay: Boolean,
})

const { coachPlay } = toRefs(props)

// 加载效果
const state = reactive<{
  filterOptions: FilterOptions
}>({
  filterOptions: {} as FilterOptions,
})

// 初始化请求数据
const { t } = useI18n()
const coachFormRef = ref()
const disabled = ref(false)

function handleBlur() {
  const start = new Date(
    JSON.parse(JSON.stringify(state.filterOptions.startTime)),
  ).getTime()
  const end = new Date(
    JSON.parse(JSON.stringify(state.filterOptions.endTime)),
  ).getTime()
  if (end < start) {
    state.filterOptions.endTime = ''
    Modal.message({
      message: t('userInfo.time.message'),
      status: 'error',
    })
  }
}

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
    sector: coachPlay.value ? [rulesType] : '',
    position: coachPlay.value ? [rulesSelect] : '',
    hr: coachPlay.value ? [rulesSelect] : '',
    teacher: coachPlay.value ? [rulesSelect] : '',
    startTime: coachPlay.value ? [rulesType] : '',
    endTime: coachPlay.value ? [rulesType] : '',
  }
})

function coachValid() {
  let coachValidate = false
  coachFormRef.value.validate((valid: boolean) => {
    if (valid) {
      disabled.value = true
    }
    coachValidate = valid
  })

  return coachValidate
}

function coachReset() {
  disabled.value = false
  state.filterOptions = {} as FilterOptions
}

defineExpose({
  coachValid,
  coachReset,
  state,
  disabled,
})
</script>

<template>
  <TinyLayout>
    <TinyForm
      ref="coachFormRef"
      :model="state.filterOptions"
      :rules="rules"
      label-width="150px"
      :label-align="true"
      label-position="top"
      class="form-base-info"
    >
      <TinyRow class="flex flex-wrap">
        <transition-fade-down-group>
          <TinyCol class="w-1/3 max-sm:mb-4 max-md:w-1/2 max-sm:w-full">
            <TinyFormItem :label="$t('stepForm.coach.culture')" prop="sector">
              <TinyInput
                v-model="state.filterOptions.sector"
                :disabled="disabled"
                :placeholder="$t('searchTable.form.input')"
              />
            </TinyFormItem>
          </TinyCol>
          <TinyCol class="w-1/3 max-sm:mb-4 max-md:w-1/2 max-sm:w-full">
            <TinyFormItem
              :label="$t('stepForm.coach.position')"
              prop="position"
            >
              <TinySelect
                v-model="state.filterOptions.position"
                :disabled="disabled"
                :placeholder="$t('baseForm.form.label.placeholder')"
                multiple
              >
                <TinyOption
                  v-for="item in projectData?.position as any"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </TinySelect>
            </TinyFormItem>
          </TinyCol>
          <TinyCol class="w-1/3 max-sm:mb-4 max-md:w-1/2 max-sm:w-full">
            <TinyFormItem label="HR" prop="hr">
              <TinySelect
                v-model="state.filterOptions.hr"
                :disabled="disabled"
                :placeholder="$t('baseForm.form.label.placeholder')"
                multiple
              >
                <TinyOption
                  v-for="item in projectData?.HR as any"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </TinySelect>
            </TinyFormItem>
          </TinyCol>
          <TinyCol class="w-1/3 max-sm:mb-4 max-md:w-1/2 max-sm:w-full">
            <TinyFormItem :label="$t('stepForm.coach.mentor')" prop="teacher">
              <TinySelect
                v-model="state.filterOptions.teacher"
                :disabled="disabled"
                :placeholder="$t('baseForm.form.label.placeholder')"
                multiple
              >
                <TinyOption
                  v-for="item in projectData?.mentor as any"
                  :key="item"
                  :label="item"
                  :value="item"
                />
              </TinySelect>
            </TinyFormItem>
          </TinyCol>
          <TinyCol class="w-1/3 max-sm:mb-4 max-md:w-1/2 max-sm:w-full">
            <TinyFormItem
              :label="$t('stepForm.coach.startTime')"
              prop="startTime"
            >
              <TinyDatePicker
                v-model="state.filterOptions.startTime"
                :disabled="disabled"
                :placeholder="$t('searchTable.form.input')"
              />
            </TinyFormItem>
          </TinyCol>
          <TinyCol class="w-1/3 max-sm:mb-4 max-md:w-1/2 max-sm:w-full">
            <TinyFormItem
              :label="$t('stepForm.coach.endTime')"
              prop="endTime"
            >
              <TinyDatePicker
                v-model="state.filterOptions.endTime"
                :disabled="disabled"
                :placeholder="$t('searchTable.form.input')"
                @blur="handleBlur"
              />
            </TinyFormItem>
          </TinyCol>
        </transition-fade-down-group>
      </TinyRow>
    </TinyForm>
  </TinyLayout>
</template>
