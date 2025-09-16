import { onBeforeUnmount, onMounted, ref } from 'vue'

const isTouchDevice = ref(false)
let refCount = 0
let cleanupFn: (() => void) | undefined

// 初始化函数，返回清理函数
function setup(): () => void {
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

  // 返回清理函数
  return () => {
    mql.removeEventListener('change', updatePrimaryInput)
    window.removeEventListener('pointerdown', handlePointer, true)
  }
}

// 全局清理函数
function cleanup() {
  cleanupFn?.()
  cleanupFn = undefined
}

export function useTouchDevice() {
  if (typeof window === 'undefined') {
    return {
      isTouchDevice,
    }
  }

  onMounted(() => {
    refCount++

    if (refCount === 1) {
      // 第一次挂载，初始化事件监听
      cleanupFn = setup()
    }
  })

  onBeforeUnmount(() => {
    refCount = Math.max(0, refCount - 1)

    if (refCount === 0) {
      // 最后一个组件卸载，清理事件监听
      cleanup()
    }
  })

  return {
    isTouchDevice,
  }
}
