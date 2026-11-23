<script lang="ts" setup>
import type { FilterType, InputFilterValue } from '@/types/global'
import {
  Notify,
  Button as TinyButton,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
  TinyModal,
  Popconfirm as TinyPopconfirm,
} from '@opentiny/vue'
import { iconDel } from '@opentiny/vue-icon'
import { computed, ref } from 'vue'
import { batchDeleteLocal, deleteLocale, getAllLocalItems, patchLocal } from '@/api/local'
import useLoading from '@/hooks/loading'
import { useResponsive, useResponsiveSize } from '@/hooks/responsive'
import { useUserStore } from '@/store'
import { useLocales } from '@/store/modules/locales'

const { gridSize } = useResponsiveSize()
const { sm } = useResponsive()

const IconDel = iconDel()
const grid = ref()
const localeStore = useLocales()

export interface LocalTableData {
  id: number
  key: string
  content: string
  lang: string
}
const userStore = useUserStore()
const rolePermission = computed(() => userStore.rolePermission)

const keyFilter = {
  inputFilter: true,
}
const contentFilter = {
  inputFilter: true,
}
const langFilter = {
  enumable: true,
  multi: true,
  values: () => {
    return Promise.resolve(
      localeStore.lang.map(language => ({
        label: language.name,
        value: language.id,
      })),
    )
  },
}

const pagerConfigSm = ref({
  attrs: {
    currentPage: 1,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
    total: 0,
    align: 'right',
    layout: 'total, prev, pager, next',
  },
})
const pagerConfigLg = ref({
  attrs: {
    currentPage: 1,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
    total: 0,
    align: 'right',
    layout: 'sizes, total, prev, pager, next, jumper',
  },
})

const options = computed(() =>
  localeStore.lang.map(language => ({
    label: language.name,
    value: language.name,
  })),
)
const { loading, setLoading } = useLoading()
if (!localeStore.lang.length) {
  localeStore.fetchLang()
}

let currentPage = 0

function filterInputValue2String(value: InputFilterValue) {
  let str = ''
  if (value.relation === 'contains') {
    str += '%'
  }
  str += value.text
  if (value.relation === 'startwith' || value.relation === 'contains') {
    str += '%'
  }
  return str
}

function getData({
  page,
  filters,
}: {
  page: { pageSize: number, currentPage: number }
  filters: FilterType
}) {
  const key = filters.key
    ? filterInputValue2String(filters.key.value as InputFilterValue)
    : undefined
  const content = filters.content
    ? filterInputValue2String(filters.content.value as InputFilterValue)
    : undefined
  const lang
    = filters.lang && (filters.lang.value as number[]).length
      ? (filters.lang.value as number[]).toString()
      : undefined
  const { pageSize } = page
  currentPage = page.currentPage
  setLoading(true)
  return new Promise((resolve) => {
    getAllLocalItems(currentPage, pageSize, 0, { key, content, lang })
      .then(({ data }) => {
        resolve({
          result: data.items.map((item) => {
            return {
              id: item.id,
              key: item.key,
              content: item.content,
              lang: item.lang.name,
            }
          }),
          page: {
            total: data.meta.totalItems,
          },
        })
      })
      .finally(() => {
        setLoading(false)
      })
  })
}
function onEditClosed({ row }: { row: Record<string, any> }) {
  if (grid.value.hasRowChange(row)) {
    const langId = localeStore.lang.filter(
      lang => lang.name === row.lang,
    )[0].id
    patchLocal(row.id, {
      content: row.content,
      key: row.key,
      lang: langId,
    })
      .then(() => {
        Notify({
          type: 'info',
          message: '更新成功',
        })
      })
      .catch((error) => {
        grid.value.revertData(row)
        if (error.response && error.response.data) {
          const errorMessage = error.response.data.message || '未知错误'
          TinyModal.message({
            message: errorMessage,
            status: 'error',
          })
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }
}
function batchRemoveLocale() {
  const rowIds = grid.value.getAllSelection().flatMap(row => row.id)
  if (rowIds.length === 0) {
    TinyModal.message({
      message: '请选择要删除的词条',
      status: 'error',
    })
    return
  }
  TinyModal.confirm({
    title: '删除确认',
    message: '确定要批量删除选中的用户吗？',
    onConfirm: () => {
      setLoading(true)
      batchDeleteLocal(rowIds)
        .then(() => {
          TinyModal.message({
            message: '批量删除成功',
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
        .finally(() => {
          setLoading(false)
        })
    },
  })
}

function removeLocale(row: any) {
  setLoading(true)
  deleteLocale(row.id)
    .then(() => {
      localeStore.$patch({
        locales: localeStore.locales.filter(locale => locale.id !== row.id),
      })
      grid.value.remove(row)
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
    .finally(() => {
      setLoading(false)
    })
}

const fetchData = ref({
  api: getData,
  filter: true,
})
defineExpose({
  reload: () => {
    grid.value.handleFetch()
  },
  batchRemoveLocale,
})
</script>

<template>
  <TinyGrid
    :key="sm ? 'sm' : 'lg'"
    ref="grid"
    :pager="sm ? pagerConfigSm : pagerConfigLg"
    :fetch-data="fetchData"
    :edit-config="
      rolePermission.includes('i18n::update')
        ? { trigger: 'click', mode: 'cell', showStatus: true }
        : undefined
    "
    :loading="loading"
    :auto-resize="true"
    remote-filter
    refresh
    :size="gridSize"
    align="center"
    @edit-closed="onEditClosed"
  >
    <TinyGridColumn type="selection" width="30px" />
    <TinyGridColumn field="id" title="ID" />
    <TinyGridColumn
      field="key"
      title="key"
      :editor="{ component: 'input', autoselect: true }"
      :filter="keyFilter"
    />
    <TinyGridColumn
      field="content"
      title="content"
      :editor="{ component: 'input' }"
      :filter="contentFilter"
    />
    <TinyGridColumn
      field="lang"
      title="lang"
      :editor="{ component: 'select', options }"
      :format-config="{ async: true, data: options, type: 'enum' }"
      :filter="langFilter"
    />
    <TinyGridColumn :title="$t('searchTable.columns.operations')" width="14%">
      <template #default="data">
        <TinyPopconfirm
          title="确定要删除此词条吗？"
          type="info"
          trigger="click"
          @confirm="removeLocale(data.row)"
        >
          <template #reference>
            <TinyButton
              v-permission="'i18n::remove'"
              type="text"
            >
              <IconDel class="operation-icon" />
              {{ $t('locale.remove') }}
            </TinyButton>
          </template>
        </TinyPopconfirm>
      </template>
    </TinyGridColumn>
  </TinyGrid>
</template>

<style scoped lang="less">
.operation-icon {
  margin-right: 3px;
  fill: currentColor;
}
</style>
