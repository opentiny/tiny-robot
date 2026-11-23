<script lang="ts" setup>
import { defineAsyncComponent } from 'vue'

const Headtop = defineAsyncComponent(() => import('../../form/step/components/head.vue'))
const Infotab = defineAsyncComponent(() => import('./components/info-tab.vue'))
</script>

<template>
  <div class="container">
    <Breadcrumb :items="['menu.user', 'menu.user.info']" />
    <div class="container-info max-md:overflow-y-auto">
      <div class="general-card">
        <div class="general-top flex justify-around max-sm:flex-col max-sm:items-center max-sm:pb-[10px]">
          <Headtop />
        </div>
        <div class="general-content max-md:overflow-y-visible!">
          <Infotab />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.container {
  width: 100%;
  height: calc(100% - 48px);
}

.container-info {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  height: calc(100% - 60px);
  margin: 0 auto;
  overflow-x: hidden;

  .general-card {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    height: 100%;
    border-radius: 10px;

    .general-top {
      margin: 10px -10px;
      background-image: url('@/assets/images/step-head.png');
      background-size: 100% 100%;
      flex-shrink: 0;
      overflow: hidden;
    }

    .general-content {
      position: relative;
      flex: 1 1 auto;
      overflow-y: auto;
      color: black;
      font-size: medium;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 0 8px 8px rgba(169, 174, 184, 0.05);
    }
  }
}
</style>
