<script lang="ts" setup>
import type { Permission } from '@/api/permission'
import type { ITreeNodeData } from '@/router/guard/menu'
import type { Role } from '@/store/modules/user/types'
import type { Pager } from '@/types/global'
import {
  Modal,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  TinyPopconfirm,
  TinySelect,
} from '@opentiny/vue'
import { iconCueL, iconDel } from '@opentiny/vue-icon'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { deleteRole, updateRole } from '@/api/role'
import useLoading from '@/hooks/loading'
import { useResponsiveSize } from '@/hooks/responsive'
import permissionTable from './permission-table.vue'

const props = defineProps<{
  tableData: (Role & { menus: ITreeNodeData[] })[]
  fetchOption: {
    api: (args: { page: Pager }) => any
  }
  permissions: Permission[]
  pagerConfig: {
    attrs: Pager
  }
  filter: any
}>()

const emits = defineEmits<{
  menuUpdate: [ITreeNodeData[], number, Role]
  roleDelete: [number]
  updateRoleClose: []
}>()

const IconCueL = iconCueL()
const IconDel = iconDel()

const { gridSize } = useResponsiveSize()

const { t } = useI18n()
const grid = ref()
const { loading, setLoading } = useLoading()

function onMenuUpdate(data: ITreeNodeData[], roldId: number, role: Role) {
  emits('menuUpdate', data, roldId, role)
}

function onRoleDelete(id: number, row) {
  setLoading(true)
  deleteRole(id)
    .then(() => {
      grid.value.remove(row)
    })
    .then(() => {
      Modal.message({
        message: t('message.delete.success'),
        status: 'success',
      })
      emits('roleDelete', id)
    })
    .catch((error) => {
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || '未知错误'
        Modal.message({
          message: errorMessage,
          status: 'error',
        })
      }
    })
    .finally(() => {
      setLoading(false)
    })
}
function getPermission(row: any) {
  let permissionDate = ''
  if (row?.permission?.length) {
    row.permission.forEach((item, index) => {
      permissionDate = `${permissionDate} ${row.permission[index].name}`
    })
  }
  return permissionDate
}
function onUpdate(args: any) {
  const menuIds = args.row.menus.map(menu => menu.id)
  updateRole({
    ...args.row,
    menuIds,
  })
    .then(() => {
      Modal.message({
        message: t('permissionInfo.edit.success'),
        status: 'success',
      })
      emits('updateRoleClose')
    })
    .catch((error) => {
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || '未知错误'
        Modal.message({
          message: errorMessage,
          status: 'error',
        })
      }
    })
    .finally(() => {
      emits('updateRoleClose')
    })
}
defineExpose({
  reload: () => {
    grid.value.handleFetch()
  },
  openMenuModal: onMenuUpdate,
})
</script>

<template>
  <TinyGrid
    ref="grid"
    :fetch-data="props.fetchOption"
    auto-resize
    :loading="loading"
    :pager="props.pagerConfig"
    :edit-config="{ trigger: 'click', mode: 'cell', showStatus: true }"
    remote-filter
    :size="gridSize"
    align="center"
    @edit-closed="onUpdate"
  >
    <TinyGridColumn type="expand" width="5%">
      <template #default="{ row, skip }">
        <permission-table v-if="!skip" :permission="row.permission" />
      </template>
    </TinyGridColumn>
    <TinyGridColumn field="id" width="20%" :title="$t('roleInfo.table.id')" />
    <TinyGridColumn
      field="name"
      :title="$t('roleInfo.table.name')"
      :filter="props.filter.inputFilter"
      :editor="{ component: 'input', autoselect: true }"
    />
    <TinyGridColumn
      field="permissionIds"
      :title="$t('roleInfo.table.desc')"
      show-overflow="tooltip"
      :editor="{
        component: TinySelect,
        attrs: {
          'multiple': true,
          'collapse-tags': true,
          'value-key': 'id',
          'options': props.permissions,
          'textField': 'name',
          'valueField': 'id',
        },
      }"
    >
      <template #default="{ row, skip }">
        <span v-if="!skip">{{ getPermission(row) }}</span>
      </template>
    </TinyGridColumn>
    <TinyGridColumn :title="$t('roleInfo.table.operations')">
      <template #default="{ row, skip }">
        <template v-if="!skip">
          <IconCueL class="del-icon" />
          <a
            v-permission="'role::update'"
            class="operation-update"
            @click="onMenuUpdate(row.menus, row.id, row)"
          >
            {{ $t('roleInfo.table.bind') }}
          </a>
          <TinyPopconfirm
            :title="$t('menuInfo.modal.title.confirm')"
            type="warning"
            trigger="click"
            @confirm="onRoleDelete(row.id, row)"
          >
            <template #reference>
              <IconDel class="del-icon" />

              <a v-permission="'role::remove'" class="operation-update">
                {{ $t('roleInfo.table.operations.delete') }}
              </a>
            </template>
          </TinyPopconfirm>
        </template>
      </template>
    </TinyGridColumn>
  </TinyGrid>
</template>

<style lang="less" scoped>
.operation {
  &-delete {
    padding-right: 5px;
    color: red;
  }

  &-update {
    padding-right: 5px;
    color: #1890ff;
  }

  &-pwd-update {
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
