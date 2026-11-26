import { computed, onMounted, onUnmounted, ref } from 'vue'

export function debounce(fn: (...args: any[]) => void, delay = 200) {
  let timer: number | null = null
  return (...args: any[]) => {
    if (timer !== null) {
      clearTimeout(timer)
    }
    timer = window.setTimeout(() => {
      fn(...args)
      timer = null
    }, delay)
  }
}

export function useResponsive(breakpoints = { sm: 640, md: 768, lg: 1024 }) {
  const sm = ref(false)
  const md = ref(false)
  const lg = ref(false)

  const update = () => {
    if (typeof window === 'undefined')
      return
    sm.value = window.innerWidth <= breakpoints.sm
    md.value = window.innerWidth <= breakpoints.md
    lg.value = window.innerWidth <= breakpoints.lg
  }

  const resizeHandler = debounce(update, 200)

  onMounted(() => {
    update()
    window.addEventListener('resize', resizeHandler)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', resizeHandler)
  })

  return { sm, md, lg }
}

export function useResponsiveSize() {
  const { md, lg } = useResponsive()

  const gridSize = computed(() => {
    if (lg.value)
      return 'mini'
    return 'medium'
  })

  const modalSize = computed(() => {
    if (md.value)
      return '100%'
    return '768px'
  })

  return { gridSize, modalSize }
}
