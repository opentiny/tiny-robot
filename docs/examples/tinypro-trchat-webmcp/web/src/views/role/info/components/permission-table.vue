<script lang="ts" setup>
import type { Permission } from '@/api/permission'
import { Grid, GridColumn } from '@opentiny/vue'
import { toRefs } from 'vue'
import { useResponsiveSize } from '@/hooks/responsive'

const props = defineProps<{ permission: Permission[] }>()

const { gridSize } = useResponsiveSize()

const { permission } = toRefs(props)
</script>

<template>
  <Grid :data="permission" :size="gridSize" align="center">
    <GridColumn type="index" width="10%" />
    <GridColumn field="name" :title="$t('roleInfo.permissionTable.name')" />
    <GridColumn field="desc" :title="$t('roleInfo.permissionTable.desc')" />
  </Grid>
</template>

<style lang="less" scoped></style>
