<script setup lang="ts">
import { ref, TransitionProps } from 'vue'

defineProps<{
  show: boolean
  transitionProps?: TransitionProps
}>()

const popperRef = ref<HTMLDivElement | null>(null)

// 这里需要主动暴露 popperRef 给父组件，原因：
// 由于 Popper 组件被 Transition 包裹，如果父组件直接使用 ref 绑定，拿到的是一个 VueInstance 实例，然后再 unrefElement 获取 DOM，
// 可能因为过渡动画而无法同步获取到实际的 DOM 元素。即使获取到了，也可能会是一个 v-if 注释节点。
// 而暴露的 popperRef 是实际的 DOM 元素，并且是响应式的
defineExpose({
  popperRef,
})
</script>

<template>
  <Transition v-bind="transitionProps">
    <div v-if="show" class="tr-base-popper" ref="popperRef">
      <slot />
    </div>
  </Transition>
</template>

<style lang="less" scoped>
.tr-base-popper {
  position: fixed;
}
</style>
