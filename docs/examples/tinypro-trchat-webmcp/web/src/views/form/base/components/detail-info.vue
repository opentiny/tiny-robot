<script lang="ts" setup>
import {
  Col as TinyCol,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Layout as TinyLayout,
  Radio as TinyRadio,
  Row as TinyRow,
} from '@opentiny/vue'
import { computed, defineAsyncComponent, reactive, toRefs } from 'vue'

interface FilterOptions {
  culture: string
  role: string
  condition: string
  remark: string
}

// 加载效果
const state = reactive<{
  filterOptions: FilterOptions
}>({
  filterOptions: {
    culture: '1',
    role: '1',
    condition: '1',
    remark: '',
  } as FilterOptions,
})
const { filterOptions } = toRefs(state)

// 检查是否启用 TinyEditor 富文本编辑器
const isTinyEditorEnabled = computed(() => {
  return import.meta.env.VITE_TINY_EDITOR_ENABLED === 'true'
})
// 未启用时不加载富文本组件对应的 chunk
const RichTextItem = defineAsyncComponent(
  () => import('./rich-text-item.vue'),
)

function objectiveReset() {
  state.filterOptions = {
    culture: '1',
    role: '1',
    condition: '1',
    remark: '',
  } as FilterOptions
}

defineExpose({
  objectiveReset,
})
</script>

<template>
  <TinyLayout>
    <TinyForm
      :model="state.filterOptions"
      :label-align="true"
      label-position="top"
    >
      <div class="form-header">
        {{ $t('baseForm.form.title.detail') }}
      </div>
      <TinyRow>
        <transition-fade-down-group>
          <TinyCol :span="12">
            <TinyFormItem
              :label="$t('baseForm.form.label.culture')"
              prop="culture"
              class="max-sm:mb-4"
            >
              <div>
                <TinyRadio v-model="filterOptions.culture" label="1">
                  {{
                    $t('baseForm.form.label.yes')
                  }}
                </TinyRadio>
                <TinyRadio v-model="filterOptions.culture" label="2">
                  {{
                    $t('baseForm.form.label.no')
                  }}
                </TinyRadio>
              </div>
            </TinyFormItem>
          </TinyCol>
          <TinyCol :span="12">
            <TinyFormItem :label="$t('baseForm.form.label.role')" prop="role" class="max-sm:mb-4">
              <div>
                <TinyRadio v-model="filterOptions.role" label="1">
                  {{
                    $t('baseForm.form.label.roleone')
                  }}
                </TinyRadio>
                <TinyRadio v-model="filterOptions.role" label="2">
                  {{
                    $t('baseForm.form.label.roletwo')
                  }}
                </TinyRadio>
              </div>
            </TinyFormItem>
          </TinyCol>
          <TinyCol :span="12">
            <TinyFormItem
              :label="$t('baseForm.form.label.condition')"
              prop="condition"
              class="max-sm:mb-4"
            >
              <div>
                <TinyRadio v-model="filterOptions.condition" label="1">
                  {{
                    $t('baseForm.form.label.conditionone')
                  }}
                </TinyRadio>
                <TinyRadio v-model="filterOptions.condition" label="2">
                  {{
                    $t('baseForm.form.label.conditiontwo')
                  }}
                </TinyRadio>
                <TinyRadio v-model="filterOptions.condition" label="3">
                  {{
                    $t('baseForm.form.label.conditionthree')
                  }}
                </TinyRadio>
                <TinyRadio v-model="filterOptions.condition" label="4">
                  {{
                    $t('baseForm.form.label.conditionfour')
                  }}
                </TinyRadio>
              </div>
            </TinyFormItem>
          </TinyCol>
          <TinyCol v-if="isTinyEditorEnabled" :span="12">
            <TinyFormItem
              :label="$t('baseForm.form.label.remark')"
              prop="condition"
              class="max-sm:mb-4"
            >
              <RichTextItem />
            </TinyFormItem>
          </TinyCol>
        </transition-fade-down-group>
      </TinyRow>
    </TinyForm>
  </TinyLayout>
</template>

<style scoped lang="less">
</style>
