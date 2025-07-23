<template>
  <div ref="container" class="draggable-resizable-container" :style="containerStyle" @mousedown="onMouseDown">
    <div class="resize-handle left" @mousedown.stop="onResizeMouseDown"></div>
    <slot> </slot>
  </div>
</template>

<script setup lang="ts">
import { computed, CSSProperties, onMounted, reactive, ref } from 'vue'

const position = reactive({ x: 100, y: 100 })
const size = reactive({ width: 500, height: 500 })
const dragging = ref(false)
const resizing = ref(false)
const dragOffset = reactive({ x: 0, y: 0 })
const resizeStart = reactive({ x: 0, y: 0, width: 0, height: 0 })

const containerStyle = computed<CSSProperties>(() => ({
  position: 'fixed',
  left: position.x + 'px',
  top: position.y + 'px',
  width: size.width + 'px',
  height: size.height + 'px',
  background: '#fff',
  boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
  borderRadius: '8px',
  zIndex: 999,
  userSelect: dragging.value || resizing.value ? 'none' : 'auto',
  overflow: 'hidden',
}))

const onMouseDown = (e: MouseEvent) => {
  if ((e.target as HTMLElement).classList.contains('resize-handle')) return
  dragging.value = true
  dragOffset.x = e.clientX - position.x
  dragOffset.y = e.clientY - position.y
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

const onMouseMove = (e: MouseEvent) => {
  if (dragging.value) {
    position.x = e.clientX - dragOffset.x
    position.y = e.clientY - dragOffset.y
  } else if (resizing.value) {
    // 左侧中间拖拽，改变宽度，保持高度不变
    const deltaX = e.clientX - resizeStart.x
    size.width = Math.max(200, resizeStart.width - deltaX)
    position.x = resizeStart.x + deltaX
  }
}

const onMouseUp = () => {
  dragging.value = false
  resizing.value = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

const onResizeMouseDown = (e: MouseEvent) => {
  resizing.value = true
  resizeStart.x = e.clientX
  resizeStart.y = e.clientY
  resizeStart.width = size.width
  resizeStart.height = size.height
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

onMounted(() => {
  // 防止选中文字拖拽时出现问题
  document.body.style.userSelect = ''
})
</script>

<style scoped>
.draggable-resizable-container {
  box-sizing: border-box;
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.resize-handle.left {
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 40px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 8px 0 0 8px;
  cursor: ew-resize;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
