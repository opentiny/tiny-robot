<script lang="ts" setup>
import type { EmployeeFilterOptions, EmployeeInfo, EmployeeSearchFilter, QueryTaskParmas } from '@/api/list'
import {
  Modal,
  Button as TinyButton,
  FileUpload as TinyFileUpload,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  Pager as TinyPager,
  Popconfirm as TinyPopconfirm,
} from '@opentiny/vue'
import { iconDel, iconEditor, iconRefresh, iconSetting } from '@opentiny/vue-icon'
import { t } from '@opentiny/vue-locale'
import { defineAsyncComponent, reactive, ref } from 'vue'
import * as XLSX from 'xlsx'
import { deleteEmployee, queryEmployeeList } from '@/api/list'
import { useResponsive, useResponsiveSize } from '@/hooks/responsive'

const EditDialog = defineAsyncComponent(() => import('./components/EditDialog.vue'))

const IconEditor = iconEditor()
const IconDel = iconDel()
const IconRefresh = iconRefresh()
const IconSetting = iconSetting()

const { gridSize } = useResponsiveSize()
const { sm } = useResponsive()

const tags = ref([])

// 搜索配置
const items = reactive<Record<string, any>[]>([])

const basePagerConfigAttrs = { currentPage: 1, pageSize: 10, pageSizes: [10, 20, 50, 100], total: 10 }

const pagerConfigSm = {
  component: TinyPager,
  attrs: { ...basePagerConfigAttrs, layout: 'total, prev, pager, next' },
}

const pagerConfigLg = {
  component: TinyPager,
  attrs: { ...basePagerConfigAttrs, layout: 'sizes, total, prev, pager, next, jumper' },
}

const taskGrid = ref()

interface SearchTag {
  field: string
  value?: string
  type?: string
  start?: string
  end?: string
}

const filterOptions = ref<SearchTag[]>([])

const statusLabelKey: Record<string, string> = {
  0: 'searchTable.form.status.offline',
  1: 'searchTable.form.status.online',
  2: 'searchTable.form.status.doing',
}

const filterFields = [
  { field: 'name', label: 'searchTable.columns.name' },
  { field: 'employeeNo', label: 'searchTable.columns.employeeNo' },
  { field: 'departmentLevel', label: 'searchTable.columns.departmentLevel' },
  { field: 'department', label: 'searchTable.columns.department' },
  { field: 'status', label: 'searchTable.form.status' },
  { field: 'workbenchName', label: 'searchTable.columns.workbenchName' },
  { field: 'project', label: 'searchTable.columns.project' },
  { field: 'type', label: 'searchTable.columns.type' },
  { field: 'address', label: 'searchTable.columns.address' },
  { field: 'roles', label: 'searchTable.columns.roles' },
  { field: 'lastUpdateUser', label: 'searchTable.columns.lastUpdateUser' },
] as const

function getStatusText(status: string) {
  const key = statusLabelKey[status]
  return key ? t(key) : ''
}

function statusCodeByLabel(label: string) {
  return Object.keys(statusLabelKey).find(code => getStatusText(code) === label)
}

let filterSignature = ''

function applyFilterItems(filters: EmployeeFilterOptions) {
  const signature = `${getStatusText('0')}|${JSON.stringify(filters)}`
  if (signature === filterSignature)
    return
  filterSignature = signature

  const minTime = filters.createTime?.min
  const maxTime = filters.createTime?.max
  items.splice(
    0,
    items.length,
    ...filterFields.map(({ field, label }) => ({
      label: t(label),
      field,
      options: (filters[field] || []).map(value => ({
        label: field === 'status' ? getStatusText(String(value)) : String(value),
      })),
    })),
    {
      label: t('searchTable.columns.createTime'),
      field: 'createTime',
      type: 'datetimeRange',
      format: 'yyyy-MM-dd HH:mm:ss',
      min: minTime ? new Date(minTime.replace(' ', 'T')) : undefined,
      max: maxTime ? new Date(maxTime.replace(' ', 'T')) : undefined,
    },
  )
}

function buildSearchInfo(tags: SearchTag[]) {
  const filters: EmployeeSearchFilter[] = []
  const keywords: string[] = []

  tags.forEach((tag) => {
    if (!tag?.field)
      return
    if (tag.field === 'tvpKeyword') {
      if (tag.value)
        keywords.push(tag.value)
      return
    }
    if (tag.field === 'createTime' || tag.type === 'datetimeRange') {
      if (!tag.start && !tag.end)
        return
      filters.push({
        field: 'createTime',
        start: tag.start,
        end: tag.end,
      })
      return
    }

    const value = tag.field === 'status'
      ? (statusCodeByLabel(tag.value || '') || tag.value || '')
      : (tag.value || '')
    if (!value)
      return

    const current = filters.find(item => item.field === tag.field && item.values)
    if (current?.values)
      current.values.push(value)
    else
      filters.push({ field: tag.field, values: [value] })
  })

  return {
    keyword: keywords.join(' '),
    filters,
  }
}

const tableData = ref<EmployeeInfo[]>([])

const loading = ref(false)

// 请求数据接口方法
async function fetchData(params: QueryTaskParmas) {
  const queryParmas: QueryTaskParmas = {
    pageIndex: params.pageIndex,
    pageSize: params.pageSize,
    searchInfo: buildSearchInfo(filterOptions.value),
  }

  loading.value = true

  try {
    const { data } = await queryEmployeeList(queryParmas)
    const { data: list, total, filters } = data
    tableData.value = list
    if (filters)
      applyFilterItems(filters)
    return {
      result: list,
      page: { total },
    }
  }
  finally {
    loading.value = false
  }
}

