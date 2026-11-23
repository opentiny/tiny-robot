<script lang="ts" setup>
import { defineAsyncComponent, onMounted, ref } from 'vue'
import { getBoardHome } from '@/api/board-home'

const Curve = defineAsyncComponent(() => import('./components/curve.vue'))
const Falls = defineAsyncComponent(() => import('./components/falls.vue'))
const Main = defineAsyncComponent(() => import('./components/main.vue'))
const Round = defineAsyncComponent(() => import('./components/round.vue'))
const Region = defineAsyncComponent(() => import('./components/region.vue'))

// 整页数据来自 nestJS mock / 纯前端 mock（GET /api/board/home）。
// 请求失败或无数据时 homeData 为 undefined，各模块照常渲染、展示空数据
const homeData = ref()

onMounted(async () => {
  try {
    const { data } = await getBoardHome()
    homeData.value = data
  }
  catch {
    // 保留各模块的空状态展示
  }
})
</script>

<template>
  <div class="container">
    <Breadcrumb :items="['menu.board', 'menu.home']" />
    <div class="contain">
      <Main :cards="homeData?.cards" />
      <Curve :curve="homeData?.curve" />
      <Falls :falls="homeData?.falls" />
      <Round :round="homeData?.round" />
      <Region :region="homeData?.region" :region-table="homeData?.regionTable" />
    </div>
  </div>
</template>

<style scoped lang="less">
  .container {
  width: 100%;
  height: calc(100% - 60px);
  padding: 0 16px 10px 16px;
  margin: 0 auto;
  overflow-x: hidden;
  overflow-y: auto;
}

.contain {
  width: 100%;
}
</style>

<style lang="less" scoped>
  // responsive
@media (max-width: @screen-xs) {
  .container {
    overflow-x: hidden;
  }
}
</style>
