<script lang="ts" setup>
import type { ProjectInfo } from '@/api/project'
import {
  Modal,
  Button as TinyButton,
  DatePicker as TinyDatePicker,
  Form as TinyForm,
  FormItem as TinyFormItem,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  GridToolbar as TinyGridToolbar,
  Input as TinyInput,
  Option as TinyOption,
  Pager as TinyPager,
  Popconfirm as TinyPopconfirm,
  Select as TinySelect,
  Tag as TinyTag,
} from '@opentiny/vue'
import { t } from '@opentiny/vue-locale'
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { createProject, deleteProject, queryProjectList, updateProject } from '@/api/project'

const gridRef = ref()

// tableData 为数据源（与 mock 同步），gridData 为搜索过滤后的数据，pagedData 为当前页数据
const tableData = ref<ProjectInfo[]>([])
const gridData = ref<ProjectInfo[]>([])

// 分页配置（客户端分页，参考 pager-in-grid 示例）
const pagerConfig = reactive({
  currentPage: 1,
  pageSize: 10,
})

const pagedData = computed(() => {
  const total = gridData.value.length
  const maxPage = Math.max(1, Math.ceil(total / pagerConfig.pageSize))
  const currentPage = Math.min(pagerConfig.currentPage, maxPage)
  const start = (currentPage - 1) * pagerConfig.pageSize
  return gridData.value.slice(start, start + pagerConfig.pageSize)
})

function handleCurrentChange(current: number) {
  pagerConfig.currentPage = current
}

function handleSizeChange(size: number) {
  pagerConfig.pageSize = size
  pagerConfig.currentPage = 1
}

// 已编辑/新增行的 id 集合，驱动工具栏「保存」按钮保存全部待保存的修改
const dirtyKeys = ref(new Set<string>())
const newKeys = ref(new Set<string>())

// 保存请求进行中，防止重复点击造成重复创建
const saving = ref(false)

// 跨页选中的行 id 集合（分页切换时保留选中状态）
const selectedKeys = ref(new Set<string>())

function handleSelectChange({ row, checked }: { row: ProjectInfo, checked: boolean }) {
  if (checked)
    selectedKeys.value.add(row.id)
  else
    selectedKeys.value.delete(row.id)
}

function handleSelectAll({ checked }: { checked: boolean }) {
  if (checked)
    pagedData.value.forEach(row => selectedKeys.value.add(row.id))
  else
    pagedData.value.forEach(row => selectedKeys.value.delete(row.id))
}

// 必填字段配置，保存前校验
const requiredFields: { field: keyof ProjectInfo, label: string }[] = [
  { field: 'projectName', label: 'advancedList.columns.projectName' },
  { field: 'projectCode', label: 'advancedList.columns.projectCode' },
  { field: 'owner', label: 'advancedList.columns.owner' },
]

const editRules = computed(() => ({
  projectName: [{ required: true, message: `${t('advancedList.columns.projectName')}${t('advancedList.message.requiredEmpty')}` }],
  projectCode: [{ required: true, message: `${t('advancedList.columns.projectCode')}${t('advancedList.message.requiredEmpty')}` }],
  owner: [{ required: true, message: `${t('advancedList.columns.owner')}${t('advancedList.message.requiredEmpty')}` }],
}))

// 校验待保存的行，返回错误信息列表
function validateRows(rows: ProjectInfo[]): string[] {
  return rows.flatMap((row) => {
    const missing = requiredFields
      .filter(({ field }) => !String(row[field] ?? '').trim())
      .map(({ label }) => t(label))
    if (!missing.length)
      return []
    const seq = tableData.value.indexOf(row) + 1
    return [`#${seq}（${row.projectName || row.projectCode || '-'}）: ${missing.join('、')}${t('advancedList.message.requiredEmpty')}`]
  })
}

