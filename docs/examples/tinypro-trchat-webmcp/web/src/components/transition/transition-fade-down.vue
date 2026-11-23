<template>
  <transition name="fade-slide-top-bottom" appear>
    <slot />
  </transition>
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
