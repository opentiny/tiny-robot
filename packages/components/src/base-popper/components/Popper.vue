<script setup lang="ts">
import { TransitionProps } from 'vue'

defineProps<{
  show: boolean
  transitionProps?: TransitionProps
}>()
</script>

<template>
  <Transition v-bind="transitionProps">
    <div v-if="show" class="tr-base-popper">
      <slot />
    </div>
  </Transition>
</template>

<style lang="less" scoped>
.tr-base-popper {
  position: fixed;
}
</style>