// 存在未保存修改时，离开页面前弹确认；关闭/刷新浏览器时提示
const hasPendingChanges = computed(() => {
  if (dirtyKeys.value.size > 0 || newKeys.value.size > 0)
    return true
  // 编辑器仍打开时 handleEditClosed 尚未触发，直接对比当前行数据
  return tableData.value.some(row => !newKeys.value.has(row.id) && isRowChanged(row))
})

onBeforeRouteLeave(() => {
  if (!hasPendingChanges.value)
    return
  return Modal.confirm(t('advancedList.message.leaveConfirm')).then((res: string) => res === 'confirm')
})

function handleBeforeUnload(event: BeforeUnloadEvent) {
  if (hasPendingChanges.value) {
    event.preventDefault()
    // 旧版浏览器只有 returnValue 非空时才弹出提示
    event.returnValue = t('advancedList.message.leaveConfirm')
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})

const projectStatusOptions = [
  { value: '0', label: 'advancedList.status.notStarted' },
  { value: '1', label: 'advancedList.status.inProgress' },
  { value: '2', label: 'advancedList.status.completed' },
  { value: '3', label: 'advancedList.status.paused' },
]

const taskStatusOptions = [
  { value: '0', label: 'advancedList.taskStatus.running' },
  { value: '1', label: 'advancedList.taskStatus.stopped' },
  { value: '2', label: 'advancedList.taskStatus.exception' },
]

const priorityOptions = [
  { value: '0', label: 'advancedList.priority.high' },
  { value: '1', label: 'advancedList.priority.medium' },
  { value: '2', label: 'advancedList.priority.low' },
]

const projectStatusLabel: Record<string, string> = {
  0: 'advancedList.status.notStarted',
  1: 'advancedList.status.inProgress',
  2: 'advancedList.status.completed',
  3: 'advancedList.status.paused',
}

const taskStatusLabel: Record<string, string> = {
  0: 'advancedList.taskStatus.running',
  1: 'advancedList.taskStatus.stopped',
  2: 'advancedList.taskStatus.exception',
}

const priorityLabel: Record<string, string> = {
  0: 'advancedList.priority.high',
  1: 'advancedList.priority.medium',
  2: 'advancedList.priority.low',
}

const priorityTagType: Record<string, string> = {
  0: 'danger',
  1: 'warning',
  2: 'info',
}

const projectStatusTagType: Record<string, string> = {
  0: '',
  1: 'success',
  2: 'info',
  3: 'warning',
}

const toolbarButtons = computed(() => [
  { code: 'insert', name: t('advancedList.operations.addRow'), type: 'primary' },
  { code: 'delete', name: t('advancedList.operations.batchDelete') },
  { code: 'save', name: t('advancedList.operations.save'), disabled: saving.value },
])

function createEmptySearch() {
  return {
    projectName: '',
    projectCode: '',
    projectStatus: '',
    taskStatus: '',
    department: '',
    priority: '',
    owner: '',
    startTimeRange: [] as string[],
  }
}

const searchForm = reactive(createEmptySearch())

const appliedSearch = ref(createEmptySearch())

function filterData(source: ProjectInfo[], filters: ReturnType<typeof createEmptySearch>) {
  const {
    projectName,
    projectCode,
    projectStatus,
    taskStatus,
    department,
    priority,
    owner,
    startTimeRange,
  } = filters
  return source.filter((row) => {
    if (projectName && !row.projectName.includes(projectName))
      return false
    if (projectCode && !row.projectCode.includes(projectCode))
      return false
    if (projectStatus && row.projectStatus !== projectStatus)
      return false
    if (taskStatus && row.taskStatus !== taskStatus)
      return false
    if (department && !row.department.includes(department))
      return false
    if (priority && row.priority !== priority)
      return false
    if (owner && !row.owner.includes(owner))
      return false
    if (startTimeRange?.length === 2) {
      const [min, max] = startTimeRange
      if (min && row.startTime < min)
        return false
      if (max && row.startTime > max)
        return false
    }
    return true
  })
}

