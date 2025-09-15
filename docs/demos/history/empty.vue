<template>
  <tr-history :data="data" />
</template>

<script setup lang="ts">
import { TrHistory } from '@opentiny/tiny-robot'
import { reactive } from 'vue'

const data = reactive([])
</script>

<style lang="less" scoped></style>
