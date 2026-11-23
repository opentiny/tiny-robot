<script lang="ts" setup>
import type { Permission } from '@/api/permission'
import {
  Button as TinyButton,
  TinyCol,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Modal as TinyModal,
  Option as TinyOption,
  TinyRow,
  Select as TinySelect,
} from '@opentiny/vue'
import { computed, reactive, ref, unref, watch } from 'vue'
import { useResponsiveSize } from '@/hooks/responsive'

const props = defineProps<{
  permissions: Permission[]
  visible: boolean
}>()

const emits = defineEmits<{
  confirm: [RoleAddData]
  cancel: []
}>()

const { modalSize } = useResponsiveSize()

export interface RoleAddData {
  name: string
  permissionIds: number[]
  menuIds: number[]
}
const data = reactive<RoleAddData>({
  name: '',
  permissionIds: [],
  menuIds: [],
})
const visible = ref(props.visible)
watch(
  props,
  () => {
    visible.value = props.visible
  },
  { deep: true },
)
const rulesType = {
  required: true,
  trigger: 'blur',
}
const rules = computed(() => {
  return {
    name: [rulesType],
  }
})
const form = ref()
function onCancel() {
  emits('cancel')
}
function onConfirm() {
  form.value
    .validate()
    .then((isValid: boolean) => {
      if (!isValid) {
        return
      }
      emits('confirm', unref(data))
    })
    .catch()
}

defineExpose({
  setRoleInfo: (roleInfo: Omit<RoleAddData, 'menuIds'>) => {
    data.name = roleInfo.name
    data.permissionIds = roleInfo.permissionIds
  },
  onConfirm,
})
</script>

<template>
  <TinyModal
    v-model="visible"
    lock-scroll
    show-header
    show-footer
    height="auto"
    :width="modalSize"
    :title="$t('roleInfo.modal.title.add')"
  >
    <TinyForm ref="form" :model="data" :rules="rules">
      <TinyRow class="flex flex-wrap">
        <TinyCol class="w-1/2 max-sm:w-full">
          <TinyFormItem :label="$t('roleInfo.modal.input.name')" prop="name">
            <TinyInput v-model="data.name" />
          </TinyFormItem>
        </TinyCol>
        <TinyCol class="w-1/2 max-sm:w-full">
          <TinyFormItem :label="$t('roleInfo.modal.input.desc')" prop="permissionIds">
            <TinySelect
              v-model="data.permissionIds"
              :placeholder="$t('baseForm.form.label.placeholder')"
              multiple
            >
              <TinyOption
                v-for="item in props.permissions"
                :key="item.id"
                :label="item.desc || item.name"
                :value="item.id"
              />
            </TinySelect>
          </TinyFormItem>
        </TinyCol>
      </TinyRow>
    </TinyForm>
    <template #footer>
      <TinyButton round @click="onCancel">
        {{ $t('menu.btn.cancel') }}
      </TinyButton>
      <TinyButton type="primary" round @click="onConfirm">
        {{ $t('menu.btn.confirm') }}
      </TinyButton>
    </template>
  </TinyModal>
</template>

<style lang="less" scoped></style>
