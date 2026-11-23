<script lang="ts" setup>
import GeneralLayout from '@/layout/general-layout.vue'
import infoTab from './components/info-tab.vue'
</script>

<template>
  <GeneralLayout :breadcrumb="['menu.systemManager', 'menu.role.info']">
    <info-tab />
  </GeneralLayout>
</template>