// 初始数据快照，编辑单元格关闭后对比快照判断该行是否被修改
const originalSnapshots = new Map<string, string>()

function snapshotRow(row: ProjectInfo) {
  return JSON.stringify({ ...row })
}

function isRowChanged(row: ProjectInfo) {
  const original = originalSnapshots.get(row.id)
  return original ? snapshotRow(row) !== original : true
}

async function fetchData() {
  const { data } = await queryProjectList()
  // 保留已插入但未保存的新行，避免被初始列表覆盖
  const drafts = tableData.value.filter(row => newKeys.value.has(row.id))
  tableData.value = [...drafts, ...data]
  gridData.value = [...tableData.value]
  originalSnapshots.clear()
  data.forEach((row) => {
    originalSnapshots.set(row.id, snapshotRow(row))
  })
}

onMounted(() => {
  fetchData().catch(() => {
    Modal.message({ message: t('advancedList.message.operationFailed'), status: 'error' })
  })
})

function handleSearch() {
  appliedSearch.value = { ...searchForm }
  gridData.value = filterData(tableData.value, appliedSearch.value)
  pagerConfig.currentPage = 1
}

function handleReset() {
  Object.assign(searchForm, createEmptySearch())
  appliedSearch.value = createEmptySearch()
  gridData.value = [...tableData.value]
  pagerConfig.currentPage = 1
}

function handleEditClosed({ row }: { row?: ProjectInfo }) {
  if (!row || newKeys.value.has(row.id))
    return
  if (isRowChanged(row))
    dirtyKeys.value.add(row.id)
  else
    dirtyKeys.value.delete(row.id)
}

let tempIdSeed = 0

function createEmptyRow(): ProjectInfo {
  return {
    id: `new-${Date.now()}-${tempIdSeed += 1}`,
    projectName: '',
    projectCode: '',
    projectStatus: '1',
    taskStatus: '0',
    department: '',
    startTime: '',
    endTime: '',
    priority: '1',
    owner: '',
  }
}

// 进行中的新增请求，按临时 id 跟踪，删除前需等待其完成以拿到服务端 id
const pendingCreates = new Map<string, Promise<void>>()

async function waitForPendingCreate(row: ProjectInfo) {
  await pendingCreates.get(row.id)?.catch(() => {})
}

// 保存单行，返回是否为新增行
async function saveRow(row: ProjectInfo) {
  const submitted = { ...row }
  if (newKeys.value.has(row.id)) {
    const tempId = row.id
    const create = createProject(submitted).then(({ data }) => {
      newKeys.value.delete(tempId)
      row.id = data.id
      submitted.id = data.id
      // 选中态以临时 id 记录，替换为服务端 id 后同步迁移，避免批量删除时漏删
      if (selectedKeys.value.has(tempId)) {
        selectedKeys.value.delete(tempId)
        selectedKeys.value.add(data.id)
      }
    })
    pendingCreates.set(tempId, create)
    try {
      await create
    }
    finally {
      pendingCreates.delete(tempId)
    }
  }
  else {
    await updateProject(submitted)
  }
  originalSnapshots.set(row.id, snapshotRow(submitted))
  // 请求期间又发生的修改需要保留脏标记，否则会被漏保存
  if (snapshotRow(row) === snapshotRow(submitted))
    dirtyKeys.value.delete(row.id)
  else
    dirtyKeys.value.add(row.id)
  return false
}

