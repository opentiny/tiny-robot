<script lang="ts" setup>
import {
  Pager,
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
} from '@opentiny/vue'
import { ref, watch } from 'vue'
import { useResponsiveSize } from '@/hooks/responsive'

const props = withDefaults(defineProps<{ tableData?: { id: string, space: string, pv: string, play: string, page: string }[] }>(), {
  tableData: () => [],
})

const { gridSize } = useResponsiveSize()
const grid = ref()

const pagerConfig = ref({
  component: Pager,
  attrs: {
    currentPage: 1,
    pageSize: 10,
    pageSizes: [10, 20, 50, 100],
    total: 0,
    align: 'right', // 可选值：['left', 'center', 'right']
    layout: 'total, sizes, prev, pager, next, jumper',
  },
})

const fetchData = ref({
  api: getData,
})

watch(() => props.tableData, () => {
  pagerConfig.value.attrs.currentPage = 1
  grid.value?.handleFetch?.('reload')
}, { deep: true })

// 各排序字段的取值解析：pv/play/page 是带单位的字符串，需取数值部分比较
const sortParsers: Record<string, (v: string) => number> = {
  id: v => Number.parseInt(v, 10),
  pv: v => Number.parseFloat(v), // '1767(97.77%)' -> 1767
  play: v => Number.parseFloat(v), // '0.44s' -> 0.44
  page: v => Number.parseFloat(v),
}

function getData({ page, sort }: any) {
  const { currentPage, pageSize } = page
  const offset = (currentPage - 1) * pageSize

  const result = props.tableData.slice()

  // 排序：点击表头后 Grid 会把 { field, order } 传进来
  if (sort?.order) {
    const field: string = sort.field || sort.property
    const parse = sortParsers[field] ?? ((v: string) => v)
    result.sort((a: any, b: any) => {
      const diff = parse(a[field]) - parse(b[field])
      return sort.order === 'asc' ? diff : -diff
    })
  }

  return Promise.resolve({
    result: result.slice(offset, offset + pageSize),
    page: { total: props.tableData.length },
  })
}
</script>

<template>
  <div class="container">
    <TinyGrid
      ref="grid" :fetch-data="fetchData" :pager="pagerConfig"
      :size="gridSize" :auto-resize="true" align="center"
    >
      <TinyGridColumn field="id" :title="$t('home.roundtable.index')" width="16%" sortable />
      <TinyGridColumn field="space" :title="$t('home.region.title')" />
      <TinyGridColumn field="pv" :title="$t('home.roundtable.pv')" min-width="120" sortable />
      <TinyGridColumn field="play" :title="$t('home.roundtable.play')" sortable />
      <TinyGridColumn field="page" :title="$t('home.roundtable.page')" sortable />
    </TinyGrid>
  </div>
</template>

<style scoped lang="less">
.container {
  width: inherit;
}
</style>
