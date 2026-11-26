<script lang="ts" setup>
import { findIdx } from './utils'

function onBeforeEnter(el: HTMLElement) {
  el.style.opacity = '0'
  el.style.transform = 'translateY(-20px)'
  el.style.transition = 'all 300ms ease-in-out'
}

function onEnter(el: HTMLElement, done: () => void) {
  const delay = Math.min(findIdx(el) * 150, 500)
  setTimeout(() => {
    el.style.transform = 'translateY(0px)'
    el.style.opacity = '1'
    el.addEventListener('transitionend', done)
  }, delay)
}
</script>

<template>
  <transition-group
    name="fade-slide-top-bottom"
    appear
    @before-appear="onBeforeEnter"
    @appear="onEnter"
  >
    <slot />
  </transition-group>
</template>

<style lang="less">
.fade-slide-top-bottom-enter-active {
  transition: all 300ms ease-out;
}

.fade-slide-top-bottom-leave-active {
  transition: all 300ms ease-out;
}

.fade-slide-top-bottom-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.fade-slide-top-bottom-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