async function handleToolbarButtonClick({ code, $grid }: { code: string, $grid: any }) {
  if (code === 'insert') {
    const row = createEmptyRow()
    // 插入到表格最上方，并同步到数据源
    tableData.value.unshift(row)
    gridData.value = [row, ...gridData.value]
    newKeys.value.add(row.id)
    pagerConfig.currentPage = 1
    gridRef.value?.setActiveCell?.(row, 'projectName')
    Modal.message({ message: t('advancedList.message.addSuccess'), status: 'info' })
  }

  if (code === 'delete') {
    const rows: ProjectInfo[] = gridData.value.filter(row => selectedKeys.value.has(row.id))
    if (!rows.length) {
      Modal.message({ message: t('advancedList.message.selectFirst'), status: 'warning' })
      return
    }
    Modal.confirm(t('advancedList.message.batchDeleteConfirm')).then(async (res: string) => {
      if (res !== 'confirm')
        return
      try {
        // 等待进行中的新增请求完成，确保用服务端 id 删除
        await Promise.all(rows.map(row => waitForPendingCreate(row)))
        const results = await Promise.allSettled(rows.map(row => deleteProject(row.id)))
        const ids = new Set(rows.filter((_, index) => results[index].status === 'fulfilled').map(row => row.id))
        tableData.value = tableData.value.filter(item => !ids.has(item.id))
        gridData.value = gridData.value.filter(item => !ids.has(item.id))
        selectedKeys.value.clear()
        $grid.clearSelection?.()
        ids.forEach((id) => {
          newKeys.value.delete(id)
          dirtyKeys.value.delete(id)
        })
        if (ids.size < rows.length) {
          Modal.message({ message: t('advancedList.message.operationFailed'), status: 'error' })
          return
        }
        Modal.message({ message: t('advancedList.message.deleteSuccess'), status: 'success' })
      }
      catch {
        Modal.message({ message: t('advancedList.message.operationFailed'), status: 'error' })
      }
    })
  }

  if (code === 'save') {
    if (saving.value) {
      Modal.message({ message: t('advancedList.message.saveInProgress'), status: 'info' })
      return
    }
    const pending: ProjectInfo[] = tableData.value.filter(
      row => newKeys.value.has(row.id) || dirtyKeys.value.has(row.id),
    )
    if (!pending.length) {
      Modal.message({ message: t('advancedList.message.nothingToSave'), status: 'info' })
      return
    }
    const errors = validateRows(pending)
    if (errors.length) {
      // 触发表格内置校验，标记未填写的必填单元格
      try {
        await gridRef.value?.validate?.()
      }
      catch {
        // 校验未通过时忽略 reject，提示信息以下方弹窗为准
      }
      Modal.alert(`${t('advancedList.message.requiredTip')}\n${errors.join('\n')}`)
      return
    }
    saving.value = true
    try {
      // 等待全部保存请求结束再放开按钮，避免部分请求仍进行时重复提交
      const results = await Promise.allSettled(pending.map(row => saveRow(row)))
      if (results.some(result => result.status === 'rejected'))
        throw new Error('save failed')
      Modal.message({ message: t('advancedList.message.saveSuccess'), status: 'success' })
    }
    catch {
      Modal.message({ message: t('advancedList.message.operationFailed'), status: 'error' })
    }
    finally {
      saving.value = false
    }
  }
}

async function handleDelete(row: ProjectInfo) {
  try {
    // 新增请求未完成时先等待，确保用服务端 id 删除
    await waitForPendingCreate(row)
    await deleteProject(row.id)
    tableData.value = tableData.value.filter(item => item.id !== row.id)
    gridData.value = gridData.value.filter(item => item.id !== row.id)
    newKeys.value.delete(row.id)
    dirtyKeys.value.delete(row.id)
    Modal.message({ message: t('advancedList.message.deleteSuccess'), status: 'success' })
  }
  catch {
    Modal.message({ message: t('advancedList.message.operationFailed'), status: 'error' })
  }
}
</script>

