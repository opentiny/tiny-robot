<script lang="ts" setup>
import type { ITreeNodeData } from '@/router/guard/menu'
import { icons } from '@opentiny/icons/json/icons.json'
import {
  TinyCol,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  TinyRow,
  Select as TinySelect,
} from '@opentiny/vue'
import { computed, h, reactive, ref, unref } from 'vue'

const props = defineProps<{
  node: ITreeNodeData
  menus: ITreeNodeData[]
  localeData: { value: string, label: string }[]
  readonly: boolean
}>()

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
    oldLabel: [rulesType],
    order: [rulesType],
    component: [rulesType],
    url: [rulesType],
    locale: [rulesSelect],
  }
})

const treeOp = computed(() => ({ data: props.menus }))
const updateForm = ref()
const menuInfo = reactive<ITreeNodeData>({
  id: props.node.id,
  label: props.node.label,
  url: props.node.url,
  component: props.node.component,
  icon: props.node.customIcon,
  menuType: props.node.menuType,
  parentId: props.node.parentId,
  order: props.node.order,
  locale: props.node.locale,
  oldLabel: props.node.oldLabel,
})
const iconDatas = Object.keys(icons).map((key) => {
  return {
    label: key,
    value: key,
    icon: h('i', { class: `ci-${key}`, style: { fontSize: '18px', marginRight: '6px' } }),
  }
})

function getMenuInfo() {
  return {
    ...unref(menuInfo),
    parentId:
        (menuInfo.parentId as string | number) === ''
        || menuInfo.parentId === null
          ? null
          : menuInfo.parentId,
  } as ITreeNodeData
}
defineExpose({
  getMenuInfo,
  valid: async () => updateForm.value.validate(),
})
</script>

<template>
  <TinyForm
    ref="updateForm"
    :display-only="props.readonly"
    :rules="rules"
    :model="menuInfo"
  >
    <TinyRow class="flex flex-wrap">
      <TinyCol class="w-1/2 max-sm:w-full">
        <TinyFormItem :label="$t('menuInfo.table.name')" prop="locale">
          <TinySelect
            v-model="menuInfo.locale"
            :placeholder="$t('baseForm.form.label.placeholder')"
            filterable
            no-match-text="No Match"
            :options="props.localeData"
            optimization
          />
        </TinyFormItem>
      </TinyCol>
      <TinyCol class="w-1/2 max-sm:w-full">
        <TinyFormItem :label="$t('menuInfo.table.order')" prop="order">
          <TinyInput v-model="menuInfo.order" />
        </TinyFormItem>
      </TinyCol>
      <TinyCol class="w-1/2 max-sm:w-full">
        <TinyFormItem :label="$t('menuInfo.table.parentId')" prop="parentId">
          <TinySelect
            v-model="menuInfo.parentId"
            value-field="id"
            text-field="label"
            render-type="tree"
            :tree-op="treeOp"
            clearable
          />
        </TinyFormItem>
      </TinyCol>
      <TinyCol class="w-1/2 max-sm:w-full">
        <TinyFormItem :label="$t('menuInfo.table.icon')" prop="icon">
          <TinySelect
            v-model="menuInfo.icon"
            :placeholder="$t('baseForm.form.label.placeholder')"
            filterable
            no-match-text="No Match"
            :options="iconDatas"
            optimization
          />
        </TinyFormItem>
      </TinyCol>
      <TinyCol class="w-1/2 max-sm:w-full">
        <TinyFormItem :label="$t('menuInfo.table.component')" prop="component">
          <TinyInput v-model="menuInfo.component" />
        </TinyFormItem>
      </TinyCol>
      <TinyCol class="w-1/2 max-sm:w-full">
        <TinyFormItem :label="$t('menuInfo.table.path')" prop="url">
          <TinyInput v-model="menuInfo.url" />
        </TinyFormItem>
      </TinyCol>
      <TinyCol class="w-1/2 max-sm:w-full">
        <TinyFormItem
          prop="oldLabel"
          :label="$t('menuInfo.table.id')"
          :extra="$t('menuInfo.modal.tips.upd-id')"
        >
          <TinyInput v-model="menuInfo.oldLabel" />
        </TinyFormItem>
      </TinyCol>
    </TinyRow>
  </TinyForm>
</template>

<style scoped>
  :deep(.font-14-css) {
  font-size: 12px;
}
</style>
