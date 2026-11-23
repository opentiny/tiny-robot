<script lang="ts" setup>
import transitionFadeSlide from '@/components/transition/transition-fade-slide.vue'
</script>

<template>
  <router-view v-slot="{ Component, route }">
    <transition-fade-slide mode="out-in" appear>
      <component :is="Component" :key="route.fullPath" />
    </transition-fade-slide>
  </router-view>
</template>

<style scoped lang="less"></style>
