<script lang="ts" setup>
import GeneralLayout from '@/layout/general-layout.vue'
import infoTab from './components/info-tab.vue'
</script>

<template>
  <GeneralLayout :breadcrumb="['menu.systemManager', 'menu.permission.info']">
    <info-tab />
  </GeneralLayout>
</template>

<style lang="less" scoped></style>
