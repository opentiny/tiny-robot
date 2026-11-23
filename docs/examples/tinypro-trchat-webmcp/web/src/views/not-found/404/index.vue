<script lang="ts" setup></script>

<template>
  <div class="container">
    <Breadcrumb :items="['menu.exception.404']" />
    <div class="content">
      <div class="content-main">
        <img src="@/assets/images/404.png" alt="404" class="image">
        <h3 class="tip">
          {{ $t('exception.result.404.description') }}
        </h3>
        <span>{{ $t('component.error') }}</span>
        <span>{{ $t('component.error.contact') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
@import '@/assets/style/exception.less';
</style>