const fetchDataOption = reactive({
  api: ({ page }: any) => {
    const { currentPage, pageSize } = page

    return fetchData({
      pageIndex: currentPage,
      pageSize,
    })
  },
})
function handleDelete(id: string) {
  deleteEmployee(id).then(() => {
    Modal.message({
      message: '已删除',
      status: 'success',
    })
    taskGrid?.value?.handleFetch?.('reload')
  })
}

// form的button
function reloadGrid(filters: SearchTag[]) {
  filterOptions.value = Array.isArray(filters) ? filters : []
  taskGrid?.value?.handleFetch?.('reload')
}

function handleRefresh() {
  taskGrid?.value?.handleFetch?.('reload')
}

const updateVisibility = ref(false)
const currentEmployeeId = ref('')

function handleUpdated(id: string) {
  currentEmployeeId.value = id
  updateVisibility.value = true
}

function importExcel(files) {
  const fileReader = new FileReader()
  fileReader.onload = (ev) => {
    try {
      const data = ev.target.result
      const workbook = XLSX.read(data, {
        type: 'binary',
      })
      // 取 Excel 的第一张 Sheet 表
      const wsname = workbook.SheetNames[0]
      // 生成 JSON 表格内容
      const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname])
      // 将数据赋值给 Grid 数据源
      tableData.value = ws as EmployeeInfo[]
      return true
      // 可以在这里给后端发请求，将读取的 Excel 数据存到数据库表中
    }
    catch {
      return false
    }
  }
  fileReader.readAsBinaryString(files.raw)
}

// 导出
function toCsvEvent() {
  taskGrid.value.exportCsv({
    filename: 'table',
    original: true,
    isHeader: false,
    useTabs: false,
    data: tableData.value,
  })
}
</script>

<template>
  <div class="search-container-list">
    <Breadcrumb :items="['menu.list', 'menu.list.searchTable']" />

    <div class="search-table-container">
      <div class="button-group flex-wrap gap-4 max-sm:gap-[3%]">
        <TinyFileUpload class="max-sm:w-[30%]" action="#" accept=".xls,.xlsx" @change="importExcel">
          <TinyButton class="max-sm:w-full">
            {{ $t('userInfo.table.import') }}
          </TinyButton>
        </TinyFileUpload>
        <TinyButton class="max-sm:w-[30%]" @click="toCsvEvent">
          {{ $t('userInfo.table.export') }}
        </TinyButton>
      </div>
      <div class="tiny-fullscreen-scroll">
        <div class="tiny-fullscreen-wrapper">
          <div class="btn max-sm:flex-wrap">
            <transition-fade-down-group>
              <div class="search-box-container">
                <tiny-search-box
                  v-model="tags" :items="items" :empty-placeholder="$t('searchTable.form.placeholder')"
                  @change="reloadGrid"
                />
              </div>
              <div class="button-group">
                <TinyButton :icon="IconRefresh" @click="handleRefresh" />
                <TinyButton :icon="IconSetting" />
              </div>
            </transition-fade-down-group>
          </div>
          <TinyGrid
            :key="sm ? 'sm' : 'lg'" ref="taskGrid" :fetch-data="fetchDataOption"
            :pager="sm ? pagerConfigSm : pagerConfigLg" :loading="loading" :size="gridSize" :height="540"
            :auto-resize="true" align="center"
          >
            <TinyGridColumn type="selection" width="60" />
            <TinyGridColumn field="name" :title="$t('searchTable.columns.name')" />
            <TinyGridColumn field="employeeNo" :title="$t('searchTable.columns.employeeNo')" sortable />
            <TinyGridColumn field="departmentLevel" :title="$t('searchTable.columns.departmentLevel')" />
            <TinyGridColumn field="department" :title="$t('searchTable.columns.department')" />
            <TinyGridColumn field="status" :title="$t('searchTable.form.status')">
              <template #default="{ row }">
                <span
                  class="status" :class="{
                    'status-closed': row.status === '0',
                    'status-finished': row.status === '1',
                  }"
                >
                  <span class="status-dot" />
                  <span class="status-text">
                    {{ getStatusText(row.status) }}
                  </span>
                </span>
              </template>
            </TinyGridColumn>
            <TinyGridColumn field="workbenchName" :title="$t('searchTable.columns.workbenchName')" />
            <TinyGridColumn field="project" :title="$t('searchTable.columns.project')" />
            <TinyGridColumn field="type" :title="$t('searchTable.columns.type')" />
            <TinyGridColumn field="address" :title="$t('searchTable.columns.address')" />
            <TinyGridColumn field="roles" :title="$t('searchTable.columns.roles')" />
            <TinyGridColumn field="lastUpdateUser" :title="$t('searchTable.columns.lastUpdateUser')" />
            <TinyGridColumn field="createTime" :title="$t('searchTable.columns.createTime')" />
            <TinyGridColumn :title="$t('searchTable.columns.operations')" width="160">
              <template #default="data">
                <a class="operation" @click="handleUpdated(data.row.id)">
                  <IconEditor class="operation-icon" />{{ $t('userInfo.table.operations.update') }}
                </a>
                <TinyPopconfirm title="确定要删除此用户吗？" type="info" trigger="click" @confirm="handleDelete(data.row.id)">
                  <template #reference>
                    <a class="operation">
                      <IconDel class="operation-icon" />{{ $t('searchTable.columns.operations.delete') }}
                    </a>
                  </template>
                </TinyPopconfirm>
              </template>
            </TinyGridColumn>
          </TinyGrid>
        </div>
      </div>
    </div>

    <EditDialog
      v-model="updateVisibility"
      :employee-id="currentEmployeeId"
      :on-refresh="handleRefresh"
    />
  </div>
</template>

<style scoped lang="less">
@import './search-table.less';
</style>
