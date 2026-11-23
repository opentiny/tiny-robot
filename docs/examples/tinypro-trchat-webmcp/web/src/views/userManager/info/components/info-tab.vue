<script lang="ts" setup>
import type { FilterType } from '@/types/global'
import {
  Loading,
  Button as TinyButton,
  Col as TinyCol,
  DatePicker as TinyDatePicker,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Input as TinyInput,
  Layout as TinyLayout,
  Modal as TinyModal,
  Pager as TinyPager,
  Popconfirm as TinyPopconfirm,
  Row as TinyRow,
  Select as TinySelect,
} from '@opentiny/vue'
import { iconCommission, iconDel } from '@opentiny/vue-icon'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAllRole } from '@/api/role'
import { batchDeleteUsers, deleteUser, getAllUser, updatePwdAdmin, updateUserInfo } from '@/api/user'
import { useResponsive, useResponsiveSize } from '@/hooks/responsive'
import { useUserStore } from '@/store'
import { sleep } from '@/utils/base-utils'
import { isUndefined } from '@/utils/is'
import UserDetail from '../../user-detail/index.vue'
import UserAdd from '../../useradd/index.vue'

const { gridSize, modalSize } = useResponsiveSize()
const { sm } = useResponsive()

const IconCommission = iconCommission()
const IconDel = iconDel()
const { t } = useI18n()
const grid = ref()
const addUserFormRef = ref()
const state = reactive<{
  loading: any
  tableData: any
  pageData: any
  isPwdUpdate: boolean
  isUserAdd: boolean
  pwdData: any
  email: string
  roleData: any
}>({
  loading: null,
  tableData: [] as any,
  pageData: [] as any,
  isPwdUpdate: false,
  isUserAdd: false,
  pwdData: {} as any,
  email: '',
  roleData: [] as any,
})

const statusData = [
  {
    value: 1,
    label: t('userInfo.table.activeStatus'),
  },
  {
    value: 2,
    label: t('userInfo.table.disabledStatus'),
  },
  {
    value: 3,
    label: t('searchTable.form.status.doing'),
  },
]

const statusMap = {
  1: t('userInfo.table.activeStatus'),
  2: t('userInfo.table.disabledStatus'),
  3: t('searchTable.form.status.doing'),
}

const projectData = [
  {
    value: '1',
    label: t('userInfo.table.socialRecruitment'),
  },
  {
    value: '2',
    label: t('userInfo.table.schoolRecruitment'),
  },
  {
    value: '3',
    label: t('userInfo.table.jobTransfer'),
  },
]

// 变量设置
const userStore = useUserStore()

async function fetchRole() {
  const { data } = await getAllRole()
  state.roleData = data
}

const inputFilter = {
  inputFilter: true,
}

const jobFilter = ref({
  multi: true,
  enumable: true,
  values: (await getAllRole()).data.map((item) => {
    return {
      label: item.name,
      value: item.id,
    }
  }),
})

const pagerConfigSm = {
  component: TinyPager,
  attrs: { currentPage: 1, pageSize: 10, pageSizes: [10, 20, 50, 100], total: 10, layout: 'total, prev, pager, next' },
}
const pagerConfigLg = {
  component: TinyPager,
  attrs: { currentPage: 1, pageSize: 10, pageSizes: [10, 20, 50, 100], total: 10, layout: 'sizes, total, prev, pager, next, jumper' },
}

// 校验规则
const rulesType = {
  required: true,
  trigger: 'blur',
}
const rules = computed(() => {
  return {
    newPassword: [rulesType],
    confirmNewPassword: [rulesType],
  }
})

// 请求数据接口方法
async function fetchData(params: { pageIndex: 1, pageSize: 10 }, filters: FilterType) {
  userStore.setInfo({ reset: false, submit: false })
  state.loading = Loading.service({
    text: 'loading...',
    target: document.getElementById('contain'),
  })
  try {
    const { data } = await getAllUser(
      params.pageIndex,
      params.pageSize,
      Array.isArray(filters)
        ? filters
        : {
            ...filters,
            role: filters.roleIds,
          },
    )
    const total = data.meta.totalItems
    return {
      result: data.items,
      page: { total },
    }
  }
  finally {
    state.loading.close()
  }
}

