<script lang="ts" setup>
import type { Permission } from '@/api/permission'
import type { FilterType, InputFilterValue, IPaginationMeta, Pager } from '@/types/global'
import {
  Modal,
  Button as TinyButton,
  Col as TinyCol,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Input as TinyInput,
  Modal as TinyModal,
  Pager as TinyPager,
  TinyPopconfirm,
  Row as TinyRow,
} from '@opentiny/vue'
import { iconDel } from '@opentiny/vue-icon'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { createPermission, deletePermission, getAllPermission, updatePermission } from '@/api/permission'
import { useResponsive, useResponsiveSize } from '@/hooks/responsive'
import { sleep } from '@/utils/base-utils'

const roleGrid = ref()
const addForm = ref()

const { t } = useI18n()

const { gridSize, modalSize } = useResponsiveSize()
const { sm } = useResponsive()

const IconDel = iconDel()

// 加载效果
const state = reactive<{
  tableData: any
  permissionAddData: {
    name: string
    desc: string
  }
  isPermissionAdd: boolean
}>({
  tableData: {} as any,
  permissionAddData: {},
  isPermissionAdd: false,
})

// 校验规则
const rulesType = {
  required: true,
  trigger: 'blur',
}
const rules = computed(() => {
  return {
    name: [rulesType],
  }
})

const filter = {
  inputFilter: true,
}

const pagerConfigSm = {
  component: TinyPager,
  attrs: { currentPage: 1, pageSize: 10, pageSizes: [10, 20, 50, 100], total: 10, layout: 'total, prev, pager, next' },
}
const pagerConfigLg = {
  component: TinyPager,
  attrs: { currentPage: 1, pageSize: 10, pageSizes: [10, 20, 50, 100], total: 10, layout: 'sizes, total, prev, pager, next, jumper' },
}

const fetchOption = {
  api: ({ page, filters }: { page: Pager, filters: FilterType }) => {
    const { name } = filters
    let exp = ''
    if (name) {
      const value = name.value as InputFilterValue
      if (value.relation === 'contains') {
        exp += '%'
      }
      exp += value.text
      if (value.relation === 'startwith' || value.relation === 'contains') {
        exp += '%'
      }
    }
    return fetchData(page.currentPage, page.pageSize, exp).then(
      ({ items, meta }) => {
        return {
          result: items,
          page: {
            total: meta.totalItems,
          },
        }
      },
    )
  },
  filiter: true,
}

// 请求数据接口方法
async function fetchData(page: number, size: number, name?: string) {
  const { data } = await getAllPermission(page, size, name)
  const { items, meta } = data as {
    items: Permission[]
    meta: IPaginationMeta
  }
  return { items, meta }
}

async function handleDelete(permission: Permission) {
  try {
    await deletePermission(permission.id)
    TinyModal.message({
      message: '已删除',
      status: 'success',
    })
    roleGrid.value.handleFetch()
  }
  catch (error) {
    if (error.response && error.response.data) {
      const errorMessage = error.response.data.message || '未知错误'
      Modal.message({
        message: errorMessage,
        status: 'error',
      })
    }
  }
}

async function handlePermissionUpdateSubmit(args: any) {
  const data = args.row
  const newTemp = {
    id: data.id,
    name: data.name,
    desc: data.desc,
  }
  try {
    await updatePermission(newTemp)
    Modal.message({
      message: t('permissionInfo.edit.success'),
      status: 'success',
    })
    roleGrid.value.handleFetch()
  }
  catch (error) {
    if (error.response && error.response.data) {
      const errorMessage = error.response.data.message || '未知错误'
      Modal.message({
        message: errorMessage,
        status: 'error',
      })
    }
  }
}

function handleAddPermission() {
  state.isPermissionAdd = true
}

async function handlePermissionAddSubmit() {
  addForm.value
    .validate()
    .then(async () => {
      const data = state.permissionAddData
      const newTemp = {
        name: data.name,
        desc: data.desc,
      }
      try {
        await createPermission(newTemp)
        Modal.message({
          message: t('permissionInfo.add.success'),
          status: 'success',
        })
        state.isPermissionAdd = false
        state.permissionAddData = {}
        roleGrid.value.handleFetch()
      }
      catch (error) {
        if (error.response && error.response.data) {
          const errorMessage = error.response.data.message || '未知错误'
          Modal.message({
            message: errorMessage,
            status: 'error',
          })
        }
      }
    })
    .catch(() => { })
}

async function handlePermissionAddCancel() {
  state.isPermissionAdd = false
  state.permissionAddData = {}
}

const toolAbortController = new AbortController()