<template>
  <div class="advanced-list-container">
    <Breadcrumb :items="['menu.list', 'menu.list.advancedList']" />

    <div class="advanced-list-wrapper">
      <!-- 搜索区域 -->
      <div class="search-panel">
        <TinyForm class="search-form" label-position="top">
          <TinyFormItem :label="$t('advancedList.search.projectName')">
            <TinyInput v-model="searchForm.projectName" clearable :placeholder="$t('advancedList.search.projectName')" />
          </TinyFormItem>
          <TinyFormItem :label="$t('advancedList.search.projectCode')">
            <TinyInput v-model="searchForm.projectCode" clearable :placeholder="$t('advancedList.search.projectCode')" />
          </TinyFormItem>
          <TinyFormItem :label="$t('advancedList.search.projectStatus')">
            <TinySelect v-model="searchForm.projectStatus" clearable :placeholder="$t('advancedList.search.projectStatus')">
              <TinyOption
                v-for="option in projectStatusOptions" :key="option.value" :value="option.value"
                :label="$t(option.label)"
              >
                <TinyTag :type="projectStatusTagType[option.value]">
                  {{ $t(option.label) }}
                </TinyTag>
              </TinyOption>
            </TinySelect>
          </TinyFormItem>
          <TinyFormItem :label="$t('advancedList.search.taskStatus')">
            <TinySelect v-model="searchForm.taskStatus" clearable :placeholder="$t('advancedList.search.taskStatus')">
              <TinyOption
                v-for="option in taskStatusOptions" :key="option.value" :value="option.value"
                :label="$t(option.label)"
              >
                <TinyTag :type="option.value === '2' ? 'danger' : option.value === '1' ? 'warning' : 'success'">
                  {{ $t(option.label) }}
                </TinyTag>
              </TinyOption>
            </TinySelect>
          </TinyFormItem>
          <TinyFormItem :label="$t('advancedList.search.department')">
            <TinyInput v-model="searchForm.department" clearable :placeholder="$t('advancedList.search.department')" />
          </TinyFormItem>
          <TinyFormItem :label="$t('advancedList.search.priority')">
            <TinySelect v-model="searchForm.priority" clearable :placeholder="$t('advancedList.search.priority')">
              <TinyOption
                v-for="option in priorityOptions" :key="option.value" :value="option.value"
                :label="$t(option.label)"
              >
                <TinyTag :type="priorityTagType[option.value]">
                  {{ $t(option.label) }}
                </TinyTag>
              </TinyOption>
            </TinySelect>
          </TinyFormItem>
          <TinyFormItem :label="$t('advancedList.search.owner')">
            <TinyInput v-model="searchForm.owner" clearable :placeholder="$t('advancedList.search.owner')" />
          </TinyFormItem>
          <TinyFormItem :label="$t('advancedList.search.startTime')">
            <TinyDatePicker
              v-model="searchForm.startTimeRange" type="daterange" clearable value-format="yyyy-MM-dd"
              range-separator="-" :start-placeholder="$t('advancedList.search.startDate')"
              :end-placeholder="$t('advancedList.search.endDate')" :placeholder="$t('advancedList.search.startTime')"
            />
          </TinyFormItem>
        </TinyForm>
        <div class="search-form-buttons">
          <TinyButton type="primary" @click="handleSearch">
            {{ $t('advancedList.search.search') }}
          </TinyButton>
          <TinyButton @click="handleReset">
            {{ $t('advancedList.search.reset') }}
          </TinyButton>
        </div>
      </div>

      <!-- 列表区域 -->
      <div class="table-panel">
        <TinyGrid
          ref="gridRef" :data="pagedData" row-id="id" :select-config="{ reserve: true }"
          :edit-config="{ trigger: 'click', mode: 'cell', showStatus: true }" :edit-rules="editRules"
          :auto-resize="true" align="center"
          @toolbar-button-click="handleToolbarButtonClick" @edit-closed="handleEditClosed"
          @select-change="handleSelectChange" @select-all="handleSelectAll"
        >
          <template #toolbar>
            <TinyGridToolbar :buttons="toolbarButtons" />
          </template>
          <TinyGridColumn type="selection" width="50" />
          <TinyGridColumn field="projectName" :title="$t('advancedList.columns.projectName')" :editor="{ component: 'input' }">
            <template #edit="{ row }">
              <TinyInput v-model="row.projectName" />
            </template>
          </TinyGridColumn>
          <TinyGridColumn field="projectCode" :title="$t('advancedList.columns.projectCode')" :editor="{ component: 'input' }">
            <template #edit="{ row }">
              <TinyInput v-model="row.projectCode" />
            </template>
          </TinyGridColumn>
          <TinyGridColumn field="priority" :title="$t('advancedList.columns.priority')" :editor="{ component: 'select' }">
            <template #default="{ row }">
              <TinyTag :type="priorityTagType[row.priority]">
                {{ $t(priorityLabel[row.priority]) }}
              </TinyTag>
            </template>
            <template #edit="{ row }">
              <TinySelect v-model="row.priority">
                <TinyOption
                  v-for="option in priorityOptions" :key="option.value" :value="option.value"
                  :label="$t(option.label)"
                />
              </TinySelect>
            </template>
          </TinyGridColumn>
          <TinyGridColumn field="owner" :title="$t('advancedList.columns.owner')" :editor="{ component: 'input' }">
            <template #edit="{ row }">
              <TinyInput v-model="row.owner" />
            </template>
          </TinyGridColumn>
          <TinyGridColumn field="projectStatus" :title="$t('advancedList.columns.projectStatus')" :editor="{ component: 'select' }">
            <template #default="{ row }">
              <TinyTag :type="projectStatusTagType[row.projectStatus]">
                {{ $t(projectStatusLabel[row.projectStatus]) }}
              </TinyTag>
            </template>
            <template #edit="{ row }">
              <TinySelect v-model="row.projectStatus">
                <TinyOption
                  v-for="option in projectStatusOptions" :key="option.value" :value="option.value"
                  :label="$t(option.label)"
                />
              </TinySelect>
            </template>
          </TinyGridColumn>
          <TinyGridColumn field="taskStatus" :title="$t('advancedList.columns.taskStatus')" :editor="{ component: 'select' }">
            <template #default="{ row }">
              <TinyTag :type="row.taskStatus === '2' ? 'danger' : row.taskStatus === '1' ? 'warning' : 'success'">
                {{ $t(taskStatusLabel[row.taskStatus]) }}
              </TinyTag>
            </template>
            <template #edit="{ row }">
              <TinySelect v-model="row.taskStatus">
                <TinyOption
                  v-for="option in taskStatusOptions" :key="option.value" :value="option.value"
                  :label="$t(option.label)"
                />
              </TinySelect>
            </template>
          </TinyGridColumn>
          <TinyGridColumn field="department" :title="$t('advancedList.columns.department')" :editor="{ component: 'input' }">
            <template #edit="{ row }">
              <TinyInput v-model="row.department" />
            </template>
          </TinyGridColumn>
          <TinyGridColumn field="startTime" :title="$t('advancedList.columns.startTime')" :editor="{ component: 'input' }">
            <template #edit="{ row }">
              <TinyDatePicker v-model="row.startTime" type="date" value-format="yyyy-MM-dd" />
            </template>
          </TinyGridColumn>
          <TinyGridColumn field="endTime" :title="$t('advancedList.columns.endTime')" :editor="{ component: 'input' }">
            <template #edit="{ row }">
              <TinyDatePicker v-model="row.endTime" type="date" value-format="yyyy-MM-dd" />
            </template>
          </TinyGridColumn>
          <TinyGridColumn :title="$t('advancedList.columns.operations')" width="90" fixed="right">
            <template #default="{ row }">
              <TinyPopconfirm
                :title="$t('advancedList.message.deleteConfirm')" type="warning" trigger="click"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <button type="button" class="operation">
                    {{ $t('advancedList.operations.delete') }}
                  </button>
                </template>
              </TinyPopconfirm>
            </template>
          </TinyGridColumn>
        </TinyGrid>
        <div class="grid-pager">
          <TinyPager
            :current-page="pagerConfig.currentPage" :page-size="pagerConfig.pageSize"
            :total="gridData.length" :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper" @current-change="handleCurrentChange"
            @size-change="handleSizeChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
@import './advanced-list.less';
</style>