const fetchDataOption = reactive({
  api: ({ page, filters }: any) => {
    const { currentPage, pageSize } = page
    return fetchData(
      {
        pageIndex: currentPage,
        pageSize,
      },
      filters,
    )
  },
  filter: true,
})

async function onAddConfirm() {
  grid.value.handleFetch().then(() => {
    state.isUserAdd = false
  })
}

async function handleDelete(email: string) {
  deleteUser(email)
    .then(() => {
      TinyModal.message({
        message: '已删除',
        status: 'success',
      })
      grid.value.handleFetch()
    })
    .catch((error) => {
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || '未知错误'
        TinyModal.message({
          message: errorMessage,
          status: 'error',
        })
      }
    })
}

function handlePwdUpdate(email: string) {
  state.isPwdUpdate = true
  state.pwdData.email = email
}

function handlePwdUpdateCancel() {
  state.isPwdUpdate = false
  state.pwdData = {} as any
}

function handleAddUser() {
  state.isUserAdd = true
}

function handleBatchDeleteUser() {
  const rowEmails = grid.value.getAllSelection().flatMap(row => row.email)
  if (rowEmails.length === 0) {
    TinyModal.message({
      message: '请选择要删除的用户',
      status: 'error',
    })
    return
  }
  TinyModal.confirm({
    title: '删除确认',
    message: '确定要批量删除选中的用户吗？',
    onConfirm: () => {
      batchDeleteUsers(rowEmails)
        .then(() => {
          TinyModal.message({
            message: '批量删除成功',
            status: 'success',
          })
          // 可以根据需求更新数据
          grid.value.handleFetch()
        })
        .catch((error) => {
          if (error.response && error.response.data) {
            const errorMessage = error.response.data.message || '未知错误'
            TinyModal.message({
              message: errorMessage,
              status: 'error',
            })
          }
        })
    },
  })
}

async function handlePwdUpdateSubmit() {
  const data = state.pwdData
  const newTemp = {
    email: data.email,
    newPassword: data.newPassword,
    confirmNewPassword: data.confirmNewPassword,
  }
  if (newTemp.newPassword !== newTemp.confirmNewPassword) {
    TinyModal.message({
      message: t('userInfo.modal.message.error'),
      status: 'error',
    })
  }
  else {
    try {
      await updatePwdAdmin(newTemp)
      TinyModal.message({
        message: t('baseForm.form.submit.success'),
        status: 'success',
      })
      state.pwdData = {} as any
      state.isPwdUpdate = false
    }
    catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || '未知错误'
        TinyModal.message({
          message: errorMessage,
          status: 'error',
        })
      }
    }
  }
}
function handleSelectChange(table: any, value) {
  handleUpdate(table, { target: { value } })
}
function handleKeyup(table: any, event: KeyboardEvent) {
  if (event.key === 'Enter') {
    handleUpdate(table, event)
  }
}

function handleDatePickerBlur(table, vm) {
  handleUpdate(table, { target: { value: vm.modelValue } })
}

// 处理提交
async function handleUpdate({ row, column }, { target: { value } }) {
  const { property } = column
  if (value) {
    const data = row
    const newTemp = {
      email: data.email,
      name: data.name,
      address: data.address,
      department: data.department,
      roleIds: isUndefined(data.role[0]?.id) ? [] : [data.role[0]?.id],
      employeeType: data.employeeType,
      probationDuration: data.probationDuration,
      probationStart: data.probationStart,
      probationEnd: data.probationEnd,
      protocolStart: data.protocolStart,
      protocolEnd: data.protocolEnd,
      status: data.status,
    }
    if (property === 'roleIds') {
      const roleIds = [value ?? newTemp.roleIds[0]]
      newTemp.roleIds = roleIds
    }
    else if (property !== 'status') {
      newTemp[property] = value
    }

    try {
      await updateUserInfo(newTemp)
      TinyModal.message({
        message: t('baseForm.form.submit.success'),
        status: 'success',
      })

      grid.value.handleFetch()
    }
    catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || '未知错误'
        TinyModal.message({
          message: errorMessage,
          status: 'error',
        })
      }
    }
  }
}

// 请求职位类型
fetchRole()

const toolAbortController = new AbortController()

