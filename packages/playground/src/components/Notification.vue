<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

// Props for a simple top-centered notification
const props = withDefaults(
  defineProps<{
    message: string
    duration?: number
  }>(),
  {
    duration: 2000,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
}>()

const visible = ref(false)
let showFrameId: number | null = null
let hideTimer: ReturnType<typeof setTimeout> | null = null
let closeTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  // Show with a small delay to ensure transition works
  showFrameId = requestAnimationFrame(() => {
    visible.value = true
  })

  // Auto hide after specified duration
  hideTimer = setTimeout(() => {
    visible.value = false
    // Give transition time before unmounting
    closeTimer = setTimeout(() => emit('close'), 200)
  }, props.duration)
})

onUnmounted(() => {
  if (showFrameId !== null) {
    cancelAnimationFrame(showFrameId)
    showFrameId = null
  }
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
  if (closeTimer) {
    clearTimeout(closeTimer)
    closeTimer = null
  }
})
</script>

<template>
  <Teleport to="body">
    <transition name="notification-fade">
      <div v-if="visible" class="notification-root">
        <div class="notification-content">
          {{ message }}
        </div>
      </div>
    </transition>
  </Teleport>
</template>

<style scoped>
.notification-root {
  position: fixed;
  top: 18px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  pointer-events: none;
}

.notification-content {
  pointer-events: auto;
  background: #e7f1ff;
  color: #084298;
  padding: 8px 14px;
  border-radius: 999px;
  font-size: 13px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.notification-fade-enter-active,
.notification-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.notification-fade-enter-from,
.notification-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -6px);
}

.notification-fade-enter-to,
.notification-fade-leave-from {
  opacity: 1;
  transform: translate(-50%, 0);
}
</style>