onMounted(async () => {
  document.modelContext.registerTool({
    name: 'add-permission',
    title: '添加权限',
    description: '添加权限',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: '权限名称' },
        desc: { type: 'string', description: '权限描述' },
      },
      required: ['name', 'desc'],
    },
    execute: async ({ name, desc }) => {
      handleAddPermission()
      await sleep(1000)
      state.permissionAddData.name = name
      state.permissionAddData.desc = desc
      await sleep(1000)
      await handlePermissionAddSubmit()
      return { content: [{ type: 'text', text: `收到: ${name}` }] }
    },
  }, { signal: toolAbortController.signal })
})

onUnmounted(() => {
  toolAbortController.abort()
})
</script>

<template>
  <div>
    <div class="tiny-fullscreen-scroll">
      <div class="tiny-fullscreen-wrapper">
        <div class="permission-add-btn">
          <TinyButton v-permission="'permission::add'" type="primary" round @click="handleAddPermission">
            {{ $t('permissionInfo.modal.title.add') }}
          </TinyButton>
        </div>
        <div class="table">
          <TinyGrid
            :key="sm ? 'sm' : 'lg'"
            ref="roleGrid"
            :auto-resize="true"
            :fetch-data="fetchOption"
            :pager="sm ? pagerConfigSm : pagerConfigLg"
            :edit-config="{ trigger: 'click', mode: 'cell', showStatus: true }"
            remote-filter
            :size="gridSize"
            align="center"
            @edit-closed="handlePermissionUpdateSubmit"
          >
            <TinyGridColumn field="id" :title="$t('permissionInfo.table.id')" width="10%">
              <template #default="data">
                <span>{{ data.row.id }}</span>
              </template>
            </TinyGridColumn>
            <TinyGridColumn
              field="name"
              :title="$t('permissionInfo.table.name')"
              :filter="filter"
              :editor="{ component: 'input', autoselect: true }"
            >
              <template #default="data">
                <span>{{ data.row.name }}</span>
              </template>
            </TinyGridColumn>
            <TinyGridColumn
              field="desc"
              :title="$t('permissionInfo.table.desc')"
              :editor="{ component: 'input', autoselect: true }"
            >
              <template #default="data">
                <span>{{ data.row.desc }}</span>
              </template>
            </TinyGridColumn>
            <TinyGridColumn :title="$t('permissionInfo.table.operations')">
              <template #default="data">
                <TinyPopconfirm
                  :title="$t('menuInfo.modal.title.confirm')"
                  type="warning"
                  trigger="click"
                  @confirm="handleDelete(data.row)"
                >
                  <template #reference>
                    <IconDel class="del-icon" />
                    <a v-permission="'permission::remove'" class="operation-update">
                      {{ $t('permissionInfo.table.operations.delete') }}
                    </a>
                  </template>
                </TinyPopconfirm>
              </template>
            </TinyGridColumn>
          </TinyGrid>
        </div>
      </div>
    </div>

    <div v-if="state.isPermissionAdd">
      <TinyModal
        v-model="state.isPermissionAdd"
        :lock-scroll="true"
        show-header
        show-footer
        :width="modalSize"
        height="auto"
        :title="$t('permissionInfo.modal.title.add')"
      >
        <template #default>
          <TinyForm ref="addForm" :model="state.permissionAddData" :rules="rules" label-width="90px">
            <TinyRow class="flex flex-wrap">
              <TinyCol class="w-1/2 max-sm:w-full">
                <TinyFormItem :label="$t('permissionInfo.modal.input.name')" prop="name">
                  <TinyInput v-model="state.permissionAddData.name" />
                </TinyFormItem>
              </TinyCol>
              <TinyCol class="w-1/2 max-sm:w-full">
                <TinyFormItem :label="$t('permissionInfo.modal.input.permission')">
                  <TinyInput v-model="state.permissionAddData.desc" />
                </TinyFormItem>
              </TinyCol>
            </TinyRow>
          </TinyForm>
        </template>
        <template #footer>
          <TinyButton round @click="handlePermissionAddCancel">
            {{ $t('menu.btn.cancel') }}
          </TinyButton>
          <TinyButton round type="primary" @click="handlePermissionAddSubmit">
            {{ $t('menu.btn.confirm') }}
          </TinyButton>
        </template>
      </TinyModal>
    </div>
  </div>
</template>

<style scoped lang="less">
#contain {
  height: 100%;
  padding: 15px;
  overflow: hidden;
}

.permission-add-btn {
  padding: 0 0 24px 0;
}

.table {
  padding-bottom: 20px;
  background-color: #fff;
}

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
