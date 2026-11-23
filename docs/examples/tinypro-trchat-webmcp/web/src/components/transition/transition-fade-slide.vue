<template>
  <transition name="left-slide-fade" appear>
    <slot />
  </transition>
</template>

<style lang="less">
.left-slide-fade-enter-active {
  transition: all 300ms ease-out;
}

.left-slide-fade-leave-active {
  transition: all 300ms ease-out;
}

.left-slide-fade-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.left-slide-fade-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>