onMounted(async () => {
  document.modelContext.registerTool({
    name: 'add-user',
    title: '添加用户',
    description: '添加用户，可选参数不需要用户提供，也不用创建表单卡片，直接根据用户提供的信息添加用户即可',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: '邮箱' },
        password: { type: 'string', description: '密码' },
        name: { type: 'string', description: '用户名' },
        address: { type: 'string', description: '地址' },
        department: { type: 'string', description: '所属部门' },
        roleIds: {
          type: 'array',
          items: { type: 'number' },
          description: '职位',
        },
        employeeType: { type: 'string', description: '招聘类型' },
        probationDate: {
          type: 'array',
          items: { type: 'string', format: 'date-time' },
          description: '试用期起止时间',
        },
        probationDuration: { type: 'string', description: '试用期时长' },
        protocolStart: { type: 'string', format: 'date-time', description: '劳动合同开始日期' },
        protocolEnd: { type: 'string', format: 'date-time', description: '劳动合同结束日期' },
        status: { type: 'string', description: '状态' },
      },
      required: ['email', 'password', 'name'],
    },
    execute: async ({ email, password, name, address, department, roleIds, employeeType, probationDate, probationDuration, protocolStart, protocolEnd, status }) => {
      handleAddUser()
      await sleep(1000)
      await addUserFormRef.value.setUserInfo({ email, password, name, address, department, roleIds, employeeType, probationDate, probationDuration, protocolStart, protocolEnd, status })
      await sleep(1000)
      await addUserFormRef.value.handleSubmit()
      return { content: [{ type: 'text', text: `收到: ${email}` }] }
    },
  }, { signal: toolAbortController.signal })
})

onUnmounted(() => toolAbortController.abort())
</script>

