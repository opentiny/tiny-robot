<script lang="ts" setup>
import {
  Col as TinyCol,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Layout as TinyLayout,
  Row as TinyRow,
} from '@opentiny/vue'
import { computed, reactive, ref, toRefs } from 'vue'

interface FilterOptions {
  summarize: string
}

const props = defineProps({
  summationPlay: Boolean,
})

const { summationPlay } = toRefs(props)

// 加载效果
const state = reactive<{
  filterOptions: FilterOptions
}>({
  filterOptions: {} as FilterOptions,
})

// 初始化请求数据
const summarizeRef = ref()
const disabled = ref(false)
// 校验规则
const rulesType = {
  required: true,
  trigger: 'blur',
}
const rules = computed(() => {
  return {
    summarize: summationPlay.value ? [rulesType] : '',
  }
})

function summarizeValid() {
  let sumValid = false
  summarizeRef.value.validate((valid: boolean) => {
    if (valid) {
      disabled.value = true
    }
    sumValid = valid
  })
  return sumValid
}

function summarizeReset() {
  disabled.value = false
  state.filterOptions = {} as FilterOptions
}

defineExpose({
  summarizeValid,
  summarizeReset,
  state,
  disabled,
})
</script>

<template>
  <TinyLayout>
    <TinyForm
      ref="summarizeRef"
      :model="state.filterOptions"
      :rules="rules"
      label-width="100px"
      :label-align="true"
      label-position="top"
    >
      <TinyRow class="flex">
        <TinyCol label-width="100px" class="w-1/2 max-sm:w-full">
          <TinyFormItem :label="$t('stepForm.sum.self')" prop="summarize">
            <TinyInput
              v-model="state.filterOptions.summarize"
              :disabled="disabled"
              type="textarea"
            />
          </TinyFormItem>
        </TinyCol>
      </TinyRow>
    </TinyForm>
  </TinyLayout>
</template>

<style scoped lang="less"></style>
