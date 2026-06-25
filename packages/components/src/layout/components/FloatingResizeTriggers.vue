<script setup lang="ts">
import { shallowRef } from 'vue'
import type { LayoutFloatingResizeHandle } from '../index.type'
import FloatingResizeTrigger from './FloatingResizeTrigger.vue'

defineOptions({
  name: 'FloatingResizeTriggers',
})

interface FloatingResizeTriggersProps {
  handles: LayoutFloatingResizeHandle[]
}

const props = defineProps<FloatingResizeTriggersProps>()

const emit = defineEmits<{
  (event: 'resize-start', handle: LayoutFloatingResizeHandle): void
  (event: 'resize', handle: LayoutFloatingResizeHandle, deltaX: number, deltaY: number): void
  (event: 'resize-end', handle: LayoutFloatingResizeHandle, deltaX: number, deltaY: number): void
}>()

const activeHandle = shallowRef<LayoutFloatingResizeHandle | null>(null)

function startResize(handle: LayoutFloatingResizeHandle): void {
  activeHandle.value = handle
  emit('resize-start', handle)
}

function resize(handle: LayoutFloatingResizeHandle, deltaX: number, deltaY: number): void {
  emit('resize', handle, deltaX, deltaY)
}

function endResize(handle: LayoutFloatingResizeHandle, deltaX: number, deltaY: number): void {
  emit('resize-end', handle, deltaX, deltaY)
  activeHandle.value = null
}
</script>

<template>
  <FloatingResizeTrigger
    v-for="handle in props.handles"
    :key="handle"
    :handle="handle"
    :active="activeHandle === handle"
    @resize-start="startResize"
    @resize="resize"
    @resize-end="endResize"
  />
</template>
