<script lang="ts" setup>
import {
  Grid as TinyGrid,
  GridColumn as TinyGridColumn,
} from '@opentiny/vue'
import { useResponsiveSize } from '@/hooks/responsive'

defineProps<{ tableData: any[] }>()

const { gridSize } = useResponsiveSize()
</script>

<template>
  <div class="table">
    <TinyGrid :data="tableData" :auto-resize="true" :size="gridSize" align="center">
      <TinyGridColumn type="index" width="10%" />
      <TinyGridColumn type="expand" width="10%">
        <template #default="data">
          <ul>
            <li>
              <span>{{ $t('userInfo.table.columnA') }}：</span>
              <span>{{ data.row.name }}</span>
            </li>
            <li>
              <span>{{ $t('userInfo.table.columnB') }}：</span>
              <span>{{ data.row.time }}</span>
            </li>
            <li>
              <span>{{ $t('userInfo.table.columnC') }}：</span>
              <span>{{ $t(`${data.row.type}`) }}</span>
            </li>
            <li>
              <span>{{ $t('userInfo.table.columnD') }}：</span>
              <span>{{ $t(`${data.row.status}`) }}</span>
            </li>
          </ul>
        </template>
      </TinyGridColumn>
      <TinyGridColumn field="name" :title="$t('userInfo.table.columnA')" />
      <TinyGridColumn field="time" :title="$t('userInfo.table.columnB')" />
      <TinyGridColumn field="type" :title="$t('userInfo.table.columnC')">
        <template #default="data">
          <span>{{ $t(`${data.row.type}`) }}</span>
        </template>
      </TinyGridColumn>
      <TinyGridColumn field="status" :title="$t('userInfo.table.columnD')">
        <template #default="data">
          <span>{{ $t(`${data.row.status}`) }}</span>
        </template>
      </TinyGridColumn>
    </TinyGrid>
  </div>
</template>

<style scoped lang="less">
.table {
  padding-bottom: 20px;
  background-color: #fff;
}
</style>