<template>
  <div class="tiny-fullscreen-scroll">
    <div class="tiny-fullscreen-wrapper">
      <div class="user-header-btn">
        <TinyButton
          v-permission="'user::add'"
          type="primary"
          round
          @click="handleAddUser"
        >
          {{ $t('userInfo.modal.title.add') }}
        </TinyButton>
        <TinyButton
          v-permission="'user::batch-remove'"
          round
          @click="handleBatchDeleteUser"
        >
          {{ $t('locale.batchRemove') }}
        </TinyButton>
      </div>
      <div class="table">
        <TinyGrid
          :key="sm ? 'sm' : 'lg'"
          ref="grid"
          :fetch-data="fetchDataOption"
          :pager="sm ? pagerConfigSm : pagerConfigLg"
          :auto-resize="true"
          remote-filter
          :edit-config="{ trigger: 'click', mode: 'cell', showStatus: true }"
          :size="gridSize"
          align="center"
        >
          <TinyGridColumn type="selection" width="30px" />
          <TinyGridColumn type="expand" width="10px">
            <template #default="{ row, skip }">
              <UserDetail
                v-if="!skip"
                :email="row.email"
                :status-map="statusMap"
                @confirm="(props, value) => row[props] = value"
              />
            </template>
          </TinyGridColumn>
          <TinyGridColumn
            field="id"
            :title="$t('userInfo.table.id')"
            show-overflow="tooltip"
          >
            <template #default="{ row, skip }">
              <span v-if="!skip">{{ row.id }}</span>
            </template>
          </TinyGridColumn>
          <TinyGridColumn
            field="name"
            :filter="inputFilter"
            :title="$t('userInfo.table.name')"
            show-overflow="tooltip"
            :editor="{
              component: 'input',
              autofocus: true,
              events: {
                blur: handleUpdate,
                keyup: handleKeyup,
              },
            }"
          >
            <template #default="{ row, skip }">
              <span v-if="!skip">{{ row.name }}</span>
            </template>
          </TinyGridColumn>
          <TinyGridColumn
            field="email"
            :filter="inputFilter"
            :title="$t('userInfo.table.email')"
            show-overflow="tooltip"
          >
            <template #default="{ row, skip }">
              <span v-if="!skip">{{ row.email }}</span>
            </template>
          </TinyGridColumn>
          <TinyGridColumn
            field="department"
            :title="$t('userInfo.table.department')"
            show-overflow="tooltip"
            :editor="{
              component: 'input',
              autofocus: true,
              events: {
                blur: handleUpdate,
                keyup: handleKeyup,
              },
            }"
          >
            <template #default="{ row, skip }">
              <span v-if="!skip && row.department !== null">{{
                row.department
              }}</span>
            </template>
          </TinyGridColumn>
          <TinyGridColumn
            field="employeeType"
            :title="$t('userInfo.table.employeeType')"
            show-overflow="tooltip"
            :editor="{
              component: TinySelect,
              attrs: {
                options: projectData,
                textField: 'label',
                valueField: 'label',
              },
              events: {
                keyup: handleKeyup,
                change: handleSelectChange,
              },
            }"
          >
            <template #default="{ row, skip }">
              <span v-if="!skip && row.employeeType !== null">{{
                row.employeeType
              }}</span>
            </template>
          </TinyGridColumn>
          <TinyGridColumn
            field="roleIds"
            :filter="jobFilter"
            :title="$t('userInfo.table.job')"
            show-overflow="tooltip"
            format-text="enum"
            :format-config="{
              data: state.roleData,
              label: 'name',
              value: 'id',
            }"
            :editor="{
              component: TinySelect,
              attrs: {
                options: state.roleData,
                textField: 'name',
                valueField: 'id',
              },
              events: {
                keyup: handleKeyup,
                change: handleSelectChange,
              },
            }"
          >
            <template #default="{ row, skip }">
              <span v-if="!skip && row.role?.[0]">{{ row.role[0]?.name }}</span>
            </template>
          </TinyGridColumn>
          <TinyGridColumn
            field="probationStart"
            :title="$t('userInfo.table.probationStart')"
            show-overflow="tooltip"
            :editor="{
              component: TinyDatePicker,
              attrs: {
                valueFormat: 'yyyy-MM-dd',
              },
              events: {
                blur: handleDatePickerBlur,
              },
            }"
          >
            <template #default="{ row, skip }">
              <span v-if="!skip && row.probationStart !== null">{{
                row.probationStart
              }}</span>
            </template>
          </TinyGridColumn>
          <TinyGridColumn
            field="probationEnd"
            :title="$t('userInfo.table.probationEnd')"
            show-overflow="tooltip"
            :editor="{
              component: TinyDatePicker,
              attrs: {
                valueFormat: 'yyyy-MM-dd',
              },
              events: {
                blur: handleDatePickerBlur,
              },
            }"
          >
            <template #default="{ row, skip }">
              <span v-if="!skip && row.probationEnd !== null">{{
                row.probationEnd
              }}</span>
            </template>
          </TinyGridColumn>
          <TinyGridColumn
            field="probationDuration"
            :title="$t('userInfo.table.probationDuration')"
            show-overflow="tooltip"
            :editor="{
              component: 'input',
              autofocus: true,
              events: {
                blur: handleUpdate,
                keyup: handleKeyup,
              },
            }"
          >
            <template #default="{ row, skip }">
              <span v-if="!skip && row.probationDuration !== null">{{ row.probationDuration
              }}{{ $t('userInfo.day') }}</span>
            </template>
          </TinyGridColumn>
          <TinyGridColumn
            field="address"
            :title="$t('userInfo.table.address')"
            show-overflow="tooltip"
            :editor="{
              component: 'input',
              autofocus: true,
              events: {
                blur: handleUpdate,
                keyup: handleKeyup,
              },
            }"
          >
            <template #default="{ row, skip }">
              <span v-if="!skip && row.address !== null">{{
                row.address
              }}</span>
            </template>
          </TinyGridColumn>
          <TinyGridColumn
            field="status"
            :title="$t('userInfo.table.status')"
            show-overflow="tooltip"
            :editor="{
              component: TinySelect,
              attrs: {
                options: statusData,
                textField: 'label',
                valueField: 'value',
              },
              events: {
                keyup: handleKeyup,
                change: handleSelectChange,
              },
            }"
          >
            <template #default="{ row, skip }">
              <div v-if="!skip" class="tiny-col-status">
                <img
                  v-if="row.status === 1"
                  src="@/assets/images/success.png"
                  alt="success"
                >
                <img
                  v-else-if="row.status === 2"
                  src="@/assets/images/error.png"
                  alt="error"
                >
                <img
                  v-else-if="row.status === 3"
                  src="@/assets/images/tip2.png"
                  alt="tip"
                >
                <span>{{ statusMap[row.status] }}</span>
              </div>
            </template>
          </TinyGridColumn>
          <TinyGridColumn
            :title="$t('userInfo.table.operations')"
            show-overflow="tooltip"
          >
            <template #default="{ row, skip }">
              <template v-if="!skip">
                <a
                  v-permission="'user::password::force-update'"
                  class="operation-pwd-update"
                  @click="handlePwdUpdate(row.email)"
                >
                  <IconCommission class="operation-icon" />
                  {{ $t('userInfo.table.operations.pwdUpdate') }}
                </a>
                <TinyPopconfirm
                  title="确定要删除此用户吗？"
                  type="info"
                  trigger="click"
                  @confirm="handleDelete(row.email)"
                >
                  <template #reference>
                    <a
                      v-permission="'user::remove'"
                      class="operation-delete"
                    >
                      <IconDel class="operation-icon" />
                      {{ $t('userInfo.table.operations.delete') }}
                    </a>
                  </template>
                </TinyPopconfirm>
              </template>
            </template>
          </TinyGridColumn>
        </TinyGrid>
      </div>
    </div>
  </div>
  <div v-if="state.isUserAdd">
    <TinyModal
      v-model="state.isUserAdd"
      height="auto"
      :width="modalSize"
      :title="$t('userInfo.modal.title.add')"
    >
      <UserAdd
        ref="addUserFormRef"
        :status-data="statusData"
        :project-data="projectData"
        @confirm="onAddConfirm"
      />
    </TinyModal>
  </div>
  <div v-if="state.isPwdUpdate">
    <TinyModal
      v-model="state.isPwdUpdate"
      :lock-scroll="true"
      show-header
      show-footer
      :mask-closable="true"
      height="auto"
      :width="modalSize"
      :title="$t('userInfo.modal.title.pwdUpdate')"
    >
      <template #default>
        <TinyLayout>
          <TinyForm
            :model="state.pwdData"
            :rules="rules"
            :label-align="true"
            label-position="left"
          >
            <TinyRow flex justify="left">
              <TinyCol class="w-full" label-width="100px">
                <TinyFormItem :label="$t('userInfo.table.email')">
                  <label>{{ state.pwdData.email }}</label>
                </TinyFormItem>
              </TinyCol>
            </TinyRow>
            <TinyRow flex justify="left">
              <TinyCol class="w-full" label-width="100px">
                <TinyFormItem
                  :label="$t('userInfo.modal.input.newPassword')"
                  prop="newPassword"
                >
                  <TinyInput
                    v-model="state.pwdData.newPassword"
                    type="password"
                    show-password
                  />
                </TinyFormItem>
              </TinyCol>
            </TinyRow>

            <TinyRow flex justify="left">
              <TinyCol class="w-full" label-width="100px">
                <TinyFormItem
                  :label="$t('userInfo.modal.input.confirmNewPassword')"
                  prop="confirmNewPassword"
                >
                  <TinyInput
                    v-model="state.pwdData.confirmNewPassword"
                    type="password"
                    show-password
                  />
                </TinyFormItem>
              </TinyCol>
            </TinyRow>
          </TinyForm>
        </TinyLayout>
      </template>
      <template #footer>
        <TinyButton type="primary" @click="handlePwdUpdateSubmit">
          {{ $t('menu.btn.confirm') }}
        </TinyButton>
        <TinyButton @click="handlePwdUpdateCancel">
          {{ $t('menu.btn.cancel') }}
        </TinyButton>
      </template>
    </TinyModal>
  </div>
</template>

<style scoped lang="less">
  .user-header-btn {
  margin: 0px 0px 16px;

  .tiny-button {
    width: 96px;
    margin: 0 8px 0 0;
  }
}

#contain {
  height: 100%;
  padding: 15px;
  overflow: hidden;
}

.table {
  padding-bottom: 20px;
  background-color: #fff;
}

.operation {
  &-pwd-update {
    padding-right: 16px;
    color: #1890ff;
  }

  &-delete {
    color: #1890ff;
  }

  &-icon {
    margin-right: 3px;
    font-size: 16px;
    fill: currentColor;
  }
}

.tiny-col-status {
  display: flex;
  align-items: center;
  font-size: 14px;
  line-height: 22px;

  img {
    width: 14px;
    height: 14px;
    margin-right: 9px;
  }
}
</style>
