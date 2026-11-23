<script lang="ts" setup>
import type { ITreeNodeData } from '@/router/guard/menu'
import { TinyGrid, TinyGridColumn, TinyPopconfirm } from '@opentiny/vue'
import { iconDel, iconEdit } from '@opentiny/vue-icon'
import { ref, watch } from 'vue'
import { useResponsiveSize } from '@/hooks/responsive'

const props = defineProps<{
  data: ITreeNodeData[]
  localeData: { value: string, label: string }[]
}>()

const emits = defineEmits<{
  check: [Node]
  update: [Node]
  delete: [Node]
}>()

const { gridSize } = useResponsiveSize()

const IconDel = iconDel()
const IconEdit = iconEdit()

export interface Node {
  data: ITreeNodeData
  children: Node[]
}
const menuList = ref([])
function confirm(row) {
  emits('delete', row)
}
watch(
  () => props.data.length,
  () => {
    menuList.value = props.data
  },
  { immediate: true },
)
</script>

<template>
  <TinyGrid
    :data="menuList"
    :tree-config="{ children: 'children' }"
    :auto-resize="true"
    align="center"
    :size="gridSize"
  >
    <TinyGridColumn
      field="locale"
      :title="$t('menuInfo.table.name')"
      tree-node
    >
      <template #default="{ row, skip }">
        <span v-if="!skip">{{ $t(row.locale) }}</span>
      </template>
    </TinyGridColumn>
    <TinyGridColumn field="id" title="ID" />
    <TinyGridColumn
      field="parentId"
      :title="$t('menuInfo.table.parentId')"
    />
    <TinyGridColumn field="order" :title="$t('menuInfo.table.order')" />
    <TinyGridColumn field="customIcon" :title="$t('menuInfo.table.icon')">
      <template #default="{ row, skip }">
        <span v-if="!skip">{{ row.customIcon }}</span>
      </template>
    </TinyGridColumn>
    <TinyGridColumn field="component" :title="$t('menuInfo.table.component')" />
    <TinyGridColumn field="url" :title="$t('menuInfo.table.path')" />
    <TinyGridColumn field="locale" :title="$t('menuInfo.table.locale')" />
    <TinyGridColumn :title="$t('permissionInfo.table.operations')" width="200">
      <template #default="{ row, skip }">
        <template v-if="!skip">
          <IconEdit class="del-icon" />
          <a
            v-permission="'menu::update'"
            class="operation-update"
            @click="emits('update', row)"
          >
            {{ $t('menuInfo.table.operations.update') }}
          </a>
          <TinyPopconfirm :title="$t('menuInfo.modal.title.confirm')" type="warning" trigger="click" @confirm="confirm(row)">
            <template #reference>
              <IconDel class="del-icon" />
              <a
                v-permission="'menu::remove'"
                class="operation-update"
              >
                {{ $t('menuInfo.table.operations.delete') }}
              </a>
            </template>
          </TinyPopconfirm>
        </template>
      </template>
    </TinyGridColumn>
  </TinyGrid>
</template>

<style scoped lang="less">
  .operation {
  &-delete {
    padding-right: 10px;
    color: red;
  }

  &-update {
    padding-right: 5px;
    color: #1890ff;
  }

  &-info {
    padding-right: 10px;
    color: orange;
  }
}
.del-icon {
  fill: #1890ff;
  margin-right: 8px;
  font-size: 16px;
  margin-top: -3px;
}

.operation-update:hover {
  text-decoration: underline;
}
</style>
