import { ref } from 'vue'

const isTouchDevice = ref(false)
let initialized = false

export function useTouchDevice() {
  if (!initialized) {
    initialized = true

    const mql = window.matchMedia('(hover: none) and (pointer: coarse)')
    const updatePrimaryInput = () => {
      isTouchDevice.value = mql.matches
    }
    updatePrimaryInput()

    mql.addEventListener('change', updatePrimaryInput)

    const handlePointer = (e: PointerEvent) => {
      // mouse → 非触控；其他（touch/pen）→ 触控
      isTouchDevice.value = e.pointerType !== 'mouse'
    }
    window.addEventListener('pointerdown', handlePointer, true)
  }

  return {
    isTouchDevice,
  }
}
