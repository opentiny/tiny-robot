<script lang="ts" setup>
import {
  Breadcrumb as TinyBreadcrumb,
  BreadcrumbItem as TinyBreadcrumbItem,
} from '@opentiny/vue'

const { items = [] } = defineProps<{ items?: string[] }>()
</script>

<template>
  <TinyBreadcrumb class="container-breadcrumb">
    <TinyBreadcrumbItem v-for="item in items" :key="item">
      {{ $t(item) }}
    </TinyBreadcrumbItem>
  </TinyBreadcrumb>
</template>

<style scoped lang="less">
.container-breadcrumb {
  margin: 20px 0 16px 0px;
}
</style>
