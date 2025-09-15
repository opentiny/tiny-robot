import { ref } from 'vue'

const isTouchDevice = ref(false)

const applyTouchDevice = () => {
  isTouchDevice.value = navigator.maxTouchPoints > 0
}

if (typeof window !== 'undefined') {
  applyTouchDevice()

  window.addEventListener('resize', applyTouchDevice)
}

export function useTouchDevice() {
  return isTouchDevice
}
