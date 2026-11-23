<script lang="ts" setup></script>

<template>
  <div class="container">
    <Breadcrumb :items="['menu.menuPage', 'menu.menuPage.second', 'menu.add.demo']" />
    <div class="content">
      <div class="content-main">
        <img src="@/assets/images/tiny-logo.png" class="image">
        <h3 class="tip">
          {{ $t('exception.result.demo.description') }}
        </h3>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
@import '@/assets/style/exception.less';
</style>
