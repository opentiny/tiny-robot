<script setup lang="ts">
import type { ITreeNodeData } from '@/router/guard/menu'
import { Button as TinyButton, TinyInput, Modal as TinyModal, TinyTree } from '@opentiny/vue'
import { iconExpand, iconPutAway } from '@opentiny/vue-icon'
import { onMounted, ref, toRefs } from 'vue'
import { useResponsiveSize } from '@/hooks/responsive'

const props = defineProps<{
  visible: boolean
  menus: ITreeNodeData[]
  selectedId: number[]
}>()

const emits = defineEmits<{
  (event: 'close'): void
  (event: 'confirm', ids: number[]): void
}>()

const { modalSize } = useResponsiveSize()

const shrinkIcon = iconExpand()
const expandIcon = iconPutAway()
const filterText = ref('')
const { menus, selectedId } = toRefs(props)
const treeRef = ref()
const visible = ref(props.visible)
function onConfirm() {
  const keys = [
    ...treeRef.value.getHalfCheckedKeys(),
    ...treeRef.value.getCheckedKeys(),
  ]
  emits('confirm', keys)
}
function inputChange() {
  treeRef.value.filter(filterText.value)
}

function filterNodeMethod(text, data) {
  return data.label.includes(text)
}

onMounted(() => {
  selectedId.value.forEach((id) => {
    treeRef.value.setChecked(id, true, false)
  })
})

defineExpose({
  onConfirm,
  treeRef,
})
</script>

<template>
  <TinyModal
    v-model="visible"
    :width="modalSize"
    height="auto"
    :title="$t('roleInfo.table.bind')"
    show-footer
    @close="() => emits('close')"
  >
    <div class="menu-input">
      <TinyInput v-model="filterText" :placeholder="$t('setting.input.search')" @input="inputChange" />
    </div>
    <TinyTree
      ref="treeRef"
      :shrink-icon="shrinkIcon"
      shrink-icon-color="#5291FF"
      node-key="id"
      :expand-icon="expandIcon"
      expand-icon-color="#5291FF"
      :data="menus"
      :filter-node-method="filterNodeMethod"
      show-checkbox
    />
    <template #footer>
      <TinyButton round @click="() => emits('close')">
        {{ $t('menu.btn.cancel') }}
      </TinyButton>
      <TinyButton round type="primary" @click="onConfirm">
        {{ $t('menu.btn.confirm') }}
      </TinyButton>
    </template>
  </TinyModal>
</template>

<style lang="less" scoped></style>
