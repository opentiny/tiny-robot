<script lang="ts" setup>
import type { UpdateEmployeeInfo } from '@/api/list'
import {
  Modal,
  Button as TinyButton,
  Col as TinyCol,
  DatePicker as TinyDatePicker,
  DialogBox as TinyDialogBox,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Input as TinyInput,
  Row as TinyRow,
  Select as TinySelect,
} from '@opentiny/vue'
import { t } from '@opentiny/vue-locale'
import { reactive, ref, watch } from 'vue'
import { getEmployeeInfo, updateEmployeeInfo } from '@/api/list'

interface CompProps {
  employeeId?: string
  onRefresh?: () => void
}

const { employeeId, onRefresh } = defineProps<CompProps>()
const visible = defineModel<boolean>({ default: false })

const formModel = reactive<UpdateEmployeeInfo>({
  id: '',
  name: '',
  employeeNo: '',
  departmentLevel: '',
  department: '',
  status: '',
  workbenchName: '',
  project: '',
  type: '',
  address: '',
  roles: '',
  createTime: '',
  lastUpdateUser: '',
})

const departmentLevelOptions = reactive([
  { label: '一级', value: '一级' },
  { label: '二级', value: '二级' },
  { label: '三级', value: '三级' },
  { label: '四级', value: '四级' },
])

const departmentOptions = reactive([
  { label: '公共服务', value: '公共服务' },
  { label: '技术部', value: '技术部' },
  { label: '产品部', value: '产品部' },
  { label: '设计部', value: '设计部' },
  { label: '测试部', value: '测试部' },
  { label: '运营部', value: '运营部' },
])

const statusOptions = reactive([
  {
    value: '0',
    label: t('searchTable.form.status.offline'),
  },
  {
    value: '1',
    label: t('searchTable.form.status.online'),
  },
  {
    value: '2',
    label: t('searchTable.form.status.doing'),
  },
])

const rolesOptions = reactive([
  { label: '前端', value: '前端' },
  { label: '后端', value: '后端' },
  { label: '全栈', value: '全栈' },
  { label: '测试', value: '测试' },
  { label: '产品', value: '产品' },
  { label: '设计', value: '设计' },
])

const lastUpdateUserOptions = reactive([
  { label: '张三', value: '张三' },
  { label: '李四', value: '李四' },
  { label: '王五', value: '王五' },
  { label: '赵六', value: '赵六' },
  { label: '钱七', value: '钱七' },
  { label: '孙八', value: '孙八' },
])

const localeForm = ref()

function handleUpdateSubmit() {
  localeForm.value.validate().then(() => {
    updateEmployeeInfo(formModel).then(() => {
      Modal.message({
        message: '更新成功',
        status: 'success',
      })
      onRefresh?.()
      visible.value = false
    }).catch(() => {
      Modal.message({
        message: '更新失败',
        status: 'error',
      })
    })
  })
}

async function fetchEmployeeInfo(id: string) {
  const res = await getEmployeeInfo(id)
  const info = res?.data && typeof res.data === 'object' ? res.data : res
  Object.keys(formModel).forEach((key) => {
    formModel[key] = info?.[key] || ''
  })
}

watch(
  visible,
  (newVal) => {
    if (newVal && employeeId) {
      fetchEmployeeInfo(employeeId)
    }
  },
)

function handleClose() {
  visible.value = false
}
</script>

<template>
  <TinyDialogBox
    v-model:visible="visible" :title="t('userInfo.table.updateTable')" width="700px"
    :close-on-click-modal="false"
  >
    <TinyForm ref="localeForm" :model="formModel" label-position="left" label-width="94px">
      <TinyRow>
        <TinyCol :span="6">
          <TinyFormItem :label="$t('searchTable.columns.name')" prop="name">
            <TinyInput v-model="formModel.name" />
          </TinyFormItem>
        </TinyCol>
        <TinyCol :span="6">
          <TinyFormItem :label="$t('searchTable.columns.employeeNo')" prop="employeeNo">
            <TinyInput v-model="formModel.employeeNo" />
          </TinyFormItem>
        </TinyCol>
      </TinyRow>
      <TinyRow>
        <TinyCol :span="6">
          <TinyFormItem :label="$t('searchTable.columns.departmentLevel')" prop="departmentLevel">
            <TinySelect v-model="formModel.departmentLevel" :options="departmentLevelOptions" />
          </TinyFormItem>
        </TinyCol>
        <TinyCol :span="6">
          <TinyFormItem :label="$t('searchTable.columns.department')" prop="department">
            <TinySelect v-model="formModel.department" :options="departmentOptions" />
          </TinyFormItem>
        </TinyCol>
      </TinyRow>
      <TinyRow>
        <TinyCol :span="6">
          <TinyFormItem :label="$t('searchTable.columns.status')" prop="status">
            <TinySelect v-model="formModel.status" :options="statusOptions" />
          </TinyFormItem>
        </TinyCol>
        <TinyCol :span="6">
          <TinyFormItem :label="$t('searchTable.columns.workbenchName')" prop="workbenchName">
            <TinyInput v-model="formModel.workbenchName" />
          </TinyFormItem>
        </TinyCol>
      </TinyRow>
      <TinyRow>
        <TinyCol :span="6">
          <TinyFormItem :label="$t('searchTable.columns.project')" prop="project">
            <TinyInput v-model="formModel.project" />
          </TinyFormItem>
        </TinyCol>
        <TinyCol :span="6">
          <TinyFormItem :label="$t('searchTable.columns.type')" prop="type">
            <TinyInput v-model="formModel.type" />
          </TinyFormItem>
        </TinyCol>
      </TinyRow>
      <TinyRow>
        <TinyCol :span="6">
          <TinyFormItem :label="$t('searchTable.columns.address')" prop="address">
            <TinyInput v-model="formModel.address" />
          </TinyFormItem>
        </TinyCol>
        <TinyCol :span="6">
          <TinyFormItem :label="$t('searchTable.columns.roles')" prop="roles">
            <TinySelect v-model="formModel.roles" :options="rolesOptions" />
          </TinyFormItem>
        </TinyCol>
      </TinyRow>
      <TinyRow>
        <TinyCol :span="6">
          <TinyFormItem :label="$t('searchTable.columns.lastUpdateUser')" prop="lastUpdateUser">
            <TinySelect v-model="formModel.lastUpdateUser" :options="lastUpdateUserOptions" />
          </TinyFormItem>
        </TinyCol>
        <TinyCol :span="6">
          <TinyFormItem :label="$t('searchTable.columns.createTime')" prop="createTime">
            <TinyDatePicker
              v-model="formModel.createTime"
              type="datetime"
              value-format="yyyy-MM-dd HH:mm:ss"
              placeholder="请选择日期"
            />
          </TinyFormItem>
        </TinyCol>
      </TinyRow>
    </TinyForm>
    <template #footer>
      <TinyButton size="small" @click="handleClose">
        {{ $t('menu.btn.cancel') }}
      </TinyButton>
      <TinyButton size="small" type="primary" @click="handleUpdateSubmit">
        {{ $t('menu.btn.confirm') }}
      </TinyButton>
    </template>
  </TinyDialogBox>
</template>
